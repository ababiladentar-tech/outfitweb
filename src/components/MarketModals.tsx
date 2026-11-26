'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Columns2, ExternalLink, Flag, AtSign, MapPin, MessageCircle, Plus, Send } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductImage } from './GarmentArt';
import { DemoNote, Modal, btnGhost, btnPrimary, inputCls, labelCls } from './ui';
import { CATEGORY_LABEL, SELLER_TYPE_LABEL } from '@/lib/data';
import { submitReport } from '@/lib/cloud/sync';
import { useCatalog, useComments, useFollowing, useProfile, useSession, useStores, useTrack } from '@/lib/hooks';
import { evaluateFit, FIT_LABEL, fitTone } from '@/lib/sizing';
import { emitToast, formatCount, formatIDR, uid, useHydrated } from '@/lib/storage';
import { marketplaceName } from './ProductDetailModal';
import type { GarmentMeasurement, UMKMProductPost } from '@/lib/types';

/* ================= Store profile ================= */

export function StoreProfileModal({ storeId, onClose }: { storeId: string | null; onClose: () => void }) {
  const [stores] = useStores();
  const store = stores.find((s) => s.id === storeId) ?? null;
  return (
    <Modal open={!!store} onClose={onClose} size="xl" title={store ? 'Profil Toko' : null}>
      {store && <StoreBody key={store.id} storeId={store.id} />}
    </Modal>
  );
}

function StoreBody({ storeId }: { storeId: string }) {
  const [stores] = useStores();
  const [catalog] = useCatalog();
  const following = useFollowing();
  const track = useTrack();
  const hydrated = useHydrated();
  const store = stores.find((s) => s.id === storeId);
  const [story, setStory] = useState<number | null>(null);

  useEffect(() => {
    track(storeId, 'storeVisits');
  }, [storeId, track]);

  if (!store) return null;
  const items = catalog.filter((p) => p.sellerId === store.id);
  const isFollowing = hydrated && following.has(store.id);
  const followers = store.followerCount + (isFollowing ? 1 : 0);

  const sentences = store.story.split(/(?<=\.)\s+/).filter(Boolean);
  const highlights = [
    { title: 'Cerita Kami', slides: sentences },
    { title: 'Pengrajin', slides: [`${store.name} bekerja bersama pengrajin di ${store.city}.`, store.bio] },
    { title: 'Kirim dari', slides: [`Pengiriman dari ${store.city}.`, 'Pesanan dikemas dengan kertas daur ulang dan dikirim 1 - 2 hari kerja.'] },
  ];

  return (
    <div>
      <div className="relative h-36 md:h-48" style={{ background: store.bannerHex }}>
        <svg className="absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none" viewBox="0 0 400 100">
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d={`M${i * 40 - 40} 100 Q${i * 40} ${20 + (i % 3) * 10} ${i * 40 + 40} 100`} fill="none" stroke="#FAF9F5" strokeWidth="0.8" />
          ))}
        </svg>
      </div>
      <div className="px-5 pb-8 md:px-8">
        <div className="-mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div
              className="grid size-20 place-items-center rounded-full border-4 border-cream font-serif text-3xl text-cream md:size-24"
              style={{ background: store.avatarHex }}
            >
              {store.name.charAt(0)}
            </div>
            <div className="pb-1">
              <h3 className="font-serif text-2xl text-forest md:text-3xl">{store.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                <MapPin className="size-3.5" strokeWidth={1.6} /> Dikirim dari {store.city} . {SELLER_TYPE_LABEL[store.sellerType]}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const added = following.toggle(store.id);
                emitToast(added ? `Mengikuti ${store.name}` : `Berhenti mengikuti ${store.name}`, 'info');
              }}
              className={isFollowing ? btnGhost : btnPrimary}
            >
              {isFollowing ? <Check className="size-4" /> : <Plus className="size-4" />}
              {isFollowing ? 'Mengikuti' : 'Ikuti Toko'}
            </button>
            <a href={`https://wa.me/${store.contactNumber}`} target="_blank" rel="noreferrer" className={btnGhost} onClick={() => track(store.id, 'waChats')}>
              <MessageCircle className="size-4" strokeWidth={1.6} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white/50 text-center">
          <Stat label="Pengikut" value={formatCount(followers)} />
          <Stat label="Produk" value={String(items.length)} />
          <Stat label="Kota" value={store.city} />
        </div>

        <DemoNote className="mt-3">Profil, cerita, dan jumlah pengikut toko ini adalah contoh.</DemoNote>
        <p className="mt-4 text-sm text-ink/80">{store.bio}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          {store.instagram && (
            <span className="inline-flex items-center gap-1 text-muted">
              <AtSign className="size-3.5" strokeWidth={1.6} /> {store.instagram}
            </span>
          )}
          {store.externalShopUrl && (
            <a href={store.externalShopUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-forest underline-offset-2 hover:underline" onClick={() => track(store.id, 'linkClicks')}>
              <ExternalLink className="size-3.5" strokeWidth={1.6} /> Toko di {marketplaceName(store.externalShopUrl)}
            </a>
          )}
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold text-sage-ink">Cerita Kami: Mengapa Membuka Akun di Outfitly</p>
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
            {highlights.map((h, i) => (
              <button key={h.title} type="button" onClick={() => setStory(i)} className="flex shrink-0 flex-col items-center gap-1.5">
                <span className="rounded-full bg-[conic-gradient(#E58B94,#8EA89D,#162D24,#E58B94)] p-[2px]">
                  <span className="grid size-16 place-items-center rounded-full border-2 border-cream font-serif text-lg italic text-cream" style={{ background: store.avatarHex }}>
                    {h.title.charAt(0)}
                  </span>
                </span>
                <span className="text-[11px] text-ink">{h.title}</span>
              </button>
            ))}
          </div>
          <blockquote className="mt-4 border-l-2 border-coral pl-4 font-serif text-[17px] italic leading-relaxed text-forest">
            {store.story}
          </blockquote>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold text-sage-ink">Etalase</p>
          {items.length === 0 ? (
            <p className="text-sm text-muted">Belum ada produk.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          )}
        </div>
      </div>
      {story !== null && (
        <StoryViewer title={highlights[story].title} slides={highlights[story].slides} bg={store.bannerHex} name={store.name} onClose={() => setStory(null)} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3">
      <p className="truncate text-base font-semibold text-forest">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function StoryViewer({ title, slides, bg, name, onClose }: { title: string; slides: string[]; bg: string; name: string; onClose: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (i < slides.length - 1) setI(i + 1);
      else onClose();
    }, 4200);
    return () => window.clearTimeout(t);
  }, [i, slides.length, onClose]);
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-[#0E1A15]/80 p-4" onClick={onClose}>
      <div className="relative flex aspect-[9/16] max-h-[86dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl p-5 text-cream" style={{ background: `linear-gradient(160deg, ${bg}, #162D24)` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1">
          {slides.map((_, k) => (
            <span key={k} className="h-0.5 flex-1 overflow-hidden rounded bg-cream/30">
              <span className={`block h-full bg-cream ${k < i ? 'w-full' : k === i ? 'w-full origin-left animate-[grow_4.2s_linear]' : 'w-0'}`} style={k === i ? { animation: 'grow 4.2s linear' } : undefined} />
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs opacity-80">{name} . {title}</p>
        <p className="my-auto font-serif text-2xl italic leading-snug">{slides[i]}</p>
        <div className="flex justify-between text-xs">
          <button type="button" onClick={() => setI(Math.max(0, i - 1))} className="rounded-full border border-cream/40 px-3 py-1.5">Sebelumnya</button>
          <button type="button" onClick={onClose} className="rounded-full border border-cream/40 px-3 py-1.5">Tutup</button>
        </div>
        <style>{'@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}'}</style>
      </div>
    </div>
  );
}

/* ================= Size comparison ================= */

interface Side {
  productId: string;
  sizeLabel: string;
}

function paramsFor(p: UMKMProductPost): { key: keyof GarmentMeasurement; label: string }[] {
  if (p.category === 'shoes') return [{ key: 'insoleCm', label: 'Panjang insole' }];
  if (p.category === 'bag') return [
    { key: 'bagLengthCm', label: 'Panjang' },
    { key: 'bagWidthCm', label: 'Lebar' },
    { key: 'bagHeightCm', label: 'Tinggi' },
  ];
  if (p.category === 'pants' || p.category === 'jeans') return [
    { key: 'waistCm', label: 'Lingkar pinggang (LP)' },
    { key: 'hipsCm', label: 'Lingkar pinggul' },
    { key: 'garmentLengthCm', label: 'Panjang' },
  ];
  return [
    { key: 'chestBustCm', label: 'Lingkar dada (LD)' },
    { key: 'waistCm', label: 'Lingkar pinggang (LP)' },
    { key: 'shoulderWidthCm', label: 'Lebar bahu' },
    { key: 'garmentLengthCm', label: 'Panjang' },
  ];
}

const sameGroup = (a: UMKMProductPost, b: UMKMProductPost): boolean => {
  const g = (c: UMKMProductPost['category']): string => (c === 'jeans' || c === 'pants' ? 'bottom' : c === 'top' || c === 'outerwear' || c === 'dress' ? 'top' : c);
  return g(a.category) === g(b.category);
};

export function SizeComparisonModal({ initial, onClose }: { initial: [string, string] | null; onClose: () => void }) {
  return (
    <Modal open={!!initial} onClose={onClose} size="lg" title={<span className="inline-flex items-center gap-2"><Columns2 className="size-4" strokeWidth={1.6} /> Perbandingan Ukuran</span>}>
      {initial && <CompareBody key={initial.join('-')} initial={initial} />}
    </Modal>
  );
}

function CompareBody({ initial }: { initial: [string, string] }) {
  const [catalog] = useCatalog();
  const [profile] = useProfile();
  const pick = (id: string): UMKMProductPost => catalog.find((p) => p.id === id) ?? catalog[0];
  const pA = pick(initial[0]);
  const defaultB = initial[1] && initial[1] !== initial[0] ? pick(initial[1]) : pA;
  const [a, setA] = useState<Side>({ productId: pA.id, sizeLabel: pA.availableSizes[0]?.sizeLabel ?? '' });
  const [b, setB] = useState<Side>({
    productId: defaultB.id,
    sizeLabel: defaultB.id === pA.id ? (pA.availableSizes[1] ?? pA.availableSizes[0])?.sizeLabel ?? '' : defaultB.availableSizes[0]?.sizeLabel ?? '',
  });

  const prodA = pick(a.productId);
  const prodB = pick(b.productId);
  const sizeA = prodA.availableSizes.find((s) => s.sizeLabel === a.sizeLabel) ?? prodA.availableSizes[0];
  const sizeB = prodB.availableSizes.find((s) => s.sizeLabel === b.sizeLabel) ?? prodB.availableSizes[0];
  const fitA = evaluateFit(prodA, sizeA, profile.measurements);
  const fitB = evaluateFit(prodB, sizeB, profile.measurements);
  const params = paramsFor(prodA);
  const comparable = sameGroup(prodA, prodB);

  const summary = useMemo(() => {
    const lines: string[] = [];
    if (!comparable) {
      lines.push(`Kedua produk berasal dari kategori berbeda (${CATEGORY_LABEL[prodA.category]} dan ${CATEGORY_LABEL[prodB.category]}), jadi bandingkan kecocokannya masing-masing terhadap tubuh Anda, bukan angka cm satu sama lain.`);
    }
    const winner = fitA.score === fitB.score ? null : fitA.score > fitB.score ? 'A' : 'B';
    if (winner) {
      const w = winner === 'A' ? { p: prodA, s: sizeA, f: fitA } : { p: prodB, s: sizeB, f: fitB };
      lines.push(`Pilihan ${winner} (${w.p.title}, ukuran ${w.s.sizeLabel}) lebih pas dengan skor ${w.f.score}%.`);
    } else {
      lines.push('Keduanya memiliki tingkat kecocokan yang sama. Tentukan dari bahan dan siluet yang Anda sukai.');
    }
    const stretchA = !!prodA.stretch;
    const stretchB = !!prodB.stretch;
    if (stretchA !== stretchB) {
      const ns = stretchA ? prodB : prodA;
      lines.push(`${ns.title} tidak memiliki serat elastis. Untuk bahan non-stretch seperti denim selvedge, beri kelonggaran pinggang 2 - 3 cm dibanding katun twill dengan spandex.`);
    }
    if (prodA.category === 'shoes' || prodB.category === 'shoes') {
      lines.push('Untuk sepatu, sisakan ruang 0,5 - 1,5 cm dari panjang telapak kaki. Kulit nabati akan sedikit melebar, kanvas cenderung tetap.');
    }
    if (prodA.category === 'bag') lines.push('Untuk tas, perhatikan tinggi minimal 28 cm jika ingin memuat laptop 14 inci.');
    return lines;
  }, [comparable, prodA, prodB, sizeA, sizeB, fitA, fitB]);

  const columns: { side: Side; set: (s: Side) => void; prod: UMKMProductPost; size: GarmentMeasurement; fit: ReturnType<typeof evaluateFit>; tag: string }[] = [
    { side: a, set: setA, prod: prodA, size: sizeA, fit: fitA, tag: 'A' },
    { side: b, set: setB, prod: prodB, size: sizeB, fit: fitB, tag: 'B' },
  ];
  const showFit = prodA.category !== 'bag' && prodA.category !== 'hijab';

  return (
    <div className="p-5 md:p-7">
      <div className="grid grid-cols-2 gap-3 md:gap-5">
        {columns.map((c) => (
          <div key={c.tag} className="min-w-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream-2">
              <ProductImage src={c.prod.imageUrl} colors={c.prod.colorHex} alt={c.prod.title} />
              <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-forest font-serif text-sm text-cream">{c.tag}</span>
            </div>
            <label className={`${labelCls} mt-3`}>Produk</label>
            <select
              className={inputCls}
              value={c.side.productId}
              onChange={(e) => {
                const np = pick(e.target.value);
                c.set({ productId: np.id, sizeLabel: np.availableSizes[0]?.sizeLabel ?? '' });
              }}
            >
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <label className={`${labelCls} mt-2`}>Varian ukuran</label>
            <select className={inputCls} value={c.size?.sizeLabel} onChange={(e) => c.set({ ...c.side, sizeLabel: e.target.value })}>
              {c.prod.availableSizes.map((s) => (
                <option key={s.sizeLabel} value={s.sizeLabel}>
                  {s.sizeLabel}
                </option>
              ))}
            </select>
            <p className="mt-2 truncate text-xs text-muted">{c.prod.material ?? '-'} . {formatIDR(c.prod.price)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs text-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Parameter</th>
              <th className="px-3 py-2 text-right font-medium">A</th>
              <th className="px-3 py-2 text-right font-medium">B</th>
              <th className="px-3 py-2 text-right font-medium">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => {
              const va = sizeA?.[p.key] as number | undefined;
              const vb = sizeB?.[p.key] as number | undefined;
              const diff = va !== undefined && vb !== undefined ? vb - va : undefined;
              const f = (n?: number): string => (n === undefined ? '-' : `${String(n).replace('.', ',')} cm`);
              return (
                <tr key={p.key} className="border-t border-line">
                  <td className="px-3 py-2 text-muted">{p.label}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{f(va)}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{f(vb)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted">
                    {diff === undefined ? '-' : `${diff > 0 ? '+' : ''}${String(Math.round(diff * 10) / 10).replace('.', ',')}`}
                  </td>
                </tr>
              );
            })}
            {showFit && (
              <tr className="border-t border-line bg-white/50">
                <td className="px-3 py-2 text-muted">Kecocokan tubuh</td>
                {[fitA, fitB].map((f, i) => (
                  <td key={i} className="px-3 py-2 text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${fitTone(f.status)}`}>
                      {FIT_LABEL[f.status]} {f.score}%
                    </span>
                  </td>
                ))}
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-2xl bg-forest p-4 text-cream md:p-5">
        <p className="text-[12px] font-semibold text-sage-2">Ringkasan Stylist</p>
        <ul className="mt-2 space-y-2 text-[13.5px] leading-relaxed">
          {summary.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ================= Comments & report ================= */

export function CommentsModal({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  const [comments, setComments] = useComments();
  const [session] = useSession();
  const [catalog] = useCatalog();
  const [text, setText] = useState('');
  const product = catalog.find((p) => p.id === productId);
  const list = comments.filter((c) => c.productId === productId);
  const submit = (): void => {
    if (!productId || !text.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: uid('cm'), productId, author: session?.name ?? 'Tamu', text: text.trim(), createdAt: new Date().toISOString() },
    ]);
    setText('');
    emitToast('Komentar terkirim');
  };
  return (
    <Modal
      open={!!productId}
      onClose={onClose}
      size="sm"
      title="Komentar"
      footer={
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pengalaman ukuran atau bahan..." />
          <button type="submit" className={`${btnPrimary} px-4`} disabled={!text.trim()} aria-label="Kirim komentar">
            <Send className="size-4" />
          </button>
        </form>
      }
    >
      <div className="p-5">
        {product && <p className="mb-4 font-serif text-lg text-forest">{product.title}</p>}
        {list.length === 0 && <p className="text-sm text-muted">Belum ada komentar. Jadilah yang pertama.</p>}
        <ul className="space-y-4">
          {list.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sage-soft text-xs font-semibold text-forest">{c.author.charAt(0)}</span>
              <div>
                <p className="text-sm font-semibold text-forest">{c.author}</p>
                <p className="text-sm text-ink/80">{c.text}</p>
                <p className="mt-0.5 text-[11px] text-muted">{new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

const REASONS = ['Foto tidak sesuai barang', 'Ukuran cm tidak akurat', 'Harga mencurigakan', 'Produk tiruan', 'Lainnya'];

export function ReportModal({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  return (
    <Modal
      open={!!productId}
      onClose={onClose}
      size="sm"
      title={<span className="inline-flex items-center gap-2"><Flag className="size-4" strokeWidth={1.6} /> Laporkan Produk</span>}
      footer={
        <div className="flex gap-2">
          <button type="button" className={`${btnGhost} flex-1`} onClick={onClose}>Batal</button>
          <button
            type="button"
            className={`${btnPrimary} flex-1`}
            onClick={() => {
              if (productId) submitReport(productId, note.trim() ? `${reason}: ${note.trim()}` : reason).catch(() => undefined);
              emitToast('Laporan diterima. Tim kurasi akan meninjau dalam 1 x 24 jam.');
              setNote('');
              onClose();
            }}
          >
            Kirim Laporan
          </button>
        </div>
      }
    >
      <div className="space-y-2 p-5">
        {REASONS.map((r) => (
          <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm ${reason === r ? 'border-forest bg-sage-soft' : 'border-line'}`}>
            <input type="radio" name="reason" className="accent-[#162D24]" checked={reason === r} onChange={() => setReason(r)} />
            {r}
          </label>
        ))}
        <textarea className={`${inputCls} mt-2 min-h-24`} placeholder="Ceritakan detailnya (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
}
