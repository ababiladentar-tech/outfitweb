import { NextResponse } from 'next/server';
import { geminiConfigured, geminiGenerate } from '@/lib/server/gemini';
import type { WardrobeCategory } from '@/lib/types';

const CATEGORIES: WardrobeCategory[] = ['tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'bags', 'accessories'];
const STYLES = ['casual', 'formal', 'minimalist', 'streetwear', 'old_money', 'etnik_modern'];
const MAX_BYTES = 2_000_000;

export async function POST(req: Request) {
  if (!geminiConfigured()) {
    return NextResponse.json({ available: false, reason: 'Pengenal foto belum dikonfigurasi. Warna dibaca dari piksel foto.' });
  }
  let image = '';
  try {
    image = ((await req.json()) as { image?: string }).image ?? '';
  } catch {
    return NextResponse.json({ available: false, reason: 'Format permintaan tidak valid.' }, { status: 400 });
  }
  const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match || match[2].length * 0.75 > MAX_BYTES) {
    return NextResponse.json({ available: false, reason: 'Foto harus JPG, PNG, atau WEBP di bawah 2 MB.' }, { status: 400 });
  }

  const raw = await geminiGenerate({
    system: 'Anda mengenali satu pakaian utama di foto untuk lemari digital. Jawab hanya JSON.',
    parts: [
      { inline_data: { mime_type: match[1], data: match[2] } },
      {
        text: `Kembalikan JSON: {"name": nama singkat bahasa Indonesia maks 4 kata, "category": salah satu ${CATEGORIES.join('|')}, "colorName": warna dalam bahasa Indonesia, "colorHex": "#RRGGBB", "style": salah satu ${STYLES.join('|')}}`,
      },
    ],
    json: true,
    temperature: 0.2,
    maxOutputTokens: 200,
  });
  if (!raw) return NextResponse.json({ available: false, reason: 'Pengenal foto sedang tidak bisa dihubungi. Warna dibaca dari piksel foto.' });

  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    const category = CATEGORIES.includes(p.category as WardrobeCategory) ? (p.category as WardrobeCategory) : null;
    const hex = typeof p.colorHex === 'string' && /^#[0-9a-fA-F]{6}$/.test(p.colorHex) ? p.colorHex.toUpperCase() : null;
    return NextResponse.json({
      available: true,
      name: typeof p.name === 'string' ? p.name.slice(0, 40) : null,
      category,
      colorName: typeof p.colorName === 'string' ? p.colorName.slice(0, 20) : null,
      colorHex: hex,
      style: STYLES.includes(String(p.style)) ? String(p.style) : null,
    });
  } catch {
    return NextResponse.json({ available: false, reason: 'Hasil pengenal foto tidak terbaca. Warna dibaca dari piksel foto.' });
  }
}
