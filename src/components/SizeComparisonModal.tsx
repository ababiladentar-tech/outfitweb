'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Ruler, CheckCircle2, ChevronDown, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { UMKMProductPost, BodyMeasurements, GarmentMeasurement } from '@/types';
import { calculateSizeCompatibility } from '@/lib/sizing-engine';

export type SizingCategoryGroup = 'footwear' | 'bags' | 'bottoms' | 'apparel';

export function getCategoryGroup(category: string = ''): SizingCategoryGroup {
  const c = category.toLowerCase().trim();
  if (c === 'shoes' || c.includes('shoe') || c.includes('sepatu') || c.includes('loafer') || c.includes('sneaker') || c.includes('sandal')) {
    return 'footwear';
  }
  if (c === 'bag' || c.includes('bag') || c.includes('tas')) {
    return 'bags';
  }
  if (c === 'jeans' || c === 'pants' || c === 'skirt' || c.includes('celana') || c.includes('rok') || c.includes('bawahan')) {
    return 'bottoms';
  }
  return 'apparel';
}

export function getCategoryGroupTitle(group: SizingCategoryGroup): string {
  switch (group) {
    case 'footwear': return 'Sepatu & Alas Kaki';
    case 'bags': return 'Tas & Aksesoris';
    case 'bottoms': return 'Bawahan (Celana / Rok)';
    case 'apparel': return 'Pakaian & Atasan';
  }
}

// Extract concise size label (e.g., "EU 38" from "EU 38 (Insole 24.0 cm)")
function getCleanSizePill(label: string): string {
  if (!label) return 'All Size';
  const clean = label.trim();
  const match = clean.match(/^(EU\s*\d+|Size\s*\w+|\d+|XS|S|M|L|XL|XXL|All\s*Size)/i);
  if (match) return match[1].trim();
  return clean.split('(')[0].trim() || clean;
}

interface SizeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  productA: UMKMProductPost | null;
  allProducts: UMKMProductPost[];
  userMeasurements?: BodyMeasurements | null;
  onOpenSmartSize: () => void;
  onSelectProduct: (product: UMKMProductPost) => void;
}

export const SizeComparisonModal: React.FC<SizeComparisonModalProps> = ({
  isOpen,
  onClose,
  productA,
  allProducts,
  userMeasurements,
  onOpenSmartSize,
  onSelectProduct
}) => {
  const [selectedProductBId, setSelectedProductBId] = useState<string>('');
  const [selectedSizeLabelA, setSelectedSizeLabelA] = useState<string>('');
  const [selectedSizeLabelB, setSelectedSizeLabelB] = useState<string>('');

  const groupA = productA ? getCategoryGroup(productA.category) : 'apparel';
  const groupTitle = getCategoryGroupTitle(groupA);

  // Compatible items strictly within the same sizing category group
  const compatibleProducts = allProducts.filter(
    (p) => p.id !== productA?.id && getCategoryGroup(p.category) === groupA
  );

  useEffect(() => {
    if (productA) {
      setSelectedSizeLabelA(productA.availableSizes[0]?.sizeLabel || 'S');
      const currentGroup = getCategoryGroup(productA.category);
      const compatible = allProducts.filter(
        (p) => p.id !== productA.id && getCategoryGroup(p.category) === currentGroup
      );

      if (compatible.length > 0) {
        setSelectedProductBId(compatible[0].id);
        setSelectedSizeLabelB(compatible[0].availableSizes[0]?.sizeLabel || 'M');
      } else {
        setSelectedProductBId(productA.id);
        const secondSize = productA.availableSizes[1] || productA.availableSizes[0];
        setSelectedSizeLabelB(secondSize?.sizeLabel || productA.availableSizes[0]?.sizeLabel || 'M');
      }
    }
  }, [productA, allProducts]);

  if (!isOpen || !productA) return null;

  const isComparingSelfSizes = selectedProductBId === productA.id;
  const productB = isComparingSelfSizes
    ? productA
    : (allProducts.find((p) => p.id === selectedProductBId && getCategoryGroup(p.category) === groupA) ||
       compatibleProducts[0] ||
       productA);

  const sizeChartA = productA.availableSizes.find((s) => s.sizeLabel === selectedSizeLabelA) || productA.availableSizes[0];
  const sizeChartB = productB.availableSizes.find((s) => s.sizeLabel === selectedSizeLabelB) || productB.availableSizes[0];

  const fitA = calculateSizeCompatibility(productA, userMeasurements, selectedSizeLabelA);
  const fitB = calculateSizeCompatibility(productB, userMeasurements, selectedSizeLabelB);

  // Side-by-side comparison specification rows
  const getComparisonRows = () => {
    if (groupA === 'footwear') {
      return [
        {
          param: 'Panjang Insole',
          valA: sizeChartA?.garmentLengthCm ? `${sizeChartA.garmentLengthCm} cm` : '24 cm',
          valB: sizeChartB?.garmentLengthCm ? `${sizeChartB.garmentLengthCm} cm` : '24 cm',
          highlight: true
        },
        {
          param: 'Material & Sol',
          valA: productA.material || 'Vegan Leather & Sol Phylon',
          valB: productB.material || 'Heavy Canvas 12oz & Karet Vulkanisir',
          highlight: false
        },
        {
          param: 'Karakter Bantalan',
          valA: productA.category === 'shoes' && productA.title.includes('Loafer') ? 'Memory Foam Lug Sole (Kokoh)' : 'Bantalan Kasual Ringan',
          valB: productB.category === 'shoes' && productB.title.includes('Sneaker') ? 'Insole Berkontur Anatomi (Lentur)' : 'Sol Fleksibel Harian',
          highlight: false
        },
        {
          param: 'Toleransi Fitting',
          valA: `±${productA.measurementToleranceCm || 0.5} cm`,
          valB: `±${productB.measurementToleranceCm || 0.5} cm`,
          highlight: false
        },
        {
          param: 'Metode Pengukuran',
          valA: productA.measurementMethod || 'Insole telapak kaki dari tumit ke jemari',
          valB: productB.measurementMethod || 'Insole telapak kaki dari tumit ke jemari',
          highlight: false
        }
      ];
    }

    if (groupA === 'bags') {
      return [
        {
          param: 'Dimensi / Tinggi',
          valA: sizeChartA?.garmentLengthCm ? `${sizeChartA.garmentLengthCm} cm` : '30 cm',
          valB: sizeChartB?.garmentLengthCm ? `${sizeChartB.garmentLengthCm} cm` : '32 cm',
          highlight: true
        },
        {
          param: 'Kapasitas Muat',
          valA: productA.style === 'formal' ? 'Dompet, organizer, payung lipat, tablet' : 'Laptop 14", buku catatan, payung lipat',
          valB: productB.style === 'formal' ? 'Dompet panjang, smartphone, makeup pouch' : 'Kompartemen lapang belanja / kuliah',
          highlight: false
        },
        {
          param: 'Bahan Utama',
          valA: productA.material || 'Kulit Nabati Pull-Up Yogyakarta',
          valB: productB.material || 'Katun Kanvas Alami & Kulit',
          highlight: false
        },
        {
          param: 'Metode Pengukuran',
          valA: productA.measurementMethod || 'Dimensi tas dalam kondisi terisi',
          valB: productB.measurementMethod || 'Dimensi tas diukur datar (flat-lay)',
          highlight: false
        }
      ];
    }

    if (groupA === 'bottoms') {
      return [
        {
          param: 'Lingkar Pinggang',
          valA: sizeChartA?.waistCm ? `${sizeChartA.waistCm} cm` : 'N/A',
          valB: sizeChartB?.waistCm ? `${sizeChartB.waistCm} cm` : 'N/A',
          highlight: true
        },
        {
          param: 'Lingkar Pinggul',
          valA: sizeChartA?.hipsCm ? `${sizeChartA.hipsCm} cm` : 'N/A',
          valB: sizeChartB?.hipsCm ? `${sizeChartB.hipsCm} cm` : 'N/A',
          highlight: false
        },
        {
          param: 'Lingkar Paha',
          valA: sizeChartA?.thighCm ? `${sizeChartA.thighCm} cm` : 'N/A',
          valB: sizeChartB?.thighCm ? `${sizeChartB.thighCm} cm` : 'N/A',
          highlight: false
        },
        {
          param: 'Panjang Celana',
          valA: sizeChartA?.garmentLengthCm ? `${sizeChartA.garmentLengthCm} cm` : 'N/A',
          valB: sizeChartB?.garmentLengthCm ? `${sizeChartB.garmentLengthCm} cm` : 'N/A',
          highlight: false
        },
        {
          param: 'Karakter Bahan',
          valA: productA.material || 'Non-stretch Denim',
          valB: productB.material || 'Cotton Twill Stretch',
          highlight: false
        }
      ];
    }

    // Default: Apparel (Tops, Outerwear, Dresses)
    return [
      {
        param: 'Lingkar Dada (LD)',
        valA: sizeChartA?.chestBustCm ? `${sizeChartA.chestBustCm} cm` : 'N/A',
        valB: sizeChartB?.chestBustCm ? `${sizeChartB.chestBustCm} cm` : 'N/A',
        highlight: true
      },
      {
        param: 'Lingkar Pinggang (LP)',
        valA: sizeChartA?.waistCm ? `${sizeChartA.waistCm} cm` : 'N/A',
        valB: sizeChartB?.waistCm ? `${sizeChartB.waistCm} cm` : 'N/A',
        highlight: false
      },
      {
        param: 'Lebar Bahu',
        valA: sizeChartA?.shoulderWidthCm ? `${sizeChartA.shoulderWidthCm} cm` : 'N/A',
        valB: sizeChartB?.shoulderWidthCm ? `${sizeChartB.shoulderWidthCm} cm` : 'N/A',
        highlight: false
      },
      {
        param: 'Panjang Baju',
        valA: sizeChartA?.garmentLengthCm ? `${sizeChartA.garmentLengthCm} cm` : 'N/A',
        valB: sizeChartB?.garmentLengthCm ? `${sizeChartB.garmentLengthCm} cm` : 'N/A',
        highlight: false
      },
      {
        param: 'Potongan (Siluet)',
        valA: `Fit ${productA.fitType || 'Regular'}`,
        valB: `Fit ${productB.fitType || 'Regular'}`,
        highlight: false
      }
    ];
  };

  const comparisonRows = getComparisonRows();

  // Natural editorial advice note (written like a senior stylist, without robotic run-on sentences)
  const renderEditorialAdvice = () => {
    if (groupA === 'footwear') {
      const insoleA = sizeChartA?.garmentLengthCm || 24;
      const insoleB = sizeChartB?.garmentLengthCm || 24;
      return (
        <div className="space-y-1.5 text-xs text-neutral-700 leading-relaxed">
          <p>
            <strong>{productA.title}</strong> varian {getCleanSizePill(selectedSizeLabelA)} memiliki panjang insole <strong>{insoleA} cm</strong>, sedangkan <strong>{productB.title}</strong> varian {getCleanSizePill(selectedSizeLabelB)} memiliki insole <strong>{insoleB} cm</strong>.
          </p>
          <p className="text-neutral-600">
            Karakter sol loafers lebih kokoh dan berstruktur tegas, cocok untuk gaya formal atau semi-formal rapi. Sneakers kanvas memiliki fleksibilitas sol karet yang lebih lentur untuk mobilitas aktif harian. Pastikan menyisakan ruang 0.5 hingga 1 cm di depan ibu jari agar jemari tidak tertekan saat berjalan.
          </p>
        </div>
      );
    }

    if (groupA === 'bags') {
      return (
        <div className="space-y-1.5 text-xs text-neutral-700 leading-relaxed">
          <p>
            <strong>{productA.title}</strong> dirancang dengan struktur kulit rapi untuk kebutuhan kerja dan pertemuan formal. <strong>{productB.title}</strong> menawarkan kapasitas lebih leluasa untuk membawa laptop dan perlengkapan harian.
          </p>
          <p className="text-neutral-600">
            Pilih berdasarkan bobot barang bawaan rutinmu: tas kulit berstruktur untuk kesan profesional, atau tote bag kanvas untuk fleksibilitas ruang ekstra.
          </p>
        </div>
      );
    }

    if (groupA === 'bottoms') {
      const diffWaist = Math.abs((sizeChartA?.waistCm || 0) - (sizeChartB?.waistCm || 0));
      return (
        <div className="space-y-1.5 text-xs text-neutral-700 leading-relaxed">
          <p>
            Perbedaan lingkar pinggang kedua varian adalah <strong>{diffWaist} cm</strong> ({getCleanSizePill(selectedSizeLabelA)}: {sizeChartA?.waistCm || '-'} cm vs {getCleanSizePill(selectedSizeLabelB)}: {sizeChartB?.waistCm || '-'} cm).
          </p>
          <p className="text-neutral-600">
            {userMeasurements?.waistCm ? (
              `Dengan lingkar pinggangmu ${userMeasurements.waistCm} cm, pilih ukuran yang menyisakan kelonggaran 2 sampai 4 cm untuk kenyamanan bernapas dan duduk dalam waktu lama.`
            ) : (
              'Bahan non-stretch denim membutuhkan kelonggaran 2–3 cm lebih banyak dibanding katun twill stretch agar tetap nyaman saat bergerak aktif.'
            )}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 text-xs text-neutral-700 leading-relaxed">
        <p>
          {fitA.overallScore >= fitB.overallScore ? (
            <>
              <strong>{productA.title} ({getCleanSizePill(selectedSizeLabelA)})</strong> memberikan proporsi siluet yang lebih pas dengan lingkar tubuhmu (+{fitA.overallScore - fitB.overallScore}% lebih presisi dibanding Item B).
            </>
          ) : (
            <>
              <strong>{productB.title} ({getCleanSizePill(selectedSizeLabelB)})</strong> memberikan proporsi siluet yang lebih pas dengan lingkar tubuhmu (+{fitB.overallScore - fitA.overallScore}% lebih presisi dibanding Item A).
            </>
          )}
        </p>
        <p className="text-neutral-600">
          Perhatikan selisih lingkar dada saat memilih atasan: potongan relaxed memberikan ruang gerak leluasa, sedangkan potongan regular mempertegas garis pundak dan pinggang secara proporsional.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#FAF9F5] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Editorial Clean Header */}
        <div className="bg-[#162D24] text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-[#254637]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] flex items-center justify-center text-[#162D24] shrink-0 font-bold">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold tracking-tight text-white">
                  Komparasi Ukuran Fisik
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#254637] text-neutral-200 border border-[#35614D]">
                  {groupTitle}
                </span>
              </div>
              <p className="text-[11px] text-[#A3BFB2]">
                Perbandingan dimensi nyata dalam sentimeter untuk kepastian ukuran sebelum membeli
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Fitting Reference Line */}
        <div className="px-5 sm:px-7 py-2.5 bg-[#F2F0E8] border-b border-[#E0DCCF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#162D24]">
          <div className="flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-[#2D5A47] shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {groupA === 'footwear' ? (
                <><strong>Panduan Ukuran Sepatu:</strong> Panjang insole diukur dari tumit ke ujung jari terpanjang.</>
              ) : groupA === 'bags' ? (
                <><strong>Panduan Dimensi Tas:</strong> Pengukuran proporsi kompartemen dalam sentimeter (cm).</>
              ) : groupA === 'bottoms' ? (
                <>
                  <strong>Ukuran Tubuh:</strong>{' '}
                  {userMeasurements?.waistCm ? (
                    <>Pinggang: <strong>{userMeasurements.waistCm}cm</strong> | Pinggul: <strong>{userMeasurements.hipsCm || 96}cm</strong></>
                  ) : (
                    <span className="text-neutral-500">Standar estimasi proporsi tubuh</span>
                  )}
                </>
              ) : (
                <>
                  <strong>Ukuran Tubuh:</strong>{' '}
                  {userMeasurements?.chestBustCm ? (
                    <>Dada: <strong>{userMeasurements.chestBustCm}cm</strong> | Pinggang: <strong>{userMeasurements.waistCm}cm</strong> | Fit: <strong className="capitalize">{userMeasurements.preferredFit}</strong></>
                  ) : (
                    <span className="text-neutral-500">Standar estimasi proporsi tubuh</span>
                  )}
                </>
              )}
            </span>
          </div>

          {(groupA === 'apparel' || groupA === 'bottoms') && (
            <button
              onClick={onOpenSmartSize}
              className="text-[11px] font-semibold text-[#162D24] underline hover:text-[#2D5A47] cursor-pointer"
            >
              Ubah Ukuran Tubuh
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-[#162D24]">
          {/* Top Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Item A Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#162D24]/30 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#162D24] bg-[#EAE8E0] px-2.5 py-0.5 rounded-md">
                    Item A (Utama)
                  </span>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {productA.sellerType === 'community_preloved' ? 'Preloved Komunitas' : 'Brand UMKM'}
                  </span>
                </div>

                <div className="flex gap-3.5 items-center mb-4">
                  <img
                    src={productA.imageUrl}
                    alt={productA.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E8E4D9] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-sm text-[#162D24] truncate">{productA.title}</h3>
                    <p className="text-[11px] text-neutral-500 truncate">{productA.sellerName} • {productA.sellerCity}</p>
                    <p className="text-xs sm:text-sm font-bold text-[#162D24] mt-0.5">
                      Rp {productA.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Clean Size Selector A */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold block text-neutral-600">Pilih Varian Ukuran:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {productA.availableSizes.map((s) => {
                      const cleanLabel = getCleanSizePill(s.sizeLabel);
                      const isSelected = selectedSizeLabelA === s.sizeLabel;
                      return (
                        <button
                          key={s.sizeLabel}
                          onClick={() => setSelectedSizeLabelA(s.sizeLabel)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#162D24] text-white shadow-2xs'
                              : 'bg-[#F4F1EA] text-[#162D24] hover:bg-[#EBE7DD]'
                          }`}
                        >
                          {cleanLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectProduct(productA);
                  onClose();
                }}
                className="w-full py-2 bg-[#162D24] hover:bg-[#203D31] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Detail Item A</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Item B Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8D2C4] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#634832] bg-[#FAF0E6] px-2.5 py-0.5 rounded-md shrink-0">
                    Item B (Pembanding)
                  </span>

                  {/* Switch Product Dropdown */}
                  <select
                    value={selectedProductBId}
                    onChange={(e) => {
                      setSelectedProductBId(e.target.value);
                      const target = e.target.value === productA.id
                        ? productA
                        : allProducts.find((p) => p.id === e.target.value);
                      if (target && target.availableSizes[0]) {
                        const defaultSize = e.target.value === productA.id && target.availableSizes[1]
                          ? target.availableSizes[1].sizeLabel
                          : target.availableSizes[0].sizeLabel;
                        setSelectedSizeLabelB(defaultSize);
                      }
                    }}
                    className="text-[11px] font-medium bg-[#FAF9F5] border border-[#DDD8CC] rounded-lg px-2 py-1 text-[#162D24] max-w-[210px] truncate cursor-pointer"
                  >
                    {compatibleProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title.length > 26 ? p.title.slice(0, 26) + '...' : p.title}
                      </option>
                    ))}
                    {compatibleProducts.length === 0 && (
                      <option value={productA.id}>Bandingkan Ukuran Lain Item A</option>
                    )}
                  </select>
                </div>

                <div className="flex gap-3.5 items-center mb-4">
                  <img
                    src={productB.imageUrl}
                    alt={productB.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E8E4D9] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-sm text-[#162D24] truncate">{productB.title}</h3>
                    <p className="text-[11px] text-neutral-500 truncate">{productB.sellerName} • {productB.sellerCity}</p>
                    <p className="text-xs sm:text-sm font-bold text-[#162D24] mt-0.5">
                      Rp {productB.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Clean Size Selector B */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold block text-neutral-600">Pilih Varian Ukuran:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {productB.availableSizes.map((s) => {
                      const cleanLabel = getCleanSizePill(s.sizeLabel);
                      const isSelected = selectedSizeLabelB === s.sizeLabel;
                      return (
                        <button
                          key={s.sizeLabel}
                          onClick={() => setSelectedSizeLabelB(s.sizeLabel)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#162D24] text-white shadow-2xs'
                              : 'bg-[#F4F1EA] text-[#162D24] hover:bg-[#EBE7DD]'
                          }`}
                        >
                          {cleanLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectProduct(productB);
                  onClose();
                }}
                className="w-full py-2 bg-white hover:bg-[#FAF9F5] text-[#162D24] border border-[#162D24]/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Detail Item B</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Side-by-Side Unified Comparison Table */}
          <div className="bg-white rounded-2xl border border-[#D8D2C4] overflow-hidden shadow-xs">
            <div className="px-5 py-3 bg-[#F7F5EE] border-b border-[#E0DCCF] flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-[#162D24] uppercase tracking-wide">
                Tabel Komparasi Dimensi Spesifik
              </span>
              <span className="text-[10px] text-neutral-500">
                Satuan: Sentimeter (cm)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F5] text-neutral-500 border-b border-neutral-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold w-1/3">Parameter</th>
                    <th className="py-2.5 px-4 font-semibold w-1/3 text-[#162D24]">
                      Item A: {getCleanSizePill(selectedSizeLabelA)}
                    </th>
                    <th className="py-2.5 px-4 font-semibold w-1/3 text-[#162D24]">
                      Item B: {getCleanSizePill(selectedSizeLabelB)}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className={row.highlight ? 'bg-[#FAF8F2] font-semibold' : 'hover:bg-[#FAF9F5]'}>
                      <td className="py-2.5 px-4 text-neutral-600 font-medium">
                        {row.param}
                      </td>
                      <td className={`py-2.5 px-4 ${row.highlight ? 'text-[#162D24] font-bold text-sm' : 'text-neutral-800'}`}>
                        {row.valA}
                      </td>
                      <td className={`py-2.5 px-4 ${row.highlight ? 'text-[#162D24] font-bold text-sm' : 'text-neutral-800'}`}>
                        {row.valB}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Editorial Takeaway Box (No generic AI sparkles, no ALL CAPS) */}
          <div className="bg-[#FAF9F5] border border-[#DDD8CC] rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#162D24]"></div>
              <h4 className="text-xs font-serif font-bold text-[#162D24] uppercase tracking-wider">
                Catatan Fitting & Rekomendasi Pemakaian
              </h4>
            </div>
            {renderEditorialAdvice()}
          </div>
        </div>
      </div>
    </div>
  );
};
