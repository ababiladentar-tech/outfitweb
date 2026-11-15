'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  HelpCircle, 
  BookmarkCheck,
  Bell,
  User, 
  Sparkles, 
  Compass, 
  LayoutDashboard, 
  X,
  Package,
  Store,
  Shirt,
  Layers,
  Check,
  ChevronRight
} from 'lucide-react';
import { ActiveAppView } from '@/types';

interface HeaderProps {
  currentView: ActiveAppView;
  onNavigate: (view: ActiveAppView) => void;
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
  onOpenHelp: () => void;
  user: { username?: string; name?: string } | null;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenOnboarding,
  onOpenHelp,
  user,
  savedCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Diskon Spesial Mitra UMKM',
      message: 'Atelier Senja memberikan potongan 20% untuk koleksi linen baru!',
      time: '10m lalu',
      read: false,
      tag: 'Promo'
    },
    {
      id: 'n2',
      title: 'Koleksi Baru Ditambahkan',
      message: 'Batik Modern Solo baru saja merilis kemeja etnik sawo matang.',
      time: '1 jam lalu',
      read: false,
      tag: 'Mitra'
    },
    {
      id: 'n3',
      title: 'Inspirasi Gaya Sawo Matang',
      message: 'Stylist telah menyusun 3 ide outfit kasual yang cocok dengan undertone-mu.',
      time: '3 jam lalu',
      read: true,
      tag: 'Stylist'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#162D24] text-white border-b border-[#254236] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-[#8EA89D] transition-colors p-1"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Outfitly Official Brand Logo Badge */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer px-3.5 py-1.5 rounded-2xl bg-[#8EA89D] flex items-center justify-center shadow-xs hover:opacity-95 transition-opacity select-none group"
            title="Outfitly Home"
          >
            <img
              src="/assets/oftea-logo.png"
              alt="Outfitly: Find Your Perfect Style"
              className="h-6 sm:h-8 object-contain mix-blend-multiply group-hover:scale-102 transition-transform"
            />
          </div>
        </div>

        {/* Center: Desktop Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs font-medium tracking-wide text-neutral-200">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-white transition-all py-1 ${
              currentView === 'home' ? 'text-white border-b-2 border-[#8EA89D] font-semibold' : ''
            }`}
          >
            Beranda
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className={`hover:text-white transition-all py-1 flex items-center gap-1.5 ${
              currentView === 'chat' ? 'text-white border-b-2 border-[#8EA89D] font-semibold' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8EA89D]" />
            <span>Konsultasi Stylist</span>
          </button>

          <button
            onClick={() => onNavigate('reference')}
            className={`hover:text-white transition-all py-1 flex items-center gap-1.5 ${
              currentView === 'reference' ? 'text-white border-b-2 border-[#8EA89D] font-semibold' : ''
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#8EA89D]" />
            <span>Marketplace & Katalog</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`hover:text-white transition-all py-1 flex items-center gap-1.5 ${
              currentView === 'dashboard' ? 'text-white border-b-2 border-[#8EA89D] font-semibold' : ''
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#8EA89D]" />
            <span>Gaya & Profil</span>
          </button>
        </nav>

        {/* Right: Saved Items, Notifications, Help & Auth */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold relative">
          {/* Saved Items Button (Fashion Bookmark Icon) */}
          <button
            onClick={() => onNavigate('saved')}
            className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'saved' ? 'bg-[#244237] text-white shadow-xs' : 'hover:bg-white/10 text-neutral-200'
            }`}
            title="Outfit Tersimpan (Saved Outfits)"
          >
            <BookmarkCheck className={`w-5 h-5 ${savedCount > 0 ? 'text-[#8EA89D]' : 'text-neutral-300'}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8EA89D] text-[#162D24] text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl hover:bg-white/10 text-neutral-200 transition-colors cursor-pointer"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 text-neutral-200" />
              {unreadCount > 0 && (
                <span className="absolute 1.5 top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#162D24] animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white text-[#162D24] rounded-2xl shadow-2xl border border-[#D8D2C4] overflow-hidden z-50 animate-fadeIn text-left">
                <div className="p-3.5 bg-[#FAF9F5] border-b border-[#E8E4D9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-xs text-[#162D24]">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#162D24] text-white text-[10px] font-bold">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-[#2D5A47] hover:underline cursor-pointer"
                    >
                      Tandai Sudah Dibaca
                    </button>
                  )}
                </div>

                <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        setNotificationsOpen(false);
                        onNavigate('reference');
                      }}
                      className={`p-3.5 hover:bg-[#FAF9F5] transition-colors cursor-pointer ${
                        !n.read ? 'bg-[#EAF2EE]/50 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                          {n.tag}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-normal">{n.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#162D24] leading-tight mb-0.5">{n.title}</h4>
                      <p className="text-[11px] text-neutral-600 font-normal leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-[#FAF9F5] border-t border-[#E8E4D9] text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigate('reference');
                    }}
                    className="text-[11px] font-bold text-[#2D5A47] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>Lihat Promo & Update Terbaru</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button 
            onClick={onOpenHelp}
            className="hidden sm:flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors uppercase tracking-wider px-2 py-1"
            title="Bantuan, FAQ & CS AI"
          >
            <HelpCircle className="w-4 h-4 text-[#8EA89D]" />
            <span className="text-[11px]">BANTUAN</span>
          </button>

          {/* User Profile or Sign In */}
          {user?.username ? (
            <div 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#244237] hover:bg-[#2e5244] border border-[#3b6051] cursor-pointer transition-colors"
              title="Lihat Profil Gaya & Ukuran"
            >
              <div className="w-6 h-6 rounded-full bg-[#8EA89D] text-[#162D24] flex items-center justify-center text-[10px] font-black">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-white max-w-[100px] truncate hidden sm:inline-block">
                @{user.username}
              </span>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-full bg-transparent hover:bg-white/10 text-white border border-neutral-400 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              SIGN UP | LOGIN
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1E3A2F] border-b border-[#2F4F42] px-4 py-4 space-y-2 animate-fadeIn text-sm font-semibold">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-xl transition-colors ${
              currentView === 'home' ? 'bg-[#2F4F42] text-white font-bold' : 'text-neutral-300'
            }`}
          >
            Beranda
          </button>

          <button
            onClick={() => {
              onNavigate('chat');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center gap-2 ${
              currentView === 'chat' ? 'bg-[#2F4F42] text-white font-bold' : 'text-neutral-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#8EA89D]" />
            <span>Konsultasi Stylist</span>
          </button>

          <button
            onClick={() => {
              onNavigate('reference');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center gap-2 ${
              currentView === 'reference' ? 'bg-[#2F4F42] text-white font-bold' : 'text-neutral-300'
            }`}
          >
            <Compass className="w-4 h-4 text-[#8EA89D]" />
            <span>Marketplace & Komunitas</span>
          </button>

          <button
            onClick={() => {
              onNavigate('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center gap-2 ${
              currentView === 'dashboard' ? 'bg-[#2F4F42] text-white font-bold' : 'text-neutral-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#8EA89D]" />
            <span>Gaya, Ukuran & Lemari</span>
          </button>

          <button
            onClick={() => {
              onNavigate('saved');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center justify-between ${
              currentView === 'saved' ? 'bg-[#2F4F42] text-white font-bold' : 'text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-[#8EA89D]" />
              <span>Outfit Tersimpan</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#8EA89D] text-[#162D24] text-xs font-bold">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onOpenHelp();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl transition-colors flex items-center gap-2 text-neutral-300"
          >
            <HelpCircle className="w-4 h-4 text-[#8EA89D]" />
            <span>Bantuan, FAQ & CS AI</span>
          </button>
        </div>
      )}
    </header>
  );
};
