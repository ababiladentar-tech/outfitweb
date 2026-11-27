/**
 * Without a database there are no accounts, so a public demo limits model
 * calls per visitor IP instead. Kept in memory: best effort on serverless,
 * where each warm instance counts separately, but enough to stop one visitor
 * from draining the key.
 */
const DEMO_HOURLY_LIMIT = Number(process.env.DEMO_AI_HOURLY_LIMIT || 30);
const demoUsage = new Map<string, { count: number; resetAt: number }>();

export function takeDemoQuota(req: Request): boolean {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
  const now = Date.now();
  const cur = demoUsage.get(ip);
  if (!cur || cur.resetAt < now) {
    demoUsage.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    if (demoUsage.size > 5000) for (const [k, v] of demoUsage) if (v.resetAt < now) demoUsage.delete(k);
    return true;
  }
  if (cur.count >= DEMO_HOURLY_LIMIT) return false;
  cur.count += 1;
  return true;
}
