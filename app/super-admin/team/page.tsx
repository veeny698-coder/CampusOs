import {getVerifiedPlatformOwner} from '../../../lib/auth/platform-owner';
import {PlatformAccessForm} from './forms';
export const dynamic='force-dynamic';
export default async function PlatformTeamPage(){
 const access=await getVerifiedPlatformOwner();if(!access)return null;
 const [roles,requests]=await Promise.all([
  access.client.from('platform_role_versions').select('id,label,version').order('created_at',{ascending:false}).limit(1000),
  access.client.from('platform_access_requests').select('id,user_id,role_version_id,status,requested_by,reviewed_by,expires_at').order('requested_at',{ascending:false}).limit(100),
 ]);
 const failed=roles.error||requests.error;
 return <><section className="sa-page-heading"><div><p className="sa-eyebrow">People & access</p><h1>Platform team</h1><p>Time-bound audit operators require independent owner approval. Owner provisioning is separate and cannot be changed here.</p></div></section>
 {failed?<p role="alert" className="sa-error">Team records could not be loaded. The reviewed platform-access migration must be applied. Refresh to retry.</p>:<>
 <div className="sa-detail-grid"><section className="sa-panel sa-panel--form"><PlatformAccessForm mode="request" roles={(roles.data??[]).map(r=>({id:r.id,label:`${r.label} · v${r.version}`}))}/></section><section className="sa-panel sa-panel--form"><PlatformAccessForm mode="decision" requests={(requests.data??[]).filter(r=>['pending','approved'].includes(r.status)).map(r=>({id:r.id,label:`${r.user_id} · ${r.status} · ${r.id}`}))}/></section></div>
 <section className="sa-panel"><h2>Latest requests</h2><p className="sa-empty">Up to 100 latest requests. Approved access also requires an unexpired validity window.</p>{!requests.data?.length?<p className="sa-empty">No operator access requests.</p>:<div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Account</th><th>Role</th><th>Status</th><th>Expiry (UTC)</th><th>Requested / reviewed by</th></tr></thead><tbody>{requests.data.map(r=><tr key={r.id}><td>{r.user_id}</td><td>{roles.data?.find(role=>role.id===r.role_version_id)?.label??r.role_version_id}</td><td>{r.status}{Date.parse(r.expires_at)<=Date.now()?' · expired':''}</td><td>{r.expires_at}</td><td>{r.requested_by}<small>{r.reviewed_by??'Not reviewed'}</small></td></tr>)}</tbody></table></div>}</section>
 </>}</>;
}
