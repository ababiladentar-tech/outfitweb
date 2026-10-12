'use client';

import React from 'react';
import { X, Sparkles, SlidersHorizontal, Heart, MessageSquare, ShoppingBag } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnboarding: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onStartOnboarding
}) => {
  if (!isOpen) return null;

  const faqs = [
    {
      icon: Sparkles,
      title: 'Bagaimana cara kerja kurasi gaya Outfitly?',
      desc: 'Outfitly memadukan warna kulit (undertone), proporsi tubuh, dan bentuk wajah untuk merekomendasikan warna, potongan pakaian, dan aksesoris yang paling serasi untukmu.'
    },
    {
      icon: SlidersHorizontal,
      title: 'Bagaimana sistem filter produk bekerja?',
      desc: 'Kamu bisa memadukan filter kategori, gaya berpakaian, warna, rentang harga, hingga mengaktifkan fitur "Match My Style Profile" untuk memfilter produk yang 100% cocok dengan karakteristik tubuhmu.'
    },
    {
      icon: ShoppingBag,
      title: 'Apakah saya bisa langsung membeli produk UMKM?',
      desc: 'Tentu! Setiap kartu produk terhubung langsung ke pengrajin dan UMKM fashion lokal Indonesia (Bandung, Jogja, Solo, Garut, Pekalongan) via WhatsApp atau Marketplace resmi dengan 1 klik tombol "Visit Site".'
    },
    {
      icon: Heart,
      title: 'Bagaimana cara menyimpan outfit favorit?',
      desc: 'Klik tombol bookmark atau "Save" pada kartu produk untuk menyimpannya ke halaman koleksi tersimpan (Saved Outfits) agar mudah diakses kapan saja.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0E1F18]/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-[#1E3A2F] text-white rounded-3xl p-6 sm:p-8 border border-[#2F4F42] shadow-2xl z-10 animate-fadeIn space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8EA89D] text-[#162D24] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight font-sans">
                Panduan & Bantuan Outfitly
              </h2>
              <p className="text-xs text-neutral-300">
                Semua yang perlu kamu ketahui tentang platform styling outfit & UMKM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FAQs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {faqs.map((faq, i) => {
            const Icon = faq.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-[#8EA89D]">
                  <Icon className="w-4 h-4 shrink-0" />
                  <h3 className="text-xs font-bold text-white">{faq.title}</h3>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {faq.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
          <span className="text-xs text-neutral-400">
            Ingin mengubah profil bentuk tubuh atau warna kulit?
          </span>
          <button
            onClick={() => {
              onClose();
              onStartOnboarding();
            }}
            className="px-6 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            Ubah Profil Gaya
          </button>
        </div>
      </div>
    </div>
  );
};
