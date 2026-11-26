import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

/**
 * Server-side Supabase access for API routes. Requests carry the user's access
 * token in the Authorization header; the client below acts as that user, so
 * row level security still applies.
 */

export function cloudConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function userFromRequest(req: Request): Promise<{ user: User; db: SupabaseClient } | null> {
  if (!cloudConfigured()) return null;
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, db };
}

export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 10);

/**
 * Counts one model-backed consultation for the user. Returns the remaining
 * quota, or -1 when the daily limit is used up.
 */
export async function consumeAiQuota(db: SupabaseClient): Promise<number> {
  const { data, error } = await db.rpc('consume_ai_quota', { p_limit: AI_DAILY_LIMIT });
  if (error) return 0;
  return typeof data === 'number' ? data : 0;
}
