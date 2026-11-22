# Outfitly

Platform kurasi fashion lokal Indonesia: UMKM busana (Bandung, Solo, Yogya, Pekalongan, Tasikmalaya), preloved terverifikasi, dan Collab Mitra, dengan panduan ukuran cm nyata, undertone kulit, bentuk tubuh, dan lemari digital.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # build produksi
npm start
```

Butuh Node.js 20.9 atau lebih baru. Font (Playfair Display, Plus Jakarta Sans) dibundel lewat `@fontsource`, jadi build tidak memerlukan akses ke Google Fonts.

## Konsultasi Stylist dan pengenal foto (opsional)

Salin `.env.example` menjadi `.env.local` lalu isi `GEMINI_API_KEY`. Dengan kunci ini, `/api/stylist` menulis ulang jawaban stylist dengan Gemini dan `/api/analyze-clothing` mengenali kategori dan warna foto lemari. Pilihan produk dan hitungan cm tetap dari mesin lokal, jadi jawaban hanya menyebut produk yang ada. Tanpa kunci, keduanya otomatis memakai mesin lokal.

## Stack

Next.js 16 (App Router, Turbopack, React 19), TypeScript strict, Tailwind CSS v4, Lucide React, canvas-confetti.

## Struktur

```
src/
  app/                 layout, globals.css (token warna & tipografi), page
  lib/
    types.ts           kontrak data (UMKMProductPost, WardrobeItem, StoreProfile, ...)
    data.ts            data mock: 8 toko, 24 produk, lemari, feed komunitas
    storage.ts         useStored(): localStorage reaktif + event outfitly_<key>, toast bus, overlay registry
    hooks.ts           hook per entitas (katalog, lemari, favorit, sesi chat, kuota, analitik)
    sizing.ts          engine kelonggaran kain per kategori, skor 0-100, status tight/ideal/loose
    color.ts           konversi warna, ekstraksi warna dominan foto, harmoni undertone, Vibe Match
    stylist.ts         penyusun jawaban Konsultasi Stylist (mode Ringkas & Lengkap)
  components/
    AppShell.tsx       navbar, bottom nav, drawer, host semua modal
    HeroView, CatalogView, WardrobeView, StudioView, StylistView, SellerDashboardView
    ProductDetailModal, MarketModals (Profil Toko, Perbandingan Ukuran, Komentar, Laporan)
    AuthModal, Onboarding (6 langkah), MeasurementsModal
    GarmentArt.tsx     ilustrasi flat-lay SVG untuk produk tanpa foto
```

## Asal aset

Logo, foto model hero, ilustrasi bentuk tubuh, kontur wajah, undertone, dan ikon gender di `public/brand/` diambil dari aset Canva proyek `outfit-ai-umkm`, dikecilkan dan latar gelapnya dibuat transparan. Arah desain ada di `DESIGN.md`.

## Catatan perilaku

- Semua data tersimpan di `localStorage` dengan prefix `outfitly:`. Setiap penulisan memicu `window.dispatchEvent(new Event('outfitly_<key>'))`, sehingga lemari, favorit, toko, dan katalog langsung sinkron lintas komponen (juga lintas tab lewat event `storage`).
- Setiap modal/drawer mendaftar ke overlay registry; selama ada overlay terbuka, bottom nav mobile disembunyikan (`hidden`) agar tidak menutupi tombol dialog.
- Kuota Konsultasi Stylist 10 per hari, dikunci per tanggal; tombol reset demo ada di header Stylist.
- Untuk mengulang demo dari awal: hapus key `outfitly:*` di DevTools > Application > Local Storage.
