import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=invalid-link',url.origin));
  try { const client = await createSupabaseServerClient(); const {error}=await client.auth.exchangeCodeForSession(code); if(error)throw error; return NextResponse.redirect(new URL('/admin/dashboard',url.origin)); }
  catch { return NextResponse.redirect(new URL('/login?error=auth-failed',url.origin)); }
}
