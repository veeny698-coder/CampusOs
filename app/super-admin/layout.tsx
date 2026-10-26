import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { getVerifiedPlatformOwner } from '../../lib/auth/platform-owner';
import { SuperAdminShell } from './super-admin-shell';

export const dynamic = 'force-dynamic';

/**
 * Platform control-plane access is deliberately separate from institution
 * membership. This layout is the single server-side authorization boundary
 * for every /super-admin route added in the delivery plan.
 */
export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const access = await getVerifiedPlatformOwner();

  if (!access) {
    const client = await createSupabaseServerClient();
    const { data: { user } } = await client.auth.getUser();
    redirect(user ? '/portals' : '/login');
  }

  return <SuperAdminShell email={access.user.email ?? 'Platform owner'}>{children}</SuperAdminShell>;
}
