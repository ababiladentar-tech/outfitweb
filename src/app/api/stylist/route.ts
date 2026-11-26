import { NextResponse } from 'next/server';
import { runLocalAgent } from '@/lib/agent/local';
import { runModelAgent } from '@/lib/agent/run';
import { createContext } from '@/lib/agent/tools';
import { nearestColorName } from '@/lib/color';
import { geminiConfigured, geminiToolTurn, lastGeminiError } from '@/lib/server/gemini';
import { cloudConfigured, consumeAiQuota, userFromRequest } from '@/lib/server/supabase';
import type { AgentReply, ChatMode, UMKMProductPost, UserProfile, WardrobeItem } from '@/lib/types';

/** The agent may take several model turns; allow up to a minute on Vercel. */
export const maxDuration = 60;

interface Body {
  text?: string;
  mode?: ChatMode;
  profile?: UserProfile;
  catalog?: UMKMProductPost[];
  wardrobe?: WardrobeItem[];
  attachedWardrobeIds?: string[];
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
  const wardrobe = (body.wardrobe ?? []).slice(0, 60).map((w) => ({ ...w, imageUrl: w.imageUrl.startsWith('data:') ? '' : w.imageUrl }));
  const attachedWardrobeIds = (body.attachedWardrobeIds ?? []).filter((id) => wardrobe.some((w) => w.id === id));
  const hex = typeof body.attachedImageHex === 'string' && /^#[0-9a-fA-F]{6}$/.test(body.attachedImageHex) ? body.attachedImageHex : undefined;

  const ctx = createContext(body.profile, catalog, wardrobe);
  const local = (): AgentReply => runLocalAgent({ text, mode, ctx, attachedImageHex: hex, attachedWardrobeIds });

  if (!geminiConfigured()) return NextResponse.json(local());

  // With a database configured, model calls need a signed-in user and count
  // against a daily quota, so a public deployment cannot drain the API key.
  let notice: string | undefined;
  if (cloudConfigured()) {
    const auth = await userFromRequest(req);
    if (!auth) {
      return NextResponse.json({ ...local(), notice: 'Masuk untuk memakai Stylist Agent berbasis Gemini. Jawaban ini disusun mesin lokal.' });
    }
    const left = await consumeAiQuota(auth.db);
    if (left < 0) {
      return NextResponse.json({ ...local(), notice: 'Kuota Stylist Agent hari ini habis. Jawaban ini disusun mesin lokal.', quotaLeft: 0 });
    }
  }

  const attachments = [
    attachedWardrobeIds.length ? `Item lemari yang dilampirkan (wajib dipakai jika menyusun outfit): ${attachedWardrobeIds.map((id) => { const w = wardrobe.find((x) => x.id === id); return w ? `${w.name} [${w.id}]` : id; }).join(', ')}.` : '',
    hex ? `Pengguna melampirkan foto pakaian dengan warna dominan ${nearestColorName(hex)} (${hex}).` : '',
  ];
  const history = (body.history ?? []).slice(-6).map((h) => ({ role: h.role === 'user' ? ('user' as const) : ('model' as const), text: h.text.slice(0, 1200) }));

  const reply = await runModelAgent({ text, mode, ctx, history, attachments, turn: geminiToolTurn });
  if (reply) return NextResponse.json({ ...reply, notice });

  // Model unreachable: start over with a clean context so no half-run steps leak in.
  const fresh = createContext(body.profile, catalog, wardrobe);
  const why = lastGeminiError ?? '';
  const hint = /HTTP 404/.test(why)
    ? 'Model Gemini tidak tersedia untuk API key ini. Ganti GEMINI_MODEL di .env.local (lihat pesan di log server), lalu restart server.'
    : /HTTP 40[013]/.test(why)
    ? 'API key Gemini ditolak. Cek GEMINI_API_KEY di .env.local (key dari aistudio.google.com biasanya diawali AIza), lalu restart server.'
    : /HTTP (429|500|503)/.test(why)
    ? 'Server Gemini sedang penuh dari sisi Google, model cadangan juga sibuk. Coba kirim lagi sebentar lagi.'
    : 'Gemini sedang tidak bisa dihubungi.';
  return NextResponse.json({ ...runLocalAgent({ text, mode, ctx: fresh, attachedImageHex: hex, attachedWardrobeIds }), notice: `${hint} Jawaban ini disusun mesin lokal.` });
}
