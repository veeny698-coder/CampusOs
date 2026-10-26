'use client';

export default function SuperAdminError({ reset }: { error: Error; reset: () => void }) {
  return <section className="sa-error-page" role="alert"><p className="sa-eyebrow">SUPER ADMIN</p><h1>Control center unavailable</h1><p>We could not load this protected platform view. No data was changed.</p><button type="button" onClick={reset}>Try again</button></section>;
}
