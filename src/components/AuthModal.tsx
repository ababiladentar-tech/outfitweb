'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, ShoppingBag, Store } from 'lucide-react';
import { Modal, btnPrimary, inputCls, labelCls } from './ui';
import { useProfile, useSession, type AuthSession } from '@/lib/hooks';
import { emitToast } from '@/lib/storage';
import { cloudEnabled, supabase } from '@/lib/cloud/client';
import { setPendingRole } from '@/lib/cloud/sync';
import type { AccountRole } from '@/lib/types';

const AUTH_ERRORS: [RegExp, string][] = [
  [/invalid login credentials/i, 'Email atau kata sandi salah.'],
  [/email not confirmed/i, 'Email belum dikonfirmasi. Buka tautan di email Anda dulu.'],
  [/already registered|already been registered/i, 'Email ini sudah terdaftar. Silakan masuk.'],
  [/rate limit|too many/i, 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'],
  [/provider is not enabled/i, 'Login Google belum diaktifkan di Supabase.'],
];
const authError = (msg: string): string => AUTH_ERRORS.find(([re]) => re.test(msg))?.[1] ?? msg;

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

const ROLES: { key: AccountRole; title: string; text: string; icon: React.ReactNode }[] = [
  {
    key: 'pengguna',
    title: 'Pengguna',
    text: 'Belanja busana lokal, simpan lemari digital, padu padan di Studio, dan konsultasi dengan Stylist Agent.',
    icon: <ShoppingBag className="size-5" strokeWidth={1.5} aria-hidden />,
  },
  {
    key: 'mitra',
    title: 'Mitra Penjual',
    text: 'Buka toko UMKM atau thrift, unggah produk dengan ukuran cm, dan pantau statistik toko. Fitur pengguna tetap bisa dipakai.',
    icon: <Store className="size-5" strokeWidth={1.5} aria-hidden />,
  },
];

export function AuthModal({
  open,
  initialTab,
  initialRole,
  onClose,
  onAuthed,
}: {
  open: boolean;
  initialTab: 'login' | 'signup';
  /** Skip the role step when the entry point already implies one (e.g. "Jadi Mitra"). */
  initialRole?: AccountRole;
  onClose: () => void;
  onAuthed: (isNew: boolean, role: AccountRole) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose={false} title={<span className="font-serif">Selamat datang di <em>Outfitly</em></span>}>
      {open && <AuthBody key={`${initialTab}-${initialRole ?? ''}`} initialTab={initialTab} initialRole={initialRole} onAuthed={onAuthed} />}
    </Modal>
  );
}

function RoleStep({ onPick }: { onPick: (r: AccountRole) => void }) {
  return (
    <div className="p-5 md:p-6">
      <p className="text-sm text-muted">Masuk atau daftar sebagai:</p>
      <div className="mt-3 grid gap-3">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => onPick(r.key)}
            className="flex items-start gap-3 rounded-2xl border border-line-2 bg-white p-4 text-left transition hover:border-forest/60 hover:bg-cream-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-cream">{r.icon}</span>
            <span>
              <span className="block font-serif text-[17px] text-forest">{r.title}</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{r.text}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AuthBody({ initialTab, initialRole, onAuthed }: { initialTab: 'login' | 'signup'; initialRole?: AccountRole; onAuthed: (isNew: boolean, role: AccountRole) => void }) {
  const [role, setRole] = useState<AccountRole | null>(initialRole ?? null);
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const cloud = cloudEnabled();
  const [, setSession] = useSession();
  const [, setProfile] = useProfile();

  const passed = RULES.map((r) => r.test(password));
  const allOk = passed.every(Boolean);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = tab === 'signup' ? allOk && emailOk && name.trim().length > 1 : emailOk && password.length > 0;

  const chosen: AccountRole = role ?? 'pengguna';

  const finish = (s: AuthSession, isNew: boolean): void => {
    setSession(s);
    // Demo mode keeps the role locally; picking Mitra on login upgrades the account.
    setProfile((p) => ({ ...p, name: s.name, email: s.email, role: chosen === 'mitra' ? 'mitra' : isNew ? 'pengguna' : p.role }));
    emitToast(isNew ? `Akun dibuat. Halo, ${s.name.split(' ')[0]}` : `Selamat datang kembali, ${s.name.split(' ')[0]}`);
    onAuthed(isNew, chosen);
  };

  const social = (provider: AuthSession['provider'], label: string): void => {
    setBusy(provider);
    const sb = supabase();
    if (sb) {
      setError(null);
      setPendingRole(chosen);
      sb.auth
        .signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
        .then(({ error: e }) => {
          if (e) {
            setBusy(null);
            setError(authError(e.message));
          }
        });
      return;
    }
    window.setTimeout(() => {
      setBusy(null);
      finish({ name: `Pengguna ${label}`, email: `pengguna.${provider}@outfitly.id`, provider }, tab === 'signup');
    }, 650);
  };

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy('email');
    const sb = supabase();
    if (sb) {
      setError(null);
      setPendingRole(chosen);
      const req =
        tab === 'signup'
          ? sb.auth.signUp({ email, password, options: { data: { name: name.trim(), role: chosen }, emailRedirectTo: window.location.origin } })
          : sb.auth.signInWithPassword({ email, password });
      req.then(({ data, error: e }) => {
        setBusy(null);
        if (e) {
          setError(authError(e.message));
          return;
        }
        if (!data.session) {
          // Email confirmation is on: the account exists but needs the link first.
          setSent(email);
          return;
        }
        // The cloud sync fills the session and loads the account's data.
        setProfile((p) => (tab === 'signup' ? { ...p, name: name.trim(), email, role: chosen } : p));
        const nm = tab === 'signup' ? name.trim() : (data.user?.user_metadata?.name as string | undefined) ?? email.split('@')[0];
        emitToast(tab === 'signup' ? `Akun dibuat. Halo, ${nm.split(' ')[0]}` : `Selamat datang kembali, ${nm.split(' ')[0]}`);
        onAuthed(tab === 'signup', chosen);
      });
      return;
    }
    window.setTimeout(() => {
      setBusy(null);
      const nm = tab === 'signup' ? name.trim() : email.split('@')[0].replace(/[._]/g, ' ');
      finish({ name: nm.replace(/\b\w/g, (c) => c.toUpperCase()), email, provider: 'email' }, tab === 'signup');
    }, 500);
  };

  if (sent) {
    return (
      <div className="p-6 text-center">
        <p className="font-serif text-xl text-forest">Cek email Anda</p>
        <p className="mt-2 text-sm text-muted">Tautan konfirmasi sudah dikirim ke <span className="font-medium text-forest">{sent}</span>. Buka tautan itu, lalu Anda otomatis masuk.</p>
        <button type="button" className={`${btnPrimary} mt-5 w-full`} onClick={() => { setSent(null); setTab('login'); }}>Sudah konfirmasi, masuk</button>
      </div>
    );
  }

  if (!role) return <RoleStep onPick={setRole} />;

  const picked = ROLES.find((r) => r.key === role) ?? ROLES[0];
  return (
    <div className="p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-cream-2 px-3 py-2">
        <span className="grid size-7 place-items-center rounded-full bg-forest text-cream [&>svg]:size-4">{picked.icon}</span>
        <span className="flex-1 text-[13px] text-forest">
          Sebagai <span className="font-semibold">{picked.title}</span>
        </span>
        <button type="button" onClick={() => setRole(null)} className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-[12px] font-medium text-forest hover:bg-cream-3">
          <ArrowLeft className="size-3.5" aria-hidden /> Ganti
        </button>
      </div>
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

      <div className={`mt-5 grid gap-2 ${cloud ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {(cloud
          ? ([['google', 'Lanjutkan dengan Google', <GoogleMark key="g" />]] as const)
          : ([
              ['google', 'Google', <GoogleMark key="g" />],
              ['x', 'X', <XMark key="x" />],
              ['facebook', 'Facebook', <FbMark key="f" />],
            ] as const)
        ).map(([id, label, icon]) => (
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
        {error && <p role="alert" className="rounded-lg bg-[#F7E1E3] px-3 py-2 text-[12.5px] text-[#8A2F3B]">{error}</p>}
        <button type="submit" className={`${btnPrimary} w-full`} disabled={!canSubmit || busy !== null}>
          {busy === 'email' && <Loader2 className="size-4 animate-spin" />}
          {tab === 'login' ? 'Masuk' : role === 'mitra' ? 'Daftar sebagai Mitra' : 'Buat Akun'}
        </button>
        <p className="text-center text-[11px] text-muted">{cloud ? 'Profil, lemari, dan outfit Anda tersimpan di akun dan ikut ke perangkat lain.' : 'Mode demo: data tersimpan lokal di browser Anda.'}</p>
      </form>
    </div>
  );
}
