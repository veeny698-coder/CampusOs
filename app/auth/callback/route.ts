import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=invalid-link', url.origin));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.redirect(new URL('/login?error=config', url.origin));

  // Attach PKCE session cookies to the actual redirect response. Setting cookies
  // through next/headers and then creating a separate redirect can drop the session.
  const response = NextResponse.redirect(new URL('/admin/dashboard', url.origin));
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items: { name: string; value: string; options?: CookieOptions }[]) {
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth-failed', url.origin));
  }
}
