import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
import {PlatformAccessForm} from '../../team/forms';
export const dynamic='force-dynamic';
export default async function RolesPage(){
 const access=await getVerifiedPlatformOwner();if(!access)return null;
 const {data,error}=await access.client.from('platform_role_versions').select('id,role_key,label,version,capabilities').order('created_at',{ascending:false}).limit(1000);
 return <><section className="sa-page-heading"><div><p className="sa-eyebrow">People & access</p><h1>Roles & permissions</h1><p>Immutable platform role versions. Existing assignments keep their selected version. Tenant roles remain separate.</p></div></section>
 {error?<p className="sa-error" role="alert">Role records could not be loaded. The reviewed platform-access migration must be applied. Refresh to retry.</p>:<><section className="sa-panel sa-panel--form"><PlatformAccessForm mode="role"/></section><section className="sa-panel"><h2>Published role versions</h2><p className="sa-empty">Up to 1,000 latest versions. This slice supports the audit.read capability; other operator capabilities are not yet available.</p>{!data?.length?<p className="sa-empty">No custom platform roles yet.</p>:<div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Role</th><th>Version</th><th>Capabilities</th></tr></thead><tbody>{data.map(role=><tr key={role.id}><td>{role.label}<small>{role.role_key}</small></td><td>{role.version}</td><td>{role.capabilities.join(', ')}</td></tr>)}</tbody></table></div>}</section></>}
 </>;
}
