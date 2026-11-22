'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Compass, Palette, Pause, Play, Ruler, Store } from 'lucide-react';
import { useApp } from './AppContext';
import { ProductImage } from './GarmentArt';
import { ProductCard } from './ProductCard';
import { DemoNote, SectionTitle, btnGhost, btnPrimary } from './ui';
import { CITIES, HERO_MODELS, SELLER_TYPE_LABEL } from '@/lib/data';
import { useCatalog, useProfile, useSession } from '@/lib/hooks';
import { bestSize, FIT_LABEL, fitTone } from '@/lib/sizing';
import { formatIDR, useHydrated } from '@/lib/storage';

const ROTATE_MS = 4500;

export function HeroView() {
  const { go, openAuth, openOnboarding, openProduct, openMeasurements } = useApp();
  const [session] = useSession();
  const [profile] = useProfile();
  const [catalog] = useCatalog();
  const hydrated = useHydrated();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [tickerOn, setTickerOn] = useState(true);
  const model = HERO_MODELS[idx];

  useEffect(() => {
    // Reduced motion: the ribbon stops; photos still change, but without a fade (CSS rule).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTickerOn(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % HERO_MODELS.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [playing]);

  const fresh = [...catalog].filter((p) => p.isAvailable).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  // Live specimen: a real calculation of one product against the visitor's own measurements.
  const specimen = useMemo(() => {
    const p = catalog.find((x) => x.id === 'p05') ?? catalog.find((x) => x.category === 'jeans') ?? catalog[0];
    return p ? { p, r: bestSize(p, profile.measurements) } : null;
  }, [catalog, profile.measurements]);

  const startCta = (): void => {
    if (!hydrated || !session) openAuth('signup');
    else if (!profile.onboarded) openOnboarding();
    else go('catalog');
  };

  return (
    <div>
      {/* Hero: rotating model photos inside the layered arch motif */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-14 pt-10 md:grid-cols-[1.15fr_1fr] md:px-8 md:pb-20 md:pt-16">
          <div className="relative z-10">
            <h1 id="hero-title" className="font-serif text-[48px] font-semibold leading-[1.02] text-forest sm:text-[62px] lg:text-[84px]">
              Temukan Outfit
              <br />
              <em className="relative inline-block font-normal">
                Terbaikmu.
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-sage" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 9 Q150 1 298 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </em>
            </h1>
            <p className="mt-7 max-w-lg text-[16px] leading-relaxed text-muted md:text-[18px]">
              Panduan padu padan busana sesuai siluet tubuh, warna kulit, dan ukuran sentimeter (cm) dari karya pengrajin lokal Indonesia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className={`${btnPrimary} px-7 text-[15px]`} onClick={() => go('stylist')}>
                Konsultasi Stylist
              </button>
              <button type="button" className={`${btnGhost} px-6 text-[15px]`} onClick={startCta}>
                <Compass className="size-4" strokeWidth={1.5} aria-hidden />
                {hydrated && session && profile.onboarded ? 'Katalog Outfit & Thrift' : 'Mulai Kurasi Gaya'}
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-ink/80">
              <li className="flex items-center gap-1.5"><Ruler className="size-4 text-sage-ink" strokeWidth={1.5} aria-hidden /> Panduan Ukuran (cm)</li>
              <li className="flex items-center gap-1.5"><Store className="size-4 text-sage-ink" strokeWidth={1.5} aria-hidden /> Kurasi UMKM &amp; Thrift</li>
              <li className="flex items-center gap-1.5"><Palette className="size-4 text-coral-ink" strokeWidth={1.5} aria-hidden /> Harmoni Rona Kulit</li>
            </ul>
            <DemoNote className="mt-6" />
          </div>

          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="relative mx-auto h-[460px] w-full max-w-[400px] sm:h-[560px]">
              <div className="absolute bottom-0 left-0 h-[86%] w-[68%] rounded-t-full bg-coral" aria-hidden />
              <div className="absolute bottom-0 right-0 h-[70%] w-[52%] rounded-t-full bg-[#2F4F42]" aria-hidden />

              <button
                type="button"
                onClick={() => openProduct(model.productId)}
                className="absolute bottom-0 left-[14%] z-10 h-[94%] w-[72%] overflow-hidden rounded-t-full bg-cream-3 text-left shadow-[0_30px_60px_-30px_rgba(10,25,18,0.6)]"
                aria-label={`Lihat padanan katalog untuk gaya ${model.style}`}
              >
                {HERO_MODELS.map((m, i) => (
                  <img
                    key={m.id}
                    src={m.src}
                    alt={i === idx ? m.alt : ''}
                    width={800}
                    height={1100}
                    fetchPriority={i === 0 ? 'high' : 'low'}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
                <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/75 via-black/40 to-transparent px-5 pb-4 pt-16 text-white" aria-live="polite">
                  <span className="block text-[12px] text-white/85">{model.mood} . {model.tone}</span>
                  <span className="block font-serif text-lg leading-snug">{model.style}</span>
                  <span className="mt-0.5 block text-[11px] text-white/70">Foto referensi: Unsplash</span>
                </span>
              </button>

            </div>

            <div className="mt-4 flex items-center justify-center gap-1">
              <button type="button" aria-label="Foto sebelumnya" onClick={() => setIdx((idx - 1 + HERO_MODELS.length) % HERO_MODELS.length)} className="grid size-11 place-items-center rounded-full hover:bg-cream-2 active:bg-cream-3">
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              {HERO_MODELS.map((m, i) => (
                <button key={m.id} type="button" onClick={() => setIdx(i)} aria-label={`Tampilkan gaya ${m.style}`} aria-current={i === idx} className="grid h-11 place-items-center px-0.5">
                  <span className={`block h-1.5 rounded-full transition-all ${i === idx ? 'w-7 bg-forest' : 'w-2 bg-forest/25'}`} />
                </button>
              ))}
              <button type="button" aria-label="Foto berikutnya" onClick={() => setIdx((idx + 1) % HERO_MODELS.length)} className="grid size-11 place-items-center rounded-full hover:bg-cream-2 active:bg-cream-3">
                <ChevronRight className="size-4" aria-hidden />
              </button>
              <button type="button" aria-label={playing ? 'Jeda pergantian foto' : 'Putar pergantian foto'} aria-pressed={!playing} onClick={() => setPlaying(!playing)} className="grid size-11 place-items-center rounded-full hover:bg-cream-2 active:bg-cream-3">
                {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partner city ribbon */}
      <section className="relative flex items-center border-y border-forest bg-forest text-cream" aria-label="Kota mitra pengrajin">
        <div className="min-w-0 flex-1 overflow-hidden py-3.5">
          <div className={`flex w-max animate-marquee gap-10 whitespace-nowrap ${tickerOn ? '' : 'marquee-paused'}`}>
            {Array.from({ length: 4 }).flatMap((_, k) =>
              CITIES.map((c) => (
                <span key={`${k}-${c}`} className="flex items-center gap-10 font-serif text-lg italic" aria-hidden={k > 0}>
                  {c}
                  <span className="size-1 rounded-full bg-sage" aria-hidden />
                </span>
              )),
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTickerOn(!tickerOn)}
          className="on-dark grid size-11 shrink-0 place-items-center border-l border-cream/15 text-cream hover:bg-white/10"
          aria-label={tickerOn ? 'Hentikan pita kota' : 'Jalankan pita kota'}
          aria-pressed={!tickerOn}
        >
          {tickerOn ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        </button>
      </section>

      {/* Three editorial features, each composed around its own content */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-24" aria-labelledby="how-title">
        <h2 id="how-title" className="max-w-2xl font-serif text-[30px] leading-tight text-forest md:text-[44px]">
          Dikurasi dengan <em>angka</em>, dipadukan dengan <em>selera</em>.
        </h2>

        {/* 01: live fit specimen */}
        <div className="mt-12 grid items-center gap-8 border-t border-line pt-10 md:grid-cols-[1fr_1.1fr] md:gap-14">
          <div>
            <p className="font-serif text-5xl italic text-sage-ink">01</p>
            <h3 className="mt-2 font-serif text-[26px] text-forest md:text-3xl">Kurasi spesifikasi nyata</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              Setiap produk mencantumkan ukuran flat-lay dalam cm. Kami hitung kelonggaran kain terhadap LD, LP, dan bahu Anda, lalu menandainya Pas, Sempit, atau Longgar sebelum Anda chat penjual.
            </p>
            <button type="button" onClick={openMeasurements} className={`${btnGhost} mt-5`}>Isi ukuran tubuh saya</button>
          </div>
          {specimen && hydrated && (
            <button type="button" onClick={() => openProduct(specimen.p.id)} className="group grid grid-cols-[110px_1fr] gap-4 rounded-[20px] bg-forest p-4 text-left text-cream sm:grid-cols-[150px_1fr] sm:p-6" aria-label={`Lihat hitungan ukuran ${specimen.p.title}`}>
              <div className="aspect-[4/5] overflow-hidden rounded-t-full bg-cream-2">
                <ProductImage src={specimen.p.imageUrl} colors={specimen.p.colorHex} alt="" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] text-sage-2">Contoh hitungan untuk ukuran Anda</p>
                <p className="mt-1 font-serif text-lg leading-snug sm:text-xl">{specimen.p.title}</p>
                <p className="mt-1 text-xs text-cream/75">{formatIDR(specimen.p.price)} . ukuran {specimen.r.size.sizeLabel}</p>
                <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${fitTone(specimen.r.fit.status)}`}>
                  {FIT_LABEL[specimen.r.fit.status]} {specimen.r.fit.score}%
                </span>
                <ul className="mt-3 space-y-1 text-[12px] leading-snug text-cream/85">
                  {specimen.r.fit.notes.slice(0, 2).map((n) => <li key={n}>{n}</li>)}
                </ul>
              </div>
            </button>
          )}
        </div>

        {/* 02: Studio modes as a reading list */}
        <div className="mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <ol className="order-2 divide-y divide-line md:order-1">
            {[
              ['Lemari Saya', 'Meracik dari pakaian yang sudah Anda miliki. Biaya Rp 0.'],
              ['Belanja UMKM', 'Satu tampilan utuh dari katalog, di bawah batas budget Anda.'],
              ['Kombinasi Hybrid', 'Pakaian lemari sebagai dasar, ditambah satu atau dua produk UMKM.'],
            ].map(([t, d]) => (
              <li key={t} className="flex items-baseline gap-4 py-4">
                <span className="w-40 shrink-0 font-serif text-xl text-forest">{t}</span>
                <span className="text-sm text-muted">{d}</span>
              </li>
            ))}
          </ol>
          <div className="order-1 md:order-2">
            <p className="font-serif text-5xl italic text-sage-ink">02</p>
            <h3 className="mt-2 font-serif text-[26px] text-forest md:text-3xl">Studio padu padan</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              Pilih acara, cuaca, dan budget. Ganti satu bagian saja, misalnya outer atau sepatu, tanpa mengulang seluruh racikan.
            </p>
            <button type="button" onClick={() => go('studio')} className={`${btnGhost} mt-5`}>Buka Studio</button>
          </div>
        </div>

        {/* 03: seller ecosystem */}
        <div className="mt-14 border-t border-line pt-10">
          <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-14">
            <div>
              <p className="font-serif text-5xl italic text-sage-ink">03</p>
              <h3 className="mt-2 font-serif text-[26px] text-forest md:text-3xl">Mitra &amp; preloved</h3>
            </div>
            <dl className="grid gap-6 sm:grid-cols-3">
              {[
                ['umkm', 'Produk baru dari penjahit dan pengrajin lokal, dengan tabel cm per varian.'],
                ['community_preloved', 'Satu barang, satu pemilik baru. Diukur ulang dan difoto apa adanya.'],
                ['collab_mitra', 'Thrift shop yang kurasinya disusun bersama stylist Outfitly per musim.'],
              ].map(([k, d]) => (
                <div key={k}>
                  <dt className="font-serif text-lg text-forest">{SELLER_TYPE_LABEL[k as keyof typeof SELLER_TYPE_LABEL]}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8 md:pb-24" aria-labelledby="new-title">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle title={<span id="new-title">Baru <em>dikurasi</em></span>} />
          <button type="button" onClick={() => go('catalog')} className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-forest underline-offset-4 hover:underline">
            Semua produk <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
          {fresh.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
