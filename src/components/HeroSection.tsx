'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, ShieldCheck, HeartHandshake, Palette, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSectionProps {
  onTalkToAI: () => void;
  onReference: () => void;
  onOpenOnboarding: () => void;
}

interface HeroModelItem {
  id: string;
  styleName: string;
  category: string;
  brandOrigin: string;
  imageUrl: string;
  paletteColor: string;
  material: string;
  silhouette: string;
  toneMatch: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onTalkToAI,
  onReference,
  onOpenOnboarding
}) => {
  // Curated High-Definition, Crystal-Clear Fashion Models that cycle dynamically with artisan specs
  const heroModels: HeroModelItem[] = [
    {
      id: 'model-1',
      styleName: 'Denim Vest & White Shirt',
      category: 'Casual Chic',
      brandOrigin: 'Atelier Senja • Bandung',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#2F4858',
      material: 'Katun Poplin & Denim 12oz',
      silhouette: 'Structured Relaxed • S-M',
      toneMatch: 'Cool & Neutral Tone'
    },
    {
      id: 'model-2',
      styleName: 'Silk Draped Midi Dress',
      category: 'Romantic Formal',
      brandOrigin: 'Kala Studio • Solo',
      imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#C5A086',
      material: 'Sutra Rayon Drape Lokal',
      silhouette: 'A-Line Flowing • All Size',
      toneMatch: 'Warm Autumn Tone'
    },
    {
      id: 'model-3',
      styleName: 'Tailored Blazer & High-Waist',
      category: 'Smart Executive',
      brandOrigin: 'Urban Mode • Jakarta',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#162D24',
      material: 'Semi-Wool Blend & Linen',
      silhouette: 'Tailored Hourglass • Fit M',
      toneMatch: 'Deep Forest Classic'
    },
    {
      id: 'model-4',
      styleName: 'Pashmina Silk & Suede Look',
      category: 'Modest Sporty',
      brandOrigin: 'Modest Chic • Tasikmalaya',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#8C6D58',
      material: 'Pashmina Sutra & Suede',
      silhouette: 'Modest Drape • All Size',
      toneMatch: 'Warm Earthy Tone'
    },
    {
      id: 'model-5',
      styleName: 'Oversized Boxy & Selvedge',
      category: 'Streetwear Edgy',
      brandOrigin: 'Denim Lab • Pekalongan',
      imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#1A2B4C',
      material: 'Katun 24s & Denim Selvedge',
      silhouette: 'Boxy Drop-Shoulder • L',
      toneMatch: 'Monochrome Clean'
    }
  ];

  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto rotate models every 3.8 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentModelIndex((prev) => (prev + 1) % heroModels.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isPaused, heroModels.length]);

  const currentModel = heroModels[currentModelIndex];

  const features = [
    {
      icon: Palette,
      title: 'Harmoni Warna Kulit',
      desc: 'Temukan palet warna pakaian yang paling menyatu dengan rona kulitmu (Cool, Neutral, Warm Tone).'
    },
    {
      icon: Sparkles,
      title: 'Potongan & Proporsi Tubuh',
      desc: 'Panduan potongan kerah, siluet baju, dan aksesoris yang proporsional dengan postur tubuhmu.'
    },
    {
      icon: HeartHandshake,
      title: 'Pemberdayaan UMKM Lokal',
      desc: 'Setiap pilihan outfit terhubung langsung ke pengrajin dan UMKM fashion Indonesia.'
    },
    {
      icon: ShieldCheck,
      title: 'Konsultasi Styling Personal',
      desc: 'Tanyakan inspirasi paduan busana untuk kuliah, kerja, hangout, hingga acara formal.'
    }
  ];

  const umkmCities = ['Bandung', 'Yogyakarta', 'Solo', 'Pekalongan', 'Garut', 'Denpasar', 'Jakarta', 'Tasikmalaya'];

  return (
    <div className="flex flex-col w-full bg-[#EDECE6]">
      {/* 1. HERO SECTION: Editorial Atelier Architecture */}
      <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center bg-[#EDECE6] overflow-hidden border-b border-[#DCDAD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center relative z-10">
          {/* Left Column: Headline & Action Buttons with Editorial Restraint */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left z-10">
            <div className="flex items-center gap-3">
              <span className="w-7 h-px bg-[#8EA89D]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2F4F42]">
                Kurasi Gaya Personal & Panduan Ukuran Pas
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#162D24] tracking-tight leading-[1.06]">
                Temukan Outfit
                <br />
                <span className="italic font-serif font-normal text-[#2F4F42] relative inline-block">
                  Terbaikmu.
                  <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-[#8EA89D]/50" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0,5 Q50,0 100,5" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#2F483D] font-normal max-w-lg leading-relaxed pt-1">
                Panduan padu padan busana sesuai siluet fisik, warna kulit, dan ukuran sentimeter (cm) akurat dari karya pengrajin lokal Indonesia.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onTalkToAI}
                className="px-7 py-3.5 rounded-xl bg-[#162D24] hover:bg-[#0D1C16] text-[#EDECE6] font-semibold text-xs sm:text-sm tracking-wider shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2.5 cursor-pointer group"
              >
                <span>Konsultasi Stylist</span>
                <ArrowRight className="w-4 h-4 text-[#8EA89D] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onReference}
                className="px-7 py-3.5 rounded-xl bg-[#FAF9F5] hover:bg-white text-[#162D24] border border-[#D5D3CA] font-semibold text-xs sm:text-sm tracking-wider shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#162D24]" />
                <span>Katalog Outfit & Thrift</span>
              </button>
            </div>

            {/* Verification Line with Micro-Icons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#2F483D] font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#52B788]" />
                <span>Panduan Ukuran (cm)</span>
              </div>
              <span className="text-[#8EA89D]">•</span>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#2F4F42]" />
                <span>Kurasi UMKM & Thrift</span>
              </div>
              <span className="text-[#8EA89D]">•</span>
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#E58B94]" />
                <span>Harmoni Rona Kulit</span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Geometric Arches + DYNAMIC ROTATING HD MODEL + SPEC TAG */}
          <div 
            className="lg:col-span-5 relative flex flex-col items-center justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative w-full max-w-[320px] sm:max-w-[420px] h-[440px] sm:h-[570px] flex items-end justify-center mx-auto">
              {/* Left Coral Arch */}
              <div 
                className="absolute left-1 sm:left-2 bottom-0 w-[210px] sm:w-[280px] h-[360px] sm:h-[480px] rounded-t-full bg-[#E58B94] shadow-md transition-all duration-700"
                style={{ borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px' }}
              />

              {/* Right Dark Green Arch */}
              <div 
                className="absolute right-1 sm:right-2 bottom-0 w-[160px] sm:w-[220px] h-[290px] sm:h-[400px] rounded-t-full bg-[#2F4F42] shadow-md transition-all duration-700"
                style={{ borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px' }}
              />

              {/* Artisan Spec Tag (Tactile specimen card) */}
              <div className="absolute -top-2 -left-2 sm:-left-6 z-30 pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`spec-${currentModel.id}`}
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-[#FAF9F5] border border-[#162D24]/15 rounded-xl p-3 shadow-md text-left max-w-[190px] sm:max-w-[220px]"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-[#162D24]/10 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#2F4F42]">
                        Spesifikasi Busana
                      </span>
                      <span className="text-[8px] font-mono text-neutral-400">
                        0{currentModelIndex + 1}/0{heroModels.length}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-[#162D24] truncate">
                      {currentModel.material}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-[#2F483D] pt-0.5">
                      <span className="truncate">{currentModel.silhouette}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Crystal-Clear HD Fashion Model with Arched Mask & Crossfade Animation */}
              <div 
                className="relative z-10 w-[210px] sm:w-[280px] h-[360px] sm:h-[480px] overflow-hidden shadow-2xl transition-all duration-500 border border-white/20"
                style={{ borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentModel.id}
                    initial={{ opacity: 0, scale: 1.05, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -8 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={currentModel.imageUrl}
                      alt={currentModel.styleName}
                      className="w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.03]"
                    />
                    {/* Bottom gradient overlay with Atelier aesthetic */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/75 via-black/35 to-transparent flex flex-col justify-end p-4 text-white">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#8EA89D]">
                          {currentModel.category}
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-[9px] text-neutral-300 font-medium">
                          {currentModel.toneMatch}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold font-serif truncate text-white">
                        {currentModel.styleName}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-neutral-300 truncate">
                        {currentModel.brandOrigin}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* Interactive Model Switcher Carousel Dots & Style Pills */}
            <div className="flex items-center gap-2 pt-4 z-20">
              {heroModels.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setCurrentModelIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentModelIndex
                      ? 'w-7 bg-[#162D24]'
                      : 'w-2 bg-[#162D24]/20 hover:bg-[#162D24]/50'
                  }`}
                  title={`${m.styleName} (${m.category})`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. UMKM PARTNER CITIES TICKER */}
      <section className="bg-[#162D24] text-white py-4 px-4 border-y border-[#254236] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold tracking-wider text-neutral-300">
          <span className="text-[#8EA89D] font-extrabold uppercase text-[11px] tracking-widest">
            KARYA UMKM LOKAL DARI:
          </span>
          {umkmCities.map((city, idx) => (
            <span key={idx} className="flex items-center gap-4">
              <span className="hover:text-white transition-colors">{city}</span>
              {idx < umkmCities.length - 1 && <span className="text-[#8EA89D]/40 font-black">•</span>}
            </span>
          ))}
        </div>
      </section>

      {/* 3. CORE FEATURES: Editorial Asymmetric Showcase */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-left max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-px bg-[#8EA89D]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2F4F42]">
              Prinsip Kurasi Outfitly
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#162D24] tracking-tight">
            Panduan Busana Berdasarkan Data Fisik & Karya Pengrajin
          </h2>
          <p className="text-sm sm:text-base text-[#2F483D] leading-relaxed">
            Menghubungkan kecocokan warna kulit dan ukuran sentimeter (cm) nyata dengan koleksi kurasi UMKM lokal Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Flagship Card (Spans 6 cols on lg) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#D6DFDA] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#162D24] text-white flex items-center justify-center shadow-xs">
                <Palette className="w-6 h-6 text-[#8EA89D]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[#162D24]">
                  Harmoni Rona Kulit & Proporsi Tubuh (cm)
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Menemukan palet warna pakaian yang paling menyatu dengan rona kulit alami (Cool, Neutral, Warm Tone) serta panduan siluet kerah dan baju sesuai postur tubuh.
                </p>
              </div>
            </div>

            {/* Interactive Tone Preview Swatch Strip */}
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#162D24]">
                <span>Spektrum Rona Busana:</span>
                <span className="text-[#2F4F42] text-[10px] font-mono">Toleransi ±0.5 cm</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-white border border-[#DDD8CC] text-center space-y-1">
                  <div className="w-full h-5 rounded-md bg-[#2F4858]" />
                  <span className="text-[10px] font-bold text-[#162D24] block">Cool</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#DDD8CC] text-center space-y-1">
                  <div className="w-full h-5 rounded-md bg-[#C5A086]" />
                  <span className="text-[10px] font-bold text-[#162D24] block">Warm</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#DDD8CC] text-center space-y-1">
                  <div className="w-full h-5 rounded-md bg-[#162D24]" />
                  <span className="text-[10px] font-bold text-[#162D24] block">Neutral</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#DDD8CC] text-center space-y-1">
                  <div className="w-full h-5 rounded-md bg-[#8C6D58]" />
                  <span className="text-[10px] font-bold text-[#162D24] block">Earthy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Card 1: UMKM Empowerment (3 cols on lg) */}
          <div className="lg:col-span-3 bg-white p-6 sm:p-7 rounded-3xl border border-[#D6DFDA] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EFEFEA] text-[#162D24] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-[#2F4F42]" />
              </div>
              <h3 className="text-base font-bold font-serif text-[#162D24]">
                Pemberdayaan UMKM Lokal
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Setiap pilihan busana terhubung langsung dengan pengrajin tenun, batik, denim, dan penjahit independen dari berbagai sentra kreatif Indonesia.
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-100 text-[11px] font-semibold text-[#2F4F42]">
              Bandung • Solo • Yogya • Pekalongan
            </div>
          </div>

          {/* Supporting Card 2: Personal Styling Consultation (3 cols on lg) */}
          <div className="lg:col-span-3 bg-[#162D24] text-white p-6 sm:p-7 rounded-3xl border border-[#254236] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#8EA89D]/20 text-[#8EA89D] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-serif text-white">
                Konsultasi Styling Personal
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Dapatkan rekomendasi paduan busana untuk kuliah, kerja, hangout, hingga momen formal sesuai karakteristik pribadimu.
              </p>
            </div>
            <button
              onClick={onTalkToAI}
              className="w-full py-2.5 px-4 rounded-xl bg-[#8EA89D] hover:bg-[#A3B9AD] text-[#162D24] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Mulai Konsultasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-[#162D24] text-white pt-14 pb-10 border-t border-[#254236]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand info */}
            <div className="space-y-4 md:col-span-2">
              <div className="inline-block px-3.5 py-1.5 rounded-2xl bg-[#8EA89D] shadow-xs">
                <img src="/assets/oftea-logo.png" alt="Outfitly" className="h-7 object-contain mix-blend-multiply" />
              </div>
              <p className="text-xs text-neutral-300 max-w-sm leading-relaxed">
                Outfitly adalah platform kurasi gaya personal yang membantu menemukan paduan busana sesuai karakteristik fisik dan menghubungkan pengguna dengan karya UMKM lokal Indonesia.
              </p>
              <div className="pt-1 flex items-center gap-4 text-xs text-neutral-300">
                <a 
                  href="https://instagram.com/outfitly.id" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#8EA89D]">IG:</span> @outfitly.id
                </a>
                <span>•</span>
                <a 
                  href="mailto:contact@outfitly.id" 
                  className="hover:text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#8EA89D]">Email:</span> contact@outfitly.id
                </a>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#8EA89D]">
                Navigasi
              </h4>
              <ul className="space-y-2 text-xs text-neutral-300 font-medium">
                <li><button onClick={onTalkToAI} className="hover:text-white transition-colors cursor-pointer">Konsultasi Stylist</button></li>
                <li><button onClick={onReference} className="hover:text-white transition-colors cursor-pointer">Katalog & Komunitas</button></li>
                <li><button onClick={onOpenOnboarding} className="hover:text-white transition-colors cursor-pointer">Kuesioner Gaya</button></li>
              </ul>
            </div>

            {/* Col 3: UMKM Partners */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#8EA89D]">
                Komunitas UMKM
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Ingin produk UMKM fashion Anda terkurasi di katalog Outfitly?
              </p>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Tim%20Outfitly,%20saya%20tertarik%20mendaftarkan%20brand%20UMKM%20fashion%20saya."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8EA89D] hover:underline"
              >
                <span>Daftarkan Brand Anda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-4">
            <p>© 2026 Outfitly. Seluruh Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-4">
              <span>Syarat & Ketentuan</span>
              <span>•</span>
              <span>Kebijakan Privasi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
