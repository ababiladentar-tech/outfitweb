'use client';

import React, { useState } from 'react';
import { UMKMProductPost, BodyMeasurements } from '@/types';
import { OFTEA_POSTS } from '@/data/umkm-products';
import { calculateSizeCompatibility } from '@/lib/sizing-engine';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Bookmark,
  Maximize2,
  Share2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Ruler,
  ShieldCheck,
  ShieldAlert,
  ArrowRightLeft,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ProductDetailModalProps {
  product: UMKMProductPost | null;
  onClose: () => void;
  onSelectRelated: (product: UMKMProductPost) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onShowToast?: (text: string) => void;
  userMeasurements?: BodyMeasurements | null;
  onOpenSmartSize?: () => void;
  onOpenComparison?: (product: UMKMProductPost) => void;
  onOpenCheckout?: (product: UMKMProductPost) => void;
  onOpenReport?: (product: UMKMProductPost) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectRelated,
  isSaved,
  onToggleSave,
  onShowToast,
  userMeasurements,
  onOpenSmartSize,
  onOpenComparison,
  onOpenCheckout,
  onOpenReport
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(product?.likes || 120);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  if (!product) return null;

  const currentSizeObj = product.availableSizes[selectedSizeIndex] || product.availableSizes[0];
  const fitAnalysis = calculateSizeCompatibility(product, userMeasurements, currentSizeObj?.sizeLabel);
  const relatedProducts = OFTEA_POSTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleVisitSite = () => {
    const text = `Halo Admin ${product.sellerName}! Saya menemukan produk "${product.title}" (Rp ${product.price.toLocaleString('id-ID')}) di aplikasi Outfitly. Apakah ukuran ${currentSizeObj?.sizeLabel || 'ini'} ready stock?`;
    const url = `https://wa.me/${product.sellerContact}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, text: product.description, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      if (onShowToast) {
        onShowToast('Link produk berhasil disalin!');
      }
    }
  };

  const conditionLabels: Record<string, { label: string; badgeColor: string }> = {
    new: { label: 'Brand New (Baru)', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    like_new: { label: 'Like New (99% Mulus)', badgeColor: 'bg-teal-100 text-teal-800 border-teal-300' },
    very_good: { label: 'Very Good (Terawat)', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
    good: { label: 'Good (Pemakaian Wajar)', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
    has_defects: { label: 'Has Defects (Ada Defek)', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' }
  };

  const currentCondition = conditionLabels[product.condition] || conditionLabels.new;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#EFEFEA]/95 backdrop-blur-xs p-4 sm:p-6 lg:p-10 flex flex-col justify-between animate-fadeIn">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white text-[#162D24] flex items-center justify-center hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentCondition.badgeColor}`}>
              {currentCondition.label}
            </span>

            <span className="text-xs font-bold text-[#162D24] px-3.5 py-1 rounded-full bg-white shadow-2xs border border-neutral-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{product.sellerName} • {product.sellerCity}</span>
            </span>

            {onOpenReport && (
              <button
                onClick={() => onOpenReport(product)}
                className="p-2 rounded-full bg-white hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Laporkan Listing"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Product Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Product Image (5 cols) */}
          <div className="lg:col-span-5 relative bg-white rounded-3xl overflow-hidden shadow-lg aspect-3/4 group">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            />
            {product.isOneOfAKind && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold rounded-full">
                ★ 1-of-a-kind (Hanya 1 Pcs)
              </div>
            )}
            <button
              onClick={() => window.open(product.imageUrl, '_blank')}
              className="absolute bottom-4 right-4 w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-[#162D24] flex items-center justify-center shadow-md cursor-pointer transition-all"
              title="Perbesar Gambar"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Details & Actions (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
            {/* Top Row: Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-[#162D24]">
                <button
                  onClick={() => {
                    setLiked(!liked);
                    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
                  }}
                  className="hover:scale-110 transition-transform cursor-pointer"
                  title="Suka Outfit Ini"
                >
                  <Heart className={`w-6 h-6 ${liked ? 'fill-rose-600 text-rose-600' : ''}`} />
                </button>

                <button
                  onClick={handleVisitSite}
                  className="hover:scale-110 transition-transform cursor-pointer"
                  title="Tanya Penjual via WhatsApp"
                >
                  <MessageSquare className="w-6 h-6" />
                </button>

                <button
                  onClick={() => onToggleSave(product.id)}
                  className="hover:scale-110 transition-transform cursor-pointer"
                  title="Bookmark"
                >
                  <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-[#162D24] text-[#162D24]' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="hover:scale-110 transition-transform cursor-pointer text-neutral-600 hover:text-[#162D24]"
                  title="Bagikan"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onOpenComparison && (
                  <button
                    onClick={() => onOpenComparison(product)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#FAF9F5] hover:bg-[#EFECE6] text-[#162D24] border border-[#162D24] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#2D5A47]" />
                    <span>Bandingkan Ukuran</span>
                  </button>
                )}

                <button
                  onClick={() => onToggleSave(product.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isSaved
                      ? 'bg-[#162D24] text-white ring-2 ring-[#8EA89D]'
                      : 'bg-[#1E3A2F] hover:bg-[#162D24] text-white'
                  }`}
                >
                  {isSaved ? 'Saved ✓' : 'Save Outfit'}
                </button>
              </div>
            </div>

            {/* Title & Price */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#EFEFEA] text-[10px] font-bold text-[#162D24] uppercase tracking-wider">
                  {product.sellerType === 'community_preloved' ? 'Preloved Komunitas' : 'UMKM Lokal'}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#EFEFEA] text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                  Kategori: {product.category.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#EFEFEA] text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                  Gaya: {product.style}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#162D24] tracking-tight font-sans">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-[#162D24] font-extrabold text-2xl sm:text-3xl">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                {product.originalPrice && (
                  <span className="text-xs sm:text-sm text-neutral-400 line-through">
                    Rp {product.originalPrice.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>

            {/* Secondhand Disclosure (if preloved) */}
            {product.sellerType === 'community_preloved' && (
              <div className="p-4 rounded-2xl bg-[#FFF8E6] border border-[#F0DFB0] space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Info className="w-4 h-4" />
                  <span>Detail Kondisi Secondhand (Keterbukaan Penjual):</span>
                </div>
                {product.usageDuration && (
                  <p className="text-neutral-700"><strong>Riwayat:</strong> {product.usageDuration}</p>
                )}
                {product.defectNotes && (
                  <p className="text-neutral-700"><strong>Catatan Defek:</strong> {product.defectNotes}</p>
                )}
              </div>
            )}

            {/* Smart Size Compatibility Engine Breakdown */}
            <div className="p-5 rounded-2xl bg-[#EAF2EE] border border-[#BFD9CD] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#162D24]">
                  <Ruler className="w-4 h-4 text-[#2D5A47]" />
                  <span>Kesesuaian Ukuran: Varian {currentSizeObj?.sizeLabel}</span>
                </div>
                {product.category === 'shoes' ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-800 text-emerald-100">
                    Insole: {currentSizeObj?.garmentLengthCm || 24.5} cm
                  </span>
                ) : product.category === 'bag' ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-800 text-emerald-100">
                    Kapasitas: {currentSizeObj?.sizeLabel || 'All Size'}
                  </span>
                ) : userMeasurements?.chestBustCm ? (
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                    fitAnalysis.overallScore >= 80 ? 'bg-emerald-800 text-emerald-100' : 'bg-amber-800 text-amber-100'
                  }`}>
                    {fitAnalysis.overallScore}% Sesuai
                  </span>
                ) : (
                  <button
                    onClick={onOpenSmartSize}
                    className="text-xs font-semibold text-[#162D24] underline hover:text-[#2D5A47] cursor-pointer"
                  >
                    Atur Ukuran Tubuh (CM)
                  </button>
                )}
              </div>

              <div className="text-xs text-neutral-800 font-semibold">
                {product.category === 'shoes'
                  ? `Varian ${currentSizeObj?.sizeLabel} • Insole ${currentSizeObj?.garmentLengthCm || 24.5} cm`
                  : product.category === 'bag'
                  ? `Varian ${currentSizeObj?.sizeLabel} • Kapasitas Proporsional`
                  : fitAnalysis.fitHeadline}
              </div>

              <p className="text-[11px] text-neutral-600 leading-relaxed">
                {product.category === 'shoes'
                  ? `Panjang insole telapak kaki ${currentSizeObj?.garmentLengthCm || 24.5} cm. Disarankan mengukur panjang telapak kaki Anda untuk memastikan sisa ruang jemari 0.5–1 cm.`
                  : product.category === 'bag'
                  ? (product.measurementMethod || 'Dimensi tas dirancang ergonomis untuk memuat perlengkapan harian secara rapi.')
                  : fitAnalysis.summaryExplanation}
              </p>

              {fitAnalysis.detailedChecks.length > 0 && product.category !== 'shoes' && product.category !== 'bag' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {fitAnalysis.detailedChecks.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/90 border border-[#D0E2D9] text-[10px] space-y-0.5">
                      <div className="flex justify-between font-bold text-[#162D24]">
                        <span>Bagian {c.part}:</span>
                        <span className={c.status === 'ideal' ? 'text-emerald-700' : 'text-amber-700'}>
                          {c.garmentMeasurementCm ? `${c.garmentMeasurementCm} cm` : 'N/A'}
                        </span>
                      </div>
                      <p className="text-neutral-600">{c.note}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[9px] text-neutral-500 italic pt-1">
                {product.category === 'shoes' 
                  ? 'Ukuran insole dihitung mendatar dari tumit belakang hingga ujung ibu jari kaki.'
                  : product.category === 'bag'
                  ? 'Dimensi dihitung dalam sentimeter (cm) dengan toleransi jahitan pengrajin ±1 cm.'
                  : fitAnalysis.disclaimer}
              </p>
            </div>

            {/* Size Selector & Garment Measurement Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#162D24]">Pilih Varian Ukuran:</label>
                {product.measurementMethod && (
                  <span className="text-[10px] text-neutral-400">{product.measurementMethod}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((s, idx) => (
                  <button
                    key={s.sizeLabel}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedSizeIndex === idx
                        ? 'bg-[#162D24] text-white shadow-xs'
                        : 'bg-[#FAF9F5] text-[#162D24] border border-[#DCDAD2] hover:bg-[#EAE6DC]'
                    }`}
                  >
                    {s.sizeLabel}
                  </button>
                ))}
              </div>

              {/* Table of garment CM measurements */}
              <div className="overflow-x-auto rounded-xl border border-[#DCDAD2]">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-[#FAF9F5] text-neutral-600 border-b border-[#DCDAD2]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Varian</th>
                      {product.category === 'shoes' ? (
                        <>
                          <th className="py-2.5 px-3 font-semibold">Panjang Insole</th>
                          <th className="py-2.5 px-3 font-semibold">Toleransi</th>
                          <th className="py-2.5 px-3 font-semibold">Profil Sol</th>
                        </>
                      ) : product.category === 'bag' ? (
                        <>
                          <th className="py-2.5 px-3 font-semibold">Tinggi / Dimensi</th>
                          <th className="py-2.5 px-3 font-semibold">Material</th>
                          <th className="py-2.5 px-3 font-semibold">Kapasitas</th>
                        </>
                      ) : product.category === 'jeans' || product.category === 'pants' || product.category === 'skirt' ? (
                        <>
                          <th className="py-2.5 px-3 font-semibold">Pinggang (LP)</th>
                          <th className="py-2.5 px-3 font-semibold">Pinggul</th>
                          <th className="py-2.5 px-3 font-semibold">Paha</th>
                          <th className="py-2.5 px-3 font-semibold">Panjang</th>
                        </>
                      ) : (
                        <>
                          <th className="py-2.5 px-3 font-semibold">Dada (LD)</th>
                          <th className="py-2.5 px-3 font-semibold">Pinggang (LP)</th>
                          <th className="py-2.5 px-3 font-semibold">Bahu</th>
                          <th className="py-2.5 px-3 font-semibold">Panjang</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {product.availableSizes.map((s, idx) => (
                      <tr 
                        key={s.sizeLabel} 
                        onClick={() => setSelectedSizeIndex(idx)}
                        className={`cursor-pointer transition-colors ${selectedSizeIndex === idx ? 'bg-[#EAF2EE] font-bold text-[#162D24]' : 'hover:bg-[#FAF9F5]'}`}
                      >
                        <td className="py-2 px-3">{s.sizeLabel}</td>
                        {product.category === 'shoes' ? (
                          <>
                            <td className="py-2 px-3 font-bold text-[#162D24]">{s.garmentLengthCm ? `${s.garmentLengthCm} cm` : '-'}</td>
                            <td className="py-2 px-3">±{product.measurementToleranceCm || 0.5} cm</td>
                            <td className="py-2 px-3">{product.material?.includes('Sole') ? 'Lug Phylon / Karet' : 'Sol Nyaman'}</td>
                          </>
                        ) : product.category === 'bag' ? (
                          <>
                            <td className="py-2 px-3 font-bold text-[#162D24]">{s.garmentLengthCm ? `${s.garmentLengthCm} cm` : 'Proporsi Standar'}</td>
                            <td className="py-2 px-3 truncate max-w-[150px]">{product.material || 'Kulit / Kanvas'}</td>
                            <td className="py-2 px-3">Kompartemen Lapang</td>
                          </>
                        ) : product.category === 'jeans' || product.category === 'pants' || product.category === 'skirt' ? (
                          <>
                            <td className="py-2 px-3">{s.waistCm ? `${s.waistCm} cm` : '-'}</td>
                            <td className="py-2 px-3">{s.hipsCm ? `${s.hipsCm} cm` : '-'}</td>
                            <td className="py-2 px-3">{s.thighCm ? `${s.thighCm} cm` : '-'}</td>
                            <td className="py-2 px-3">{s.garmentLengthCm ? `${s.garmentLengthCm} cm` : '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-3">{s.chestBustCm ? `${s.chestBustCm} cm` : '-'}</td>
                            <td className="py-2 px-3">{s.waistCm ? `${s.waistCm} cm` : '-'}</td>
                            <td className="py-2 px-3">{s.shoulderWidthCm ? `${s.shoulderWidthCm} cm` : '-'}</td>
                            <td className="py-2 px-3">{s.garmentLengthCm ? `${s.garmentLengthCm} cm` : '-'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-1 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {onOpenCheckout && (
                <button
                  onClick={() => onOpenCheckout(product)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#162D24] hover:bg-[#203D31] text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#8EA89D]" />
                  <span>Beli Sekarang (Garansi Escrow)</span>
                </button>
              )}

              <button
                onClick={handleVisitSite}
                className="py-4 px-6 rounded-2xl bg-[#FAF9F5] hover:bg-[#EFECE6] border border-[#162D24] text-[#162D24] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#162D24]" />
                <span>Chat Penjual</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-bold text-[#162D24] font-sans">
              Rekomendasi Pilihan Terkait Lainnya
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col group hover:-translate-y-0.5"
                >
                  <div className="aspect-3/4 overflow-hidden bg-neutral-100">
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-[#162D24] truncate">{rel.title}</h4>
                    <p className="text-[11px] text-neutral-500 font-semibold">Rp {rel.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
