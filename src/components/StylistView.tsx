'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Compass, Download, History, ImagePlus, Loader2, Plus, RotateCcw, Shirt, Trash2, X } from 'lucide-react';
import { useApp } from './AppContext';
import { ActionChips, AgentTrace, OutfitCard } from './AgentBits';
import { ProductImage } from './GarmentArt';
import { Modal } from './ui';
import { compressImage, extractGarmentInfo } from '@/lib/color';
import { useAddFavorites, useCatalog, useChatQuota, useChatSessions, useHandoff, useProfile, useSavedOutfits, useWardrobe } from '@/lib/hooks';
import { QUICK_SUGGESTIONS } from '@/lib/stylist';
import { runLocalAgent } from '@/lib/agent/local';
import { createContext } from '@/lib/agent/tools';
import { authHeaders } from '@/lib/cloud/client';
import { emitToast, formatIDR, todayKey, uid, useHydrated } from '@/lib/storage';
import type { AgentOutfit, AgentReply, ChatMessage, ChatMode, ChatSession } from '@/lib/types';

/**
 * Daily consultation limit. Only a hosted deployment (with Supabase) needs one,
 * to protect the Gemini key; the server enforces it there. Local runs are unlimited.
 */
const DAILY_LIMIT = process.env.NEXT_PUBLIC_SUPABASE_URL ? Number(process.env.NEXT_PUBLIC_AI_DAILY_LIMIT || 10) : Infinity;
const LIMITED = Number.isFinite(DAILY_LIMIT);

function Typewriter({ text, onDone, onTick }: { text: string; onDone: () => void; onTick: () => void }) {
  const [n, setN] = useState(0);
  const doneRef = useRef(onDone);
  const tickRef = useRef(onTick);
  doneRef.current = onDone;
  tickRef.current = onTick;
  useEffect(() => {
    const step = Math.max(2, Math.round(text.length / 160));
    const t = window.setInterval(() => {
      setN((v) => {
        const next = Math.min(text.length, v + step);
        if (next >= text.length) {
          window.clearInterval(t);
          window.setTimeout(() => doneRef.current(), 0);
        }
        return next;
      });
      tickRef.current();
    }, 16);
    return () => window.clearInterval(t);
  }, [text]);
  return <>{text.slice(0, n)}</>;
}

export function StylistView() {
  const [profile, setProfile] = useProfile();
  const [, setSaved] = useSavedOutfits();
  const addFavorites = useAddFavorites();
  const [catalog] = useCatalog();
  const [wardrobe] = useWardrobe();
  const [sessions, setSessions] = useChatSessions();
  const [quota, setQuota] = useChatQuota();
  const [handoff, setHandoff] = useHandoff();
  const { openProduct, go } = useApp();
  const hydrated = useHydrated();

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [mode, setMode] = useState<ChatMode>('ringkas');
  const [input, setInput] = useState('');
  const [attachImg, setAttachImg] = useState<{ url: string; hex: string } | null>(null);
  const [attachWardrobe, setAttachWardrobe] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [typingId, setTypingId] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const used = quota.date === todayKey() ? quota.used : 0;
  const left = Math.max(0, DAILY_LIMIT - used);
  const current = sessions.find((s) => s.id === currentId) ?? null;

  useEffect(() => {
    if (handoff && handoff.target === 'stylist') {
      setAttachWardrobe(handoff.wardrobeIds);
      setHandoff(null);
    }
  }, [handoff, setHandoff]);

  const scrollDown = (): void => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };
  useEffect(scrollDown, [current?.messages.length, thinking]);

  const send = (raw?: string): void => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;
    if (left <= 0) {
      emitToast('Kuota konsultasi hari ini habis. Kembali besok atau reset demo.', 'error');
      return;
    }
    const attachedItems = wardrobe.filter((w) => attachWardrobe.includes(w.id));
    const userMsg: ChatMessage = {
      id: uid('m'),
      role: 'user',
      text,
      imageUrl: attachImg?.url,
      wardrobeIds: attachWardrobe.length ? attachWardrobe : undefined,
      createdAt: new Date().toISOString(),
    };
    let sid = currentId;
    if (!sid) {
      const s: ChatSession = { id: uid('s'), title: text.slice(0, 48), mode, messages: [], updatedAt: userMsg.createdAt };
      sid = s.id;
      setSessions((prev) => [s, ...prev]);
      setCurrentId(s.id);
    }
    const target = sid;
    setSessions((prev) => prev.map((s) => (s.id === target ? { ...s, messages: [...s.messages, userMsg], mode, updatedAt: userMsg.createdAt } : s)));
    setQuota({ date: todayKey(), used: used + 1 });
    const imgHex = attachImg?.hex;
    setInput('');
    setAttachImg(null);
    setAttachWardrobe([]);
    setThinking(true);
    const history = (current?.messages ?? []).slice(-6).map((m) => ({ role: m.role, text: m.text }));
    const lightCatalog = catalog.map((p) => (p.imageUrl.startsWith('data:') ? { ...p, imageUrl: '' } : p));
    const lightWardrobe = wardrobe.map((w) => ({ ...w, imageUrl: w.imageUrl.startsWith('data:') ? '' : w.imageUrl }));
    const attachedIds = attachedItems.map((w) => w.id);
    const startedAt = Date.now();
    const finish = (reply: AgentReply): void => {
      const msg: ChatMessage = {
        id: uid('m'),
        role: 'stylist',
        text: reply.text,
        productIds: reply.productIds,
        outfits: reply.outfits.length ? reply.outfits : undefined,
        steps: reply.steps.length ? reply.steps : undefined,
        actions: reply.actions.length ? reply.actions : undefined,
        createdAt: new Date().toISOString(),
      };
      const wait = Math.max(0, 600 - (Date.now() - startedAt));
      window.setTimeout(() => {
        setSessions((prev) => prev.map((s) => (s.id === target ? { ...s, messages: [...s.messages, msg], updatedAt: msg.createdAt } : s)));
        setThinking(false);
        setTypingId(msg.id);
        applyActions(reply);
      }, wait);
    };
    authHeaders()
      .then((auth) =>
        fetch('/api/stylist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...auth },
          body: JSON.stringify({ text, mode, profile, catalog: lightCatalog, wardrobe: lightWardrobe, attachedWardrobeIds: attachedIds, attachedImageHex: imgHex, history }),
        }),
      )
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as AgentReply & { notice?: string };
        setOffline(false);
        setNotice(data.notice ?? null);
        finish(data);
      })
      .catch(() => {
        // Offline or server error: the same agent tools run in the browser.
        setOffline(true);
        finish(runLocalAgent({ text, mode, ctx: createContext(profile, catalog, wardrobe), attachedImageHex: imgHex, attachedWardrobeIds: attachedIds }));
      });
  };

  /** Apply the changes the agent made, then remember them on the message. */
  const applyActions = (reply: AgentReply): void => {
    let navigate: AgentOutfit | null = null;
    // Saved outfits are prepended, so save in reverse to keep the agent's order.
    for (const a of [...reply.actions].reverse()) {
      if (a.type === 'save_outfit') {
        const o = reply.outfits.find((x) => x.id === a.outfitId);
        if (o) saveOutfit(o, a.title);
      } else if (a.type === 'add_favorites') {
        addFavorites(a.productIds);
      } else if (a.type === 'update_measurements') {
        setProfile((p) => ({ ...p, measurements: { ...p.measurements, ...a.measurements } }));
      } else if (a.type === 'open_in_studio') {
        navigate = reply.outfits.find((x) => x.id === a.outfitId) ?? null;
      }
    }
    if (navigate) {
      const o = navigate;
      window.setTimeout(() => openInStudio(o), 1400);
    }
  };

  const saveOutfit = (o: AgentOutfit, title = o.title): void => {
    setSaved((prev) => [{ id: uid('o'), title, mode: o.mode, occasion: o.occasion, pieces: o.pieces, totalPrice: o.totalPrice, createdAt: new Date().toISOString() }, ...prev]);
  };

  const openInStudio = (o: AgentOutfit): void => {
    setHandoff({ target: 'studio', wardrobeIds: [], outfit: o, at: Date.now() });
    go('studio');
  };

  const manualSave = (messageId: string, o: AgentOutfit): void => {
    saveOutfit(o);
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === messageId ? { ...m, actions: [...(m.actions ?? []), { type: 'save_outfit' as const, outfitId: o.id, title: o.title }] } : m)),
      })),
    );
    emitToast('Outfit disimpan ke Outfit Tersimpan');
  };

  const exportTxt = (): void => {
    if (!current) return;
    const lines = [
      `Lookbook Outfitly: ${current.title}`,
      `Mode: ${current.mode === 'ringkas' ? 'Ringkas (Tautan)' : 'Konsultasi Lengkap'}`,
      `Tanggal: ${new Date(current.updatedAt).toLocaleString('id-ID')}`,
      '',
      ...current.messages.flatMap((m) => {
        const who = m.role === 'user' ? 'Anda' : 'Stylist Outfitly';
        const prods = (m.productIds ?? [])
          .map((id) => catalog.find((p) => p.id === id))
          .filter((p): p is NonNullable<typeof p> => !!p)
          .map((p) => `  . ${p.title} | ${p.sellerName} | ${formatIDR(p.price)} | ${p.externalLink ?? 'wa.me/' + p.sellerContact}`);
        return [`[${who}]`, m.text, ...prods, ''];
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lookbook-outfitly-${current.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    emitToast('Lookbook diunduh');
  };

  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [sessions]);
  const messages = hydrated ? current?.messages ?? [] : [];

  return (
    <div className="mx-auto flex h-[calc(100dvh-60px-68px)] max-w-4xl flex-col px-3 md:h-[calc(100dvh-72px)] md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-forest text-cream"><Compass className="size-4.5" strokeWidth={1.4} /></span>
          <div>
            <p className="font-serif text-lg leading-tight text-forest">Konsultasi Stylist</p>
            <p className="text-[11px] text-muted">{hydrated ? (LIMITED ? `${left} dari ${DAILY_LIMIT} konsultasi tersisa hari ini` : 'Stylist Agent siap membantu') : ' '}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn label="Riwayat" onClick={() => setHistoryOpen(true)}><History className="size-4" strokeWidth={1.5} /></IconBtn>
          <IconBtn label="Percakapan baru" onClick={() => { setCurrentId(null); setTypingId(null); }}><Plus className="size-4" strokeWidth={1.5} /></IconBtn>
          <IconBtn label="Ekspor Lookbook" onClick={exportTxt} disabled={!current}><Download className="size-4" strokeWidth={1.5} /></IconBtn>
          {LIMITED && <IconBtn label="Reset kuota demo" onClick={() => { setQuota({ date: todayKey(), used: 0 }); emitToast('Kuota demo direset', 'info'); }}><RotateCcw className="size-4" strokeWidth={1.5} /></IconBtn>}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 rounded-full bg-cream-3 p-1 text-[13px]">
        {([
          ['ringkas', 'Mode Ringkas (Tautan)'],
          ['lengkap', 'Konsultasi Lengkap'],
        ] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setMode(k)} className={`rounded-full py-1.5 transition ${mode === k ? 'bg-forest text-cream' : 'text-forest'}`}>{l}</button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto py-4">
        {messages.length === 0 && !thinking && (
          <div className="mx-auto max-w-lg py-8 text-center">
            <h2 className="font-serif text-[30px] leading-tight text-forest">Mau tampil <em>seperti apa</em> hari ini?</h2>
            <p className="mt-2 text-sm text-muted">
              Stylist Agent membaca undertone {profile.skinTone}, bentuk tubuh {profile.bodyShape.replace('_', ' ')}, ukuran cm, dan isi lemari Anda. Ia mencari di katalog, menghitung kelonggaran kain, menyusun outfit per acara, lalu bisa langsung menyimpannya atau membukanya di Studio.
            </p>
          </div>
        )}
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] md:max-w-[78%] ${m.role === 'user' ? 'rounded-[18px] rounded-br-md bg-forest px-4 py-2.5 text-cream' : ''}`}>
                {m.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageUrl} alt="Foto lampiran" className="mb-2 max-h-48 rounded-xl object-cover" />
                )}
                {m.wardrobeIds && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {m.wardrobeIds.map((id) => {
                      const w = wardrobe.find((x) => x.id === id);
                      return w ? <span key={id} className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">{w.name}</span> : null;
                    })}
                  </div>
                )}
                {m.role === 'stylist' ? (
                  <div className="rounded-[18px] rounded-bl-md border border-line bg-white/70 px-4 py-3">
                    <p className="mb-1 text-[12px] font-semibold text-sage-ink">Stylist Agent Outfitly</p>
                    {m.steps && <AgentTrace steps={m.steps} />}
                    <div className="whitespace-pre-line text-[14px] leading-relaxed text-ink/90">
                      {typingId === m.id ? <Typewriter text={m.text} onTick={scrollDown} onDone={() => setTypingId(null)} /> : m.text}
                    </div>
                    {typingId !== m.id && m.outfits && m.outfits.length > 0 && (
                      <div className={`mt-3 grid animate-fade-up gap-2 ${m.outfits.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                        {m.outfits.map((o) => (
                          <OutfitCard
                            key={o.id}
                            outfit={o}
                            saved={(m.actions ?? []).some((a) => a.type === 'save_outfit' && a.outfitId === o.id)}
                            onSave={() => manualSave(m.id, o)}
                            onOpenStudio={() => openInStudio(o)}
                            onOpenProduct={openProduct}
                          />
                        ))}
                      </div>
                    )}
                    {typingId !== m.id && m.actions && <ActionChips actions={m.actions} outfits={m.outfits ?? []} />}
                    {typingId !== m.id && !m.outfits?.length && m.productIds && m.productIds.length > 0 && (
                      <div className="mt-3 grid animate-fade-up grid-cols-1 gap-2 sm:grid-cols-3">
                        {m.productIds.map((id) => {
                          const p = catalog.find((x) => x.id === id);
                          if (!p) return null;
                          return (
                            <button key={id} type="button" onClick={() => openProduct(id)} className="flex items-center gap-2.5 rounded-xl border border-line bg-cream p-2 text-left transition hover:border-forest/50 sm:flex-col sm:items-stretch">
                              <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-cream-2 sm:aspect-[4/3] sm:size-auto sm:w-full">
                                <ProductImage src={p.imageUrl} colors={p.colorHex} alt={p.title} />
                              </div>
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-[12.5px] font-medium text-forest">{p.title}</p>
                                <p className="text-[11px] text-muted">{p.sellerName} . {formatIDR(p.price)}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-[14px]">{m.text}</p>
                )}
              </div>
            </div>
          ))}
          {offline && !thinking && (
            <p role="status" className="rounded-xl border border-line bg-cream-2 px-3 py-2 text-[12.5px] text-muted">
              Server stylist tidak terhubung. Agen menjalankan tools yang sama langsung di browser.
              <button type="button" onClick={() => setOffline(false)} className="ml-2 font-medium text-forest underline underline-offset-2">Tutup</button>
            </p>
          )}
          {notice && !thinking && (
            <p role="status" className="rounded-xl border border-line bg-cream-2 px-3 py-2 text-[12.5px] text-muted">
              {notice}
              <button type="button" onClick={() => setNotice(null)} className="ml-2 font-medium text-forest underline underline-offset-2">Tutup</button>
            </p>
          )}
          {thinking && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="size-4 animate-spin text-forest" /> Stylist sedang mencari produk, menghitung ukuran, dan menyusun outfit...
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="pb-3">
        {messages.length === 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="shrink-0 rounded-full border border-line-2 bg-white/60 px-3 py-1.5 text-[12.5px] text-forest hover:border-forest/40">{s}</button>
            ))}
          </div>
        )}
        {(attachImg || attachWardrobe.length > 0) && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {attachImg && (
              <span className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-2 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachImg.url} alt="" className="size-7 rounded-full object-cover" />
                Foto . <span className="size-3 rounded-full" style={{ background: attachImg.hex }} />
                <button type="button" onClick={() => setAttachImg(null)} aria-label="Hapus foto"><X className="size-3.5" /></button>
              </span>
            )}
            {attachWardrobe.map((id) => {
              const w = wardrobe.find((x) => x.id === id);
              if (!w) return null;
              return (
                <span key={id} className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs">
                  <Shirt className="size-3" /> {w.name}
                  <button type="button" onClick={() => setAttachWardrobe((a) => a.filter((x) => x !== id))} aria-label={`Lepas ${w.name}`}><X className="size-3.5" /></button>
                </span>
              );
            })}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="relative flex items-end gap-1.5 rounded-[22px] border border-line-2 bg-white p-1.5 shadow-[0_10px_30px_-20px_rgba(22,45,36,0.5)]"
        >
          <button type="button" onClick={() => fileRef.current?.click()} className="grid size-11 shrink-0 place-items-center rounded-full text-forest hover:bg-cream-2" aria-label="Lampirkan foto pakaian">
            <ImagePlus className="size-4.5" strokeWidth={1.5} />
          </button>
          <div className="relative">
            <button type="button" onClick={() => setPicker(!picker)} className={`grid size-11 shrink-0 place-items-center rounded-full text-forest hover:bg-cream-2 ${picker ? 'bg-cream-2' : ''}`} aria-label="Masukkan baju dari lemari" aria-expanded={picker}>
              <Shirt className="size-4.5" strokeWidth={1.5} />
            </button>
            {picker && (
              <div className="absolute bottom-12 left-0 z-30 w-64 overflow-hidden rounded-2xl border border-line bg-cream shadow-xl">
                <p className="border-b border-line px-3 py-2 text-xs font-semibold text-forest">Dari Lemari Saya</p>
                <ul className="max-h-64 overflow-y-auto p-1">
                  {wardrobe.map((w) => {
                    const on = attachWardrobe.includes(w.id);
                    return (
                      <li key={w.id}>
                        <button type="button" onClick={() => setAttachWardrobe((a) => (on ? a.filter((x) => x !== w.id) : [...a, w.id]))} className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm ${on ? 'bg-sage-soft' : 'hover:bg-cream-2'}`}>
                          <span className="size-9 shrink-0 overflow-hidden rounded-lg bg-cream-2"><ProductImage src={w.imageUrl} colors={[w.colorHex]} alt={w.name} /></span>
                          <span className="min-w-0 flex-1 truncate">{w.name}</span>
                          {on && <span className="text-[10px] font-semibold text-forest">Dipilih</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button type="button" onClick={() => setPicker(false)} className="w-full border-t border-line py-2 text-xs font-medium text-forest">Selesai</button>
              </div>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={left > 0 ? 'Tanyakan padu padan, ukuran, atau warna...' : 'Kuota hari ini habis'}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-[14px] "
          />
          <button type="submit" disabled={!input.trim() || thinking || left <= 0} className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-cream transition disabled:bg-[#8C968F]" aria-label="Kirim">
            {thinking ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const url = await compressImage(f, 420);
                const info = await extractGarmentInfo(url, f.name);
                setAttachImg({ url, hex: info.hex });
              } catch {
                emitToast('Foto tidak dapat dibaca', 'error');
              }
              e.target.value = '';
            }}
          />
        </form>
      </div>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} variant="drawer-left" title="Riwayat Percakapan"
        footer={
          <button type="button" onClick={() => { setCurrentId(null); setHistoryOpen(false); }} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-medium text-cream">
            <Plus className="size-4" /> Percakapan Baru
          </button>
        }>
        <ul className="p-3">
          {sortedSessions.length === 0 && <li className="p-4 text-sm text-muted">Belum ada riwayat.</li>}
          {sortedSessions.map((s) => (
            <li key={s.id} className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 ${s.id === currentId ? 'bg-sage-soft' : 'hover:bg-cream-2'}`}>
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => { setCurrentId(s.id); setMode(s.mode); setTypingId(null); setHistoryOpen(false); }}>
                <p className="truncate text-sm text-forest">{s.title}</p>
                <p className="text-[11px] text-muted">{s.messages.length} pesan . {s.mode === 'ringkas' ? 'Ringkas' : 'Lengkap'} . {new Date(s.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
              </button>
              <button type="button" onClick={() => { setSessions((prev) => prev.filter((x) => x.id !== s.id)); if (s.id === currentId) setCurrentId(null); }} className="grid size-8 place-items-center rounded-full text-muted hover:text-[#8A2F3B]" aria-label="Hapus percakapan">
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className="grid size-11 place-items-center rounded-full border border-line text-forest transition hover:bg-cream-2 active:bg-cream-3 disabled:border-line disabled:text-line-2">
      {children}
    </button>
  );
}
