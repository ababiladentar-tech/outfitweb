'use client';

import React, { useState, useMemo } from 'react';
import { UMKMProductPost } from '@/types';
import { OFTEA_POSTS } from '@/data/umkm-products';
import { Heart, Trash2, ShoppingBag, ExternalLink, ArrowLeft, Search } from 'lucide-react';

interface SavedItemsViewProps {
  savedPostIds: string[];
  onToggleSave: (id: string) => void;
  onSelectProduct: (product: UMKMProductPost) => void;
  onNavigateExplore: () => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  savedPostIds,
  onToggleSave,
  onSelectProduct,
  onNavigateExplore
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const savedProducts = useMemo(() => {
    return OFTEA_POSTS.filter(p => savedPostIds.includes(p.id));
  }, [savedPostIds]);

  const filteredSaved = useMemo(() => {
    return savedProducts.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesBrand = p.sellerName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand) return false;
      }

      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [savedProducts, searchQuery, selectedCategory]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#EFEFEA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6DFDA] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E58B94] text-[#162D24] flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-[#162D24]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#162D24] font-sans tracking-tight">
                Outfit Tersimpan ({savedProducts.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600">
              Koleksi kurasi pakaian dan aksesoris UMKM yang kamu sukai.
            </p>
          </div>

          <button
            onClick={onNavigateExplore}
            className="px-5 py-2.5 rounded-full bg-[#162D24] hover:bg-[#1E3A2F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#8EA89D]" />
            <span>Jelajahi Outfit Lainnya</span>
          </button>
        </div>

        {/* Search & Category Filter within Saved */}
        {savedProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Cari di koleksi tersimpan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white text-xs text-[#162D24] placeholder:text-neutral-400 border border-neutral-200 shadow-2xs outline-hidden"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['all', 'jeans', 'bag', 'dress', 'shoes', 'casual_outfit'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#162D24] text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {savedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D6DFDA] p-8 space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF0E6] text-[#162D24] flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-[#E58B94]" />
            </div>
            <h3 className="text-lg font-bold text-[#162D24]">Belum Ada Outfit Tersimpan</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Klik tombol &quot;Save&quot; pada outfit yang kamu sukai di halaman Community Feed atau AI Stylist untuk menyimpannya di sini.
            </p>
            <button
              onClick={onNavigateExplore}
              className="px-6 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Mulai Eksplorasi Outfit
            </button>
          </div>
        ) : filteredSaved.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#D6DFDA] p-6">
            <p className="text-sm font-semibold text-neutral-600">Tidak ada produk tersimpan yang cocok dengan pencarian.</p>
          </div>
        ) : (
          /* Saved Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {filteredSaved.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectProduct(post)}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-3/4 overflow-hidden bg-neutral-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(post.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-rose-50 text-rose-600 shadow-md transition-all cursor-pointer"
                    title="Hapus dari tersimpan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8EA89D]">
                    {post.sellerName} • {post.sellerCity}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#162D24] truncate group-hover:text-[#2F4F42]">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs font-black text-[#162D24]">
                      Rp {post.price.toLocaleString('id-ID')}
                    </p>
                    <span className="text-[10px] text-[#254236] font-bold">
                      Detail →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
