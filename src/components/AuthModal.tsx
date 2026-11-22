'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Modal, btnPrimary, inputCls, labelCls } from './ui';
import { useProfile, useSession, type AuthSession } from '@/lib/hooks';
import { emitToast } from '@/lib/storage';

const RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: 'Minimal 8 karakter', test: (p) => p.length >= 8 },
  { label: 'Huruf kapital (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Angka (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'Karakter khusus (!@#$)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function CheckMark({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9" fill={ok ? '#2F6B4F' : 'none'} stroke={ok ? '#2F6B4F' : '#C9C4B6'} strokeWidth="1.2" className="transition-all" />
      <path d="M6 10.4 L8.8 13 L14 7.5" fill="none" stroke={ok ? '#FAF9F5' : 'transparent'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-all" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}
function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="currentColor" d="M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.9 2.3h7l4.8 6.4 5.5-6.4Zm-1.2 17.9h1.9L7.1 4.2H5.1l11.9 16Z" />
    </svg>
  );
}
function FbMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" />
    </svg>
  );
}

export function AuthModal({
  open,
  initialTab,
  onClose,
  onAuthed,
}: {
  open: boolean;
  initialTab: 'login' | 'signup';
  onClose: () => void;
  onAuthed: (isNew: boolean) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose={false} title={<span className="font-serif">Selamat datang di <em>Outfitly</em></span>}>
      {open && <AuthBody key={initialTab} initialTab={initialTab} onAuthed={onAuthed} />}
    </Modal>
  );
}

function AuthBody({ initialTab, onAuthed }: { initialTab: 'login' | 'signup'; onAuthed: (isNew: boolean) => void }) {
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [, setSession] = useSession();
  const [, setProfile] = useProfile();

  const passed = RULES.map((r) => r.test(password));
  const allOk = passed.every(Boolean);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = tab === 'signup' ? allOk && emailOk && name.trim().length > 1 : emailOk && password.length > 0;

  const finish = (s: AuthSession, isNew: boolean): void => {
    setSession(s);
    setProfile((p) => ({ ...p, name: s.name, email: s.email }));
    emitToast(isNew ? `Akun dibuat. Halo, ${s.name.split(' ')[0]}` : `Selamat datang kembali, ${s.name.split(' ')[0]}`);
    onAuthed(isNew);
  };

  const social = (provider: AuthSession['provider'], label: string): void => {
    setBusy(provider);
    window.setTimeout(() => {
      setBusy(null);
      finish({ name: `Pengguna ${label}`, email: `pengguna.${provider}@outfitly.id`, provider }, tab === 'signup');
    }, 650);
  };

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy('email');
    window.setTimeout(() => {
      setBusy(null);
      const nm = tab === 'signup' ? name.trim() : email.split('@')[0].replace(/[._]/g, ' ');
      finish({ name: nm.replace(/\b\w/g, (c) => c.toUpperCase()), email, provider: 'email' }, tab === 'signup');
    }, 500);
  };

  return (
    <div className="p-5 md:p-6">
      <div className="grid grid-cols-2 rounded-full bg-cream-3 p-1 text-sm">
        {(['login', 'signup'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full py-2 transition ${tab === t ? 'bg-forest text-cream shadow' : 'text-forest'}`}
          >
            {t === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {([
          ['google', 'Google', <GoogleMark key="g" />],
          ['x', 'X', <XMark key="x" />],
          ['facebook', 'Facebook', <FbMark key="f" />],
        ] as const).map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            disabled={busy !== null}
            onClick={() => social(id, label)}
            className="flex items-center justify-center gap-2 rounded-xl border border-line-2 bg-white py-2.5 text-xs font-medium text-ink transition hover:border-forest/50 disabled:opacity-50"
          >
            {busy === id ? <Loader2 className="size-4 animate-spin" /> : icon}
            {label}
          </button>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3 text-[12px] text-muted">
        <span className="h-px flex-1 bg-line" /> atau dengan email <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        {tab === 'signup' && (
          <div>
            <label className={labelCls} htmlFor="au-name">Nama lengkap</label>
            <input id="au-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nadia Prameswari" autoComplete="name" />
          </div>
        )}
        <div>
          <label className={labelCls} htmlFor="au-email">Email</label>
          <input id="au-email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" />
        </div>
        <div>
          <label className={labelCls} htmlFor="au-pass">Kata sandi</label>
          <div className="relative">
            <input
              id="au-pass"
              type={show ? 'text' : 'password'}
              className={`${inputCls} pr-11`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted" aria-label={show ? 'Sembunyikan' : 'Tampilkan'}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {tab === 'signup' && (
          <ul className="grid grid-cols-1 gap-1.5 rounded-xl bg-cream-2 p-3 sm:grid-cols-2">
            {RULES.map((r, i) => (
              <li key={r.label} className={`flex items-center gap-2 text-[12.5px] transition ${passed[i] ? 'text-[#2F6B4F]' : 'text-muted'}`}>
                <CheckMark ok={passed[i]} /> {r.label}
              </li>
            ))}
          </ul>
        )}
        <button type="submit" className={`${btnPrimary} w-full`} disabled={!canSubmit || busy !== null}>
          {busy === 'email' && <Loader2 className="size-4 animate-spin" />}
          {tab === 'login' ? 'Masuk' : 'Buat Akun'}
        </button>
        <p className="text-center text-[11px] text-muted">Data demo tersimpan lokal di browser Anda.</p>
      </form>
    </div>
  );
}
