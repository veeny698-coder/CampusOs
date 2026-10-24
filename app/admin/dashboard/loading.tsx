export default function DashboardLoading() {
  return <div className="console-shell console-shell-loading" aria-busy="true" aria-live="polite">
    <aside className="console-sidebar console-sidebar-loading" aria-hidden="true">
      <div className="console-skeleton console-skeleton-logo" />
      <div className="console-skeleton-label" />
      <div className="console-skeleton-nav">
        <span className="console-skeleton" />
        <span className="console-skeleton" />
        <span className="console-skeleton" />
        <span className="console-skeleton" />
        <span className="console-skeleton" />
      </div>
    </aside>
    <main className="console-main">
      <p className="sr-only" role="status">Loading the command center.</p>
      <header className="console-header">
        <div className="console-loading-copy">
          <div className="console-skeleton console-skeleton-kicker" />
          <div className="console-skeleton console-skeleton-title" />
          <div className="console-skeleton console-skeleton-text" />
        </div>
        <div className="console-skeleton console-skeleton-button" aria-hidden="true" />
      </header>
      <section className="console-skeleton console-skeleton-feature" aria-hidden="true" />
      <section className="console-metrics" aria-hidden="true">
        <div className="console-skeleton console-skeleton-stat" />
        <div className="console-skeleton console-skeleton-stat" />
        <div className="console-skeleton console-skeleton-stat" />
      </section>
      <section aria-hidden="true">
        <div className="console-skeleton console-skeleton-section-title" />
        <div className="console-skeleton console-skeleton-list" />
      </section>
    </main>
  </div>;
}

