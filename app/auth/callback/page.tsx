'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthCallback() {
  const [message, setMessage] = useState('Completing secure sign-in…');

  useEffect(() => {
    let active = true;
    async function complete() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error('config');
        const client = createBrowserClient(url, key);
        const query = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const code = query.get('code');
        const tokenHash = query.get('token_hash');
        const type = query.get('type');
        const hashError = hash.get('error_description') || hash.get('error');
        const queryError = query.get('error_description') || query.get('error');
        if (hashError || queryError) throw new Error('expired');

        // Supabase magic links commonly return tokens in the URL fragment.
        // Fragments are invisible to server routes, so complete the session in the browser.
        if (hash.get('access_token') && hash.get('refresh_token')) {
          const { error } = await client.auth.setSession({
            access_token: hash.get('access_token')!,
            refresh_token: hash.get('refresh_token')!,
          });
          if (error) throw error;
        } else if (code) {
          // Supabase may already exchange the code during client initialization.
          const { data: { session } } = await client.auth.getSession();
          if (!session) {
            const { error } = await client.auth.exchangeCodeForSession(code);
            if (error) throw error;
          }
        } else if (tokenHash && (type === 'email' || type === 'magiclink' || type === 'recovery' || type === 'signup')) {
          const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: type as 'email' | 'magiclink' | 'recovery' | 'signup' });
          if (error) throw error;
        }
        const { data: { user }, error } = await client.auth.getUser();
        if (error || !user) throw new Error('no-session');
        window.history.replaceState(null, '', '/auth/callback');
        window.location.replace('/auth/continue');
      } catch (error) {
        if (!active) return;
        const reason = error instanceof Error && error.message === 'config' ? 'config' : 'auth-failed';
        setMessage('Sign-in could not be completed. Redirecting to login…');
        window.location.replace('/login?error=' + reason);
      }
    }
    void complete();
    return () => { active = false; };
  }, []);

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#0d1424',color:'#fff'}}>
    <section role="status" aria-live="polite" style={{maxWidth:420,padding:32,background:'#151b2f',borderRadius:20,border:'1px solid #34365b',textAlign:'center'}}>
      <h1>CampusOS secure sign-in</h1>
      <p>{message}</p>
    </section>
  </main>;
}
