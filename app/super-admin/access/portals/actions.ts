'use server';

import { revalidatePath } from 'next/cache';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';

export type AccessState = { ok: boolean; message: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function savePortalAccess(_: AccessState, form: FormData): Promise<AccessState> {
  if (form.get('confirmed') !== 'yes') return { ok: false, message: 'Confirm the access change.' };
  const reason = String(form.get('reason') ?? '').trim();
  const mode = String(form.get('mode') ?? '');
  if (reason.length < 3 || reason.length > 500 || !['grant','revoke'].includes(mode))
    return { ok: false, message: 'Choose an action and provide a reason (3–500 characters).' };
  const access = await getVerifiedPlatformOwner();
  if (!access) return { ok: false, message: 'Platform-owner authorization is required.' };
  const ready = await access.client.rpc('portal_management_ready');
  if (ready.error || ready.data !== true) return { ok: false, message: 'Access management is awaiting its database update.' };
  let institution = String(form.get('institution') ?? '');
  let user = String(form.get('user') ?? '');
  let portal = String(form.get('portal') ?? '');
  let event = String(form.get('event') ?? '');
  let organization = String(form.get('organization') ?? '');
  let expiry: string | null = null;
  if (mode === 'revoke') {
    const id = String(form.get('assignment') ?? '');
    if (!uuid.test(id)) return { ok: false, message: 'Invalid assignment.' };
    const result = await access.client.from('portal_assignments')
      .select('institution_id,user_id,portal_key,event_id,organization_id').eq('id',id).maybeSingle();
    if (result.error || !result.data) return { ok: false, message: 'Assignment is unavailable.' };
    ({ institution_id: institution, user_id: user, portal_key: portal } = result.data);
    event = result.data.event_id ?? ''; organization = result.data.organization_id ?? '';
  } else {
    if (!uuid.test(institution) || !uuid.test(user) || !/^[a-z][a-z0-9_]{2,39}$/.test(portal)
      || (event && !uuid.test(event)) || (organization && !uuid.test(organization)) || (event && organization))
      return { ok: false, message: 'Select a valid institution, member, portal, and one scope.' };
    const rawExpiry = String(form.get('expires_at') ?? '');
    if (rawExpiry) {
      const time = Date.parse(rawExpiry);
      if (!Number.isFinite(time) || time <= Date.now()) return { ok: false, message: 'Expiry must be in the future.' };
      expiry = new Date(time).toISOString();
    }
  }
  const result = await access.client.rpc('set_portal_assignment', {
    p_key: portal, p_institution: institution, p_user: user, p_enabled: mode === 'grant',
    p_event: event || null, p_organization: organization || null, p_expires_at: expiry, p_reason: reason,
  });
  if (result.error) return { ok: false, message: 'Access could not be changed. Verify membership, scope, and institution status.' };
  for (const path of ['/super-admin/access/portals','/admin/dashboard/portals','/portals']) revalidatePath(path);
  return { ok: true, message: mode === 'grant' ? 'Portal access saved and audited.' : 'Portal access revoked.' };
}
