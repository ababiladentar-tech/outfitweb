'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  PlusCircle, 
  Package, 
  TrendingUp, 
  Trash2, 
  Eye, 
  EyeOff, 
  Ruler, 
  Sparkles,
  Link as LinkIcon,
  BarChart3,
  ExternalLink,
  MessageCircle,
  Bookmark,
  Share2,
  CheckCircle2,
  Sliders,
  Building,
  HeartHandshake
} from 'lucide-react';
import { UMKMProductPost, ProductConditionType, SellerType, FitPreferenceType, GarmentMeasurement, StoreProfile } from '@/types';
import { 
  getStoredProducts, 
  addNewProductListing, 
  toggleProductStock, 
  deleteProductListing,
  getStoreProfileByNameOrId,
  updateStoreProfile,
  getStoreTrafficStats,
  StoreTrafficStats
} from '@/data/marketplace-store';

interface SellerDashboardViewProps {
  currentUsername?: string;
  onShowToast: (text: string) => void;
  onNavigateExplore: () => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  currentUsername = 'Atelier Senja',
  onShowToast,
  onNavigateExplore
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'create' | 'traffic' | 'specs'>('listings');
  const [products, setProducts] = useState<UMKMProductPost[]>([]);
  const [trafficStats, setTrafficStats] = useState<StoreTrafficStats>({
    viewsCount: 1420,
    productImpressions: 5830,
    externalLinkClicks: 284,
    whatsappInquiries: 97,
    savedCount: 312
  });

  const [storeProfile, setStoreProfile] = useState<StoreProfile>({
    id: 'seller-atelier-senja',
    name: 'Atelier Senja',
    username: 'ateliersenja_bdg',
    avatarUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    city: 'Bandung',
    rating: 4.8,
    reviewCount: 98,
    sellerType: 'umkm',
    bio: 'Tailored denim & kemeja katun poplin modern untuk gaya smart casual Indonesia.',
    story: 'Atelier Senja lahir dari kecintaan kami terhadap perpaduan denim lokal dan tailoring klasik Bandung. Kami percaya setiap orang berhak memiliki setelan pakaian berpotongan tegas yang nyaman di iklim tropis. Di Outfitly, kami menghadirkan rilisan busana dengan spesifikasi ukuran sentimeter (cm) nyata.',
    foundedYear: '2020',
    productCount: 12,
    followerCount: 2180,
    contactNumber: '6281234567802',
    instagramHandle: '@ateliersenja.official',
    externalShopUrl: 'https://shopee.co.id'
  });

  const [title, setTitle] = useState('');
  const [sellerType, setSellerType] = useState<SellerType>('umkm');
  const [sellerName, setSellerName] = useState('Atelier Senja');
  const [sellerCity, setSellerCity] = useState('Bandung');
  const [sellerContact, setSellerContact] = useState('6281234567802');
  const [externalProductLink, setExternalProductLink] = useState('');
  const [category, setCategory] = useState<'top' | 'pants' | 'dress' | 'outerwear' | 'jeans' | 'bag' | 'shoes' | 'hijab'>('top');
  const [style, setStyle] = useState('smart_casual');
  const [colorFamily, setColorFamily] = useState<'black' | 'white' | 'brown' | 'blue' | 'green' | 'pink' | 'neutral'>('neutral');
  const [price, setPrice] = useState<number>(185000);
  const [originalPrice, setOriginalPrice] = useState<number>(275000);
  const [condition, setCondition] = useState<ProductConditionType>('new');
  const [usageDuration, setUsageDuration] = useState('Baru dengan Tag (Belum dipakai)');
  const [defectNotes, setDefectNotes] = useState('100% mulus standar jahit tailoring.');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Katun Poplin Premium');
  const [fitType, setFitType] = useState<FitPreferenceType>('regular');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80');

  const [isOneOfAKind, setIsOneOfAKind] = useState(false);
  const [sizeLabel, setSizeLabel] = useState('Size M (Fit Reguler)');
  const [chestBustCm, setChestBustCm] = useState<number>(98);
  const [waistCm, setWaistCm] = useState<number>(82);
  const [hipsCm, setHipsCm] = useState<number>(100);
  const [shoulderWidthCm, setShoulderWidthCm] = useState<number>(42);
  const [sleeveLengthCm, setSleeveLengthCm] = useState<number>(60);
  const [garmentLengthCm, setGarmentLengthCm] = useState<number>(68);

  const refreshData = () => {
    setProducts(getStoredProducts());
    setTrafficStats(getStoreTrafficStats());
    const profile = getStoreProfileByNameOrId(sellerName || currentUsername || 'Atelier Senja');
    if (profile) setStoreProfile(profile);
  };

  useEffect(() => {
    refreshData();
    const handleProdUpdate = () => refreshData();
    window.addEventListener('outfitly_products_updated', handleProdUpdate);
    window.addEventListener('outfitly_traffic_updated', handleProdUpdate);
    window.addEventListener('outfitly_store_profiles_updated', handleProdUpdate);
    return () => {
      window.removeEventListener('outfitly_products_updated', handleProdUpdate);
      window.removeEventListener('outfitly_traffic_updated', handleProdUpdate);
      window.removeEventListener('outfitly_store_profiles_updated', handleProdUpdate);
    };
  }, []);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();

    const availableSizes: GarmentMeasurement[] = [
      {
        sizeLabel: sizeLabel || 'All Size',
        chestBustCm: Number(chestBustCm) || undefined,
        waistCm: Number(waistCm) || undefined,
        hipsCm: Number(hipsCm) || undefined,
        shoulderWidthCm: Number(shoulderWidthCm) || undefined,
        sleeveLengthCm: Number(sleeveLengthCm) || undefined,
        garmentLengthCm: Number(garmentLengthCm) || undefined
      }
    ];

    addNewProductListing({
      sellerId: storeProfile.id || `seller-${sellerName.toLowerCase().replace(/\s+/g, '-')}`,
      sellerName: sellerName || storeProfile.name,
      sellerType,
      sellerCity: sellerCity || storeProfile.city,
      sellerRating: 5.0,
      sellerReviewCount: 1,
      sellerContact: sellerContact || storeProfile.contactNumber,
      externalLink: externalProductLink || storeProfile.externalShopUrl || undefined,
      title: title || 'Pakaian Fashion Pilihan',
      description: description || 'Pakaian berkualitas dengan jahitan rapi dan bahan nyaman.',
      category,
      style,
      colorFamily,
      colorHex: colorFamily === 'black' ? ['#1A1A1A'] : colorFamily === 'white' ? ['#FFFFFF'] : ['#8EA89D'],
      price: Number(price),
      originalPrice: Number(originalPrice) || undefined,
      condition,
      usageDuration: sellerType === 'community_preloved' ? usageDuration : undefined,
      defectNotes: sellerType === 'community_preloved' ? defectNotes : undefined,
      isOneOfAKind,
      stockCount: isOneOfAKind ? 1 : 12,
      isAvailable: true,
      availableSizes,
      fitType,
      measurementToleranceCm: 1.5,
      measurementMethod: 'Diukur flat lay presisi dalam sentimeter (cm)',
      imageUrl,
      material,
      tags: [category, style, sellerType === 'community_preloved' ? 'Preloved' : 'UMKM Lokal']
    });

    onShowToast('Produk dan link berhasil diterbitkan ke Katalog Penjualan!');
    setActiveTab('listings');
    setTitle('');
    setDescription('');
    setExternalProductLink('');
  };

  const handleSaveStoreSpecs = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile(storeProfile);
    onShowToast('Spesifikasi toko dan cerita UMKM berhasil disimpan!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn text-[#162D24]">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#162D24] text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8EA89D] text-[#162D24] text-xs font-bold uppercase tracking-wider mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>Dashboard Penjual & Mitra Outfitly</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            Pusat Penjualan & Katalog Toko
          </h1>
          <p className="text-xs sm:text-sm text-[#A3BFB2]">
            Kelola spesifikasi toko, upload produk berukuran cm nyata, dan pantau traffic viewers langsung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('specs')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-white/20"
          >
            <Building className="w-4 h-4 text-[#8EA89D]" />
            <span>Spesifikasi Toko</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2.5 bg-[#8EA89D] hover:bg-[#7D968C] text-[#162D24] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Produk & Link</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards - Traffic & Viewers Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Katalog</span>
            <Package className="w-4 h-4 text-[#162D24]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#162D24]">{products.length}</div>
          <span className="text-[11px] text-neutral-500">Item Produk Aktif</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase">Traffic Viewers</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">
            {trafficStats.viewsCount.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">+18% minggu ini</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase">Klik Link Penjualan</span>
            <ExternalLink className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#162D24]">
            {trafficStats.externalLinkClicks.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-neutral-500">Shopee / Tokped / WA</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase">Outfit Disimpan</span>
            <Bookmark className="w-4 h-4 text-[#8EA89D]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#162D24]">{trafficStats.savedCount}</div>
          <span className="text-[11px] text-neutral-500">Bookmark Pengguna</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#D8D2C4] mb-6 overflow-x-auto">
        {[
          { id: 'listings', label: `Katalog & Penjualan (${products.length})` },
          { id: 'traffic', label: 'Traffic & Analitik Viewers' },
          { id: 'specs', label: 'Spesifikasi & Profil Toko' },
          { id: 'create', label: '+ Upload Produk & Tautan' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-5 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#162D24] text-[#162D24] font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: KATALOG & PENJUALAN */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#162D24]">Katalog Produk & Penjualan Aktif:</h3>
              <p className="text-xs text-neutral-500">Atur ketersediaan stok, harga, dan link luar untuk calon pembeli.</p>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="text-xs font-bold text-[#2D5A47] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                  !p.isAvailable ? 'opacity-60 border-neutral-300' : 'border-[#E8E4D9] shadow-xs hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#DDD8CC] text-[10px] font-bold">
                      {p.sellerType === 'community_preloved' ? 'Preloved Komunitas' : p.sellerType === 'collab_mitra' ? 'Collab Mitra' : 'UMKM Baru'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.isAvailable ? 'Katalog Terbuka' : 'Stok Habis'}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center mb-3">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-20 h-20 rounded-2xl object-cover border border-[#E8E4D9]"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#162D24] line-clamp-1">{p.title}</h4>
                      <p className="text-xs font-extrabold text-[#162D24] mt-0.5">
                        Rp {p.price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Kondisi: <strong className="capitalize">{p.condition.replace('_', ' ')}</strong>
                      </p>
                      {p.externalLink && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-1 truncate">
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{p.externalLink}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Garment CM chart preview */}
                  <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E4D9] text-[11px] space-y-1 mb-3">
                    <div className="font-bold text-neutral-700 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-[#2D5A47]" />
                      <span>Ukuran Garment (CM):</span>
                    </div>
                    <div className="text-neutral-600">
                      {p.availableSizes.map(s => (
                        <span key={s.sizeLabel} className="mr-2 inline-block">
                          <strong>{s.sizeLabel}:</strong> {s.chestBustCm ? `LD ${s.chestBustCm}cm` : ''} {s.waistCm ? `LP ${s.waistCm}cm` : ''} {s.garmentLengthCm ? `Pjg ${s.garmentLengthCm}cm` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      toggleProductStock(p.id);
                      onShowToast(`Status ketersediaan ${p.title} diubah.`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl border border-[#DDD8CC] text-[11px] font-bold hover:bg-[#FAF9F5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {p.isAvailable ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Tandai Habis</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Buka Penjualan</span>
                      </>
                    )}
                  </button>

                  {p.externalLink && (
                    <button
                      onClick={() => window.open(p.externalLink, '_blank')}
                      className="p-2 rounded-xl border border-[#DDD8CC] text-[#162D24] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                      title="Buka Link Produk"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      deleteProductListing(p.id);
                      onShowToast('Produk berhasil dihapus dari katalog.');
                    }}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TRAFFIC PENJUALAN & TRAFFIC VIEWERS */}
      {activeTab === 'traffic' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4D9] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#F0EFEA]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#162D24]">Analitik Traffic Penjualan & Viewers</h3>
                <p className="text-xs text-neutral-500">Statistik pengunjung profil toko dan konversi klik pembelian.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EAF2EE] text-[#162D24] self-start sm:self-auto">
                Diperbarui Real-time
              </span>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9]">
                <div className="flex items-center justify-between text-neutral-500 mb-2">
                  <span className="text-xs font-bold uppercase">Traffic Viewers Toko</span>
                  <Eye className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-serif font-bold text-[#162D24]">
                  {trafficStats.viewsCount.toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Calon pembeli mengunjungi tokomu bulan ini</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9]">
                <div className="flex items-center justify-between text-neutral-500 mb-2">
                  <span className="text-xs font-bold uppercase">Impresi Produk di Feed</span>
                  <BarChart3 className="w-4 h-4 text-[#2D5A47]" />
                </div>
                <div className="text-3xl font-serif font-bold text-[#162D24]">
                  {trafficStats.productImpressions.toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Muncul di pencarian & kurasi outfit</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9]">
                <div className="flex items-center justify-between text-neutral-500 mb-2">
                  <span className="text-xs font-bold uppercase">Klik Tautan Luar (Shopee/WA)</span>
                  <ExternalLink className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-serif font-bold text-amber-800">
                  {trafficStats.externalLinkClicks.toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Tingkat konversi minat beli 4.8%</p>
              </div>
            </div>

            {/* Visual Growth Chart Indicator */}
            <div className="p-6 rounded-2xl bg-[#162D24] text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3BFB2]">Aktivitas Penjualan Minggu Ini</span>
                <span className="text-xs text-emerald-400 font-bold">+24% Pertumbuhan Viewers</span>
              </div>
              <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
                {[
                  { day: 'Sen', val: 45 },
                  { day: 'Sel', val: 62 },
                  { day: 'Rab', val: 58 },
                  { day: 'Kam', val: 80 },
                  { day: 'Jum', val: 95 },
                  { day: 'Sab', val: 120 },
                  { day: 'Min', val: 110 }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <div 
                      className="w-full bg-[#8EA89D] hover:bg-white rounded-t-lg transition-all"
                      style={{ height: `${(item.val / 120) * 100}%` }}
                      title={`${item.val} viewers`}
                    />
                    <span className="text-[10px] text-neutral-300">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SPESIFIKASI & PROFIL TOKO */}
      {activeTab === 'specs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4D9] shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-[#F0EFEA]">
            <h3 className="text-lg font-serif font-bold text-[#162D24]">Spesifikasi & Profil Toko UMKM</h3>
            <p className="text-xs text-neutral-500">
              Isi identitas toko, kota asal pengiriman, dan cerita awal mula mendirikan akun toko di Outfitly (ditampilkan ala Story IG saat pembeli mengklik akun toko).
            </p>
          </div>

          <form onSubmit={handleSaveStoreSpecs} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1">Nama Toko / Brand:</label>
                <input
                  type="text"
                  required
                  value={storeProfile.name}
                  onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24] font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Username Akun Toko:</label>
                <input
                  type="text"
                  required
                  value={storeProfile.username}
                  onChange={(e) => setStoreProfile({ ...storeProfile, username: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Kota Asal Pengiriman:</label>
                <input
                  type="text"
                  required
                  value={storeProfile.city}
                  onChange={(e) => setStoreProfile({ ...storeProfile, city: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Kategori Toko:</label>
                <select
                  value={storeProfile.sellerType}
                  onChange={(e) => setStoreProfile({ ...storeProfile, sellerType: e.target.value as any })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                >
                  <option value="umkm">Brand UMKM Lokal Indonesia</option>
                  <option value="collab_mitra">Collab Mitra / Curated Vintage</option>
                  <option value="community_preloved">Preloved Komunitas Thrift</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Nomor WhatsApp Toko (format 628...):</label>
                <input
                  type="text"
                  required
                  value={storeProfile.contactNumber}
                  onChange={(e) => setStoreProfile({ ...storeProfile, contactNumber: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Akun Instagram Toko:</label>
                <input
                  type="text"
                  placeholder="@tokokamu.id"
                  value={storeProfile.instagramHandle || ''}
                  onChange={(e) => setStoreProfile({ ...storeProfile, instagramHandle: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold block mb-1">Tautan Toko Luar (Shopee / Tokopedia / Website):</label>
                <input
                  type="url"
                  placeholder="https://shopee.co.id/tokokamu atau https://tokopedia.com/..."
                  value={storeProfile.externalShopUrl || ''}
                  onChange={(e) => setStoreProfile({ ...storeProfile, externalShopUrl: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold block mb-1">Bio Singkat Toko:</label>
                <input
                  type="text"
                  value={storeProfile.bio}
                  onChange={(e) => setStoreProfile({ ...storeProfile, bio: e.target.value })}
                  placeholder="Deskripsi satu kalimat mengenai spesialisasi busanamu..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              {/* Cerita Kenapa Buka Akun UMKM (Mirip IG Story) */}
              <div className="sm:col-span-2 p-5 rounded-2xl bg-[#FFF8E6] border border-[#F0DFB0] space-y-2">
                <label className="text-xs font-bold block text-amber-900">
                  Cerita Kami: Mengapa Bergabung di Outfitly (Kisah Toko UMKM)
                </label>
                <p className="text-[11px] text-neutral-600">
                  Cerita ini akan ditampilkan kepada pembeli saat mereka membuka profil tokomu. Tuliskan latar belakang, misi karya lokal, dan dedikasimu.
                </p>
                <textarea
                  rows={4}
                  value={storeProfile.story}
                  onChange={(e) => setStoreProfile({ ...storeProfile, story: e.target.value })}
                  placeholder="Tuliskan cerita inspirasi tokomu..."
                  className="w-full bg-white border border-[#E8DFC0] rounded-xl p-3 text-xs text-[#162D24] leading-relaxed"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#162D24] hover:bg-[#203D31] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Simpan Spesifikasi & Profil Toko
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: UPLOAD PRODUK & PEMBERIAN LINK */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4D9] shadow-sm max-w-4xl mx-auto">
          <div className="border-b border-neutral-100 pb-4 mb-6">
            <h3 className="text-xl font-bold font-serif text-[#162D24]">Upload Produk & Pemberian Link Luar</h3>
            <p className="text-xs text-neutral-500">
              Lengkapi detail barang, ukuran sentimeter nyata (cm), dan tautan marketplace (Shopee/Tokopedia/WA) agar pembeli dapat langsung memesan.
            </p>
          </div>

          <form onSubmit={handleCreateListing} className="space-y-6">
            {/* 1. Informasi Dasar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold block mb-1">Judul Produk Pakaian:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Kemeja Boxy Denim Washed Indigo"
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24] font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Tipe Penjual:</label>
                <select
                  value={sellerType}
                  onChange={(e) => setSellerType(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                >
                  <option value="umkm">Brand UMKM Lokal Indonesia</option>
                  <option value="collab_mitra">Collab Mitra / Curated Vintage</option>
                  <option value="community_preloved">Preloved Komunitas Thrift</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Kategori Pakaian:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                >
                  <option value="top">Atasan / Tops / Kemeja</option>
                  <option value="outerwear">Outerwear / Jaket / Blazer</option>
                  <option value="pants">Celana / Trousers / Chino</option>
                  <option value="jeans">Jeans Denim</option>
                  <option value="dress">Dress / Gaun</option>
                  <option value="bag">Tas / Handbag</option>
                  <option value="shoes">Sepatu / Alas Kaki</option>
                  <option value="hijab">Hijab / Scarf</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Harga Produk (Rp):</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs font-bold text-[#162D24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Harga Asli / Pembanding (Rp):</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  placeholder="Opsional (untuk diskon)"
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              {/* Pemberian Link Luar */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-[#EAF2EE] border border-[#C5DDD2] space-y-2">
                <label className="text-xs font-bold flex items-center gap-1.5 text-[#162D24]">
                  <LinkIcon className="w-4 h-4 text-[#2D5A47]" />
                  <span>Pemberian Link Luar (Shopee / Tokopedia / WhatsApp):</span>
                </label>
                <p className="text-[11px] text-neutral-600">
                  Masukkan link toko atau checkout langsung agar pembeli yang tertarik dapat langsung mengklik dan melakukan transaksi.
                </p>
                <input
                  type="url"
                  value={externalProductLink}
                  onChange={(e) => setExternalProductLink(e.target.value)}
                  placeholder="https://shopee.co.id/... atau https://tokopedia.com/... atau https://wa.me/..."
                  className="w-full bg-white border border-[#BFD9CD] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>
            </div>

            {/* 2. Detail Barang & Kondisi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1">Material / Bahan:</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Contoh: Katun Poplin, Denim 13oz"
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Kondisi Barang:</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                >
                  <option value="new">Brand Brand (Baru dengan Tag)</option>
                  <option value="like_new">Like New (99% Mulus seperti baru)</option>
                  <option value="very_good">Very Good (Pemakaian wajar terawat)</option>
                  <option value="good">Good (Ada jejak pemakaian minor)</option>
                  <option value="has_defects">Has Defects (Ada defek tertera jelas)</option>
                </select>
              </div>
            </div>

            {/* 3. Detail Ukuran Garment (Sentimeter - CM) */}
            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#162D24] font-bold text-xs">
                  <Ruler className="w-4 h-4 text-[#2D5A47]" />
                  <span>Detail Ukuran Garment (Sentimeter - CM)</span>
                </div>
                <span className="text-[10px] text-neutral-500">Diukur Flat Lay di Atas Meja</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Label Ukuran:</label>
                  <input
                    type="text"
                    value={sizeLabel}
                    onChange={(e) => setSizeLabel(e.target.value)}
                    placeholder="Contoh: Size M atau Size 30"
                    className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs font-bold text-[#162D24]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1">Lingkar Dada (LD):</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={chestBustCm}
                      onChange={(e) => setChestBustCm(Number(e.target.value))}
                      className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs text-[#162D24]"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1">Lingkar Pinggang (LP):</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={waistCm}
                      onChange={(e) => setWaistCm(Number(e.target.value))}
                      className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs text-[#162D24]"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1">Lebar Bahu:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={shoulderWidthCm}
                      onChange={(e) => setShoulderWidthCm(Number(e.target.value))}
                      className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs text-[#162D24]"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1">Panjang Baju:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={garmentLengthCm}
                      onChange={(e) => setGarmentLengthCm(Number(e.target.value))}
                      className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs text-[#162D24]"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1">Potongan Fit:</label>
                  <select
                    value={fitType}
                    onChange={(e) => setFitType(e.target.value as any)}
                    className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs text-[#162D24]"
                  >
                    <option value="slim">Slim Fit</option>
                    <option value="regular">Regular Fit</option>
                    <option value="relaxed">Relaxed Fit</option>
                    <option value="oversized">Oversized / Boxy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Foto & Deskripsi Barang */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">URL Foto Produk:</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Deskripsi Detail Barang:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan karakteristik bahan, kenyamanan pemakaian, dan keunikan potongan..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl p-3 text-xs text-[#162D24]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#162D24] hover:bg-[#203D31] text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#8EA89D]" />
              <span>Terbitkan Produk ke Katalog Penjualan</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
