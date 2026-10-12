'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CreditCard, Sparkles, Check, ChevronRight, AlertCircle, Ruler } from 'lucide-react';
import { UMKMProductPost, BodyMeasurements, MarketplaceOrder } from '@/types';
import { calculateSizeCompatibility } from '@/lib/sizing-engine';
import { createOrder } from '@/data/marketplace-store';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: UMKMProductPost | null;
  userMeasurements?: BodyMeasurements | null;
  buyerName?: string;
  onOrderCreated: (order: MarketplaceOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  userMeasurements,
  buyerName = 'Teman Gaya',
  onOrderCreated
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return product?.availableSizes[0]?.sizeLabel || 'M';
  });

  const [shippingCourier, setShippingCourier] = useState<'jnt' | 'sicepat' | 'gosend'>('sicepat');
  const [paymentMethod, setPaymentMethod] = useState<MarketplaceOrder['paymentMethod']>('qris');
  const [buyerPhone, setBuyerPhone] = useState('081234567890');
  const [shippingAddress, setShippingAddress] = useState('Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<MarketplaceOrder | null>(null);

  if (!isOpen || !product) return null;

  // Calculate fit on selected size
  const fitAnalysis = calculateSizeCompatibility(product, userMeasurements, selectedSize);

  const courierRates = {
    sicepat: { name: 'SiCepat Reguler (2-3 Hari)', price: 14000 },
    jnt: { name: 'J&T Express Standard (2-3 Hari)', price: 16000 },
    gosend: { name: 'GoSend Instant (Same Day)', price: 32000 }
  };

  const shippingCost = courierRates[shippingCourier].price;
  const platformFee = 2000;
  const totalAmount = product.price + shippingCost + platformFee;

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const order = createOrder({
        buyerId: 'user-current',
        buyerName,
        buyerPhone,
        shippingAddress,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        product,
        selectedSize,
        quantity: 1,
        totalPrice: totalAmount,
        shippingCourier: courierRates[shippingCourier].name,
        shippingCost,
        paymentMethod,
        escrowStatus: 'held_in_escrow',
        orderStatus: 'paid'
      });

      setCreatedOrderData(order);
      setIsProcessing(false);
      setIsSuccess(true);
      onOrderCreated(order);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#162D24] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8EA89D] flex items-center justify-center text-[#162D24]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Outfitly Safe Trade & Checkout</h2>
              <p className="text-xs text-[#A3BFB2]">
                Transaksi Rekber Terlindungi • Garansi Uang Kembali Jika Ukuran Tidak Sesuai
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#162D24]">
          {isSuccess && createdOrderData ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Pembayaran Terverifikasi (Escrow Aktif)
                </span>
                <h3 className="text-xl font-bold font-serif">Pesanan {createdOrderData.orderNumber} Berhasil Dibuat!</h3>
                <p className="text-xs text-neutral-600 max-w-md mx-auto">
                  Dana Anda aman di rekening bersama Outfitly. Penjual ({product.sellerName}) telah diberi notifikasi untuk segera mengemas pesanan.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8E4D9] text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Estimasi Tiba:</span>
                  <strong>{createdOrderData.estimatedDelivery}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Varian Ukuran:</span>
                  <strong>{createdOrderData.selectedSize}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Pembayaran:</span>
                  <strong className="text-base text-[#162D24]">
                    Rp {createdOrderData.totalPrice.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-md mx-auto py-3 bg-[#162D24] text-white rounded-2xl font-bold text-xs hover:bg-[#203D31] transition-all"
              >
                Lihat Pesanan di Menu "Pesanan Saya"
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmPayment} className="space-y-6">
              {/* Product Summary */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] flex gap-4 items-center">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-20 h-20 rounded-2xl object-cover border border-[#E8E4D9]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#DDD8CC] text-[10px] font-bold">
                      {product.sellerType === 'community_preloved' ? 'Preloved Thrift' : 'UMKM Baru'}
                    </span>
                    <span className="text-xs text-neutral-500 truncate">{product.sellerName}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#162D24] truncate">{product.title}</h4>
                  <p className="text-sm font-extrabold text-[#162D24] mt-1">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* 1. Size Selection with Live Fit Indicator */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#162D24]">1. Pilih Ukuran Varian:</label>
                  <span className={`text-[11px] font-bold ${fitAnalysis.overallScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Smart Fit: {fitAnalysis.overallScore}% Match
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((s) => (
                    <button
                      key={s.sizeLabel}
                      type="button"
                      onClick={() => setSelectedSize(s.sizeLabel)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSize === s.sizeLabel
                          ? 'bg-[#162D24] text-white shadow-sm'
                          : 'bg-[#FAF9F5] text-[#162D24] border border-[#E8E4D9] hover:bg-[#EAE6DC]'
                      }`}
                    >
                      {s.sizeLabel}
                    </button>
                  ))}
                </div>

                {/* Sizing Note */}
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E4D9] text-[11px] text-neutral-600 flex items-start gap-2">
                  <Ruler className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <p><strong className="text-[#162D24]">{fitAnalysis.fitHeadline}:</strong> {fitAnalysis.summaryExplanation}</p>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] space-y-3">
                <label className="text-xs font-bold text-[#162D24]">2. Alamat Pengiriman:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1">Nama Penerima</label>
                    <input
                      type="text"
                      value={buyerName}
                      disabled
                      className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs text-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1">No. WhatsApp/HP</label>
                    <input
                      type="text"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs text-[#162D24]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 block mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl p-2.5 text-xs text-[#162D24]"
                  />
                </div>
              </div>

              {/* 3. Shipping Courier */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] space-y-3">
                <label className="text-xs font-bold text-[#162D24]">3. Layanan Pengiriman:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'sicepat', name: 'SiCepat Reg', price: 14000, eta: '2-3 Hari' },
                    { id: 'jnt', name: 'J&T Express', price: 16000, eta: '2-3 Hari' },
                    { id: 'gosend', name: 'GoSend SameDay', price: 32000, eta: 'Hari Ini' }
                  ].map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setShippingCourier(c.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        shippingCourier === c.id
                          ? 'bg-[#162D24] text-white border-[#162D24]'
                          : 'bg-[#FAF9F5] text-[#162D24] border-[#E8E4D9]'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{c.name}</span>
                        {shippingCourier === c.id && <Check className="w-3.5 h-3.5 text-[#8EA89D]" />}
                      </div>
                      <p className={`text-[10px] ${shippingCourier === c.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Rp {c.price.toLocaleString('id-ID')} • {c.eta}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Payment Method */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] space-y-3">
                <label className="text-xs font-bold text-[#162D24]">4. Metode Pembayaran Rekber:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'qris', label: 'QRIS Instan' },
                    { id: 'bca_va', label: 'BCA Virtual Acc' },
                    { id: 'mandiri_va', label: 'Mandiri VA' },
                    { id: 'gopay', label: 'GoPay / SPay' }
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPaymentMethod(p.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        paymentMethod === p.id
                          ? 'bg-[#162D24] text-white border-[#162D24]'
                          : 'bg-[#FAF9F5] text-[#162D24] border-[#E8E4D9]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown & Submit */}
              <div className="bg-[#EAF2EE] p-5 rounded-2xl border border-[#BFD9CD] space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Harga Produk:</span>
                  <span>Rp {product.price.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Ongkos Kirim ({courierRates[shippingCourier].name}):</span>
                  <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Biaya Layanan & Rekber:</span>
                  <span>Rp {platformFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#162D24] pt-2 border-t border-[#BFD9CD]">
                  <span>Total Pembayaran:</span>
                  <span className="text-base">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#162D24] hover:bg-[#203D31] text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Memproses Transaksi Rekber...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-[#8EA89D]" />
                    <span>Bayar Sekarang (Rp {totalAmount.toLocaleString('id-ID')})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
