'use server';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
export async function signOut() {
  try { const supabase = await createSupabaseServerClient(); await supabase.auth.signOut(); }
  catch { /* No session/configuration: still return to public entry. */ }
  redirect('/login');
}
