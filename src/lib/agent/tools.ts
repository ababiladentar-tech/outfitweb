import { CATEGORY_LABEL, STYLE_LABEL } from '../data';
import { nearestColorName, undertoneHarmony, vibeScore } from '../color';
import { formatIDR } from '../format';
import { OCCASION_LABEL, buildCandidates, generateOutfit, piecesOf, type Vibe } from '../outfit';
import { bestSize, evaluateFit } from '../sizing';
import type {
  AgentAction,
  AgentOutfit,
  AgentStep,
  AgentToolName,
  BodyMeasurements,
  BuilderMode,
  Occasion,
  ProductCategory,
  StylePreference,
  UMKMProductPost,
  UserProfile,
  WardrobeItem,
  Weather,
} from '../types';

/**
 * Tools the stylist agent can call. Each one works on real app data (catalog,
 * wardrobe, body measurements) and records a visible step. Tools that change
 * user data only queue an action; the browser applies it, so the agent never
 * writes anything the user cannot see.
 */

export interface AgentContext {
  profile: UserProfile;
  catalog: UMKMProductPost[];
  wardrobe: WardrobeItem[];
  outfits: AgentOutfit[];
  steps: AgentStep[];
  actions: AgentAction[];
  /** Products returned by tools, in the order the agent saw them. */
  seen: string[];
}

export function createContext(profile: UserProfile, catalog: UMKMProductPost[], wardrobe: WardrobeItem[]): AgentContext {
  return { profile, catalog, wardrobe, outfits: [], steps: [], actions: [], seen: [] };
}

type Args = Record<string, unknown>;

const OCCASIONS: Occasion[] = ['kuliah', 'kantor', 'kasual', 'kondangan', 'weekend'];
const WEATHERS: Weather[] = ['cerah', 'sejuk', 'hujan'];
const MODES: BuilderMode[] = ['wardrobe', 'umkm', 'hybrid'];
const CATEGORIES = Object.keys(CATEGORY_LABEL) as ProductCategory[];
const STYLES = Object.keys(STYLE_LABEL) as StylePreference[];
const MEASURE_KEYS: (keyof BodyMeasurements)[] = ['chestCm', 'waistCm', 'shoulderCm', 'heightCm', 'weightKg', 'footCm'];
const MEASURE_LIMITS: Record<keyof BodyMeasurements, [number, number]> = {
  chestCm: [50, 180],
  waistCm: [40, 170],
  shoulderCm: [25, 70],
  heightCm: [100, 220],
  weightKg: [25, 200],
  footCm: [15, 35],
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : null);
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | null => (allowed.includes(v as T) ? (v as T) : null);

function see(ctx: AgentContext, ids: string[]): void {
  for (const id of ids) if (!ctx.seen.includes(id)) ctx.seen.push(id);
}

function step(ctx: AgentContext, tool: AgentToolName, label: string, detail: string): void {
  ctx.steps.push({ tool, label, detail });
}

function productSummary(p: UMKMProductPost, ctx: AgentContext) {
  const fit = bestSize(p, ctx.profile.measurements);
  return {
    id: p.id,
    nama: p.title,
    toko: p.sellerName,
    kota: p.sellerCity,
    harga: p.price,
    harga_teks: formatIDR(p.price),
    kategori: p.category,
    gaya: p.style,
    warna: p.colorFamily,
    bahan: p.material ?? null,
    jenis_penjual: p.sellerType,
    kondisi: p.condition,
    stok: p.stockCount,
    ukuran_terbaik: fit.size.sizeLabel,
    skor_pas: fit.fit.score,
    status_pas: fit.fit.status,
    harmoni_undertone: undertoneHarmony(p.colorHex[0] ?? '#888888', ctx.profile.skinTone),
    tag: p.tags,
  };
}

/* ---------- Read tools ---------- */

function searchProducts(a: Args, ctx: AgentContext) {
  const q = str(a.query).toLowerCase();
  const cats = strList(a.categories).filter((c): c is ProductCategory => CATEGORIES.includes(c as ProductCategory));
  const occasion = pick(a.occasion, OCCASIONS);
  const style = pick(a.style, STYLES);
  const maxPrice = num(a.max_price);
  const minFit = num(a.min_fit_score) ?? 0;
  const preloved = a.preloved_only === true;
  const limit = Math.min(8, Math.max(1, num(a.limit) ?? 5));
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const pool = ctx.catalog.filter((p) => p.isAvailable && p.stockCount > 0);
  const scored = pool
    .filter((p) => !cats.length || cats.includes(p.category))
    .filter((p) => maxPrice === null || p.price <= maxPrice)
    .filter((p) => !preloved || p.sellerType === 'community_preloved')
    .filter((p) => !(ctx.profile.gender === 'boy' && (p.category === 'dress' || p.category === 'hijab')))
    .map((p) => {
      const fit = bestSize(p, ctx.profile.measurements);
      const hay = `${p.title} ${p.description} ${p.colorFamily} ${p.material ?? ''} ${p.tags.join(' ')}`.toLowerCase();
      const hits = words.filter((w) => hay.includes(w)).length;
      let score = fit.fit.score * 0.45 + vibeScore(p, ctx.profile.skinTone, ctx.profile.bodyShape) * 0.45 + hits * 14;
      if (occasion && p.tags.includes(occasion)) score += 18;
      if (style && p.style === style) score += 12;
      return { p, fit: fit.fit.score, score, hits };
    })
    .filter((r) => r.fit >= minFit)
    .filter((r) => !words.length || r.hits > 0 || cats.length > 0)
    .sort((x, y) => y.score - x.score);

  const top = scored.slice(0, limit).map((r) => productSummary(r.p, ctx));
  see(ctx, top.map((t) => t.id));
  const filters = [
    cats.length ? cats.map((c) => CATEGORY_LABEL[c]).join('/') : null,
    occasion ? OCCASION_LABEL[occasion] : null,
    maxPrice !== null ? `maks ${formatIDR(maxPrice)}` : null,
    q || null,
  ].filter(Boolean);
  step(ctx, 'search_products', 'Mencari di katalog', `${pool.length} produk dicek${filters.length ? ` (${filters.join(', ')})` : ''}, ${scored.length} cocok, ${top.length} teratas diambil.`);
  return { jumlah_cocok: scored.length, produk: top };
}

function checkFit(a: Args, ctx: AgentContext) {
  const p = ctx.catalog.find((x) => x.id === str(a.product_id));
  if (!p) return { error: 'Produk tidak ditemukan. Pakai id dari hasil search_products.' };
  const m = ctx.profile.measurements;
  const sizes = p.availableSizes.map((s) => {
    const f = evaluateFit(p, s, m);
    return { ukuran: s.sizeLabel, skor: f.score, status: f.status, catatan: f.notes };
  });
  const best = [...sizes].sort((x, y) => y.skor - x.skor)[0];
  see(ctx, [p.id]);
  step(ctx, 'check_fit', 'Menghitung kelonggaran kain', `${p.title}: ${sizes.length} ukuran dibandingkan dengan LD ${m.chestCm}, LP ${m.waistCm}, bahu ${m.shoulderCm} cm. Terbaik ${best?.ukuran ?? '-'} (${best?.skor ?? 0}%).`);
  return { produk: p.title, toko: p.sellerName, bahan: p.material ?? null, elastis: !!p.stretch, ukuran_tubuh: m, ukuran: sizes, rekomendasi: best ?? null };
}

function compareProducts(a: Args, ctx: AgentContext) {
  const ids = strList(a.product_ids).slice(0, 3);
  const items = ids.map((id) => ctx.catalog.find((p) => p.id === id)).filter((p): p is UMKMProductPost => !!p);
  if (items.length < 2) return { error: 'Butuh minimal dua id produk yang valid.' };
  const rows = items.map((p) => productSummary(p, ctx));
  see(ctx, rows.map((r) => r.id));
  const best = [...rows].sort((x, y) => y.skor_pas + y.harmoni_undertone - (x.skor_pas + x.harmoni_undertone))[0];
  step(ctx, 'compare_products', 'Membandingkan produk', `${rows.map((r) => r.nama).join(' vs ')}. Paling serasi: ${best.nama}.`);
  return { perbandingan: rows, paling_serasi: best.id };
}

function viewWardrobe(_a: Args, ctx: AgentContext) {
  const items = ctx.wardrobe.map((w) => ({
    id: w.id,
    nama: w.name,
    kategori: w.category,
    warna: w.color,
    gaya: w.style,
    ukuran: w.sizeLabel ?? null,
    harmoni_undertone: undertoneHarmony(w.colorHex, ctx.profile.skinTone),
  }));
  step(ctx, 'view_wardrobe', 'Membuka lemari', items.length ? `${items.length} item di lemari digital dibaca.` : 'Lemari digital masih kosong.');
  return { jumlah: items.length, item: items };
}

/* ---------- Outfit tools ---------- */

function buildOutfit(a: Args, ctx: AgentContext) {
  const occasion = pick(a.occasion, OCCASIONS) ?? 'kasual';
  const weather = pick(a.weather, WEATHERS) ?? 'cerah';
  const mode = pick(a.mode, MODES) ?? (ctx.wardrobe.length ? 'hybrid' : 'umkm');
  const vibe: Vibe = pick(a.style, STYLES) ?? 'all';
  const budget = Math.max(0, num(a.budget) ?? 800000);
  const lockedWardrobeIds = strList(a.wardrobe_ids).filter((id) => ctx.wardrobe.some((w) => w.id === id));
  const required = strList(a.product_ids)
    .map((id) => ctx.catalog.find((p) => p.id === id))
    .filter((p): p is UMKMProductPost => !!p);
  // Products already used in earlier outfits of this answer are skipped, so a
  // multi-event plan does not repeat the same purchase.
  const used = ctx.outfits.flatMap((o) => o.pieces.filter((p) => p.source === 'umkm').map((p) => p.refId));
  const exclude = [...strList(a.exclude_ids), ...(a.allow_repeat === true ? [] : used)];

  const candidates = buildCandidates({ mode, wardrobe: ctx.wardrobe, catalog: ctx.catalog, profile: ctx.profile, occasion, vibe, excludeIds: exclude });
  const slots = generateOutfit({
    candidates,
    mode,
    occasion,
    vibe,
    budget,
    weather,
    seed: 7 + ctx.outfits.length * 13,
    profile: ctx.profile,
    wardrobe: ctx.wardrobe,
    lockedWardrobeIds,
    requiredProducts: required,
  });
  const pieces = piecesOf(slots);
  const total = pieces.reduce((s, p) => s + p.price, 0);
  const id = `o${ctx.outfits.length + 1}`;
  const title = str(a.title) || `${OCCASION_LABEL[occasion]}${weather !== 'cerah' ? `, ${weather}` : ''}`;
  const fitWarnings = pieces.filter((p) => p.fit && p.fit.score < 70).map((p) => `${p.name} (${p.fit?.score}%)`);
  const outfit: AgentOutfit = { id, title, occasion, weather, mode, budget: mode === 'wardrobe' ? undefined : budget, pieces, totalPrice: total, fitWarnings };
  ctx.outfits.push(outfit);
  see(ctx, pieces.filter((p) => p.source === 'umkm').map((p) => p.refId));

  const own = pieces.filter((p) => p.source === 'wardrobe').length;
  step(
    ctx,
    'build_outfit',
    `Menyusun outfit ${title}`,
    `${pieces.length} item (${own} dari lemari, ${pieces.length - own} UMKM), total ${formatIDR(total)}${mode !== 'wardrobe' ? ` dari budget ${formatIDR(budget)}` : ''}${fitWarnings.length ? `. Perlu dicek: ${fitWarnings.join(', ')}` : ''}.`,
  );
  return {
    outfit_id: id,
    judul: title,
    acara: occasion,
    cuaca: weather,
    mode,
    total_harga: total,
    total_teks: formatIDR(total),
    sisa_budget: mode === 'wardrobe' ? null : budget - total,
    item: pieces.map((p) => ({
      slot: p.slot,
      sumber: p.source === 'wardrobe' ? 'lemari' : 'umkm',
      id: p.refId,
      nama: p.name,
      toko: p.sellerName ?? null,
      harga: p.price,
      warna: nearestColorName(p.colorHex),
      skor_pas: p.fit?.score ?? null,
      catatan_ukuran: p.fit?.notes ?? [],
    })),
    peringatan_ukuran: fitWarnings,
    slot_kosong: (['top', 'bottom', 'outer', 'shoes', 'bag'] as const).filter((s) => slots[s] === null).map((s) => s),
  };
}

function findOutfit(a: Args, ctx: AgentContext): AgentOutfit | null {
  const id = str(a.outfit_id);
  return ctx.outfits.find((o) => o.id === id) ?? ctx.outfits[ctx.outfits.length - 1] ?? null;
}

function saveOutfit(a: Args, ctx: AgentContext) {
  const o = findOutfit(a, ctx);
  if (!o) return { error: 'Belum ada outfit. Panggil build_outfit dulu.' };
  const title = str(a.title) || o.title;
  if (!ctx.actions.some((x) => x.type === 'save_outfit' && x.outfitId === o.id)) ctx.actions.push({ type: 'save_outfit', outfitId: o.id, title });
  step(ctx, 'save_outfit', 'Menyimpan outfit', `"${title}" masuk ke Outfit Tersimpan.`);
  return { ok: true, disimpan_sebagai: title };
}

function openInStudio(a: Args, ctx: AgentContext) {
  const o = findOutfit(a, ctx);
  if (!o) return { error: 'Belum ada outfit. Panggil build_outfit dulu.' };
  ctx.actions = ctx.actions.filter((x) => x.type !== 'open_in_studio');
  ctx.actions.push({ type: 'open_in_studio', outfitId: o.id });
  step(ctx, 'open_in_studio', 'Membuka Studio Padu Padan', `"${o.title}" dimuat ke Studio supaya bisa diganti per slot.`);
  return { ok: true };
}

function addFavorites(a: Args, ctx: AgentContext) {
  const ids = strList(a.product_ids).filter((id) => ctx.catalog.some((p) => p.id === id)).slice(0, 6);
  if (!ids.length) return { error: 'Tidak ada id produk yang valid.' };
  ctx.actions.push({ type: 'add_favorites', productIds: ids });
  see(ctx, ids);
  step(ctx, 'add_favorites', 'Menambah ke favorit', `${ids.length} produk ditandai favorit.`);
  return { ok: true, jumlah: ids.length };
}

function updateMeasurements(a: Args, ctx: AgentContext) {
  const patch: Partial<BodyMeasurements> = {};
  const rejected: string[] = [];
  for (const k of MEASURE_KEYS) {
    const v = num(a[k]);
    if (v === null) continue;
    const [lo, hi] = MEASURE_LIMITS[k];
    if (v < lo || v > hi) rejected.push(`${k}=${v}`);
    else patch[k] = Math.round(v * 10) / 10;
  }
  if (!Object.keys(patch).length) return { error: 'Tidak ada angka ukuran yang masuk akal.', ditolak: rejected };
  // Later fit checks in this same answer use the new numbers.
  ctx.profile = { ...ctx.profile, measurements: { ...ctx.profile.measurements, ...patch } };
  const prev = ctx.actions.find((x) => x.type === 'update_measurements');
  if (prev && prev.type === 'update_measurements') prev.measurements = { ...prev.measurements, ...patch };
  else ctx.actions.push({ type: 'update_measurements', measurements: patch });
  const label: Record<keyof BodyMeasurements, string> = { chestCm: 'LD', waistCm: 'LP', shoulderCm: 'bahu', heightCm: 'tinggi', weightKg: 'berat', footCm: 'kaki' };
  step(ctx, 'update_measurements', 'Memperbarui ukuran tubuh', Object.entries(patch).map(([k, v]) => `${label[k as keyof BodyMeasurements]} ${v}${k === 'weightKg' ? ' kg' : ' cm'}`).join(', '));
  return { ok: true, ukuran_baru: ctx.profile.measurements, ditolak: rejected };
}

const RUNNERS: Record<AgentToolName, (a: Args, ctx: AgentContext) => unknown> = {
  search_products: searchProducts,
  check_fit: checkFit,
  compare_products: compareProducts,
  view_wardrobe: viewWardrobe,
  build_outfit: buildOutfit,
  save_outfit: saveOutfit,
  open_in_studio: openInStudio,
  add_favorites: addFavorites,
  update_measurements: updateMeasurements,
};

export function isToolName(n: string): n is AgentToolName {
  return n in RUNNERS;
}

export function runTool(name: string, args: Args, ctx: AgentContext): unknown {
  if (!isToolName(name)) return { error: `Tool ${name} tidak dikenal.` };
  try {
    return RUNNERS[name](args ?? {}, ctx);
  } catch {
    return { error: 'Tool gagal dijalankan.' };
  }
}

/* ---------- Gemini declarations ---------- */

const S = (description: string) => ({ type: 'STRING', description });
const N = (description: string) => ({ type: 'NUMBER', description });
const E = (values: readonly string[], description: string) => ({ type: 'STRING', enum: [...values], description });
const A = (items: object, description: string) => ({ type: 'ARRAY', items, description });

export const TOOL_DECLARATIONS = [
  {
    name: 'search_products',
    description: 'Cari produk UMKM/preloved di katalog Outfitly. Hasil sudah dihitung skor pas (0-100) terhadap ukuran tubuh pengguna dan harmoni warna terhadap undertone. Pakai sebelum menyebut produk apa pun.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: S('Kata kunci bebas, misal "linen", "batik", "hitam".'),
        categories: A(E(CATEGORIES, 'Kategori'), 'Filter kategori.'),
        occasion: E(OCCASIONS, 'Acara'),
        style: E(STYLES, 'Gaya'),
        max_price: N('Harga maksimum per item dalam rupiah.'),
        min_fit_score: N('Skor pas minimum 0-100.'),
        preloved_only: { type: 'BOOLEAN', description: 'Hanya produk preloved thrift.' },
        limit: N('Jumlah hasil, 1-8.'),
      },
    },
  },
  {
    name: 'check_fit',
    description: 'Hitung kelonggaran kain (cm) setiap ukuran satu produk terhadap ukuran tubuh pengguna, lalu rekomendasikan ukuran.',
    parameters: { type: 'OBJECT', properties: { product_id: S('Id produk.') }, required: ['product_id'] },
  },
  {
    name: 'compare_products',
    description: 'Bandingkan 2-3 produk: harga, skor pas, harmoni warna, bahan.',
    parameters: { type: 'OBJECT', properties: { product_ids: A(S('Id produk'), '2-3 id produk.') }, required: ['product_ids'] },
  },
  {
    name: 'view_wardrobe',
    description: 'Baca isi lemari digital pengguna (baju yang sudah dimiliki).',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'build_outfit',
    description: 'Susun satu outfit lengkap (atasan, bawahan, outer, sepatu, tas) dengan mesin padu padan Outfitly. Untuk beberapa acara, panggil sekali per acara dan bagi budget-nya. Produk yang sudah dipakai di outfit sebelumnya otomatis tidak diulang.',
    parameters: {
      type: 'OBJECT',
      properties: {
        occasion: E(OCCASIONS, 'Acara.'),
        weather: E(WEATHERS, 'Cuaca.'),
        mode: E(MODES, 'wardrobe = hanya lemari, umkm = hanya belanja, hybrid = lemari + 1-2 produk UMKM.'),
        budget: N('Budget belanja outfit ini dalam rupiah.'),
        style: E(STYLES, 'Vibe gaya.'),
        wardrobe_ids: A(S('Id item lemari'), 'Item lemari yang wajib dipakai.'),
        product_ids: A(S('Id produk'), 'Produk katalog yang wajib dipakai.'),
        exclude_ids: A(S('Id'), 'Item yang tidak boleh dipakai.'),
        allow_repeat: { type: 'BOOLEAN', description: 'Boleh memakai ulang produk dari outfit sebelumnya.' },
        title: S('Judul singkat outfit.'),
      },
      required: ['occasion'],
    },
  },
  {
    name: 'save_outfit',
    description: 'Simpan outfit hasil build_outfit ke Outfit Tersimpan pengguna. Hanya jika pengguna meminta menyimpan.',
    parameters: { type: 'OBJECT', properties: { outfit_id: S('Id outfit, misal o1.'), title: S('Judul simpanan.') }, required: ['outfit_id'] },
  },
  {
    name: 'open_in_studio',
    description: 'Buka outfit di Studio Padu Padan agar pengguna bisa mengganti per slot. Hanya jika pengguna meminta membuka atau mengedit.',
    parameters: { type: 'OBJECT', properties: { outfit_id: S('Id outfit.') }, required: ['outfit_id'] },
  },
  {
    name: 'add_favorites',
    description: 'Tandai produk sebagai favorit pengguna. Hanya jika pengguna meminta.',
    parameters: { type: 'OBJECT', properties: { product_ids: A(S('Id produk'), 'Maks 6 id.') }, required: ['product_ids'] },
  },
  {
    name: 'update_measurements',
    description: 'Perbarui ukuran tubuh pengguna jika ia menyebut angka baru (misal "pinggang saya sekarang 75 cm"). Hitungan pas berikutnya memakai angka baru.',
    parameters: {
      type: 'OBJECT',
      properties: {
        chestCm: N('Lingkar dada cm.'),
        waistCm: N('Lingkar pinggang cm.'),
        shoulderCm: N('Lebar bahu cm.'),
        heightCm: N('Tinggi cm.'),
        weightKg: N('Berat kg.'),
        footCm: N('Panjang kaki cm.'),
      },
    },
  },
];
