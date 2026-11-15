'use client';

import React from 'react';
import { 
  Home, 
  Sparkles, 
  Compass, 
  BookmarkCheck, 
  User 
} from 'lucide-react';
import { ActiveAppView } from '@/types';

interface BottomNavBarProps {
  currentView: ActiveAppView;
  onNavigate: (view: ActiveAppView) => void;
  savedCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onNavigate,
  savedCount
}) => {
  const navItems = [
    {
      id: 'home' as ActiveAppView,
      label: 'Beranda',
      icon: Home
    },
    {
      id: 'chat' as ActiveAppView,
      label: 'Stylist',
      icon: Sparkles
    },
    {
      id: 'reference' as ActiveAppView,
      label: 'Katalog',
      icon: Compass
    },
    {
      id: 'saved' as ActiveAppView,
      label: 'Disimpan',
      icon: BookmarkCheck,
      badge: savedCount > 0 ? savedCount : undefined
    },
    {
      id: 'dashboard' as ActiveAppView,
      label: 'Profil',
      icon: User
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#162D24]/95 backdrop-blur-md border-t border-[#2A483B] px-3 py-1.5 shadow-2xl safe-area-bottom select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'chat' && currentView === 'outfit_builder');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-[#8EA89D]/75 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#8EA89D]' : 'text-current'
                  }`} 
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-1 bg-[#8EA89D] text-[#162D24] text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#8EA89D] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
