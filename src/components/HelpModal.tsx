'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  SlidersHorizontal, 
  BookmarkCheck, 
  MessageSquare, 
  ShoppingBag,
  Mail,
  Bot,
  Send,
  HelpCircle,
  Store,
  Ruler
} from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

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
  const [activeTab, setActiveTab] = useState<'faq' | 'cs_ai'>('faq');
  const [csInput, setCsInput] = useState('');
  const [csMessages, setCsMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Halo! Saya Asisten Customer Service Outfitly AI. Ada pertanyaan seputar ukuran, katalog UMKM & Collab Mitra, atau cara kerja platform yang bisa saya bantu?',
      time: 'Baru saja'
    }
  ]);
  const [isCsTyping, setIsCsTyping] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      icon: Sparkles,
      title: 'Bagaimana cara kerja kurasi gaya Outfitly?',
      desc: 'Outfitly memadukan warna kulit (undertone), proporsi tubuh, dan bentuk wajah untuk merekomendasikan warna, potongan pakaian, dan aksesoris yang paling serasi untukmu.'
    },
    {
      icon: Ruler,
      title: 'Bagaimana akurasi Smart Size dalam sentimeter (cm)?',
      desc: 'Smart Sizing membandingkan lingkar dada dan pinggangmu dengan dimensi riil pakaian yang diukur manual oleh penjual UMKM/Mitra, bukan sekadar menebak dari label huruf S/M/L.'
    },
    {
      icon: ShoppingBag,
      title: 'Apakah saya bisa langsung membeli produk UMKM?',
      desc: 'Tentu! Setiap kartu produk terhubung langsung ke pengrajin dan UMKM fashion lokal Indonesia (Bandung, Jogja, Solo, Garut, Pekalongan) via WhatsApp atau Marketplace resmi dengan 1 klik tombol "Visit Site".'
    },
    {
      icon: Store,
      title: 'Bagaimana cara mendaftar jadi mitra penjual UMKM?',
      desc: 'Kamu bisa membuka tab "Katalog Toko" di profil dan langsung melengkapi profil toko, cerita UMKM, serta mengunggah katalog pakaian baru atau preloved kurasi.'
    },
    {
      icon: BookmarkCheck,
      title: 'Bagaimana cara menyimpan outfit favorit?',
      desc: 'Klik ikon bookmark pada kartu produk atau menu lemarimu untuk menyimpannya ke halaman koleksi tersimpan (Saved Outfits) agar mudah diakses kapan saja.'
    },
    {
      icon: MessageSquare,
      title: 'Apakah konsultasi AI Stylist gratis?',
      desc: 'Ya, setiap pengguna mendapatkan kuota konsultasi gratis setiap hari untuk menanyakan padu-padan baju lemari, rekomendasi outfit hemat budget, dan tips acara.'
    }
  ];

  const handleSendCs = (customQuestion?: string) => {
    const q = customQuestion || csInput;
    if (!q.trim() || isCsTyping) return;

    const userMsg = {
      sender: 'user' as const,
      text: q.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setCsMessages(prev => [...prev, userMsg]);
    setCsInput('');
    setIsCsTyping(true);

    setTimeout(() => {
      let reply = 'Terima kasih atas pertanyaanmu! Tim kami dan sistem Outfitly siap membantu.';
      const low = q.toLowerCase();

      if (low.includes('ukuran') || low.includes('size') || low.includes('cm') || low.includes('muat')) {
        reply = 'Untuk memastikan ukuran pas, kamu bisa mengisi profil sentimeter (cm) di menu "Gaya & Profil". Sistem Smart Sizing kami akan langsung menghitung persentase kecocokan dengan lingkar dada dan pinggang pakaian penjual.';
      } else if (low.includes('beli') || low.includes('pesan') || low.includes('transaksi') || low.includes('toko')) {
        reply = 'Kamu bisa langsung mengklik produk pilihanmu dan menekan tombol "Hubungi Penjual (WhatsApp)" atau tautan marketplace toko untuk transaksi aman langsung dengan UMKM lokal.';
      } else if (low.includes('jual') || low.includes('buka toko') || low.includes('mitra')) {
        reply = 'Ingin menjual busana UMKM atau Collab Mitra? Klik menu "Katalog Toko" di profilmu, lengkapi profil tokomu, lalu mulai upload foto baju dan tautan pembelian.';
      } else if (low.includes('lemari') || low.includes('wardrobe')) {
        reply = 'Fitur "Lemari Saya" memungkinkanmu menyimpan foto baju yang sudah kamu miliki di rumah, lalu Stylist AI kami akan membantu memadukannya dengan produk lokal tanpa harus selalu beli baru!';
      } else if (low.includes('ig') || low.includes('instagram') || low.includes('email') || low.includes('kontak')) {
        reply = 'Kamu bisa menghubungi tim resmi Outfitly melalui Instagram @outfitly.id atau email contact@outfitly.id. Kami siap membantu setiap hari kerja!';
      } else {
        reply = 'Pertanyaan yang bagus! Outfitly didesain untuk memadukan lemari pribadimu dengan kurasi UMKM lokal terpercaya. Ada hal spesifik lain tentang ukuran atau gaya yang ingin kamu tanyakan?';
      }

      setCsMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsCsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0E1F18]/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-[#1E3A2F] text-white rounded-3xl p-6 sm:p-8 border border-[#2F4F42] shadow-2xl z-10 animate-fadeIn space-y-5 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8EA89D] text-[#162D24] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight font-sans">
                Pusat Bantuan & FAQ Outfitly
              </h2>
              <p className="text-xs text-neutral-300">
                Informasi resmi, panduan ukuran, dan layanan bantuan pelanggan
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

        {/* Tab Switcher: FAQ vs Customer Service AI */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#162D24] border border-[#2F4F42] shrink-0">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-[#8EA89D] text-[#162D24] shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQ (Pertanyaan Umum)</span>
          </button>

          <button
            onClick={() => setActiveTab('cs_ai')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'cs_ai'
                ? 'bg-[#8EA89D] text-[#162D24] shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Customer Service AI (Tanya CS)</span>
          </button>
        </div>

        {/* TAB 1: FAQ Grid */}
        {activeTab === 'faq' ? (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {faqs.map((faq, i) => {
                const Icon = faq.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 text-[#8EA89D]">
                      <Icon className="w-4 h-4 shrink-0" />
                      <h3 className="text-xs font-bold text-white">{faq.title}</h3>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-normal">
                      {faq.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* TAB 2: Customer Service AI Chat */
          <div className="flex-1 flex flex-col min-h-[300px] bg-[#162D24] rounded-2xl border border-[#2F4F42] p-3 overflow-hidden">
            {/* Quick Prompts for CS */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/10">
              {['Cara cek ukuran CM?', 'Cara beli produk UMKM?', 'Bagaimana cara buka toko?'].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendCs(q)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {csMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#8EA89D] text-[#162D24] rounded-tr-xs font-medium'
                        : 'bg-white/10 text-white rounded-tl-xs border border-white/10'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="block text-[9px] opacity-60 text-right mt-1">
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
              {isCsTyping && (
                <div className="flex items-center gap-2 text-xs text-[#8EA89D] pl-2 py-1">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>CS AI sedang mengetik jawaban...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCs();
              }}
              className="flex items-center gap-2 pt-2 border-t border-white/10"
            >
              <input
                type="text"
                placeholder="Ketik pertanyaan untuk CS AI Outfitly..."
                value={csInput}
                onChange={(e) => setCsInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-neutral-400 outline-none focus:border-[#8EA89D]"
              />
              <button
                type="submit"
                disabled={!csInput.trim() || isCsTyping}
                className="w-8 h-8 rounded-xl bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] flex items-center justify-center disabled:opacity-40 cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Official Channels & Footer Contact (IG & Email) */}
        <div className="pt-3 border-t border-white/10 shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-neutral-300">
              <a
                href="https://instagram.com/outfitly.id"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-[#8EA89D]" />
                <span className="font-semibold">@outfitly.id</span>
              </a>

              <a
                href="mailto:contact@outfitly.id"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-[#8EA89D]" />
                <span className="font-semibold">contact@outfitly.id</span>
              </a>
            </div>

            <button
              onClick={() => {
                onClose();
                onStartOnboarding();
              }}
              className="px-5 py-2 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              Ubah Profil Gaya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
