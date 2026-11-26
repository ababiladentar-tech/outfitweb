import { cleanCopy, formatIDR } from '../format';
import type { AgentReply, ChatMode, UserProfile } from '../types';
import { TOOL_DECLARATIONS, runTool, type AgentContext } from './tools';

export interface ModelContent {
  role: 'user' | 'model';
  parts: Record<string, unknown>[];
}

export type ModelTurn = (opts: { system: string; contents: ModelContent[]; tools: object[] }) => Promise<ModelContent | null>;

const MAX_STEPS = 8;

export function agentSystemPrompt(mode: ChatMode, profile: UserProfile): string {
  return [
    'Anda adalah Stylist Agent Outfitly, platform kurasi busana UMKM dan preloved Indonesia.',
    'Anda bukan sekadar menjawab: Anda bekerja memakai tools. Cari produk, hitung ukuran, baca lemari, susun outfit, dan jalankan aksi yang diminta pengguna.',
    'Tapi Anda juga teman ngobrol yang luwes. Sapaan, terima kasih, curhat soal penampilan, atau pertanyaan fashion umum (padu padan warna, tren, perawatan kain, tips sesuai bentuk tubuh) dijawab langsung secara natural tanpa tools, kecuali jawabannya butuh produk atau angka dari katalog. Pertanyaan di luar fashion boleh dijawab singkat dan ramah, lalu arahkan kembali ke gaya pengguna bila wajar.',
    'Ikuti gaya bahasa pengguna: kalau ia santai (aku/kamu, gaul), jawab santai; kalau formal, jawab formal. Variasikan kalimat pembuka, jangan pakai pola yang sama setiap kali.',
    'Aturan kerja:',
    '1. Jangan menyebut produk, harga, toko, atau angka ukuran yang tidak berasal dari hasil tools.',
    '2. Permintaan outfit untuk sebuah acara: panggil build_outfit. Untuk beberapa acara sekaligus, panggil build_outfit sekali per acara dan bagi budget total secara masuk akal.',
    '2b. Permintaan "seminggu", "5 hari", atau "Senin sampai Jumat": panggil build_outfit sekali per hari dengan judul "Senin: Kuliah" dan seterusnya. Hari kerja ikuti rutinitas pengguna (kuliah/kantor), Sabtu weekend, Minggu kasual. Bagi budget per hari (tanpa budget, sekitar Rp 250.000 per hari), dan isi exclude_ids dengan atasan/bawahan lemari hari sebelumnya supaya tidak dipakai dua hari berturut-turut.',
    '3. Pertanyaan ukuran atau "pas tidak": panggil check_fit. Pertanyaan "mana yang lebih bagus": compare_products.',
    '4. Jika pengguna menyebut ukuran tubuh baru, panggil update_measurements lebih dulu, lalu lanjutkan.',
    '5. save_outfit, open_in_studio, dan add_favorites hanya jika pengguna memintanya ("simpan", "buka di studio", "favoritkan").',
    '6. Jika ada item dengan skor pas di bawah 70, sebutkan dan tawarkan alternatif.',
    'Kalau permintaan outfit kurang jelas (acara, budget), ambil asumsi yang masuk akal, kerjakan, lalu sebutkan asumsinya dalam satu kalimat. Bertanya balik hanya kalau tanpa jawabannya hasilnya pasti meleset.',
    'Jawaban akhir dalam bahasa Indonesia yang hangat, santai, dan lugas seperti stylist teman sendiri, tanpa emoji, tanpa markdown tebal, tanpa tanda pisah panjang. Kartu outfit dan produk sudah ditampilkan aplikasi, jadi jangan mendaftar ulang semua detail; sorot alasan pilihan dan langkah berikutnya.',
    mode === 'ringkas' ? 'Mode Ringkas: jawaban akhir maksimal 80 kata.' : 'Mode Konsultasi Lengkap: 140 sampai 240 kata, bahas harmoni warna terhadap undertone, siluet terhadap bentuk tubuh, dan kelonggaran kain dalam cm dari hasil check_fit atau build_outfit.',
    `Profil pengguna: ${profile.gender === 'boy' ? 'pria' : 'wanita'}, undertone ${profile.skinTone}, bentuk tubuh ${profile.bodyShape}, wajah ${profile.faceShape}, gaya favorit ${profile.styles.join(', ') || '-'}, LD ${profile.measurements.chestCm} cm, LP ${profile.measurements.waistCm} cm, bahu ${profile.measurements.shoulderCm} cm, tinggi ${profile.measurements.heightCm} cm, kaki ${profile.measurements.footCm} cm.`,
  ].join('\n');
}

interface FunctionCall {
  name: string;
  args?: Record<string, unknown>;
}

const callsOf = (c: ModelContent): FunctionCall[] =>
  c.parts.map((p) => p.functionCall as FunctionCall | undefined).filter((f): f is FunctionCall => !!f && typeof f.name === 'string');

const textOf = (c: ModelContent): string =>
  c.parts
    .filter((p) => typeof p.text === 'string' && p.thought !== true)
    .map((p) => p.text as string)
    .join('')
    .trim();

/**
 * Agent loop: the model plans, calls tools, sees their results, and repeats
 * until it writes a final answer. Returns null when the model is unreachable,
 * so the caller can fall back to the local agent.
 */
export async function runModelAgent(opts: {
  text: string;
  mode: ChatMode;
  ctx: AgentContext;
  history: { role: 'user' | 'model'; text: string }[];
  attachments: string[];
  turn: ModelTurn;
}): Promise<AgentReply | null> {
  const { ctx, turn } = opts;
  const system = agentSystemPrompt(opts.mode, ctx.profile);
  const contents: ModelContent[] = [
    ...opts.history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: [opts.text, ...opts.attachments].filter(Boolean).join('\n\n') }] },
  ];

  for (let i = 0; i < MAX_STEPS; i += 1) {
    const reply = await turn({ system, contents, tools: TOOL_DECLARATIONS });
    if (!reply) return i === 0 ? null : finalize(ctx, '', 'gemini');
    contents.push(reply);
    const calls = callsOf(reply);
    if (!calls.length) return finalize(ctx, textOf(reply), 'gemini');
    contents.push({
      role: 'user',
      parts: calls.map((c) => ({ functionResponse: { name: c.name, response: { result: runTool(c.name, c.args ?? {}, ctx) } } })),
    });
  }
  return finalize(ctx, '', 'gemini');
}

/** Products shown under the answer: outfit purchases first, then what the agent looked at. */
export function shownProducts(ctx: AgentContext, text: string): string[] {
  const fromOutfits = ctx.outfits.flatMap((o) => o.pieces.filter((p) => p.source === 'umkm').map((p) => p.refId));
  if (fromOutfits.length) return [...new Set(fromOutfits)].slice(0, 6);
  const lower = text.toLowerCase();
  const named = ctx.seen.filter((id) => {
    const p = ctx.catalog.find((x) => x.id === id);
    return p && lower.includes(p.title.toLowerCase().slice(0, 18));
  });
  return (named.length ? named : ctx.seen).slice(0, 3);
}

export function finalize(ctx: AgentContext, text: string, source: AgentReply['source']): AgentReply {
  const body = cleanCopy(text) || fallbackSummary(ctx);
  return { text: body, productIds: shownProducts(ctx, body), outfits: ctx.outfits, steps: ctx.steps, actions: ctx.actions, source };
}

function fallbackSummary(ctx: AgentContext): string {
  if (ctx.outfits.length) {
    return ctx.outfits.map((o) => `${o.title}: ${o.pieces.length} item, total ${formatIDR(o.totalPrice)}.`).join('\n');
  }
  return 'Ini hasil yang saya temukan di katalog.';
}
