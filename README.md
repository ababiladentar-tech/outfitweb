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

## Stylist Agent

Konsultasi Stylist bukan lagi chatbot yang hanya menjawab. Ia adalah agen yang bekerja memakai **tools** di atas data nyata aplikasi, lalu menjalankan aksi untuk pengguna:

| Tool | Yang dikerjakan |
| --- | --- |
| `search_products` | Mencari katalog dengan filter kategori, acara, gaya, budget; setiap hasil sudah diberi skor pas (cm) dan harmoni undertone |
| `check_fit` | Menghitung kelonggaran kain tiap ukuran terhadap LD, LP, bahu, kaki pengguna |
| `compare_products` | Membandingkan 2-3 produk |
| `view_wardrobe` | Membaca lemari digital pengguna |
| `build_outfit` | Menyusun outfit lengkap dengan mesin padu padan yang sama dengan Studio; bisa beberapa acara sekaligus dengan budget dibagi dan tanpa produk berulang |
| `save_outfit` | Menyimpan outfit ke Outfit Tersimpan |
| `open_in_studio` | Membuka outfit di Studio Padu Padan untuk diedit per slot |
| `add_favorites` | Menandai produk favorit |
| `update_measurements` | Memperbarui ukuran tubuh bila pengguna menyebut angka baru, lalu hitungan berikutnya memakai angka itu |

Contoh: *"Minggu ini ada kuliah, interview, dan kondangan. Budget 1 juta, susun dan simpan semuanya"* membuat agen membaca lemari, memanggil `build_outfit` tiga kali dengan budget dibagi, lalu `save_outfit` tiga kali. Chat menampilkan jejak langkahnya, kartu outfit (Edit di Studio / Simpan), dan aksi yang sudah dijalankan.

- Dengan `GEMINI_API_KEY`, Gemini merencanakan dan memanggil tools lewat function calling (`src/lib/agent/run.ts`).
- Tanpa kunci, atau saat Gemini tidak terjangkau, perencana lokal (`src/lib/agent/local.ts`) membaca permintaan dan memanggil tools yang sama, jadi demo tetap jalan.
- Produk, harga, dan angka cm selalu berasal dari hasil tools, bukan karangan model.
- Tools yang mengubah data hanya mengantre aksi; browser yang menerapkannya, sehingga semua perubahan terlihat dan tersinkron ke database.

`/api/analyze-clothing` memakai Gemini untuk mengenali kategori dan warna foto lemari.

## Database dan hosting (Supabase + Vercel)

Tanpa variabel Supabase, app berjalan di **mode demo**: semua data di `localStorage`. Dengan Supabase, app berjalan di **mode hosted**: akun sungguhan, katalog bersama untuk semua pengunjung, foto di Storage, dan data per pengguna ikut ke perangkat lain.

### 1. Siapkan Supabase

1. Buat project di [supabase.com](https://supabase.com) (region Singapore paling dekat).
2. Buka **SQL Editor**, jalankan isi `supabase/migrations/20261126000000_outfitly_init.sql`, lalu `supabase/seed.sql`. Keduanya aman dijalankan ulang. (Atau dengan CLI: `supabase link` lalu `supabase db push` dan jalankan seed.)
3. **Authentication > URL Configuration**: isi *Site URL* dengan domain Vercel Anda dan tambahkan `http://localhost:3000` di *Redirect URLs*.
4. Opsional, login Google: **Authentication > Providers > Google**, isi Client ID dan Secret dari Google Cloud Console (redirect URI: `https://<project>.supabase.co/auth/v1/callback`).
5. Untuk demo lomba, Anda bisa mematikan *Confirm email* di **Authentication > Providers > Email** supaya juri bisa langsung masuk setelah daftar.
6. Salin `Project URL` dan `anon public key` dari **Project Settings > API**.

### 2. Deploy ke Vercel

1. Push repo ke GitHub, lalu **Import Project** di [vercel.com](https://vercel.com). Framework terdeteksi otomatis sebagai Next.js.
2. Isi Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY` (opsional `GEMINI_MODEL`, `AI_DAILY_LIMIT`).
3. Deploy. Setelah dapat domain, kembali ke langkah Supabase nomor 3.

Lokal: salin `.env.example` ke `.env.local`, isi nilainya, lalu `npm run dev`.

### Isi database

| Tabel | Isi | Akses (RLS) |
| --- | --- | --- |
| `stores`, `products` | Toko dan katalog | Semua bisa baca; hanya pemilik toko yang menulis |
| `product_comments`, `community_posts`, `community_likes` | Interaksi publik | Semua bisa baca; pengguna menulis/menghapus miliknya |
| `profiles`, `wardrobe_items`, `saved_outfits`, `chat_sessions`, `favorites`, `bookmarks`, `follows` | Data pribadi | Hanya pemiliknya |
| `store_analytics` | Kunjungan, klik, chat WA | Dibaca pemilik toko; ditulis lewat RPC `track_store_event` |
| `ai_usage` | Kuota Stylist Agent harian | Lewat RPC `consume_ai_quota` |
| `product_reports` | Laporan produk | Hanya bisa dikirim |

Jumlah like, simpan, dan pengikut dihitung trigger di server; pemilik toko tidak bisa mengubahnya sendiri. Foto lemari disimpan di bucket `wardrobe/<user id>/`, foto produk di `products/<store id>/`.

Toko contoh di seed belum punya pemilik. Penjual yang masuk bisa membuat toko baru atau menekan **Kelola** pada salah satu toko contoh di Dashboard Penjual.

Saat Supabase aktif, Gemini hanya dipakai untuk pengguna yang sudah masuk dan dibatasi `AI_DAILY_LIMIT` per hari, supaya kunci API tidak terkuras di deployment publik. Tamu tetap dilayani perencana lokal.

Mengubah data contoh di `src/lib/data.ts`? Jalankan `npm run db:seed-sql` untuk membuat ulang `supabase/seed.sql`.

## Stack

Next.js 16 (App Router, Turbopack, React 19), TypeScript strict, Tailwind CSS v4, Supabase (Postgres, Auth, Storage), Gemini function calling, Lucide React, canvas-confetti.

## Struktur

```
supabase/
  migrations/          skema, RLS, trigger, RPC, bucket Storage
  seed.sql             20 toko dan 120 produk contoh (dibuat dari data.ts)
src/
  app/                 layout, globals.css (token warna & tipografi), page
  lib/
    types.ts           kontrak data (UMKMProductPost, WardrobeItem, StoreProfile, ...)
    data.ts            data mock: 8 toko inti, lemari, feed komunitas (12 toko dan 96 produk tambahan di catalog-extra.ts)
    storage.ts         useStored(): localStorage reaktif + event outfitly_<key>, toast bus, overlay registry
    hooks.ts           hook per entitas (katalog, lemari, favorit, sesi chat, kuota, analitik)
    sizing.ts          engine kelonggaran kain per kategori, skor 0-100, status tight/ideal/loose
    color.ts           konversi warna, ekstraksi warna dominan foto, harmoni undertone, Vibe Match
    stylist.ts         teks gaya (undertone, siluet), saran cepat
    outfit.ts          mesin padu padan bersama (Studio dan Stylist Agent)
    agent/             tools agen, loop function calling Gemini, perencana lokal
    cloud/             klien Supabase dan sinkronisasi cache lokal <-> database
    server/            klien Gemini dan Supabase untuk API route
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

- UI membaca dan menulis cache `localStorage` dengan prefix `outfitly:`. Di mode hosted, `src/lib/cloud/sync.ts` mengisi cache itu dari Supabase dan mengubah setiap penulisan menjadi insert/update/delete. Data yang diisi tamu (profil, lemari) diunggah saat pertama kali masuk. Setiap penulisan memicu `window.dispatchEvent(new Event('outfitly_<key>'))`, sehingga lemari, favorit, toko, dan katalog langsung sinkron lintas komponen (juga lintas tab lewat event `storage`).
- Setiap modal/drawer mendaftar ke overlay registry; selama ada overlay terbuka, bottom nav mobile disembunyikan (`hidden`) agar tidak menutupi tombol dialog.
- Kuota Konsultasi Stylist 10 per hari di browser (tombol reset demo ada di header Stylist). Di mode hosted, kuota Gemini juga dihitung server per akun lewat `consume_ai_quota`.
- Mode demo, untuk mengulang dari awal: hapus key `outfitly:*` di DevTools > Application > Local Storage.
