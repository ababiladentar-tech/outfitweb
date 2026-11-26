import { CATEGORY_LABEL } from '../data';
import { nearestColorName, undertoneHarmony } from '../color';
import { formatIDR } from '../format';
import { OCCASION_LABEL } from '../outfit';
import { CATEGORY_WORDS, SHAPE_TEXT, TONE_TEXT, parseBudget } from '../stylist';
import type { AgentOutfit, AgentReply, BodyMeasurements, ChatMode, Occasion, Weather } from '../types';
import { runTool, type AgentContext } from './tools';
import { finalize } from './run';

/**
 * Rule-based planner used when no model is configured or reachable. It reads
 * the request, then calls the same tools the model agent uses, so the steps,
 * outfits, and actions look and behave the same in the app.
 */

const OCC_RE: { re: RegExp; key: Occasion }[] = [
  { re: /(kondangan|nikah|resepsi|wisuda|lamaran)/i, key: 'kondangan' },
  { re: /(kantor|kerja|meeting|interview|wawancara|presentasi|magang)/i, key: 'kantor' },
  { re: /(kuliah|kampus|kelas|sekolah)/i, key: 'kuliah' },
  { re: /(weekend|akhir pekan|nongkrong|ngopi|mall|jalan-jalan)/i, key: 'weekend' },
  { re: /(kasual|santai|sehari-hari)/i, key: 'kasual' },
];

const MEASURE_RE: { re: RegExp; key: keyof BodyMeasurements }[] = [
  { re: /(?:lingkar\s*)?(?:pinggang|\blp\b)\D{0,20}?(\d{2,3}(?:[.,]\d)?)/i, key: 'waistCm' },
  { re: /(?:lingkar\s*)?(?:dada|\bld\b)\D{0,20}?(\d{2,3}(?:[.,]\d)?)/i, key: 'chestCm' },
  { re: /bahu\D{0,20}?(\d{2}(?:[.,]\d)?)/i, key: 'shoulderCm' },
  { re: /tinggi\D{0,20}?(\d{3})/i, key: 'heightCm' },
  { re: /berat\D{0,20}?(\d{2,3})/i, key: 'weightKg' },
  { re: /(?:panjang\s*)?kaki\D{0,20}?(\d{2}(?:[.,]\d)?)/i, key: 'footCm' },
];

function occasionsIn(text: string): Occasion[] {
  const found = OCC_RE.map((o) => ({ key: o.key, at: text.search(o.re) })).filter((o) => o.at >= 0);
  return [...new Set(found.sort((a, b) => a.at - b.at).map((o) => o.key))];
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/** Number of days the user wants planned ("seminggu", "5 hari", "Senin sampai Jumat"), or 0. */
function daysIn(text: string): number {
  if (/(seminggu|sepekan|satu minggu|1 minggu|7 hari|minggu ini|minggu depan|tiap hari|setiap hari|sehari-hari selama)/i.test(text)) return 7;
  if (/senin\s*(sampai|s\/d|-|hingga)\s*jumat/i.test(text)) return 5;
  const n = text.match(/(\d)\s*hari/i);
  if (n) return Math.min(7, Math.max(2, Number(n[1])));
  return 0;
}

/** Occasion per day: the user's routine on weekdays, weekend looks on Saturday and Sunday. */
function weekPlan(days: number, text: string, named: Occasion[]): Occasion[] {
  const routine: Occasion = /(kantor|kerja|magang|meeting)/i.test(text) ? 'kantor' : /(kuliah|kampus|kelas)/i.test(text) ? 'kuliah' : named.find((o) => o === 'kantor' || o === 'kuliah') ?? 'kuliah';
  const plan: Occasion[] = DAYS.slice(0, days).map((_, i) => (i === 5 ? 'weekend' : i === 6 ? 'kasual' : routine));
  // A special event the user mentions ("ada kondangan") takes Saturday, or the last day.
  const special = named.find((o) => o === 'kondangan');
  if (special) plan[/minggu\s+(ada|ke)/i.test(text) && days === 7 ? 6 : days >= 6 ? 5 : days - 1] = special;
  return plan;
}

function weatherIn(text: string): Weather {
  if (/(hujan|gerimis|musim hujan)/i.test(text)) return 'hujan';
  if (/(sejuk|dingin|ac\b|puncak|malam)/i.test(text)) return 'sejuk';
  return 'cerah';
}

function measurementsIn(text: string): Partial<BodyMeasurements> {
  // Only when the user states their own numbers, not when asking about a product.
  if (!/(aku|aku|ku\b|sekarang|jadi|naik|turun|update|ganti)/i.test(text)) return {};
  const out: Partial<BodyMeasurements> = {};
  for (const m of MEASURE_RE) {
    const hit = text.match(m.re);
    if (hit) out[m.key] = parseFloat(hit[1].replace(',', '.'));
  }
  return out;
}

function outfitLine(o: AgentOutfit): string {
  const items = o.pieces.map((p) => `${p.name}${p.source === 'wardrobe' ? ' (lemari)' : ` (${p.sellerName}, ${formatIDR(p.price)})`}`);
  return `${o.title}: ${items.join(', ')}. Total ${formatIDR(o.totalPrice)}.`;
}

const pick = <T,>(xs: T[], seed: string): T => xs[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % xs.length];

const GREETING = /^(hai|halo|hallo|hello|hi|hey|hei|pagi|siang|sore|malam|selamat (pagi|siang|sore|malam)|assalamu|permisi|p)\b[\s!.,?]*\S{0,20}[\s!.,?]*$/i;
const THANKS = /(makasih|terima ?kasih|thanks|thank you|thx|mantap|keren|oke sip|sip)/i;
const COLOR_WORDS: [RegExp, string][] = [
  [/sage|hijau/i, '#8EA89D'], [/navy|biru tua/i, '#2A3552'], [/biru/i, '#3A6EA5'], [/hitam/i, '#262523'], [/putih/i, '#F4F1EA'],
  [/krem|cream|beige/i, '#E4D6BC'], [/coklat|cokelat|brown|camel/i, '#8B5A3C'], [/merah|maroon/i, '#8E2F35'], [/pink|merah muda/i, '#E7B8B5'],
  [/kuning|mustard/i, '#C99A3A'], [/abu|grey|gray/i, '#8C8B87'], [/ungu|lilac/i, '#7A5A8E'], [/oranye|orange|terracotta|bata/i, '#B5603C'], [/olive|army/i, '#5B6343'],
];

/** Replies to small talk and general questions so the stylist does not answer everything with products. */
function conversational(text: string, ctx: AgentContext, hasIntent: boolean): string | null {
  const t = text.trim();
  const name = ctx.profile.name && !/tamu/i.test(ctx.profile.name) ? ` ${ctx.profile.name.split(' ')[0]}` : '';
  if (GREETING.test(t)) {
    return pick([
      `Halo${name}! Mau tampil gimana hari ini? Aku bisa nyusun outfit buat kuliah, kantor, atau kondangan, ngecek ukuran baju yang kamu incar, atau bikin rencana outfit seminggu.`,
      `Hai${name}! Lagi cari inspirasi apa nih? Ceritain aja acaranya dan budget-nya, nanti aku cariin yang pas sama ukuran dan warna kulitmu.`,
      `Halo${name}, senang ketemu lagi. Ada acara apa dalam waktu dekat? Aku bisa bantu dari isi lemarimu dulu, baru tambah produk UMKM kalau perlu.`,
    ], t);
  }
  if (THANKS.test(t) && t.split(/\s+/).length <= 6) {
    return pick([
      'Sama-sama! Kalau mau ganti satu item, ketuk Edit di Studio aja. Aku di sini kalau butuh padanan lain.',
      'Senang bisa bantu. Jangan lupa simpan outfit favoritmu biar gampang dibuka lagi nanti.',
      'Sip! Kalau nanti ada acara lain, kabari aja, aku susunkan lagi.',
    ], t);
  }
  if (hasIntent) return null;

  // Colour questions: "warna sage cocok sama apa?", "aku cocok pakai merah nggak?"
  const color = COLOR_WORDS.find(([re]) => re.test(t));
  if (color && /(cocok|padu|match|pasangan|kombinasi|bagus|nggak|gak|ga\b|warna)/i.test(t)) {
    const h = undertoneHarmony(color[1], ctx.profile.skinTone);
    const near = nearestColorName(color[1]).toLowerCase();
    const verdict = h >= 85 ? `cocok banget buat undertone ${ctx.profile.skinTone} kamu (harmoni ${h}%), aman dipakai dekat wajah` : h >= 65 ? `lumayan cocok (harmoni ${h}%); lebih aman dipakai di atasan yang tidak terlalu dekat wajah, atau diberi kerah/hijab warna netral` : `kurang menyatu dengan undertone ${ctx.profile.skinTone} kamu (harmoni ${h}%), jadi lebih enak dipakai sebagai bawahan atau aksesori`;
    return `Warna ${near} ${verdict}. Paduan yang gampang: satu warna netral (krem, putih gading, atau hitam) sebagai jangkar, lalu ${near} sebagai warna utama. Mau aku cariin produk ${near} yang ukurannya pas?`;
  }
  if (/(undertone|warna kulit|kulit (sawo|kuning|putih|gelap))/i.test(t)) return `${TONE_TEXT[ctx.profile.skinTone]}\n\nMau aku tunjukkan produk di katalog yang paling serasi?`;
  if (/(bentuk tubuh|badan|body shape|gemuk|kurus|pendek|tinggi|perut|pinggul)/i.test(t)) return `${SHAPE_TEXT[ctx.profile.bodyShape]}\n\nKalau mau, sebutkan acaranya dan aku susun outfit yang memakai prinsip ini.`;
  if (/(cuci|nyuci|rawat|setrika|luntur|kusut|menyusut|melar)/i.test(t)) {
    return 'Tips singkat: linen dan katun dicuci air dingin dan dijemur terbalik supaya warnanya awet; batik tulis cukup direndam lerak atau sabun lembut tanpa dikucek; rajutan dikeringkan mendatar supaya tidak melar; denim cukup dicuci tiap 5 sampai 10 kali pakai. Ada bahan tertentu yang mau kamu tanyakan?';
  }
  // Anything else: ask instead of guessing with random products.
  return pick([
    'Hmm, aku belum nangkep maksudnya. Aku paling jago soal outfit: coba ceritain acaranya (kuliah, kantor, kondangan, jalan-jalan), budget, atau barang yang lagi kamu incar.',
    'Boleh dijelasin sedikit lagi? Misalnya "outfit ngampus budget 300rb", "jeans yang pas buat pinggangku", atau "susun outfit seminggu". Nanti aku kerjakan.',
    'Itu di luar keahlianku, hehe. Tapi kalau soal mau pakai apa, aku siap: sebutkan acara atau gaya yang kamu mau.',
  ], t);
}

export function runLocalAgent(opts: { text: string; mode: ChatMode; ctx: AgentContext; attachedImageHex?: string; attachedWardrobeIds?: string[] }): AgentReply {
  const { text, mode, ctx } = opts;
  const lines: string[] = [];

  const measures = measurementsIn(text);
  if (Object.keys(measures).length) {
    const r = runTool('update_measurements', measures, ctx) as { ok?: boolean };
    if (r.ok) lines.push('Ukuran tubuh kamu sudah aku perbarui, jadi semua hitungan di bawah memakai angka baru.');
  }

  const budget = parseBudget(text);
  const occasions = occasionsIn(text);
  const cats = CATEGORY_WORDS.filter((c) => c.re.test(text)).flatMap((c) => c.cats);
  const wantsOutfit = occasions.length > 0 || /(outfit|padu|padan|kombinasi|look|mix|racik)/i.test(text);
  const weather = weatherIn(text);
  const lockIds = opts.attachedWardrobeIds ?? [];
  // "Cara nyuci batik" is a care question, not a request to shop for batik.
  const careOnly = /(cuci|nyuci|rawat|setrika|luntur|kusut|menyusut|melar)/i.test(text) && !/(cari|carikan|beli|rekomendasi|outfit)/i.test(text);
  const hasIntent = !careOnly && (wantsOutfit || cats.length > 0 || daysIn(text) > 0 || Object.keys(measures).length > 0 || lockIds.length > 0 || !!opts.attachedImageHex || /(favorit|bandingkan|ukuran|size|cari|carikan|rekomendasi|saran outfit)/i.test(text));
  // Small talk and general questions get a conversational answer; real requests go to the tools.
  if (!hasIntent) return finalize(ctx, conversational(text, ctx, false) ?? '', 'local');

  if (cats.length && !wantsOutfit) {
    // A product question: search, then check fit of the best match.
    const res = runTool('search_products', { categories: cats, max_price: budget ?? undefined, occasion: occasions[0], limit: 3 }, ctx) as {
      produk: { id: string; nama: string; toko: string; harga_teks: string; ukuran_terbaik: string; skor_pas: number }[];
    };
    if (res.produk.length) {
      const fit = runTool('check_fit', { product_id: res.produk[0].id }, ctx) as { rekomendasi?: { ukuran: string; skor: number; catatan: string[] } };
      lines.push(`Aku cek ${cats.map((c) => CATEGORY_LABEL[c].toLowerCase()).filter((v, i, a) => a.indexOf(v) === i).join(' dan ')} di katalog${budget ? ` di bawah ${formatIDR(budget)}` : ''}. Yang paling pas dengan ukuran kamu:`);
      res.produk.forEach((p, i) => lines.push(`${i + 1}. ${p.nama}, ${p.toko}, ${p.harga_teks}, ukuran ${p.ukuran_terbaik} (${p.skor_pas}%)`));
      if (/(bandingkan|banding|\bvs\b|mana yang lebih)/i.test(text) && res.produk.length >= 2) {
        const cmp = runTool('compare_products', { product_ids: res.produk.slice(0, 3).map((p) => p.id) }, ctx) as { paling_serasi?: string };
        const best = res.produk.find((p) => p.id === cmp.paling_serasi);
        if (best) lines.push(`Kalau harus pilih satu: ${best.nama}, karena gabungan skor pas dan harmoni warnanya paling tinggi untuk kamu.`);
      }
      if (fit.rekomendasi && mode === 'lengkap') lines.push(`Hitungan kelonggaran ${res.produk[0].nama} ukuran ${fit.rekomendasi.ukuran}:\n${fit.rekomendasi.catatan.join('\n')}`);
    } else {
      lines.push('Belum ada produk yang cocok dengan filter itu. Coba longgarkan budget atau kategori.');
    }
  } else if (daysIn(text) > 0 && !(occasions.length >= 2 && !/(seminggu|sepekan|\d\s*hari|tiap hari|setiap hari|senin\s*(sampai|s\/d|-|hingga))/i.test(text))) {
    // ("Minggu ini ada kuliah, interview, dan kondangan" lists events, not a daily plan.)
    // Week planning: one outfit per day, wardrobe rotated, purchases never repeated.
    // "5 hari ... Sabtu ada kondangan" means the plan has to reach Saturday.
    const days = /sabtu/i.test(text) ? Math.max(daysIn(text), 6) : /minggu\s+(ada|ke|pagi|siang|malam)/i.test(text) ? 7 : daysIn(text);
    const plan = weekPlan(days, text, occasions);
    if (ctx.wardrobe.length) runTool('view_wardrobe', {}, ctx);
    const per = budget !== null ? Math.floor(budget / days / 1000) * 1000 : 250000;
    const mode2 = /(lemari saja|dari lemari|tanpa beli|rp ?0|hemat)/i.test(text) ? 'wardrobe' : ctx.wardrobe.length ? 'hybrid' : 'umkm';
    // Rotate the wardrobe: a top or bottom rests for two days in hybrid plans
    // (a new piece is bought instead), one day when only the wardrobe is used.
    const rest = mode2 === 'wardrobe' ? 1 : 2;
    const worn: string[][] = [];
    plan.forEach((occ, i) => {
      const exclude = worn.slice(-rest).flat();
      runTool('build_outfit', { occasion: occ, weather, budget: per, mode: mode2, wardrobe_ids: i === 0 ? lockIds : [], exclude_ids: exclude, title: `${DAYS[i]} (${OCCASION_LABEL[occ]})` }, ctx);
      const o = ctx.outfits[ctx.outfits.length - 1];
      worn.push(o.pieces.filter((p) => p.source === 'wardrobe' && (p.slot === 'top' || p.slot === 'bottom')).map((p) => p.refId));
    });
    const total = ctx.outfits.reduce((s, o) => s + o.totalPrice, 0);
    const buys = ctx.outfits.flatMap((o) => o.pieces.filter((p) => p.source === 'umkm'));
    lines.push(
      `Siap, ini rencana ${days === 7 ? 'seminggu' : `${days} hari`} yang sudah aku hitung dengan ukuran dan undertone ${ctx.profile.skinTone} kamu. Baju dari lemari aku gilir supaya tidak dipakai dua hari berturut-turut${buys.length ? ', dan setiap barang baru cukup dibeli sekali' : ''}.`,
      ...ctx.outfits.map((o) => `${o.title}: ${o.pieces.map((p) => p.name).join(', ')}${o.totalPrice ? ` (belanja ${formatIDR(o.totalPrice)})` : ''}.`),
      buys.length
        ? `Total belanja ${formatIDR(total)} untuk ${buys.length} barang${budget !== null ? (total <= budget ? `, masih di bawah budget ${formatIDR(budget)}` : `, sedikit di atas budget ${formatIDR(budget)}`) : ''}. Sisanya memakai lemari kamu sendiri.${budget === null ? ' Sebutkan budget kalau mau aku buat lebih hemat.' : ''}`
        : 'Semua dari lemari kamu, tanpa belanja.',
    );
    const warn = ctx.outfits.flatMap((o) => o.fitWarnings);
    if (warn.length) lines.push(`Satu catatan ukuran: ${warn.join(', ')} kurang pas. Ketuk Edit di Studio untuk menggantinya.`);
    if (/simpan/i.test(text)) ctx.outfits.forEach((o) => runTool('save_outfit', { outfit_id: o.id }, ctx));
  } else {
    // Outfit planning: one outfit per occasion, budget split evenly.
    const plan = occasions.length ? occasions.slice(0, 4) : (['kasual'] as Occasion[]);
    if (ctx.wardrobe.length) runTool('view_wardrobe', {}, ctx);
    const per = budget !== null ? Math.floor(budget / plan.length / 1000) * 1000 : 800000;
    const mode2 = /(lemari saja|dari lemari|tanpa beli|rp ?0)/i.test(text) ? 'wardrobe' : /(belanja|beli baru|semua baru)/i.test(text) ? 'umkm' : ctx.wardrobe.length ? 'hybrid' : 'umkm';
    for (const occ of plan) {
      runTool('build_outfit', { occasion: occ, weather, budget: per, mode: mode2, wardrobe_ids: lockIds, title: OCCASION_LABEL[occ] }, ctx);
    }
    const head = plan.length > 1
      ? `Aku susun ${plan.length} outfit sekaligus${budget !== null ? ` dengan budget ${formatIDR(budget)} dibagi rata` : ''}, tanpa mengulang produk yang sama:`
      : `Outfit ${OCCASION_LABEL[plan[0]].toLowerCase()}${weather !== 'cerah' ? ` untuk cuaca ${weather}` : ''} yang paling pas dengan ukuran dan undertone kamu:`;
    lines.push(head, ...ctx.outfits.map(outfitLine));
    const warn = ctx.outfits.flatMap((o) => o.fitWarnings);
    if (warn.length) lines.push(`Perlu dicek ukurannya: ${warn.join(', ')}. Ganti slotnya di Studio atau perbarui ukuran tubuh.`);
    if (budget !== null) {
      const total = ctx.outfits.reduce((s, o) => s + o.totalPrice, 0);
      lines.push(total <= budget ? `Total belanja ${formatIDR(total)}, masih di bawah budget.` : `Total ${formatIDR(total)}, sedikit di atas budget. Ganti satu item dengan preloved untuk menghemat.`);
    }
    if (/simpan/i.test(text)) ctx.outfits.forEach((o) => runTool('save_outfit', { outfit_id: o.id }, ctx));
    if (/(studio|buka|edit|ubah)/i.test(text) && ctx.outfits[0]) runTool('open_in_studio', { outfit_id: ctx.outfits[0].id }, ctx);
  }

  if (/(favorit|wishlist|tandai)/i.test(text) && ctx.seen.length) runTool('add_favorites', { product_ids: ctx.seen.slice(0, 3) }, ctx);

  if (opts.attachedImageHex) {
    const h = undertoneHarmony(opts.attachedImageHex, ctx.profile.skinTone);
    lines.push(`Foto kamu: warna dominan ${nearestColorName(opts.attachedImageHex)}, harmoni dengan undertone ${h}%. ${h >= 85 ? 'Aman dipakai dekat wajah.' : 'Lebih aman dipakai sebagai bawahan.'}`);
  }
  if (mode === 'lengkap') {
    lines.push(`Harmoni rona kulit\n${TONE_TEXT[ctx.profile.skinTone]}`, `Siluet\n${SHAPE_TEXT[ctx.profile.bodyShape]}`);
  }

  return finalize(ctx, lines.join('\n\n'), 'local');
}
