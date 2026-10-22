'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Authentication is not configured');
  return createBrowserClient(url, key, { auth: { experimental: { passkey: true } } });
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'password'|'magic'>('password');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const client = authClient();
      if (mode === 'password') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/admin/dashboard'); router.refresh();
      } else {
        const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/auth/callback' } });
        if (error) throw error;
        setMessage('Check your email for a fresh sign-in link.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in');
    } finally { setBusy(false); }
  }

  async function passkeyLogin() {
    setBusy(true); setMessage('');
    try {
      const { error } = await authClient().auth.signInWithPasskey();
      if (error) throw error;
      router.replace('/admin/dashboard'); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Passkey sign-in failed');
    } finally { setBusy(false); }
  }

  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
    <form onSubmit={submit} style={{ width: '100%', maxWidth: 440, background: '#151b2f', padding: 36, border: '1px solid #34365b', borderRadius: 24 }}>
      <div style={{ color: '#b9a5ff' }}>CAMPUSOS / SECURE ACCESS</div>
      <h1>Welcome back.</h1>
      <p style={{ color: '#aab6d0' }}>Sign in to your CampusOS account.</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        <button type="button" onClick={() => {setMode('password');setMessage('');}} aria-pressed={mode === 'password'} style={{ flex: 1, padding: 10, background: mode === 'password' ? '#a78bfa' : '#28314a', borderRadius: 9 }}>Password</button>
        <button type="button" onClick={() => {setMode('magic');setMessage('');}} aria-pressed={mode === 'magic'} style={{ flex: 1, padding: 10, background: mode === 'magic' ? '#a78bfa' : '#28314a', borderRadius: 9 }}>Email link</button>
      </div>
      <label htmlFor="email">Email address</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', padding: 14, margin: '12px 0 20px', borderRadius: 10, border: '1px solid #53617a', background: '#0d1424', color: 'white' }} />
      {mode === 'password' && <><label htmlFor="password">Password</label><input id="password" type="password" minLength={8} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: 14, margin: '12px 0 20px', borderRadius: 10, border: '1px solid #53617a', background: '#0d1424', color: 'white' }}/></>}
      <button disabled={busy} style={{ padding: 14, borderRadius: 10, width: '100%', background: '#a78bfa', color: '#101021', fontWeight: 700 }}>{busy ? 'Please wait…' : mode === 'password' ? 'Sign in with password' : 'Send secure sign-in link'}</button>
      <button type="button" disabled={busy} onClick={passkeyLogin} style={{ padding: 14, marginTop: 12, borderRadius: 10, width: '100%', border: '1px solid #6d7899', background: '#202944', color: 'white', fontWeight: 600 }}>Sign in with passkey</button>
      <p style={{ color: '#aab6d0', fontSize: 13 }}>First time? Use Email link, then set a password or register a passkey in Security settings.</p>
      <p role="status" aria-live="polite">{message}</p>
    </form>
  </main>;
}
