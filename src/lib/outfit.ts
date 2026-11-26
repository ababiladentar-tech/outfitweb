import { undertoneHarmony, vibeScore } from './color';
import { bestSize } from './sizing';
import type {
  BuilderMode,
  Occasion,
  OutfitPiece,
  OutfitSlot,
  StylePreference,
  UMKMProductPost,
  UserProfile,
  WardrobeItem,
  Weather,
} from './types';

/**
 * Outfit engine shared by Studio Padu Padan and the stylist agent, so an outfit
 * the agent builds is exactly what Studio shows when the user opens it there.
 */

export const SLOTS: { key: OutfitSlot; label: string }[] = [
  { key: 'top', label: 'Atasan / Dress' },
  { key: 'bottom', label: 'Bawahan' },
  { key: 'outer', label: 'Outer' },
  { key: 'shoes', label: 'Sepatu' },
  { key: 'bag', label: 'Tas' },
];

export const OCCASION_LABEL: Record<Occasion, string> = {
  kuliah: 'Kuliah',
  kantor: 'Kantor',
  kasual: 'Kasual',
  kondangan: 'Kondangan',
  weekend: 'Weekend',
};

export const wardrobeSlot = (c: WardrobeItem['category']): OutfitSlot | null =>
  c === 'tops' || c === 'dresses' ? 'top' : c === 'bottoms' ? 'bottom' : c === 'outerwear' ? 'outer' : c === 'shoes' ? 'shoes' : c === 'bags' ? 'bag' : null;

export const productSlot = (c: UMKMProductPost['category']): OutfitSlot | null =>
  c === 'top' || c === 'dress' ? 'top' : c === 'pants' || c === 'jeans' ? 'bottom' : c === 'outerwear' ? 'outer' : c === 'shoes' ? 'shoes' : c === 'bag' ? 'bag' : null;

const OCC_TAG: Record<Occasion, string[]> = {
  kuliah: ['kuliah'],
  kantor: ['kantor'],
  kasual: ['kasual', 'weekend'],
  kondangan: ['kondangan'],
  weekend: ['weekend', 'kasual'],
};

/**
 * How well a style suits an occasion: 0 = fine, negative = penalty.
 * Streetwear and tees never go to the office or a wedding reception.
 */
function occasionFit(occ: Occasion, style: string, casualPiece: boolean): number {
  const smart = ['formal', 'minimalist', 'old_money', 'etnik_modern'];
  if (occ === 'kondangan') return style === 'streetwear' || casualPiece ? -90 : smart.includes(style) ? 0 : -35;
  if (occ === 'kantor') return style === 'streetwear' || casualPiece ? -70 : smart.includes(style) ? 0 : -15;
  if (occ === 'kuliah') return 0;
  return smart.includes(style) && style === 'formal' ? -10 : 0;
}

const CASUAL_WORDS = /(kaos|tee|hoodie|jeans|kargo|cargo|sandal|slide|flanel|sneaker|kanvas|celana pendek|chino pendek)/i;

export interface Candidate {
  piece: OutfitPiece;
  score: number;
  isDress: boolean;
}

export type Vibe = StylePreference | 'all';

export function fromWardrobe(w: WardrobeItem, profile: UserProfile, occ: Occasion, vibe: Vibe): Candidate | null {
  const slot = wardrobeSlot(w.category);
  if (!slot) return null;
  let score = undertoneHarmony(w.colorHex, profile.skinTone);
  score += occasionFit(occ, w.style, CASUAL_WORDS.test(w.name));
  if (vibe !== 'all' && w.style === vibe) score += 15;
  if (occ === 'kantor' && (w.style === 'formal' || w.style === 'minimalist')) score += 10;
  if (occ === 'kondangan' && (w.style === 'formal' || w.category === 'dresses')) score += 12;
  return {
    piece: { slot, source: 'wardrobe', refId: w.id, name: w.name, imageUrl: w.imageUrl, colorHex: w.colorHex, price: 0 },
    score,
    isDress: w.category === 'dresses',
  };
}

export function fromProduct(p: UMKMProductPost, profile: UserProfile, occ: Occasion, vibe: Vibe): Candidate | null {
  const slot = productSlot(p.category);
  if (!slot || !p.isAvailable || p.stockCount <= 0) return null;
  if (profile.gender === 'boy' && p.category === 'dress') return null;
  const fit = bestSize(p, profile.measurements);
  let score = vibeScore(p, profile.skinTone, profile.bodyShape) * 0.5 + fit.fit.score * 0.5;
  if (OCC_TAG[occ].some((t) => p.tags.includes(t))) score += 20;
  score += occasionFit(occ, p.style, CASUAL_WORDS.test(p.title));
  // A piece that will not fit is a bad pick however well it matches.
  if (slot !== 'bag' && fit.fit.score < 60) score -= 60;
  if (vibe !== 'all' && p.style === vibe) score += 15;
  return {
    piece: {
      slot,
      source: 'umkm',
      refId: p.id,
      name: p.title,
      imageUrl: p.imageUrl,
      colorHex: p.colorHex[0] ?? '#888888',
      price: p.price,
      sellerName: p.sellerName,
      fit: slot === 'bag' ? undefined : { ...fit.fit, notes: [`Ukuran ${fit.size.sizeLabel}`, ...fit.fit.notes] },
    },
    score,
    isDress: p.category === 'dress',
  };
}

export function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export type CandidateMap = Record<OutfitSlot, Candidate[]>;

export function buildCandidates(opts: {
  mode: BuilderMode;
  wardrobe: WardrobeItem[];
  catalog: UMKMProductPost[];
  profile: UserProfile;
  occasion: Occasion;
  vibe: Vibe;
  excludeIds?: string[];
}): CandidateMap {
  const { mode, wardrobe, catalog, profile, occasion, vibe } = opts;
  const exclude = new Set(opts.excludeIds ?? []);
  const map: CandidateMap = { top: [], bottom: [], outer: [], shoes: [], bag: [] };
  if (mode !== 'umkm') {
    wardrobe.forEach((w) => {
      const c = fromWardrobe(w, profile, occasion, vibe);
      if (c && !exclude.has(w.id)) map[c.piece.slot].push(c);
    });
  }
  if (mode !== 'wardrobe') {
    catalog.forEach((p) => {
      const c = fromProduct(p, profile, occasion, vibe);
      if (c && !exclude.has(p.id)) map[c.piece.slot].push(c);
    });
  }
  return map;
}

export type OutfitSlots = Partial<Record<OutfitSlot, OutfitPiece | null>>;

export interface GenerateOptions {
  candidates: CandidateMap;
  mode: BuilderMode;
  occasion: Occasion;
  vibe: Vibe;
  budget: number;
  weather: Weather;
  seed: number;
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  /** Wardrobe items that must appear. */
  lockedWardrobeIds?: string[];
  /** Catalog products that must appear (the agent uses this). */
  requiredProducts?: UMKMProductPost[];
}

export function generateOutfit(o: GenerateOptions): OutfitSlots {
  const rand = seeded(o.seed);
  const pieces: OutfitSlots = {};
  let remaining = o.budget;
  let umkmUsed = 0;
  const needOuter = o.weather !== 'cerah' || o.occasion === 'kantor' || o.occasion === 'kondangan';
  let dress = false;

  const locked = [
    ...o.wardrobe
      .filter((w) => (o.lockedWardrobeIds ?? []).includes(w.id))
      .map((w) => fromWardrobe(w, o.profile, o.occasion, o.vibe)),
    ...(o.requiredProducts ?? []).map((p) => fromProduct(p, o.profile, o.occasion, o.vibe)),
  ].filter((c): c is Candidate => !!c);
  for (const c of locked) if (c.piece.source === 'umkm') remaining -= c.piece.price;

  for (const { key } of SLOTS) {
    const lock = locked.find((c) => c.piece.slot === key);
    if (lock) {
      pieces[key] = lock.piece;
      if (lock.isDress) dress = true;
      if (lock.piece.source === 'umkm') umkmUsed += 1;
      continue;
    }
    if (key === 'bottom' && dress) {
      pieces.bottom = null;
      continue;
    }
    if (key === 'outer' && !needOuter) {
      pieces.outer = null;
      continue;
    }
    let pool = o.candidates[key].map((c) => ({ ...c, score: c.score + rand() * 18 }));
    if (o.mode === 'hybrid') {
      // Owned pieces count only if they suit the occasion; otherwise buy one.
      const ownHas = pool.some((c) => c.piece.source === 'wardrobe' && c.score >= 55);
      const preferUmkm = (key === 'outer' || key === 'shoes' || !ownHas) && umkmUsed < 2;
      pool = pool.filter((c) => (c.piece.source === 'umkm' ? preferUmkm : !preferUmkm || !ownHas));
      if (!pool.length) pool = o.candidates[key].filter((c) => c.piece.source === 'wardrobe');
    }
    pool = pool.filter((c) => c.piece.source === 'wardrobe' || c.piece.price <= remaining);
    // Never buy something clearly wrong for the day (wrong occasion or poor fit).
    pool = pool.filter((c) => c.piece.source === 'wardrobe' || c.score >= 25);
    // Nothing affordable to buy for this slot: use what the user already owns.
    if (!pool.length && o.mode !== 'umkm') pool = o.candidates[key].filter((c) => c.piece.source === 'wardrobe').map((c) => ({ ...c, score: c.score + rand() * 18 }));
    pool.sort((a, b) => b.score - a.score);
    const pick = pool[0];
    if (pick) {
      pieces[key] = pick.piece;
      if (pick.piece.source === 'umkm') {
        remaining -= pick.piece.price;
        umkmUsed += 1;
      }
      if (pick.isDress) dress = true;
    } else pieces[key] = null;
  }
  return pieces;
}

export function piecesOf(slots: OutfitSlots): OutfitPiece[] {
  return SLOTS.map((s) => slots[s.key]).filter((p): p is OutfitPiece => !!p);
}
