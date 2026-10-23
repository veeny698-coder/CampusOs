'use client';

import { useEffect, useState } from 'react';

export default function DashboardLoading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);
  return <main className="main" aria-busy={!slow} aria-live="polite">
    <div className="eyebrow">Platform command center</div>
    <h1 className="heading">Your campus universe.</h1>
    {slow
      ? <div role="alert">
          <p className="muted">The dashboard is taking longer than expected. Your data is safe.</p>
          <a className="console-text-link" href="/admin/dashboard">Retry loading ↗</a>
          <p className="muted">If this continues, check your internet connection or try signing in again.</p>
        </div>
      : <p className="muted" role="status">Loading live dashboard data…</p>}
  </main>;
}
