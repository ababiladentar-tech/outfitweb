import type {
  BodyMeasurements,
  FitResult,
  FitStatus,
  GarmentMeasurement,
  ProductCategory,
  UMKMProductPost,
} from './types';

/**
 * Garment ease tolerance in cm (garment flat-lay circumference minus body).
 * Values follow common pattern-making ease ranges for woven fabric.
 */
interface EaseRange {
  min: number;
  max: number;
}

interface CategoryEase {
  chest?: EaseRange;
  waist?: EaseRange;
  shoulder?: EaseRange;
}

const EASE: Record<ProductCategory, CategoryEase> = {
  top: { chest: { min: 6, max: 16 }, shoulder: { min: -1, max: 7 } },
  outerwear: { chest: { min: 10, max: 22 }, shoulder: { min: 0, max: 6 } },
  dress: { chest: { min: 2, max: 10 }, waist: { min: 2, max: 12 } },
  pants: { waist: { min: 0, max: 4 } },
  jeans: { waist: { min: 2, max: 3.5 } },
  bag: {},
  shoes: {},
  hijab: {},
};

const STRETCH_RELIEF = 2;

function rangeFor(base: EaseRange, stretch: boolean | undefined): EaseRange {
  if (!stretch) return base;
  return { min: base.min - STRETCH_RELIEF, max: base.max + 1 };
}

interface DimensionCheck {
  label: string;
  ease: number;
  range: EaseRange;
  weight: number;
}

function scoreDimension(d: DimensionCheck): { score: number; status: FitStatus } {
  if (d.ease < d.range.min) {
    const gap = d.range.min - d.ease;
    return { score: Math.max(0, 100 - gap * 12), status: 'tight' };
  }
  if (d.ease > d.range.max) {
    const gap = d.ease - d.range.max;
    return { score: Math.max(0, 100 - gap * 7), status: 'loose' };
  }
  const mid = (d.range.min + d.range.max) / 2;
  const half = (d.range.max - d.range.min) / 2 || 1;
  const offCenter = Math.abs(d.ease - mid) / half;
  return { score: Math.round(100 - offCenter * 8), status: 'ideal' };
}

const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));

export function evaluateFit(
  product: Pick<UMKMProductPost, 'category' | 'stretch'>,
  size: GarmentMeasurement,
  body: BodyMeasurements,
): FitResult {
  const notes: string[] = [];

  if (product.category === 'shoes') {
    if (size.insoleCm === undefined) return { status: 'ideal', score: 70, notes: ['Panjang insole belum dicantumkan penjual.'] };
    const ease = size.insoleCm - body.footCm;
    const res = scoreDimension({ label: 'Insole', ease, range: { min: 0.5, max: 1.5 }, weight: 1 });
    notes.push(
      `Insole ${fmt(size.insoleCm)} cm vs kaki ${fmt(body.footCm)} cm: sisa ruang ${fmt(ease)} cm (ideal 0,5 - 1,5 cm).`,
    );
    return { status: res.status, score: Math.round(res.score), notes };
  }

  if (product.category === 'bag' || product.category === 'hijab') {
    if (size.bagLengthCm) {
      notes.push(
        `Dimensi ${size.bagLengthCm} x ${size.bagWidthCm ?? 0} x ${size.bagHeightCm ?? 0} cm (P x L x T).`,
      );
    } else {
      notes.push('Ukuran universal, tidak bergantung ukuran tubuh.');
    }
    return { status: 'ideal', score: 100, notes };
  }

  const ease = EASE[product.category];
  const checks: DimensionCheck[] = [];
  if (ease.chest && size.chestBustCm !== undefined) {
    checks.push({ label: 'Lingkar dada', ease: size.chestBustCm - body.chestCm, range: rangeFor(ease.chest, product.stretch), weight: 0.55 });
  }
  if (ease.waist && size.waistCm !== undefined) {
    checks.push({ label: 'Lingkar pinggang', ease: size.waistCm - body.waistCm, range: rangeFor(ease.waist, product.stretch), weight: 0.6 });
  }
  if (ease.shoulder && size.shoulderWidthCm !== undefined) {
    checks.push({ label: 'Lebar bahu', ease: size.shoulderWidthCm - body.shoulderCm, range: ease.shoulder, weight: 0.45 });
  }

  if (checks.length === 0) {
    return { status: 'ideal', score: 70, notes: ['Penjual belum mencantumkan ukuran flat-lay lengkap.'] };
  }

  let weighted = 0;
  let totalWeight = 0;
  let status: FitStatus = 'ideal';
  for (const c of checks) {
    const r = scoreDimension(c);
    weighted += r.score * c.weight;
    totalWeight += c.weight;
    if (r.status === 'tight') status = 'tight';
    else if (r.status === 'loose' && status !== 'tight') status = 'loose';
    const sign = c.ease >= 0 ? '+' : '';
    notes.push(
      `${c.label}: kelonggaran ${sign}${fmt(c.ease)} cm (ideal ${fmt(c.range.min)} s/d ${fmt(c.range.max)} cm).`,
    );
  }

  if (product.category === 'jeans' && !product.stretch) {
    notes.push('Denim non-stretch butuh kelonggaran pinggang 2 - 3 cm dan akan melar sekitar 1 cm setelah dipakai.');
  } else if (product.stretch) {
    notes.push('Bahan memiliki serat elastis, toleransi ukuran sedikit lebih longgar.');
  }

  return { status, score: Math.round(weighted / totalWeight), notes };
}

export function bestSize(
  product: UMKMProductPost,
  body: BodyMeasurements,
): { size: GarmentMeasurement; fit: FitResult } {
  let best: { size: GarmentMeasurement; fit: FitResult } | null = null;
  for (const s of product.availableSizes) {
    const fit = evaluateFit(product, s, body);
    if (!best || fit.score > best.fit.score) best = { size: s, fit };
  }
  if (!best) {
    const fallback: GarmentMeasurement = { sizeLabel: '-' };
    return { size: fallback, fit: { status: 'ideal', score: 0, notes: [] } };
  }
  return best;
}

export const FIT_LABEL: Record<FitStatus, string> = {
  tight: 'Sempit',
  ideal: 'Pas',
  loose: 'Longgar',
};

export function fitTone(status: FitStatus): string {
  if (status === 'ideal') return 'bg-[#E3ECE7] text-[#153329]';
  if (status === 'tight') return 'bg-[#F7E1E3] text-[#8A2F3B]';
  return 'bg-[#F1ECDF] text-[#6B5326]';
}
