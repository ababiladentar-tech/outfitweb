'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Check, Compass, Plus, X } from 'lucide-react';
import { BODY_SHAPES, FACE_SHAPES } from './ShapeIcons';
import { MeasurementForm } from './MeasurementsModal';
import { Modal, btnGhost, btnPrimary } from './ui';
import { PALETTE_PRESETS, STYLE_LABEL } from '@/lib/data';
import { hslToHex, isLight, isValidHex } from '@/lib/color';
import { useProfile } from '@/lib/hooks';
import { emitToast } from '@/lib/storage';
import type { BodyShape, FaceShape, Gender, SkinTone, StylePreference, UserProfile } from '@/lib/types';

const STEPS = ['Gender', 'Undertone', 'Bentuk Tubuh', 'Bentuk Wajah', 'Palet Warna', 'Preferensi Gaya'];

export function Onboarding({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="full" hideClose title={null}>
      {open && <Flow onSkip={onClose} onDone={onDone} />}
    </Modal>
  );
}

function Flow({ onSkip, onDone }: { onSkip: () => void; onDone: () => void }) {
  const [profile, setProfile] = useProfile();
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [step, setStep] = useState(0);
  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]): void => setDraft((d) => ({ ...d, [k]: v }));

  const canNext = step === 4 ? draft.palette.length > 0 : step === 5 ? draft.styles.length > 0 : true;
  const last = step === STEPS.length - 1;

  const confirm = (): void => {
    setProfile({ ...draft, onboarded: true });
    const colors = ['#162D24', '#8EA89D', '#E58B94', '#FAF9F5', '#C9B9A2'];
    confetti({ particleCount: 110, spread: 75, origin: { y: 0.7 }, colors, zIndex: 200, disableForReducedMotion: true });
    window.setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors, zIndex: 200, disableForReducedMotion: true }), 180);
    window.setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors, zIndex: 200, disableForReducedMotion: true }), 320);
    emitToast('Profil & Gaya Personal tersimpan');
    onDone();
  };

  return (
    <div className="flex h-full min-h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-line bg-cream/95 px-5 py-4 backdrop-blur md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-forest">
            <Compass className="size-5" strokeWidth={1.4} />
            <span className="font-serif text-lg">Profil &amp; Gaya Personal</span>
          </div>
          <button type="button" onClick={onSkip} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line-2 px-4 text-xs font-medium text-forest hover:bg-cream-2">
            Lewati <X className="size-3.5" />
          </button>
        </div>
        <div className="mt-4 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-[3px] rounded-full transition-colors ${i <= step ? 'bg-forest' : 'bg-line'}`} />
              <p className={`mt-1.5 hidden text-[10.5px] md:block ${i === step ? 'text-forest' : 'text-muted'}`}>{i + 1}. {s}</p>
            </div>
          ))}
        </div>
      </div>

      <div key={step} className="flex-1 animate-fade-up px-5 py-6 md:px-10 md:py-8">
        {step === 0 && <GenderStep value={draft.gender} onChange={(g) => setDraft((d) => ({ ...d, gender: g, bodyShape: g === 'girl' ? 'hourglass' : 'rectangle' }))} />}
        {step === 1 && <ToneStep value={draft.skinTone} onChange={(v) => set('skinTone', v)} />}
        {step === 2 && (
          <BodyStep gender={draft.gender} value={draft.bodyShape} onChange={(v) => set('bodyShape', v)} measurements={draft.measurements} onMeasure={(m) => set('measurements', m)} />
        )}
        {step === 3 && <FaceStep value={draft.faceShape} onChange={(v) => set('faceShape', v)} />}
        {step === 4 && <PaletteStep value={draft.palette} onChange={(v) => set('palette', v)} />}
        {step === 5 && <StyleStep value={draft.styles} onChange={(v) => set('styles', v)} />}
      </div>

      <div className="pb-safe sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-line bg-cream px-5 py-3 md:px-8">
        <button type="button" className={btnGhost} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="size-4" /> Kembali
        </button>
        <span className="text-xs tabular-nums text-muted">{step + 1} / {STEPS.length}</span>
        {last ? (
          <button type="button" className={btnPrimary} disabled={!canNext} onClick={confirm}>
            <Check className="size-4" /> Konfirmasi
          </button>
        ) : (
          <button type="button" className={btnPrimary} disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
            Lanjut <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function StepHead({ n, title, sub }: { n: number; title: React.ReactNode; sub: string }) {
  return (
    <div className="mb-6 max-w-2xl">
      <p className="text-[12px] font-semibold text-sage-ink">Langkah {n}</p>
      <h2 className="mt-1 font-serif text-[28px] leading-tight text-forest md:text-[36px]">{title}</h2>
      <p className="mt-1.5 text-sm text-muted">{sub}</p>
    </div>
  );
}

const optionCls = (active: boolean): string =>
  `relative rounded-2xl border p-4 text-left transition ${active ? 'border-forest bg-white shadow-[0_8px_24px_-16px_rgba(22,45,36,0.6)]' : 'border-line bg-white/50 hover:border-forest/40'}`;

function Tick({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-forest text-cream">
      <Check className="size-3.5" strokeWidth={2.2} />
    </span>
  );
}

function GenderStep({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  return (
    <>
      <StepHead n={1} title={<>Kurasi untuk <em>siapa</em>?</>} sub="Menentukan pilihan siluet dan katalog yang kami tampilkan." />
      <div className="grid max-w-2xl grid-cols-2 gap-3">
        {(['girl', 'boy'] as const).map((g) => (
          <button key={g} type="button" onClick={() => onChange(g)} className={`${optionCls(value === g)} flex flex-col items-center py-8`}>
            <Tick show={value === g} />
            <img src={`/brand/gender-${g}.webp`} alt="" width={150} height={150} className="size-24 md:size-28" />
            <span className="mt-3 font-serif text-xl text-forest">{g === 'girl' ? 'Wanita' : 'Pria'}</span>
          </button>
        ))}
      </div>
    </>
  );
}

const TONES: { key: SkinTone; label: string; skin: string; veins: string[]; desc: string }[] = [
  { key: 'cool', label: 'Cool', skin: '#E2BFAA', veins: ['#5C6FB0', '#7B5FA6'], desc: 'Rona sejuk kebiruan. Pembuluh darah tampak biru atau ungu di bawah sinar matahari.' },
  { key: 'warm', label: 'Warm', skin: '#C38A5F', veins: ['#5F7B45', '#7E8A3E'], desc: 'Rona sawo matang khas Indonesia. Pembuluh darah tampak hijau zaitun.' },
  { key: 'neutral', label: 'Neutral', skin: '#D0A17F', veins: ['#5C6FB0', '#5F7B45'], desc: 'Campuran keduanya. Sulit menentukan apakah biru atau hijau.' },
];

function ToneStep({ value, onChange }: { value: SkinTone; onChange: (v: SkinTone) => void }) {
  return (
    <>
      <StepHead n={2} title={<>Undertone <em>kulit</em> Anda</>} sub="Lihat pergelangan tangan bagian dalam di bawah cahaya matahari pagi. Warna pembuluh darah membantu menentukan undertone." />
      <div className="grid gap-3 md:grid-cols-3">
        {TONES.map((t) => (
          <button key={t.key} type="button" onClick={() => onChange(t.key)} className={optionCls(value === t.key)}>
            <Tick show={value === t.key} />
            <div className="grid h-44 place-items-center rounded-xl bg-cream-2">
              <img src={`/brand/tone-${t.key}.webp`} alt={`Ilustrasi pergelangan tangan undertone ${t.label}`} width={181} height={383} className="h-40 w-auto" />
            </div>
            <p className="mt-3 font-serif text-xl text-forest">{t.label}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.desc}</p>
          </button>
        ))}
      </div>
    </>
  );
}

function BodyStep({
  gender,
  value,
  onChange,
  measurements,
  onMeasure,
}: {
  gender: Gender;
  value: BodyShape;
  onChange: (v: BodyShape) => void;
  measurements: UserProfile['measurements'];
  onMeasure: (m: UserProfile['measurements']) => void;
}) {
  return (
    <>
      <StepHead n={3} title={<>Bentuk <em>tubuh</em></>} sub="Pilih siluet yang paling mendekati. Ukuran cm di bawah membuat Panduan Ukuran lebih akurat." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {BODY_SHAPES[gender].map((b) => (
          <button key={b.key} type="button" onClick={() => onChange(b.key)} className={`${optionCls(value === b.key)} flex flex-col items-center`}>
            <Tick show={value === b.key} />
            <img src={`/brand/body-${gender}-${b.key}.webp`} alt={`Siluet bentuk tubuh ${b.label}`} width={170} height={520} className="h-36 w-auto md:h-40" />
            <p className="mt-2 font-serif text-[17px] text-forest">{b.label}</p>
            <p className="mt-0.5 text-center text-[11.5px] leading-snug text-muted">{b.hint}</p>
          </button>
        ))}
      </div>
      <details className="mt-6 rounded-2xl border border-line bg-white/40 p-4" open>
        <summary className="cursor-pointer text-sm font-semibold text-forest">Ukuran tubuh (cm)</summary>
        <div className="mt-4">
          <MeasurementForm value={measurements} onChange={onMeasure} />
        </div>
      </details>
    </>
  );
}

function FaceStep({ value, onChange }: { value: FaceShape; onChange: (v: FaceShape) => void }) {
  return (
    <>
      <StepHead n={4} title={<>Bentuk <em>wajah</em></>} sub="Membantu kami menyarankan kerah, model hijab, dan aksesori." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FACE_SHAPES.map((f) => (
          <button key={f.key} type="button" onClick={() => onChange(f.key)} className={`${optionCls(value === f.key)} flex flex-col items-center`}>
            <Tick show={value === f.key} />
            <img src={`/brand/face-${f.key}.webp`} alt={`Kontur wajah ${f.label}`} width={260} height={440} className="h-28 w-auto md:h-32" />
            <p className="mt-2 font-serif text-[17px] text-forest">{f.label}</p>
          </button>
        ))}
      </div>
    </>
  );
}

function wedge(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const rad = (a: number): number => ((a - 90) * Math.PI) / 180;
  const p = (r: number, a: number): string => `${(cx + r * Math.cos(rad(a))).toFixed(2)} ${(cy + r * Math.sin(rad(a))).toFixed(2)}`;
  return `M${p(r0, a0)} L${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`;
}

const RINGS = [
  { r0: 30, r1: 62, s: 32, l: 74 },
  { r0: 62, r1: 94, s: 48, l: 56 },
  { r0: 94, r1: 124, s: 52, l: 38 },
];

function ColorWheel({ selected, onPick }: { selected: string[]; onPick: (hex: string) => void }) {
  return (
    <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-[320px]">
      {Array.from({ length: 12 }).map((_, i) => {
        const a0 = i * 30 + 1;
        const a1 = (i + 1) * 30 - 1;
        return RINGS.map((ring, j) => {
          const hex = hslToHex(i * 30, ring.s, ring.l);
          const active = selected.includes(hex);
          return (
            <path
              key={`${i}-${j}`}
              d={wedge(130, 130, ring.r0 + 1, ring.r1 - 1, a0, a1)}
              fill={hex}
              stroke={active ? '#162D24' : '#FAF9F5'}
              strokeWidth={active ? 3 : 1}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => onPick(hex)}
            >
              <title>{hex}</title>
            </path>
          );
        });
      })}
      <circle cx="130" cy="130" r="27" fill="#FAF9F5" stroke="#E8E4D9" />
      <text x="130" y="127" textAnchor="middle" className="fill-[#162D24] font-serif text-[11px] italic">12 hue</text>
      <text x="130" y="141" textAnchor="middle" className="fill-[#6B6F68] text-[8px]">{selected.length} / 6</text>
    </svg>
  );
}

function PaletteStep({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [hex, setHex] = useState('#');
  const toggle = (c: string): void => {
    const up = c.toUpperCase();
    if (value.includes(up)) onChange(value.filter((x) => x !== up));
    else if (value.length < 6) onChange([...value, up]);
    else emitToast('Maksimal 6 warna dalam palet', 'info');
  };
  return (
    <>
      <StepHead n={5} title={<>Palet warna <em>favorit</em></>} sub="Ketuk roda warna, pilih tema siap pakai, atau masukkan kode HEX. Maksimal 6 warna." />
      <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
        <ColorWheel selected={value} onPick={toggle} />
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">Tema</p>
          <div className="grid grid-cols-2 gap-2">
            {PALETTE_PRESETS.map((p) => {
              const active = p.colors.every((c) => value.includes(c));
              return (
                <button key={p.name} type="button" onClick={() => onChange(p.colors.map((c) => c.toUpperCase()))} className={`rounded-xl border p-3 text-left transition ${active ? 'border-forest bg-white' : 'border-line bg-white/50'}`}>
                  <div className="flex h-7 overflow-hidden rounded-md">
                    {p.colors.map((c) => (
                      <span key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] font-medium text-forest">{p.name}</p>
                </button>
              );
            })}
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold text-muted">HEX kustom</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isValidHex(hex)) {
                emitToast('Format HEX tidak valid, contoh #8EA89D', 'error');
                return;
              }
              const full = hex.length === 4 ? '#' + hex.slice(1).split('').map((c) => c + c).join('') : hex;
              toggle(full);
              setHex('#');
            }}
          >
            <span className="size-10 shrink-0 rounded-lg border border-line" style={{ background: isValidHex(hex) ? hex : 'transparent' }} />
            <input value={hex} onChange={(e) => setHex(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)} maxLength={7} className="w-full rounded-xl border border-line-2 bg-white px-3 font-mono text-sm uppercase focus:border-forest" aria-label="Kode HEX" />
            <button type="submit" className={`${btnPrimary} px-4`} aria-label="Tambah warna">
              <Plus className="size-4" />
            </button>
          </form>
          <p className="mb-2 mt-5 text-xs font-semibold text-muted">Palet Anda</p>
          <div className="flex min-h-12 flex-wrap gap-2">
            {value.length === 0 && <p className="text-sm text-muted">Belum ada warna dipilih.</p>}
            {value.map((c) => (
              <button key={c} type="button" onClick={() => toggle(c)} className="group flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-xs" aria-label={`Hapus ${c}`}>
                <span className="grid size-7 place-items-center rounded-full" style={{ background: c }}>
                  <X className={`size-3 opacity-0 transition group-hover:opacity-100 ${isLight(c) ? 'text-ink' : 'text-cream'}`} />
                </span>
                <span className="font-mono">{c}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const STYLE_DESC: Record<StylePreference, string> = {
  casual: 'Kaos, denim, sneakers',
  formal: 'Setelan, kemeja, loafer',
  minimalist: 'Palet netral, potongan bersih',
  streetwear: 'Oversize, layering, denim',
  old_money: 'Wol, oxford, warna camel',
  etnik_modern: 'Batik, lurik, tenun kontemporer',
};

function StyleStep({ value, onChange }: { value: StylePreference[]; onChange: (v: StylePreference[]) => void }) {
  const all = Object.keys(STYLE_LABEL) as StylePreference[];
  const allOn = all.every((s) => value.includes(s));
  return (
    <>
      <StepHead n={6} title={<>Preferensi <em>gaya</em></>} sub="Pilih satu atau lebih. Kami memakainya untuk Kombinasi Pilihan di Studio dan Konsultasi Stylist." />
      <button type="button" onClick={() => onChange(allOn ? [] : all)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-2 bg-white px-4 py-2 text-sm text-forest">
        <span className={`grid size-4 place-items-center rounded border ${allOn ? 'border-forest bg-forest text-cream' : 'border-line-2'}`}>
          {allOn && <Check className="size-3" strokeWidth={2.5} />}
        </span>
        Pilih Semua
      </button>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {all.map((s) => {
          const on = value.includes(s);
          return (
            <button key={s} type="button" onClick={() => onChange(on ? value.filter((x) => x !== s) : [...value, s])} className={optionCls(on)}>
              <Tick show={on} />
              <p className="font-serif text-xl text-forest">{STYLE_LABEL[s]}</p>
              <p className="mt-1 text-[12.5px] text-muted">{STYLE_DESC[s]}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}
