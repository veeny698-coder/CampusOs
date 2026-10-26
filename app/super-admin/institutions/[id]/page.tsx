import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import { InstitutionProfileForm, LifecycleForm, OnboardingStageForm, OwnerInvitationForm } from '../forms';

export const dynamic = 'force-dynamic';
type Params = { params: Promise<{ id: string }> };

export default async function InstitutionDetailPage({ params }: Params) {
  const { id } = await params; if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const access = await getVerifiedPlatformOwner(); if (!access) return null;
  const [institutionResult, profileResult, onboardingResult, orgResult, invitationResult, auditResult] = await Promise.all([
    access.client.from('institutions').select('id,name,slug,lifecycle_status,created_at').eq('id', id).maybeSingle(),
    access.client.from('institution_profiles').select('domain,time_zone,updated_at').eq('institution_id', id).maybeSingle(),
    access.client.from('institution_onboarding').select('stage,blocker,updated_at').eq('institution_id', id).maybeSingle(),
    access.client.from('organizations').select('id,name,kind,created_at').eq('institution_id', id).order('created_at', { ascending: false }).limit(20),
    access.client.from('institution_owner_invitations').select('id,email,status,expires_at,created_at').eq('institution_id', id).order('created_at', { ascending: false }).limit(10),
    access.client.from('audit_logs').select('id,action,created_at').eq('resource_id', id).order('created_at', { ascending: false }).limit(10),
  ]);
  if (institutionResult.error) return <p className="sa-error" role="alert">Institution data is unavailable. No data was changed.</p>;
  if (!institutionResult.data) notFound();
  const institution = institutionResult.data;
  return <>
    <section className="sa-page-heading"><div><Link className="sa-text-link" href="/super-admin/institutions">← All institutions</Link><p className="sa-eyebrow">INSTITUTION 360</p><h1>{institution.name}</h1><p>{institution.slug} · Created {new Date(institution.created_at).toLocaleDateString('en-IN')}</p></div><span className={`sa-state sa-state--${institution.lifecycle_status}`}>{institution.lifecycle_status}</span></section>
    <section className="sa-detail-grid"><article className="sa-panel sa-panel--form"><InstitutionProfileForm institutionId={id} domain={profileResult.data?.domain ?? null} timeZone={profileResult.data?.time_zone ?? null} /></article><article className="sa-panel sa-panel--form"><LifecycleForm institutionId={id} status={institution.lifecycle_status} /></article><article className="sa-panel sa-panel--form"><OwnerInvitationForm institutionId={id} /></article><article className="sa-panel sa-panel--form"><h2>Onboarding</h2><OnboardingStageForm institutionId={id} stage={onboardingResult.data?.stage ?? 'created'} blocker={onboardingResult.data?.blocker ?? null} /></article></section>
    <section className="sa-grid"><article className="sa-panel"><div className="sa-panel__heading"><h2>Organizations</h2><Link className="sa-text-link" href="/super-admin/organizations">Cross-college directory ↗</Link></div>{orgResult.error ? <p className="sa-error">Organization data is unavailable.</p> : !orgResult.data?.length ? <div className="sa-empty"><strong>No organizations</strong><p>Create structures through the existing protected workflow until its Phase 2 migration is complete.</p></div> : <ul className="sa-record-list">{orgResult.data.map(org => <li key={org.id}><span className="sa-record-mark">◌</span><div><strong>{org.name}</strong><small>{org.kind}</small></div></li>)}</ul>}</article>
      <article className="sa-panel"><div className="sa-panel__heading"><h2>Owner invitation requests</h2></div>{invitationResult.error ? <p className="sa-error">Invitation data is unavailable.</p> : !invitationResult.data?.length ? <div className="sa-empty"><strong>No requests</strong><p>No account has been created automatically.</p></div> : <ul className="sa-record-list">{invitationResult.data.map(invitation => <li key={invitation.id}><span className="sa-record-mark">✉</span><div><strong>{invitation.email}</strong><small>{invitation.status} · expires {new Date(invitation.expires_at).toLocaleString('en-IN')}</small></div></li>)}</ul>}</article>
      <article className="sa-panel"><div className="sa-panel__heading"><h2>Institution audit</h2></div>{auditResult.error ? <p className="sa-error">Audit data is unavailable.</p> : !auditResult.data?.length ? <div className="sa-empty"><strong>No audit entries</strong></div> : <ul className="sa-record-list">{auditResult.data.map(entry => <li key={entry.id}><span className="sa-record-mark">✓</span><div><strong>{entry.action}</strong><small>{new Date(entry.created_at).toLocaleString('en-IN')}</small></div></li>)}</ul>}</article>
    </section>
  </>;
}
