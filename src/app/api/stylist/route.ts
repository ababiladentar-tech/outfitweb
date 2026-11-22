import { NextResponse } from 'next/server';
import { composeReply } from '@/lib/stylist';
import { bestSize } from '@/lib/sizing';
import { cleanCopy, formatIDR } from '@/lib/format';
import { geminiGenerate } from '@/lib/server/gemini';
import type { ChatMode, UMKMProductPost, UserProfile, WardrobeItem } from '@/lib/types';

interface Body {
  text?: string;
  mode?: ChatMode;
  profile?: UserProfile;
  catalog?: UMKMProductPost[];
  wardrobe?: WardrobeItem[];
  attachedImageHex?: string;
  history?: { role: 'user' | 'stylist'; text: string }[];
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }
  const text = (body.text ?? '').trim().slice(0, 1500);
  if (!text || !body.profile || !Array.isArray(body.catalog)) {
    return NextResponse.json({ error: 'Pesan, profil, dan katalog wajib dikirim.' }, { status: 400 });
  }
  const mode: ChatMode = body.mode === 'lengkap' ? 'lengkap' : 'ringkas';
  const catalog = body.catalog.slice(0, 300);
  const wardrobe = (body.wardrobe ?? []).slice(0, 12);
  const profile = body.profile;

  // Product choice and fit maths always come from the local engine, so the
  // writer below can only describe items that exist, with real cm figures.
  const local = composeReply({ text, mode, profile, catalog, wardrobe, attachedImageHex: body.attachedImageHex });

  const picked = local.productIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is UMKMProductPost => Boolean(p))
    .map((p) => {
      const fit = bestSize(p, profile.measurements);
      return `- ${p.title} | ${p.sellerName}, ${p.sellerCity} | ${formatIDR(p.price)} | bahan ${p.material ?? '-'} | ukuran ${fit.size.sizeLabel}, kecocokan ${fit.fit.score}% (${fit.fit.notes.join(' ')})`;
    })
    .join('\n');

  const system = [
    'Anda adalah stylist manusia di Outfitly, platform kurasi busana UMKM dan preloved Indonesia.',
    'Tulis dalam bahasa Indonesia yang hangat dan lugas, tanpa emoji, tanpa tanda pisah panjang, tanpa markdown tebal.',
    'Hanya sebut produk dari daftar yang diberikan, dengan nama, toko, dan harga persis. Jangan mengarang produk, diskon, garansi, atau klaim lain.',
    'Jangan menyebut diri sebagai AI, model, atau algoritma.',
    mode === 'ringkas'
      ? 'Mode Ringkas: maksimal 90 kata. Satu kalimat pembuka, lalu daftar bernomor produk dengan toko dan harga, lalu satu saran singkat.'
      : 'Mode Konsultasi Lengkap: 150 sampai 260 kata. Bahas harmoni warna terhadap undertone, siluet terhadap bentuk tubuh, dan kelonggaran kain dalam cm memakai angka yang diberikan.',
  ].join(' ');

  const facts = [
    `Profil: undertone ${profile.skinTone}, bentuk tubuh ${profile.bodyShape}, wajah ${profile.faceShape}, LD ${profile.measurements.chestCm} cm, LP ${profile.measurements.waistCm} cm, bahu ${profile.measurements.shoulderCm} cm, tinggi ${profile.measurements.heightCm} cm, gaya ${profile.styles.join(', ')}.`,
    wardrobe.length ? `Dari lemari pengguna: ${wardrobe.map((w) => `${w.name} (${w.color})`).join(', ')}.` : '',
    body.attachedImageHex ? `Foto terlampir dengan warna dominan ${body.attachedImageHex}.` : '',
    `Produk yang dipilih:\n${picked || '(tidak ada yang cocok)'}`,
    `Draf faktual dari tim (pakai angkanya, perbaiki gayanya):\n${local.text}`,
    `Pertanyaan pengguna: ${text}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const history = (body.history ?? []).slice(-6).map((h) => ({ role: h.role === 'user' ? ('user' as const) : ('model' as const), text: h.text.slice(0, 1200) }));
  const written = await geminiGenerate({ system, parts: [{ text: facts }], history, temperature: 0.55 });

  return NextResponse.json({
    text: written ? cleanCopy(written) : local.text,
    productIds: local.productIds,
    source: written ? 'gemini' : 'local',
  });
}
