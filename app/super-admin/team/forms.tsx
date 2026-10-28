'use client';
import {useActionState} from 'react';
import {savePlatformAccess} from './actions';
export function PlatformAccessForm({mode,roles=[],requests=[]}:{mode:'role'|'request'|'decision';roles?:{id:string;label:string}[];requests?:{id:string;label:string}[]}){
 const [state,action,pending]=useActionState(savePlatformAccess,{ok:false,message:''});
 const title=mode==='role'?'Publish audit role version':mode==='request'?'Request operator access':'Review or revoke access';
 return <form className="sa-form" action={action}><h2>{title}</h2><input type="hidden" name="mode" value={mode}/>
 {mode==='role'&&<><label>Role key<input name="key" required pattern="[a-z][a-z0-9_]{2,79}"/></label><label>Role label<input name="label" required minLength={2} maxLength={120}/></label><p>Capability: audit.read. Allows audit metadata only; no audit payload, student records, billing or configuration access. Publishing the same key creates a new immutable version.</p></>}
 {mode==='request'&&<><label>Existing account UUID<input name="user" required minLength={36} maxLength={36}/></label><label>Role version<select name="version" required><option value="">Choose role</option>{roles.map(role=><option value={role.id} key={role.id}>{role.label}</option>)}</select></label><label>Access expires (UTC)<input name="expiry" type="datetime-local" required/></label><p>This grants no access until a different owner approves. It does not create an account or send an invitation.</p></>}
 {mode==='decision'&&<><label>Request<select name="request" required><option value="">Choose request</option>{requests.map(request=><option value={request.id} key={request.id}>{request.label}</option>)}</select></label><label>Decision<select name="decision" required><option value="">Choose decision</option><option value="approve">Approve</option><option value="reject">Reject</option><option value="revoke">Revoke</option></select></label><p>Only a different owner can approve or reject a request. Any owner can revoke pending or active access, including after expiry.</p></>}
 <label>Reason<textarea name="reason" required minLength={3} maxLength={500}/></label><label className="sa-check"><input name="confirmed" type="checkbox" value="yes" required/>I confirm this access change.</label><button disabled={pending}>{pending?'Saving…':title}</button>
 {state.message&&<p role="status" className={state.ok?'sa-form__success':'sa-form__error'}>{state.message}</p>}</form>;
}
