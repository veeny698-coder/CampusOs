import Link from 'next/link';
import { getVerifiedPlatformOwner } from '../../../lib/auth/platform-owner';
import { RevokeOwnerInvitationForm } from '../institutions/forms';

export const dynamic = 'force-dynamic';

export default async function InvitationsPage() {
  const access = await getVerifiedPlatformOwner();
  if (!access) return null;
  const { data, error } = await access.client.from('institution_owner_invitations').select('id,institution_id,email,status,expires_at,accepted_at,created_at').order('created_at', { ascending: false }).limit(1000);
  return <><section className="sa-page-heading"><div><p className="sa-eyebrow">PEOPLE & ACCESS</p><h1>Owner invitations</h1><p>One-time owner links are accepted only by the invited, verified account. No email provider or account provisioning is assumed.</p></div></section><section className="sa-panel">{error ? <p className="sa-error" role="alert">Invitation data is unavailable. No invitation was changed.</p> : !data?.length ? <div className="sa-empty"><strong>No invitations</strong><p>Create an owner link from an Institution 360 page.</p></div> : <ul className="sa-record-list">{data.map(invitation => <li key={invitation.id}><span className="sa-record-mark">I</span><div><strong>{invitation.email}</strong><small>{invitation.status} · expires {new Date(invitation.expires_at).toLocaleString('en-IN')}{invitation.accepted_at ? ` · accepted ${new Date(invitation.accepted_at).toLocaleString('en-IN')}` : ''}</small><Link className="sa-text-link" href={`/super-admin/institutions/${invitation.institution_id}`}>Open institution</Link>{invitation.status === 'pending' ? <RevokeOwnerInvitationForm institutionId={invitation.institution_id} invitationId={invitation.id} /> : null}</div></li>)}</ul>}</section></>;
}
