import Link from 'next/link';
import { getVerifiedPlatformOwner } from '../../../lib/auth/platform-owner';
import { OnboardingStageForm } from '../institutions/forms';

export const dynamic = 'force-dynamic';
type Row = { institution_id: string; stage: string; blocker: string | null; updated_at: string };
export default async function OnboardingPage() {
  const access = await getVerifiedPlatformOwner(); if (!access) return null;
  const [onboardingResult, institutionsResult] = await Promise.all([access.client.from('institution_onboarding').select('institution_id,stage,blocker,updated_at').order('updated_at', { ascending: false }).limit(50), access.client.from('institutions').select('id,name,slug,lifecycle_status')]);
  const names = new Map((institutionsResult.data ?? []).map(row => [row.id, row])); const rows = onboardingResult.data as Row[] | null;
  return <><section className="sa-page-heading"><div><p className="sa-eyebrow">INSTITUTION MANAGEMENT</p><h1>Institution onboarding</h1><p>Stages persist server-side. Plan assignment and identity verification await their dedicated capability and invitation phases.</p></div></section><section className="sa-panel"><div className="sa-panel__heading"><h2>Newest 50 onboarding records</h2></div>{onboardingResult.error || institutionsResult.error ? <p className="sa-error" role="alert">Onboarding data is unavailable.</p> : !rows?.length ? <div className="sa-empty"><strong>No onboarding records</strong></div> : <div className="sa-onboarding-list">{rows.map(row => { const institution = names.get(row.institution_id); return <article key={row.institution_id} className="sa-onboarding-card"><div><p className="sa-eyebrow">{row.stage}</p><h2>{institution?.name ?? 'Institution unavailable'}</h2><p>{row.blocker ?? 'No blocker recorded.'}</p><small>Updated {new Date(row.updated_at).toLocaleString('en-IN')}</small></div><OnboardingStageForm institutionId={row.institution_id} stage={row.stage} blocker={row.blocker} /><Link className="sa-text-link" href={`/super-admin/institutions/${row.institution_id}`}>Open Institution 360 ↗</Link></article>; })}</div>}</section></>;
}
