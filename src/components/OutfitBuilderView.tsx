'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  ShoppingBag, 
  Shirt, 
  RefreshCw, 
  Save, 
  Bookmark, 
  Trash2, 
  CheckCircle2, 
  SlidersHorizontal, 
  DollarSign, 
  CloudSun, 
  ArrowRight, 
  ChevronRight, 
  X, 
  Eye, 
  Ruler, 
  Info,
  Calendar,
  Tag
} from 'lucide-react';
import { 
  WardrobeItem, 
  UMKMProductPost, 
  SavedOutfit, 
  OutfitSlot, 
  OutfitSlotType, 
  OutfitBuilderMode, 
  OutfitWeather,
  UserOnboardingProfile 
} from '@/types';
import { getStoredWardrobe } from '@/data/wardrobe-store';
import { getStoredProducts } from '@/data/marketplace-store';
import { getStoredOutfits, saveNewOutfit, deleteSavedOutfit } from '@/data/wardrobe-store';
import { generateOutfitCombination, replaceOutfitSlot } from '@/lib/outfit-generator';
import { calculateSizeCompatibility } from '@/lib/sizing-engine';

interface OutfitBuilderViewProps {
  currentUserId?: string;
  userProfile?: UserOnboardingProfile | null;
  initialPreselectedItems?: WardrobeItem[];
  onSelectProduct: (product: UMKMProductPost) => void;
  onOpenSmartSize: () => void;
  onNavigateWardrobe: () => void;
  onShowToast: (message: string) => void;
  onAskAIToReview?: (summary: string) => void;
}

const OCCASIONS = [
  { key: 'campus', label: 'Kuliah & Kampus' },
  { key: 'casual', label: 'Hangout Santai' },
  { key: 'formal', label: 'Kantor & Meeting' },
  { key: 'date', label: 'Kencan / Cafe' },
  { key: 'party', label: 'Kondangan & Pesta' },
  { key: 'interview', label: 'Wawancara Kerja' },
  { key: 'travel', label: 'Liburan & Jalan' }
];

const STYLES = [
  { key: 'minimalist', label: 'Minimalist Clean' },
  { key: 'casual', label: 'Casual Smart' },
  { key: 'streetwear', label: 'Streetwear' },
  { key: 'old_money_smart', label: 'Old Money' },
  { key: 'vintage_retro', label: 'Vintage Retro' },
  { key: 'etnik_batik_modern', label: 'Etnik Modern' }
];

const WEATHER_OPTIONS: Array<{ key: OutfitWeather; label: string; desc: string }> = [
  { key: 'moderate', label: 'Normal (26°C - 28°C)', desc: 'Suhu harian seimbang' },
  { key: 'hot', label: 'Cerah & Panas (32°C)', desc: 'Bahan katun tipis berpori' },
  { key: 'cool_ac', label: 'Sejuk / Ber-AC (22°C)', desc: 'Butuh luaran atau layering' },
  { key: 'rainy', label: 'Hujan / Dingin (23°C)', desc: 'Pakaian hangat berstruktur' }
];

export const OutfitBuilderView: React.FC<OutfitBuilderViewProps> = ({
  currentUserId = 'default_user',
  userProfile,
  initialPreselectedItems = [],
  onSelectProduct,
  onOpenSmartSize,
  onNavigateWardrobe,
  onShowToast,
  onAskAIToReview
}) => {
  // Mode selection
  const [mode, setMode] = useState<OutfitBuilderMode>(
    initialPreselectedItems.length > 0 ? 'closet' : 'shop'
  );

  // Preference Controls
  const [occasion, setOccasion] = useState('campus');
  const [styleVibe, setStyleVibe] = useState('minimalist');
  const [maxBudget, setMaxBudget] = useState(350000);
  const [weather, setWeather] = useState<OutfitWeather>('moderate');

  // Active outfit state
  const [activeOutfit, setActiveOutfit] = useState<SavedOutfit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Saved outfits drawer / tab
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'saved_collection'>('builder');

  // Slot Swapper Modal state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swappingSlotIndex, setSwappingSlotIndex] = useState<number | null>(null);

  // Save outfit dialog state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  // Data sources
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState<UMKMProductPost[]>([]);

  // Load all initial data
  useEffect(() => {
    const loadAll = () => {
      const w = getStoredWardrobe(currentUserId);
      const m = getStoredProducts();
      const o = getStoredOutfits(currentUserId);
      setWardrobeItems(w);
      setMarketplaceProducts(m);
      setSavedOutfits(o);
    };
    loadAll();

    const handleWardrobeUpdate = () => setWardrobeItems(getStoredWardrobe(currentUserId));
    const handleOutfitsUpdate = () => setSavedOutfits(getStoredOutfits(currentUserId));
    window.addEventListener('outfitly_wardrobe_updated', handleWardrobeUpdate);
    window.addEventListener('outfitly_outfits_updated', handleOutfitsUpdate);
    return () => {
      window.removeEventListener('outfitly_wardrobe_updated', handleWardrobeUpdate);
      window.removeEventListener('outfitly_outfits_updated', handleOutfitsUpdate);
    };
  }, [currentUserId]);

  // Initial generation on first mount
  useEffect(() => {
    if (marketplaceProducts.length > 0 || wardrobeItems.length > 0) {
      if (!activeOutfit) {
        handleGenerateOutfit();
      }
    }
  }, [marketplaceProducts.length, wardrobeItems.length]);

  const handleGenerateOutfit = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateOutfitCombination({
        mode,
        wardrobeItems,
        marketplaceProducts,
        occasion,
        styleVibe,
        maxBudget,
        weather,
        userMeasurements: userProfile?.measurements,
        preselectedWardrobeItems: initialPreselectedItems
      });
      setActiveOutfit(generated);
      setCustomTitle(generated.title);
      setIsGenerating(false);
    }, 300);
  };

  // Open slot swapper
  const handleOpenSwap = (index: number) => {
    setSwappingSlotIndex(index);
    setSwapModalOpen(true);
  };

  // Execute slot replacement
  const handleSelectReplacement = (
    item: WardrobeItem | UMKMProductPost, 
    sourceType: 'wardrobe' | 'marketplace'
  ) => {
    if (activeOutfit && swappingSlotIndex !== null) {
      const updated = replaceOutfitSlot(activeOutfit, swappingSlotIndex, item, sourceType);
      setActiveOutfit(updated);
      setSwapModalOpen(false);
      setSwappingSlotIndex(null);
      onShowToast('Item pakaian berhasil diganti.');
    }
  };

  // Save active outfit to collection
  const handleSaveCurrentOutfit = () => {
    if (!activeOutfit) return;
    const toSave = {
      ...activeOutfit,
      title: customTitle.trim() || activeOutfit.title,
      userId: currentUserId
    };
    saveNewOutfit(toSave);
    setIsSaveModalOpen(false);
    onShowToast(`Outfit "${toSave.title}" berhasil disimpan ke koleksi!`);
  };

  // Delete saved outfit
  const handleDeleteSaved = (id: string, title: string) => {
    if (confirm(`Hapus outfit "${title}" dari koleksi tersimpan?`)) {
      deleteSavedOutfit(id);
      onShowToast(`Outfit "${title}" dihapus.`);
    }
  };

  // Load a saved outfit into builder
  const handleLoadSavedOutfit = (outfit: SavedOutfit) => {
    setActiveOutfit(outfit);
    setCustomTitle(outfit.title);
    setActiveTab('builder');
    onShowToast(`Outfit "${outfit.title}" dimuat ke workspace.`);
  };

  // Get replacement candidates for the active slot being swapped
  const getSwapCandidates = () => {
    if (!activeOutfit || swappingSlotIndex === null) return { wardrobe: [], marketplace: [] };
    const currentSlot = activeOutfit.slots[swappingSlotIndex];
    if (!currentSlot) return { wardrobe: [], marketplace: [] };

    const slotType = currentSlot.slotType;

    // Filter wardrobe items matching this slot
    const wCandidates = wardrobeItems.filter(i => {
      if (slotType === 'top') return i.category === 'tops';
      if (slotType === 'bottom') return i.category === 'bottoms';
      if (slotType === 'outerwear') return i.category === 'outerwear';
      if (slotType === 'dress') return i.category === 'dresses';
      if (slotType === 'shoes') return i.category === 'shoes';
      if (slotType === 'bag') return i.category === 'bags';
      return i.category === 'accessories';
    });

    // Filter marketplace products matching this slot
    const mCandidates = marketplaceProducts.filter(p => {
      if (!p.isAvailable || p.stockCount === 0) return false;
      if (slotType === 'top') return ['top', 'casual_outfit', 'hijab'].includes(p.category);
      if (slotType === 'bottom') return ['jeans', 'pants', 'skirt'].includes(p.category);
      if (slotType === 'outerwear') return p.category === 'outerwear';
      if (slotType === 'dress') return p.category === 'dress';
      if (slotType === 'shoes') return p.category === 'shoes';
      if (slotType === 'bag') return p.category === 'bag';
      return false;
    });

    return { wardrobe: wCandidates, marketplace: mCandidates };
  };

  const { wardrobe: swapWardrobe, marketplace: swapMarketplace } = getSwapCandidates();

  return (
    <div className="min-h-full bg-[#F7F6F2] text-[#162D24] p-4 sm:p-6 lg:p-7 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Dossier */}
        <div className="bg-[#162D24] text-white rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-[#254637]">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
              Padukan Gaya
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
              Rancang paduan busana dari lemarimu atau kurasi produk UMKM sesuai budget dan acara yang kamu tuju.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-[#FAF9F5] text-[#162D24] shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              Stylist Canvas
            </button>
            <button
              onClick={() => setActiveTab('saved_collection')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saved_collection'
                  ? 'bg-[#FAF9F5] text-[#162D24] shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Koleksi Tersimpan ({savedOutfits.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'saved_collection' ? (
          /* SAVED OUTFIT COLLECTION VIEW */
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#162D24]">
                  Koleksi Outfit Tersimpan Anda
                </h2>
                <p className="text-xs text-neutral-500">
                  Daftar paduan gaya yang telah Anda buat dan simpan sebelumnya
                </p>
              </div>
              <button
                onClick={() => setActiveTab('builder')}
                className="px-4 py-2 bg-[#162D24] text-white rounded-xl text-xs font-bold hover:bg-[#203D31] transition-colors cursor-pointer"
              >
                Buat Outfit Baru
              </button>
            </div>

            {savedOutfits.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#D8D2C4] shadow-xs space-y-3">
                <Bookmark className="w-8 h-8 text-neutral-400 mx-auto" />
                <h3 className="text-base font-serif font-bold text-[#162D24]">Belum Ada Outfit Tersimpan</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Rancang kombinasi busana di Stylist Canvas lalu klik "Simpan Outfit" untuk menyimpan paduan favoritmu.
                </p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 bg-[#162D24] text-white rounded-xl text-xs font-semibold hover:bg-[#203D31] cursor-pointer"
                >
                  Mulai Rancang Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedOutfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="bg-white rounded-2xl p-5 border border-[#D8D2C4] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#162D24]/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF9F5] text-[#162D24] border border-[#E0DCCF]">
                          {outfit.occasion} • {outfit.style}
                        </span>
                        <button
                          onClick={() => handleDeleteSaved(outfit.id, outfit.title)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          title="Hapus Outfit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#162D24]">{outfit.title}</h3>

                      {/* Visual Slots Mini Grid */}
                      <div className="grid grid-cols-4 gap-2 py-1">
                        {outfit.slots.slice(0, 4).map((slot, sIdx) => {
                          const img = slot.wardrobeItem?.imageUrl || slot.marketplaceProduct?.imageUrl;
                          return (
                            <div key={sIdx} className="aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                              <img src={img} alt="Slot" className="w-full h-full object-cover" />
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {outfit.explanation}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Biaya Belanja Item:</span>
                        <strong className="text-xs text-[#162D24]">
                          {outfit.totalPrice > 0 ? `Rp ${outfit.totalPrice.toLocaleString('id-ID')}` : 'Gratis (Lemari Sendiri)'}
                        </strong>
                      </div>
                      <button
                        onClick={() => handleLoadSavedOutfit(outfit)}
                        className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#EAE8E0] text-[#162D24] border border-[#D8D2C4] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Buka di Canvas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* STYLIST CANVAS BUILDER VIEW */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Controls Column (4 Cols on XL) */}
            <div className="xl:col-span-4 bg-white rounded-2xl p-5 border border-[#D8D2C4] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                <h2 className="text-sm font-serif font-bold text-[#162D24] uppercase tracking-wide">
                  Kontrol Gaya & Filter
                </h2>
                <SlidersHorizontal className="w-4 h-4 text-[#2D5A47]" />
              </div>

              {/* Mode Selector Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold block text-[#162D24]">Pilih Sumber Pakaian:</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF9F5] rounded-xl border border-[#DDD8CC]">
                  <button
                    onClick={() => setMode('closet')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === 'closet'
                        ? 'bg-[#162D24] text-white shadow-2xs'
                        : 'text-neutral-600 hover:text-[#162D24]'
                    }`}
                  >
                    Lemari Saya
                  </button>
                  <button
                    onClick={() => setMode('shop')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === 'shop'
                        ? 'bg-[#162D24] text-white shadow-2xs'
                        : 'text-neutral-600 hover:text-[#162D24]'
                    }`}
                  >
                    Belanja Katalog
                  </button>
                </div>
              </div>

              {/* Occasion Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold block text-[#162D24]">Acara / Situasi:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {OCCASIONS.map(occ => (
                    <button
                      key={occ.key}
                      onClick={() => setOccasion(occ.key)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer truncate ${
                        occasion === occ.key
                          ? 'bg-[#162D24] text-white font-semibold'
                          : 'bg-[#FAF9F5] text-neutral-600 hover:bg-[#EAE8E0]'
                      }`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Vibe */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold block text-[#162D24]">Gaya Estetika (Style Vibe):</label>
                <select
                  value={styleVibe}
                  onChange={(e) => setStyleVibe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#DDD8CC] text-xs font-medium text-[#162D24] cursor-pointer"
                >
                  {STYLES.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Weather / Situation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold block text-[#162D24]">Kondisi Cuaca / Ruangan:</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#DDD8CC] text-xs font-medium text-[#162D24] cursor-pointer"
                >
                  {WEATHER_OPTIONS.map(w => (
                    <option key={w.key} value={w.key}>{w.label}</option>
                  ))}
                </select>
              </div>

              {/* Budget Limit (relevant for shop/hybrid mode) */}
              {mode !== 'closet' && (
                <div className="space-y-2 pt-2 border-t border-[#F0EFEA]">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Maksimal Budget Belanja:</span>
                    <span className="text-[#162D24] font-serif text-sm">
                      Rp {maxBudget.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={1000000}
                    step={25000}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-[#162D24] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Rp 100.000</span>
                    <span>Rp 500.000</span>
                    <span>Rp 1.000.000</span>
                  </div>
                </div>
              )}

              {/* Generate CTA Button */}
              <button
                onClick={handleGenerateOutfit}
                disabled={isGenerating}
                className="w-full py-3 bg-[#162D24] hover:bg-[#203D31] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Menyusun Paduan...' : 'Buat Paduan Outfit'}</span>
              </button>
            </div>

            {/* Right Outfit Board Column (8 Cols on XL) */}
            <div className="xl:col-span-8 space-y-5">
              {activeOutfit ? (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D8D2C4] shadow-xs space-y-5">
                  {/* Outfit Board Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EFEA]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] text-[10px] font-bold text-[#162D24] border border-[#DDD8CC] uppercase">
                          {activeOutfit.occasion}
                        </span>
                        <span className="text-xs font-semibold text-neutral-400 capitalize">
                          {activeOutfit.style.replace('_', ' ')}
                        </span>
                      </div>
                      <h2 className="text-xl font-serif font-bold text-[#162D24]">
                        {activeOutfit.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {onAskAIToReview && (
                        <button
                          onClick={() => {
                            const summary = activeOutfit.slots
                              .filter(s => s.wardrobeItem || s.marketplaceProduct)
                              .map(s => s.wardrobeItem ? `${s.slotType}: ${s.wardrobeItem.name} (Lemari)` : `${s.slotType}: ${s.marketplaceProduct?.title} (Rp ${s.marketplaceProduct?.price.toLocaleString('id-ID')})`)
                              .join(', ');
                            onAskAIToReview(`Tolong analisis kecocokan paduan "${activeOutfit.title}": ${summary}. Bagaimana menurutmu dari segi harmoni warna dan acuan ukuran untukku?`);
                          }}
                          className="px-3 py-2 rounded-xl bg-[#162D24] hover:bg-[#203D31] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          title="Tanya Stylist untuk Analisis Paduan Ini"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#8EA89D]" />
                          <span>Tanya Stylist</span>
                        </button>
                      )}

                      <button
                        onClick={() => setIsSaveModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#D8D2C4] text-xs font-bold text-[#162D24] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Outfit</span>
                      </button>

                      <button
                        onClick={handleGenerateOutfit}
                        className="p-2 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#D8D2C4] text-[#162D24] transition-colors cursor-pointer"
                        title="Variasi Lain"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Outfit Slots Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                    {activeOutfit.slots.map((slot, idx) => {
                      const isOwned = slot.source === 'wardrobe';
                      const item = slot.wardrobeItem || slot.marketplaceProduct;
                      const title = slot.wardrobeItem?.name || slot.marketplaceProduct?.title || 'Pakaian';
                      const img = slot.wardrobeItem?.imageUrl || slot.marketplaceProduct?.imageUrl || '';
                      const price = slot.marketplaceProduct?.price;

                      return (
                        <div
                          key={idx}
                          className="bg-[#FAF9F5] rounded-2xl border border-[#DDD8CC] overflow-hidden flex flex-col justify-between group hover:border-[#162D24]/40 transition-colors"
                        >
                          {/* Image & Source Badge */}
                          <div className="aspect-3/4 relative overflow-hidden bg-neutral-100">
                            <img src={img} alt={title} className="w-full h-full object-cover" />
                            <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              isOwned ? 'bg-[#162D24] text-white' : 'bg-[#8EA89D] text-[#162D24]'
                            }`}>
                              {isOwned ? 'Milik Anda' : 'Katalog UMKM'}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between text-xs">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block capitalize">
                                {slot.slotType}
                              </span>
                              <h4 className="font-serif font-bold text-[11px] text-[#162D24] line-clamp-1" title={title}>
                                {title}
                              </h4>
                              {price ? (
                                <p className="text-[11px] font-bold text-[#162D24] mt-0.5">
                                  Rp {price.toLocaleString('id-ID')}
                                </p>
                              ) : (
                                <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                                  Sudah Tersedia
                                </p>
                              )}
                            </div>

                            {/* Slot Actions */}
                            <div className="pt-2 border-t border-neutral-200/60 flex items-center gap-1">
                              <button
                                onClick={() => handleOpenSwap(idx)}
                                className="flex-1 py-1 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-300 text-[10px] font-semibold text-[#162D24] transition-colors cursor-pointer"
                              >
                                Ganti
                              </button>

                              {!isOwned && slot.marketplaceProduct && (
                                <button
                                  onClick={() => onSelectProduct(slot.marketplaceProduct!)}
                                  className="p-1 rounded-lg bg-[#162D24] text-white hover:bg-[#203D31] transition-colors cursor-pointer"
                                  title="Lihat Detail Produk"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stylist Explanation & Why It Works Box */}
                  <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-[#DDD8CC] space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#162D24]"></div>
                      <h3 className="font-serif font-bold text-xs text-[#162D24] uppercase tracking-wider">
                        Catatan Paduan Gaya
                      </h3>
                    </div>

                    <p className="text-neutral-700 leading-relaxed">
                      {activeOutfit.explanation}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E4D9]">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-neutral-400 block">Kesesuaian Warna:</span>
                        <p className="text-neutral-600 text-[11px]">{activeOutfit.colorHarmonyNote}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-neutral-400 block">Kesesuaian Cuaca:</span>
                        <p className="text-neutral-600 text-[11px]">{activeOutfit.weatherNote}</p>
                      </div>
                    </div>
                  </div>

                  {/* Budget & Checkout Summary Strip */}
                  <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#DDD8CC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-600 font-medium">Estimasi Biaya Belanja Tambahan:</span>
                        <strong className="text-sm font-bold text-[#162D24]">
                          {activeOutfit.totalPrice > 0 
                            ? `Rp ${activeOutfit.totalPrice.toLocaleString('id-ID')}`
                            : 'Rp 0 (Menggunakan koleksi lemari Anda)'}
                        </strong>
                      </div>
                      {mode !== 'closet' && maxBudget && (
                        <p className="text-[10px] text-neutral-500">
                          {activeOutfit.totalPrice <= maxBudget 
                            ? `✓ Berada dalam target budget Rp ${maxBudget.toLocaleString('id-ID')} (Sisa Rp ${(maxBudget - activeOutfit.totalPrice).toLocaleString('id-ID')})`
                            : `Melebihi budget sebesar Rp ${(activeOutfit.totalPrice - maxBudget).toLocaleString('id-ID')}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onOpenSmartSize}
                        className="text-xs font-semibold text-[#162D24] underline hover:text-[#2D5A47] cursor-pointer"
                      >
                        Cek Ukuran Tubuh
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#D8D2C4] shadow-xs space-y-3">
                  <Shirt className="w-8 h-8 text-neutral-400 mx-auto" />
                  <h3 className="text-base font-serif font-bold text-[#162D24]">Siap Merancang Outfit?</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Pilih filter dan suasana di sebelah kiri, lalu klik tombol Hasilkan Rekomendasi Outfit.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SLOT SWAPPER MODAL */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#162D24] text-white px-6 py-4 flex items-center justify-between border-b border-[#254637]">
              <div>
                <h3 className="text-base font-serif font-bold tracking-tight text-white capitalize">
                  Ganti {activeOutfit?.slots[swappingSlotIndex || 0]?.slotType}
                </h3>
                <p className="text-[11px] text-[#A3BFB2]">
                  Pilih item alternatif dari lemari pribadi atau katalog marketplace
                </p>
              </div>
              <button
                onClick={() => setSwapModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#162D24]">
              {/* Closet Options */}
              {swapWardrobe.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#162D24]"></span>
                    <h4 className="text-xs font-serif font-bold text-[#162D24] uppercase">
                      Pilihan dari Lemari Anda ({swapWardrobe.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {swapWardrobe.map(w => (
                      <div
                        key={w.id}
                        onClick={() => handleSelectReplacement(w, 'wardrobe')}
                        className="bg-white rounded-xl p-2.5 border border-[#D8D2C4] hover:border-[#162D24] shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100 mb-2">
                          <img src={w.imageUrl} alt={w.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h5 className="font-serif font-bold text-xs text-[#162D24] truncate">{w.name}</h5>
                          <p className="text-[10px] text-neutral-500 truncate">{w.color} • {w.style}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Marketplace Options */}
              {swapMarketplace.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#E8E4D9]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#162D24]"></span>
                    <h4 className="text-xs font-serif font-bold text-[#162D24] uppercase">
                      Pilihan dari Katalog Marketplace ({swapMarketplace.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {swapMarketplace.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectReplacement(m, 'marketplace')}
                        className="bg-white rounded-xl p-2.5 border border-[#D8D2C4] hover:border-[#162D24] shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100 mb-2">
                          <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h5 className="font-serif font-bold text-xs text-[#162D24] truncate">{m.title}</h5>
                          <p className="text-[10px] text-neutral-500 truncate">{m.sellerName}</p>
                          <p className="text-xs font-bold text-[#162D24] mt-0.5">
                            Rp {m.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {swapWardrobe.length === 0 && swapMarketplace.length === 0 && (
                <div className="py-8 text-center text-xs text-neutral-500">
                  Tidak ada pakaian alternatif yang tersedia untuk slot ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAVE OUTFIT MODAL */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#D8D2C4] p-6 space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-[#162D24]">Simpan Outfit ke Koleksi</h3>
              <p className="text-xs text-neutral-500">Beri nama untuk paduan busana ini agar mudah dibuka kembali.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold block text-[#162D24]">Nama Outfit:</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Contoh: OOTD Kuliah Santai Denim"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#162D24] focus:outline-hidden focus:border-[#162D24]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#D8D2C4] text-xs font-bold text-[#162D24] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCurrentOutfit}
                className="flex-1 py-2.5 rounded-xl bg-[#162D24] text-white text-xs font-bold hover:bg-[#203D31] cursor-pointer"
              >
                Simpan Outfit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
