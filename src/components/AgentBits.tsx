'use client';

import { useState } from 'react';
import { BookmarkCheck, Check, ChevronDown, Heart, LayoutGrid, Ruler, Save, Scale, Search, Shirt, Sparkles, SquarePen } from 'lucide-react';
import { ProductImage } from './GarmentArt';
import { OCCASION_LABEL } from '@/lib/outfit';
import { formatIDR } from '@/lib/format';
import type { AgentAction, AgentOutfit, AgentStep, AgentToolName } from '@/lib/types';

const ICON: Record<AgentToolName, React.ReactNode> = {
  search_products: <Search className="size-3.5" strokeWidth={1.6} aria-hidden />,
  check_fit: <Ruler className="size-3.5" strokeWidth={1.6} aria-hidden />,
  compare_products: <Scale className="size-3.5" strokeWidth={1.6} aria-hidden />,
  view_wardrobe: <Shirt className="size-3.5" strokeWidth={1.6} aria-hidden />,
  build_outfit: <LayoutGrid className="size-3.5" strokeWidth={1.6} aria-hidden />,
  save_outfit: <Save className="size-3.5" strokeWidth={1.6} aria-hidden />,
  open_in_studio: <SquarePen className="size-3.5" strokeWidth={1.6} aria-hidden />,
  add_favorites: <Heart className="size-3.5" strokeWidth={1.6} aria-hidden />,
  update_measurements: <Ruler className="size-3.5" strokeWidth={1.6} aria-hidden />,
};

/** The agent's tool calls, so the user sees what it actually did. */
export function AgentTrace({ steps, live = false }: { steps: AgentStep[]; live?: boolean }) {
  const [open, setOpen] = useState(live);
  if (!steps.length) return null;
  return (
    <div className="mb-2 rounded-xl border border-line bg-cream-2/60">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-forest">
        <Sparkles className="size-3.5 text-sage-ink" strokeWidth={1.6} aria-hidden />
        {steps.length} langkah dikerjakan stylist
        <ChevronDown className={`ml-auto size-3.5 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <ol className="space-y-1.5 border-t border-line px-3 py-2.5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-snug">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white text-forest">{ICON[s.tool]}</span>
              <span className="min-w-0">
                <span className="font-medium text-forest">{s.label}</span>
                <span className="block text-muted">{s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function actionLabel(a: AgentAction, outfits: AgentOutfit[]): string {
  switch (a.type) {
    case 'save_outfit':
      return `Disimpan: ${a.title}`;
    case 'open_in_studio':
      return `Dibuka di Studio: ${outfits.find((o) => o.id === a.outfitId)?.title ?? 'outfit'}`;
    case 'add_favorites':
      return `${a.productIds.length} produk ditambahkan ke favorit`;
    case 'update_measurements': {
      const names: Record<string, string> = { chestCm: 'LD', waistCm: 'LP', shoulderCm: 'Bahu', heightCm: 'Tinggi', weightKg: 'Berat', footCm: 'Kaki' };
      return `Ukuran diperbarui: ${Object.entries(a.measurements).map(([k, v]) => `${names[k]} ${v}`).join(', ')}`;
    }
  }
}

export function ActionChips({ actions, outfits }: { actions: AgentAction[]; outfits: AgentOutfit[] }) {
  if (!actions.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Aksi yang dijalankan">
      {actions.map((a, i) => (
        <li key={i} className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2.5 py-1 text-[11.5px] text-forest">
          <Check className="size-3" aria-hidden /> {actionLabel(a, outfits)}
        </li>
      ))}
    </ul>
  );
}

export function OutfitCard({
  outfit,
  saved,
  onSave,
  onOpenStudio,
  onOpenProduct,
}: {
  outfit: AgentOutfit;
  saved: boolean;
  onSave: () => void;
  onOpenStudio: () => void;
  onOpenProduct: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-serif text-[15px] text-forest">{outfit.title}</p>
        <p className="shrink-0 text-[12px] tabular-nums text-muted">{formatIDR(outfit.totalPrice)}</p>
      </div>
      <p className="text-[11px] text-muted">
        {OCCASION_LABEL[outfit.occasion]} . {outfit.weather} . {outfit.mode === 'wardrobe' ? 'Lemari saja' : outfit.mode === 'umkm' ? 'Belanja UMKM' : 'Lemari + UMKM'}
      </p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {outfit.pieces.map((p) => (
          <button
            key={p.refId}
            type="button"
            onClick={() => p.source === 'umkm' && onOpenProduct(p.refId)}
            className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-2"
            title={`${p.name}${p.source === 'umkm' ? `, ${formatIDR(p.price)}` : ', dari lemari'}`}
            aria-label={p.name}
          >
            <ProductImage src={p.imageUrl} colors={[p.colorHex]} alt={p.name} />
            <span className={`absolute inset-x-0 bottom-0 py-0.5 text-center text-[9px] font-semibold ${p.source === 'wardrobe' ? 'bg-forest/85 text-cream' : 'bg-coral/90 text-forest'}`}>
              {p.source === 'wardrobe' ? 'Lemari' : p.fit ? `${p.fit.score}%` : 'UMKM'}
            </span>
          </button>
        ))}
      </div>
      {outfit.fitWarnings.length > 0 && <p className="mt-2 rounded-lg bg-[#F7E1E3] px-2 py-1 text-[11.5px] text-[#8A2F3B]">Cek ukuran: {outfit.fitWarnings.join(', ')}</p>}
      <div className="mt-2.5 flex gap-1.5">
        <button type="button" onClick={onOpenStudio} className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-line-2 bg-white text-[12px] font-medium text-forest hover:border-forest/50">
          <SquarePen className="size-3.5" aria-hidden /> Edit di Studio
        </button>
        <button type="button" onClick={onSave} disabled={saved} className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-forest text-[12px] font-medium text-cream disabled:bg-sage-soft disabled:text-forest">
          {saved ? <BookmarkCheck className="size-3.5" aria-hidden /> : <Save className="size-3.5" aria-hidden />} {saved ? 'Tersimpan' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}
