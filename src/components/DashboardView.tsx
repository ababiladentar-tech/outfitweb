'use client';

import React, { useState, useEffect } from 'react';
import { UserOnboardingProfile, UMKMProductPost, WardrobeItem } from '@/types';
import { OFTEA_POSTS } from '@/data/umkm-products';
import { WardrobeView } from '@/components/WardrobeView';
import { getStoredWardrobe } from '@/data/wardrobe-store';
import { 
  Palette, 
  User, 
  Smile, 
  ArrowRight, 
  CheckCircle2, 
  Ruler, 
  Package, 
  Store,
  SlidersHorizontal,
  MessageSquare,
  Layers,
  Sparkles,
  Shirt
} from 'lucide-react';

interface DashboardViewProps {
  userProfile: UserOnboardingProfile | null;
  username?: string;
  onOpenOnboarding: () => void;
  onSelectProduct: (product: UMKMProductPost) => void;
  onNavigateChat: () => void;
  onNavigateExplore: () => void;
  onOpenSmartSize?: () => void;
  onNavigateOrders?: () => void;
  onNavigateSeller?: () => void;
  onNavigateWardrobe?: () => void;
  onNavigateOutfitBuilder?: () => void;
  onShowToast?: (message: string) => void;
  onSelectWardrobeForStylist?: (items: WardrobeItem[]) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  username,
  onOpenOnboarding,
  onSelectProduct,
  onNavigateChat,
  onNavigateExplore,
  onOpenSmartSize,
  onNavigateOrders,
  onNavigateSeller,
  onNavigateWardrobe,
  onNavigateOutfitBuilder,
  onShowToast,
  onSelectWardrobeForStylist
}) => {
  const [activeTab, setActiveTab] = useState<'style_dna' | 'wardrobe'>('style_dna');
  const [wardrobeCount, setWardrobeCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      setWardrobeCount(getStoredWardrobe().length);
    };
    updateCount();
    window.addEventListener('outfitly_wardrobe_updated', updateCount);
    return () => window.removeEventListener('outfitly_wardrobe_updated', updateCount);
  }, []);
  if (!userProfile) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#EFEFEA] flex items-center justify-center p-4 text-[#162D24]">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-sm border border-[#D8D2C4] text-center space-y-5 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] text-[#162D24] flex items-center justify-center mx-auto border border-[#E5E0D5]">
            <Palette className="w-6 h-6 text-[#2D5A47]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-bold text-[#162D24]">Belum Ada Profil Gaya</h2>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
              Lengkapi preferensi gaya untuk menemukan warna, siluet, dan ukuran sentimeter yang pas untukmu.
            </p>
          </div>
          <button
            onClick={onOpenOnboarding}
            className="w-full py-3 bg-[#162D24] hover:bg-[#203D31] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Mulai Kuesioner Gaya Pribadi
          </button>
        </div>
      </div>
    );
  }

  // Derive personalized recommendations based on profile
  const recommendedItems = OFTEA_POSTS.filter(p => {
    const matchSkin = !p.bestForSkinTones || p.bestForSkinTones.includes(userProfile.skinTone);
    const matchBody = !p.bestForBodyShapes || p.bestForBodyShapes.includes(userProfile.bodyShape);
    return matchSkin || matchBody;
  }).slice(0, 6);

  // Thoughtful, human Indonesian styling palette analysis
  const skinToneData = userProfile.skinTone === 'cool'
    ? { 
        title: 'Cool Undertone (Rona Sejuk Kebiruan)', 
        desc: 'Pembuluh darah cenderung kebiruan atau keunguan di bawah cahaya alami. Rona kulit ini tampak paling segar saat dipadukan dengan spektrum permata dingin, berry tone, dan kontras monokrom bersih.', 
        palette: [
          { name: 'Pure White', hex: '#FDFDFD', role: 'Netral Terang (Kemeja / Inner)' },
          { name: 'Navy Indigo', hex: '#1B2A4A', role: 'Netral Gelap (Outer / Celana)' },
          { name: 'Emerald', hex: '#1B4D3E', role: 'Aksen Utama (Layering)' },
          { name: 'Dusty Rose', hex: '#DCAE96', role: 'Aksen Lembut (Scarf / Blus)' },
          { name: 'Lavender Gray', hex: '#8E8599', role: 'Penyelaras Sekunder' }
        ],
        combinationFormula: 'Kemeja Pure White + Blazer Navy Indigo + Aksen Syal Dusty Rose',
        adviceAvoid: 'Hindari rona mustard kekuningan pekat atau oranye karat yang membuat wajah tampak redup.'
      }
    : userProfile.skinTone === 'warm'
    ? { 
        title: 'Warm Undertone (Rona Hangat Sawo Matang)', 
        desc: 'Pembuluh darah cenderung kehijauan di bawah cahaya alami. Rona sawo matang khas Indonesia memancarkan kehangatan alami saat dipadukan dengan spektrum earth tones, rempah terracotta, dan nuansa ivory lembut.', 
        palette: [
          { name: 'Warm Ivory', hex: '#F7F2E7', role: 'Netral Terang (Kemeja / Inner)' },
          { name: 'Mocha Earth', hex: '#6F4E37', role: 'Netral Gelap (Bawahan / Jaket)' },
          { name: 'Terracotta', hex: '#B85D43', role: 'Aksen Utama (Vest / Outer)' },
          { name: 'Sage Green', hex: '#7D988D', role: 'Harmoni Tropis (Kardigan)' },
          { name: 'Mustard Gold', hex: '#C59B27', role: 'Sentuhan Aksen (Aksesoris)' }
        ],
        combinationFormula: 'Kemeja Warm Ivory + Vest Terracotta + Celana Chino Khaki / Mocha',
        adviceAvoid: 'Hindari rona perak icy atau abu-abu pucat dingin yang kurang menyatu dengan kehangatan rona sawo matang.'
      }
    : { 
        title: 'Neutral Undertone (Rona Netral Seimbang)', 
        desc: 'Fleksibilitas rona seimbang yang serasi dengan spektrum hangat maupun dingin. Spektrum warna dusty, muted earth, dan navy lembut memberikan kesan elegan yang tidak berlebihan.', 
        palette: [
          { name: 'Warm Cream', hex: '#FDFBF7', role: 'Netral Terang (Kemeja / Kaos)' },
          { name: 'Soft Navy', hex: '#2C3E50', role: 'Netral Gelap (Outer / Celana)' },
          { name: 'Olive Sage', hex: '#556B2F', role: 'Aksen Utama (Jaket / Vest)' },
          { name: 'Dusty Rose', hex: '#C08081', role: 'Aksen Lembut (Blus / Syal)' },
          { name: 'Taupe Stone', hex: '#8B8589', role: 'Penyelaras Sekunder' }
        ],
        combinationFormula: 'Kaos Warm Cream + Overshirt Olive Sage + Celana Straight Navy',
        adviceAvoid: 'Hindari warna neon berpendar tajam yang menenggelamkan kelembutan rona netral alami.'
      };

  const hasCustomMeasurements = Boolean(userProfile.measurements?.chestBustCm && userProfile.measurements?.waistCm);

  // Human tailoring silhouette guidance
  const getBodyShapeDetails = () => {
    const shape = (userProfile.bodyShape || '').toLowerCase();
    if (shape.includes('hourglass')) {
      return {
        label: 'Jam Pasir (Hourglass)',
        silhouetteRule: 'Menjaga garis pinggang tetap terdefinisi tanpa membuat siluet tampak terlalu padat.',
        tops: 'Vest tailored, wrap top aksen pinggang, kemeja dengan potongan pinggang ramping.',
        bottoms: 'Celana high-waist wide leg, rok A-line berstruktur, celana chino ankle cut.',
        neckline: 'Kerah open camp collar, V-neck, atau sweetheart neckline.'
      };
    }
    if (shape.includes('pear') || shape.includes('triangle')) {
      return {
        label: 'Segitiga / Pir (Pear)',
        silhouetteRule: 'Memberikan aksen volume pada garis bahu untuk menyeimbangkan lekuk panggul.',
        tops: 'Blazer dengan bantalan bahu ringan, atasan aksen kerah lebar, layering vest denim.',
        bottoms: 'Celana lurus (straight leg), rok midi flowy, jeans potongan relaxed.',
        neckline: 'Kerah bateau (sabrina), wide open collar, atau square neckline.'
      };
    }
    if (shape.includes('inverted_triangle')) {
      return {
        label: 'Segitiga Terbalik (Inverted Triangle)',
        silhouetteRule: 'Melembutkan garis bahu lebar dan menambahkan volume proporsional pada bagian bawah.',
        tops: 'Atasan potongan raglan, kemeja bahan jatuh lemas (silk / rayon), jaket kasual clean cut.',
        bottoms: 'Celana cargo ringan, celana pleats bervolume, rok lipit midi.',
        neckline: 'Kerah V-neck dalam atau kerah bundar santai.'
      };
    }
    if (shape.includes('apple') || shape.includes('oval')) {
      return {
        label: 'Oval / Apel (Apple)',
        silhouetteRule: 'Menciptakan garis vertikal memanjang untuk ilusi postur yang lebih jenjang.',
        tops: 'Kardigan rajut panjang terbuka, kemeja tunik berstruktur, blazer unbuttoned.',
        bottoms: 'Celana lurus bergaris tegas, ankle-cut trousers bahan kokoh.',
        neckline: 'Kerah V-neck terbuka atau open notch collar.'
      };
    }
    // Rectangle / Trapezoid default
    return {
      label: 'Persegi / Atletis (Rectangle)',
      silhouetteRule: 'Menciptakan dimensi visual dan ilusi lekuk melalui teknik layering dan permainan potongan baju.',
      tops: 'Vest denim layering, jaket cropped berstruktur, kemeja bermotif dengan saku dada.',
      bottoms: 'Celana chino relaxed, high-waist denim dengan sabuk tegas, celana kargo modern.',
      neckline: 'Kerah camp collar terbuka, kerah kemeja runcing rapi, atau V-neck.'
    };
  };

  const bodyDetails = getBodyShapeDetails();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#EFEFEA] py-7 px-4 sm:px-6 lg:px-8 text-[#162D24]">
      <div className="max-w-7xl mx-auto space-y-7">
        {/* 1. Dossier Header: Confident, Editorial, Clean */}
        <div className="bg-[#162D24] text-white rounded-3xl p-6 sm:p-9 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#254637]">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
              {userProfile.name || username || 'Teman Gaya'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
              Temukan warna, potongan, dan ukuran yang paling cocok untukmu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenOnboarding}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8EA89D]" />
              <span>Perbarui Profil Gaya</span>
            </button>

            <button
              onClick={onNavigateChat}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] text-[#162D24] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#162D24]" />
              <span>Konsultasi Stylist</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs: Gaya vs Lemari */}
        <div className="flex items-center gap-2 border-b border-[#D8D2C4] pb-2">
          <button
            onClick={() => setActiveTab('style_dna')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'style_dna'
                ? 'bg-[#162D24] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:text-[#162D24] border border-[#D8D2C4]'
            }`}
          >
            <Palette className="w-4 h-4 text-[#8EA89D]" />
            <span>Profil Gaya & Ukuran</span>
          </button>

          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'wardrobe'
                ? 'bg-[#162D24] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:text-[#162D24] border border-[#D8D2C4]'
            }`}
          >
            <Shirt className="w-4 h-4 text-[#8EA89D]" />
            <span>Lemari Saya</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'wardrobe' ? 'bg-[#8EA89D] text-[#162D24]' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {wardrobeCount}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'wardrobe' ? (
          <div className="space-y-4 animate-fadeIn">
            <WardrobeView
              embedded={true}
              currentUserId={userProfile.username || username || 'user'}
              onNavigateOutfitBuilder={(items) => {
                if (onSelectWardrobeForStylist && items) {
                  onSelectWardrobeForStylist(items);
                }
                onNavigateChat();
              }}
              onShowToast={onShowToast || (() => {})}
            />
          </div>
        ) : (
          <>
            {/* 2. Asymmetric Core Dossier: Palette Hero (7 Cols) + Siluet & Fitting (5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (7 Cols): Palet Harmoni Warna & Capsule Swatches */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#D8D2C4] shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0E6] text-[#634832] flex items-center justify-center font-bold">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Harmoni Rona Kulit</span>
                    <h2 className="text-base font-serif font-bold text-[#162D24]">{skinToneData.title}</h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#F4F1EA] text-[#162D24] text-[10px] font-bold uppercase">
                  Capsule Palette
                </span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {skinToneData.desc}
              </p>
            </div>

            {/* Visual Color Swatches with Roles */}
            <div className="space-y-3 pt-3 border-t border-[#F0EFEA]">
              <span className="text-xs font-serif font-bold text-[#162D24] block">
                Palet Busana Paling Harmonis:
              </span>
              
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {skinToneData.palette.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 group">
                    <div 
                      className="w-full aspect-square rounded-xl border border-black/10 shadow-2xs group-hover:scale-102 transition-transform" 
                      style={{ backgroundColor: item.hex }}
                      title={`${item.name} (${item.hex})`}
                    />
                    <div className="text-center w-full">
                      <strong className="text-[10px] text-[#162D24] block truncate font-sans">
                        {item.name}
                      </strong>
                      <span className="text-[8px] text-neutral-400 block truncate">
                        {item.role.split('(')[0].trim()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formula & Advice */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E4D9] space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-[#162D24] font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Formula Padanan Warna:</span>
                </div>
                <p className="text-neutral-700 text-[11px] leading-relaxed">
                  {skinToneData.combinationFormula}
                </p>
                <p className="text-[10px] text-neutral-500 italic pt-0.5">
                  {skinToneData.adviceAvoid}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): Siluet Anatomi & Proporsi Busana */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#D8D2C4] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF2EE] text-[#162D24] flex items-center justify-center font-bold">
                    <User className="w-4 h-4 text-[#2D5A47]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Siluet Tubuh</span>
                    <h2 className="text-base font-serif font-bold text-[#162D24]">{bodyDetails.label}</h2>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {bodyDetails.silhouetteRule}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#F0EFEA] text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Potongan Atasan Rekomendasi
                </span>
                <p className="text-xs text-[#162D24] font-medium leading-relaxed">
                  {bodyDetails.tops}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Potongan Bawahan Serasi
                </span>
                <p className="text-xs text-[#162D24] font-medium leading-relaxed">
                  {bodyDetails.bottoms}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Bentuk Kerah & Aksen
                </span>
                <p className="text-xs text-[#162D24] font-medium leading-relaxed">
                  {bodyDetails.neckline}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-neutral-500 block">
                Bentuk Wajah: <strong className="text-[#162D24] capitalize">{userProfile.faceShape.replace('_', ' ')}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Physical Fitting Strip: Smart Sizing (CM) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D8D2C4] shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#F0EFEA]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EAF2EE] text-[#162D24] flex items-center justify-center font-bold">
                <Ruler className="w-4 h-4 text-[#2D5A47]" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#162D24]">
                  Panduan Ukuran Badan (cm)
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Ukuran sentimeter untuk mencocokkan potongan baju secara presisi
                </p>
              </div>
            </div>

            {onOpenSmartSize && (
              <button
                onClick={onOpenSmartSize}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#D8D2C4] text-xs font-bold text-[#162D24] transition-colors cursor-pointer"
              >
                {hasCustomMeasurements ? 'Perbarui Ukuran (cm)' : 'Atur Ukuran Tubuh'}
              </button>
            )}
          </div>

          {hasCustomMeasurements ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9]">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Lingkar Dada</span>
                <strong className="text-base font-serif font-bold text-[#162D24] block mt-0.5">
                  {userProfile.measurements?.chestBustCm} cm
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9]">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Lingkar Pinggang</span>
                <strong className="text-base font-serif font-bold text-[#162D24] block mt-0.5">
                  {userProfile.measurements?.waistCm} cm
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9]">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Lingkar Pinggul</span>
                <strong className="text-base font-serif font-bold text-[#162D24] block mt-0.5">
                  {userProfile.measurements?.hipsCm || 96} cm
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9]">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Preferensi Fitting</span>
                <strong className="text-base font-serif font-bold text-[#162D24] block mt-0.5 capitalize">
                  {userProfile.measurements?.preferredFit || 'Regular'} Fit
                </strong>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <p className="text-neutral-600">
                Profil ukuran fisik belum dimasukkan. Saat ini rekomendasi menggunakan acuan proporsi standar. Masukkan ukuran lingkar dada dan pinggang untuk evaluasi fitting yang lebih akurat.
              </p>
              {onOpenSmartSize && (
                <button
                  onClick={onOpenSmartSize}
                  className="px-4 py-2 bg-[#162D24] hover:bg-[#203D31] text-white rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                >
                  Masukkan Ukuran (cm)
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. Action Hub: Konsultasi Stylist, Pesanan & Toko */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Konsultasi Stylist */}
          <div className="bg-white rounded-3xl p-5 border border-[#D8D2C4] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAF2EE] text-[#162D24] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#8EA89D]" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#162D24]">Konsultasi Stylist</h4>
                <p className="text-[11px] text-neutral-500">
                  Padukan pakaian lemari & katalog
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateChat}
              className="w-full py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#D8D2C4] text-xs font-bold text-[#162D24] transition-colors cursor-pointer text-center"
            >
              Konsultasi Gaya
            </button>
          </div>

          {/* Pesanan Rekber */}
          <div className="bg-white rounded-3xl p-5 border border-[#D8D2C4] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#634832] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#8EA89D]" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#162D24]">Pesanan & Resi</h4>
                <p className="text-[11px] text-neutral-500">
                  Pantau paket aktif & garansi
                </p>
              </div>
            </div>

            {onNavigateOrders && (
              <button
                onClick={onNavigateOrders}
                className="w-full py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#D8D2C4] text-xs font-bold text-[#162D24] transition-colors cursor-pointer text-center"
              >
                Lihat Pesanan
              </button>
            )}
          </div>

          {/* Lemari & Toko */}
          <div className="bg-white rounded-3xl p-5 border border-[#D8D2C4] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAF2EE] text-[#162D24] flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-[#2D5A47]" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#162D24]">Katalog Toko</h4>
                <p className="text-[11px] text-neutral-500">
                  Jual baju preloved & UMKM
                </p>
              </div>
            </div>

            {onNavigateSeller && (
              <button
                onClick={onNavigateSeller}
                className="w-full py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#D8D2C4] text-xs font-bold text-[#162D24] transition-colors cursor-pointer text-center"
              >
                Kelola Toko
              </button>
            )}
          </div>
        </div>

        {/* 5. Curated Outfits Matching Profile */}
        <div className="space-y-4 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#162D24]">
                Pilihan Busana yang Cocok Untukmu
              </h3>
              <p className="text-xs text-neutral-500">
                Pilihan pakaian dari UMKM lokal dan preloved yang serasi dengan rona kulit dan siluet tubuhmu
              </p>
            </div>
            <button
              onClick={onNavigateExplore}
              className="text-xs font-bold text-[#162D24] hover:text-[#2D5A47] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Lihat Semua Katalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendedItems.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectProduct(post)}
                className="group bg-white rounded-2xl overflow-hidden border border-[#D8D2C4] hover:border-[#162D24]/40 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-3/4 overflow-hidden bg-neutral-100 relative">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#162D24]/90 text-white text-[9px] font-semibold">
                    {post.sellerType === 'community_preloved' ? 'Preloved' : 'Brand Lokal'}
                  </div>
                </div>
                <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-medium text-neutral-400 block truncate">{post.sellerName}</span>
                    <h4 className="font-serif font-bold text-xs text-[#162D24] truncate group-hover:text-[#2D5A47]">{post.title}</h4>
                  </div>
                  <p className="font-bold text-xs text-[#162D24]">Rp {post.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
      </div>
    </div>
  );
};
