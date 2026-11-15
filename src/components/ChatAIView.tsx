'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserOnboardingProfile, ChatMessage, UMKMProductPost, WardrobeItem, ChatSession } from '@/types';
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
  ChevronDown,
  History,
  Image as ImageIcon,
  X,
  Trash2,
  Clock,
  ExternalLink,
  Zap,
  Crown,
  AlertCircle
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

const CHAT_SESSIONS_STORAGE_KEY = 'outfitly_chat_sessions_v2';
const DAILY_LIMIT = 10;

// Clean markdown formatter
function formatStylistText(text: string) {
  const parts = text.split('\n');
  return parts.map((line, lineIdx) => {
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
  
  // AI Mode: 'stylist_pro' (analisis menyeluruh) vs 'link_only' (mode biasa hanya kirim link-link)
  const [aiMode, setAiMode] = useState<'stylist_pro' | 'link_only'>('stylist_pro');

  // Image Upload State
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Daily Quota Limit
  const getTodayKey = () => `outfitly_ai_usage_${new Date().toISOString().slice(0, 10)}`;
  const [usageCount, setUsageCount] = useState<number>(0);

  // Chat History & Session Management
  const [sessionId, setSessionId] = useState<string>(() => `session-${Date.now()}`);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    // Load daily usage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(getTodayKey());
        setUsageCount(stored ? parseInt(stored, 10) : 0);
      } catch (e) {}

      // Load past sessions
      try {
        const rawSessions = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
        if (rawSessions) {
          setSavedSessions(JSON.parse(rawSessions));
        }
      } catch (e) {}
    }

    const updateWardrobe = () => {
      setWardrobeList(getStoredWardrobe());
    };
    updateWardrobe();
    window.addEventListener('outfitly_wardrobe_updated', updateWardrobe);
    return () => window.removeEventListener('outfitly_wardrobe_updated', updateWardrobe);
  }, []);

  const remainingQuota = Math.max(0, DAILY_LIMIT - usageCount);

  const incrementUsage = () => {
    const updated = usageCount + 1;
    setUsageCount(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getTodayKey(), updated.toString());
      } catch (e) {}
    }
  };

  const resetUsageDemo = () => {
    setUsageCount(0);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getTodayKey(), '0');
      } catch (e) {}
    }
    if (onShowToast) onShowToast('Kuota harian AI berhasil direset.');
  };

  const displayName = username || userProfile?.username || 'Teman Gaya';
  const initialWelcomeText = `Halo ${displayName}! Selamat datang di Outfitly Stylist.

Aku siap membantumu menemukan inspirasi outfit yang cocok dengan karakteristik fisik dan koleksi lemarimu:
• **Skin Tone:** ${userProfile?.skinTone ? (userProfile.skinTone === 'cool' ? 'Cool Undertone' : userProfile.skinTone === 'warm' ? 'Warm Undertone (Sawo Matang)' : 'Neutral Undertone') : 'Warm Undertone'}
• **Body Shape:** ${userProfile?.bodyShape ? userProfile.bodyShape.toUpperCase().replace('_', ' ') : 'Hourglass'}
• **Panduan Ukuran (cm):** ${userProfile?.measurements?.chestBustCm ? `Lingkar Dada ${userProfile.measurements.chestBustCm}cm, Pinggang ${userProfile.measurements.waistCm}cm` : 'Bisa diisi di profil untuk akurasi sentimeter'}

Kamu bisa menanyakan padu-padan baju di lemarimu, rekomendasi busana UMKM & preloved sesuai budget, atau mengunggah foto pakaian untuk dicocokkan!`;

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

  // Handle Initial Wardrobe Item navigation
  useEffect(() => {
    if (initialWardrobeItems && initialWardrobeItems.length > 0) {
      const itemsStr = initialWardrobeItems.map(i => `${i.name} (${i.color})`).join(', ');
      handleSend(`Tolong buatkan paduan outfit yang serasi dari produk UMKM untuk pakaian lemariku: ${itemsStr}`);
    }
  }, []);

  const quickChips = [
    '👗 Padukan baju lemariku dengan produk UMKM',
    '✨ Outfit kasual minimalis di bawah Rp250.000',
    '📏 Rekomendasi outer yang pas lingkar dada',
    '🎨 Padu padan warna earth tone sawo matang'
  ];

  // Helper to persist current session to storage
  const saveSessionToStorage = (currentMsgs: ChatMessage[]) => {
    if (currentMsgs.length <= 1) return;
    const userMsg = currentMsgs.find(m => m.sender === 'user');
    const title = userMsg ? userMsg.text.slice(0, 32) + (userMsg.text.length > 32 ? '...' : '') : 'Konsultasi Outfit';

    const newSession: ChatSession = {
      id: sessionId,
      title,
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      messages: currentMsgs
    };

    setSavedSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      const updated = [newSession, ...filtered];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  // Start New Chat (Save previous & Reset)
  const handleStartNewChat = () => {
    if (messages.length > 1) {
      saveSessionToStorage(messages);
    }
    const newId = `session-${Date.now()}`;
    setSessionId(newId);
    setAttachedImage(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: initialWelcomeText,
        timestamp: 'Baru saja',
        recommendedProducts: INITIAL_MARKETPLACE_PRODUCTS.slice(0, 2)
      }
    ]);
    if (onShowToast) {
      onShowToast('Percakapan baru dimulai. Sesi sebelumnya tersimpan di Riwayat.');
    }
  };

  // Open Past Session from History
  const handleOpenPastSession = (session: ChatSession) => {
    // save current before switching
    if (messages.length > 1) {
      saveSessionToStorage(messages);
    }
    setSessionId(session.id);
    setMessages(session.messages);
    setIsHistoryOpen(false);
    if (onShowToast) {
      onShowToast(`Membuka sesi: "${session.title}"`);
    }
  };

  // Delete Past Session
  const handleDeleteSession = (sessIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSessions.filter(s => s.id !== sessIdToDelete);
    setSavedSessions(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {}
    }
    if (onShowToast) {
      onShowToast('Sesi riwayat percakapan dihapus.');
    }
  };

  // File Image Attachment Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      if (onShowToast) onShowToast('Ukuran foto maksimal 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedImage(base64);
      if (onShowToast) onShowToast('Foto berhasil dilampirkan ke pesan!');
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

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
        setMessages(prev => {
          const updated = [
            ...prev,
            {
              id: Date.now().toString(),
              sender: 'ai' as const,
              text: fullText,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              recommendedProducts: products
            }
          ];
          saveSessionToStorage(updated);
          return updated;
        });
      } else {
        setStreamedText(fullText.slice(0, currentIndex));
      }
    }, speed);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if ((!text.trim() && !attachedImage) || isTyping) return;

    if (remainingQuota <= 0) {
      if (onShowToast) {
        onShowToast('Batas kuota harian konsultasi tercapai. Anda dapat mereset kuota demo.');
      }
      return;
    }

    const currentImg = attachedImage;
    setAttachedImage(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim() || 'Tolong analisis dan carikan paduan outfit yang cocok untuk foto pakaian ini.',
      imageUrl: currentImg || undefined,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    incrementUsage();

    try {
      const res = await fetch('/api/ai-stylist-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          imageUrl: currentImg || undefined,
          aiMode,
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
      .map(m => `[${m.sender === 'ai' ? 'Outfitly Stylist' : 'User'}] (${m.timestamp}):\n${m.text}\n`)
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
    <div className="flex h-[calc(100vh-80px)] w-full bg-[#F7F6F2] overflow-hidden relative">
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

          {/* New Chat Button */}
          <button 
            onClick={handleStartNewChat}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer bg-white/10" 
            title="Mulai Chat Baru"
          >
            <MessageSquarePlus className="w-5 h-5 text-[#162D24]" />
          </button>

          {/* Chat History Icon Button */}
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer relative" 
            title="Buka Riwayat Percakapan"
          >
            <History className="w-5 h-5 text-[#162D24]" />
            {savedSessions.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#162D24]" />
            )}
          </button>

          {/* Marketplace Icon */}
          <button 
            onClick={onNavigateReference}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer" 
            title="Katalog & Komunitas Feed"
          >
            <Compass className="w-5 h-5 text-[#162D24]" />
          </button>

          {/* Help Icon */}
          <button 
            onClick={onOpenHelp}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 cursor-pointer" 
            title="Bantuan & Customer Service AI"
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
        <div className="min-h-14 py-2 px-4 sm:px-6 flex flex-wrap items-center justify-between text-[#162D24] select-none border-b border-[#E5E0D5] bg-white shrink-0 gap-3">
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
                Konsultan Gaya Personal & Rekomendasi Busana Lokal
              </p>
            </div>
          </div>

          {/* Mode AI Switcher: Mode Cepat (Link-Only) vs Stylist Pro */}
          <div className="flex items-center bg-[#FAF9F5] p-1 rounded-xl border border-[#DDD8CC] text-xs">
            <button
              onClick={() => {
                setAiMode('link_only');
                if (onShowToast) onShowToast('Mode Cepat (Link-Only) aktif.');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                aiMode === 'link_only'
                  ? 'bg-[#162D24] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-[#162D24]'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Mode Cepat (Link-Only)</span>
            </button>

            <button
              onClick={() => {
                setAiMode('stylist_pro');
                if (onShowToast) onShowToast('Mode Stylist Pro aktif.');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                aiMode === 'stylist_pro'
                  ? 'bg-[#162D24] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-[#162D24]'
              }`}
            >
              <Crown className="w-3 h-3 text-[#8EA89D]" />
              <span>Stylist Pro</span>
            </button>
          </div>

          {/* Right Action Controls: Limit Quota, New Chat, History */}
          <div className="flex items-center gap-2">
            {/* Daily Limit Quota Badge */}
            <div 
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                remainingQuota > 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
              title="Sisa kuota konsultasi gratis hari ini"
            >
              <span>Sisa Kuota: <strong>{remainingQuota}/{DAILY_LIMIT}</strong></span>
              {remainingQuota === 0 && (
                <button
                  onClick={resetUsageDemo}
                  className="underline text-[10px] text-rose-900 ml-1 cursor-pointer"
                  title="Reset kuota untuk testing"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={handleStartNewChat}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#DDD8CC] text-xs font-semibold text-[#162D24] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Mulai percakapan baru"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Chat Baru</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E0] border border-[#DDD8CC] text-xs font-semibold text-[#162D24] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Lihat riwayat percakapan"
            >
              <History className="w-3.5 h-3.5 text-[#2D5A47]" />
              <span className="hidden sm:inline">Riwayat</span>
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

        {/* Center Messages Feed */}
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
                  /* User Message Bubble */
                  <div className="flex justify-end animate-fadeIn">
                    <div className="max-w-xl bg-[#1E3A2F] text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs sm:text-sm shadow-xs leading-relaxed">
                      {msg.imageUrl && (
                        <div className="mb-2 overflow-hidden rounded-xl border border-white/20">
                          <img
                            src={msg.imageUrl}
                            alt="Foto Pakaian Pengguna"
                            className="max-h-48 w-auto object-cover rounded-xl"
                          />
                        </div>
                      )}
                      <p>{msg.text}</p>
                      <span className="block text-[10px] text-neutral-300 text-right mt-1.5">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* AI Message Bubble */
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

                      {/* Product Recommendation Cards */}
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
                                      {p.sellerType === 'community_preloved' ? 'Preloved' : p.sellerType === 'collab_mitra' ? 'Collab Mitra' : 'UMKM'}
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
                <span>
                  {aiMode === 'link_only' 
                    ? 'Sedang mencari link produk cepat...' 
                    : 'Stylist sedang meracik kurasi & analisis fitting cm...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 3. Floating Bottom Input Bar */}
        <div className="bg-gradient-to-t from-[#F7F6F2] via-[#F7F6F2] to-transparent pt-2 pb-5 px-4 sm:px-6 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Limit Warning Notice if Quota Expired */}
            {remainingQuota <= 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Batas 10 konsultasi gratis hari ini telah tercapai. Kuota akan diperbarui besok.</span>
                </div>
                <button
                  type="button"
                  onClick={resetUsageDemo}
                  className="font-bold underline text-xs cursor-pointer ml-2 shrink-0"
                >
                  Reset Kuota Demo
                </button>
              </div>
            )}

            {/* Image Preview Chip if attached */}
            {attachedImage && (
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#DDD8CC] shadow-xs animate-fadeIn">
                <img src={attachedImage} alt="Preview" className="w-7 h-7 rounded-lg object-cover" />
                <span className="text-xs text-neutral-600 font-medium">Foto pakaian terlampir</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  title="Hapus foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

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

              {/* Image Upload Input Trigger */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-neutral-500 hover:text-[#162D24] hover:bg-[#FAF9F5] rounded-xl transition-colors cursor-pointer border border-[#DDD8CC]"
                title="Unggah Foto Pakaian (Fitur Gambar)"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={
                  attachedImage 
                    ? "Foto terpasang. Ketik pertanyaanmu atau langsung kirim..." 
                    : aiMode === 'link_only'
                      ? "Mode Cepat: Cari link produk kemeja, celana, dress..."
                      : "Tanya padu padan warna, ukuran cm baju, atau rekomendasi..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping || remainingQuota <= 0}
                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-[#162D24] focus:outline-none disabled:opacity-50 font-medium placeholder:text-neutral-400"
              />

              <button
                type="submit"
                disabled={(!inputValue.trim() && !attachedImage) || isTyping || remainingQuota <= 0}
                className="w-9 h-9 rounded-xl bg-[#162D24] hover:bg-[#203D31] text-white flex items-center justify-center disabled:opacity-30 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
                title="Kirim Pesan"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1">
              <span>{aiMode === 'link_only' ? '⚡ Mode Cepat: Fokus daftar link produk & harga' : '✨ Stylist Pro: Analisis sentimeter & paduan gaya'}</span>
              <span>Outfitly Stylist • Produk Lokal Indonesia</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Chat History Drawer / Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-slideInRight">
            <div className="p-5 border-b border-[#F0EFEA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#2D5A47]" />
                <h3 className="font-serif font-bold text-base text-[#162D24]">Riwayat Percakapan</h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Past Sessions */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {savedSessions.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-neutral-300" />
                  <p>Belum ada riwayat percakapan tersimpan.</p>
                  <p className="text-[11px] text-neutral-500">
                    Setiap percakapan akan otomatis disimpan saat kamu mengklik Chat Baru.
                  </p>
                </div>
              ) : (
                savedSessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => handleOpenPastSession(sess)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      sess.id === sessionId
                        ? 'bg-[#EAF2EE] border-[#8EA89D]'
                        : 'bg-[#FAF9F5] border-[#E8E4D9] hover:bg-white hover:border-[#162D24]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#162D24] truncate group-hover:text-[#2D5A47]">
                        {sess.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {sess.createdAt} • {sess.messages.length} pesan
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-2"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-[#F0EFEA] space-y-2">
              <button
                onClick={() => {
                  handleStartNewChat();
                  setIsHistoryOpen(false);
                }}
                className="w-full py-3 bg-[#162D24] hover:bg-[#203D31] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4 text-[#8EA89D]" />
                <span>Mulai Percakapan Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
