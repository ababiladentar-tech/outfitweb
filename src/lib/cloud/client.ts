'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client. When the two NEXT_PUBLIC_SUPABASE_* variables are
 * missing the app runs in local demo mode: everything stays in localStorage.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const cloudEnabled = (): boolean => Boolean(URL && ANON);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!cloudEnabled() || typeof window === 'undefined') return null;
  if (!client) {
    client = createClient(URL, ANON, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'outfitly-auth' },
    });
  }
  return client;
}

export async function accessToken(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function authHeaders(): Promise<Record<string, string>> {
  const t = await accessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
