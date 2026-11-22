'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { registerOverlay, type ToastPayload } from '@/lib/storage';

/* ---------- Modal ---------- */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'center' | 'drawer-right' | 'drawer-left';
  footer?: React.ReactNode;
  hideClose?: boolean;
  labelledBy?: string;
}

const SIZE: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'md:max-w-md',
  md: 'md:max-w-xl',
  lg: 'md:max-w-3xl',
  xl: 'md:max-w-5xl',
  full: 'md:max-w-6xl',
};

/**
 * Every modal registers itself in the overlay registry while open, which hides
 * the fixed mobile bottom nav so it never collides with dialog actions.
 * On mobile, centre modals become full-height sheets with a sticky footer.
 */
export function Modal({ open, onClose, children, title, size = 'md', variant = 'center', footer, hideClose }: ModalProps) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const release = registerOverlay();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      release();
    };
  }, [open]);

  if (!open) return null;

  const isDrawer = variant !== 'center';
  const panel = isDrawer
    ? `absolute inset-y-0 ${variant === 'drawer-right' ? 'right-0' : 'left-0'} w-full max-w-md animate-sheet`
    : `absolute inset-x-0 bottom-0 top-[4dvh] md:inset-auto md:left-1/2 md:top-1/2 md:w-[calc(100%-3rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:max-h-[90dvh] ${SIZE[size]} animate-sheet`;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-[#0E1A15]/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`${panel} flex flex-col overflow-hidden bg-cream shadow-[0_30px_80px_-20px_rgba(10,25,18,0.45)] ${
          isDrawer ? '' : 'rounded-t-[22px] md:rounded-[18px]'
        }`}
      >
        {(title || !hideClose) && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3.5 md:px-6">
            <div className="min-w-0 font-serif text-lg text-forest md:text-xl">{title}</div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-forest transition hover:bg-cream-2 active:bg-cream-3"
                aria-label="Tutup dialog"
              >
                <X className="size-4" strokeWidth={1.6} />
              </button>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && (
          <div className="pb-safe shrink-0 border-t border-line bg-cream px-5 py-3 md:px-6">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ---------- Toaster ---------- */

export function Toaster() {
  const [items, setItems] = useState<ToastPayload[]>([]);
  useEffect(() => {
    const onToast = (e: Event): void => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      setItems((prev) => [...prev.slice(-2), detail]);
      window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== detail.id)), 2800);
    };
    window.addEventListener('outfitly_toast', onToast);
    return () => window.removeEventListener('outfitly_toast', onToast);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex max-w-sm animate-fade-up items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm shadow-lg ${
            t.tone === 'error'
              ? 'border-[#EBC3C8] bg-[#FBEFF0] text-[#7A2632]'
              : 'border-forest/10 bg-forest text-cream'
          }`}
        >
          {t.tone !== 'error' && (
            <span className="grid size-5 place-items-center rounded-full bg-sage/30">
              <Check className="size-3" strokeWidth={2.4} />
            </span>
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Small primitives ---------- */

export function Chip({
  active,
  onClick,
  children,
  className = '',
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition active:scale-[0.98] md:min-h-9 ${
        active
          ? 'border-forest bg-forest text-cream'
          : 'border-line-2 bg-white/60 text-ink hover:border-forest/40'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="block text-sm font-medium text-forest">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-forest' : 'bg-line-2'}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-cream shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </label>
  );
}

/** Visible marker for seeded example content (R-38: honest placeholder). */
export function DemoNote({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 rounded-md border border-dashed border-line-2 bg-cream-2 px-2.5 py-1 text-[12px] text-muted ${className}`}>
      <span className="font-semibold text-forest">Data demo</span>
      {children ?? 'Toko, produk, dan harga adalah contoh.'}
    </p>
  );
}

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-serif text-[15px] italic text-sage-ink ${className}`}>{children}</p>
  );
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <h2 className="font-serif text-[28px] leading-tight text-forest md:text-[38px]">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-sm text-muted md:text-[15px]">{sub}</p>}
    </div>
  );
}

export const btnPrimary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-medium text-cream transition hover:bg-[#21402F] active:bg-[#0F2019] disabled:cursor-not-allowed disabled:bg-[#8C968F] disabled:text-cream';
export const btnGhost =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line-2 bg-white/50 px-5 py-3 text-sm font-medium text-forest transition hover:border-forest/50 hover:bg-white active:bg-cream-3 disabled:cursor-not-allowed disabled:border-line disabled:text-muted';
export const inputCls =
  'w-full rounded-xl border border-line-2 bg-white/70 px-3.5 py-2.5 text-sm text-ink transition focus:border-forest focus:bg-white';
export const labelCls = 'mb-1.5 block text-xs font-medium text-muted';
