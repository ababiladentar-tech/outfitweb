'use client';

import React, { useState, useEffect } from 'react';
import { X, Ruler, Sparkles, Check, Info, ShieldCheck, ArrowRight } from 'lucide-react';
import { BodyMeasurements, FitPreferenceType, UserOnboardingProfile } from '@/types';

interface SmartSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserOnboardingProfile | null;
  onSaveMeasurements: (measurements: BodyMeasurements) => void;
}

export const SmartSizeModal: React.FC<SmartSizeModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveMeasurements
}) => {
  const [chestBustCm, setChestBustCm] = useState<number>(90);
  const [waistCm, setWaistCm] = useState<number>(76);
  const [hipsCm, setHipsCm] = useState<number>(96);
  const [shoulderWidthCm, setShoulderWidthCm] = useState<number>(40);
  const [sleeveLengthCm, setSleeveLengthCm] = useState<number>(56);
  const [bodyLengthCm, setBodyLengthCm] = useState<number>(65);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(58);
  const [preferredFit, setPreferredFit] = useState<FitPreferenceType>('regular');
  const [activeTab, setActiveTab] = useState<'form' | 'guide'>('form');

  useEffect(() => {
    if (userProfile?.measurements) {
      const m = userProfile.measurements;
      if (m.chestBustCm) setChestBustCm(m.chestBustCm);
      if (m.waistCm) setWaistCm(m.waistCm);
      if (m.hipsCm) setHipsCm(m.hipsCm);
      if (m.shoulderWidthCm) setShoulderWidthCm(m.shoulderWidthCm);
      if (m.sleeveLengthCm) setSleeveLengthCm(m.sleeveLengthCm);
      if (m.bodyLengthCm) setBodyLengthCm(m.bodyLengthCm);
      if (m.heightCm) setHeightCm(m.heightCm);
      if (m.weightKg) setWeightKg(m.weightKg);
      if (m.preferredFit) setPreferredFit(m.preferredFit);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const measurements: BodyMeasurements = {
      chestBustCm: Number(chestBustCm),
      waistCm: Number(waistCm),
      hipsCm: Number(hipsCm) || undefined,
      shoulderWidthCm: Number(shoulderWidthCm) || undefined,
      sleeveLengthCm: Number(sleeveLengthCm) || undefined,
      bodyLengthCm: Number(bodyLengthCm) || undefined,
      heightCm: Number(heightCm) || undefined,
      weightKg: Number(weightKg) || undefined,
      preferredFit,
      lastUpdated: new Date().toISOString()
    };
    onSaveMeasurements(measurements);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#162D24] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8EA89D] flex items-center justify-center text-[#162D24] shadow-xs">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold tracking-tight">
                Panduan Ukuran Pas (CM)
              </h2>
              <p className="text-xs text-[#A3BFB2]">
                Ukuran tubuh presisi dalam sentimeter untuk rekomendasi baju tanpa salah ukuran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#E8E4D9] bg-white px-6">
          <button
            onClick={() => setActiveTab('form')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'form'
                ? 'border-[#162D24] text-[#162D24]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Input Ukuran Saya
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-[#162D24] text-[#162D24]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Panduan Cara Ukur (Pita Meteran)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#162D24]">
          {activeTab === 'form' ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Privacy Banner */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#EAF2EE] border border-[#BFD9CD] text-xs text-[#162D24]">
                <ShieldCheck className="w-5 h-5 text-[#2D5A47] shrink-0 mt-0.5" />
                <p>
                  <strong>Data Ukuran Privat:</strong> Data sentimeter ini hanya disimpan secara lokal dan aman di akun Anda untuk membandingkan dimensi pakaian. Kami tidak pernah membagikan angka ukuran fisik Anda kepada penjual.
                </p>
              </div>

              {/* Primary Measurements (Chest & Waist - Required) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                  <span>Ukuran Utama (Untuk Panduan Fitting Akurat)</span>
                  <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-xs">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-[#162D24]">Lingkar Dada (Chest/Bust)</label>
                      <span className="text-sm font-extrabold text-[#162D24] bg-[#F4F1EA] px-2.5 py-0.5 rounded-lg">
                        {chestBustCm} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={chestBustCm}
                      onChange={(e) => setChestBustCm(Number(e.target.value))}
                      className="w-full accent-[#162D24] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                      <span>60 cm</span>
                      <span>100 cm</span>
                      <span>140 cm</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-xs">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-[#162D24]">Lingkar Pinggang (Waist)</label>
                      <span className="text-sm font-extrabold text-[#162D24] bg-[#F4F1EA] px-2.5 py-0.5 rounded-lg">
                        {waistCm} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={130}
                      value={waistCm}
                      onChange={(e) => setWaistCm(Number(e.target.value))}
                      className="w-full accent-[#162D24] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                      <span>50 cm</span>
                      <span>90 cm</span>
                      <span>130 cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Measurements (Hips, Shoulder, Sleeves) */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Ukuran Tambahan (Opsional, Memperkuat Akurasi Celana & Blazer)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D9]">
                    <label className="text-[11px] font-bold block mb-1">Lingkar Pinggul</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={60}
                        max={160}
                        value={hipsCm}
                        onChange={(e) => setHipsCm(Number(e.target.value))}
                        className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs font-bold text-[#162D24]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D9]">
                    <label className="text-[11px] font-bold block mb-1">Lebar Bahu</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={30}
                        max={65}
                        value={shoulderWidthCm}
                        onChange={(e) => setShoulderWidthCm(Number(e.target.value))}
                        className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs font-bold text-[#162D24]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D9]">
                    <label className="text-[11px] font-bold block mb-1">Panjang Lengan</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={30}
                        max={80}
                        value={sleeveLengthCm}
                        onChange={(e) => setSleeveLengthCm(Number(e.target.value))}
                        className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs font-bold text-[#162D24]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D9]">
                    <label className="text-[11px] font-bold block mb-1">Panjang Baju Ideal</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={40}
                        max={140}
                        value={bodyLengthCm}
                        onChange={(e) => setBodyLengthCm(Number(e.target.value))}
                        className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs font-bold text-[#162D24]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational Height & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D9]">
                  <label className="text-[11px] font-bold block mb-1 text-neutral-600">
                    Tinggi Badan (Hanya Referensi)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={120}
                      max={220}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs font-bold text-[#162D24]"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-neutral-400">cm</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D9]">
                  <label className="text-[11px] font-bold block mb-1 text-neutral-600">
                    Berat Badan (Hanya Referensi)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={30}
                      max={180}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3 py-1.5 text-xs font-bold text-[#162D24]"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-neutral-400">kg</span>
                  </div>
                </div>
              </div>

              {/* Fit Preference Selection */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  Preferensi Kelonggaran Pakaian (Fit Style)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'slim', label: 'Slim Fit', desc: 'Pas badan (+3 s/d 5cm)', badge: 'Ketat Ramping' },
                    { id: 'regular', label: 'Regular Fit', desc: 'Standar nyaman (+6 s/d 10cm)', badge: 'Paling Populer' },
                    { id: 'relaxed', label: 'Relaxed Fit', desc: 'Leluasa & santai (+11 s/d 16cm)', badge: 'Flowy' },
                    { id: 'oversized', label: 'Oversized', desc: 'Jatuh lebar / Boxy (+18 s/d 26cm)', badge: 'Streetwear' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPreferredFit(item.id as FitPreferenceType)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        preferredFit === item.id
                          ? 'bg-[#162D24] text-white border-[#162D24] shadow-md'
                          : 'bg-white text-[#162D24] border-[#E8E4D9] hover:border-[#162D24]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{item.label}</span>
                        {preferredFit === item.id && <Check className="w-3.5 h-3.5 text-[#8EA89D]" />}
                      </div>
                      <p className={`text-[10px] leading-tight ${preferredFit === item.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#162D24] hover:bg-[#203D31] text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#8EA89D]" />
                  <span>Simpan Ukuran & Aktifkan Panduan Ukuran Pas</span>
                </button>
              </div>
            </form>
          ) : (
            /* Guide Tab */
            <div className="space-y-4 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-[#E8E4D9] space-y-4">
                <h3 className="font-bold text-sm text-[#162D24]">Cara Mengukur Tubuh Menggunakan Pita Meteran Kain:</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#162D24] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-[#162D24]">Lingkar Dada (Chest/Bust):</h4>
                      <p className="text-neutral-600">
                        Lilitkan pita meteran melingkar di bawah ketiak melewati puncak dada paling menonjol. Bernapaslah normal saat membaca angka.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#162D24] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-[#162D24]">Lingkar Pinggang (Waist):</h4>
                      <p className="text-neutral-600">
                        Ukur bagian pinggang paling ramping (biasanya 2-3 cm tepat di atas pusar). Jangan menahan napas atau menarik meteran terlalu kencang.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#162D24] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-[#162D24]">Lebar Bahu (Shoulder Width):</h4>
                      <p className="text-neutral-600">
                        Ukur dari ujung tulang bahu kiri lurus mendatar di punggung belakang hingga ujung tulang bahu kanan.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#162D24] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-[#162D24]">Lingkar Pinggul (Hips):</h4>
                      <p className="text-neutral-600">
                        Rapatkan kedua kaki, lalu ukur melingkari bagian bokong/pantat paling tebal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF8E6] border border-[#F0DFB0] text-neutral-800 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
                <p>
                  <strong>Tips Penting:</strong> Jika Anda tidak memiliki meteran kain, Anda bisa menggunakan tali atau benang untuk melingkari tubuh, lalu ukur panjang tali tersebut dengan penggaris biasa.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('form')}
                className="w-full py-3 bg-[#162D24] text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <span>Kembali ke Input Ukuran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
