'use client';

import { useActionState } from 'react';
import { acceptOwnerInvitation, type OwnerInvitationAcceptanceState } from './actions';

const initial: OwnerInvitationAcceptanceState = { ok: false, message: '' };

export function OwnerInvitationAcceptanceForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptOwnerInvitation, initial);
  return <form action={action} className="sa-form"><input type="hidden" name="token" value={token} /><p>This action adds an owner membership only after the signed-in account, verified email, invitation expiry and institution status pass server-side checks.</p><button type="submit" disabled={pending}>{pending ? 'Accepting...' : 'Accept invitation'}</button>{state.message ? <p className={state.ok ? 'sa-form__success' : 'sa-form__error'} role="status">{state.message}</p> : null}</form>;
}
