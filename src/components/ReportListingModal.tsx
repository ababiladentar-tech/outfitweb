'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Check } from 'lucide-react';
import { UMKMProductPost } from '@/types';
import { reportProductListing, ListingReport } from '@/data/marketplace-store';

interface ReportListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: UMKMProductPost | null;
  reporterName?: string;
  onSuccess: () => void;
}

export const ReportListingModal: React.FC<ReportListingModalProps> = ({
  isOpen,
  onClose,
  product,
  reporterName = 'Pengguna Outfitly',
  onSuccess
}) => {
  const [reason, setReason] = useState<ListingReport['reason']>('misleading_photo');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportProductListing(product.id, product.title, reporterName, reason, notes);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onSuccess();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden">
        {/* Header */}
        <div className="bg-[#8A2424] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-200" />
            <h2 className="text-base font-bold">Laporkan Listing Produk</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-[#162D24]">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Laporan Berhasil Dikirim</h3>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                Tim moderasi Outfitly akan meninjau produk ini dalam 1x24 jam untuk menjaga keamanan komunitas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900">
                Anda melaporkan: <strong>{product.title}</strong> oleh <em>{product.sellerName}</em>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Alasan Pelaporan:</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ListingReport['reason'])}
                  className="w-full bg-white border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs font-medium text-[#162D24]"
                >
                  <option value="misleading_photo">Foto produk tidak sesuai fisik asli / palsu</option>
                  <option value="fake_condition">Kondisi secondhand tidak sesuai kenyataan (ada cacat disembunyikan)</option>
                  <option value="inaccurate_measurements">Ukuran sentimeter (cm) sangat melenceng</option>
                  <option value="spam">Spam / Penipuan / Kontak mencurigakan</option>
                  <option value="prohibited_item">Barang terlarang atau melanggar hak cipta</option>
                  <option value="other">Alasan lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Catatan Tambahan (Opsional):</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jelaskan detail ketidaksesuaian yang Anda temukan..."
                  className="w-full bg-white border border-[#DDD8CC] rounded-xl p-3 text-xs text-[#162D24] focus:outline-none focus:border-[#162D24]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-neutral-200 hover:bg-neutral-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#8A2424] hover:bg-[#A32A2A] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
