'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserOnboardingProfile, ChatMessage, UMKMProductPost, WardrobeItem } from '@/types';
import { INITIAL_MARKETPLACE_PRODUCTS } from '@/data/umkm-products';
import { getStoredWardrobe } from '@/data/wardrobe-store';
import { 
  ArrowUp, 
  Sparkles, 
  Download, 
  Home, 
  MessageSquarePlus, 
  Compass, 
  HelpCircle, 
  User, 
  Share2, 
  Shirt, 
  ChevronDown
} from 'lucide-react';

interface ChatAIViewProps {
  userProfile?: UserOnboardingProfile | null;
  username?: string;
  initialMode?: 'chat' | 'studio';
  initialWardrobeItems?: WardrobeItem[];
  onNavigateHome: () => void;
  onNavigateReference: () => void;
  onNavigateDashboard: () => void;
  onOpenHelp: () => void;
  onOpenSmartSize?: () => void;
  onSelectProduct: (product: UMKMProductPost) => void;
  onShowToast?: (text: string) => void;
}

// Clean markdown formatter
function formatStylistText(text: string) {
  const parts = text.split('\n');
  return parts.map((line, lineIdx) => {
    // Process bold text **example**
    const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((chunk, chunkIdx) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={chunkIdx} className="font-bold text-[#162D24]">{chunk.slice(2, -2)}</strong>;
      }
      return chunk;
    });

    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <li key={lineIdx} className="ml-4 list-disc text-xs sm:text-sm">
          {formattedLine}
        </li>
      );
    }

    return (
      <p key={lineIdx} className="min-h-[1.2em]">
        {formattedLine}
      </p>
    );
  });
}

export const ChatAIView: React.FC<ChatAIViewProps> = ({
  userProfile,
  username,
  initialWardrobeItems,
  onNavigateHome,
  onNavigateReference,
  onNavigateDashboard,
  onOpenHelp,
  onSelectProduct,
  onShowToast
}) => {
  const [wardrobeDropdownOpen, setWardrobeDropdownOpen] = useState(false);
  const [wardrobeList, setWardrobeList] = useState<WardrobeItem[]>([]);

  useEffect(() => {
    const updateWardrobe = () => {
      setWardrobeList(getStoredWardrobe());
    };
    updateWardrobe();
    window.addEventListener('outfitly_wardrobe_updated', updateWardrobe);
    return () => window.removeEventListener('outfitly_wardrobe_updated', updateWardrobe);
  }, []);

  const displayName = username || userProfile?.username || 'Teman Gaya';
  const initialWelcomeText = `Halo ${displayName}! Selamat datang di Outfitly Stylist.

Aku siap membantumu menemukan inspirasi outfit yang cocok dengan karakteristik fisik dan koleksi lemarimu:
• **Skin Tone:** ${userProfile?.skinTone ? (userProfile.skinTone === 'cool' ? 'Cool Undertone' : userProfile.skinTone === 'warm' ? 'Warm Undertone (Sawo Matang)' : 'Neutral Undertone') : 'Warm Undertone'}
• **Body Shape:** ${userProfile?.bodyShape ? userProfile.bodyShape.toUpperCase().replace('_', ' ') : 'Hourglass'}
• **Panduan Ukuran (cm):** ${userProfile?.measurements?.chestBustCm ? `Lingkar Dada ${userProfile.measurements.chestBustCm}cm, Pinggang ${userProfile.measurements.waistCm}cm` : 'Bisa diisi di profil untuk akurasi sentimeter'}

Kamu bisa menanyakan padu-padan baju di lemarimu, rekomendasi busana UMKM & preloved sesuai budget, atau panduan ukuran yang pas!`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: initialWelcomeText,
      timestamp: 'Baru saja',
      recommendedProducts: INITIAL_MARKETPLACE_PRODUCTS.slice(0, 2)
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamedText]);

  // If user navigated with initial wardrobe items (e.g. from Profile Lemari)
  useEffect(() => {
    if (initialWardrobeItems && initialWardrobeItems.length > 0) {
      const itemsStr = initialWardrobeItems.map(i => `${i.name} (${i.color})`).join(', ');
      handleSend(`Tolong buatkan paduan outfit yang serasi dari produk UMKM untuk pakaian lemariku: ${itemsStr}`);
    }
  }, []);

  const quickChips = [
    '👗 Padukan baju di lemariku dengan UMKM',
    '✨ Outfit kasual minimalis di bawah Rp250.000',
    '📏 Rekomendasi outer yang pas lingkar dada',
    '🎨 Padu padan warna earth tone sawo matang'
  ];

  // Typewriter streaming effect
  const typeTextStream = (fullText: string, products: UMKMProductPost[]) => {
    setIsTyping(true);
    setStreamedText('');

    let currentIndex = 0;
    const speed = 10;

    const timer = setInterval(() => {
      currentIndex += 3;
      if (currentIndex >= fullText.length) {
        clearInterval(timer);
        setIsTyping(false);
        setStreamedText('');
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: fullText,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            recommendedProducts: products
          }
        ]);
      } else {
        setStreamedText(fullText.slice(0, currentIndex));
      }
    }, speed);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-stylist-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ sender: m.sender, text: m.text })),
          wardrobeItems: getStoredWardrobe(),
          profile: {
            name: username || userProfile?.username,
            gender: userProfile?.gender === 'boy' ? 'Pria' : 'Wanita',
            skinTone: userProfile?.skinTone || 'warm',
            bodyShape: userProfile?.bodyShape || 'hourglass',
            faceShape: userProfile?.faceShape || 'oval',
            measurements: userProfile?.measurements,
            stylePreferences: userProfile?.stylePreferences || ['casual', 'minimalist']
          }
        })
      });

      const data = await res.json();
      const aiReply = data.reply || 'Halo! Ada yang bisa aku bantu untuk styling penampilanmu hari ini?';
      const prods: UMKMProductPost[] = data.recommendedProducts || [];

      typeTextStream(aiReply, prods);
    } catch (err) {
      typeTextStream('Halo! Ada yang bisa aku bantu seputar rekomendasi outfit UMKM dan thrift hari ini? 😊', []);
    }
  };

  const handleExportLookbook = () => {
    const chatTranscript = messages
      .map(m => `[${m.sender === 'ai' ? 'Outfitly AI Stylist' : 'User'}] (${m.timestamp}):\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');
    
    const blob = new Blob([chatTranscript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Outfitly-Style-Lookbook-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast('Lookbook percakapan berhasil diunduh!');
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-[#F7F6F2] overflow-hidden">
      {/* 1. Slim Left Icon Sidebar */}
      <aside className="w-14 sm:w-16 bg-[#8EA89D] flex flex-col items-center justify-between py-6 text-[#162D24] shadow-md z-20 shrink-0 select-none">
        <div className="flex flex-col items-center gap-6">
          {/* Home Icon */}
          <button 
            onClick={onNavigateHome}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer" 
            title="Beranda"
          >
            <Home className="w-5 h-5 text-[#162D24]" />
          </button>

          {/* New Chat Icon */}
          <button 
            onClick={() => setMessages([{
              id: 'welcome-reset',
              sender: 'ai',
              text: initialWelcomeText,
              timestamp: 'Baru saja',
              recommendedProducts: INITIAL_MARKETPLACE_PRODUCTS.slice(0, 2)
            }])}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer" 
            title="Percakapan Baru"
          >
            <MessageSquarePlus className="w-5 h-5 text-[#162D24]" />
          </button>

          {/* Marketplace Icon */}
          <button 
            onClick={onNavigateReference}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer" 
            title="Marketplace & Community Feed"
          >
            <Compass className="w-5 h-5 text-[#162D24]" />
          </button>

          {/* Help Icon */}
          <button 
            onClick={onOpenHelp}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer" 
            title="Bantuan & Panduan"
          >
            <HelpCircle className="w-5 h-5 text-[#162D24]" />
          </button>

          {/* Export Lookbook Icon */}
          <button 
            onClick={handleExportLookbook}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer" 
            title="Download / Ekspor Lookbook"
          >
            <Download className="w-5 h-5 text-[#162D24]" />
          </button>
        </div>

        {/* User Account / Profile */}
        <div>
          <button 
            onClick={onNavigateDashboard}
            className="w-9 h-9 rounded-full bg-[#162D24] hover:bg-[#1E3A2F] flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
            title="Lihat Profil Gaya & Lemari Pakaian"
          >
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </aside>

      {/* 2. Main Pure AI Chat View */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
        {/* Top Minimal Header */}
        <div className="h-14 px-4 sm:px-8 flex items-center justify-between text-[#162D24] select-none border-b border-[#E5E0D5] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#162D24] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#8EA89D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-serif font-bold text-[#162D24] leading-tight">
                  Outfitly Stylist
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-neutral-400">
                Konsultan Gaya Personal & Panduan Ukuran CM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([{
                id: 'welcome-reset',
                sender: 'ai',
                text: initialWelcomeText,
                timestamp: 'Baru saja',
                recommendedProducts: INITIAL_MARKETPLACE_PRODUCTS.slice(0, 2)
              }])}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#DDD8CC] text-xs font-semibold text-[#162D24] transition-colors cursor-pointer"
              title="Mulai percakapan baru"
            >
              Chat Baru
            </button>

            <button
              onClick={handleExportLookbook}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#DDD8CC] text-xs font-semibold text-[#162D24] transition-colors cursor-pointer"
              title="Ekspor Lookbook"
            >
              <Download className="w-3.5 h-3.5 text-[#2D5A47]" />
              <span className="text-[11px]">Ekspor</span>
            </button>

            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Outfitly AI Stylist', url: window.location.href });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  if (onShowToast) onShowToast('Link percakapan berhasil disalin!');
                }
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 p-1 cursor-pointer transition-colors"
              title="Bagikan"
            >
              <Share2 className="w-4 h-4 text-[#162D24]" />
            </button>

            <button 
              onClick={onNavigateHome} 
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 p-1 cursor-pointer transition-colors"
              title="Kembali ke Beranda"
            >
              <Home className="w-4 h-4 text-[#162D24]" />
            </button>
          </div>
        </div>

        {/* Center Messages Feed (Breathable, Spacious, Clean) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="text-xs px-3.5 py-1.5 rounded-full bg-white text-[#162D24] border border-[#D8D2C4] font-medium shadow-2xs hover:bg-[#162D24] hover:text-white transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {msg.sender === 'user' ? (
                  /* User Message */
                  <div className="flex justify-end animate-fadeIn">
                    <div className="max-w-xl bg-[#1E3A2F] text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs sm:text-sm shadow-xs leading-relaxed">
                      <p>{msg.text}</p>
                      <span className="block text-[10px] text-neutral-300 text-right mt-1.5">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* AI Message */
                  <div className="flex items-start gap-3 animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-[#162D24] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#8EA89D]" />
                    </div>

                    <div className="flex-1 max-w-2xl space-y-3">
                      <div className="bg-white border border-[#E0DBD0] rounded-2xl rounded-tl-xs p-4 sm:p-5 text-xs sm:text-sm text-[#162D24] shadow-xs leading-relaxed space-y-1.5 font-normal">
                        {formatStylistText(msg.text)}
                        <span className="block text-[10px] text-neutral-400 text-right mt-2">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Product Recommendation Cards (Clean Inline Carousel / Grid) */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {msg.recommendedProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => onSelectProduct(p)}
                              className="bg-white rounded-2xl border border-[#DDD8CC] p-3 shadow-xs hover:shadow-md cursor-pointer transition-all flex gap-3 group"
                            >
                              <img 
                                src={p.imageUrl} 
                                alt={p.title} 
                                className="w-18 h-18 rounded-xl object-cover shrink-0 group-hover:scale-102 transition-transform" 
                              />
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#DDD8CC] text-neutral-600 uppercase">
                                      {p.sellerType === 'community_preloved' ? 'Preloved' : 'UMKM'}
                                    </span>
                                    <span className="text-[10px] text-neutral-500 truncate">{p.sellerName}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-[#162D24] truncate group-hover:text-[#254236]">
                                    {p.title}
                                  </h4>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-xs font-black text-[#162D24]">
                                    Rp {p.price.toLocaleString('id-ID')}
                                  </span>
                                  <span className="text-[10px] text-[#254236] font-bold underline">
                                    Lihat Detail →
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Typewriter Bubble */}
            {isTyping && streamedText && (
              <div className="flex items-start gap-3 animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-[#162D24] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#8EA89D]" />
                </div>
                <div className="flex-1 max-w-2xl bg-white border border-[#E0DBD0] rounded-2xl rounded-tl-xs p-4 sm:p-5 text-xs sm:text-sm text-[#162D24] shadow-xs leading-relaxed">
                  {formatStylistText(streamedText)}
                  <span className="inline-block w-1.5 h-3.5 bg-[#8EA89D] ml-1 animate-pulse" />
                </div>
              </div>
            )}

            {/* Typing Spinner */}
            {isTyping && !streamedText && (
              <div className="flex items-center gap-2.5 text-xs text-neutral-500 font-medium pl-11 py-2">
                <Sparkles className="w-4 h-4 animate-spin text-[#8EA89D]" />
                <span>Stylist sedang menyiapkan kurasi & panduan ukuran...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 3. Floating Bottom Input Bar (Clean & Focused) */}
        <div className="bg-gradient-to-t from-[#F7F6F2] via-[#F7F6F2] to-transparent pt-3 pb-5 px-4 sm:px-6 shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center bg-white rounded-2xl border border-[#D8D2C4] shadow-sm focus-within:border-[#162D24] focus-within:shadow-md transition-all p-2 gap-2"
            >
              {/* Wardrobe Quick Selector */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setWardrobeDropdownOpen(!wardrobeDropdownOpen)}
                  className="px-3 py-2 text-[#2D5A47] hover:bg-[#FAF9F5] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-[#DDD8CC]"
                  title="Pilih Baju dari Lemari Saya"
                >
                  <Shirt className="w-4 h-4 text-[#2D5A47]" />
                  <span className="text-xs font-bold hidden sm:inline">Baju Lemari</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {wardrobeDropdownOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-72 bg-white rounded-2xl shadow-xl border border-[#D8D2C4] p-3 z-50 animate-fadeIn space-y-2 max-h-64 overflow-y-auto text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Lemari Profil ({wardrobeList.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setWardrobeDropdownOpen(false);
                          onNavigateDashboard();
                        }}
                        className="text-[10px] text-[#2D5A47] font-bold hover:underline cursor-pointer"
                      >
                        Buka Profil
                      </button>
                    </div>

                    {wardrobeList.length === 0 ? (
                      <p className="px-2 py-3 text-neutral-400 text-center text-[11px]">
                        Belum ada pakaian di lemari profil. Buka menu profil untuk menambah baju.
                      </p>
                    ) : (
                      wardrobeList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setInputValue(`Tolong padukan ${item.name} (${item.color}) dari lemariku dengan produk UMKM yang serasi`);
                            setWardrobeDropdownOpen(false);
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-[#FAF9F5] text-neutral-800 flex items-center gap-2.5 cursor-pointer transition-colors border border-transparent hover:border-[#E8E4D9]"
                        >
                          <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover bg-neutral-100 shrink-0" />
                          <div className="truncate flex-1">
                            <span className="font-semibold block truncate text-[11px] text-[#162D24]">{item.name}</span>
                            <span className="text-[9px] text-neutral-400 block">{item.color} • {item.category}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Tanya outfit, padu padan warna, ukuran cm baju, atau ketik pertanyaanmu..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-[#162D24] focus:outline-none disabled:opacity-50 font-medium placeholder:text-neutral-400"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-[#162D24] hover:bg-[#203D31] text-white flex items-center justify-center disabled:opacity-30 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
                title="Kirim Pesan"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[10px] text-neutral-400 text-center mt-2">
              Outfitly Stylist memadukan ukuran sentimeter nyata (cm) dan kurasi produk lokal terverifikasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
