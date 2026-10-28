'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { changeInstitutionLifecycle, createOwnerInvitation, createSuperAdminInstitution, revokeOwnerInvitation, setOnboardingStage, updateInstitutionProfile, type ActionState } from './actions';

const initial: ActionState = { ok: false, message: '' };
function State({ state }: { state: ActionState }) { return state.message ? <p className={state.ok ? 'sa-form__success' : 'sa-form__error'} role="status">{state.message}</p> : null; }

export function CreateInstitutionForm() {
  const [state, action, pending] = useActionState(createSuperAdminInstitution, initial); const router = useRouter();
  useEffect(() => { if (state.ok && state.id) router.push(`/super-admin/institutions/${state.id}`); }, [router, state.id, state.ok]);
  return <form className="sa-form" action={action}><h2>Create institution</h2><p>Creates the institution, profile and onboarding record. It never creates an account or membership.</p><div className="sa-form__grid"><label>Name<input name="name" required minLength={2} maxLength={200} autoComplete="organization" /></label><label>Slug<input name="slug" required minLength={2} maxLength={62} pattern="[a-z0-9][a-z0-9-]*" /></label></div><label className="sa-check"><input name="confirmed" value="yes" type="checkbox" required /> I confirm this is a new institution workspace.</label><button type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create institution'}</button><State state={state} /></form>;
}

export function InstitutionProfileForm({ institutionId, domain, timeZone }: { institutionId: string; domain: string | null; timeZone: string | null }) {
  const [state, action, pending] = useActionState(updateInstitutionProfile, initial);
  return <form className="sa-form" action={action}><h2>Profile</h2><input name="institution" value={institutionId} type="hidden" /><div className="sa-form__grid"><label>Verified domain<input name="domain" type="text" defaultValue={domain ?? ''} placeholder="college.example.edu" /></label><label>Time zone<input name="time_zone" type="text" defaultValue={timeZone ?? ''} placeholder="For example: Asia/Kolkata" /></label></div><button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save profile'}</button><State state={state} /></form>;
}

export function LifecycleForm({ institutionId, status }: { institutionId: string; status: string }) {
  const [state, action, pending] = useActionState(changeInstitutionLifecycle, initial);
  return <form className="sa-form" action={action}><h2>Lifecycle</h2><input name="institution" value={institutionId} type="hidden" /><label>Status<select name="status" defaultValue={status}><option value="active">Active</option><option value="suspended">Suspended</option><option value="archived">Archived</option></select></label><label>Reason<textarea name="reason" required minLength={3} maxLength={500} placeholder="Reason for this lifecycle change" /></label><button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Confirm lifecycle change'}</button><State state={state} /></form>;
}

function LegacyOwnerInvitationRecordForm({ institutionId }: { institutionId: string }) {
  const [state, action, pending] = useActionState(createOwnerInvitation, initial);
  return <form className="sa-form" action={action}><h2>Owner invitation request</h2><p>This records an expiring request; it does not send email or provision an account.</p><input name="institution" value={institutionId} type="hidden" /><div className="sa-form__grid"><label>Email<input name="email" required type="email" autoComplete="email" /></label><label>Expires at<input name="expires_at" required type="datetime-local" /></label></div><button type="submit" disabled={pending}>{pending ? 'Recording…' : 'Record invitation request'}</button><State state={state} /></form>;
}

export function OwnerInvitationForm({ institutionId }: { institutionId: string }) {
  const [state, action, pending] = useActionState(createOwnerInvitation, initial);
  return <form className="sa-form" action={action}><h2>Owner invitation</h2><p>Creates a one-time link for an existing, verified Supabase account. It does not provision an account or send email.</p><input name="institution" value={institutionId} type="hidden" /><div className="sa-form__grid"><label>Email<input name="email" required type="email" autoComplete="email" /></label><label>Expires at<input name="expires_at" required type="datetime-local" /></label></div><label>Reason<textarea name="reason" required minLength={3} maxLength={500} placeholder="Why this owner invitation is authorized" /></label><button type="submit" disabled={pending}>{pending ? 'Creating...' : 'Create one-time link'}</button><State state={state} />{state.ok && state.invitationLink ? <label>Copy once and deliver through an approved channel<input readOnly value={state.invitationLink} aria-label="One-time owner invitation link" /></label> : null}</form>;
}

export function RevokeOwnerInvitationForm({ institutionId, invitationId }: { institutionId: string; invitationId: string }) {
  const [state, action, pending] = useActionState(revokeOwnerInvitation, initial);
  return <form className="sa-form sa-form--inline" action={action}><input name="institution" value={institutionId} type="hidden" /><input name="invitation" value={invitationId} type="hidden" /><label>Revocation reason<input name="reason" required minLength={3} maxLength={500} /></label><button type="submit" disabled={pending}>{pending ? 'Revoking...' : 'Revoke link'}</button><State state={state} /></form>;
}

export function OnboardingStageForm({ institutionId, stage, blocker }: { institutionId: string; stage: string; blocker: string | null }) {
  const [state, action, pending] = useActionState(setOnboardingStage, initial);
  return <form className="sa-form" action={action}><input name="institution" value={institutionId} type="hidden" /><label>Stage<select name="stage" defaultValue={stage}><option value="created">Institution created</option><option value="owner_invited">Owner invited</option><option value="identity_verified">Identity verified</option><option value="plan_assigned">Plan assigned</option><option value="settings_configured">Core settings configured</option><option value="active">Activated</option><option value="blocked">Blocked</option></select></label><label>Blocker<textarea name="blocker" defaultValue={blocker ?? ''} maxLength={500} placeholder="Required when blocked" /></label><button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save onboarding stage'}</button><State state={state} /></form>;
}
