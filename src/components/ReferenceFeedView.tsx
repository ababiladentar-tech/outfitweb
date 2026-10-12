'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UMKMProductPost, UserOnboardingProfile, SellerType, ProductConditionType } from '@/types';
import { getStoredProducts } from '@/data/marketplace-store';
import { calculateSizeCompatibility } from '@/lib/sizing-engine';
import {
  Share2,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Tag,
  Check,
  Search,
  Ruler,
  Store,
  Heart,
  ArrowRightLeft,
  ShoppingBag,
  Plus
} from 'lucide-react';

interface ReferenceFeedViewProps {
  onSelectProduct: (product: UMKMProductPost) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  userProfile?: UserOnboardingProfile | null;
  onOpenSmartSize?: () => void;
  onOpenComparison?: (product: UMKMProductPost) => void;
  onOpenCreatePost?: () => void;
}

export const ReferenceFeedView: React.FC<ReferenceFeedViewProps> = ({
  onSelectProduct,
  savedPostIds,
  onToggleSave,
  userProfile,
  onOpenSmartSize,
  onOpenComparison,
  onOpenCreatePost
}) => {
  const [products, setProducts] = useState<UMKMProductPost[]>([]);

  // 1. Centralized Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSellerType, setSelectedSellerType] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string>('all');
  const [priceTier, setPriceTier] = useState<string>('all');
  const [onlySmartFit, setOnlySmartFit] = useState<boolean>(false);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [matchProfile, setMatchProfile] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'smart_fit' | 'price_low' | 'price_high' | 'popular' | 'newest'>('relevance');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // Load products & listen to updates
  useEffect(() => {
    setProducts(getStoredProducts());
    const handleUpdate = () => setProducts(getStoredProducts());
    window.addEventListener('outfitly_products_updated', handleUpdate);
    return () => window.removeEventListener('outfitly_products_updated', handleUpdate);
  }, []);

  // Category list
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'top', label: 'Tops & Kemeja' },
    { id: 'casual_outfit', label: 'Sets & Outfit' },
    { id: 'dress', label: 'Dresses' },
    { id: 'outerwear', label: 'Outerwear' },
    { id: 'jeans', label: 'Jeans & Pants' },
    { id: 'bag', label: 'Bags' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'hijab', label: 'Hijab Chic' }
  ];

  // Seller Type tabs
  const sellerTypes = [
    { id: 'all', label: 'Semua Sumber' },
    { id: 'umkm', label: 'UMKM Brand Baru' },
    { id: 'community_preloved', label: 'Preloved Thrift' },
    { id: 'reseller', label: 'Vintage Resale' }
  ];

  // Condition options
  const conditions = [
    { id: 'all', label: 'Semua Kondisi' },
    { id: 'new', label: 'Brand New (Baru)' },
    { id: 'like_new', label: 'Like New (99% Mulus)' },
    { id: 'very_good', label: 'Very Good (Terawat)' },
    { id: 'good', label: 'Good (Wajar)' },
    { id: 'has_defects', label: 'Ada Defek Tertera' }
  ];

  // Standard sizes
  const standardSizes = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'];

  // Style filters
  const styles = [
    { id: 'all', label: 'Semua Gaya' },
    { id: 'casual', label: 'Casual' },
    { id: 'formal', label: 'Formal' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'streetwear', label: 'Streetwear' },
    { id: 'etnik_batik_modern', label: 'Etnik Modern' },
    { id: 'sporty', label: 'Sporty' }
  ];

  // Color filters
  const colors = [
    { id: 'all', label: 'Semua Warna', hex: '#FFFFFF' },
    { id: 'black', label: 'Hitam', hex: '#1C1C1C' },
    { id: 'white', label: 'Putih', hex: '#FFFFFF' },
    { id: 'brown', label: 'Cokelat / Earth', hex: '#8C6D58' },
    { id: 'blue', label: 'Biru / Denim', hex: '#2F4858' },
    { id: 'green', label: 'Hijau / Sage', hex: '#8FBC8F' },
    { id: 'pink', label: 'Pink Pastel', hex: '#F3C5C5' },
    { id: 'neutral', label: 'Netral / Krem', hex: '#FAF0E6' }
  ];

  // Price Tiers
  const priceTiers = [
    { id: 'all', label: 'Semua Harga' },
    { id: 'under_100', label: '< Rp 100.000', min: 0, max: 100000 },
    { id: '100_200', label: 'Rp 100.000 - Rp 200.000', min: 100000, max: 200000 },
    { id: '200_300', label: 'Rp 200.000 - Rp 300.000', min: 200000, max: 300000 },
    { id: 'above_300', label: '> Rp 300.000', min: 300000, max: 999999999 }
  ];

  // Active filter counting
  const activeFilterCount = [
    selectedSellerType !== 'all',
    selectedCondition !== 'all',
    selectedCategory !== 'all',
    selectedStyle !== 'all',
    selectedColor !== 'all',
    selectedSizeLabel !== 'all',
    priceTier !== 'all',
    onlySmartFit,
    onlyInStock,
    matchProfile
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSellerType('all');
    setSelectedCondition('all');
    setSelectedCategory('all');
    setSelectedStyle('all');
    setSelectedColor('all');
    setSelectedSizeLabel('all');
    setPriceTier('all');
    setOnlySmartFit(false);
    setOnlyInStock(false);
    setMatchProfile(false);
    setSortBy('relevance');
  };

  // 2. Interconnected Filter Pipeline
  const filteredProducts = useMemo(() => {
    let list: UMKMProductPost[] = [...products];

    // Exclude moderated products
    list = list.filter(p => !p.isModerated);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((post) => {
        const titleMatch = post.title.toLowerCase().includes(q);
        const sellerMatch = post.sellerName.toLowerCase().includes(q);
        const cityMatch = post.sellerCity.toLowerCase().includes(q);
        const descMatch = post.description.toLowerCase().includes(q);
        const tagMatch = post.tags.some((t) => t.toLowerCase().includes(q));
        const matMatch = post.material?.toLowerCase().includes(q);
        return titleMatch || sellerMatch || cityMatch || descMatch || tagMatch || matMatch;
      });
    }

    // Seller type
    if (selectedSellerType !== 'all') {
      list = list.filter((p) => p.sellerType === selectedSellerType);
    }

    // Condition
    if (selectedCondition !== 'all') {
      list = list.filter((p) => p.condition === selectedCondition);
    }

    // Category
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Style
    if (selectedStyle !== 'all') {
      list = list.filter((p) => p.style === selectedStyle);
    }

    // Color
    if (selectedColor !== 'all') {
      list = list.filter((p) => p.colorFamily === selectedColor);
    }

    // Standard Size Label
    if (selectedSizeLabel !== 'all') {
      list = list.filter((p) => 
        p.availableSizes.some((s) => s.sizeLabel.toLowerCase().includes(selectedSizeLabel.toLowerCase()))
      );
    }

    // Stock availability
    if (onlyInStock) {
      list = list.filter((p) => p.isAvailable && p.stockCount > 0);
    }

    // Price Tier
    if (priceTier !== 'all') {
      const tier = priceTiers.find((t) => t.id === priceTier);
      if (tier && tier.min !== undefined && tier.max !== undefined) {
        list = list.filter((p) => p.price >= tier.min && p.price <= tier.max);
      }
    }

    // Smart Size Compatibility Filter
    if (onlySmartFit && userProfile?.measurements) {
      list = list.filter((p) => {
        const res = calculateSizeCompatibility(p, userProfile.measurements);
        return res.overallScore >= 70; // 70%+ match
      });
    }

    // Personal Profile Vibe Match
    if (matchProfile && userProfile) {
      list = list.filter((post) => {
        const matchesSkin = !post.bestForSkinTones || post.bestForSkinTones.includes(userProfile.skinTone);
        const matchesBody = !post.bestForBodyShapes || post.bestForBodyShapes.includes(userProfile.bodyShape);
        return matchesSkin || matchesBody;
      });
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortBy === 'smart_fit' && userProfile?.measurements) {
        const scoreA = calculateSizeCompatibility(a, userProfile.measurements).overallScore;
        const scoreB = calculateSizeCompatibility(b, userProfile.measurements).overallScore;
        return scoreB - scoreA;
      }
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'popular') return (b.saves + b.likes) - (a.saves + a.likes);
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.saves * 2 + b.likes) - (a.saves * 2 + a.likes);
    });

    return list;
  }, [
    products,
    searchQuery,
    selectedSellerType,
    selectedCondition,
    selectedCategory,
    selectedStyle,
    selectedColor,
    selectedSizeLabel,
    priceTier,
    onlySmartFit,
    onlyInStock,
    matchProfile,
    sortBy,
    userProfile
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-[#162D24]">
      {/* Search and Header Section */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCDAD2] pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2F4F42]">
              Ruang Komunitas & Lemari Preloved
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#162D24] tracking-tight">
              Inspirasi Gaya & Rilisan Pilihan
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-xl leading-relaxed">
              Temukan inspirasi padu padan OOTD, karya pengrajin brand lokal, dan koleksi thrift preloved terkurasi dengan sistem ukuran sentimeter yang transparan.
            </p>
          </div>

          {/* Top Right Action: Tambah Postingan */}
          <div className="flex items-center gap-3">
            {onOpenCreatePost && (
              <button
                onClick={onOpenCreatePost}
                className="px-5 py-2.5 bg-[#162D24] hover:bg-[#203D31] text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#8EA89D]" />
                <span>Bagikan Outfit / Jual Thrift</span>
              </button>
            )}
          </div>
        </div>

        {/* Source Navigation Tabs & Search Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Seller Type Segmented Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#E8E6DF] rounded-xl overflow-x-auto">
            {sellerTypes.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedSellerType(st.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSellerType === st.id
                    ? 'bg-white text-[#162D24] shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-[#162D24]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Bar & Filter Toggle */}
          <div className="flex items-center gap-2.5 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari kemeja vintage, vest denim, thrift blazer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-[#DCDAD2] text-xs sm:text-sm text-[#162D24] placeholder-neutral-400 focus:outline-none focus:border-[#162D24] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-[#162D24] text-white shadow-xs'
                  : 'bg-white text-[#162D24] border border-[#DCDAD2] hover:bg-[#FAF9F5]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#8EA89D] text-[#162D24] text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Horizontal Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#2F4F42] text-white font-semibold'
                  : 'bg-white text-neutral-700 border border-[#DCDAD2] hover:bg-[#FAF9F5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Drawer / Panel (Expandable) */}
      {isFilterPanelOpen && (
        <div className="bg-white rounded-3xl p-6 border border-[#D8D2C4] shadow-md mb-8 animate-fadeIn space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-sm text-[#162D24]">
              <SlidersHorizontal className="w-4 h-4 text-[#8EA89D]" />
              <span>Multi-Filter Spesifik & Panduan Ukuran</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-neutral-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
              <button
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-1 text-neutral-400 hover:text-[#162D24]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {/* 1. Condition Filter */}
            <div className="space-y-2">
              <label className="font-bold text-neutral-700 uppercase tracking-wider text-[11px] block">
                Kondisi Pakaian:
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 font-medium text-[#162D24]"
              >
                {conditions.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* 2. Size Labels */}
            <div className="space-y-2">
              <label className="font-bold text-neutral-700 uppercase tracking-wider text-[11px] block">
                Label Ukuran Standar:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {standardSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSizeLabel(sz)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      selectedSizeLabel === sz
                        ? 'bg-[#162D24] text-white'
                        : 'bg-[#FAF9F5] text-[#162D24] border border-[#E8E4D9]'
                    }`}
                  >
                    {sz === 'all' ? 'Semua' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Style Vibe */}
            <div className="space-y-2">
              <label className="font-bold text-neutral-700 uppercase tracking-wider text-[11px] block">
                Gaya / Vibe:
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 font-medium text-[#162D24]"
              >
                {styles.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* 4. Price Tier */}
            <div className="space-y-2">
              <label className="font-bold text-neutral-700 uppercase tracking-wider text-[11px] block">
                Rentang Harga:
              </label>
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 font-medium text-[#162D24]"
              >
                {priceTiers.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-4 border-t border-neutral-100 flex flex-wrap gap-4 items-center">
            {/* Size Matcher Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-[#EAF2EE] px-4 py-2 rounded-2xl border border-[#BFD9CD]">
              <input
                type="checkbox"
                checked={onlySmartFit}
                onChange={(e) => setOnlySmartFit(e.target.checked)}
                className="w-4 h-4 accent-[#162D24] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#162D24] flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#2D5A47]" />
                <span>Hanya Tampilkan Yang Pas di Tubuh Saya (Kecocokan 70%+)</span>
              </span>
            </label>

            {/* Ready Stock Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-[#FAF9F5] px-4 py-2 rounded-2xl border border-[#E8E4D9]">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 accent-[#162D24] cursor-pointer"
              />
              <span className="text-xs font-bold text-neutral-700">Hanya Ready Stock</span>
            </label>

            {/* Personal Vibe Match Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-[#FAF9F5] px-4 py-2 rounded-2xl border border-[#E8E4D9]">
              <input
                type="checkbox"
                checked={matchProfile}
                onChange={(e) => setMatchProfile(e.target.checked)}
                className="w-4 h-4 accent-[#162D24] cursor-pointer"
              />
              <span className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#8EA89D]" />
                <span>Cocokkan Profil Gaya & Undertone</span>
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Active Filter Chips & Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b border-[#E8E6DF]">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
          <span>Menampilkan <strong className="text-[#162D24]">{filteredProducts.length}</strong> rilisan pakaian</span>
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-[#162D24] underline hover:text-rose-600 ml-2 cursor-pointer font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 font-medium">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-[#DCDAD2] rounded-lg px-3 py-1.5 font-medium text-[#162D24] cursor-pointer shadow-2xs focus:outline-none focus:border-[#162D24]"
          >
            <option value="relevance">Kurasi Terpilih</option>
            {userProfile?.measurements && <option value="smart_fit">Kecocokan Ukuran (Smart Fit)</option>}
            <option value="price_low">Harga: Terendah</option>
            <option value="price_high">Harga: Tertinggi</option>
            <option value="popular">Paling Banyak Disimpan</option>
            <option value="newest">Rilisan Terbaru</option>
          </select>
        </div>
      </div>

      {/* Product Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#DCDAD2] max-w-md mx-auto my-10 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F5] text-neutral-400 flex items-center justify-center mx-auto border border-[#DCDAD2]">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-[#162D24]">Belum Ada Rilisan yang Sesuai</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
              Coba gunakan kata kunci lain, pilih semua sumber penjual, atau nonaktifkan filter ukuran ketat.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-[#162D24] text-white rounded-xl text-xs font-semibold hover:bg-[#203D31] transition-colors cursor-pointer"
          >
            Tampilkan Semua Rilisan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isSaved = savedPostIds.includes(product.id);
            const fit = calculateSizeCompatibility(product, userProfile?.measurements);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#DCDAD2] hover:border-[#162D24]/30 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container with Badges */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-3/4 overflow-hidden bg-[#F4F1EA] cursor-pointer"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />

                  {/* Top Bar Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide backdrop-blur-xs shadow-xs ${
                      product.sellerType === 'community_preloved' 
                        ? 'bg-[#FAF0E6]/95 text-[#634832] border border-[#E8D9C8]' 
                        : 'bg-[#162D24]/90 text-white'
                    }`}>
                      {product.sellerType === 'community_preloved' ? 'Preloved Thrift' : 'Brand Lokal UMKM'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(product.id);
                      }}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#162D24] flex items-center justify-center shadow-xs transition-all cursor-pointer"
                      title="Simpan Outfit"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C95D63] text-[#C95D63]' : 'text-[#162D24]'}`} />
                    </button>
                  </div>

                  {/* Smart Sizing Match Tag */}
                  {userProfile?.measurements?.chestBustCm && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium backdrop-blur-xs shadow-xs ${
                        fit.overallScore >= 80 
                          ? 'bg-[#162D24]/90 text-[#8EA89D]' 
                          : 'bg-[#422D1D]/90 text-[#E8C8A8]'
                      }`}>
                        Smart Fit: {fit.overallScore}% ({fit.recommendedSize || 'Size S/M'})
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="truncate max-w-[130px] font-medium text-neutral-700">
                        {product.sellerName}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {product.sellerCity}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-serif font-bold text-sm text-[#162D24] line-clamp-1 hover:text-[#2F4F42] cursor-pointer"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* Price and measurement preview */}
                    <div className="flex items-baseline justify-between pt-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif font-bold text-base text-[#162D24]">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            Rp {product.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-medium text-[#2F4F42] bg-[#EAF2EE] px-2 py-0.5 rounded">
                        {product.condition === 'new' ? 'Baru' : 'Preloved'}
                      </span>
                    </div>
                  </div>

                  {/* Size preview & Comparison action */}
                  <div className="pt-2.5 border-t border-[#F0EFEA] flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 text-neutral-500 overflow-x-auto">
                      <span className="font-medium text-neutral-400">Size:</span>
                      {product.availableSizes.slice(0, 3).map((s) => (
                        <span key={s.sizeLabel} className="bg-[#FAF9F5] px-1.5 py-0.5 rounded border border-[#E8E4D9] font-medium text-[#162D24]">
                          {s.sizeLabel}
                        </span>
                      ))}
                    </div>

                    {onOpenComparison && (
                      <button
                        onClick={() => onOpenComparison(product)}
                        className="p-1 rounded text-neutral-400 hover:text-[#162D24] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                        title="Bandingkan Dimensi Pakaian"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
