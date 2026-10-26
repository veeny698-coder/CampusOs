import Link from 'next/link';
import { getVerifiedPlatformOwner } from '../../../lib/auth/platform-owner';
import { CreateInstitutionForm } from './forms';

export const dynamic = 'force-dynamic';
type InstitutionRow = { id: string; name: string; slug: string; lifecycle_status: string; created_at: string };
type OnboardingRow = { institution_id: string; stage: string; blocker: string | null };
type ProfileRow = { institution_id: string; domain: string | null };

export default async function InstitutionsPage() {
  const access = await getVerifiedPlatformOwner(); if (!access) return null;
  const [institutionsResult, onboardingResult, profilesResult] = await Promise.all([
    access.client.from('institutions').select('id,name,slug,lifecycle_status,created_at').order('created_at', { ascending: false }).limit(50),
    access.client.from('institution_onboarding').select('institution_id,stage,blocker'),
    access.client.from('institution_profiles').select('institution_id,domain'),
  ]);
  const error = Boolean(institutionsResult.error || onboardingResult.error || profilesResult.error);
  const onboarding = new Map((onboardingResult.data as OnboardingRow[] | null ?? []).map(row => [row.institution_id, row]));
  const profiles = new Map((profilesResult.data as ProfileRow[] | null ?? []).map(row => [row.institution_id, row]));
  const institutions = institutionsResult.data as InstitutionRow[] | null;
  return <>
    <section className="sa-page-heading"><div><p className="sa-eyebrow">INSTITUTION MANAGEMENT</p><h1>All institutions</h1><p>RLS-protected directory. Lifecycle and onboarding status are real records; commercial plans are introduced in Phase 5.</p></div></section>
    <section className="sa-panel sa-panel--form"><CreateInstitutionForm /></section>
    <section className="sa-panel"><div className="sa-panel__heading"><div><p className="sa-eyebrow">DIRECTORY</p><h2>Newest 50 institutions</h2></div><span className="sa-phase">Bounded query</span></div>
      {error ? <p className="sa-error" role="alert">The institution directory is temporarily unavailable. No status is inferred.</p> : !institutions?.length ? <div className="sa-empty"><strong>No institutions yet</strong><p>Create the first institution when its details have been approved.</p></div> : <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Institution</th><th>Domain</th><th>Lifecycle</th><th>Onboarding</th><th>Created</th></tr></thead><tbody>{institutions.map(institution => <tr key={institution.id}><td><Link href={`/super-admin/institutions/${institution.id}`}><strong>{institution.name}</strong><small>{institution.slug}</small></Link></td><td>{profiles.get(institution.id)?.domain ?? '—'}</td><td><span className={`sa-state sa-state--${institution.lifecycle_status}`}>{institution.lifecycle_status}</span></td><td>{onboarding.get(institution.id)?.stage ?? 'created'}</td><td><time dateTime={institution.created_at}>{new Date(institution.created_at).toLocaleDateString('en-IN')}</time></td></tr>)}</tbody></table></div>}
    </section>
  </>;
}
