'use client';
import { useActionState, useState } from 'react';
import { savePortalAccess } from './actions';

type Choice = { id: string; name: string };
type Member = { user_id: string; institution_id: string; email: string };
export function GrantForm({ institutions, members, portals, events, organizations }: {
  institutions: Choice[]; members: Member[]; portals: { key: string; label: string }[];
  events: { id: string; title: string; institution_id: string }[];
  organizations: (Choice & { institution_id: string })[];
}) {
  const [institution, setInstitution] = useState('');
  const [scope, setScope] = useState('institution');
  const [expiry, setExpiry] = useState('');
  const [state, action, pending] = useActionState(savePortalAccess, { ok: false, message: '' });
  return <form action={action} className="sa-form">
    <h2>Grant portal access</h2><p>Choose a current member and the smallest scope they need.</p>
    <input type="hidden" name="mode" value="grant" />
    <label>Institution<select name="institution" required value={institution} onChange={e=>setInstitution(e.target.value)}><option value="">Choose institution</option>{institutions.map(i=><option value={i.id} key={i.id}>{i.name}</option>)}</select></label>
    <div key={institution} className="sa-form__grid">
      <label>Member<select name="user" required disabled={!institution}><option value="">Choose member</option>{members.filter(m=>m.institution_id===institution).map(m=><option key={m.user_id} value={m.user_id}>{m.email}</option>)}</select></label>
      <label>Portal<select name="portal" required><option value="">Choose portal</option>{portals.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select></label>
      <label>Scope<select value={scope} onChange={e=>setScope(e.target.value)}><option value="institution">Institution</option><option value="event">Event</option><option value="organization">Organization</option></select></label>
      {scope==='event' && <label>Event<select name="event" required><option value="">Choose event</option>{events.filter(e=>e.institution_id===institution).map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label>}
      {scope==='organization' && <label>Organization<select name="organization" required><option value="">Choose organization</option>{organizations.filter(o=>o.institution_id===institution).map(o=><option value={o.id} key={o.id}>{o.name}</option>)}</select></label>}
    </div>
    <label>Expiry (UTC, optional)<input type="datetime-local" value={expiry} onChange={e=>setExpiry(e.target.value)} /></label>
    <input type="hidden" name="expires_at" value={expiry ? `${expiry}Z` : ''} />
    <label>Reason<textarea name="reason" required minLength={3} maxLength={500} /></label>
    <label className="sa-check"><input type="checkbox" name="confirmed" value="yes" required />I confirm this access change.</label>
    <button disabled={pending || !institution}>{pending ? 'Saving…' : 'Grant access'}</button>
    {state.message && <p role="status" className={state.ok?'sa-form__success':'sa-form__error'}>{state.message}</p>}
  </form>;
}

export function RevokeForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(savePortalAccess, { ok: false, message: '' });
  return <details><summary>Revoke access</summary><form className="sa-form" action={action}>
    <input type="hidden" name="mode" value="revoke" /><input type="hidden" name="assignment" value={id} />
    <label>Reason<input name="reason" required minLength={3} maxLength={500} /></label>
    <label className="sa-check"><input type="checkbox" name="confirmed" value="yes" required />Confirm revocation</label>
    <button disabled={pending}>{pending?'Revoking…':'Revoke'}</button>
    {state.message && <p role="status" className={state.ok?'sa-form__success':'sa-form__error'}>{state.message}</p>}
  </form></details>;
}
