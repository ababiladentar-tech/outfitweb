'use client';

import { Heart } from 'lucide-react';
import { useApp } from './AppContext';
import { ProductImage } from './GarmentArt';
import { SELLER_TYPE_LABEL } from '@/lib/data';
import { useLikeProduct, useProfile } from '@/lib/hooks';
import { bestSize, FIT_LABEL, fitTone } from '@/lib/sizing';
import { formatIDR, useHydrated } from '@/lib/storage';
import type { UMKMProductPost } from '@/lib/types';

export function SellerBadge({ type }: { type: UMKMProductPost['sellerType'] }) {
  const cls =
    type === 'umkm'
      ? 'bg-cream/90 text-forest'
      : type === 'community_preloved'
        ? 'bg-[#F6E3E5]/95 text-[#8A3B46]'
        : 'bg-sage-2/90 text-forest';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${cls}`}>
      {SELLER_TYPE_LABEL[type]}
    </span>
  );
}

export function ProductCard({ product, compact = false }: { product: UMKMProductPost; compact?: boolean }) {
  const { openProduct } = useApp();
  const like = useLikeProduct();
  const [profile] = useProfile();
  const hydrated = useHydrated();
  const fit = bestSize(product, profile.measurements);
  const liked = hydrated && like.has(product.id);
  const soldOut = !product.isAvailable || product.stockCount <= 0;
  const showFit = product.category !== 'bag' && product.category !== 'hijab';

  return (
    <article className="group relative flex flex-col">
      <button
        type="button"
        onClick={() => openProduct(product.id)}
        className="relative block aspect-[4/5] overflow-hidden rounded-[14px] bg-cream-2 text-left"
        aria-label={`Lihat ${product.title}`}
      >
        <ProductImage
          src={product.imageUrl}
          colors={product.colorHex}
          alt={product.title}
          className={`transition duration-500 group-hover:scale-[1.03] ${soldOut ? 'opacity-50 grayscale-[40%]' : ''}`}
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          <SellerBadge type={product.sellerType} />
          {product.isOneOfAKind && (
            <span className="rounded-full bg-forest px-2 py-0.5 text-[12px] font-semibold text-cream">
              1 Pcs
            </span>
          )}
        </div>
        {soldOut && (
          <span className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium text-cream">
            Stok habis
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={() => like.toggle(product.id)}
        aria-label={liked ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        aria-pressed={liked}
        className="group/heart absolute right-0 top-0 grid size-11 place-items-center"
      >
        <span className="grid size-8 place-items-center rounded-full bg-cream/90 text-forest transition group-hover/heart:bg-white group-active/heart:scale-95">
          <Heart className={`size-4 ${liked ? 'fill-coral-ink text-coral-ink' : ''}`} strokeWidth={1.6} aria-hidden />
        </span>
      </button>
      <div className="mt-2.5 flex flex-1 flex-col">
        <p className="truncate text-[12px] text-muted">
          {product.sellerName} . {product.sellerCity}
        </p>
        <h3 className={`mt-0.5 line-clamp-2 font-serif leading-snug text-forest ${compact ? 'text-[14px]' : 'text-[15px] md:text-base'}`}>
          {product.title}
        </h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1.5">
          <span className="text-sm font-semibold text-ink">{formatIDR(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted line-through">{formatIDR(product.originalPrice)}</span>
          )}
        </div>
        {showFit && hydrated && (
          <span className={`mt-1.5 w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${fitTone(fit.fit.status)}`}>
            {fit.size.sizeLabel.split(' ')[0]} . {FIT_LABEL[fit.fit.status]} {fit.fit.score}%
          </span>
        )}
      </div>
    </article>
  );
}
