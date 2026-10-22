'use client';
import { useActionState } from 'react';
import { createInstitution, type CreateInstitutionState } from './actions';
const initial: CreateInstitutionState = {ok:false,message:''};
export default function CreateInstitutionForm() {
  const [state, action, pending] = useActionState(createInstitution, initial);
  return <form action={action} className="console-create-form">
    <div className="eyebrow">PLATFORM OWNER ONLY</div><h2>Bring a campus onboard.</h2>
    <p className="muted">Create an institution workspace. Memberships and billing are configured separately.</p>
    <div className="console-form-grid"><label>Institution name<input required minLength={2} maxLength={200} name="name" placeholder="e.g. North Valley University" autoComplete="organization"/></label><label>Unique slug<input required minLength={3} maxLength={60} name="slug" placeholder="north-valley-university" pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"/></label></div>
    <div className="console-form-bottom"><button type="submit" disabled={pending} className="console-feature-button">{pending?'Creating…':'Create institution ↗'}</button><span role="status" aria-live="polite" className={state.ok?'console-form-success':'console-form-message'}>{state.message}</span></div>
  </form>;
}
