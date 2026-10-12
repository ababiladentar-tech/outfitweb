'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  HelpCircle, 
  Heart, 
  User, 
  Sparkles, 
  Compass, 
  LayoutDashboard, 
  X,
  Package,
  Store,
  Shirt,
  Layers
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

        {/* Right: Saved Items, Help & Auth */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-xs font-semibold">
          {/* Saved Items Button */}
          <button
            onClick={() => onNavigate('saved')}
            className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
              currentView === 'saved' ? 'bg-[#244237] text-white' : 'hover:bg-white/10 text-neutral-200'
            }`}
            title="Saved Outfits"
          >
            <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-[#E58B94] text-[#E58B94]' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E58B94] text-[#162D24] text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>

          {/* Help Button */}
          <button 
            onClick={onOpenHelp}
            className="hidden sm:flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors uppercase tracking-wider px-2 py-1"
            title="Bantuan & Panduan"
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
            <span>Marketplace & Katalog</span>
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
              <Heart className="w-4 h-4 text-[#E58B94]" />
              <span>Saved Outfits</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#E58B94] text-[#162D24] text-xs font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
