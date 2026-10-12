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
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onTalkToAI,
  onReference,
  onOpenOnboarding
}) => {
  // Curated High-Definition, Crystal-Clear Fashion Models that cycle dynamically
  const heroModels: HeroModelItem[] = [
    {
      id: 'model-1',
      styleName: 'Denim Vest & White Shirt',
      category: 'Casual Chic',
      brandOrigin: 'Atelier Senja • Bandung',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#2F4858'
    },
    {
      id: 'model-2',
      styleName: 'Silk Draped Midi Dress',
      category: 'Romantic Formal',
      brandOrigin: 'Kala Studio • Solo',
      imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#C5A086'
    },
    {
      id: 'model-3',
      styleName: 'Tailored Blazer & High-Waist',
      category: 'Smart Executive',
      brandOrigin: 'Urban Mode • Jakarta',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#162D24'
    },
    {
      id: 'model-4',
      styleName: 'Pashmina Silk & Suede Look',
      category: 'Modest Sporty',
      brandOrigin: 'Modest Chic • Tasikmalaya',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#8C6D58'
    },
    {
      id: 'model-5',
      styleName: 'Oversized Boxy & Selvedge',
      category: 'Streetwear Edgy',
      brandOrigin: 'Denim Lab • Pekalongan',
      imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85',
      paletteColor: '#1A2B4C'
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
      {/* 1. HERO SECTION matching Page 1 */}
      <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center bg-[#EDECE6] overflow-hidden border-b border-[#DCDAD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Headline & Action Buttons matching Page 1 */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left z-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2F4F42]">
              Kurasi Gaya Personal & Panduan Ukuran Pas
            </span>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#162D24] tracking-tight leading-[1.08]">
                Temukan Outfit
                <br />
                <span className="italic text-[#2F4F42]">Terbaikmu.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#2F483D] font-normal max-w-lg leading-relaxed pt-1">
                Panduan padu padan busana sesuai siluet fisik, warna kulit, dan ukuran sentimeter (cm) akurat dari karya pengrajin lokal Indonesia.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onTalkToAI}
                className="px-7 py-3.5 rounded-xl bg-[#254236] hover:bg-[#1B3329] text-[#EDECE6] font-semibold text-xs sm:text-sm tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-2.5 cursor-pointer group"
              >
                <span>Konsultasi Stylist</span>
                <ArrowRight className="w-4 h-4 text-[#8EA89D] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onReference}
                className="px-7 py-3.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#162D24] border border-[#DCDAD2] font-semibold text-xs sm:text-sm tracking-wider shadow-xs hover:shadow-sm transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#162D24]" />
                <span>Katalog Outfit & Thrift</span>
              </button>
            </div>

            {/* Verification Line */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#2F483D] font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#52B788]" />
                <span>Panduan Ukuran (cm)</span>
              </div>
              <span>•</span>
              <div>Kurasi Produk UMKM & Thrift Komunitas</div>
              <span>•</span>
              <div>Transparansi Ukuran Sentimeter</div>
            </div>
          </div>

          {/* Right Column: Layered Geometric Arches + DYNAMIC ROTATING HD FASHION MODEL */}
          <div 
            className="lg:col-span-5 relative flex flex-col items-center justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative w-[340px] sm:w-[420px] h-[480px] sm:h-[560px] flex items-end justify-center">
              {/* Left Pink / Coral Arch */}
              <div 
                className="absolute left-2 bottom-0 w-[240px] sm:w-[280px] h-[400px] sm:h-[480px] rounded-t-full bg-[#E58B94] shadow-md transition-all duration-700"
                style={{ borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px' }}
              />

              {/* Right Dark Green Arch */}
              <div 
                className="absolute right-2 bottom-0 w-[180px] sm:w-[220px] h-[320px] sm:h-[400px] rounded-t-full bg-[#2F4F42] shadow-md transition-all duration-700"
                style={{ borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px' }}
              />

              {/* Crystal-Clear HD Fashion Model with Arched Mask & Crossfade Animation */}
              <div 
                className="relative z-10 w-[240px] sm:w-[280px] h-[390px] sm:h-[470px] overflow-hidden shadow-2xl transition-all duration-500"
                style={{ borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentModel.id}
                    initial={{ opacity: 0, scale: 1.06, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={currentModel.imageUrl}
                      alt={currentModel.styleName}
                      className="w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.03]"
                    />
                    {/* Bottom gradient overlay for seamless blending */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8EA89D]">
                        {currentModel.category}
                      </span>
                      <h4 className="text-xs font-extrabold truncate">
                        {currentModel.styleName}
                      </h4>
                      <p className="text-[9px] text-neutral-300 truncate">
                        {currentModel.brandOrigin}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* Interactive Model Switcher Carousel Dots & Style Pills */}
            <div className="flex items-center gap-1.5 pt-4 z-20">
              {heroModels.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setCurrentModelIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentModelIndex
                      ? 'w-6 bg-[#2F4F42]'
                      : 'w-2 bg-neutral-400/50 hover:bg-neutral-600'
                  }`}
                  title={m.styleName}
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

      {/* 3. CORE FEATURES SHOWCASE */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#162D24] tracking-tight font-sans">
            Panduan Gaya yang Disesuaikan Untukmu
          </h2>
          <p className="text-sm sm:text-base text-[#2F483D] leading-relaxed">
            Outfitly memadukan kurasi gaya personal dengan karya pengrajin lokal dan pakaian preloved berkualitas untuk setiap momen pentingmu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-[#D6DFDA] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EFEFEA] group-hover:bg-[#8EA89D] text-[#162D24] flex items-center justify-center transition-colors shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-[#162D24] font-sans group-hover:text-[#1E3A2F]">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
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
