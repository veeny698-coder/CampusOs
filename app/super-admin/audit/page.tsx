import Link from 'next/link';
import { getVerifiedPlatformOwner } from '../../../lib/auth/platform-owner';

export const dynamic = 'force-dynamic';

export default async function AuditPage({ searchParams }: {
  searchParams: Promise<{ before?: string; action?: string }>;
}) {
  const access = await getVerifiedPlatformOwner();
  if (!access) return null;
  const params = await searchParams;
  const before = params.before && /^[1-9][0-9]{0,17}$/.test(params.before) ? params.before : undefined;
  const action = (params.action ?? '').trim().slice(0, 120);
  let query = access.client.from('audit_logs')
    .select('id,action,resource_type,resource_id,created_at')
    .order('id', { ascending: false }).limit(51);
  if (before) query = query.lt('id', before);
  if (action) query = query.eq('action', action);
  const { data, error } = await query;
  const rows = data?.slice(0, 50) ?? [];
  const next = new URLSearchParams();
  if (action) next.set('action', action);
  if (rows.length) next.set('before', String(rows[rows.length - 1].id));
  return <>
    <section className="sa-page-heading"><div><p className="sa-eyebrow">Trust & security</p><h1>Audit trail</h1><p>Administrative activity recorded by the server. Filter by an exact action name to follow a workflow.</p></div></section>
    <form className="sa-panel sa-panel--form sa-form" method="get">
      <label>Action name<input name="action" defaultValue={action} maxLength={120} placeholder="institution.created" /></label>
      <button type="submit">Apply filter</button><Link className="sa-text-link" href="/super-admin/audit">Clear filters</Link>
    </form>
    <section className="sa-panel" aria-label="Audit records">
      {error ? <p className="sa-error" role="alert">Audit records could not be loaded. <Link href="/super-admin/audit">Retry</Link></p>
        : !rows.length ? <p className="sa-empty">No activity matches this filter.</p>
          : <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th scope="col">Action</th><th scope="col">Resource</th><th scope="col">Recorded</th></tr></thead>
            <tbody>{rows.map(row => <tr key={row.id}><td><strong>{row.action}</strong><small>Record {row.id}</small></td><td>{row.resource_type}<small>{row.resource_id ?? 'Platform'}</small></td><td><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</time></td></tr>)}</tbody></table></div>}
      {!error && data && data.length > 50 && <p className="sa-empty"><Link className="sa-text-link" href={`/super-admin/audit?${next}`}>Older activity</Link></p>}
    </section>
  </>;
}
