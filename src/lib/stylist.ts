import { CATEGORY_LABEL } from './data';
import { hexToHsl, nearestColorName, undertoneHarmony, vibeScore } from './color';
import { bestSize } from './sizing';
import { formatIDR } from './format';
import type {
  BodyShape,
  ChatMode,
  ProductCategory,
  SkinTone,
  UMKMProductPost,
  UserProfile,
  WardrobeItem,
} from './types';

export interface StylistInput {
  text: string;
  mode: ChatMode;
  profile: UserProfile;
  catalog: UMKMProductPost[];
  wardrobe: WardrobeItem[];
  attachedImageHex?: string;
}

export interface StylistReply {
  text: string;
  productIds: string[];
}

const OCCASIONS: { re: RegExp; key: string; label: string }[] = [
  { re: /(kondangan|nikah|resepsi|wisuda|lamaran)/i, key: 'kondangan', label: 'kondangan' },
  { re: /(kantor|kerja|meeting|interview|wawancara|presentasi)/i, key: 'kantor', label: 'ke kantor' },
  { re: /(kuliah|kampus|kelas|sekolah)/i, key: 'kuliah', label: 'ke kampus' },
  { re: /(weekend|akhir pekan|jalan|nongkrong|ngopi|mall)/i, key: 'weekend', label: 'akhir pekan' },
];

const CATEGORY_WORDS: { re: RegExp; cats: ProductCategory[] }[] = [
  { re: /(jeans|denim)/i, cats: ['jeans'] },
  { re: /(celana|kulot|chino|rok|bawahan)/i, cats: ['pants', 'jeans'] },
  { re: /(outer|jaket|blazer|cardigan|kimono)/i, cats: ['outerwear'] },
  { re: /(sepatu|loafer|sneaker)/i, cats: ['shoes'] },
  { re: /(tas|tote|sling)/i, cats: ['bag'] },
  { re: /(hijab|kerudung)/i, cats: ['hijab'] },
  { re: /(dress|gaun|terusan)/i, cats: ['dress'] },
  { re: /(kemeja|atasan|blouse|tunik|batik)/i, cats: ['top'] },
];

const TONE_TEXT: Record<SkinTone, string> = {
  warm:
    'Undertone hangat, khas kulit sawo matang, paling hidup dengan warna tanah: camel, coklat soga, olive, krem gading, dan terracotta. Hindari abu dingin yang terlalu pucat di dekat wajah karena membuat kulit tampak kusam.',
  cool:
    'Undertone sejuk cocok dengan indigo, navy, hijau botol, abu dingin, dan dusty pink. Warna oranye kekuningan sebaiknya dipakai di bawahan, bukan di dekat wajah.',
  neutral:
    'Undertone netral memberi Anda keleluasaan paling besar. Kunci harmoninya ada pada kontras: padukan satu warna gelap sebagai jangkar dengan satu warna terang di dekat wajah.',
};

const SHAPE_TEXT: Record<BodyShape, string> = {
  hourglass: 'Bentuk hourglass: tonjolkan garis pinggang dengan tali pinggang atau potongan wrap, hindari atasan boxy yang menutup lekuk.',
  pear: 'Bentuk pear: beri volume dan detail di bagian atas (kerah, bahu terstruktur), lalu pilih bawahan wide leg atau A-line berwarna lebih gelap.',
  apple: 'Bentuk apple: gunakan garis vertikal panjang seperti outer kimono terbuka dan bahan yang jatuh, hindari potongan ketat di perut.',
  inverted_triangle: 'Bentuk inverted triangle: seimbangkan bahu dengan bawahan bervolume (kulot, plisket) dan atasan berkerah V.',
  rectangle: 'Bentuk rectangle: ciptakan ilusi pinggang lewat lipit pleated, layering, atau tali pinggang di atas outer.',
  oval: 'Bentuk oval: pilih kemeja potongan regular dengan garis vertikal dan outer terbuka untuk memanjangkan torso.',
  triangle: 'Bentuk triangle: tambahkan struktur di bahu, misalnya trucker jacket atau blazer, agar proporsi atas dan bawah seimbang.',
  trapezoid: 'Bentuk trapezoid: hampir semua potongan regular dan straight cocok. Jaga proporsi dengan celana straight yang tidak terlalu ketat.',
};

function parseBudget(text: string): number | null {
  const juta = text.match(/(\d+(?:[.,]\d+)?)\s*(jt|juta)/i);
  if (juta) return parseFloat(juta[1].replace(',', '.')) * 1_000_000;
  const rb = text.match(/(\d{2,4})\s*(rb|ribu|k)\b/i);
  if (rb) return parseInt(rb[1], 10) * 1000;
  const raw = text.match(/rp\s?([\d.]{5,})/i);
  if (raw) return parseInt(raw[1].replace(/\./g, ''), 10);
  return null;
}

export function composeReply(input: StylistInput): StylistReply {
  const { text, mode, profile, catalog, wardrobe, attachedImageHex } = input;
  const occasion = OCCASIONS.find((o) => o.re.test(text));
  const cats = CATEGORY_WORDS.filter((c) => c.re.test(text)).flatMap((c) => c.cats);
  const budget = parseBudget(text);
  const asksSize = /(ukuran|size|cm|pas|longgar|sempit|kelonggaran)/i.test(text);
  const asksColor = /(warna|sawo|undertone|kulit|palet)/i.test(text);

  const pool = catalog.filter((p) => p.isAvailable && p.stockCount > 0);
  const ranked = pool
    .map((p) => {
      const fit = bestSize(p, profile.measurements);
      const vibe = vibeScore(p, profile.skinTone, profile.bodyShape);
      let score = fit.fit.score * 0.5 + vibe * 0.5;
      if (occasion && p.tags.includes(occasion.key)) score += 18;
      if (cats.length && cats.includes(p.category)) score += 30;
      if (budget !== null && p.price > budget) score -= 60;
      if (profile.gender === 'boy' && (p.category === 'dress' || p.category === 'hijab')) score -= 80;
      if (profile.gender === 'boy' && p.tags.includes('pria')) score += 10;
      return { p, fit, vibe, score };
    })
    .sort((a, b) => b.score - a.score);

  const picks: typeof ranked = [];
  const group = (c: ProductCategory): ProductCategory => (c === 'dress' ? 'top' : c === 'jeans' ? 'pants' : c);
  const usedCats = new Set<ProductCategory>();
  let spent = 0;
  for (const r of ranked) {
    if (picks.length >= 3) break;
    if (!cats.length && usedCats.has(group(r.p.category))) continue;
    if (budget !== null && spent + r.p.price > budget) continue;
    spent += r.p.price;
    picks.push(r);
    usedCats.add(group(r.p.category));
  }

  if (!picks.length) picks.push(...[...ranked].sort((a, b) => a.p.price - b.p.price).slice(0, 2));

  const attached = wardrobe.filter(Boolean);
  const occasionLabel = occasion?.label ?? 'aktivitas Anda';

  if (mode === 'ringkas') {
    const lines = picks.map(
      (r, i) =>
        `${i + 1}. ${r.p.title} - ${r.p.sellerName} (${r.p.sellerCity}) - ${formatIDR(r.p.price)} - ukuran ${r.fit.size.sizeLabel}, kecocokan ${r.fit.fit.score}%`,
    );
    const head = attached.length
      ? `Untuk ${occasionLabel}, padukan ${attached.map((w) => w.name).join(' dan ')} dari lemari Anda dengan:`
      : `Untuk ${occasionLabel}, ini pilihan yang paling pas dengan ukuran dan rona kulit Anda:`;
    const budgetLine = budget !== null ? `\n\nSemua di bawah batas ${formatIDR(budget)} sudah saya prioritaskan.` : '';
    const imgLine = attachedImageHex
      ? `\n\nFoto Anda: warna dominan ${nearestColorName(attachedImageHex)} (${attachedImageHex}), harmoni dengan undertone ${undertoneHarmony(attachedImageHex, profile.skinTone)}%.`
      : '';
    return {
      text: `${head}\n\n${lines.join('\n')}${budgetLine}${imgLine}\n\nKetuk kartu produk untuk membuka tautan toko.`,
      productIds: picks.map((r) => r.p.id),
    };
  }

  const parts: string[] = [];
  parts.push(
    `Saya susun kombinasi untuk ${occasionLabel} berdasarkan profil Anda: undertone ${profile.skinTone}, bentuk tubuh ${profile.bodyShape.replace('_', ' ')}, LD ${profile.measurements.chestCm} cm, LP ${profile.measurements.waistCm} cm, bahu ${profile.measurements.shoulderCm} cm.`,
  );

  if (attachedImageHex) {
    const h = hexToHsl(attachedImageHex);
    const harmony = undertoneHarmony(attachedImageHex, profile.skinTone);
    parts.push(
      `Penilaian foto: warna dominan pakaian Anda ${nearestColorName(attachedImageHex)} (${attachedImageHex}), saturasi ${Math.round(h.s)}%. Harmoni dengan undertone Anda ${harmony}%. ${harmony >= 85 ? 'Warna ini aman dipakai dekat wajah.' : 'Sebaiknya jauhkan dari area wajah, pakai sebagai bawahan atau beri hijab/kerah dengan warna yang lebih selaras.'}`,
    );
  }

  parts.push(`Harmoni rona kulit\n${TONE_TEXT[profile.skinTone]}`);
  parts.push(`Siluet\n${SHAPE_TEXT[profile.bodyShape]}`);

  if (attached.length) {
    parts.push(
      `Dari lemari Anda\n${attached
        .map((w) => `${w.name} (${w.color}) berfungsi sebagai ${w.category === 'tops' ? 'atasan dasar' : w.category === 'bottoms' ? 'bawahan jangkar' : 'pelengkap'}; harmoni warna ${undertoneHarmony(w.colorHex, profile.skinTone)}%.`)
        .join('\n')}`,
    );
  }

  const fitDetail = picks.find((r) => r.p.category !== 'bag' && r.p.category !== 'hijab') ?? picks[0];
  if (fitDetail) {
    const extra = asksSize
      ? '\nCatatan: katun twill dengan spandex memberi toleransi sekitar 2 cm lebih banyak dibanding denim non-stretch, jadi untuk denim pilih ukuran dengan kelonggaran pinggang 2 - 3 cm.'
      : '';
    parts.push(
      `Perhitungan kelonggaran kain\n${fitDetail.p.title}, ukuran ${fitDetail.fit.size.sizeLabel}:\n${fitDetail.fit.fit.notes.join('\n')}\nSkor kesesuaian ${fitDetail.fit.fit.score}%.${extra}`,
    );
  }

  if (asksColor && profile.palette.length) {
    parts.push(`Palet favorit Anda (${profile.palette.join(', ')}) saya pakai sebagai warna aksen, bukan warna utama, agar tetap serasi dengan undertone.`);
  }

  parts.push(
    `Kombinasi Pilihan\n${picks
      .map((r) => `${CATEGORY_LABEL[r.p.category]}: ${r.p.title} dari ${r.p.sellerName}, ${formatIDR(r.p.price)}, ukuran ${r.fit.size.sizeLabel} (${r.fit.fit.score}%).`)
      .join('\n')}`,
  );
  if (budget !== null) {
    const total = picks.reduce((s, r) => s + r.p.price, 0);
    parts.push(`Total ${formatIDR(total)}${total > budget ? `, sedikit di atas budget ${formatIDR(budget)}. Ganti satu item dengan pilihan preloved untuk menghemat.` : `, masih di bawah budget ${formatIDR(budget)}.`}`);
  }

  return { text: parts.join('\n\n'), productIds: picks.map((r) => r.p.id) };
}

export const QUICK_SUGGESTIONS: string[] = [
  'Outfit kondangan siang untuk kulit sawo matang',
  'Jeans yang pas untuk pinggang saya',
  'Padu padan ke kantor di bawah 600rb',
  'Outer untuk ke kampus saat hujan',
  'Warna yang cocok untuk undertone saya',
];
