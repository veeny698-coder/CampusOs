import Link from 'next/link';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import { GrantForm, RevokeForm } from './forms';

export const dynamic = 'force-dynamic';

export default async function PortalAccessPage() {
  const access = await getVerifiedPlatformOwner();
  if (!access) return null;
  const client = access.client;
  const [institutions, members, portals, events, organizations, assignments, readiness] = await Promise.all([
    client.from('institutions').select('id,name').eq('lifecycle_status','active').order('name').limit(1000),
    client.rpc('list_portal_members'),
    client.from('portal_catalog').select('key,label').eq('enabled',true).order('label'),
    client.from('events').select('id,title,institution_id').order('title').limit(1000),
    client.from('organizations').select('id,name,institution_id').order('name').limit(1000),
    client.from('portal_assignments').select('id,portal_key,institution_id,user_id,event_id,organization_id,starts_at,expires_at,revoked_at').order('created_at',{ascending:false}).limit(100),
    client.rpc('portal_management_ready'),
  ]);
  const failed = [institutions,members,portals,events,organizations,assignments].some(result=>result.error);
  const ready = !readiness.error && readiness.data === true;
  const now = Date.now();
  return <>
    <section className="sa-page-heading"><div><p className="sa-eyebrow">People & access</p><h1>Portal access</h1><p>Assign scoped access to current members. Every change requires confirmation and an audit reason.</p></div></section>
    {failed ? <p className="sa-error" role="alert">Access records could not be loaded. <Link href="/super-admin/access/portals">Retry</Link></p> : <>
      {!ready && <p className="sa-panel sa-empty" role="status">Access changes are unavailable until the reviewed portal-management migration is approved and applied. Existing assignments remain visible.</p>}
      {ready && <section className="sa-panel sa-panel--form"><GrantForm institutions={institutions.data ?? []} members={members.data ?? []} portals={portals.data ?? []} events={events.data ?? []} organizations={organizations.data ?? []} /><p className="sa-empty">Selectors show up to 1,000 records each. Organization grants also require current organization membership.</p></section>}
      <section className="sa-panel"><h2>Latest assignments</h2><p className="sa-empty">Up to 100 latest records. Active dates alone do not grant access: current membership, enabled portal and active institution are also required.</p>
        {!assignments.data?.length ? <p className="sa-empty">No portal assignments yet.</p> : <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Member / institution</th><th>Portal / scope</th><th>Validity</th><th>Action</th></tr></thead><tbody>{assignments.data.map(row=>{
          const status = row.revoked_at ? 'Revoked' : row.expires_at && Date.parse(row.expires_at)<=now ? 'Expired' : Date.parse(row.starts_at)>now ? 'Scheduled' : 'Within validity window';
          return <tr key={row.id}><td>{(members.data as {user_id:string;email:string}[] | null)?.find(member=>member.user_id===row.user_id)?.email ?? row.user_id}<small>{institutions.data?.find(institution=>institution.id===row.institution_id)?.name ?? row.institution_id}</small></td><td>{row.portal_key}<small>{row.event_id ? `Event: ${row.event_id}` : row.organization_id ? `Organization: ${row.organization_id}` : 'Institution'}</small></td><td>{status}<small>{row.expires_at ? `Expires ${new Date(row.expires_at).toISOString()}` : 'No expiry'}</small></td><td>{ready && !row.revoked_at ? <RevokeForm id={row.id} /> : '—'}</td></tr>;
        })}</tbody></table></div>}
      </section>
    </>}
  </>;
}
