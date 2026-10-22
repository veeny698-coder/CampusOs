import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
export const dynamic = 'force-dynamic';
export default async function AuditTrailPage() {
  let access;
  try { access = await getVerifiedPlatformOwner(); }
  catch { return <main className="console-fallback">Audit service unavailable. No records exposed.</main>; }
  if (!access) redirect('/login');
  const {data,error}=await access.client.from('audit_logs').select('id,actor_user_id,action,resource_type,resource_id,created_at').order('created_at',{ascending:false}).limit(50);
  return <main className="console-directory"><Link href="/admin/dashboard" className="console-text-link">← Back to command center</Link><div className="eyebrow" style={{marginTop:32}}>SECURITY / AUDIT TRAIL</div><h1 className="heading">Every action. Accounted for.</h1><p className="muted">A read-only view of recent privileged platform events. Records are written by database triggers, not the browser.</p><section className="console-section"><div className="console-section-heading"><h2>Recent activity</h2><span className="console-directory-count">Latest 50 events</span></div><div className="console-list">{error?<p role="alert" className="console-empty">Audit records are unavailable. Check your access permissions.</p>:!data?.length?<p className="console-empty">No privileged activity recorded yet.</p>:data.map(row=><div key={row.id} className="console-institution"><div className="console-institution-mark">✓</div><div className="console-institution-text"><strong>{row.action}</strong><small>{row.resource_type} · {row.resource_id?.slice(0,8) ?? '—'} · Actor {row.actor_user_id?.slice(0,8) ?? 'unknown'}</small></div><time className="console-index" dateTime={row.created_at}>{new Date(row.created_at).toLocaleString('en-IN')}</time></div>)}</div></section></main>;
}
