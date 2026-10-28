'use server';

import { revalidatePath } from 'next/cache';
import { getVerifiedPlatformOwner } from '../../../lib/auth/platform-owner';

export type ActionState = { ok: boolean; message: string; id?: string; invitationLink?: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const refresh = (id?: string) => { revalidatePath('/super-admin'); revalidatePath('/super-admin/institutions'); revalidatePath('/super-admin/onboarding'); revalidatePath('/super-admin/invitations'); if (id) revalidatePath(`/super-admin/institutions/${id}`); };

export async function createSuperAdminInstitution(_: ActionState, form: FormData): Promise<ActionState> {
  const name = String(form.get('name') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim().toLowerCase();
  if (form.get('confirmed') !== 'yes') return { ok: false, message: 'Confirm institution creation before submitting.' };
  if (name.length < 2 || name.length > 200 || !/^[a-z0-9][a-z0-9-]{1,61}$/.test(slug)) return { ok: false, message: 'Enter a 2–200 character name and a valid 2–62 character slug.' };
  const access = await getVerifiedPlatformOwner();
  if (!access) return { ok: false, message: 'Platform-owner authorization is required.' };
  const { data, error } = await access.client.rpc('create_institution', { p_name: name, p_slug: slug });
  if (error || !data) return { ok: false, message: error?.code === '23505' ? 'That institution slug already exists.' : 'Unable to create the institution.' };
  refresh(data); return { ok: true, id: data, message: 'Institution created. No user account or owner membership was provisioned.' };
}

export async function updateInstitutionProfile(_: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get('institution') ?? ''); const domain = String(form.get('domain') ?? ''); const timeZone = String(form.get('time_zone') ?? '');
  if (!uuid.test(id)) return { ok: false, message: 'Invalid institution.' };
  const access = await getVerifiedPlatformOwner(); if (!access) return { ok: false, message: 'Platform-owner authorization is required.' };
  const { error } = await access.client.rpc('update_institution_profile', { p_institution: id, p_domain: domain, p_time_zone: timeZone });
  if (error) return { ok: false, message: 'Profile could not be saved. Check the domain and try again.' };
  refresh(id); return { ok: true, message: 'Profile saved and audit entry recorded.' };
}

export async function changeInstitutionLifecycle(_: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get('institution') ?? ''); const status = String(form.get('status') ?? ''); const reason = String(form.get('reason') ?? '').trim();
  if (!uuid.test(id) || !['active', 'suspended', 'archived'].includes(status) || reason.length < 3) return { ok: false, message: 'Choose a lifecycle state and enter a reason of at least 3 characters.' };
  const access = await getVerifiedPlatformOwner(); if (!access) return { ok: false, message: 'Platform-owner authorization is required.' };
  const { error } = await access.client.rpc('set_institution_lifecycle', { p_institution: id, p_status: status, p_reason: reason });
  if (error) return { ok: false, message: 'Lifecycle state could not be changed.' };
  refresh(id); return { ok: true, message: 'Lifecycle changed. Tenant-scoped reads follow the new state.' };
}

export async function createOwnerInvitation(_: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get('institution') ?? ''); const email = String(form.get('email') ?? '').trim().toLowerCase(); const expiresAt = String(form.get('expires_at') ?? ''); const reason = String(form.get('reason') ?? '').trim();
  const expiry = new Date(expiresAt);
  if (!uuid.test(id) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !expiresAt || Number.isNaN(expiry.valueOf()) || expiry.valueOf() <= Date.now() || reason.length < 3 || reason.length > 500) return { ok: false, message: 'Enter a valid email, future expiry and a 3-500 character reason.' };
  const access = await getVerifiedPlatformOwner(); if (!access) return { ok: false, message: 'Platform-owner authorization is required.' };
  const { data, error } = await access.client.rpc('create_owner_invitation_link', { p_institution: id, p_email: email, p_expires_at: expiry.toISOString(), p_reason: reason });
  const item = Array.isArray(data) ? data[0] : data;
  if (error || !item?.token) return { ok: false, message: error?.code === '23505' ? 'A pending invitation already exists for this address.' : 'Invitation link could not be created.' };
  refresh(id); return { ok: true, message: 'One-time invitation link created and audited. Deliver it only through an approved channel.', invitationLink: `/owner-invitations/accept?token=${item.token}` };
}

export async function revokeOwnerInvitation(_: ActionState, form: FormData): Promise<ActionState> {
  const invitation = String(form.get('invitation') ?? ''); const institution = String(form.get('institution') ?? ''); const reason = String(form.get('reason') ?? '').trim();
  if (!uuid.test(invitation) || !uuid.test(institution) || reason.length < 3 || reason.length > 500) return { ok: false, message: 'Enter a valid revocation reason of 3-500 characters.' };
  const access = await getVerifiedPlatformOwner(); if (!access) return { ok: false, message: 'Platform-owner authorization is required.' };
  const { error } = await access.client.rpc('revoke_owner_invitation_link', { p_invitation: invitation, p_reason: reason });
  if (error) return { ok: false, message: 'Invitation could not be revoked. It may already be accepted, revoked or unavailable.' };
  refresh(institution); return { ok: true, message: 'Invitation link revoked and audit entry recorded.' };
}

export async function setOnboardingStage(_: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get('institution') ?? ''); const stage = String(form.get('stage') ?? ''); const blocker = String(form.get('blocker') ?? '').trim();
  if (!uuid.test(id) || !['created','owner_invited','identity_verified','plan_assigned','settings_configured','active','blocked'].includes(stage)) return { ok: false, message: 'Choose a valid onboarding stage.' };
  if (stage === 'blocked' && blocker.length < 3) return { ok: false, message: 'Describe the blocker before saving.' };
  const access = await getVerifiedPlatformOwner(); if (!access) return { ok: false, message: 'Platform-owner authorization is required.' };
  const { error } = await access.client.rpc('set_institution_onboarding_stage', { p_institution: id, p_stage: stage, p_blocker: blocker });
  if (error) return { ok: false, message: 'Onboarding stage could not be saved.' };
  refresh(id); return { ok: true, message: 'Onboarding stage saved and audit entry recorded.' };
}
