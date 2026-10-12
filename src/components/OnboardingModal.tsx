'use client';

import React, { useState, useEffect } from 'react';
import {
  UserOnboardingProfile,
  GenderType,
  SkinToneVeinType,
  BodyShapeType,
  FaceShapeType,
  StylePreferenceType
} from '@/types';
import { X, Check, Plus, Palette, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserOnboardingProfile) => void;
  initialProfile?: UserOnboardingProfile | null;
  username?: string;
  birthDate?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialProfile,
  username,
  birthDate
}) => {
  // Step 1 to 6 matches Figma node 219-624 flow (Gender -> Skin Tone -> Body Shape -> Face Shape -> Color Palette -> Style Preferences)
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  const [profile, setProfile] = useState<UserOnboardingProfile>(() => {
    return (
      initialProfile || {
        username: username || 'UserGaya',
        birthDate: birthDate || '2002-08-15',
        gender: 'girl',
        skinTone: 'warm',
        bodyShape: 'hourglass',
        preferredColors: ['#5C3826', '#8C6D58', '#C5A086', '#D7C4B7', '#FAF0E6'],
        stylePreferences: ['casual', 'minimalist'],
        faceShape: 'oval'
      }
    );
  });

  useEffect(() => {
    if (username || birthDate) {
      setProfile((prev) => ({
        ...prev,
        username: username || prev.username,
        birthDate: birthDate || prev.birthDate
      }));
    }
  }, [username, birthDate]);

  const [customStyleInput, setCustomStyleInput] = useState('');
  const [showCustomStyleInput, setShowCustomStyleInput] = useState(false);
  const [customHexInput, setCustomHexInput] = useState('#8EA89D');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log(e);
      }
      onComplete(profile);
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  // 12 Primary Hues on the Interactive Color Wheel
  const colorWheelHues = [
    '#E63946', '#F4A261', '#E9C46A', '#52B788',
    '#2A9D8F', '#00B4D8', '#457B9D', '#1D3557',
    '#6A4C93', '#8338EC', '#D90429', '#264653'
  ];

  // Curated Preset Palette Themes
  const presetThemes = [
    { name: 'Warm Earthy', colors: ['#5C3826', '#8C6D58', '#C5A086', '#D7C4B7', '#FAF0E6'] },
    { name: 'Sage & Forest', colors: ['#162D24', '#2F4F42', '#52B788', '#8EA89D', '#EFEFEA'] },
    { name: 'Pastel Dream', colors: ['#F3C5C5', '#FCE2D6', '#E9C46A', '#A8D8EA', '#FAF0E6'] },
    { name: 'Monochrome', colors: ['#111111', '#333333', '#777777', '#CCCCCC', '#FFFFFF'] },
    { name: 'Navy & Gold', colors: ['#0B1D3A', '#1D3557', '#457B9D', '#E9C46A', '#F4A261'] }
  ];

  const toggleColor = (hex: string) => {
    const formatted = hex.toUpperCase();
    if (profile.preferredColors.includes(formatted)) {
      setProfile({
        ...profile,
        preferredColors: profile.preferredColors.filter((c) => c.toUpperCase() !== formatted)
      });
    } else {
      if (profile.preferredColors.length >= 8) {
        setProfile({
          ...profile,
          preferredColors: [...profile.preferredColors.slice(1), formatted]
        });
      } else {
        setProfile({
          ...profile,
          preferredColors: [...profile.preferredColors, formatted]
        });
      }
    }
  };

  // Generate SVG Pie Slices for the Interactive Color Wheel
  const pieSlices = colorWheelHues.map((hex, i) => {
    const startAngle = (i * 30 - 90) * (Math.PI / 180);
    const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
    const r = 90;
    const cx = 100;
    const cy = 100;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
    const isSelected = profile.preferredColors.some(
      (c) => c.toUpperCase() === hex.toUpperCase()
    );
    return { hex, pathData, isSelected, index: i };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Blurred Fashion Background Wallpaper matching Figma */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-cover bg-center transition-opacity"
        style={{
          backgroundImage: 'url(/elements/background%20home.jpg)',
          filter: 'brightness(0.35) blur(6px)'
        }}
      />
      <div className="fixed inset-0 bg-[#162D24]/60 backdrop-blur-sm pointer-events-none" />

      {/* Floating Dark Green Modal Card matching Figma Frames 4-6 */}
      <div className="relative w-full max-w-xl bg-[#1E3A2F] text-white rounded-3xl p-6 sm:p-9 border border-[#2F4F42] shadow-2xl z-10 animate-fadeIn">
        {/* Top Segmented Progress Bar: Exactly 6 Horizontal Pill Dashes */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-9 sm:w-12 rounded-full transition-all duration-300 ${
                index + 1 === step
                  ? 'bg-[#8EA89D]'
                  : index + 1 < step
                  ? 'bg-[#8EA89D]/60'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: Figma Frame 4 - which gender do you identify as ? */}
        {step === 1 && (
          <div className="text-center space-y-7 py-3 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              which gender do you identify as ?
            </h2>

            <div className="flex items-center justify-center gap-8 sm:gap-14 pt-2">
              {/* BOY */}
              <button
                type="button"
                onClick={() => setProfile({ ...profile, gender: 'boy' })}
                className="flex flex-col items-center gap-3 cursor-pointer group focus:outline-none"
              >
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all ${
                    profile.gender === 'boy'
                      ? 'bg-[#8EA89D] text-[#162D24] ring-4 ring-white shadow-xl scale-105'
                      : 'bg-[#A8D8EA] text-[#1E3A2F] opacity-75 hover:opacity-100 hover:scale-102'
                  }`}
                >
                  <svg
                    className="w-12 h-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="10" cy="14" r="5" />
                    <line x1="19" y1="5" x2="13.6" y2="10.4" />
                    <polyline points="19 10 19 5 14 5" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-neutral-200 group-hover:text-white">
                  BOY
                </span>
              </button>

              {/* GIRL */}
              <button
                type="button"
                onClick={() => setProfile({ ...profile, gender: 'girl' })}
                className="flex flex-col items-center gap-3 cursor-pointer group focus:outline-none"
              >
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all ${
                    profile.gender === 'girl'
                      ? 'bg-[#8EA89D] text-[#162D24] ring-4 ring-white shadow-xl scale-105'
                      : 'bg-[#F3C5C5] text-[#1E3A2F] opacity-75 hover:opacity-100 hover:scale-102'
                  }`}
                >
                  <svg
                    className="w-12 h-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="9" r="5" />
                    <line x1="12" y1="14" x2="12" y2="21" />
                    <line x1="9" y1="18" x2="15" y2="18" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-neutral-200 group-hover:text-white">
                  GIRL
                </span>
              </button>
            </div>

            {/* Confirm CTA matching Figma */}
            <div className="pt-6 text-center">
              <button
                type="button"
                onClick={handleNext}
                className="px-12 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer hover:scale-102"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Figma Frame 5 - Chose Your Skin Tone */}
        {step === 2 && (
          <div className="text-center space-y-6 py-2 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Chose Your Skin Tone
            </h2>

            <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-2 max-w-xl mx-auto">
              {/* Cool Tone */}
              <div
                onClick={() => setProfile({ ...profile, skinTone: 'cool' })}
                className={`p-3 sm:p-4 rounded-3xl border cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  profile.skinTone === 'cool'
                    ? 'border-[#8EA89D] bg-white/15 ring-2 ring-[#8EA89D] shadow-xl scale-105'
                    : 'border-white/10 hover:bg-white/5 opacity-80'
                }`}
              >
                <div className="w-16 sm:w-20 h-28 sm:h-32 relative flex items-center justify-center">
                  <svg viewBox="0 0 100 180" className="w-full h-full drop-shadow-md">
                    <path
                      d="M25 180 L25 100 C25 80, 10 75, 10 55 C10 40, 20 40, 22 55 L25 70 C25 50, 25 15, 35 15 C45 15, 45 45, 45 60 C45 35, 45 5, 55 5 C65 5, 65 35, 65 60 C65 40, 65 15, 75 15 C85 15, 85 45, 85 70 C85 55, 85 30, 95 30 C105 30, 100 65, 95 85 L90 100 L90 180 Z"
                      fill="#FCE2D6"
                    />
                    <path
                      d="M50 170 Q52 140 46 125 Q40 110 35 90 M46 125 Q58 115 62 95 M48 140 Q40 130 38 120"
                      stroke="#52B788"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.8"
                    />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Cool Tone</span>
                  <span className="text-[10px] text-neutral-300 block leading-tight">
                    Olive / Greenish Veins
                  </span>
                </div>
              </div>

              {/* Neutral Tone */}
              <div
                onClick={() => setProfile({ ...profile, skinTone: 'neutral' })}
                className={`p-3 sm:p-4 rounded-3xl border cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  profile.skinTone === 'neutral'
                    ? 'border-[#8EA89D] bg-white/15 ring-2 ring-[#8EA89D] shadow-xl scale-105'
                    : 'border-white/10 hover:bg-white/5 opacity-80'
                }`}
              >
                <div className="w-16 sm:w-20 h-28 sm:h-32 relative flex items-center justify-center">
                  <svg viewBox="0 0 100 180" className="w-full h-full drop-shadow-md">
                    <path
                      d="M25 180 L25 100 C25 80, 10 75, 10 55 C10 40, 20 40, 22 55 L25 70 C25 50, 25 15, 35 15 C45 15, 45 45, 45 60 C45 35, 45 5, 55 5 C65 5, 65 35, 65 60 C65 40, 65 15, 75 15 C85 15, 85 45, 85 70 C85 55, 85 30, 95 30 C105 30, 100 65, 95 85 L90 100 L90 180 Z"
                      fill="#EBB88A"
                    />
                    <path
                      d="M50 170 Q52 140 46 125 Q40 110 35 90 M46 125 Q58 115 62 95 M48 140 Q40 130 38 120"
                      stroke="#00B4D8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.8"
                    />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Neutral Tone</span>
                  <span className="text-[10px] text-neutral-300 block leading-tight">
                    Blue-Green Veins
                  </span>
                </div>
              </div>

              {/* Warm Tone */}
              <div
                onClick={() => setProfile({ ...profile, skinTone: 'warm' })}
                className={`p-3 sm:p-4 rounded-3xl border cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  profile.skinTone === 'warm'
                    ? 'border-[#8EA89D] bg-white/15 ring-2 ring-[#8EA89D] shadow-xl scale-105'
                    : 'border-white/10 hover:bg-white/5 opacity-80'
                }`}
              >
                <div className="w-16 sm:w-20 h-28 sm:h-32 relative flex items-center justify-center">
                  <svg viewBox="0 0 100 180" className="w-full h-full drop-shadow-md">
                    <path
                      d="M25 180 L25 100 C25 80, 10 75, 10 55 C10 40, 20 40, 22 55 L25 70 C25 50, 25 15, 35 15 C45 15, 45 45, 45 60 C45 35, 45 5, 55 5 C65 5, 65 35, 65 60 C65 40, 65 15, 75 15 C85 15, 85 45, 85 70 C85 55, 85 30, 95 30 C105 30, 100 65, 95 85 L90 100 L90 180 Z"
                      fill="#B87F55"
                    />
                    <path
                      d="M50 170 Q52 140 46 125 Q40 110 35 90 M46 125 Q58 115 62 95 M48 140 Q40 130 38 120"
                      stroke="#8338EC"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                    />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Warm Tone</span>
                  <span className="text-[10px] text-neutral-300 block leading-tight">
                    Purple / Bluish Veins
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm CTA matching Figma */}
            <div className="pt-6 flex items-center justify-center relative">
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-0 text-xs text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-12 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer hover:scale-102"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Select Body Shapes */}
        {step === 3 && (
          <div className="text-center space-y-5 py-2 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Select Body Shapes
            </h2>

            {profile.gender === 'girl' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'hourglass', label: 'Hourglass', tag: '⏳' },
                  { id: 'apple', label: 'Apple', tag: '🍎' },
                  { id: 'inverted_triangle', label: 'Inverted Triangle', tag: '🔻' },
                  { id: 'rectangle', label: 'Rectangle', tag: '📐' },
                  { id: 'pear', label: 'Pear', tag: '🍐' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setProfile({ ...profile, bodyShape: item.id as any })}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                      profile.bodyShape === item.id
                        ? 'bg-[#D6E2DC] text-[#162D24] font-bold shadow-md ring-2 ring-white scale-102'
                        : 'bg-[#D6E2DC]/85 hover:bg-[#D6E2DC] text-[#162D24] font-semibold'
                    }`}
                  >
                    <span className="text-xl">{item.tag}</span>
                    <span className="text-xs sm:text-sm flex-1 text-left">{item.label}</span>
                    {profile.bodyShape === item.id ? (
                      <Check className="w-4 h-4 text-[#162D24] shrink-0" />
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'oval', label: 'Oval', tag: '🥚' },
                  { id: 'rectangle', label: 'Rectangle', tag: '📐' },
                  { id: 'triangle', label: 'Triangle', tag: '▲' },
                  { id: 'trapezoid', label: 'Trapezoid', tag: '⬟' },
                  { id: 'inverted_triangle', label: 'Inverted Triangle', tag: '🔻' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setProfile({ ...profile, bodyShape: item.id as any })}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                      profile.bodyShape === item.id
                        ? 'bg-[#D6E2DC] text-[#162D24] font-bold shadow-md ring-2 ring-white scale-102'
                        : 'bg-[#D6E2DC]/85 hover:bg-[#D6E2DC] text-[#162D24] font-semibold'
                    }`}
                  >
                    <span className="text-xl">{item.tag}</span>
                    <span className="text-xs sm:text-sm flex-1 text-left">{item.label}</span>
                    {profile.bodyShape === item.id ? (
                      <Check className="w-4 h-4 text-[#162D24] shrink-0" />
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 flex items-center justify-center relative">
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-0 text-xs text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-12 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer hover:scale-102"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Select Face Shapes */}
        {step === 4 && (
          <div className="text-center space-y-5 py-2 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Select Face Shapes
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
              {[
                { id: 'rectangle', label: 'Rectangle', emoji: '🟨' },
                { id: 'square', label: 'Square', emoji: '⏹' },
                { id: 'hexagonal_straight_base', label: 'Hexagonal', emoji: '🛑' },
                { id: 'round', label: 'Round', emoji: '⚪' },
                { id: 'oval', label: 'Oval', emoji: '🥚' },
                { id: 'triangle_pear', label: 'Triangle', emoji: '▲' },
                { id: 'inverted_triangle_heart', label: 'Heart', emoji: '🤍' },
                { id: 'diamond', label: 'Diamond', emoji: '💎' }
              ].map((face) => (
                <div
                  key={face.id}
                  onClick={() => setProfile({ ...profile, faceShape: face.id as any })}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-between text-center ${
                    profile.faceShape === face.id
                      ? 'border-[#8EA89D] bg-white/20 ring-2 ring-[#8EA89D] scale-105 shadow-md'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#E5B58D] flex items-center justify-center text-lg mb-1 shadow-xs border border-white/20">
                    {face.emoji}
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-200 leading-tight">
                    {face.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 flex items-center justify-center relative">
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-0 text-xs text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-12 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer hover:scale-102"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Choose Your Color Palette */}
        {step === 5 && (
          <div className="text-center space-y-5 py-1 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans uppercase">
                Choose Your Color Palette
              </h2>
              <p className="text-xs text-neutral-300 pt-1">
                Klik warna pada roda atau pilih tema palet busana yang kamu sukai
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              {/* Left Column: Interactive 12-Segment SVG Color Wheel */}
              <div className="md:col-span-6 flex flex-col items-center justify-center space-y-2">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-2xl flex items-center justify-center p-1 bg-black/20 border-2 border-white/20">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full cursor-pointer overflow-visible drop-shadow-lg"
                  >
                    {pieSlices.map((slice) => (
                      <path
                        key={slice.index}
                        d={slice.pathData}
                        fill={slice.hex}
                        onClick={() => toggleColor(slice.hex)}
                        className={`transition-all duration-200 hover:opacity-90 active:scale-95 ${
                          slice.isSelected
                            ? 'stroke-white stroke-[3.5] filter drop-shadow-md'
                            : 'stroke-black/20 stroke-[1]'
                        }`}
                      >
                        <title>{slice.hex} - Klik untuk pilih/hapus</title>
                      </path>
                    ))}

                    <circle cx="100" cy="100" r="26" fill="#1E3A2F" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>

                  <div className="absolute pointer-events-none flex flex-col items-center justify-center">
                    <Palette className="w-4 h-4 text-[#8EA89D]" />
                    <span className="text-[8px] font-extrabold text-white">KLIK</span>
                  </div>
                </div>

                <span className="text-[10px] text-neutral-400">
                  Klik segmen warna untuk tambah/kurang
                </span>
              </div>

              {/* Right Column: Preset Palettes & Custom Hex Color */}
              <div className="md:col-span-6 text-left space-y-2.5">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#8EA89D] block">
                    Pilihan Tema Palet:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {presetThemes.map((theme, idx) => {
                      const isThemeActive = theme.colors.every((c) =>
                        profile.preferredColors.some((pc) => pc.toUpperCase() === c.toUpperCase())
                      );
                      return (
                        <div
                          key={idx}
                          onClick={() => setProfile({ ...profile, preferredColors: [...theme.colors] })}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isThemeActive
                              ? 'bg-white/20 border-[#8EA89D] ring-1 ring-[#8EA89D]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-xs font-bold text-white truncate">{theme.name}</span>
                          <div className="flex items-center rounded-lg overflow-hidden border border-white/20">
                            {theme.colors.map((hex, ci) => (
                              <div
                                key={ci}
                                className="w-4 h-5"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex items-center gap-2 bg-[#162D24] px-2.5 py-1 rounded-xl border border-[#3A5E50]">
                    <input
                      type="color"
                      value={customHexInput}
                      onChange={(e) => setCustomHexInput(e.target.value)}
                      className="w-5 h-5 rounded-md cursor-pointer border-0 bg-transparent p-0"
                      title="Pilih warna kustom"
                    />
                    <span className="text-[10px] font-mono font-bold text-neutral-200">
                      {customHexInput.toUpperCase()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleColor(customHexInput)}
                    className="px-2.5 py-1 rounded-xl bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-extrabold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Active Swatches Bar */}
            <div className="p-2.5 rounded-2xl bg-black/25 border border-white/15 text-left space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-neutral-300">
                  Palet Aktif ({profile.preferredColors.length} warna):
                </span>
                {profile.preferredColors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, preferredColors: [] })}
                    className="text-neutral-400 hover:text-rose-400 text-[10px] underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {profile.preferredColors.map((hex, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleColor(hex)}
                    className="group flex items-center gap-1 pl-1.5 pr-1.5 py-0.5 rounded-lg bg-white/10 hover:bg-rose-500/20 border border-white/20 cursor-pointer transition-colors"
                    title="Klik untuk hapus"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[9px] font-mono font-bold text-white">{hex}</span>
                    <X className="w-2.5 h-2.5 text-neutral-400 group-hover:text-rose-300" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center relative">
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-0 text-xs text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-12 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer hover:scale-102"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Select Style Preferences & Selesai */}
        {step === 6 && (
          <div className="text-center space-y-6 py-2 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Select Style Preferences
            </h2>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-1">
              {[
                { id: 'casual', label: 'Casual' },
                { id: 'formal', label: 'Formal' },
                { id: 'minimalist', label: 'Minimalist' },
                { id: 'streetwear', label: 'Streetwear' },
                { id: 'old_money_smart', label: 'Old Money' },
                { id: 'etnik_batik_modern', label: 'Etnik Modern' }
              ].map((style) => {
                const isSelected = profile.stylePreferences.includes(style.id);
                return (
                  <div
                    key={style.id}
                    onClick={() => {
                      if (isSelected) {
                        setProfile({
                          ...profile,
                          stylePreferences: profile.stylePreferences.filter((s) => s !== style.id)
                        });
                      } else {
                        setProfile({
                          ...profile,
                          stylePreferences: [...profile.stylePreferences, style.id]
                        });
                      }
                    }}
                    className={`py-3 px-4 rounded-full cursor-pointer transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-[#D6E2DC] text-[#162D24] ring-2 ring-white shadow-md scale-102'
                        : 'bg-[#D6E2DC]/80 hover:bg-[#D6E2DC] text-[#162D24]'
                    }`}
                  >
                    <span>{style.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#162D24]" />}
                  </div>
                );
              })}

              <div
                onClick={() => setShowCustomStyleInput(true)}
                className="col-span-2 py-2.5 px-4 rounded-full bg-[#D6E2DC]/80 hover:bg-[#D6E2DC] text-[#162D24] font-black cursor-pointer text-center text-sm shadow-xs"
              >
                +
              </div>
            </div>

            {showCustomStyleInput && (
              <div className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  placeholder="Tambah style (mis: Vintage, Retro)..."
                  value={customStyleInput}
                  onChange={(e) => setCustomStyleInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#162D24] border border-[#3A5E50] text-xs text-white outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customStyleInput.trim()) {
                      setProfile({
                        ...profile,
                        stylePreferences: [...profile.stylePreferences, customStyleInput.trim()]
                      });
                      setCustomStyleInput('');
                      setShowCustomStyleInput(false);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-[#8EA89D] text-[#162D24] font-bold text-xs cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            )}

            <div className="pt-6 flex items-center justify-center relative">
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-0 text-xs text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-12 py-2.5 rounded-full bg-[#8EA89D] hover:bg-[#7D988D] text-[#162D24] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer hover:scale-102"
              >
                Confirm & Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
