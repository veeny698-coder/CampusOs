import Link from 'next/link';
import { getVerifiedPlatformOwner } from '../../lib/auth/platform-owner';

export const dynamic = 'force-dynamic';

type Institution = { id: string; name: string; slug: string; created_at: string };
type AuditEntry = { id: string; action: string; resource_type: string; created_at: string };

export default async function SuperAdminOverview() {
  const access = await getVerifiedPlatformOwner();
  if (!access) return null; // The parent layout redirects before this page can render.

  const [institutionsResult, auditResult] = await Promise.all([
    access.client.from('institutions').select('id,name,slug,created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
    access.client.from('audit_logs').select('id,action,resource_type,created_at').order('created_at', { ascending: false }).limit(5),
  ]);
  const institutionError = Boolean(institutionsResult.error);
  const auditError = Boolean(auditResult.error);
  const institutions = institutionsResult.data as Institution[] | null;
  const auditEntries = auditResult.data as AuditEntry[] | null;

  return <>
    <section className="sa-page-heading">
      <div><p className="sa-eyebrow">COMMAND CENTER / OVERVIEW</p><h1>Platform command center</h1><p>Live, RLS-protected platform data. New control-center domains are introduced only in their delivery phases.</p></div>
      <span className="sa-status">Live data baseline</span>
    </section>
    <section className="sa-kpis" aria-label="Available platform metrics">
      <article className="sa-kpi"><span>Institutions</span><strong>{institutionError ? 'Unavailable' : institutionsResult.count ?? 0}</strong><small>{institutionError ? 'The institution query could not be completed.' : 'Current RLS-scoped count'}</small></article>
      <article className="sa-kpi"><span>Subscriptions & revenue</span><strong>Not measured</strong><small>Introduced with the commercial data model in Phase 5.</small></article>
      <article className="sa-kpi"><span>Operations & incidents</span><strong>Not measured</strong><small>Introduced with the operations data model in Phase 6.</small></article>
    </section>
    <section className="sa-grid">
      <article className="sa-panel"><div className="sa-panel__heading"><div><p className="sa-eyebrow">INSTITUTION MANAGEMENT</p><h2>Recent institutions</h2></div><span className="sa-phase">Phase 2 continues here</span></div>
        {institutionError ? <p className="sa-error" role="alert">Institution data is temporarily unavailable. Refresh to retry.</p> : !institutions?.length ? <div className="sa-empty"><strong>No institutions yet</strong><p>Institution creation remains in the existing protected workflow until its Phase 2 migration.</p></div> : <ul className="sa-record-list">{institutions.map(institution => <li key={institution.id}><span className="sa-record-mark">{institution.name.slice(0, 1).toUpperCase()}</span><div><strong>{institution.name}</strong><small>{institution.slug}</small></div><time dateTime={institution.created_at}>{new Date(institution.created_at).toLocaleDateString('en-IN')}</time></li>)}</ul>}
      </article>
      <article className="sa-panel"><div className="sa-panel__heading"><div><p className="sa-eyebrow">TRUST & SECURITY</p><h2>Recent audit activity</h2></div><Link href="/admin/dashboard/audit" className="sa-text-link">Open existing audit trail ↗</Link></div>
        {auditError ? <p className="sa-error" role="alert">Audit data is temporarily unavailable. No activity is inferred.</p> : !auditEntries?.length ? <div className="sa-empty"><strong>No privileged activity recorded</strong><p>New alerts and incident workflows are scheduled for Phase 6.</p></div> : <ul className="sa-record-list">{auditEntries.map(entry => <li key={entry.id}><span className="sa-record-mark">✓</span><div><strong>{entry.action}</strong><small>{entry.resource_type}</small></div><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString('en-IN')}</time></li>)}</ul>}
      </article>
    </section>
  </>;
}
