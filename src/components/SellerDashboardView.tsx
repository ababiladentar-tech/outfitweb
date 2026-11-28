'use client';

import { useRef, useState } from 'react';
import { BarChart3, Bookmark, Eye, ImagePlus, Link2, MessageCircle, MousePointerClick, Package, Plus, Settings, Store, Trash2, Upload } from 'lucide-react';
import { useApp } from './AppContext';
import { ProductImage } from './GarmentArt';
import { btnGhost, btnPrimary, inputCls, labelCls } from './ui';
import { CATEGORY_LABEL, CITIES, CONDITION_LABEL, SELLER_TYPE_LABEL, STYLE_LABEL } from '@/lib/data';
import { compressImage, extractGarmentInfo, nearestColorName } from '@/lib/color';
import { useAnalytics, useBecomeMitra, useCatalog, useIsMitra, useNotifications, useSellerStoreId, useSession, useStores } from '@/lib/hooks';
import { cloudEnabled } from '@/lib/cloud/client';
import { claimStore } from '@/lib/cloud/sync';
import { emitToast, formatCount, formatIDR, uid, useHydrated } from '@/lib/storage';
import type { GarmentMeasurement, ProductCategory, ProductCondition, StoreProfile, UMKMProductPost } from '@/lib/types';

type Tab = 'catalog' | 'upload' | 'traffic' | 'profile';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'catalog', label: 'Katalog & Penjualan', icon: <Package className="size-4" strokeWidth={1.5} /> },
  { key: 'upload', label: 'Upload Produk & Link', icon: <Upload className="size-4" strokeWidth={1.5} /> },
  { key: 'traffic', label: 'Traffic & Viewers', icon: <BarChart3 className="size-4" strokeWidth={1.5} /> },
  { key: 'profile', label: 'Profil & Spesifikasi Toko', icon: <Settings className="size-4" strokeWidth={1.5} /> },
];

export function SellerDashboardView() {
  const [allStores] = useStores();
  const [session] = useSession();
  const [storeId, setStoreId] = useSellerStoreId();
  const [tab, setTab] = useState<Tab>('catalog');
  const [adding, setAdding] = useState(false);
  const hydrated = useHydrated();
  const isMitra = useIsMitra();
  const cloud = cloudEnabled();
  // Hosted mode: a seller only manages stores tied to their account.
  const stores = cloud ? allStores.filter((s) => session?.id && s.ownerId === session.id) : allStores;
  const store = stores.find((s) => s.id === storeId) ?? stores[0];

  if (hydrated && !isMitra) return <MitraGate signedIn={!!session} />;

  if (cloud && hydrated && (!session?.id || !store || adding)) {
    return <StoreSetup signedIn={!!session?.id} onReady={(id) => { setStoreId(id); setAdding(false); setTab('catalog'); }} onCancel={store ? () => setAdding(false) : undefined} />;
  }
  if (!store) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-[34px] leading-tight text-forest md:text-[46px]">Dashboard <em>{store.name}</em></h1>
          <p className="mt-1 text-sm text-muted">{SELLER_TYPE_LABEL[store.sellerType]} . {store.city}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          <Store className="size-4" strokeWidth={1.5} /> Kelola toko
          <select className="min-h-11 rounded-full border border-line-2 bg-white px-3 text-sm text-forest" value={store.id} onChange={(e) => setStoreId(e.target.value)}>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {cloud && (
            <button type="button" onClick={() => setAdding(true)} className="grid size-11 place-items-center rounded-full border border-line-2 text-forest hover:bg-cream-2" aria-label="Tambah toko">
              <Plus className="size-4" />
            </button>
          )}
        </label>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm transition ${tab === t.key ? 'border-forest text-forest' : 'border-transparent text-muted hover:text-forest'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'catalog' && <CatalogTab store={store} onUpload={() => setTab('upload')} />}
        {tab === 'upload' && <UploadTab key={store.id} store={store} onDone={() => setTab('catalog')} />}
        {tab === 'traffic' && <TrafficTab store={store} />}
        {tab === 'profile' && <ProfileTab key={store.id} store={store} />}
      </div>
    </div>
  );
}

function CatalogTab({ store, onUpload }: { store: StoreProfile; onUpload: () => void }) {
  const [catalog, setCatalog] = useCatalog();
  const { openProduct } = useApp();
  const hydrated = useHydrated();
  const items = hydrated ? catalog.filter((p) => p.sellerId === store.id) : [];
  const update = (id: string, patch: Partial<UMKMProductPost>): void => setCatalog((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{items.length} produk . {items.filter((i) => i.isAvailable).length} dibuka</p>
        <button type="button" className={btnPrimary} onClick={onUpload}><Plus className="size-4" /> Produk Baru</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white/50">
        {items.length === 0 && <p className="p-8 text-center text-sm text-muted">Belum ada produk. Unggah produk pertama Anda.</p>}
        <ul className="divide-y divide-line">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 md:flex-nowrap md:gap-4 md:p-4">
              <button type="button" onClick={() => openProduct(p.id)} className="size-16 shrink-0 overflow-hidden rounded-lg bg-cream-2">
                <ProductImage src={p.imageUrl} colors={p.colorHex} alt={p.title} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[15px] text-forest">{p.title}</p>
                <p className="text-xs text-muted">{CATEGORY_LABEL[p.category]} . {formatIDR(p.price)} . stok {p.stockCount} . {p.likes} suka . {p.saves} simpan</p>
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <div className="flex items-center rounded-full border border-line-2 bg-white">
                  <button type="button" className="grid size-11 place-items-center text-sm hover:bg-cream-2" onClick={() => update(p.id, { stockCount: Math.max(0, p.stockCount - 1), isAvailable: p.stockCount - 1 > 0 && p.isAvailable })} aria-label="Kurangi stok">-</button>
                  <span className="w-7 text-center text-sm tabular-nums">{p.stockCount}</span>
                  <button type="button" className="grid size-11 place-items-center text-sm hover:bg-cream-2" onClick={() => update(p.id, { stockCount: p.stockCount + 1 })} aria-label="Tambah stok">+</button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const open = !p.isAvailable;
                    update(p.id, { isAvailable: open, stockCount: open && p.stockCount === 0 ? 1 : p.stockCount });
                    emitToast(open ? 'Penjualan dibuka' : 'Ditandai habis', 'info');
                  }}
                  className={`min-h-11 flex-1 rounded-full px-3 text-xs font-medium md:flex-none ${p.isAvailable ? 'bg-sage-soft text-forest' : 'bg-[#F1ECDF] text-[#6B5326]'}`}
                >
                  {p.isAvailable ? 'Tandai Habis' : 'Buka Penjualan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCatalog((prev) => prev.filter((x) => x.id !== p.id));
                    emitToast('Produk dihapus', 'info');
                  }}
                  className="grid size-11 place-items-center rounded-full border border-line text-muted hover:text-[#8A2F3B]"
                  aria-label={`Hapus ${p.title}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const ART_FOR: Record<ProductCategory, string> = {
  top: 'shirt:plain', pants: 'trousers:plain', dress: 'dress:plain', outerwear: 'jacket:plain', jeans: 'jeans:denim', bag: 'tote:plain', shoes: 'sneaker:plain', hijab: 'hijab:plain',
};

type SizeField = keyof Omit<GarmentMeasurement, 'sizeLabel'>;
const FIELDS_FOR = (c: ProductCategory): { key: SizeField; label: string }[] =>
  c === 'shoes'
    ? [{ key: 'insoleCm', label: 'Insole' }]
    : c === 'bag'
      ? [{ key: 'bagLengthCm', label: 'P' }, { key: 'bagWidthCm', label: 'L' }, { key: 'bagHeightCm', label: 'T' }]
      : c === 'pants' || c === 'jeans'
        ? [{ key: 'waistCm', label: 'LP' }, { key: 'hipsCm', label: 'Pinggul' }, { key: 'garmentLengthCm', label: 'Panjang' }]
        : c === 'hijab'
          ? [{ key: 'garmentLengthCm', label: 'Sisi' }]
          : [{ key: 'chestBustCm', label: 'LD' }, { key: 'shoulderWidthCm', label: 'Bahu' }, { key: 'garmentLengthCm', label: 'Panjang' }];

function UploadTab({ store, onDone }: { store: StoreProfile; onDone: () => void }) {
  const [, setCatalog] = useCatalog();
  const [, setNotifs] = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<ProductCategory>('top');
  const [price, setPrice] = useState(250000);
  const [orig, setOrig] = useState(0);
  const [condition, setCondition] = useState<ProductCondition>(store.sellerType === 'umkm' ? 'new' : 'very_good');
  const [stock, setStock] = useState(store.sellerType === 'umkm' ? 10 : 1);
  const [material, setMaterial] = useState('');
  const [stretch, setStretch] = useState(false);
  const [style, setStyle] = useState('minimalist');
  const [color, setColor] = useState('#8EA89D');
  const [link, setLink] = useState(store.externalShopUrl ?? '');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [sizes, setSizes] = useState<GarmentMeasurement[]>([{ sizeLabel: 'M', chestBustCm: 100, shoulderWidthCm: 44, garmentLengthCm: 70 }]);

  const fields = FIELDS_FOR(category);
  const valid = title.trim().length > 3 && price > 0 && sizes.length > 0 && sizes.every((s) => s.sizeLabel.trim());

  const submit = (): void => {
    if (!valid) return;
    const preloved = store.sellerType !== 'umkm';
    const p: UMKMProductPost = {
      id: uid('p'),
      sellerId: store.id,
      sellerName: store.name,
      sellerType: store.sellerType,
      sellerCity: store.city,
      sellerContact: store.contactNumber,
      externalLink: link || undefined,
      title: title.trim(),
      description: desc.trim() || 'Deskripsi belum ditambahkan.',
      category,
      style,
      colorFamily: 'Lainnya',
      colorHex: [color.toUpperCase()],
      price,
      originalPrice: orig > price ? orig : undefined,
      condition,
      isOneOfAKind: preloved && stock === 1,
      stockCount: stock,
      isAvailable: stock > 0,
      availableSizes: sizes,
      imageUrl: image || `art:${ART_FOR[category]}`,
      material: material || undefined,
      stretch,
      likes: 0,
      saves: 0,
      tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    p.colorFamily = nearestColorName(color);
    setCatalog((prev) => [p, ...prev]);
    setNotifs((prev) => [{ id: uid('n'), title: `${store.name} menambah produk`, body: p.title, read: false, createdAt: p.createdAt }, ...prev]);
    emitToast('Produk tayang di katalog');
    onDone();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div>
        <button type="button" onClick={() => fileRef.current?.click()} className="relative block aspect-[4/5] w-full overflow-hidden rounded-2xl border border-dashed border-line-2 bg-cream-2">
          {image ? <ProductImage src={image} alt="Foto produk" /> : <ProductImage src={`art:${ART_FOR[category]}`} colors={[color]} alt="Ilustrasi" />}
          <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-cream/95 py-2 text-xs font-medium text-forest">
            <ImagePlus className="size-4" strokeWidth={1.5} /> {image ? 'Ganti foto' : 'Upload foto'}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const data = await compressImage(f, 720);
            const info = await extractGarmentInfo(data, f.name);
            setImage(data);
            setColor(info.hex);
            e.target.value = '';
          }}
        />
        <p className="mt-2 text-[11px] text-muted">Tanpa foto, kami tampilkan ilustrasi flat-lay sesuai kategori dan warna.</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nama produk</label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kemeja Linen Kerah Band" />
          </div>
          <div>
            <label className={labelCls}>Kategori</label>
            <select className={inputCls} value={category} onChange={(e) => { const c = e.target.value as ProductCategory; setCategory(c); setSizes([{ sizeLabel: c === 'shoes' ? '39' : c === 'bag' ? 'Medium' : 'M' }]); }}>
              {(Object.keys(CATEGORY_LABEL) as ProductCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Gaya</label>
            <select className={inputCls} value={style} onChange={(e) => setStyle(e.target.value)}>
              {Object.entries(STYLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Harga (Rp)</label>
            <input type="number" className={inputCls} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>Harga asli (opsional, preloved)</label>
            <input type="number" className={inputCls} value={orig || ''} onChange={(e) => setOrig(Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>Kondisi</label>
            <select className={inputCls} value={condition} onChange={(e) => setCondition(e.target.value as ProductCondition)}>
              {(Object.keys(CONDITION_LABEL) as ProductCondition[]).map((c) => <option key={c} value={c}>{CONDITION_LABEL[c]}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Stok</label>
            <input type="number" min={0} className={inputCls} value={stock} onChange={(e) => setStock(Math.max(0, Number(e.target.value)))} />
          </div>
          <div>
            <label className={labelCls}>Bahan</label>
            <input className={inputCls} value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Linen ramie 100%" />
          </div>
          <div>
            <label className={labelCls}>Warna utama</label>
            <div className="flex gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-line-2 bg-white p-1" aria-label="Warna" />
              <label className="flex flex-1 items-center gap-2 rounded-xl border border-line-2 bg-white/70 px-3 text-sm">
                <input type="checkbox" checked={stretch} onChange={(e) => setStretch(e.target.checked)} className="accent-[#162D24]" /> Bahan stretch
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}><Link2 className="mr-1 inline size-3.5" />Tautan marketplace (Shopee / Tokopedia / WA)</label>
            <input className={inputCls} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://shopee.co.id/toko-anda/produk" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Deskripsi</label>
            <textarea className={`${inputCls} min-h-24`} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ceritakan bahan, potongan, dan cara perawatan." />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Tag (pisahkan dengan koma)</label>
            <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kantor, kuliah, linen" />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-forest">Spesifikasi ukuran flat-lay (cm)</p>
            <button type="button" onClick={() => setSizes([...sizes, { sizeLabel: '' }])} className="inline-flex items-center gap-1 text-xs font-medium text-forest"><Plus className="size-3.5" /> Varian</button>
          </div>
          <div className="mt-3 space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input className={`${inputCls} w-24`} value={s.sizeLabel} placeholder="Label" onChange={(e) => setSizes(sizes.map((x, k) => (k === i ? { ...x, sizeLabel: e.target.value } : x)))} aria-label="Label ukuran" />
                {fields.map((f) => (
                  <label key={f.key} className="flex items-center gap-1 text-xs text-muted">
                    {f.label}
                    <input
                      type="number"
                      step={0.1}
                      className="w-16 rounded-lg border border-line-2 bg-white px-2 py-2 text-right text-sm tabular-nums text-ink focus:border-forest"
                      value={s[f.key] ?? ''}
                      onChange={(e) => setSizes(sizes.map((x, k) => (k === i ? { ...x, [f.key]: e.target.value === '' ? undefined : Number(e.target.value) } : x)))}
                    />
                  </label>
                ))}
                {sizes.length > 1 && (
                  <button type="button" onClick={() => setSizes(sizes.filter((_, k) => k !== i))} className="ml-auto grid size-8 place-items-center text-muted" aria-label="Hapus varian"><Trash2 className="size-3.5" /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className={btnGhost} onClick={onDone}>Batal</button>
          <button type="button" className={`${btnPrimary} flex-1 sm:flex-none`} disabled={!valid} onClick={submit}><Upload className="size-4" /> Tayangkan Produk</button>
        </div>
      </div>
    </div>
  );
}

function TrafficTab({ store }: { store: StoreProfile }) {
  const [analytics, setAnalytics] = useAnalytics();
  const [catalog] = useCatalog();
  const hydrated = useHydrated();
  const a = (hydrated ? analytics[store.id] : undefined) ?? { storeVisits: 0, impressions: 0, linkClicks: 0, waChats: 0, bookmarks: 0 };
  const items = catalog.filter((p) => p.sellerId === store.id);
  const empty = a.storeVisits + a.impressions + a.linkClicks + a.waChats + a.bookmarks === 0;

  const stats = [
    { label: 'Kunjungan profil toko', value: a.storeVisits, icon: <Eye className="size-4" strokeWidth={1.5} aria-hidden /> },
    { label: 'Detail produk dibuka', value: a.impressions, icon: <Package className="size-4" strokeWidth={1.5} aria-hidden /> },
    { label: 'Klik tautan toko luar', value: a.linkClicks, icon: <MousePointerClick className="size-4" strokeWidth={1.5} aria-hidden /> },
    { label: 'Chat WhatsApp', value: a.waChats, icon: <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> },
    { label: 'Disimpan ke koleksi', value: a.bookmarks, icon: <Bookmark className="size-4" strokeWidth={1.5} aria-hidden /> },
  ];
  const funnel = [
    { label: 'Detail produk dibuka', value: a.impressions },
    { label: 'Klik ke Shopee / Tokopedia', value: a.linkClicks },
    { label: 'Chat WhatsApp', value: a.waChats },
  ];
  const top = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">Angka di bawah dihitung dari interaksi nyata di browser ini sejak data dibuat, bukan perkiraan.</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white/50 p-4">
            <div className="flex items-center gap-1.5 text-muted">{s.icon}<span className="text-[12px]">{s.label}</span></div>
            <p className="mt-2 font-serif text-3xl tabular-nums text-forest">{formatCount(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-line bg-white/50 p-5">
          <h3 className="text-sm font-semibold text-forest">Dari detail produk ke chat: berapa yang lanjut?</h3>
          {empty ? (
            <div className="mt-4 rounded-xl border border-dashed border-line-2 p-5 text-sm text-muted">
              Belum ada interaksi untuk {store.name}. Buka produknya dari Katalog, klik tautan toko atau Chat WhatsApp, lalu kembali ke sini.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {funnel.map((f) => (
                <li key={f.label}>
                  <div className="flex justify-between text-[13px]"><span className="text-ink/80">{f.label}</span><span className="font-semibold tabular-nums text-forest">{f.value}</span></div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-cream-3">
                    <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${(f.value / top) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!empty && (
            <button type="button" onClick={() => { setAnalytics((prev) => { const n = { ...prev }; delete n[store.id]; return n; }); emitToast('Statistik toko direset', 'info'); }} className="mt-4 inline-flex min-h-11 items-center text-xs font-medium text-forest underline underline-offset-2">
              Reset statistik demo
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white/50 p-5">
          <h3 className="text-sm font-semibold text-forest">Produk paling disukai</h3>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Belum ada produk di toko ini.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-[12px] text-muted">
                <tr><th className="pb-2 font-medium">Produk</th><th className="pb-2 text-right font-medium">Suka</th><th className="pb-2 text-right font-medium">Simpan</th></tr>
              </thead>
              <tbody>
                {[...items].sort((x, y) => y.likes - x.likes).slice(0, 6).map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="max-w-0 truncate py-2 pr-2">{p.title}</td>
                    <td className="py-2 text-right tabular-nums">{p.likes}</td>
                    <td className="py-2 text-right tabular-nums">{p.saves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ store }: { store: StoreProfile }) {
  const [, setStores] = useStores();
  const [catalog, setCatalog] = useCatalog();
  const [draft, setDraft] = useState<StoreProfile>(store);
  const set = <K extends keyof StoreProfile>(k: K, v: StoreProfile[K]): void => setDraft((d) => ({ ...d, [k]: v }));

  const save = (): void => {
    setStores((prev) => prev.map((s) => (s.id === store.id ? draft : s)));
    setCatalog(catalog.map((p) => (p.sellerId === store.id ? { ...p, sellerName: draft.name, sellerCity: draft.city, sellerContact: draft.contactNumber } : p)));
    emitToast('Profil toko diperbarui');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nama toko</label>
          <input className={inputCls} value={draft.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Kota pengiriman</label>
          <select className={inputCls} value={draft.city} onChange={(e) => set('city', e.target.value)}>
            {[...CITIES, ...(CITIES.includes(draft.city as (typeof CITIES)[number]) ? [] : [draft.city])].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Kontak WhatsApp (format 62...)</label>
          <input className={inputCls} value={draft.contactNumber} onChange={(e) => set('contactNumber', e.target.value.replace(/[^0-9]/g, ''))} />
        </div>
        <div>
          <label className={labelCls}>Instagram</label>
          <input className={inputCls} value={draft.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Tautan toko luar</label>
          <input className={inputCls} value={draft.externalShopUrl ?? ''} onChange={(e) => set('externalShopUrl', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Bio singkat</label>
          <input className={inputCls} value={draft.bio} onChange={(e) => set('bio', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Cerita Kami: mengapa membuka akun di Outfitly</label>
          <textarea className={`${inputCls} min-h-36`} value={draft.story} onChange={(e) => set('story', e.target.value)} />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="flex items-center gap-2 text-xs text-muted">Warna banner <input type="color" value={draft.bannerHex} onChange={(e) => set('bannerHex', e.target.value)} className="h-9 w-11 rounded-lg border border-line-2 bg-white p-1" /></label>
          <label className="flex items-center gap-2 text-xs text-muted">Warna avatar <input type="color" value={draft.avatarHex} onChange={(e) => set('avatarHex', e.target.value)} className="h-9 w-11 rounded-lg border border-line-2 bg-white p-1" /></label>
        </div>
        <div className="sm:col-span-2">
          <button type="button" className={btnPrimary} onClick={save}>Simpan Profil</button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white/50">
        <div className="h-24" style={{ background: draft.bannerHex }} />
        <div className="-mt-8 px-4 pb-5">
          <div className="grid size-16 place-items-center rounded-full border-4 border-cream font-serif text-2xl text-cream" style={{ background: draft.avatarHex }}>{draft.name.charAt(0)}</div>
          <p className="mt-2 font-serif text-xl text-forest">{draft.name}</p>
          <p className="text-xs text-muted">{draft.city} . {draft.instagram}</p>
          <p className="mt-3 text-[13px] text-ink/80">{draft.bio}</p>
          <p className="mt-3 border-l-2 border-coral pl-3 font-serif text-sm italic text-forest">{draft.story}</p>
        </div>
      </div>
    </div>
  );
}

/** Hosted mode: sign in, then claim a demo store or open a new one. */
function StoreSetup({ signedIn, onReady, onCancel }: { signedIn: boolean; onReady: (id: string) => void; onCancel?: () => void }) {
  const [stores, setStores] = useStores();
  const [session] = useSession();
  const { openAuth } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState<string>(CITIES[0]);
  const [type, setType] = useState<StoreProfile['sellerType']>('umkm');
  const [wa, setWa] = useState('');
  const unclaimed = stores.filter((s) => !s.ownerId);
  const waOk = /^62\d{8,13}$/.test(wa.replace(/\D/g, ''));

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Store className="mx-auto size-8 text-forest" strokeWidth={1.3} />
        <h1 className="mt-3 font-serif text-[32px] leading-tight text-forest">Dashboard <em>Penjual</em></h1>
        <p className="mt-2 text-sm text-muted">Masuk dulu supaya produk, foto, dan statistik toko tersimpan di akun Anda dan tampil untuk semua pembeli.</p>
        <button type="button" className={`${btnPrimary} mt-6`} onClick={() => openAuth('login')}>Masuk / Daftar</button>
      </div>
    );
  }

  const claim = async (id: string): Promise<void> => {
    setBusy(id);
    try {
      const ok = await claimStore(id);
      if (ok) {
        emitToast('Toko sekarang terhubung ke akun Anda');
        onReady(id);
      } else emitToast('Toko ini sudah dikelola akun lain', 'error');
    } catch {
      emitToast('Gagal menghubungkan toko. Coba lagi.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const create = (): void => {
    if (name.trim().length < 2 || !waOk || !session?.id) return;
    const id = uid('s');
    const s: StoreProfile = {
      id,
      name: name.trim(),
      city,
      followerCount: 0,
      contactNumber: wa.replace(/\D/g, ''),
      bio: '',
      story: '',
      sellerType: type,
      bannerHex: '#C9B9A2',
      avatarHex: '#162D24',
      ownerId: session.id,
    };
    setStores((prev) => [...prev, s]);
    emitToast('Toko dibuat');
    onReady(id);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:px-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[32px] leading-tight text-forest md:text-[42px]">Buka <em>toko</em> Anda</h1>
          <p className="mt-1 text-sm text-muted">Buat toko baru, atau kelola salah satu toko contoh untuk mencoba dashboard.</p>
        </div>
        {onCancel && <button type="button" className={btnGhost} onClick={onCancel}>Batal</button>}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white/50 p-5">
          <p className="font-serif text-lg text-forest">Toko baru</p>
          <div className="mt-3 space-y-3">
            <div>
              <label className={labelCls} htmlFor="st-name">Nama toko</label>
              <input id="st-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Batik Ningrum" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="st-city">Kota</label>
                <select id="st-city" className={inputCls} value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="st-type">Jenis</label>
                <select id="st-type" className={inputCls} value={type} onChange={(e) => setType(e.target.value as StoreProfile['sellerType'])}>
                  {(Object.keys(SELLER_TYPE_LABEL) as StoreProfile['sellerType'][]).map((t) => <option key={t} value={t}>{SELLER_TYPE_LABEL[t]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="st-wa">Nomor WhatsApp</label>
              <input id="st-wa" className={inputCls} value={wa} onChange={(e) => setWa(e.target.value)} placeholder="6281234567890" inputMode="tel" />
              {wa && !waOk && <p className="mt-1 text-[11.5px] text-[#8A2F3B]">Awali dengan 62, contoh 6281234567890.</p>}
            </div>
            <button type="button" className={`${btnPrimary} w-full`} disabled={name.trim().length < 2 || !waOk} onClick={create}>
              <Plus className="size-4" /> Buat Toko
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white/50 p-5">
          <p className="font-serif text-lg text-forest">Toko contoh yang belum dikelola</p>
          <ul className="mt-3 space-y-2">
            {unclaimed.length === 0 && <li className="text-sm text-muted">Semua toko contoh sudah dikelola akun lain.</li>}
            {unclaimed.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border border-line bg-cream px-3 py-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full font-serif text-cream" style={{ background: s.avatarHex }}>{s.name.charAt(0)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-forest">{s.name}</span>
                  <span className="block text-[11px] text-muted">{SELLER_TYPE_LABEL[s.sellerType]} . {s.city}</span>
                </span>
                <button type="button" disabled={busy !== null} onClick={() => claim(s.id)} className="min-h-9 rounded-full border border-line-2 px-3 text-xs font-medium text-forest hover:border-forest/50 disabled:opacity-50">
                  {busy === s.id ? 'Menghubungkan...' : 'Kelola'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Shown to guests and Pengguna accounts: the dashboard is for Mitra Penjual only. */
function MitraGate({ signedIn }: { signedIn: boolean }) {
  const { openAuth } = useApp();
  const becomeMitra = useBecomeMitra();
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <Store className="mx-auto size-8 text-forest" strokeWidth={1.3} />
      <h1 className="mt-3 font-serif text-[32px] leading-tight text-forest">Khusus <em>Mitra Penjual</em></h1>
      <p className="mt-2 text-sm text-muted">
        Dashboard ini untuk UMKM dan penjual thrift yang ingin membuka toko di Outfitly: unggah produk dengan ukuran cm, atur profil toko, dan pantau kunjungan serta klik WhatsApp. Sebagai Mitra, kamu tetap bisa belanja dan memakai Stylist.
      </p>
      {signedIn ? (
        <button type="button" className={`${btnPrimary} mt-6`} onClick={becomeMitra}>Jadikan akun saya Mitra Penjual</button>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button type="button" className={btnPrimary} onClick={() => openAuth('signup', 'mitra')}>Daftar sebagai Mitra</button>
          <button type="button" className={btnGhost} onClick={() => openAuth('login', 'mitra')}>Masuk sebagai Mitra</button>
        </div>
      )}
    </div>
  );
}
