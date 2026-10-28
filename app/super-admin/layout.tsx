import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { getVerifiedPlatformAccess } from '../../lib/auth/platform-access';
import { SuperAdminShell } from './super-admin-shell';

export const dynamic = 'force-dynamic';

/**
 * Platform control-plane access is deliberately separate from institution
 * membership. Every page, action and RPC independently checks its capability;
 * this layout only gates entry into the platform workspace.
 */
export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const access = await getVerifiedPlatformAccess();

  if (!access) {
    const client = await createSupabaseServerClient();
    const { data: { user } } = await client.auth.getUser();
    redirect(user ? '/portals' : '/login');
  }

  return <SuperAdminShell email={access.user.email ?? 'Platform account'} isOwner={access.isOwner}>{children}</SuperAdminShell>;
}
