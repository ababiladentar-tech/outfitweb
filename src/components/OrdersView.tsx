'use client';

import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Star, Clock, AlertCircle, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';
import { MarketplaceOrder } from '@/types';
import { getStoredOrders, updateOrderStatus } from '@/data/marketplace-store';

interface OrdersViewProps {
  onNavigateExplore: () => void;
  onShowToast: (text: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onNavigateExplore,
  onShowToast
}) => {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'shipped' | 'completed'>('all');
  const [reviewModalOrder, setReviewModalOrder] = useState<MarketplaceOrder | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [fitFeedback, setFitFeedback] = useState<'true_to_size' | 'ran_small' | 'ran_large'>('true_to_size');

  const loadOrders = () => {
    setOrders(getStoredOrders());
  };

  useEffect(() => {
    loadOrders();
    const handleUpdate = () => loadOrders();
    window.addEventListener('outfitly_orders_updated', handleUpdate);
    return () => window.removeEventListener('outfitly_orders_updated', handleUpdate);
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'paid') return o.orderStatus === 'paid' || o.orderStatus === 'processing';
    if (activeTab === 'shipped') return o.orderStatus === 'shipped' || o.orderStatus === 'delivered';
    if (activeTab === 'completed') return o.orderStatus === 'completed';
    return true;
  });

  const handleConfirmReceived = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    onShowToast('Barang berhasil diverifikasi & pesanan selesai! Dana diteruskan ke penjual.');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalOrder) return;

    updateOrderStatus(reviewModalOrder.id, 'completed', {
      review: {
        rating,
        comment,
        fitFeedback,
        createdAt: new Date().toISOString()
      }
    });

    setReviewModalOrder(null);
    onShowToast('Ulasan dan rating ukuran berhasil dikirim! Terima kasih.');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8EA89D]/20 text-[#162D24] text-xs font-bold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Escrow & Order Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#162D24]">
            Pesanan Saya & Status Pengiriman
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Pantau status pesanan, nomor resi pengiriman, serta garansi pas ukuran Outfitly
          </p>
        </div>

        <button
          onClick={onNavigateExplore}
          className="px-4 py-2.5 bg-[#162D24] hover:bg-[#203D31] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-[#8EA89D]" />
          <span>Belanja Produk Lain</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8D2C4] mb-6 overflow-x-auto">
        {[
          { id: 'all', label: 'Semua Pesanan' },
          { id: 'paid', label: 'Diproses Penjual' },
          { id: 'shipped', label: 'Dalam Pengiriman' },
          { id: 'completed', label: 'Selesai' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-[#162D24] text-[#162D24]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E4D9] space-y-4 max-w-md mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-[#FAF9F5] text-neutral-400 flex items-center justify-center mx-auto border border-[#E8E4D9]">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-[#162D24]">Belum Ada Pesanan Aktif</h3>
          <p className="text-xs text-neutral-500">
            Jelajahi ribuan produk UMKM dan thrift preloved terkurasi dengan jaminan kecocokan ukuran.
          </p>
          <button
            onClick={onNavigateExplore}
            className="px-6 py-2.5 bg-[#162D24] text-white rounded-xl text-xs font-bold hover:bg-[#203D31] transition-colors"
          >
            Mulai Belanja Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.orderStatus === 'completed';
            const isShipped = order.orderStatus === 'shipped' || order.orderStatus === 'delivered';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-[#E8E4D9] shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Card Top: Order No & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-[#162D24]">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">
                      Toko: <strong>{order.sellerName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.orderStatus === 'paid' && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        Menunggu Pengemasan Penjual
                      </span>
                    )}
                    {isShipped && (
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Sedang Dikirim</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pesanan Selesai</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Middle: Product Item Details */}
                <div className="py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <img
                      src={order.product.imageUrl}
                      alt={order.product.title}
                      className="w-18 h-18 rounded-2xl object-cover border border-[#E8E4D9]"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#DDD8CC] text-[10px] font-bold">
                          {order.product.sellerType === 'community_preloved' ? 'Preloved Thrift' : 'UMKM'}
                        </span>
                        <span className="text-xs text-neutral-500 font-semibold">
                          Varian Ukuran: <strong className="text-[#162D24]">{order.selectedSize}</strong>
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#162D24] line-clamp-1">{order.product.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Kurir: {order.shippingCourier} {order.trackingNumber ? `(Resi: ${order.trackingNumber})` : '(Menunggu Resi)'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <span className="text-xs text-neutral-500 block">Total Tagihan (Termasuk Ongkir):</span>
                    <strong className="text-base font-extrabold text-[#162D24]">
                      Rp {order.totalPrice.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Garansi Rekber Outfitly: <strong>{order.escrowStatus === 'held_in_escrow' ? 'Dana Terlindungi' : 'Selesai'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.orderStatus === 'shipped' && (
                      <button
                        onClick={() => handleConfirmReceived(order.id)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Pesanan Diterima & Ukuran Pas
                      </button>
                    )}

                    {isCompleted && !order.review && (
                      <button
                        onClick={() => setReviewModalOrder(order)}
                        className="px-4 py-2 bg-[#162D24] hover:bg-[#203D31] text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 text-[#C19A5B]" />
                        <span>Beri Ulasan Ukuran</span>
                      </button>
                    )}

                    {order.review && (
                      <div className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>Rating Anda: {order.review.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review & Fit Rating Modal */}
      {reviewModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#D8D2C4] p-6 text-[#162D24] space-y-4">
            <h3 className="font-bold text-base font-serif">Beri Ulasan & Konfirmasi Ukuran</h3>
            <p className="text-xs text-neutral-600">
              Ulasan Anda membantu pembeli lain mengetahui apakah pakaian ini pas di tubuh (true to size).
            </p>

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="text-xs font-bold block mb-1">Kepuasan Produk:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'fill-amber-400 text-amber-500' : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Feedback */}
              <div>
                <label className="text-xs font-bold block mb-1">Kecocokan Ukuran Nyata:</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {[
                    { id: 'ran_small', label: 'Kekecilan' },
                    { id: 'true_to_size', label: 'Sangat Pas' },
                    { id: 'ran_large', label: 'Kebesaran' }
                  ].map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setFitFeedback(f.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        fitFeedback === f.id
                          ? 'bg-[#162D24] text-white border-[#162D24]'
                          : 'bg-white border-[#DDD8CC] text-[#162D24]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs font-bold block mb-1">Komentar Ulasan:</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda memakai baju ini..."
                  className="w-full bg-white border border-[#DDD8CC] rounded-xl p-3 text-xs text-[#162D24]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOrder(null)}
                  className="flex-1 py-2.5 bg-neutral-200 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#162D24] text-white text-xs font-bold rounded-xl hover:bg-[#203D31]"
                >
                  Kirim Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
