import type { BodyShape, SkinTone, UMKMProductPost, WardrobeCategory } from './types';

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0');
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToHsl(hex: string): HSL {
  const [r0, g0, b0] = hexToRgb(hex);
  const r = r0 / 255;
  const g = g0 / 255;
  const b = b0 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const k = (n: number): number => (n + h / 30) % 12;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number): number => lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

export function isValidHex(v: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}

export function shade(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, Math.min(100, l + amount)));
}

export function isLight(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

const NAMED: { name: string; hex: string }[] = [
  { name: 'Putih', hex: '#F4F1EA' },
  { name: 'Krem', hex: '#E4D6BC' },
  { name: 'Hitam', hex: '#252422' },
  { name: 'Abu', hex: '#8B8C88' },
  { name: 'Coklat', hex: '#7A5236' },
  { name: 'Camel', hex: '#B88B5A' },
  { name: 'Hijau', hex: '#4F6E5C' },
  { name: 'Sage', hex: '#8EA89D' },
  { name: 'Biru', hex: '#3D5A80' },
  { name: 'Navy', hex: '#1F2C44' },
  { name: 'Merah', hex: '#A2333A' },
  { name: 'Pink', hex: '#E58B94' },
  { name: 'Kuning', hex: '#D9B44A' },
  { name: 'Ungu', hex: '#6A4C7A' },
];

export function nearestColorName(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  let best = NAMED[0];
  let bestD = Infinity;
  for (const c of NAMED) {
    const [r2, g2, b2] = hexToRgb(c.hex);
    const d = (r - r2) ** 2 * 0.3 + (g - g2) ** 2 * 0.59 + (b - b2) ** 2 * 0.11;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best.name;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = src;
  });
}

/** Resize to keep localStorage small, returns JPEG data URL. */
export async function compressImage(file: File, maxSide = 560): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.78);
}

export interface ExtractionResult {
  hex: string;
  name: string;
  category: WardrobeCategory;
  ratio: number;
}

/** Dominant colour from the centre of the photo, ignoring near-white background. */
export async function extractGarmentInfo(dataUrl: string, fileName = ''): Promise<ExtractionResult> {
  const img = await loadImage(dataUrl);
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  let hex = '#8B8C88';
  if (ctx) {
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(8, 8, size - 16, size - 16);
    const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 238 && g > 238 && b > 238) continue;
      const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
      const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
      e.n += 1;
      e.r += r;
      e.g += g;
      e.b += b;
      buckets.set(key, e);
    }
    let top: { n: number; r: number; g: number; b: number } | null = null;
    buckets.forEach((v) => {
      if (!top || v.n > top.n) top = v;
    });
    const t = top as { n: number; r: number; g: number; b: number } | null;
    if (t && t.n > 0) hex = rgbToHex(t.r / t.n, t.g / t.n, t.b / t.n);
  }
  const ratio = img.height / Math.max(1, img.width);
  return { hex, name: nearestColorName(hex), category: guessCategory(fileName, ratio), ratio };
}

const KEYWORDS: [RegExp, WardrobeCategory][] = [
  [/(jean|celana|pant|rok|skirt|kulot|chino|trouser)/i, 'bottoms'],
  [/(dress|gamis|terusan)/i, 'dresses'],
  [/(jaket|jacket|blazer|cardigan|outer|coat|hoodie)/i, 'outerwear'],
  [/(sepatu|shoe|sneaker|loafer|sandal|heels)/i, 'shoes'],
  [/(tas|bag|tote|sling|ransel)/i, 'bags'],
  [/(hijab|kerudung|topi|hat|gelang|kalung|scarf|jam)/i, 'accessories'],
  [/(kaos|tee|shirt|kemeja|blouse|atasan|top|tunik)/i, 'tops'],
];

export function guessCategory(fileName: string, ratio: number): WardrobeCategory {
  for (const [re, cat] of KEYWORDS) if (re.test(fileName)) return cat;
  if (ratio > 1.55) return 'dresses';
  if (ratio > 1.25) return 'bottoms';
  if (ratio < 0.7) return 'shoes';
  return 'tops';
}

/* ---------- Vibe match ---------- */

export function undertoneHarmony(hex: string, tone: SkinTone): number {
  const { h, s, l } = hexToHsl(hex);
  const neutralish = s < 14 || l > 88 || l < 14;
  if (neutralish) return 85;
  const warmHue = (h >= 15 && h <= 70) || h >= 345;
  const coolHue = h >= 170 && h <= 300;
  if (tone === 'neutral') return 82;
  if (tone === 'warm') return warmHue ? 95 : coolHue ? (l < 40 ? 72 : 58) : 75;
  return coolHue ? 95 : warmHue ? (l > 75 ? 70 : 55) : 75;
}

const SHAPE_FAVORS: Record<BodyShape, { cats: UMKMProductPost['category'][]; keywords: RegExp }> = {
  hourglass: { cats: ['dress', 'top', 'jeans'], keywords: /(tali pinggang|a-line|slip|wrap)/i },
  pear: { cats: ['top', 'outerwear', 'dress'], keywords: /(wide leg|a-line|kulot|bahu)/i },
  apple: { cats: ['outerwear', 'dress'], keywords: /(kimono|lurus|a-line|outer panjang|vertikal)/i },
  inverted_triangle: { cats: ['pants', 'jeans', 'dress'], keywords: /(wide leg|a-line|plisket|kulot)/i },
  rectangle: { cats: ['top', 'outerwear', 'pants'], keywords: /(tali pinggang|pleated|plisket|struktur)/i },
  oval: { cats: ['outerwear', 'top'], keywords: /(vertikal|lurus|kimono|regular)/i },
  triangle: { cats: ['outerwear', 'top'], keywords: /(bahu|struktur|trucker|blazer)/i },
  trapezoid: { cats: ['top', 'pants', 'jeans'], keywords: /(regular|straight|chino|oxford)/i },
};

export function vibeScore(p: UMKMProductPost, tone: SkinTone, shape: BodyShape): number {
  const harmony = undertoneHarmony(p.colorHex[0] ?? '#888888', tone);
  const fav = SHAPE_FAVORS[shape];
  let shapeScore = 70;
  if (fav.cats.includes(p.category)) shapeScore += 12;
  if (fav.keywords.test(p.description + ' ' + p.title)) shapeScore += 15;
  if (p.category === 'bag' || p.category === 'shoes' || p.category === 'hijab') shapeScore = 85;
  return Math.round(harmony * 0.6 + Math.min(100, shapeScore) * 0.4);
}
