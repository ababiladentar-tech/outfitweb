'use client';

import { authHeaders } from '@/lib/cloud/client';
import { useRef, useState } from 'react';
import { Check, Compass, ImagePlus, Layers, Loader2, Plus, Shirt, Trash2, X } from 'lucide-react';
import { useApp } from './AppContext';
import { ProductImage } from './GarmentArt';
import { Chip, Modal, btnGhost, btnPrimary, inputCls, labelCls } from './ui';
import { STYLE_LABEL, WARDROBE_CATEGORY_LABEL, WARDROBE_PRESETS } from '@/lib/data';
import { compressImage, extractGarmentInfo, nearestColorName, undertoneHarmony } from '@/lib/color';
import { useHandoff, useProfile, useWardrobe } from '@/lib/hooks';
import { emitToast, uid, useHydrated } from '@/lib/storage';
import type { WardrobeCategory, WardrobeItem } from '@/lib/types';

const CATS = Object.keys(WARDROBE_CATEGORY_LABEL) as WardrobeCategory[];

export function WardrobeView() {
  const [items, setItems] = useWardrobe();
  const [profile] = useProfile();
  const [, setHandoff] = useHandoff();
  const { go } = useApp();
  const hydrated = useHydrated();
  const [cat, setCat] = useState<WardrobeCategory | 'all'>('all');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const list = hydrated ? items.filter((i) => cat === 'all' || i.category === cat) : [];
  const counts = CATS.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c]: items.filter((i) => i.category === c).length }), {});

  const toggle = (id: string): void => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const handoff = (target: 'studio' | 'stylist'): void => {
    setHandoff({ target, wardrobeIds: selected, at: Date.now() });
    emitToast(`${selected.length} item dibawa ke ${target === 'studio' ? 'Studio Padu Padan' : 'Konsultasi Stylist'}`, 'info');
    setSelected([]);
    setSelecting(false);
    go(target);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 md:px-8 md:pt-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-[34px] leading-tight text-forest md:text-[46px]">Lemari <em>Saya</em></h1>
          <p className="mt-1 text-sm text-muted">{hydrated ? items.length : 0} item. Pakai ulang yang sudah ada sebelum membeli yang baru.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={btnGhost}
            onClick={() => {
              setSelecting(!selecting);
              setSelected([]);
            }}
          >
            {selecting ? <X className="size-4" /> : <Check className="size-4" />}
            {selecting ? 'Batal pilih' : 'Pilih beberapa'}
          </button>
          <button type="button" className={btnPrimary} onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Tambah Koleksi
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>Semua</Chip>
        {CATS.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {WARDROBE_CATEGORY_LABEL[c]} <span className="opacity-60">{hydrated ? counts[c] : 0}</span>
          </Chip>
        ))}
      </div>

      {hydrated && list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-2 p-10 text-center">
          <Shirt className="mx-auto size-8 text-sage-ink" strokeWidth={1.2} />
          <p className="mt-3 font-serif text-2xl text-forest">Kategori ini masih kosong</p>
          <p className="mt-1 text-sm text-muted">Foto pakaian di atas lantai atau gantungan dengan latar polos.</p>
          <button type="button" onClick={() => setAdding(true)} className={`${btnPrimary} mt-4`}><Plus className="size-4" /> Tambah</button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((item) => {
            const on = selected.includes(item.id);
            return (
              <div key={item.id} className="group relative">
                <button
                  type="button"
                  onClick={() => (selecting ? toggle(item.id) : undefined)}
                  className={`relative block aspect-[4/5] w-full overflow-hidden rounded-[14px] border-2 bg-cream-2 transition ${on ? 'border-forest' : 'border-transparent'} ${selecting ? 'cursor-pointer' : 'cursor-default'}`}
                  aria-pressed={selecting ? on : undefined}
                  aria-label={item.name}
                >
                  <ProductImage src={item.imageUrl} colors={[item.colorHex]} alt={item.name} />
                  {selecting && (
                    <span className={`absolute left-2 top-2 grid size-6 place-items-center rounded-md border ${on ? 'border-forest bg-forest text-cream' : 'border-line-2 bg-cream/90'}`}>
                      {on && <Check className="size-3.5" strokeWidth={2.4} />}
                    </span>
                  )}
                </button>
                {!selecting && (
                  <button
                    type="button"
                    onClick={() => {
                      setItems((prev) => prev.filter((x) => x.id !== item.id));
                      emitToast('Item dihapus dari lemari', 'info');
                    }}
                    className="absolute right-1 top-1 grid size-11 place-items-center rounded-full text-forest opacity-100 transition focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    aria-label={`Hapus ${item.name}`}
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-cream/90 hover:bg-white"><Trash2 className="size-3.5" strokeWidth={1.6} aria-hidden /></span>
                  </button>
                )}
                <div className="mt-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-[15px] text-forest">{item.name}</p>
                    <p className="text-[11px] text-muted">{WARDROBE_CATEGORY_LABEL[item.category]}{item.sizeLabel ? ` . ${item.sizeLabel}` : ''}</p>
                  </div>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-muted" title="Harmoni dengan undertone Anda">
                    <span className="size-3 rounded-full border border-line" style={{ background: item.colorHex }} />
                    {undertoneHarmony(item.colorHex, profile.skinTone)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selecting && (
        <div className="fixed inset-x-3 bottom-[84px] z-40 mx-auto flex max-w-xl animate-fade-up items-center gap-2 rounded-full border border-forest/10 bg-forest p-1.5 pl-5 text-cream shadow-2xl md:bottom-6">
          <span className="flex-1 text-sm">{selected.length} dipilih</span>
          <button type="button" disabled={!selected.length} onClick={() => handoff('stylist')} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium hover:bg-white/10 disabled:opacity-40">
            <Compass className="size-4" strokeWidth={1.5} /> <span className="hidden sm:inline">Chat</span> Stylist
          </button>
          <button type="button" disabled={!selected.length} onClick={() => handoff('studio')} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-semibold text-forest disabled:opacity-40">
            <Layers className="size-4" strokeWidth={1.5} /> Ke Studio
          </button>
        </div>
      )}

      <AddItemModal open={adding} onClose={() => setAdding(false)} onSave={(w) => setItems((prev) => [w, ...prev])} />
    </div>
  );
}

function AddItemModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (w: WardrobeItem) => void }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Tambah ke Lemari Saya">
      {open && <AddBody onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}

const EMPTY_DRAFT: Omit<WardrobeItem, 'id'> = { name: '', category: 'tops', imageUrl: '', color: '', colorHex: '#8B8C88', style: 'casual', sizeLabel: '' };

function AddBody({ onClose, onSave }: { onClose: () => void; onSave: (w: WardrobeItem) => void }) {
  const [mode, setMode] = useState<'upload' | 'preset'>('upload');
  const [draft, setDraft] = useState<Omit<WardrobeItem, 'id'>>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState<'photo' | 'pixels' | null>(null);
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File): Promise<void> => {
    setBusy(true);
    setNote('');
    try {
      const data = await compressImage(file);
      const info = await extractGarmentInfo(data, file.name);
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      setDraft((d) => ({
        ...d,
        imageUrl: data,
        colorHex: info.hex,
        color: info.name,
        category: info.category,
        name: d.name || (base.length > 2 && base.length < 40 ? base : `${WARDROBE_CATEGORY_LABEL[info.category]} ${info.name}`),
      }));
      setSource('pixels');
      try {
        const res = await fetch('/api/analyze-clothing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
          body: JSON.stringify({ image: data }),
        });
        const r = (await res.json()) as {
          available: boolean;
          reason?: string;
          name?: string | null;
          category?: WardrobeCategory | null;
          colorName?: string | null;
          colorHex?: string | null;
          style?: string | null;
        };
        if (r.available) {
          setDraft((d) => ({
            ...d,
            name: r.name ?? d.name,
            category: r.category ?? d.category,
            color: r.colorName ?? d.color,
            colorHex: r.colorHex ?? d.colorHex,
            style: r.style ?? d.style,
          }));
          setSource('photo');
        } else if (r.reason) setNote(r.reason);
      } catch {
        setNote('Pengenal foto tidak terhubung. Warna dibaca dari piksel foto.');
      }
    } catch {
      emitToast('Foto tidak dapat dibaca. Coba format JPG atau PNG.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const save = (): void => {
    if (!draft.imageUrl || !draft.name.trim()) return;
    onSave({ ...draft, id: uid('w'), name: draft.name.trim() });
    emitToast('Ditambahkan ke Lemari Saya');
    onClose();
  };

  return (
    <div className="p-5 md:p-6">
      <div className="grid grid-cols-2 rounded-full bg-cream-3 p-1 text-sm">
        {(['upload', 'preset'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-full py-2 transition ${mode === m ? 'bg-forest text-cream' : 'text-forest'}`}>
            {m === 'upload' ? 'Upload foto' : 'Foto sampel'}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr]">
        <div>
          {mode === 'upload' ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative grid aspect-[4/5] w-full place-items-center overflow-hidden rounded-2xl border border-dashed border-line-2 bg-cream-2 text-center"
            >
              {draft.imageUrl ? (
                <ProductImage src={draft.imageUrl} colors={[draft.colorHex]} alt="Pratinjau" />
              ) : busy ? (
                <Loader2 className="size-6 animate-spin text-forest" />
              ) : (
                <span className="px-4 text-sm text-muted">
                  <ImagePlus className="mx-auto mb-2 size-7 text-sage-ink" strokeWidth={1.2} />
                  Pilih foto pakaian
                </span>
              )}
              {busy && draft.imageUrl && <span className="absolute inset-0 grid place-items-center bg-cream/60"><Loader2 className="size-6 animate-spin" /></span>}
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {WARDROBE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setDraft({ ...p });
                    setSource(null);
                    setNote('');
                  }}
                  className={`aspect-square overflow-hidden rounded-xl border-2 ${draft.imageUrl === p.imageUrl ? 'border-forest' : 'border-transparent'}`}
                  aria-label={p.name}
                >
                  <ProductImage src={p.imageUrl} alt={p.name} />
                </button>
              ))}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.target.value = '';
            }}
          />
        </div>

        <div className="space-y-3">
          {draft.imageUrl && source && (
            <div className="flex items-center gap-3 rounded-xl bg-sage-soft px-3 py-2.5 text-[12.5px] text-forest">
              <span className="size-6 rounded-full border border-white" style={{ background: draft.colorHex }} />
              <span>
                {source === 'photo' ? 'Dikenali dari foto' : 'Dibaca dari warna piksel dan bentuk foto'}: <b>{draft.color}</b> ({draft.colorHex}), kategori <b>{WARDROBE_CATEGORY_LABEL[draft.category]}</b>. Sesuaikan bila perlu.
                {note && <span className="mt-1 block text-[11.5px] text-muted">{note}</span>}
              </span>
            </div>
          )}
          <div>
            <label className={labelCls}>Nama</label>
            <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Kemeja Linen Putih" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kategori</label>
              <select className={inputCls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as WardrobeCategory })}>
                {CATS.map((c) => (
                  <option key={c} value={c}>{WARDROBE_CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Gaya</label>
              <select className={inputCls} value={draft.style} onChange={(e) => setDraft({ ...draft, style: e.target.value })}>
                {Object.entries(STYLE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Warna</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={draft.colorHex.length === 7 ? draft.colorHex : '#8B8C88'}
                  onChange={(e) => setDraft({ ...draft, colorHex: e.target.value.toUpperCase(), color: nearestColorName(e.target.value) })}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line-2 bg-white p-1"
                  aria-label="Pilih warna"
                />
                <input className={inputCls} value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Ukuran (opsional)</label>
              <input className={inputCls} value={draft.sizeLabel ?? ''} onChange={(e) => setDraft({ ...draft, sizeLabel: e.target.value })} placeholder="M / 28 / 38" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" className={`${btnGhost} flex-1`} onClick={onClose}>Batal</button>
            <button type="button" className={`${btnPrimary} flex-1`} disabled={!draft.imageUrl || !draft.name.trim() || busy} onClick={save}>Simpan ke Lemari</button>
          </div>
        </div>
      </div>
    </div>
  );
}
