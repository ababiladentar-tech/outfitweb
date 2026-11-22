'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookmarkCheck,
  ChevronRight,
  Columns2,
  Flag,
  Heart,
  MessageCircle,
  Ruler,
  Share2,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { useApp } from './AppContext';
import { ProductImage } from './GarmentArt';
import { SellerBadge } from './ProductCard';
import { Modal, btnGhost, btnPrimary } from './ui';
import { CATEGORY_LABEL, CONDITION_LABEL } from '@/lib/data';
import { useBookmarks, useCatalog, useComments, useLikeProduct, useProfile, useTrack } from '@/lib/hooks';
import { evaluateFit, bestSize, FIT_LABEL, fitTone } from '@/lib/sizing';
import { emitToast, formatIDR, useHydrated } from '@/lib/storage';
import type { GarmentMeasurement, UMKMProductPost } from '@/lib/types';

export function marketplaceName(url?: string): string {
  if (!url) return 'Toko';
  if (/shopee/i.test(url)) return 'Shopee';
  if (/tokopedia/i.test(url)) return 'Tokopedia';
  return 'Toko Resmi';
}

export function waLink(p: UMKMProductPost, size?: string): string {
  const msg = `Halo ${p.sellerName}, saya melihat "${p.title}" di Outfitly${size ? ` (ukuran ${size})` : ''}. Apakah masih tersedia? Terima kasih.`;
  return `https://wa.me/${p.sellerContact}?text=${encodeURIComponent(msg)}`;
}

export function specRows(p: UMKMProductPost, s: GarmentMeasurement): { label: string; value: string }[] {
  const rows: { label: string; value?: number; unit?: string }[] = [
    { label: 'Lingkar Dada (LD)', value: s.chestBustCm },
    { label: 'Lingkar Pinggang (LP)', value: s.waistCm },
    { label: 'Lingkar Pinggul', value: s.hipsCm },
    { label: 'Lebar Bahu', value: s.shoulderWidthCm },
    { label: 'Panjang', value: s.garmentLengthCm },
    { label: 'Panjang Insole', value: s.insoleCm },
    { label: 'Panjang Tas', value: s.bagLengthCm },
    { label: 'Lebar Tas', value: s.bagWidthCm },
    { label: 'Tinggi Tas', value: s.bagHeightCm },
  ];
  void p;
  return rows
    .filter((r) => r.value !== undefined)
    .map((r) => ({ label: r.label, value: `${String(r.value).replace('.', ',')} cm` }));
}

export function ProductDetailModal({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  const [catalog] = useCatalog();
  const product = catalog.find((p) => p.id === productId) ?? null;
  return (
    <Modal open={!!product} onClose={onClose} size="xl" title={product ? <span className="text-base md:text-lg">Detail Produk</span> : null}
      footer={product ? <BuyBar product={product} /> : undefined}>
      {product && <DetailBody key={product.id} product={product} />}
    </Modal>
  );
}

function useSelectedSize(product: UMKMProductPost) {
  const [profile] = useProfile();
  const best = bestSize(product, profile.measurements);
  return { best, profile };
}

function BuyBar({ product }: { product: UMKMProductPost }) {
  const track = useTrack();
  const { best } = useSelectedSize(product);
  const soldOut = !product.isAvailable || product.stockCount <= 0;
  return (
    <div className="flex items-center gap-2">
      <div className="hidden min-w-0 flex-1 sm:block">
        <p className="truncate text-xs text-muted">{product.sellerName}</p>
        <p className="text-base font-semibold text-forest">{formatIDR(product.price)}</p>
      </div>
      <a
        href={soldOut ? undefined : waLink(product, best.size.sizeLabel)}
        target="_blank"
        rel="noreferrer"
        aria-disabled={soldOut}
        onClick={(e) => {
          if (soldOut) {
            e.preventDefault();
            return;
          }
          track(product.sellerId, 'waChats');
        }}
        className={`${btnGhost} flex-1 sm:flex-none ${soldOut ? 'pointer-events-none opacity-40' : ''}`}
      >
        <MessageCircle className="size-4" strokeWidth={1.6} /> Chat WhatsApp
      </a>
      <a
        href={soldOut ? undefined : product.externalLink}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => {
          if (soldOut || !product.externalLink) {
            e.preventDefault();
            if (!soldOut) emitToast('Penjual belum menautkan toko luar. Gunakan Chat WhatsApp.', 'info');
            return;
          }
          track(product.sellerId, 'linkClicks');
        }}
        className={`${btnPrimary} flex-1 sm:flex-none ${soldOut ? 'pointer-events-none opacity-40' : ''}`}
      >
        <ShoppingBag className="size-4" strokeWidth={1.6} />
        {soldOut ? 'Stok Habis' : `Beli di ${marketplaceName(product.externalLink)}`}
      </a>
    </div>
  );
}

function DetailBody({ product }: { product: UMKMProductPost }) {
  const { openStore, openComments, openReport, openCompare, openMeasurements } = useApp();
  const like = useLikeProduct();
  const bookmarks = useBookmarks();
  const track = useTrack();
  const [comments] = useComments();
  const hydrated = useHydrated();
  const { best, profile } = useSelectedSize(product);
  const [sizeLabel, setSizeLabel] = useState(best.size.sizeLabel);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    track(product.sellerId, 'impressions');
  }, [product.id, product.sellerId, track]);

  const size = product.availableSizes.find((s) => s.sizeLabel === sizeLabel) ?? product.availableSizes[0];
  const fit = useMemo(() => evaluateFit(product, size, profile.measurements), [product, size, profile.measurements]);
  const showFit = product.category !== 'bag' && product.category !== 'hijab';
  const commentCount = comments.filter((c) => c.productId === product.id).length;
  const saved = hydrated && bookmarks.has(product.id);
  const liked = hydrated && like.has(product.id);

  const frames = [
    { label: 'Foto utama', cls: '' },
    { label: 'Detail', cls: 'scale-[1.8] origin-[50%_40%]' },
    { label: 'Ukuran cm', cls: '' },
  ];

  const share = async (): Promise<void> => {
    const url = `${window.location.origin}/?produk=${product.id}`;
    try {
      await navigator.clipboard.writeText(url);
      emitToast('Tautan produk disalin');
    } catch {
      emitToast('Tidak dapat menyalin tautan', 'error');
    }
  };

  return (
    <div className="grid gap-6 p-5 md:grid-cols-[1.05fr_1fr] md:gap-8 md:p-7">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream-2">
          <div className={`h-full w-full transition-transform duration-500 ${frames[frame].cls}`}>
            <ProductImage src={product.imageUrl} colors={product.colorHex} alt={product.title} />
          </div>
          {frame === 2 && size && <FlatLayOverlay size={size} />}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            <SellerBadge type={product.sellerType} />
            {product.isOneOfAKind && (
              <span className="rounded-full bg-forest px-2.5 py-1 text-[11px] font-semibold text-cream">Kurasi Tunggal (1 Pcs)</span>
            )}
          </div>
        </div>
        {product.imageUrl.startsWith('https://images.unsplash.com') && (
          <p className="mt-2 text-[12px] text-muted">Foto ilustrasi dari Unsplash, menunjukkan model serupa.</p>
        )}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {frames.map((f, i) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFrame(i)}
              className={`overflow-hidden rounded-xl border text-left transition ${frame === i ? 'border-forest' : 'border-line'}`}
            >
              <div className="aspect-square overflow-hidden bg-cream-2">
                <div className={`h-full w-full ${f.cls}`}>
                  <ProductImage src={product.imageUrl} colors={product.colorHex} alt={f.label} />
                </div>
              </div>
              <p className="px-2 py-1 text-[11px] text-muted">{f.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <button type="button" onClick={() => openStore(product.sellerId)} className="group inline-flex min-h-11 items-center gap-1.5 text-xs text-muted hover:text-forest">
          <Store className="size-3.5" strokeWidth={1.6} /> {product.sellerName} . {product.sellerCity}
          <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </button>
        <h2 className="mt-2 font-serif text-[26px] leading-tight text-forest md:text-[32px]">{product.title}</h2>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-semibold">{formatIDR(product.price)}</span>
          {product.originalPrice && <span className="text-sm text-muted line-through">{formatIDR(product.originalPrice)}</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full border border-line px-2.5 py-1">{CATEGORY_LABEL[product.category]}</span>
          <span className="rounded-full border border-line px-2.5 py-1">Kondisi: {CONDITION_LABEL[product.condition]}</span>
          {product.material && <span className="rounded-full border border-line px-2.5 py-1">{product.material}</span>}
          <span className="rounded-full border border-line px-2.5 py-1">
            {product.stockCount > 0 ? `Stok ${product.stockCount}` : 'Habis'}
          </span>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-ink/80">{product.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <IconAction onClick={() => like.toggle(product.id)} active={liked} label={`${product.likes}`}>
            <Heart className={`size-4 ${liked ? 'fill-coral-ink text-coral-ink' : ''}`} strokeWidth={1.6} />
          </IconAction>
          <IconAction
            onClick={() => {
              const added = bookmarks.toggle(product.id);
              if (added) track(product.sellerId, 'bookmarks');
              emitToast(added ? 'Disimpan ke koleksi' : 'Dihapus dari koleksi', 'info');
            }}
            active={saved}
            label={saved ? 'Tersimpan' : 'Simpan'}
          >
            <BookmarkCheck className="size-4" strokeWidth={1.6} />
          </IconAction>
          <IconAction onClick={() => openComments(product.id)} label={`Komentar ${commentCount}`}>
            <MessageCircle className="size-4" strokeWidth={1.6} />
          </IconAction>
          <IconAction onClick={share} label="Bagikan">
            <Share2 className="size-4" strokeWidth={1.6} />
          </IconAction>
          <IconAction onClick={() => openReport(product.id)} label="Laporkan">
            <Flag className="size-4" strokeWidth={1.6} />
          </IconAction>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-forest">Panduan Ukuran (cm)</p>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => openMeasurements()} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 text-[12px] text-forest hover:bg-cream-2">
                <Ruler className="size-3" /> Ukuran saya
              </button>
              <button type="button" onClick={() => openCompare(product.id)} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 text-[12px] text-forest hover:bg-cream-2">
                <Columns2 className="size-3" /> Bandingkan
              </button>
            </div>
          </div>
          {product.availableSizes.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.availableSizes.map((s) => {
                const f = evaluateFit(product, s, profile.measurements);
                return (
                  <button
                    key={s.sizeLabel}
                    type="button"
                    onClick={() => setSizeLabel(s.sizeLabel)}
                    className={`min-h-11 min-w-12 rounded-lg border px-3 text-sm transition hover:border-forest/50 ${
                      s.sizeLabel === size.sizeLabel ? 'border-forest bg-forest text-cream' : 'border-line-2 bg-white'
                    }`}
                  >
                    {s.sizeLabel}
                    {showFit && hydrated && <span className="ml-1 text-[10px] opacity-70">{f.score}%</span>}
                  </button>
                );
              })}
            </div>
          )}
          <table className="mt-3 w-full text-sm">
            <tbody>
              {specRows(product, size).map((r) => (
                <tr key={r.label} className="border-b border-line last:border-0">
                  <td className="py-2 text-muted">{r.label}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-ink">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {showFit && hydrated && (
            <div className="mt-3 rounded-xl bg-cream-2 p-3">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${fitTone(fit.status)}`}>
                  {FIT_LABEL[fit.status]} untuk tubuh Anda
                </span>
                <span className="text-sm font-semibold tabular-nums text-forest">{fit.score}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${fit.score}%` }} />
              </div>
              <ul className="mt-2 space-y-1 text-[12.5px] text-ink/75">
                {fit.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              {best.size.sizeLabel !== size.sizeLabel && (
                <p className="mt-2 text-[12px] text-forest">Saran stylist: ukuran {best.size.sizeLabel} ({best.fit.score}%).</p>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.tags.map((t) => (
            <span key={t} className="rounded-full bg-cream-3 px-2.5 py-1 text-[11px] text-muted">#{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function IconAction({ children, onClick, label, active }: { children: React.ReactNode; onClick: () => void; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-xs transition active:bg-cream-3 ${
        active ? 'border-forest bg-sage-soft text-forest' : 'border-line-2 text-ink hover:border-forest/40'
      }`}
    >
      {children}
      {label}
    </button>
  );
}

function FlatLayOverlay({ size }: { size: GarmentMeasurement }) {
  const items: string[] = [];
  if (size.chestBustCm) items.push(`LD ${size.chestBustCm}`);
  if (size.waistCm) items.push(`LP ${size.waistCm}`);
  if (size.shoulderWidthCm) items.push(`Bahu ${size.shoulderWidthCm}`);
  if (size.garmentLengthCm) items.push(`P ${size.garmentLengthCm}`);
  if (size.insoleCm) items.push(`Insole ${String(size.insoleCm).replace('.', ',')}`);
  if (size.bagLengthCm) items.push(`${size.bagLengthCm} x ${size.bagWidthCm} x ${size.bagHeightCm}`);
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-md bg-forest/85 px-2 py-1 text-[11px] font-medium tabular-nums text-cream">
          {i} cm
        </span>
      ))}
    </div>
  );
}
