'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  PlusCircle, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Ruler, 
  Check, 
  AlertCircle, 
  Sparkles,
  Truck,
  ShieldAlert,
  Search
} from 'lucide-react';
import { UMKMProductPost, ProductConditionType, SellerType, FitPreferenceType, GarmentMeasurement, MarketplaceOrder } from '@/types';
import { 
  getStoredProducts, 
  addNewProductListing, 
  updateProductListing, 
  toggleProductStock, 
  deleteProductListing,
  getStoredOrders,
  updateOrderStatus,
  getStoredReports,
  moderateProductListing,
  ListingReport
} from '@/data/marketplace-store';

interface SellerDashboardViewProps {
  currentUsername?: string;
  onShowToast: (text: string) => void;
  onNavigateExplore: () => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  currentUsername = 'Penjual Outfitly',
  onShowToast,
  onNavigateExplore
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'create' | 'orders' | 'moderation'>('listings');
  const [products, setProducts] = useState<UMKMProductPost[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [shippingResiMap, setShippingResiMap] = useState<Record<string, string>>({});

  // Listing Form State
  const [title, setTitle] = useState('');
  const [sellerType, setSellerType] = useState<SellerType>('community_preloved');
  const [sellerName, setSellerName] = useState(currentUsername || 'Lemari Preloved');
  const [sellerCity, setSellerCity] = useState('Jakarta Selatan');
  const [sellerContact, setSellerContact] = useState('6281234567890');
  const [category, setCategory] = useState<'top' | 'pants' | 'dress' | 'outerwear' | 'jeans' | 'bag' | 'shoes' | 'hijab'>('top');
  const [style, setStyle] = useState('casual');
  const [colorFamily, setColorFamily] = useState<'black' | 'white' | 'brown' | 'blue' | 'green' | 'pink' | 'neutral'>('black');
  const [price, setPrice] = useState<number>(125000);
  const [originalPrice, setOriginalPrice] = useState<number>(250000);
  const [condition, setCondition] = useState<ProductConditionType>('like_new');
  const [usageDuration, setUsageDuration] = useState('Pemakaian 2-3x acara santai');
  const [defectNotes, setDefectNotes] = useState('Kondisi sangat mulus terawat, tidak ada noda atau lubang.');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Katun Poplin / Denim');
  const [fitType, setFitType] = useState<FitPreferenceType>('regular');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80');

  // Garment Measurements State (CM)
  const [isOneOfAKind, setIsOneOfAKind] = useState(true);
  const [sizeLabel, setSizeLabel] = useState('Size M (Fit Reguler)');
  const [chestBustCm, setChestBustCm] = useState<number>(96);
  const [waistCm, setWaistCm] = useState<number>(80);
  const [hipsCm, setHipsCm] = useState<number>(98);
  const [shoulderWidthCm, setShoulderWidthCm] = useState<number>(40);
  const [sleeveLengthCm, setSleeveLengthCm] = useState<number>(58);
  const [garmentLengthCm, setGarmentLengthCm] = useState<number>(66);

  const refreshData = () => {
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());
    setReports(getStoredReports());
  };

  useEffect(() => {
    refreshData();
    const handleProdUpdate = () => refreshData();
    window.addEventListener('outfitly_products_updated', handleProdUpdate);
    window.addEventListener('outfitly_orders_updated', handleProdUpdate);
    window.addEventListener('outfitly_reports_updated', handleProdUpdate);
    return () => {
      window.removeEventListener('outfitly_products_updated', handleProdUpdate);
      window.removeEventListener('outfitly_orders_updated', handleProdUpdate);
      window.removeEventListener('outfitly_reports_updated', handleProdUpdate);
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
      sellerId: `user-${currentUsername.toLowerCase().replace(/\s+/g, '-')}`,
      sellerName: sellerName || currentUsername,
      sellerType,
      sellerCity,
      sellerRating: 5.0,
      sellerReviewCount: 1,
      sellerContact,
      title: title || 'Pakaian Fashion Pilihan',
      description: description || 'Pakaian berkualitas dengan potongan rapi dan bahan nyaman.',
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
      stockCount: isOneOfAKind ? 1 : 10,
      isAvailable: true,
      availableSizes,
      fitType,
      measurementToleranceCm: 1.5,
      measurementMethod: 'Diukur flat lay presisi dalam sentimeter (cm)',
      imageUrl,
      material,
      tags: [category, style, sellerType === 'community_preloved' ? 'Preloved' : 'UMKM Baru']
    });

    onShowToast('Listing produk Anda berhasil diterbitkan ke Marketplace Outfitly!');
    setActiveTab('listings');
    // Reset form
    setTitle('');
    setDescription('');
  };

  const handleShipOrder = (orderId: string) => {
    const resi = shippingResiMap[orderId] || `JP${Date.now().toString().slice(-8)}`;
    updateOrderStatus(orderId, 'shipped', { trackingNumber: resi });
    onShowToast(`Pesanan telah ditandai dikirim dengan nomor resi: ${resi}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn text-[#162D24]">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#162D24] text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8EA89D] text-[#162D24] text-xs font-bold uppercase tracking-wider mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>Outfitly Multi-Seller Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            Pusat Penjual & Lemari Komunitas
          </h1>
          <p className="text-xs sm:text-sm text-[#A3BFB2]">
            Kelola produk UMKM & preloved thrift Anda dengan sistem pengukuran sentimeter (cm) transparan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2.5 bg-[#162D24] hover:bg-[#203F33] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#8EA89D]" />
            <span>Buka Listing Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Listing</span>
            <Package className="w-4 h-4 text-[#162D24]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#162D24]">{products.length}</div>
          <span className="text-[11px] text-neutral-500">Produk Terdaftar</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase">Pesanan Masuk</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#162D24]">{orders.length}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Transaksi Rekber Aktif</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase">Estimasi Saldo Escrow</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#162D24]">
            Rp {orders.reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-neutral-500">Tertahan Aman di Rekber</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase">Status Toko</span>
            <Store className="w-4 h-4 text-[#8EA89D]" />
          </div>
          <div className="text-sm font-bold text-[#162D24] mt-1">Akun Terverifikasi</div>
          <span className="text-[11px] text-neutral-500">Buyer & Seller Aktif</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8D2C4] mb-6 overflow-x-auto">
        {[
          { id: 'listings', label: `Kelola Produk (${products.length})` },
          { id: 'create', label: 'Tambah Listing Baru' },
          { id: 'orders', label: `Pesanan Masuk (${orders.length})` },
          { id: 'moderation', label: `Moderasi Laporan (${reports.filter(r => r.status === 'pending').length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-5 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-[#162D24] text-[#162D24]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Manage Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-[#162D24]">Daftar Katalog Produk Anda:</h3>
            <span className="text-xs text-neutral-500">Katalog disinkronkan secara realtime</span>
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
                      {p.sellerType === 'community_preloved' ? 'Preloved Komunitas' : 'UMKM Baru'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.isAvailable ? 'Ready Stock' : 'Stok Habis'}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center mb-3">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-18 h-18 rounded-2xl object-cover border border-[#E8E4D9]"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#162D24] line-clamp-1">{p.title}</h4>
                      <p className="text-xs font-extrabold text-[#162D24] mt-0.5">
                        Rp {p.price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Kondisi: <strong className="capitalize">{p.condition.replace('_', ' ')}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Garment CM chart preview */}
                  <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E4D9] text-[11px] space-y-1 mb-3">
                    <div className="font-bold text-neutral-700">Dimensi Sentimeter (CM):</div>
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
                        <span>Aktifkan</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      deleteProductListing(p.id);
                      onShowToast('Produk berhasil dihapus dari katalog.');
                    }}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Create Listing Form */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4D9] shadow-sm max-w-4xl mx-auto">
          <div className="flex items-center gap-3 pb-6 border-b border-neutral-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#8EA89D] text-[#162D24] flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#162D24]">Formulir Listing Produk Baru</h2>
              <p className="text-xs text-neutral-500">
                Lengkapi deskripsi, kondisi fisik, dan tabel sentimeter (cm) pakaian
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateListing} className="space-y-6">
            {/* 1. Seller Type & Source */}
            <div className="space-y-2">
              <label className="text-xs font-bold block text-neutral-700">1. Jenis Penjual & Kategori Produk:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSellerType('community_preloved');
                    setCondition('like_new');
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    sellerType === 'community_preloved'
                      ? 'bg-[#162D24] text-white border-[#162D24] shadow-md'
                      : 'bg-[#FAF9F5] text-[#162D24] border-[#E8E4D9]'
                  }`}
                >
                  <span className="text-xs font-bold block">Preloved / Thrift Komunitas</span>
                  <p className={`text-[11px] mt-1 ${sellerType === 'community_preloved' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Jual koleksi pakaian pribadi secondhand Anda yang masih sangat layak pakai.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSellerType('umkm');
                    setCondition('new');
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    sellerType === 'umkm'
                      ? 'bg-[#162D24] text-white border-[#162D24] shadow-md'
                      : 'bg-[#FAF9F5] text-[#162D24] border-[#E8E4D9]'
                  }`}
                >
                  <span className="text-xs font-bold block">Brand UMKM Fashion Baru</span>
                  <p className={`text-[11px] mt-1 ${sellerType === 'umkm' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Koleksi produk baru karya desainer atau konveksi independen lokal.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1">Judul Pakaian / Produk:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kemeja Linen Vintage Loose Fit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Nama Toko / Profil Penjual:</label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Kategori:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                >
                  <option value="top">Atasan (Top / Kemeja / Kaos)</option>
                  <option value="pants">Celana (Pants)</option>
                  <option value="dress">Gaun / Dress</option>
                  <option value="outerwear">Outerwear (Jaket / Blazer / Hoodie)</option>
                  <option value="jeans">Denim / Jeans</option>
                  <option value="bag">Tas (Bag)</option>
                  <option value="shoes">Sepatu (Shoes)</option>
                  <option value="hijab">Hijab & Modest</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Gaya (Style Vibe):</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                >
                  <option value="casual">Casual Daily</option>
                  <option value="minimalist">Minimalist Japanese/Korean</option>
                  <option value="formal">Formal & Office Smart</option>
                  <option value="streetwear">Streetwear & Edgy</option>
                  <option value="etnik_batik_modern">Etnik Batik Modern</option>
                  <option value="sporty">Sporty & Athleisure</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Harga Jual (Rp):</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24] font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Harga Retail Asli / Estimasi Baru (Rp):</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                />
              </div>
            </div>

            {/* 3. Secondhand Honesty Section (if preloved) */}
            {sellerType === 'community_preloved' && (
              <div className="p-5 rounded-2xl bg-[#FFF8E6] border border-[#F0DFB0] space-y-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Keterbukaan Kondisi Barang Preloved (Transparency Policy)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-1">Tingkat Kondisi Fisik:</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                    >
                      <option value="like_new">Like New (99% Mulus seperti baru)</option>
                      <option value="very_good">Very Good (Pemakaian wajar, sangat terawat)</option>
                      <option value="good">Good (Ada jejak pemakaian minor)</option>
                      <option value="has_defects">Has Defects (Ada defek yang dicantumkan jujur)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Lama / Riwayat Pemakaian:</label>
                    <input
                      type="text"
                      value={usageDuration}
                      onChange={(e) => setUsageDuration(e.target.value)}
                      placeholder="Contoh: Dipakai 2x saat wisuda"
                      className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-[#162D24]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Catatan Defek / Detail Kejujuran:</label>
                  <textarea
                    rows={2}
                    value={defectNotes}
                    onChange={(e) => setDefectNotes(e.target.value)}
                    placeholder="Contoh: Tidak ada noda. Kancing cadangan masih lengkap."
                    className="w-full bg-white border border-[#DDD8CC] rounded-xl p-2.5 text-xs text-[#162D24]"
                  />
                </div>
              </div>
            )}

            {/* 4. Garment Measurement Builder (CM) */}
            <div className="p-5 rounded-2xl bg-[#EAF2EE] border border-[#BFD9CD] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#162D24] font-bold text-xs">
                  <Ruler className="w-4 h-4 text-[#2D5A47]" />
                  <span>Tabel Ukuran Nyata Garment (Sentimeter - CM)</span>
                </div>
                <span className="text-[10px] text-neutral-600">Diukur Flat Lay di Atas Meja</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Label Ukuran:</label>
                  <input
                    type="text"
                    value={sizeLabel}
                    onChange={(e) => setSizeLabel(e.target.value)}
                    placeholder="Contoh: Size L atau Size 30"
                    className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs font-bold text-[#162D24]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1">Lingkar Dada Baju (LD):</label>
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
                  <label className="text-[11px] font-bold block mb-1">Potongan Fit Baju:</label>
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

            {/* 5. Image & Description */}
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
                <label className="text-xs font-bold block mb-1">Deskripsi & Cerita Produk:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan bahan, kenyamanan pakai, dan saran padu padan..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl p-3 text-xs text-[#162D24]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#162D24] hover:bg-[#203D31] text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#8EA89D]" />
              <span>Terbitkan Listing ke Marketplace</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-[#162D24]">Pesanan Masuk dari Pembeli:</h3>
            <span className="text-xs text-neutral-500">Kemas barang dan input nomor resi pengiriman</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E4D9]">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="font-bold text-base">Belum Ada Pesanan Masuk</h4>
              <p className="text-xs text-neutral-500">Pesanan baru akan otomatis muncul di sini begitu pembeli checkout.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-3xl p-6 border border-[#E8E4D9] shadow-xs">
                  <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm">{o.orderNumber}</strong>
                        <span className="text-xs text-neutral-400">• Pembeli: {o.buyerName}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">Alamat: {o.shippingAddress}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {o.orderStatus === 'paid' ? 'Perlu Dikirim' : o.orderStatus}
                    </span>
                  </div>

                  <div className="py-4 flex gap-4 items-center">
                    <img src={o.product.imageUrl} alt={o.product.title} className="w-16 h-16 rounded-2xl object-cover border" />
                    <div>
                      <h4 className="font-bold text-sm text-[#162D24]">{o.product.title}</h4>
                      <p className="text-xs text-neutral-500">Ukuran yang dibeli: <strong>{o.selectedSize}</strong></p>
                      <p className="text-xs font-bold text-[#162D24] mt-1">Total: Rp {o.totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {o.orderStatus === 'paid' && (
                    <div className="pt-4 border-t border-neutral-100 flex flex-wrap gap-3 items-center justify-between">
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Masukkan No. Resi Kurir (opsional)"
                          value={shippingResiMap[o.id] || ''}
                          onChange={(e) => setShippingResiMap({ ...shippingResiMap, [o.id]: e.target.value })}
                          className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <button
                        onClick={() => handleShipOrder(o.id)}
                        className="px-5 py-2 bg-[#162D24] hover:bg-[#203D31] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4 text-[#8EA89D]" />
                        <span>Konfirmasi Pengiriman</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Admin Moderation */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E8E4D9] space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
            <ShieldAlert className="w-5 h-5 text-[#8A2424]" />
            <h3 className="font-bold text-sm text-[#162D24]">Antrean Moderasi Laporan Komunitas:</h3>
          </div>

          {reports.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Tidak ada laporan listing yang menunggu tindakan.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4D9] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xs block text-[#162D24]">{rep.productTitle}</span>
                    <p className="text-[11px] text-neutral-500">
                      Pelapor: {rep.reporterName} • Alasan: <strong className="text-rose-700">{rep.reason}</strong>
                    </p>
                    {rep.notes && <p className="text-[11px] text-neutral-600 mt-1 italic">"{rep.notes}"</p>}
                  </div>

                  {rep.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          moderateProductListing(rep.id, 'dismiss');
                          onShowToast('Laporan diabaikan / listing valid.');
                        }}
                        className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 rounded-xl text-xs font-bold"
                      >
                        Abaikan
                      </button>
                      <button
                        onClick={() => {
                          moderateProductListing(rep.id, 'takedown');
                          onShowToast('Produk berhasil ditakedown dari marketplace.');
                        }}
                        className="px-3 py-1.5 bg-[#8A2424] hover:bg-[#A32A2A] text-white rounded-xl text-xs font-bold"
                      >
                        Takedown Produk
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-neutral-400 capitalize">{rep.status}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
