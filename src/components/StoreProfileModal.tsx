'use client';

import React, { useState, useEffect } from 'react';
import { StoreProfile, UMKMProductPost } from '@/types';
import { 
  X, 
  Store, 
  MapPin, 
  Star, 
  CheckCircle2, 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  ExternalLink,
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { toggleFollowStore, getFollowedStoreIds, getStoredProducts } from '@/data/marketplace-store';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface StoreProfileModalProps {
  store: StoreProfile | null;
  isOpen: boolean;
  onClose: () => void;
  products?: UMKMProductPost[];
  onSelectProduct?: (product: UMKMProductPost) => void;
  onShowToast?: (text: string) => void;
}

export const StoreProfileModal: React.FC<StoreProfileModalProps> = ({
  store,
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onShowToast
}) => {
  const [isFollowed, setIsFollowed] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (store) {
      const followed = getFollowedStoreIds();
      const followedStatus = followed.includes(store.id);
      setIsFollowed(followedStatus);
      setFollowerCount(store.followerCount + (followedStatus && !store.isFollowed ? 1 : 0));
    }
  }, [store]);

  if (!isOpen || !store) return null;

  const allProducts = products || getStoredProducts();
  const storeProducts = allProducts.filter(
    p => p.sellerId === store.id || p.sellerName.toLowerCase() === store.name.toLowerCase()
  );

  const handleToggleFollow = () => {
    const nextStatus = toggleFollowStore(store.id);
    setIsFollowed(nextStatus);
    setFollowerCount(prev => nextStatus ? prev + 1 : Math.max(0, prev - 1));
    if (onShowToast) {
      onShowToast(nextStatus ? `Berhasil mengikuti ${store.name}!` : `Berhenti mengikuti ${store.name}.`);
    }
  };

  const handleWhatsApp = () => {
    const text = `Halo ${store.name}! Saya melihat profil toko Anda di aplikasi Outfitly dan tertarik dengan koleksi pakaiannya.`;
    window.open(`https://wa.me/${store.contactNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div 
        onClick={onClose} 
        className="fixed inset-0"
      />

      <div className="relative w-full max-w-2xl bg-[#FAF9F5] text-[#162D24] rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden flex flex-col max-h-[92vh] z-10">
        {/* Banner Background */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#162D24] via-[#203D31] to-[#2F4F42] relative p-4 flex items-start justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-xs text-white text-[10px] font-bold">
            <Store className="w-3.5 h-3.5 text-[#8EA89D]" />
            <span>{store.sellerType === 'umkm' ? 'Mitra Brand Lokal UMKM' : 'Collab Mitra Terkurasi'}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content Container */}
        <div className="px-5 sm:px-8 pb-6 overflow-y-auto flex-1 space-y-6">
          {/* Avatar & Header Row (IG Style) */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 pb-2 border-b border-[#E8E4D9]">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={store.avatarUrl}
                  alt={store.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#FAF9F5] shadow-md bg-white"
                />
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#162D24]">
                    {store.name}
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 font-medium">@{store.username}</p>
                <div className="flex items-center gap-1 text-[11px] text-neutral-600 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2D5A47]" />
                  <span>{store.city}</span>
                </div>
              </div>
            </div>

            {/* Follow & Contact Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <button
                onClick={handleToggleFollow}
                className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  isFollowed
                    ? 'bg-[#EAF2EE] text-[#162D24] border border-[#BFD9CD]'
                    : 'bg-[#162D24] hover:bg-[#203D31] text-white'
                }`}
              >
                {isFollowed ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mengikuti</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5 text-[#8EA89D]" />
                    <span>+ Ikuti Toko</span>
                  </>
                )}
              </button>

              <button
                onClick={handleWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#EFECE4] border border-[#DDD8CC] text-[#162D24] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Chat WhatsApp Toko"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-white border border-[#E8E4D9] text-center text-xs">
            <div>
              <span className="font-serif font-bold text-base text-[#162D24] block">
                {storeProducts.length || store.productCount}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Produk</span>
            </div>
            <div className="border-x border-neutral-100">
              <span className="font-serif font-bold text-base text-[#162D24] block">
                {followerCount.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Pengikut</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 font-serif font-bold text-base text-[#162D24]">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{store.rating}</span>
              </div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Rating Toko</span>
            </div>
          </div>

          {/* Bio & Social Links */}
          <div className="space-y-2 text-xs">
            <p className="text-neutral-700 font-medium leading-relaxed">{store.bio}</p>
            {store.instagramHandle && (
              <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1 font-semibold text-[#162D24]">
                  <InstagramIcon className="w-3.5 h-3.5 text-[#2D5A47]" />
                  <span>{store.instagramHandle}</span>
                </span>
                {store.externalShopUrl && (
                  <a
                    href={store.externalShopUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-semibold text-[#2D5A47] hover:underline"
                  >
                    <span>Kunjungi Marketplace Resmi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* "Cerita UMKM" - Mengapa Buka Toko Ini (Mirip IG Story Highlight / About) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF2EE]/60 border border-[#BFD9CD] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#2D5A47]">
              <Sparkles className="w-4 h-4" />
              <h4 className="font-serif font-bold text-sm text-[#162D24]">
                Cerita Kami: Mengapa Membuka Akun di Outfitly?
              </h4>
            </div>
            <p className="text-neutral-700 leading-relaxed text-[11px] sm:text-xs italic">
              "{store.story}"
            </p>
          </div>

          {/* Etalase Produk Toko */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-[#162D24] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#2D5A47]" />
                <span>Etalase Busana Toko ({storeProducts.length})</span>
              </h4>
            </div>

            {storeProducts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#E8E4D9] text-center text-xs text-neutral-400">
                Belum ada produk aktif yang ditampilkan untuk toko ini.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {storeProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct?.(p);
                    }}
                    className="bg-white rounded-2xl border border-[#DDD8CC] overflow-hidden hover:border-[#162D24] cursor-pointer transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div className="aspect-3/4 relative overflow-hidden bg-neutral-100">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2.5 space-y-1">
                      <h5 className="font-serif font-bold text-xs text-[#162D24] line-clamp-1 group-hover:text-[#2D5A47]">
                        {p.title}
                      </h5>
                      <span className="font-bold text-xs text-[#162D24] block">
                        Rp {p.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
