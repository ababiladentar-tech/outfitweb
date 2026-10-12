'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Layers, 
  ArrowRight,
  Shirt,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Tag,
  Palette
} from 'lucide-react';
import { WardrobeItem, WardrobeCategory, StyleVibeType } from '@/types';
import { 
  getStoredWardrobe, 
  addWardrobeItem, 
  updateWardrobeItem, 
  deleteWardrobeItem,
  resetToDefaultWardrobe 
} from '@/data/wardrobe-store';
import { analyzeClothingImage, AnalysisResult } from '@/lib/image-clothing-analyzer';

interface WardrobeViewProps {
  embedded?: boolean;
  currentUserId?: string;
  onNavigateOutfitBuilder: (preselectedItems?: WardrobeItem[]) => void;
  onShowToast: (message: string) => void;
}

const CATEGORIES: Array<{ key: WardrobeCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Semua Koleksi' },
  { key: 'tops', label: 'Atasan' },
  { key: 'bottoms', label: 'Bawahan' },
  { key: 'outerwear', label: 'Luaran / Jaket' },
  { key: 'dresses', label: 'Dress' },
  { key: 'shoes', label: 'Sepatu' },
  { key: 'bags', label: 'Tas' },
  { key: 'accessories', label: 'Aksesoris' }
];

const PRESET_SAMPLE_PHOTOS = [
  { name: 'Kemeja Putih Poplin', category: 'tops' as WardrobeCategory, url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80', color: 'Putih Bersih', colorHex: '#FDFDFD' },
  { name: 'Denim Jeans Biru Indigo', category: 'bottoms' as WardrobeCategory, url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80', color: 'Biru Navy', colorHex: '#1B2A4A' },
  { name: 'Jaket Denim Washed', category: 'outerwear' as WardrobeCategory, url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', color: 'Biru Muda', colorHex: '#7BA0C0' },
  { name: 'Sneakers Kanvas Putih', category: 'shoes' as WardrobeCategory, url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80', color: 'Putih Bersih', colorHex: '#F8F8F6' },
  { name: 'Tote Bag Kanvas Hitam', category: 'bags' as WardrobeCategory, url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', color: 'Hitam', colorHex: '#1C1C1C' },
  { name: 'Kaos Sage Green Katun', category: 'tops' as WardrobeCategory, url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', color: 'Hijau Sage', colorHex: '#7D988D' }
];

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  embedded = false,
  currentUserId = 'default_user',
  onNavigateOutfitBuilder,
  onShowToast
}) => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WardrobeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'category'>('newest');

  // Multi-select for outfit creation
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Add / Edit Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    category: 'tops' as WardrobeCategory,
    imageUrl: '',
    color: 'Putih',
    colorHex: '#FDFDFD',
    pattern: 'solid' as const,
    style: 'casual',
    season: 'all_season' as const,
    brand: '',
    sizeLabel: '',
    notes: ''
  });

  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load wardrobe on mount & listen to updates
  useEffect(() => {
    const loadItems = () => {
      const stored = getStoredWardrobe(currentUserId);
      setItems(stored);
    };
    loadItems();

    const handleUpdate = () => loadItems();
    window.addEventListener('outfitly_wardrobe_updated', handleUpdate);
    return () => window.removeEventListener('outfitly_wardrobe_updated', handleUpdate);
  }, [currentUserId]);

  // Handle Image File Upload (converts to persistent Base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setFormError('Ukuran foto terlalu besar (maksimal 4 MB)');
      return;
    }

    setFormError(null);
    setIsAnalyzingImage(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setFormData(prev => ({ ...prev, imageUrl: dataUrl }));

      try {
        const result = await analyzeClothingImage(dataUrl);
        setAnalysisInfo(result);
        setFormData(prev => ({
          ...prev,
          color: result.colorName || prev.color,
          colorHex: result.colorHex || prev.colorHex,
          category: (result.suggestedCategory as WardrobeCategory) || prev.category,
          style: result.suggestedStyle || prev.style
        }));
      } catch (err) {
        console.warn('Image analysis error:', err);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Preset sample image handler
  const handleSelectPresetSample = async (sample: typeof PRESET_SAMPLE_PHOTOS[0]) => {
    setFormData(prev => ({
      ...prev,
      name: prev.name || sample.name,
      category: sample.category,
      imageUrl: sample.url,
      color: sample.color,
      colorHex: sample.colorHex
    }));
    setAnalysisInfo({
      colorName: sample.color,
      colorHex: sample.colorHex,
      isAiVisionConnected: false,
      confidence: 'client_heuristic',
      statusMessage: `Sampel ${sample.name} dimuat dengan palet warna ${sample.color}.`
    });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'tops',
      imageUrl: '',
      color: 'Putih Bersih',
      colorHex: '#FDFDFD',
      pattern: 'solid',
      style: 'casual',
      season: 'all_season',
      brand: '',
      sizeLabel: '',
      notes: ''
    });
    setAnalysisInfo(null);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: WardrobeItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      color: item.color,
      colorHex: item.colorHex || '#162D24',
      pattern: (item.pattern as any) || 'solid',
      style: item.style,
      season: (item.season as any) || 'all_season',
      brand: item.brand || '',
      sizeLabel: item.sizeLabel || '',
      notes: item.notes || ''
    });
    setAnalysisInfo(null);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nama pakaian harus diisi.');
      return;
    }
    if (!formData.imageUrl) {
      setFormError('Pilih atau unggah foto pakaian terlebih dahulu.');
      return;
    }

    if (editingItem) {
      updateWardrobeItem(editingItem.id, {
        name: formData.name.trim(),
        category: formData.category,
        imageUrl: formData.imageUrl,
        color: formData.color,
        colorHex: formData.colorHex,
        pattern: formData.pattern,
        style: formData.style,
        season: formData.season,
        brand: formData.brand.trim() || undefined,
        sizeLabel: formData.sizeLabel.trim() || undefined,
        notes: formData.notes.trim() || undefined
      });
      onShowToast(`Pakaian "${formData.name}" berhasil diperbarui.`);
    } else {
      addWardrobeItem({
        userId: currentUserId,
        name: formData.name.trim(),
        category: formData.category,
        imageUrl: formData.imageUrl,
        color: formData.color,
        colorHex: formData.colorHex,
        pattern: formData.pattern,
        style: formData.style,
        season: formData.season,
        brand: formData.brand.trim() || undefined,
        sizeLabel: formData.sizeLabel.trim() || undefined,
        notes: formData.notes.trim() || undefined
      });
      onShowToast(`Pakaian "${formData.name}" berhasil ditambahkan ke lemari.`);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Hapus "${name}" dari lemari digital Anda?`)) {
      deleteWardrobeItem(id);
      setSelectedItemIds(prev => prev.filter(item => item !== id));
      onShowToast(`Pakaian "${name}" dihapus dari lemari.`);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter & Search Logic
  const filteredItems = items
    .filter(item => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Launch Outfit Builder with selected items
  const handleBuildFromSelection = () => {
    const preselected = items.filter(i => selectedItemIds.includes(i.id));
    onNavigateOutfitBuilder(preselected);
  };

  return (
    <div className={embedded ? "w-full text-[#162D24]" : "min-h-[calc(100vh-80px)] bg-[#EFEFEA] text-[#162D24] py-7 px-4 sm:px-6 lg:px-8"}>
      <div className={embedded ? "space-y-6" : "max-w-7xl mx-auto space-y-7"}>
        {/* Header */}
        {embedded ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#D8D2C4]/60">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#162D24]">
                Lemari Saya
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                {items.length} pakaian tersimpan • Padukan item yang sudah kamu punya
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectedItemIds.length > 0 && (
                <button
                  onClick={handleBuildFromSelection}
                  className="px-4 py-2.5 rounded-xl bg-[#162D24] hover:bg-[#203F33] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#8EA89D]" />
                  <span>Padukan Gaya ({selectedItemIds.length})</span>
                </button>
              )}

              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 rounded-xl bg-[#162D24] hover:bg-[#203F33] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#8EA89D]" />
                <span>Tambah Pakaian</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#162D24] text-white rounded-3xl p-6 sm:p-9 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#254637]">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                Lemari Saya
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
                Simpan koleksi pakaianmu dan temukan paduan baru dari item yang sudah kamu punya.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectedItemIds.length > 0 && (
                <button
                  onClick={handleBuildFromSelection}
                  className="px-4 py-2.5 rounded-xl bg-[#8EA89D] hover:bg-[#A3BFB2] text-[#162D24] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#162D24]" />
                  <span>Padukan Gaya ({selectedItemIds.length})</span>
                </button>
              )}

              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] text-[#162D24] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pakaian</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar & Controls */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8D2C4] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pakaian, warna, atau merk..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF9F5] border border-[#DDD8CC] text-xs text-[#162D24] placeholder:text-neutral-400 focus:outline-hidden focus:border-[#162D24]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#162D24]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & Multi-Select Indicator */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#DDD8CC] text-xs font-medium text-[#162D24] cursor-pointer"
              >
                <option value="newest">Urutkan: Terbaru</option>
                <option value="name">Urutkan: Nama A-Z</option>
                <option value="category">Urutkan: Kategori</option>
              </select>

              {items.length === 0 && (
                <button
                  onClick={() => {
                    resetToDefaultWardrobe();
                    onShowToast('Koleksi contoh lemari berhasil dimuat.');
                  }}
                  className="px-3 py-2 rounded-xl bg-[#F4F1EA] hover:bg-[#EAE6DC] text-[11px] font-semibold text-[#162D24] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Muat Sampel Lemari</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const count = cat.key === 'all' 
                ? items.length 
                : items.filter(i => i.category === cat.key).length;

              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#162D24] text-white shadow-2xs'
                      : 'bg-[#FAF9F5] text-neutral-600 hover:bg-[#F2EFE8] hover:text-[#162D24]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-neutral-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Select Action Banner (if active) */}
        {selectedItemIds.length > 0 && (
          <div className="bg-[#162D24] text-white p-4 rounded-2xl flex items-center justify-between shadow-md animate-fadeIn">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#8EA89D]"></span>
              <span><strong>{selectedItemIds.length} pakaian</strong> dipilih untuk dijadikan paduan outfit.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedItemIds([])}
                className="px-3 py-1 text-xs text-neutral-300 hover:text-white underline cursor-pointer"
              >
                Batal Pilih
              </button>
              <button
                onClick={handleBuildFromSelection}
                className="px-4 py-1.5 bg-[#8EA89D] hover:bg-[#A3BFB2] text-[#162D24] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Padukan Gaya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Closet Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D8D2C4] shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] text-neutral-400 flex items-center justify-center mx-auto border border-[#E5E0D5]">
              <Shirt className="w-7 h-7 text-[#2D5A47]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#162D24]">
                {items.length === 0 ? 'Lemari kamu masih kosong.' : 'Tidak Ada Pakaian yang Cocok'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {items.length === 0 
                  ? 'Tambahkan pakaian pertamamu untuk mulai memadukan gaya.'
                  : 'Coba ubah kata kunci pencarian atau pilih kategori yang berbeda.'}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-[#162D24] hover:bg-[#203D31] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tambah Pakaian
              </button>
              {items.length === 0 && (
                <button
                  onClick={() => {
                    resetToDefaultWardrobe();
                    onShowToast('Koleksi contoh lemari berhasil dimuat.');
                  }}
                  className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#EAE8E0] text-[#162D24] border border-[#D8D2C4] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Muat Contoh Pakaian
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`group bg-white rounded-2xl overflow-hidden border transition-all flex flex-col justify-between relative ${
                    isSelected 
                      ? 'border-[#162D24] ring-2 ring-[#162D24] shadow-md' 
                      : 'border-[#D8D2C4] hover:border-[#162D24]/40 shadow-2xs hover:shadow-sm'
                  }`}
                >
                  {/* Select Checkbox Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(item.id);
                    }}
                    className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#162D24] text-white'
                        : 'bg-white/85 text-neutral-400 hover:text-[#162D24] border border-black/10'
                    }`}
                    title={isSelected ? 'Batal pilih' : 'Pilih untuk outfit'}
                  >
                    <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`} />
                  </button>

                  {/* Actions Dropdown on Hover */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                      className="w-6 h-6 rounded-lg bg-white/90 hover:bg-white text-neutral-600 hover:text-[#162D24] border border-black/10 flex items-center justify-center shadow-2xs cursor-pointer"
                      title="Edit pakaian"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id, item.name);
                      }}
                      className="w-6 h-6 rounded-lg bg-white/90 hover:bg-rose-50 text-neutral-600 hover:text-rose-700 border border-black/10 flex items-center justify-center shadow-2xs cursor-pointer"
                      title="Hapus pakaian"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Image */}
                  <div 
                    onClick={() => toggleSelectItem(item.id)}
                    className="aspect-3/4 overflow-hidden bg-neutral-100 relative cursor-pointer"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    {/* Category Tag Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#162D24]/85 text-white text-[9px] font-semibold backdrop-blur-xs capitalize">
                      {item.category}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-xs text-[#162D24] line-clamp-1 group-hover:text-[#2D5A47]">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-neutral-500 line-clamp-1">
                        {item.brand ? `${item.brand} • ` : ''}{item.color}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[9px] text-neutral-400">
                      <span className="capitalize">{item.style.replace('_', ' ')}</span>
                      {item.sizeLabel && <span className="font-bold text-neutral-600">Size {item.sizeLabel}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Clothing Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-[#162D24] text-white px-6 py-4 flex items-center justify-between border-b border-[#254637]">
              <div>
                <h3 className="text-base font-serif font-bold tracking-tight text-white">
                  {editingItem ? 'Edit Informasi Pakaian' : 'Tambah Pakaian ke Lemari'}
                </h3>
                <p className="text-[11px] text-[#A3BFB2]">
                  Lengkapi foto dan spesifikasi pakaian untuk memudahkan paduan outfit
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-5 flex-1 text-[#162D24]">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold block text-[#162D24]">
                  Foto Pakaian <span className="text-rose-600">*</span>
                </label>

                {formData.imageUrl ? (
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#D8D2C4] bg-neutral-100 group">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white text-[#162D24] text-xs font-bold shadow-sm hover:bg-[#FAF9F5] cursor-pointer"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-700 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-4/3 rounded-2xl border-2 border-dashed border-[#C8C2B3] hover:border-[#162D24] bg-white flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors space-y-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] flex items-center justify-center text-[#2D5A47]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#162D24]">
                        Klik untuk unggah foto pakaian
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Format JPG, PNG, atau WebP (maksimal 4 MB)
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Quick Presets for Convenient Testing */}
                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-neutral-500 block mb-1">
                    Atau pilih sampel foto pakaian siap pakai:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SAMPLE_PHOTOS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPresetSample(sample)}
                        className="px-2 py-1 rounded-md bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#DDD8CC] text-[10px] font-medium text-[#162D24] transition-colors cursor-pointer"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Detection Feedback Box */}
                {isAnalyzingImage && (
                  <div className="p-2.5 rounded-xl bg-[#EAF2EE] border border-[#BFD9CD] text-[11px] text-[#162D24] flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2D5A47]" />
                    <span>Mendeteksi warna dominan pakaian...</span>
                  </div>
                )}

                {analysisInfo && !isAnalyzingImage && (
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E0DCCF] text-[11px] text-[#162D24] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Palette className="w-3.5 h-3.5 text-[#2D5A47]" />
                      <span>Deteksi Warna: {analysisInfo.colorName}</span>
                      <span 
                        className="w-3 h-3 rounded-full border border-black/20" 
                        style={{ backgroundColor: analysisInfo.colorHex }} 
                      />
                    </div>
                    <p className="text-neutral-600 text-[10px] leading-relaxed">
                      {analysisInfo.statusMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Item Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold block text-[#162D24]">
                  Nama Pakaian <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Kemeja Linen Putih Kerah Terbuka"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#162D24] placeholder:text-neutral-400 focus:outline-hidden focus:border-[#162D24]"
                />
              </div>

              {/* Category & Style */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold block text-[#162D24]">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs font-medium text-[#162D24] cursor-pointer"
                  >
                    <option value="tops">Atasan (Tops)</option>
                    <option value="bottoms">Bawahan (Bottoms)</option>
                    <option value="outerwear">Luaran (Outerwear)</option>
                    <option value="dresses">Dress (Terusan)</option>
                    <option value="shoes">Sepatu (Shoes)</option>
                    <option value="bags">Tas (Bags)</option>
                    <option value="accessories">Aksesoris</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold block text-[#162D24]">Gaya (Vibe)</label>
                  <select
                    value={formData.style}
                    onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs font-medium text-[#162D24] cursor-pointer"
                  >
                    <option value="casual">Casual Santai</option>
                    <option value="minimalist">Minimalist Clean</option>
                    <option value="formal">Formal / Smart</option>
                    <option value="streetwear">Streetwear Edgy</option>
                    <option value="vintage_retro">Vintage Retro</option>
                    <option value="etnik_batik_modern">Etnik Modern</option>
                  </select>
                </div>
              </div>

              {/* Color & Pattern */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold block text-[#162D24]">Warna Dominan</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Contoh: Biru Navy, Sage Green"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#162D24] focus:outline-hidden focus:border-[#162D24]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold block text-[#162D24]">Motif / Pola</label>
                  <select
                    value={formData.pattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, pattern: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs font-medium text-[#162D24] cursor-pointer"
                  >
                    <option value="solid">Polos (Solid)</option>
                    <option value="stripes">Garis-garis (Stripes)</option>
                    <option value="plaid">Kotak-kotak (Plaid/Tartan)</option>
                    <option value="batik">Batik / Etnik</option>
                    <option value="floral">Bunga (Floral)</option>
                    <option value="graphic">Grafis / Sablon</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Brand & Size Label */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold block text-[#162D24]">Merk / Brand (Opsional)</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Contoh: Zara, Uniqlo, Thrift"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#162D24] focus:outline-hidden focus:border-[#162D24]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold block text-[#162D24]">Label Ukuran (Opsional)</label>
                  <input
                    type="text"
                    value={formData.sizeLabel}
                    onChange={(e) => setFormData(prev => ({ ...prev, sizeLabel: e.target.value }))}
                    placeholder="Contoh: M, 30, EU 40"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#162D24] focus:outline-hidden focus:border-[#162D24]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold block text-[#162D24]">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Contoh: Bahan agak tebal, cocok untuk ruangan AC."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#162D24] placeholder:text-neutral-400 focus:outline-hidden focus:border-[#162D24] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#D8D2C4] text-xs font-bold text-[#162D24] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#162D24] hover:bg-[#203D31] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan ke Lemari'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
