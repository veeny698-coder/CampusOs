'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export type OwnerInvitationAcceptanceState = { ok: boolean; message: string };

export async function acceptOwnerInvitation(_: OwnerInvitationAcceptanceState, form: FormData): Promise<OwnerInvitationAcceptanceState> {
  const token = String(form.get('token') ?? '');
  if (!/^[0-9a-f]{64}$/.test(token)) return { ok: false, message: 'This invitation link is unavailable.' };
  const client = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) return { ok: false, message: 'Sign in with the invited, verified account before accepting this invitation.' };
  const { data, error } = await client.rpc('accept_owner_invitation', { p_token: token });
  if (error || !data?.ok) return { ok: false, message: 'This invitation is unavailable. It may be expired, revoked, already used, or for a different account.' };
  revalidatePath('/portals');
  return { ok: true, message: 'Invitation accepted. The institution workspace is now available through My portals.' };
}
