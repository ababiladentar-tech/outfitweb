'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookmarkCheck, Check, CloudRain, Compass, Repeat, Shuffle, Sun, Wind } from 'lucide-react';
import { useApp } from './AppContext';
import { ProductImage } from './GarmentArt';
import { Chip, Modal, btnGhost, btnPrimary, inputCls, labelCls } from './ui';
import { STYLE_LABEL } from '@/lib/data';
import { undertoneHarmony, vibeScore } from '@/lib/color';
import { useCatalog, useHandoff, useProfile, useSavedOutfits, useWardrobe } from '@/lib/hooks';
import { bestSize, FIT_LABEL, fitTone } from '@/lib/sizing';
import { emitToast, formatIDR, uid, useHydrated } from '@/lib/storage';
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
} from '@/lib/types';

const SLOTS: { key: OutfitSlot; label: string }[] = [
  { key: 'top', label: 'Atasan / Dress' },
  { key: 'bottom', label: 'Bawahan' },
  { key: 'outer', label: 'Outer' },
  { key: 'shoes', label: 'Sepatu' },
  { key: 'bag', label: 'Tas' },
];

const OCCASIONS: { key: Occasion; label: string }[] = [
  { key: 'kuliah', label: 'Kuliah' },
  { key: 'kantor', label: 'Kantor' },
  { key: 'kasual', label: 'Kasual' },
  { key: 'kondangan', label: 'Kondangan' },
  { key: 'weekend', label: 'Weekend' },
];

const MODES: { key: BuilderMode; label: string; sub: string }[] = [
  { key: 'wardrobe', label: 'Lemari Saya', sub: 'Total biaya Rp 0' },
  { key: 'umkm', label: 'Belanja UMKM', sub: 'Produk baru dari katalog' },
  { key: 'hybrid', label: 'Kombinasi Hybrid', sub: 'Lemari + 1-2 produk UMKM' },
];

const WEATHER: { key: Weather; label: string; icon: React.ReactNode }[] = [
  { key: 'cerah', label: 'Cerah', icon: <Sun className="size-3.5" strokeWidth={1.6} /> },
  { key: 'sejuk', label: 'Sejuk', icon: <Wind className="size-3.5" strokeWidth={1.6} /> },
  { key: 'hujan', label: 'Hujan', icon: <CloudRain className="size-3.5" strokeWidth={1.6} /> },
];

const wardrobeSlot = (c: WardrobeItem['category']): OutfitSlot | null =>
  c === 'tops' || c === 'dresses' ? 'top' : c === 'bottoms' ? 'bottom' : c === 'outerwear' ? 'outer' : c === 'shoes' ? 'shoes' : c === 'bags' ? 'bag' : null;

const productSlot = (c: UMKMProductPost['category']): OutfitSlot | null =>
  c === 'top' || c === 'dress' ? 'top' : c === 'pants' || c === 'jeans' ? 'bottom' : c === 'outerwear' ? 'outer' : c === 'shoes' ? 'shoes' : c === 'bag' ? 'bag' : null;

const OCC_TAG: Record<Occasion, string[]> = {
  kuliah: ['kuliah'],
  kantor: ['kantor'],
  kasual: ['kasual', 'weekend'],
  kondangan: ['kondangan'],
  weekend: ['weekend', 'kasual'],
};

interface Candidate {
  piece: OutfitPiece;
  score: number;
  isDress: boolean;
}

function fromWardrobe(w: WardrobeItem, profile: UserProfile, occ: Occasion, vibe: StylePreference | 'all'): Candidate | null {
  const slot = wardrobeSlot(w.category);
  if (!slot) return null;
  let score = undertoneHarmony(w.colorHex, profile.skinTone);
  if (vibe !== 'all' && w.style === vibe) score += 15;
  if (occ === 'kantor' && (w.style === 'formal' || w.style === 'minimalist')) score += 10;
  if (occ === 'kondangan' && (w.style === 'formal' || w.category === 'dresses')) score += 12;
  return {
    piece: { slot, source: 'wardrobe', refId: w.id, name: w.name, imageUrl: w.imageUrl, colorHex: w.colorHex, price: 0 },
    score,
    isDress: w.category === 'dresses',
  };
}

function fromProduct(p: UMKMProductPost, profile: UserProfile, occ: Occasion, vibe: StylePreference | 'all'): Candidate | null {
  const slot = productSlot(p.category);
  if (!slot || !p.isAvailable || p.stockCount <= 0) return null;
  if (profile.gender === 'boy' && p.category === 'dress') return null;
  const fit = bestSize(p, profile.measurements);
  let score = vibeScore(p, profile.skinTone, profile.bodyShape) * 0.5 + fit.fit.score * 0.5;
  if (OCC_TAG[occ].some((t) => p.tags.includes(t))) score += 20;
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

function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function StudioView() {
  const [profile] = useProfile();
  const [wardrobe] = useWardrobe();
  const [catalog] = useCatalog();
  const [handoff, setHandoff] = useHandoff();
  const [, setSaved] = useSavedOutfits();
  const { openProduct, openSaved } = useApp();
  const hydrated = useHydrated();

  const [mode, setMode] = useState<BuilderMode>('hybrid');
  const [occasion, setOccasion] = useState<Occasion>('kuliah');
  const [vibe, setVibe] = useState<StylePreference | 'all'>('all');
  const [budget, setBudget] = useState(800000);
  const [weather, setWeather] = useState<Weather>('cerah');
  const [seed, setSeed] = useState(7);
  const [locked, setLocked] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Partial<Record<OutfitSlot, OutfitPiece | null>>>({});
  const [swapSlot, setSwapSlot] = useState<OutfitSlot | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');

  // Consume wardrobe handoff.
  useEffect(() => {
    if (handoff && handoff.target === 'studio' && handoff.wardrobeIds.length) {
      setLocked(handoff.wardrobeIds);
      setMode('hybrid');
      setOverrides({});
      setHandoff(null);
    }
  }, [handoff, setHandoff]);

  const candidates = useMemo(() => {
    const map: Record<OutfitSlot, Candidate[]> = { top: [], bottom: [], outer: [], shoes: [], bag: [] };
    if (mode !== 'umkm') {
      wardrobe.forEach((w) => {
        const c = fromWardrobe(w, profile, occasion, vibe);
        if (c) map[c.piece.slot].push(c);
      });
    }
    if (mode !== 'wardrobe') {
      catalog.forEach((p) => {
        const c = fromProduct(p, profile, occasion, vibe);
        if (c) map[c.piece.slot].push(c);
      });
    }
    return map;
  }, [mode, wardrobe, catalog, profile, occasion, vibe]);

  const generated = useMemo(() => {
    const rand = seeded(seed);
    const pieces: Partial<Record<OutfitSlot, OutfitPiece | null>> = {};
    let remaining = budget;
    let umkmUsed = 0;
    const needOuter = weather !== 'cerah' || occasion === 'kantor' || occasion === 'kondangan';
    let dress = false;

    const lockedPieces = wardrobe.filter((w) => locked.includes(w.id)).map((w) => fromWardrobe(w, profile, occasion, vibe)).filter((c): c is Candidate => !!c);

    for (const { key } of SLOTS) {
      if (key === 'bottom' && dress) {
        pieces.bottom = null;
        continue;
      }
      if (key === 'outer' && !needOuter) {
        pieces.outer = null;
        continue;
      }
      const lock = lockedPieces.find((c) => c.piece.slot === key);
      if (lock) {
        pieces[key] = lock.piece;
        if (lock.isDress) dress = true;
        continue;
      }
      let pool = candidates[key].map((c) => ({ ...c, score: c.score + rand() * 18 }));
      if (mode === 'hybrid') {
        const ownHas = pool.some((c) => c.piece.source === 'wardrobe');
        const preferUmkm = (key === 'outer' || key === 'shoes' || !ownHas) && umkmUsed < 2;
        pool = pool.filter((c) => (c.piece.source === 'umkm' ? preferUmkm : !preferUmkm || !ownHas));
        if (!pool.length) pool = candidates[key].filter((c) => c.piece.source === 'wardrobe');
      }
      pool = pool.filter((c) => c.piece.source === 'wardrobe' || c.piece.price <= remaining);
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
  }, [candidates, seed, budget, weather, occasion, mode, locked, wardrobe, profile, vibe]);

  const outfit: Partial<Record<OutfitSlot, OutfitPiece | null>> = { ...generated, ...overrides };
  const pieces = SLOTS.map((s) => outfit[s.key]).filter((p): p is OutfitPiece => !!p);
  const total = pieces.reduce((s, p) => s + p.price, 0);
  const overBudget = total > budget;
  const fitIssues = pieces.filter((p) => p.fit && p.fit.score < 70);

  const reshuffle = useCallback(() => {
    setOverrides({});
    setSeed((s) => s + 13);
  }, []);

  const save = (): void => {
    const name = title.trim() || `${OCCASIONS.find((o) => o.key === occasion)?.label} ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
    setSaved((prev) => [{ id: uid('o'), title: name, mode, occasion, pieces, totalPrice: total, createdAt: new Date().toISOString() }, ...prev]);
    setSaving(false);
    setTitle('');
    emitToast('Racikan disimpan ke Outfit Tersimpan');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-[34px] leading-tight text-forest md:text-[46px]">Studio <em>Padu Padan</em></h1>
          <p className="mt-1 text-sm text-muted">Racik satu tampilan untuk acara, cuaca, dan budget tertentu.</p>
        </div>
        <button type="button" onClick={openSaved} className={`${btnGhost} self-start md:self-auto`}>
          <BookmarkCheck className="size-4" strokeWidth={1.6} /> Outfit Tersimpan
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              setMode(m.key);
              setOverrides({});
            }}
            className={`rounded-2xl border p-3 text-left transition md:p-4 ${mode === m.key ? 'border-forest bg-forest text-cream' : 'border-line bg-white/50 text-forest hover:border-forest/40'}`}
          >
            <p className="font-serif text-[15px] leading-tight md:text-lg">{m.label}</p>
            <p className={`mt-0.5 hidden text-xs sm:block ${mode === m.key ? "text-cream/70" : "text-muted"}`}>{m.sub}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr_300px]">
        {/* Filters */}
        <div className="space-y-5 rounded-2xl border border-line bg-white/40 p-4">
          <div>
            <p className={labelCls}>Acara</p>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((o) => (
                <Chip key={o.key} active={occasion === o.key} onClick={() => { setOccasion(o.key); setOverrides({}); }}>{o.label}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className={labelCls}>Vibe Gaya</p>
            <div className="flex flex-wrap gap-1.5">
              <Chip active={vibe === 'all'} onClick={() => setVibe('all')}>Semua</Chip>
              {(Object.keys(STYLE_LABEL) as StylePreference[]).map((s) => (
                <Chip key={s} active={vibe === s} onClick={() => { setVibe(s); setOverrides({}); }}>{STYLE_LABEL[s]}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className={labelCls}>Cuaca</p>
            <div className="flex flex-wrap gap-1.5">
              {WEATHER.map((w) => (
                <Chip key={w.key} active={weather === w.key} onClick={() => { setWeather(w.key); setOverrides({}); }}>{w.icon}{w.label}</Chip>
              ))}
            </div>
          </div>
          <div className={mode === 'wardrobe' ? 'opacity-40' : ''}>
            <div className="flex items-baseline justify-between">
              <p className={labelCls}>Batas Budget</p>
              <p className="text-sm font-semibold tabular-nums text-forest">{formatIDR(budget)}</p>
            </div>
            <input type="range" min={100000} max={2000000} step={50000} value={budget} disabled={mode === 'wardrobe'} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" aria-label="Batas budget" />
          </div>
          {locked.length > 0 && (
            <div className="rounded-xl bg-sage-soft p-3 text-[12.5px] text-forest">
              {locked.length} item dari lemari dikunci di racikan ini.
              <button type="button" onClick={() => setLocked([])} className="ml-1 underline underline-offset-2">Lepas</button>
            </div>
          )}
          <button type="button" onClick={reshuffle} className={`${btnPrimary} w-full`}>
            <Shuffle className="size-4" /> Racik Ulang
          </button>
        </div>

        {/* Canvas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {SLOTS.map((s) => {
            const p = hydrated ? outfit[s.key] : null;
            return (
              <div key={s.key} className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-white/60 ${s.key === 'top' ? 'row-span-1' : ''}`}>
                <div className="relative aspect-[4/5] bg-cream-2">
                  {p ? (
                    <button type="button" className="h-full w-full" onClick={() => p.source === 'umkm' && openProduct(p.refId)} aria-label={p.name}>
                      <ProductImage src={p.imageUrl} colors={[p.colorHex]} alt={p.name} />
                    </button>
                  ) : (
                    <div className="grid h-full place-items-center px-4 text-center text-xs text-muted">
                      {s.key === 'bottom' && outfit.top && /dress/i.test(outfit.top.name) ? 'Tidak perlu, sudah dress' : s.key === 'outer' ? 'Tidak perlu outer untuk cuaca ini' : 'Belum ada kandidat'}
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-cream/90 px-2 py-0.5 text-[12px] font-semibold text-forest">{s.label}</span>
                  {p && (
                    <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.source === 'wardrobe' ? 'bg-forest text-cream' : 'bg-coral text-forest'}`}>
                      {p.source === 'wardrobe' ? 'Lemari' : 'UMKM'}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="line-clamp-2 font-serif text-[14.5px] leading-snug text-forest">{p?.name ?? '-'}</p>
                  {p && (
                    <p className="mt-0.5 text-xs text-muted">
                      {p.source === 'wardrobe' ? 'Rp 0 . sudah dimiliki' : `${formatIDR(p.price)} . ${p.sellerName}`}
                    </p>
                  )}
                  {p?.fit && <span className={`mt-1.5 w-fit rounded-full px-2 py-0.5 text-[10.5px] font-medium ${fitTone(p.fit.status)}`}>{FIT_LABEL[p.fit.status]} {p.fit.score}%</span>}
                  <button type="button" onClick={() => setSwapSlot(s.key)} className="mt-auto inline-flex min-h-11 items-center gap-1 pt-1 text-xs font-medium text-forest hover:underline">
                    <Repeat className="size-3.5" /> Ganti {s.label.split(' ')[0].toLowerCase()}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-forest p-5 text-cream">
            <p className="text-[12px] text-sage-2">Total biaya</p>
            <p className="mt-1 font-serif text-4xl tabular-nums">{hydrated ? formatIDR(total) : 'Rp 0'}</p>
            {mode !== 'wardrobe' && (
              <>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div className={`h-full rounded-full transition-all ${overBudget ? 'bg-coral' : 'bg-sage-2'}`} style={{ width: `${Math.min(100, (total / budget) * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-cream/70">{overBudget ? `Lewat ${formatIDR(total - budget)} dari budget` : `Sisa ${formatIDR(budget - total)} dari ${formatIDR(budget)}`}</p>
              </>
            )}
            {mode === 'wardrobe' && <p className="mt-2 text-xs text-cream/70">Semua dari lemari sendiri. Tidak ada pengeluaran.</p>}
          </div>

          <div className="rounded-2xl border border-line bg-white/50 p-4">
            <p className="text-sm font-semibold text-forest">Verifikasi ukuran</p>
            <ul className="mt-2 space-y-2 text-[12.5px]">
              {pieces.filter((p) => p.source === 'umkm').length === 0 && <li className="text-muted">Semua item sudah Anda miliki, ukuran sudah terbukti.</li>}
              {pieces
                .filter((p) => p.source === 'umkm')
                .map((p) => (
                  <li key={p.refId} className="flex items-start justify-between gap-2">
                    <span className="min-w-0 text-ink/80">{p.name}<span className="block text-[11px] text-muted">{p.fit?.notes[0] ?? 'Ukuran universal'}</span></span>
                    {p.fit ? <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${fitTone(p.fit.status)}`}>{p.fit.score}%</span> : <Check className="size-4 text-forest" />}
                  </li>
                ))}
            </ul>
            {fitIssues.length > 0 && <p className="mt-3 rounded-lg bg-[#F7E1E3] p-2 text-[12px] text-[#8A2F3B]">{fitIssues.length} item di bawah 70%. Ganti slotnya atau perbarui ukuran tubuh.</p>}
          </div>

          <div className="rounded-2xl border border-line bg-white/50 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-forest"><Compass className="size-4" strokeWidth={1.5} /> Catatan stylist</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/75">
              {weather === 'hujan'
                ? 'Musim hujan: pilih outer berbahan rapat dan sepatu kanvas atau kulit yang tidak licin.'
                : occasion === 'kondangan'
                  ? 'Untuk kondangan siang, satu motif utama sudah cukup. Biarkan aksesori tetap polos.'
                  : `Palet Anda paling hidup dengan warna yang harmoni di atas 80% untuk undertone ${profile.skinTone}.`}
            </p>
          </div>

          <button type="button" disabled={!pieces.length} onClick={() => setSaving(true)} className={`${btnPrimary} w-full`}>
            <BookmarkCheck className="size-4" /> Simpan Racikan
          </button>
        </div>
      </div>

      <SlotSwapper
        slot={swapSlot}
        candidates={swapSlot ? candidates[swapSlot] : []}
        current={swapSlot ? outfit[swapSlot] ?? null : null}
        onClose={() => setSwapSlot(null)}
        onPick={(piece) => {
          if (swapSlot) setOverrides((o) => ({ ...o, [swapSlot]: piece }));
          setSwapSlot(null);
        }}
      />

      <Modal
        open={saving}
        onClose={() => setSaving(false)}
        size="sm"
        title="Simpan racikan"
        footer={
          <div className="flex gap-2">
            <button type="button" className={`${btnGhost} flex-1`} onClick={() => setSaving(false)}>Batal</button>
            <button type="button" className={`${btnPrimary} flex-1`} onClick={save}>Simpan</button>
          </div>
        }
      >
        <div className="p-5">
          <label className={labelCls} htmlFor="outfit-title">Judul racikan</label>
          <input id="outfit-title" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senin ke kantor, nuansa tanah" autoFocus />
          <div className="mt-4 flex gap-2">
            {pieces.map((p) => (
              <div key={p.refId} className="size-14 overflow-hidden rounded-lg border border-line bg-cream-2">
                <ProductImage src={p.imageUrl} colors={[p.colorHex]} alt={p.name} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Total {formatIDR(total)}</p>
        </div>
      </Modal>
    </div>
  );
}

function SlotSwapper({
  slot,
  candidates,
  current,
  onClose,
  onPick,
}: {
  slot: OutfitSlot | null;
  candidates: Candidate[];
  current: OutfitPiece | null;
  onClose: () => void;
  onPick: (p: OutfitPiece | null) => void;
}) {
  const label = SLOTS.find((s) => s.key === slot)?.label ?? '';
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  return (
    <Modal open={!!slot} onClose={onClose} size="lg" title={`Ganti ${label}`}>
      <div className="p-5">
        <p className="mb-4 text-sm text-muted">Kandidat diurutkan dari yang paling serasi dengan undertone, bentuk tubuh, dan acara.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sorted.map((c) => {
            const active = current?.refId === c.piece.refId;
            return (
              <button key={c.piece.refId} type="button" onClick={() => onPick(c.piece)} className={`overflow-hidden rounded-xl border-2 bg-white/60 text-left transition ${active ? 'border-forest' : 'border-transparent hover:border-line-2'}`}>
                <div className="relative aspect-[4/5] bg-cream-2">
                  <ProductImage src={c.piece.imageUrl} colors={[c.piece.colorHex]} alt={c.piece.name} />
                  <span className={`absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ${c.piece.source === 'wardrobe' ? 'bg-forest text-cream' : 'bg-coral text-forest'}`}>
                    {c.piece.source === 'wardrobe' ? 'Lemari' : 'UMKM'}
                  </span>
                </div>
                <div className="p-2">
                  <p className="line-clamp-1 text-[13px] text-forest">{c.piece.name}</p>
                  <p className="text-[11px] text-muted">{c.piece.price ? formatIDR(c.piece.price) : 'Rp 0'}{c.piece.fit ? ` . ${c.piece.fit.score}%` : ''}</p>
                </div>
              </button>
            );
          })}
        </div>
        {sorted.length === 0 && <p className="text-sm text-muted">Belum ada kandidat untuk slot ini di mode sekarang.</p>}
        {(slot === 'outer' || slot === 'bag') && (
          <button type="button" onClick={() => onPick(null)} className={`${btnGhost} mt-4`}>Kosongkan slot</button>
        )}
      </div>
    </Modal>
  );
}
