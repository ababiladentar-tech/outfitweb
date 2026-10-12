'use client';

import React, { useState } from 'react';
import { X, Sparkles, Plus, Image as ImageIcon, Ruler, Tag, AlertCircle, Check, Store } from 'lucide-react';
import { UMKMProductPost, ProductConditionType, SellerType } from '@/types';
import { addNewProductListing } from '@/data/marketplace-store';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername?: string;
  onPostCreated: (post: UMKMProductPost) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUsername = 'Teman Gaya',
  onPostCreated
}) => {
  const [title, setTitle] = useState('');
  const [isForSale, setIsForSale] = useState(true);
  const [isOfficialStore, setIsOfficialStore] = useState(false);
  const [storeBrandName, setStoreBrandName] = useState('');
  const [category, setCategory] = useState('top');
  const [style, setStyle] = useState('casual');
  const [price, setPrice] = useState<number>(125000);
  const [condition, setCondition] = useState<ProductConditionType>('like_new');
  const [defectNotes, setDefectNotes] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80');
  const [sizeLabel, setSizeLabel] = useState('Size M');
  const [chestBustCm, setChestBustCm] = useState<number>(96);
  const [showAdvancedMeasurements, setShowAdvancedMeasurements] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created = addNewProductListing({
      sellerId: `user-${currentUsername.toLowerCase().replace(/\s+/g, '-')}`,
      sellerName: isOfficialStore && storeBrandName.trim() ? storeBrandName : `@${currentUsername}`,
      sellerType: isOfficialStore ? 'umkm' : 'community_preloved',
      sellerCity: 'Jakarta Selatan',
      sellerRating: 5.0,
      sellerReviewCount: 1,
      sellerContact: '6281234567890',
      title: title || 'Outfit Pilihan Komunitas',
      description: description || 'Postingan outfit dari komunitas Outfitly.',
      category,
      style,
      colorFamily: 'black',
      colorHex: ['#1A1A1A'],
      price: isForSale ? Number(price) : 0,
      condition: isOfficialStore ? 'new' : condition,
      defectNotes: defectNotes || undefined,
      isOneOfAKind: !isOfficialStore,
      stockCount: isOfficialStore ? 10 : 1,
      isAvailable: true,
      availableSizes: [
        {
          sizeLabel: sizeLabel || 'Size M',
          chestBustCm: Number(chestBustCm) || undefined
        }
      ],
      fitType: 'regular',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80',
      tags: [category, style, isOfficialStore ? 'Brand UMKM' : 'Komunitas']
    });

    onPostCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#162D24] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#8EA89D] text-[#162D24] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Tambah Postingan Outfit</h2>
              <p className="text-xs text-[#A3BFB2]">Bagikan OOTD atau jual koleksi pakaian preloved Anda</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-[#162D24] text-xs">
          {/* Post Type Selector */}
          <div className="flex gap-2 p-1 bg-[#EAE6DC] rounded-2xl">
            <button
              type="button"
              onClick={() => setIsOfficialStore(false)}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                !isOfficialStore ? 'bg-white text-[#162D24] shadow-xs' : 'text-neutral-600'
              }`}
            >
              Postingan Pribadi / Preloved
            </button>
            <button
              type="button"
              onClick={() => setIsOfficialStore(true)}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                isOfficialStore ? 'bg-[#162D24] text-white shadow-xs' : 'text-neutral-600'
              }`}
            >
              Daftarkan Toko UMKM Resmi
            </button>
          </div>

          {isOfficialStore && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Store className="w-4 h-4" />
                <span>Registrasi Brand / Toko UMKM:</span>
              </div>
              <input
                type="text"
                required
                placeholder="Nama Brand / Toko UMKM Anda"
                value={storeBrandName}
                onChange={(e) => setStoreBrandName(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-[#162D24]"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="font-bold block mb-1">Judul Pakaian / Caption:</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kemeja Linen Putih Oversized"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
            />
          </div>

          {/* Category & Style */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Kategori:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs"
              >
                <option value="top">Atasan (Top / Kemeja / Kaos)</option>
                <option value="casual_outfit">Setelan Casual Outfit</option>
                <option value="dress">Dress / Gaun</option>
                <option value="outerwear">Outerwear (Jaket / Blazer)</option>
                <option value="jeans">Celana / Jeans</option>
                <option value="bag">Tas (Bag)</option>
                <option value="shoes">Sepatu (Shoes)</option>
                <option value="hijab">Hijab Chic</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Gaya (Style):</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs"
              >
                <option value="casual">Casual Daily</option>
                <option value="minimalist">Minimalist Korean</option>
                <option value="formal">Formal Smart</option>
                <option value="streetwear">Streetwear</option>
                <option value="etnik_batik_modern">Etnik Modern</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Harga (Rp):</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Kondisi:</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs"
              >
                <option value="like_new">Like New (99% Mulus)</option>
                <option value="very_good">Very Good (Pemakaian wajar)</option>
                <option value="good">Good (Ada jejak pakai)</option>
                <option value="new">Brand New (Baru)</option>
              </select>
            </div>
          </div>

          {/* Secondhand honesty notes */}
          {!isOfficialStore && (
            <div>
              <label className="font-bold block mb-1 text-neutral-600">Catatan Kondisi / Defek (Opsional):</label>
              <input
                type="text"
                placeholder="Contoh: Dipakai 1x acara wisuda, sangat mulus tanpa noda"
                value={defectNotes}
                onChange={(e) => setDefectNotes(e.target.value)}
                className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs"
              />
            </div>
          )}

          {/* Size & Measurements (Simple) */}
          <div className="p-3 bg-white rounded-2xl border border-[#E8E4D9] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-800">Ukuran Pakaian:</span>
              <button
                type="button"
                onClick={() => setShowAdvancedMeasurements(!showAdvancedMeasurements)}
                className="text-xs text-[#162D24] hover:underline font-semibold"
              >
                {showAdvancedMeasurements ? 'Sembunyikan Detail CM' : 'Tambah Detail CM (Opsional)'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Label: Size S / M / L / XL"
                  value={sizeLabel}
                  onChange={(e) => setSizeLabel(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              {showAdvancedMeasurements ? (
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Lingkar Dada"
                    value={chestBustCm}
                    onChange={(e) => setChestBustCm(Number(e.target.value))}
                    className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs font-medium"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-neutral-400">cm</span>
                </div>
              ) : (
                <span className="text-[11px] text-neutral-500 self-center">Ukuran standar otomatis</span>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="font-semibold block mb-1 text-neutral-800">Foto Pakaian (URL):</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold block mb-1 text-neutral-800">Deskripsi Tambahan:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan detail bahan atau alasan dijual..."
              className="w-full bg-white border border-[#DDD8CC] rounded-xl p-2.5 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#162D24] hover:bg-[#203D31] text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Publikasikan Postingan</span>
          </button>
        </form>
      </div>
    </div>
  );
};
