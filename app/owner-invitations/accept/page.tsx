import Link from 'next/link';
import { OwnerInvitationAcceptanceForm } from './accept-form';

export const dynamic = 'force-dynamic';

export default async function OwnerInvitationAcceptancePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  const validToken = /^[0-9a-f]{64}$/.test(token);
  return <main className="sa-content"><section className="sa-page-heading"><div><p className="sa-eyebrow">INSTITUTION ACCESS</p><h1>Owner invitation</h1><p>Accept a one-time invitation using the existing, verified account invited by a platform owner.</p></div></section><section className="sa-panel sa-panel--form">{validToken ? <OwnerInvitationAcceptanceForm token={token} /> : <p className="sa-error" role="alert">This invitation link is unavailable.</p>}<p><Link className="sa-text-link" href="/login">Sign in</Link> if the invited account is not already signed in.</p></section></main>;
}
