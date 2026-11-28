'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, BookmarkCheck, Compass, HelpCircle, Home, Layers, LogOut, Ruler, Shirt, Store, Trash2, User, UserCog } from 'lucide-react';
import { AppContext, useApp as useAppCtx, type AppActions } from './AppContext';
import { AuthModal } from './AuthModal';
import { cloudEnabled } from '@/lib/cloud/client';
import { startCloudSync } from '@/lib/cloud/sync';
import { CatalogView } from './CatalogView';
import { ProductImage } from './GarmentArt';
import { HeroView } from './HeroView';
import { CommentsModal, ReportModal, SizeComparisonModal, StoreProfileModal } from './MarketModals';
import { MeasurementsModal } from './MeasurementsModal';
import { Onboarding } from './Onboarding';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { SellerDashboardView } from './SellerDashboardView';
import { StudioView } from './StudioView';
import { StylistView } from './StylistView';
import { WardrobeView } from './WardrobeView';
import { Modal, Toaster } from './ui';
import { migrateDemoCatalog, useBecomeMitra, useIsMitra, useBookmarks, useCatalog, useNotifications, useProfile, useSavedOutfits, useSession } from '@/lib/hooks';
import { emitToast, formatIDR, useHydrated, useOverlayOpen } from '@/lib/storage';
import type { AccountRole, ViewKey } from '@/lib/types';

const NAV: { key: ViewKey; label: string; short: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { key: 'home', label: 'Beranda', short: 'Beranda', icon: Home },
  { key: 'catalog', label: 'Katalog', short: 'Katalog', icon: Store },
  { key: 'wardrobe', label: 'Lemari Saya', short: 'Lemari', icon: Shirt },
  { key: 'studio', label: 'Studio Padu Padan', short: 'Studio', icon: Layers },
  { key: 'stylist', label: 'Konsultasi Stylist', short: 'Stylist', icon: Compass },
];

const VIEW_KEYS: ViewKey[] = ['home', 'catalog', 'wardrobe', 'studio', 'stylist', 'seller'];

export function AppShell() {
  const [view, setView] = useState<ViewKey>('home');
  const [productId, setProductId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [auth, setAuth] = useState<{ open: boolean; tab: 'login' | 'signup'; role?: AccountRole }>({ open: false, tab: 'login' });
  const [onboarding, setOnboarding] = useState(false);
  const [measure, setMeasure] = useState(false);
  const [compare, setCompare] = useState<[string, string] | null>(null);
  const [saved, setSaved] = useState(false);
  const [help, setHelp] = useState(false);
  const [notif, setNotif] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [catalog] = useCatalog();
  const [session] = useSession();
  const [profile] = useProfile();

  // Hosted mode: keep the local cache in sync with Supabase.
  useEffect(() => {
    migrateDemoCatalog();
    return startCloudSync();
  }, []);

  // Someone who signed up with Google skips the signup form, so offer the
  // style profile once after their first sign-in.
  useEffect(() => {
    // A new Mitra lands on the store setup instead; the style profile can wait.
    if (!cloudEnabled() || !session?.id || profile.onboarded || profile.role === 'mitra') return;
    const flag = `outfitly:onboard-asked:${session.id}`;
    if (window.sessionStorage.getItem(flag)) return;
    const t = window.setTimeout(() => {
      window.sessionStorage.setItem(flag, '1');
      setOnboarding(true);
    }, 2500);
    return () => window.clearTimeout(t);
  }, [session?.id, profile.onboarded, profile.role]);

  const go = useCallback((v: ViewKey) => {
    setView(v);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', v === 'home' ? window.location.pathname : `#${v}`);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  // Deep links: #view and ?produk=id
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ViewKey;
    if (VIEW_KEYS.includes(hash)) setView(hash);
    const pid = new URLSearchParams(window.location.search).get('produk');
    if (pid) setProductId(pid);
  }, []);

  const actions = useMemo<AppActions>(
    () => ({
      view,
      go,
      openProduct: (id) => {
        setStoreId(null);
        setProductId(id);
      },
      openStore: (id) => {
        setProductId(null);
        setStoreId(id);
      },
      openAuth: (tab = 'login', role) => setAuth({ open: true, tab, role }),
      openOnboarding: () => setOnboarding(true),
      openMeasurements: () => setMeasure(true),
      openCompare: (a, b) => {
        const first = a ?? catalog[0]?.id ?? '';
        setCompare([first, b ?? first]);
      },
      openSaved: () => setSaved(true),
      openHelp: () => setHelp(true),
      openComments: (id) => setCommentsFor(id),
      openReport: (id) => setReportFor(id),
    }),
    [view, go, catalog],
  );

  return (
    <AppContext.Provider value={actions}>
      <Navbar
        view={view}
        go={go}
        onNotif={() => setNotif(true)}
        onUser={() => setUserMenu(true)}
      />
      <main className="min-h-[calc(100dvh-60px)] pb-[76px] md:pb-0">
        {view === 'home' && <HeroView />}
        {view === 'catalog' && <CatalogView />}
        {view === 'wardrobe' && <WardrobeView />}
        {view === 'studio' && <StudioView />}
        {view === 'stylist' && <StylistView />}
        {view === 'seller' && <SellerDashboardView />}
        {view !== 'stylist' && <Footer go={go} />}
      </main>
      <BottomNav view={view} go={go} />

      <ProductDetailModal productId={productId} onClose={() => setProductId(null)} />
      <StoreProfileModal storeId={storeId} onClose={() => setStoreId(null)} />
      <SizeComparisonModal initial={compare} onClose={() => setCompare(null)} />
      <CommentsModal productId={commentsFor} onClose={() => setCommentsFor(null)} />
      <ReportModal productId={reportFor} onClose={() => setReportFor(null)} />
      <MeasurementsModal open={measure} onClose={() => setMeasure(false)} />
      <AuthModal
        open={auth.open}
        initialTab={auth.tab}
        initialRole={auth.role}
        onClose={() => setAuth((a) => ({ ...a, open: false }))}
        onAuthed={(isNew, role) => {
          setAuth((a) => ({ ...a, open: false }));
          if (role === 'mitra') go('seller');
          else if (isNew) window.setTimeout(() => setOnboarding(true), 220);
        }}
      />
      <Onboarding open={onboarding} onClose={() => setOnboarding(false)} onDone={() => { setOnboarding(false); go('catalog'); }} />
      <SavedDrawer open={saved} onClose={() => setSaved(false)} />
      <NotificationsDrawer open={notif} onClose={() => setNotif(false)} />
      <HelpModal open={help} onClose={() => setHelp(false)} />
      <UserMenu open={userMenu} onClose={() => setUserMenu(false)} />
      <Toaster />
    </AppContext.Provider>
  );
}

/* ---------------- Navbar ---------------- */

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-11 items-center" aria-label="Outfitly, ke beranda">
      <span className="grid h-10 place-items-center rounded-xl bg-sage-2 px-3 md:h-12 md:px-4"><img src="/brand/logo-mark.webp" alt="" width={799} height={418} className="h-6 w-auto md:h-7" /></span>
    </button>
  );
}

function Navbar({ view, go, onNotif, onUser }: { view: ViewKey; go: (v: ViewKey) => void; onNotif: () => void; onUser: () => void }) {
  const { openSaved, openHelp, openAuth } = useAppCtx();
  const [session] = useSession();
  const isMitra = useIsMitra();
  const [notifs] = useNotifications();
  const [outfits] = useSavedOutfits();
  const hydrated = useHydrated();
  const unread = hydrated ? notifs.filter((n) => !n.read).length : 0;

  return (
    <header className="on-dark sticky top-0 z-50 border-b border-[#254236] bg-forest text-cream">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-4 px-4 md:h-[72px] md:px-8">
        <Logo onClick={() => go('home')} />
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {[...NAV, ...(isMitra ? [{ key: 'seller' as ViewKey, label: 'Dashboard Penjual', short: '', icon: Store }] : [])].map((n) => (
            <button
              key={n.key}
              type="button"
              onClick={() => go(n.key)}
              className={`relative inline-flex min-h-11 items-center rounded-full px-3 text-[14px] font-medium transition ${view === n.key ? 'text-cream' : 'text-cream/75 hover:text-cream'}`}
            >
              {n.key === 'stylist' ? 'Stylist' : n.key === 'studio' ? 'Studio' : n.key === 'wardrobe' ? 'Lemari' : n.label}
              {view === n.key && <span className="absolute inset-x-3 bottom-1.5 h-[1.5px] bg-cream" />}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <NavIcon label="Outfit Tersimpan" onClick={openSaved} badge={hydrated ? outfits.length : 0}>
            <BookmarkCheck className="size-[18px]" strokeWidth={1.5} />
          </NavIcon>
          <NavIcon label="Notifikasi" onClick={onNotif} badge={unread} dot>
            <Bell className="size-[18px]" strokeWidth={1.5} />
          </NavIcon>
          <span className="hidden md:inline-flex">
            <NavIcon label="Bantuan" onClick={openHelp}>
              <HelpCircle className="size-[18px]" strokeWidth={1.5} />
            </NavIcon>
          </span>
          {hydrated && session ? (
            <button type="button" onClick={onUser} className="ml-1 grid size-11 place-items-center rounded-full bg-sage-2 font-serif text-sm text-forest hover:bg-cream" aria-label="Menu profil">
              {session.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <>
              <button type="button" onClick={onUser} className="grid size-11 place-items-center rounded-full border border-cream/25 text-cream md:hidden" aria-label="Menu akun">
                <User className="size-[18px]" strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => openAuth('login')} className="ml-1 hidden min-h-11 items-center rounded-full bg-cream px-5 text-[13.5px] font-semibold text-forest hover:bg-sage-2 md:inline-flex">
                Masuk
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


function NavIcon({ children, label, onClick, badge = 0, dot }: { children: React.ReactNode; label: string; onClick: () => void; badge?: number; dot?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="relative grid size-11 place-items-center rounded-full text-cream transition hover:bg-white/10 active:bg-white/15">
      {children}
      {badge > 0 &&
        (dot ? (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-coral ring-2 ring-forest" />
        ) : (
          <span className="absolute right-0 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-cream px-1 text-[10.5px] font-semibold text-forest">{badge}</span>
        ))}
    </button>
  );
}

/* ---------------- Bottom nav ---------------- */

function BottomNav({ view, go }: { view: ViewKey; go: (v: ViewKey) => void }) {
  const overlay = useOverlayOpen();
  return (
    <nav
      className={`pb-safe fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-cream/95 backdrop-blur-md md:hidden ${overlay ? 'hidden' : ''}`}
      aria-label="Navigasi utama"
    >
      <ul className="grid grid-cols-5">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = view === n.key;
          return (
            <li key={n.key}>
              <button type="button" onClick={() => go(n.key)} className={`flex w-full flex-col items-center gap-0.5 pb-2 pt-2.5 text-[10.5px] transition ${active ? 'text-forest' : 'text-muted'}`} aria-current={active ? 'page' : undefined}>
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${active ? 'bg-sage-soft' : ''}`}>
                  <Icon className="size-[19px]" strokeWidth={active ? 1.8 : 1.4} />
                </span>
                {n.short}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------------- Drawers & menus ---------------- */

function SavedDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [outfits, setOutfits] = useSavedOutfits();
  const bookmarks = useBookmarks();
  const [catalog] = useCatalog();
  const { openProduct } = useAppCtx();
  const [tab, setTab] = useState<'outfit' | 'produk'>('outfit');
  const products = catalog.filter((p) => bookmarks.ids.includes(p.id));
  return (
    <Modal open={open} onClose={onClose} variant="drawer-right" title="Outfit Tersimpan">
      <div className="p-4">
        <div className="mb-4 grid grid-cols-2 rounded-full bg-cream-3 p-1 text-sm">
          <button type="button" onClick={() => setTab('outfit')} className={`rounded-full py-1.5 ${tab === 'outfit' ? 'bg-forest text-cream' : 'text-forest'}`}>Racikan ({outfits.length})</button>
          <button type="button" onClick={() => setTab('produk')} className={`rounded-full py-1.5 ${tab === 'produk' ? 'bg-forest text-cream' : 'text-forest'}`}>Produk ({products.length})</button>
        </div>
        {tab === 'outfit' ? (
          outfits.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Belum ada racikan. Buat di Studio Padu Padan.</p>
          ) : (
            <ul className="space-y-3">
              {outfits.map((o) => (
                <li key={o.id} className="rounded-2xl border border-line bg-white/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-base text-forest">{o.title}</p>
                      <p className="text-[11px] text-muted">{o.mode === 'wardrobe' ? 'Lemari Saya' : o.mode === 'umkm' ? 'Belanja UMKM' : 'Hybrid'} . {formatIDR(o.totalPrice)}</p>
                    </div>
                    <button type="button" onClick={() => { setOutfits((prev) => prev.filter((x) => x.id !== o.id)); emitToast('Racikan dihapus', 'info'); }} className="grid size-8 place-items-center rounded-full text-muted hover:text-[#8A2F3B]" aria-label="Hapus racikan">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {o.pieces.map((p) => (
                      <button key={p.refId} type="button" onClick={() => p.source === 'umkm' && openProduct(p.refId)} className="size-14 overflow-hidden rounded-lg border border-line bg-cream-2" aria-label={p.name}>
                        <ProductImage src={p.imageUrl} colors={[p.colorHex]} alt={p.name} />
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : products.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Simpan produk dari halaman detail untuk melihatnya di sini.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => <ProductCard key={p.id} product={p} compact />)}
          </div>
        )}
      </div>
    </Modal>
  );
}

function NotificationsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifs, setNotifs] = useNotifications();
  return (
    <Modal open={open} onClose={onClose} variant="drawer-right" title="Notifikasi"
      footer={<button type="button" onClick={() => setNotifs(notifs.map((n) => ({ ...n, read: true })))} className="w-full rounded-full border border-line-2 py-2.5 text-sm text-forest">Tandai semua dibaca</button>}>
      <ul className="divide-y divide-line">
        {notifs.map((n) => (
          <li key={n.id}>
            <button type="button" onClick={() => setNotifs(notifs.map((x) => (x.id === n.id ? { ...x, read: true } : x)))} className={`flex w-full gap-3 px-5 py-4 text-left ${n.read ? '' : 'bg-sage-soft/50'}`}>
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? 'bg-line-2' : 'bg-coral'}`} />
              <span>
                <span className="block text-sm font-semibold text-forest">{n.title}</span>
                <span className="block text-[13px] text-ink/75">{n.body}</span>
                <span className="mt-0.5 block text-[11px] text-muted">{new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function UserMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [session, setSession] = useSession();
  const [profile] = useProfile();
  const { openOnboarding, openMeasurements, openAuth, go, openHelp } = useAppCtx();
  const isMitra = useIsMitra();
  const becomeMitra = useBecomeMitra();
  const item = (icon: React.ReactNode, label: string, fn: () => void) => (
    <button type="button" onClick={() => { onClose(); fn(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-forest hover:bg-cream-2">
      {icon} {label}
    </button>
  );
  return (
    <Modal open={open} onClose={onClose} variant="drawer-right" title={session ? session.name : 'Akun'}>
      <div className="p-3">
        {session && (
          <div className="mb-3 rounded-2xl bg-forest p-4 text-cream">
            <p className="text-[12px] text-sage-2">{profile.role === 'mitra' ? 'Mitra Penjual' : 'Pengguna'} . Profil & Gaya Personal</p>
            <p className="mt-1 text-sm">Undertone {profile.skinTone} . {profile.bodyShape.replace('_', ' ')} . wajah {profile.faceShape}</p>
            <p className="mt-1 text-xs text-cream/70">LD {profile.measurements.chestCm} . LP {profile.measurements.waistCm} . Bahu {profile.measurements.shoulderCm} . TB {profile.measurements.heightCm} cm</p>
            <div className="mt-2 flex gap-1">{profile.palette.map((c) => <span key={c} className="size-4 rounded-full border border-cream/30" style={{ background: c }} />)}</div>
          </div>
        )}
        {!session && item(<User className="size-4" strokeWidth={1.5} />, 'Masuk / Daftar', () => openAuth('login'))}
        {item(<UserCog className="size-4" strokeWidth={1.5} />, 'Profil & Gaya Personal', openOnboarding)}
        {item(<Ruler className="size-4" strokeWidth={1.5} />, 'Panduan Ukuran (cm)', openMeasurements)}
        {isMitra
          ? item(<Store className="size-4" strokeWidth={1.5} />, 'Dashboard Mitra Penjual', () => go('seller'))
          : item(<Store className="size-4" strokeWidth={1.5} />, 'Daftar jadi Mitra Penjual', () => {
              if (!session) openAuth('signup', 'mitra');
              else {
                becomeMitra();
                go('seller');
              }
            })}
        {item(<HelpCircle className="size-4" strokeWidth={1.5} />, 'Bantuan', openHelp)}
        {session && item(<LogOut className="size-4" strokeWidth={1.5} />, 'Keluar', () => { setSession(null); emitToast('Anda telah keluar', 'info'); })}
      </div>
    </Modal>
  );
}

const FAQ: [string, string][] = [
  ['Bagaimana skor kecocokan dihitung?', 'Kami membandingkan ukuran flat-lay produk (cm) dengan ukuran tubuh Anda, lalu menghitung kelonggaran kain per kategori. Kemeja butuh 6 - 16 cm di dada, jeans non-stretch 2 - 3 cm di pinggang, sepatu 0,5 - 1,5 cm dari panjang telapak.'],
  ['Apakah saya membeli langsung di Outfitly?', 'Tidak. Tombol beli membuka toko resmi penjual di Shopee atau Tokopedia, atau WhatsApp dengan draf pesan. Tanpa alur resi yang rumit.'],
  ['Apa itu Collab Mitra?', 'Thrift shop yang dikurasi bersama tim stylist Outfitly per musim, sehingga mudah dipadukan dengan brand UMKM.'],
  ['Di mana data saya disimpan?', 'Versi demo ini menyimpan profil, lemari, dan percakapan di localStorage browser Anda.'],
  ['Kenapa kuota konsultasi dibatasi?', 'Setiap akun mendapat 10 sesi konsultasi per hari. Tombol reset tersedia untuk keperluan demo.'],
];

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="md" title="Bantuan">
      <div className="divide-y divide-line px-5">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="cursor-pointer list-none font-serif text-[17px] text-forest marker:hidden">{q}</summary>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{a}</p>
          </details>
        ))}
      </div>
    </Modal>
  );
}

function Footer({ go }: { go: (v: ViewKey) => void }) {
  const isMitra = useIsMitra();
  const [session] = useSession();
  const becomeMitra = useBecomeMitra();
  const { openAuth } = useAppCtx();
  return (
    <footer className="mt-8 border-t border-line bg-cream-2">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <img src="/brand/logo.webp" alt="Outfitly" width={799} height={483} className="h-14 w-auto" />
          <p className="mt-2 max-w-sm text-sm text-muted">Kurasi busana lokal Indonesia. Dari pengrajin Bandung, Solo, Yogya, Pekalongan, dan Tasikmalaya ke lemari Anda.</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 text-[12px] font-semibold text-sage-ink">Jelajah</p>
          {NAV.map((n) => <button key={n.key} type="button" onClick={() => go(n.key)} className="flex min-h-11 items-center text-forest hover:underline">{n.label}</button>)}
        </div>
        <div className="text-sm">
          <p className="mb-2 text-[12px] font-semibold text-sage-ink">Mitra</p>
          <button
            type="button"
            onClick={() => {
              if (isMitra) go('seller');
              else if (!session) openAuth('signup', 'mitra');
              else {
                becomeMitra();
                go('seller');
              }
            }}
            className="flex min-h-11 items-center text-forest hover:underline"
          >
            {isMitra ? 'Dashboard Penjual' : 'Daftar jadi Mitra Penjual'}
          </button>
          <p className="py-1 text-muted">mitra@outfitly.id</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 border-t border-line px-5 py-4 text-center text-[12px] text-muted sm:flex-row sm:justify-center">
        <span>2026 Outfitly. Dibuat untuk UMKM busana Indonesia.</span>
        <span>{cloudEnabled() ? 'Toko dan produk awal adalah data contoh. Data akun Anda tersimpan di server Outfitly.' : 'Versi demo: data toko dan produk adalah contoh, data Anda hanya tersimpan di browser ini.'}</span>
      </div>
    </footer>
  );
}
