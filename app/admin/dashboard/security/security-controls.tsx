'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase is not configured');
  return createBrowserClient(url, key, { auth: { experimental: { passkey: true } } });
}

export default function SecurityControls() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function savePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 12) { setMessage('Use at least 12 characters.'); return; }
    if (password !== confirm) { setMessage('Passwords do not match.'); return; }
    setBusy(true); setMessage('');
    try {
      const { error } = await client().auth.updateUser({ password });
      if (error) throw error;
      setPassword(''); setConfirm(''); setMessage('Password saved. You can now sign in with your email and password.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save password'); }
    finally { setBusy(false); }
  }

  async function addPasskey() {
    setBusy(true); setMessage('');
    try {
      const { error } = await client().auth.registerPasskey();
      if (error) throw error;
      setMessage('Passkey registered. You can now sign in using your device.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to register passkey'); }
    finally { setBusy(false); }
  }

  return <section style={{ maxWidth: 480, display: 'grid', gap: 22 }}>
    <form onSubmit={savePassword} style={{ display: 'grid', gap: 12 }}>
      <h2>Set or change password</h2>
      <label htmlFor="new-password">New password (12+ characters)</label>
      <input id="new-password" type="password" minLength={12} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 12, borderRadius: 8, color: '#fff', background: '#151b2f', border: '1px solid #53617a' }}/>
      <label htmlFor="confirm-password">Confirm password</label>
      <input id="confirm-password" type="password" minLength={12} autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} style={{ padding: 12, borderRadius: 8, color: '#fff', background: '#151b2f', border: '1px solid #53617a' }}/>
      <button disabled={busy} style={{ padding: 12, background: '#a78bfa', borderRadius: 9, color: '#101021' }}>Save password</button>
    </form>
    <div style={{ display: 'grid', gap: 12 }}>
      <h2>Device passkey</h2>
      <p>Register a fingerprint, face unlock, device PIN or password-manager passkey. Supabase passkeys must be enabled for this project first.</p>
      <button type="button" disabled={busy} onClick={addPasskey} style={{ padding: 12, background: '#202944', color: '#fff', border: '1px solid #6d7899', borderRadius: 9 }}>Register passkey</button>
    </div>
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
