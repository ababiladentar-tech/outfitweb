'use client';

import { useMemo, useState } from 'react';
import { Check, Heart, PenLine, Search, SlidersHorizontal, Store, Trash2 } from 'lucide-react';
import { useApp } from './AppContext';
import { ProductImage } from './GarmentArt';
import { ProductCard } from './ProductCard';
import { Chip, DemoNote, Modal, Toggle, btnGhost, btnPrimary, inputCls } from './ui';
import { CATEGORY_LABEL, COMMUNITY_POSTS, CONDITION_LABEL, SELLER_TYPE_LABEL } from '@/lib/data';
import { vibeScore } from '@/lib/color';
import { useCatalog, useCommunityLikes, useCommunityPosts, useProfile, useSavedOutfits, useSession } from '@/lib/hooks';
import { bestSize } from '@/lib/sizing';
import { emitToast, formatIDR, uid, useHydrated } from '@/lib/storage';
import type { CommunityPost, ProductCategory, ProductCondition, SellerType } from '@/lib/types';

type SourceFilter = 'all' | SellerType;
type SortKey = 'new' | 'cheap' | 'popular' | 'fit';

interface Filters {
  source: SourceFilter;
  categories: ProductCategory[];
  conditions: ProductCondition[];
  colors: string[];
  sizes: string[];
  maxPrice: number;
  smartFit: boolean;
  vibe: boolean;
}

const PRICE_CAP = 700000;
const INITIAL: Filters = { source: 'all', categories: [], conditions: [], colors: [], sizes: [], maxPrice: PRICE_CAP, smartFit: false, vibe: false };

const toggleIn = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function CatalogView() {
  const [tab, setTab] = useState<'catalog' | 'feed'>('catalog');
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 md:px-8 md:pt-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-[34px] leading-tight text-forest md:text-[46px]">
            {tab === 'catalog' ? <>Katalog <em>UMKM</em> &amp; Preloved</> : <>Feed <em>Komunitas</em> Gaya</>}
          </h1>
          <DemoNote className="mt-3" />
        </div>
        <div className="grid grid-cols-2 rounded-full border border-line bg-cream-2 p-1 text-sm md:w-[380px]">
          {([
            ['catalog', 'Katalog Produk UMKM'],
            ['feed', 'Feed Komunitas Gaya'],
          ] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full px-3 py-2 text-[13px] transition ${tab === k ? 'bg-forest text-cream' : 'text-forest'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">{tab === 'catalog' ? <Catalog /> : <Feed />}</div>
    </div>
  );
}

function Catalog() {
  const [catalog] = useCatalog();
  const [profile] = useProfile();
  const hydrated = useHydrated();
  const [f, setF] = useState<Filters>(INITIAL);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('new');
  const [drawer, setDrawer] = useState(false);

  const colorOptions = useMemo(() => Array.from(new Set(catalog.map((p) => p.colorFamily))).sort(), [catalog]);
  const sizeOptions = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((p) => p.availableSizes.forEach((s) => set.add(s.sizeLabel.split(' ')[0])));
    return Array.from(set);
  }, [catalog]);

  const results = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const rows = catalog
      .map((p) => ({ p, fit: bestSize(p, profile.measurements), vibe: vibeScore(p, profile.skinTone, profile.bodyShape) }))
      .filter(({ p, fit, vibe }) => {
        if (f.source !== 'all' && p.sellerType !== f.source) return false;
        if (f.categories.length && !f.categories.includes(p.category)) return false;
        if (f.conditions.length && !f.conditions.includes(p.condition)) return false;
        if (f.colors.length && !f.colors.includes(p.colorFamily)) return false;
        if (f.sizes.length && !p.availableSizes.some((s) => f.sizes.includes(s.sizeLabel.split(' ')[0]))) return false;
        if (p.price > f.maxPrice) return false;
        if (f.smartFit && hydrated && fit.fit.score < 70) return false;
        if (f.vibe && hydrated && vibe < 78) return false;
        if (ql && !`${p.title} ${p.sellerName} ${p.sellerCity} ${p.tags.join(' ')} ${p.material ?? ''}`.toLowerCase().includes(ql)) return false;
        return true;
      });
    rows.sort((a, b) => {
      if (sort === 'cheap') return a.p.price - b.p.price;
      if (sort === 'popular') return b.p.likes + b.p.saves - (a.p.likes + a.p.saves);
      if (sort === 'fit') return b.fit.fit.score - a.fit.fit.score;
      if (f.vibe) return b.vibe - a.vibe;
      return b.p.createdAt.localeCompare(a.p.createdAt);
    });
    return rows.map((r) => r.p);
  }, [catalog, profile, f, q, sort, hydrated]);

  const activeCount =
    (f.source !== 'all' ? 1 : 0) + f.categories.length + f.conditions.length + f.colors.length + f.sizes.length + (f.maxPrice < PRICE_CAP ? 1 : 0) + (f.smartFit ? 1 : 0) + (f.vibe ? 1 : 0);

  const panel = <FilterPanel f={f} setF={setF} colorOptions={colorOptions} sizeOptions={sizeOptions} />;

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2 scrollbar-none">{panel}</div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 basis-60">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input className={`${inputCls} rounded-full pl-10`} placeholder="Cari linen, batik, Denim Lab..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button type="button" onClick={() => setDrawer(true)} className={`${btnGhost} px-4 py-2.5 lg:hidden`}>
            <SlidersHorizontal className="size-4" strokeWidth={1.6} /> Filter{activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-forest text-[10px] text-cream">{activeCount}</span>}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-full border border-line-2 bg-white/60 px-4 py-2.5 text-sm text-forest" aria-label="Urutkan">
            <option value="new">Terbaru</option>
            <option value="popular">Terpopuler</option>
            <option value="cheap">Harga terendah</option>
            <option value="fit">Paling pas</option>
          </select>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'umkm', 'community_preloved', 'collab_mitra'] as const).map((s) => (
            <Chip key={s} active={f.source === s} onClick={() => setF({ ...f, source: s })}>
              {s === 'all' ? 'Semua' : SELLER_TYPE_LABEL[s]}
            </Chip>
          ))}
          <Chip active={f.smartFit} onClick={() => setF({ ...f, smartFit: !f.smartFit })}>Ukuran Pas</Chip>
          <Chip active={f.vibe} onClick={() => setF({ ...f, vibe: !f.vibe })}>Vibe Match</Chip>
        </div>

        <p className="mt-4 text-xs text-muted">
          {results.length} produk{activeCount > 0 && (
            <button type="button" onClick={() => setF(INITIAL)} className="ml-2 text-forest underline underline-offset-2">Hapus filter</button>
          )}
        </p>

        {results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line-2 p-10 text-center">
            <p className="font-serif text-2xl text-forest">Belum ada yang cocok</p>
            <p className="mt-1 text-sm text-muted">Longgarkan filter ukuran atau harga untuk melihat lebih banyak kurasi.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={drawer}
        onClose={() => setDrawer(false)}
        variant="drawer-right"
        title="Filter"
        footer={
          <div className="flex gap-2">
            <button type="button" className={`${btnGhost} flex-1`} onClick={() => setF(INITIAL)}>Atur ulang</button>
            <button type="button" className={`${btnPrimary} flex-1`} onClick={() => setDrawer(false)}>Tampilkan {results.length}</button>
          </div>
        }
      >
        <div className="p-5">{panel}</div>
      </Modal>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-4 first:pt-0">
      <p className="mb-2.5 text-[12px] font-semibold text-muted">{title}</p>
      {children}
    </div>
  );
}

function FilterPanel({ f, setF, colorOptions, sizeOptions }: { f: Filters; setF: (f: Filters) => void; colorOptions: string[]; sizeOptions: string[] }) {
  return (
    <div>
      <FilterGroup title="Kesesuaian">
        <div className="space-y-4">
          <Toggle checked={f.smartFit} onChange={(v) => setF({ ...f, smartFit: v })} label="Smart Fit Hanya Ukuran Pas" hint="Kecocokan minimal 70% dengan ukuran cm Anda" />
          <Toggle checked={f.vibe} onChange={(v) => setF({ ...f, vibe: v })} label="Vibe Match" hint="Selaras undertone kulit dan bentuk tubuh" />
        </div>
      </FilterGroup>
      <FilterGroup title="Sumber Penjual">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'umkm', 'community_preloved', 'collab_mitra'] as const).map((s) => (
            <Chip key={s} active={f.source === s} onClick={() => setF({ ...f, source: s })}>{s === 'all' ? 'Semua' : SELLER_TYPE_LABEL[s]}</Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Kategori">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_LABEL) as ProductCategory[]).map((c) => (
            <Chip key={c} active={f.categories.includes(c)} onClick={() => setF({ ...f, categories: toggleIn(f.categories, c) })}>{CATEGORY_LABEL[c]}</Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Kondisi Produk">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CONDITION_LABEL) as ProductCondition[]).map((c) => (
            <Chip key={c} active={f.conditions.includes(c)} onClick={() => setF({ ...f, conditions: toggleIn(f.conditions, c) })}>{CONDITION_LABEL[c]}</Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Warna">
        <div className="flex flex-wrap gap-1.5">
          {colorOptions.map((c) => (
            <Chip key={c} active={f.colors.includes(c)} onClick={() => setF({ ...f, colors: toggleIn(f.colors, c) })}>{c}</Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Varian Ukuran">
        <div className="flex flex-wrap gap-1.5">
          {sizeOptions.map((s) => (
            <Chip key={s} active={f.sizes.includes(s)} onClick={() => setF({ ...f, sizes: toggleIn(f.sizes, s) })}>{s}</Chip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Rentang Harga">
        <input type="range" min={50000} max={PRICE_CAP} step={25000} value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: Number(e.target.value) })} className="w-full" aria-label="Harga maksimal" />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>Rp 50.000</span>
          <span className="font-semibold text-forest">{f.maxPrice >= PRICE_CAP ? 'Semua harga' : `s/d ${formatIDR(f.maxPrice)}`}</span>
        </div>
      </FilterGroup>
    </div>
  );
}

const OCC_OPTIONS = ['Kuliah', 'Kantor', 'Kasual', 'Kondangan', 'Weekend'];

function Feed() {
  const [catalog] = useCatalog();
  const [likes, setLikes] = useCommunityLikes();
  const [own, setOwn] = useCommunityPosts();
  const [session] = useSession();
  const hydrated = useHydrated();
  const { openProduct, openAuth } = useApp();
  const [occ, setOcc] = useState('Semua');
  const [composing, setComposing] = useState(false);
  const all: CommunityPost[] = [...(hydrated ? own : []), ...COMMUNITY_POSTS];
  const occasions = ['Semua', ...OCC_OPTIONS];
  const posts = all.filter((p) => occ === 'Semua' || p.occasion === occ);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 scrollbar-none">
          {occasions.map((o) => (
            <Chip key={o} active={occ === o} onClick={() => setOcc(o)}>{o}</Chip>
          ))}
        </div>
        <button type="button" className={btnPrimary} onClick={() => (session ? setComposing(true) : openAuth('login'))}>
          <PenLine className="size-4" strokeWidth={1.6} aria-hidden /> Bagikan Racikan
        </button>
      </div>
      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line-2 p-10 text-center">
          <p className="font-serif text-2xl text-forest">Belum ada racikan untuk {occ.toLowerCase()}</p>
          <p className="mt-1 text-sm text-muted">Bagikan racikan Anda dari Studio atau pilih produk katalog.</p>
        </div>
      ) : (
        <div className="mt-5 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {posts.map((post) => {
            const liked = hydrated && likes.includes(post.id);
            const products = post.productIds.map((id) => catalog.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);
            const tiles = post.pieces?.length
              ? post.pieces.map((pc) => ({ key: pc.refId, src: pc.imageUrl, colors: [pc.colorHex], label: pc.name, productId: pc.source === 'umkm' ? pc.refId : null }))
              : products.map((p) => ({ key: p.id, src: p.imageUrl, colors: p.colorHex, label: p.title, productId: p.id as string | null }));
            return (
              <article key={post.id} className="mb-5 break-inside-avoid overflow-hidden rounded-[20px] border border-line bg-white/60">
                <div className="grid grid-cols-3 gap-0.5 bg-line">
                  {tiles.slice(0, 3).map((t, i) => (
                    <button key={t.key} type="button" disabled={!t.productId} onClick={() => t.productId && openProduct(t.productId)} className={`overflow-hidden bg-cream-2 disabled:cursor-default ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`} aria-label={t.productId ? `Lihat ${t.label}` : t.label}>
                      <ProductImage src={t.src} colors={t.colors} alt="" />
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sage-soft font-serif text-sm text-forest" aria-hidden>{post.author.charAt(0)}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-forest">{post.author}</p>
                        <p className="text-[12px] text-muted">{[post.city, post.occasion].filter(Boolean).join(' . ')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLikes((prev) => toggleIn(prev, post.id))}
                      className="inline-flex min-h-11 items-center gap-1 rounded-full px-2.5 text-xs hover:bg-cream-2"
                      aria-label={liked ? 'Batal suka' : 'Suka'}
                      aria-pressed={liked}
                    >
                      <Heart className={`size-4 ${liked ? 'fill-coral-ink text-coral-ink' : ''}`} strokeWidth={1.6} aria-hidden />
                      {post.likes + (liked ? 1 : 0)}
                    </button>
                  </div>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-ink/85">{post.caption}</p>
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full" aria-hidden>
                    {post.paletteHex.map((c, i) => (
                      <span key={c + i} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {post.isDemo && <span className="rounded-md border border-dashed border-line-2 px-2 py-0.5 text-[11.5px] text-muted">Contoh data demo</span>}
                    {post.isOwn && (
                      <>
                        <span className="rounded-md bg-sage-soft px-2 py-0.5 text-[11.5px] text-forest">Postingan Anda</span>
                        <button type="button" onClick={() => { setOwn((prev) => prev.filter((x) => x.id !== post.id)); emitToast('Postingan dihapus', 'info'); }} className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-[12px] text-muted hover:text-[#8A2F3B]">
                          <Trash2 className="size-3.5" aria-hidden /> Hapus
                        </button>
                      </>
                    )}
                    {products.map((p) => (
                      <button key={p.id} type="button" onClick={() => openProduct(p.id)} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-cream-3 px-2.5 text-[12px] text-forest hover:bg-sage-soft">
                        <Store className="size-3" strokeWidth={1.6} aria-hidden /> {p.sellerName}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <CreatePostModal open={composing} onClose={() => setComposing(false)} onPost={(p) => setOwn((prev) => [p, ...prev])} author={session?.name ?? 'Anda'} />
    </div>
  );
}

function CreatePostModal({ open, onClose, onPost, author }: { open: boolean; onClose: () => void; onPost: (p: CommunityPost) => void; author: string }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Bagikan racikan">
      {open && <CreatePostBody onClose={onClose} onPost={onPost} author={author} />}
    </Modal>
  );
}

function CreatePostBody({ onClose, onPost, author }: { onClose: () => void; onPost: (p: CommunityPost) => void; author: string }) {
  const [saved] = useSavedOutfits();
  const [catalog] = useCatalog();
  const [source, setSource] = useState<'outfit' | 'products'>(saved.length ? 'outfit' : 'products');
  const [outfitId, setOutfitId] = useState(saved[0]?.id ?? '');
  const [picked, setPicked] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [occasion, setOccasion] = useState(OCC_OPTIONS[0]);
  const [city, setCity] = useState('');

  const outfit = saved.find((o) => o.id === outfitId);
  const ready = caption.trim().length >= 10 && (source === 'outfit' ? !!outfit : picked.length > 0);

  const submit = (): void => {
    if (!ready) return;
    const pieces = source === 'outfit' && outfit ? outfit.pieces : undefined;
    const productIds = source === 'outfit' && outfit ? outfit.pieces.filter((p) => p.source === 'umkm').map((p) => p.refId) : picked;
    const palette = pieces ? pieces.map((p) => p.colorHex) : picked.map((id) => catalog.find((p) => p.id === id)?.colorHex[0] ?? '#8B8C88');
    onPost({
      id: uid('c'),
      author,
      city: city.trim(),
      caption: caption.trim(),
      occasion,
      productIds,
      pieces,
      paletteHex: palette.slice(0, 5),
      likes: 0,
      createdAt: new Date().toISOString(),
      isOwn: true,
    });
    emitToast('Racikan dibagikan ke Feed Komunitas');
    onClose();
  };

  return (
    <div className="space-y-5 p-5 md:p-6">
      <div className="grid grid-cols-2 rounded-full bg-cream-3 p-1 text-sm" role="tablist" aria-label="Sumber racikan">
        {([
          ['outfit', 'Racikan tersimpan'],
          ['products', 'Pilih produk'],
        ] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={source === k} onClick={() => setSource(k)} className={`min-h-10 rounded-full transition ${source === k ? 'bg-forest text-cream' : 'text-forest hover:bg-white/60'}`}>{l}</button>
        ))}
      </div>

      {source === 'outfit' ? (
        saved.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line-2 p-4 text-sm text-muted">Belum ada racikan tersimpan. Simpan satu dari Studio Padu Padan, atau pilih produk katalog.</p>
        ) : (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-xs font-medium text-muted">Pilih racikan</legend>
            {saved.map((o) => (
              <label key={o.id} className={`flex items-center gap-3 rounded-xl border p-2.5 ${outfitId === o.id ? 'border-forest bg-sage-soft' : 'border-line'}`}>
                <input type="radio" name="outfit" className="accent-[#162D24]" checked={outfitId === o.id} onChange={() => setOutfitId(o.id)} />
                <span className="flex gap-1">
                  {o.pieces.slice(0, 4).map((p) => (
                    <span key={p.refId} className="size-10 overflow-hidden rounded-md bg-cream-2"><ProductImage src={p.imageUrl} colors={[p.colorHex]} alt="" /></span>
                  ))}
                </span>
                <span className="min-w-0 truncate text-sm text-forest">{o.title}</span>
              </label>
            ))}
          </fieldset>
        )
      ) : (
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-muted">Pilih sampai 4 produk ({picked.length}/4)</legend>
          <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
            {catalog.map((p) => {
              const on = picked.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={p.title}
                  onClick={() => setPicked((prev) => (on ? prev.filter((x) => x !== p.id) : prev.length < 4 ? [...prev, p.id] : prev))}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-cream-2 ${on ? 'border-forest' : 'border-transparent hover:border-line-2'}`}
                >
                  <ProductImage src={p.imageUrl} colors={p.colorHex} alt="" />
                  {on && <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-forest text-cream"><Check className="size-3" aria-hidden /></span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="post-occ" className="mb-1.5 block text-xs font-medium text-muted">Acara</label>
          <select id="post-occ" className={inputCls} value={occasion} onChange={(e) => setOccasion(e.target.value)}>
            {OCC_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="post-city" className="mb-1.5 block text-xs font-medium text-muted">Kota (opsional)</label>
          <input id="post-city" className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kota Anda" maxLength={30} />
        </div>
      </div>
      <div>
        <label htmlFor="post-caption" className="mb-1.5 block text-xs font-medium text-muted">Cerita racikan</label>
        <textarea id="post-caption" className={`${inputCls} min-h-24`} value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 280))} placeholder="Kenapa kombinasi ini cocok, ukuran yang Anda pakai, dan acaranya." />
        <p className={`mt-1 text-right text-[12px] ${caption.trim().length > 0 && caption.trim().length < 10 ? 'text-[#8A2F3B]' : 'text-muted'}`}>
          {caption.trim().length > 0 && caption.trim().length < 10 ? 'Minimal 10 karakter. ' : ''}{caption.length}/280
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" className={`${btnGhost} flex-1`} onClick={onClose}>Batal</button>
        <button type="button" className={`${btnPrimary} flex-1`} disabled={!ready} onClick={submit}>Bagikan</button>
      </div>
    </div>
  );
}
