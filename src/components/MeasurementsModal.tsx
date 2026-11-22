'use client';

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Modal, btnGhost, btnPrimary } from './ui';
import { DEFAULT_MEASUREMENTS } from '@/lib/data';
import { useProfile } from '@/lib/hooks';
import { emitToast } from '@/lib/storage';
import type { BodyMeasurements } from '@/lib/types';

export const MEASURE_FIELDS: { key: keyof BodyMeasurements; label: string; unit: string; min: number; max: number; step: number; hint: string }[] = [
  { key: 'chestCm', label: 'Lingkar Dada (LD)', unit: 'cm', min: 60, max: 140, step: 0.5, hint: 'Ukur melingkar di bagian terlebar dada' },
  { key: 'waistCm', label: 'Lingkar Pinggang (LP)', unit: 'cm', min: 50, max: 130, step: 0.5, hint: 'Di atas pusar, bagian terkecil pinggang' },
  { key: 'shoulderCm', label: 'Lebar Bahu', unit: 'cm', min: 30, max: 56, step: 0.5, hint: 'Ujung bahu kiri ke kanan lewat punggung' },
  { key: 'heightCm', label: 'Tinggi Badan', unit: 'cm', min: 130, max: 200, step: 1, hint: 'Tanpa alas kaki' },
  { key: 'weightKg', label: 'Berat Badan', unit: 'kg', min: 30, max: 140, step: 0.5, hint: 'Opsional, untuk proporsi' },
  { key: 'footCm', label: 'Panjang Telapak Kaki', unit: 'cm', min: 18, max: 32, step: 0.1, hint: 'Tumit ke ujung jari terpanjang' },
];

export function MeasurementForm({ value, onChange }: { value: BodyMeasurements; onChange: (m: BodyMeasurements) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MEASURE_FIELDS.map((f) => (
        <div key={f.key} className="rounded-xl border border-line bg-white/60 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor={`m-${f.key}`} className="text-[13px] font-medium text-forest">{f.label}</label>
            <div className="flex items-baseline gap-1">
              <input
                id={`m-${f.key}`}
                type="number"
                inputMode="decimal"
                min={f.min}
                max={f.max}
                step={f.step}
                value={value[f.key]}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  onChange({ ...value, [f.key]: Number.isFinite(n) ? n : 0 });
                }}
                className="w-16 rounded-md border border-line-2 bg-white px-1.5 py-0.5 text-right text-[15px] font-semibold tabular-nums text-ink focus:border-forest"
              />
              <span className="text-xs text-muted">{f.unit}</span>
            </div>
          </div>
          <input
            type="range"
            aria-label={f.label}
            min={f.min}
            max={f.max}
            step={f.step}
            value={value[f.key]}
            onChange={(e) => onChange({ ...value, [f.key]: parseFloat(e.target.value) })}
            className="mt-2 w-full"
          />
          <p className="text-[11px] text-muted">{f.hint}</p>
        </div>
      ))}
    </div>
  );
}

export function MeasurementsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="md" title={<span className="inline-flex items-center gap-2"><Ruler className="size-4" strokeWidth={1.6} /> Panduan Ukuran (cm)</span>}>
      {open && <Body onClose={onClose} />}
    </Modal>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const [profile, setProfile] = useProfile();
  const [m, setM] = useState<BodyMeasurements>(profile.measurements);
  return (
    <div className="p-5 md:p-6">
      <p className="mb-4 text-sm text-muted">
        Angka ini dipakai untuk menghitung kelonggaran kain di setiap produk. Gunakan meteran jahit, ukur di atas pakaian tipis.
      </p>
      <MeasurementForm value={m} onChange={setM} />
      <div className="mt-5 flex gap-2">
        <button type="button" className={`${btnGhost} flex-1`} onClick={() => setM(DEFAULT_MEASUREMENTS)}>Atur ulang</button>
        <button
          type="button"
          className={`${btnPrimary} flex-1`}
          onClick={() => {
            setProfile((p) => ({ ...p, measurements: m }));
            emitToast('Ukuran tubuh disimpan');
            onClose();
          }}
        >
          Simpan Ukuran
        </button>
      </div>
    </div>
  );
}
