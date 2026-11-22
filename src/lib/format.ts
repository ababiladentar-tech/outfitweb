export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatIDR(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',') + 'rb';
  return String(n);
}

/** Keeps copy within the editorial rules: no em/en dash, no emoji. */
export function cleanCopy(text: string): string {
  return text
    .replace(/\s*[\u2014\u2013]\s*/g, ', ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .trim();
}
