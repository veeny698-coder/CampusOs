'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from '../admin/dashboard/sign-out';
import './super-admin.css';

type NavigationItem = { label: string; href: string; available?: boolean };
type NavigationGroup = { label: string; icon: string; items: NavigationItem[] };

const groups: NavigationGroup[] = [
  { label: 'Command Center', icon: '◈', items: [
    { label: 'Overview', href: '/super-admin', available: true },
    { label: 'Global Analytics', href: '/super-admin/analytics' },
    { label: 'Activity Center', href: '/super-admin/activity' },
  ] },
  { label: 'Institution Management', icon: '▦', items: [
    { label: 'All Institutions', href: '/super-admin/institutions', available: true }, { label: 'Institution 360', href: '/super-admin/institutions/[id]' },
    { label: 'Onboarding', href: '/super-admin/onboarding', available: true }, { label: 'Organizations', href: '/super-admin/organizations', available: true },
  ] },
  { label: 'People & Access', icon: '◎', items: [
    { label: 'User Directory', href: '/super-admin/users' }, { label: 'Roles & Permissions', href: '/super-admin/roles' },
    { label: 'Portal Access', href: '/super-admin/access' }, { label: 'Platform Team', href: '/super-admin/team' }, { label: 'Invitations', href: '/super-admin/invitations' },
  ] },
  { label: 'Subscriptions & Revenue', icon: '◒', items: [
    { label: 'Plans', href: '/super-admin/billing/plans' }, { label: 'Subscriptions', href: '/super-admin/billing/subscriptions' },
    { label: 'Billing', href: '/super-admin/billing' }, { label: 'Usage', href: '/super-admin/billing/usage' },
  ] },
  { label: 'Modules & Configuration', icon: '◇', items: [
    { label: 'Module Catalog', href: '/super-admin/modules' }, { label: 'Feature Flags', href: '/super-admin/modules/flags' }, { label: 'Global Settings', href: '/super-admin/settings' },
  ] },
  { label: 'Automation & AI', icon: '✦', items: [
    { label: 'Automation Center', href: '/super-admin/automations' }, { label: 'AI Control Center', href: '/super-admin/ai' },
    { label: 'Integration Hub', href: '/super-admin/integrations' }, { label: 'Execution Logs', href: '/super-admin/automations/executions' },
  ] },
  { label: 'Platform Operations', icon: '◌', items: [
    { label: 'System Health', href: '/super-admin/operations/health' }, { label: 'Jobs & Queues', href: '/super-admin/operations/jobs' }, { label: 'Storage & Resources', href: '/super-admin/operations/resources' },
  ] },
  { label: 'Trust & Security', icon: '◫', items: [
    { label: 'Security Center', href: '/super-admin/security' }, { label: 'Audit Trail', href: '/super-admin/audit' }, { label: 'Data & Privacy', href: '/super-admin/privacy' },
  ] },
  { label: 'Support', icon: '?', items: [{ label: 'Support Tickets', href: '/super-admin/support' }, { label: 'Support Access', href: '/super-admin/support/access' }] },
  { label: 'Platform Administration', icon: '⚙', items: [{ label: 'Release Management', href: '/super-admin/releases' }] },
];

function Sidebar({ email, onNavigate }: { email: string; onNavigate: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState('Command Center');
  const [collapsed, setCollapsed] = useState(false);
  const activeGroup = groups.find(group => group.items.some(item => pathname === item.href || (item.href !== '/super-admin' && pathname.startsWith(item.href))))?.label;

  useEffect(() => { if (activeGroup) setExpanded(activeGroup); }, [activeGroup]);

  return <aside className={`sa-sidebar ${collapsed ? 'sa-sidebar--collapsed' : ''}`} aria-label="Super Admin navigation">
    <div className="sa-sidebar__top">
      <Link href="/super-admin" className="sa-brand" onClick={onNavigate}><span>campus</span>OS.<b>✦</b></Link>
      <button className="sa-collapse" type="button" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={() => setCollapsed(value => !value)}>
        {collapsed ? '›' : '‹'}
      </button>
    </div>
    <nav className="sa-nav">
      {groups.map(group => {
        const open = expanded === group.label;
        const active = activeGroup === group.label;
        return <section className="sa-nav__group" key={group.label}>
          <button className={`sa-nav__group-button ${active ? 'is-active' : ''}`} type="button" title={collapsed ? group.label : undefined} aria-expanded={open} onClick={() => setExpanded(open ? '' : group.label)}>
            <span aria-hidden="true">{group.icon}</span><span className="sa-nav__label">{group.label}</span><span className="sa-nav__chevron" aria-hidden="true">{open ? '⌄' : '›'}</span>
          </button>
          {open && !collapsed && <div className="sa-nav__items">
            {group.items.map(item => item.available
              ? <Link key={item.href} className={pathname === item.href ? 'is-current' : ''} href={item.href} onClick={onNavigate}>{item.label}</Link>
              : <span key={item.href} title="Scheduled for a later delivery phase">{item.label}</span>)}
          </div>}
        </section>;
      })}
    </nav>
    <div className="sa-sidebar__footer"><span className="sa-avatar">{email.slice(0, 1).toUpperCase()}</span><div className="sa-user"><strong>Platform owner</strong><small title={email}>{email}</small></div></div>
  </aside>;
}

export function SuperAdminShell({ email, children }: { email: string; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawer = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
      if (event.key !== 'Tab') return;
      const focusable = drawer.current?.querySelectorAll<HTMLElement>('a,button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    drawer.current?.querySelector<HTMLElement>('a,button')?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return <div className="sa-shell">
    <div className="sa-desktop-sidebar"><Sidebar email={email} onNavigate={() => undefined} /></div>
    <div className={`sa-drawer ${drawerOpen ? 'is-open' : ''}`} ref={drawer} aria-hidden={!drawerOpen}>
      <div className="sa-drawer__panel"><Sidebar email={email} onNavigate={() => setDrawerOpen(false)} /></div>
      <button className="sa-drawer__backdrop" type="button" aria-label="Close navigation" tabIndex={drawerOpen ? 0 : -1} onClick={() => setDrawerOpen(false)} />
    </div>
    <div className="sa-workspace">
      <header className="sa-topbar">
        <button className="sa-menu" type="button" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>☰</button>
        <div className="sa-breadcrumb"><span>CampusOS</span><span aria-hidden="true">/</span><strong>Super Admin</strong></div>
        <div className="sa-topbar__actions"><span className="sa-search-note">Permission-scoped search arrives with People & Access.</span><form action={signOut}><button className="sa-signout" type="submit">Sign out</button></form></div>
      </header>
      <main className="sa-content">{children}</main>
    </div>
  </div>;
}
