import { 
  BodyMeasurements, 
  GarmentMeasurement, 
  UMKMProductPost, 
  SizeCompatibilityResult, 
  SizeFitStatus,
  FitPreferenceType 
} from '@/types';

// Ease allowances (in CM) for various fit preferences
const FIT_EASE_MAP: Record<FitPreferenceType, { chest: [number, number]; waist: [number, number]; hips: [number, number] }> = {
  slim: { chest: [3, 6], waist: [2, 5], hips: [2, 5] },
  regular: { chest: [6, 11], waist: [5, 9], hips: [4, 9] },
  relaxed: { chest: [11, 18], waist: [9, 16], hips: [8, 15] },
  oversized: { chest: [18, 28], waist: [15, 25], hips: [14, 24] }
};

// Standard fallback measurements (Medium standard) when user hasn't entered body measurements
const STANDARD_FALLBACK_MEASUREMENTS: BodyMeasurements = {
  chestBustCm: 92,
  waistCm: 76,
  hipsCm: 96,
  shoulderWidthCm: 40,
  sleeveLengthCm: 56,
  bodyLengthCm: 65,
  preferredFit: 'regular'
};

/**
 * Calculates size compatibility between a user's CM body measurements and a product's size chart.
 * If user hasn't entered measurements in Profile, it gracefully falls back to standard sizing.
 */
export function calculateSizeCompatibility(
  product: UMKMProductPost,
  userMeasurements?: BodyMeasurements | null,
  targetSizeLabel?: string
): SizeCompatibilityResult {
  const defaultDisclaimer = 
    'Rekomendasi ini dihitung secara matematis berdasarkan ukuran fisik (cm). Gunakan sebagai panduan estimasi.';

  const isCustomUserMeasurement = Boolean(userMeasurements && userMeasurements.chestBustCm && userMeasurements.waistCm);
  const effectiveMeasurements: BodyMeasurements = isCustomUserMeasurement 
    ? userMeasurements! 
    : STANDARD_FALLBACK_MEASUREMENTS;

  // If product has no size measurements
  if (!product.availableSizes || product.availableSizes.length === 0) {
    return {
      recommendedSize: 'All Size',
      overallScore: 80,
      fitStatus: 'good_fit',
      confidence: 'low',
      fitHeadline: 'Ukuran All Size / Standar',
      summaryExplanation: 'Pakaian ini memiliki ukuran standar fleksibel yang cocok untuk berbagai proporsi tubuh.',
      detailedChecks: [],
      disclaimer: defaultDisclaimer
    };
  }

  const preferredFit = effectiveMeasurements.preferredFit || 'regular';
  const easeTarget = FIT_EASE_MAP[preferredFit] || FIT_EASE_MAP.regular;
  const isPantsOrSkirt = product.category === 'jeans' || product.category === 'pants' || product.category === 'skirt';

  // Evaluate every size variant in product
  const sizeEvaluations = product.availableSizes.map((garment) => {
    let score = 100;
    const checks: SizeCompatibilityResult['detailedChecks'] = [];
    let criticalMismatch = false;

    // 1. CHEST / BUST CHECK
    if (garment.chestBustCm && !isPantsOrSkirt) {
      const diff = garment.chestBustCm - effectiveMeasurements.chestBustCm;
      const minEase = easeTarget.chest[0];
      const maxEase = easeTarget.chest[1];

      if (diff < 0) {
        score -= Math.min(60, Math.abs(diff) * 12);
        criticalMismatch = true;
        checks.push({
          part: 'Dada',
          userMeasurementCm: effectiveMeasurements.chestBustCm,
          garmentMeasurementCm: garment.chestBustCm,
          differenceCm: diff,
          status: 'tight',
          note: `Baju lebih kecil ${Math.abs(diff)}cm dari dada (Sangat pas/ketat).`
        });
      } else if (diff < minEase) {
        score -= (minEase - diff) * 6;
        checks.push({
          part: 'Dada',
          userMeasurementCm: effectiveMeasurements.chestBustCm,
          garmentMeasurementCm: garment.chestBustCm,
          differenceCm: diff,
          status: 'tight',
          note: `Kelonggaran ${diff}cm agak pas di badan.`
        });
      } else if (diff > maxEase) {
        const excess = diff - maxEase;
        score -= Math.min(30, excess * 3);
        checks.push({
          part: 'Dada',
          userMeasurementCm: effectiveMeasurements.chestBustCm,
          garmentMeasurementCm: garment.chestBustCm,
          differenceCm: diff,
          status: 'loose',
          note: `Kelonggaran ${diff}cm (Cukup leluasa).`
        });
      } else {
        checks.push({
          part: 'Dada',
          userMeasurementCm: effectiveMeasurements.chestBustCm,
          garmentMeasurementCm: garment.chestBustCm,
          differenceCm: diff,
          status: 'ideal',
          note: `Kelonggaran +${diff}cm sangat pas & nyaman.`
        });
      }
    }

    // 2. WAIST CHECK
    if (garment.waistCm) {
      const diff = garment.waistCm - effectiveMeasurements.waistCm;
      const minEase = easeTarget.waist[0];
      const maxEase = easeTarget.waist[1];

      if (diff < 0) {
        score -= Math.min(60, Math.abs(diff) * 14);
        criticalMismatch = true;
        checks.push({
          part: 'Pinggang',
          userMeasurementCm: effectiveMeasurements.waistCm,
          garmentMeasurementCm: garment.waistCm,
          differenceCm: diff,
          status: 'tight',
          note: `Pinggang baju lebih kecil ${Math.abs(diff)}cm.`
        });
      } else if (diff < minEase) {
        score -= (minEase - diff) * 5;
        checks.push({
          part: 'Pinggang',
          userMeasurementCm: effectiveMeasurements.waistCm,
          garmentMeasurementCm: garment.waistCm,
          differenceCm: diff,
          status: 'tight',
          note: `Kelonggaran pinggang +${diff}cm agak pas.`
        });
      } else if (diff > maxEase) {
        score -= Math.min(25, (diff - maxEase) * 2.5);
        checks.push({
          part: 'Pinggang',
          userMeasurementCm: effectiveMeasurements.waistCm,
          garmentMeasurementCm: garment.waistCm,
          differenceCm: diff,
          status: 'loose',
          note: `Kelonggaran pinggang +${diff}cm leluasa.`
        });
      } else {
        checks.push({
          part: 'Pinggang',
          userMeasurementCm: effectiveMeasurements.waistCm,
          garmentMeasurementCm: garment.waistCm,
          differenceCm: diff,
          status: 'ideal',
          note: `Lingkar pinggang +${diff}cm pas nyaman di perut.`
        });
      }
    }

    // 3. SHOULDER CHECK
    if (garment.shoulderWidthCm && effectiveMeasurements.shoulderWidthCm) {
      const diff = garment.shoulderWidthCm - effectiveMeasurements.shoulderWidthCm;
      checks.push({
        part: 'Bahu',
        userMeasurementCm: effectiveMeasurements.shoulderWidthCm,
        garmentMeasurementCm: garment.shoulderWidthCm,
        differenceCm: diff,
        status: diff >= 0 ? 'ideal' : 'tight',
        note: diff >= 0 ? `Lebar bahu pas (+${diff}cm)` : `Bahu agak pas (${diff}cm)`
      });
    }

    const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
    return {
      garment,
      score: normalizedScore,
      checks,
      criticalMismatch
    };
  });

  // Pick target size or best match size
  let selectedEvaluation = sizeEvaluations[0];

  if (targetSizeLabel) {
    const matched = sizeEvaluations.find((e) => e.garment.sizeLabel.toLowerCase() === targetSizeLabel.toLowerCase());
    if (matched) {
      selectedEvaluation = matched;
    }
  } else {
    const sorted = [...sizeEvaluations].sort((a, b) => b.score - a.score);
    selectedEvaluation = sorted[0];
  }

  let fitStatus: SizeFitStatus = 'good_fit';
  let fitHeadline = `Ukuran ${selectedEvaluation.garment.sizeLabel} Cocok Untuk Anda`;
  let confidence: SizeCompatibilityResult['confidence'] = isCustomUserMeasurement ? 'high' : 'medium';

  if (selectedEvaluation.score >= 90) {
    fitStatus = 'perfect_match';
    fitHeadline = `Varian ${selectedEvaluation.garment.sizeLabel} Sangat Presisi`;
  } else if (selectedEvaluation.score >= 70) {
    fitStatus = 'good_fit';
    fitHeadline = `Varian ${selectedEvaluation.garment.sizeLabel} Direkomendasikan`;
  } else {
    fitStatus = selectedEvaluation.criticalMismatch ? 'size_up' : 'loose_fit';
    fitHeadline = selectedEvaluation.criticalMismatch ? `Perlu Naik 1 Ukuran (${selectedEvaluation.garment.sizeLabel} Cenderung Ketat)` : `Varian ${selectedEvaluation.garment.sizeLabel} Cukup Longgar`;
  }

  const standardNote = !isCustomUserMeasurement 
    ? ' Dihitung berdasarkan standar ukuran umum (atur cm di profil untuk estimasi akurat).' 
    : ' Estimasi kelonggaran sesuai dengan preferensi tubuh Anda.';

  const summaryExplanation = `Tingkat kecocokan potongan pakaian ini mencapai ${selectedEvaluation.score}%.${standardNote}`;

  return {
    recommendedSize: selectedEvaluation.garment.sizeLabel,
    overallScore: selectedEvaluation.score,
    fitStatus,
    confidence,
    fitHeadline,
    summaryExplanation,
    detailedChecks: selectedEvaluation.checks,
    disclaimer: defaultDisclaimer
  };
}

/**
 * Compares two garments side by side against user measurements
 */
export function compareTwoGarments(
  itemA: { product: UMKMProductPost; sizeLabel: string },
  itemB: { product: UMKMProductPost; sizeLabel: string },
  userMeasurements?: BodyMeasurements | null
) {
  const resultA = calculateSizeCompatibility(itemA.product, userMeasurements, itemA.sizeLabel);
  const resultB = calculateSizeCompatibility(itemB.product, userMeasurements, itemB.sizeLabel);

  const garmentSizeA = itemA.product.availableSizes.find(s => s.sizeLabel.toLowerCase() === itemA.sizeLabel.toLowerCase()) || itemA.product.availableSizes[0];
  const garmentSizeB = itemB.product.availableSizes.find(s => s.sizeLabel.toLowerCase() === itemB.sizeLabel.toLowerCase()) || itemB.product.availableSizes[0];

  return {
    itemA: {
      product: itemA.product,
      sizeLabel: itemA.sizeLabel,
      garmentSize: garmentSizeA,
      result: resultA
    },
    itemB: {
      product: itemB.product,
      sizeLabel: itemB.sizeLabel,
      garmentSize: garmentSizeB,
      result: resultB
    },
    betterMatch: resultA.overallScore >= resultB.overallScore ? 'A' : 'B'
  };
}
