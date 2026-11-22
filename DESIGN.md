# Outfitly: arah desain

Sumber: brief pemilik produk (estetika editorial OFÉYA) dan aset Canva milik pemilik dari proyek `outfit-ai-umkm` (logo, model hero, ilustrasi bentuk tubuh, wajah, dan undertone).

Design Read: aplikasi kurasi fashion lokal untuk anak muda Indonesia (pembeli dan UMKM), bahasa visual editorial majalah busana yang hangat, dial **ENERGY 2 / RHYTHM 3 / MOTION 2**.

## Identitas

- **Palet (3 inti + 1 aksen).** Deep Forest `#162D24` sebagai jangkar teks dan aksi utama, Sage `#8EA89D` untuk status kurasi dan tab aktif, Cream `#FAF9F5` sebagai kanvas. Aksen tunggal: Coral `#E58B94`, hanya di kata miring headline hero, lengkung hero, dan tanda favorit. Alasan: diambil langsung dari brief dan logo pemilik; coral dibatasi agar tetap jadi titik fokus.
- **Tipografi.** Playfair Display untuk headline karena kontras tinggi dan italic-nya membawa suara majalah busana; Plus Jakarta Sans untuk teks dan angka cm karena dirancang di Indonesia dan angkanya tegas pada ukuran kecil.
- **Motif identitas.** Lengkung (arch) dari elemen `pinkhijau` milik pemilik: dua lengkung bertumpuk coral dan hijau. Dipakai di bingkai foto hero, avatar toko, dan pratinjau outfit, tidak di tempat lain.
- **Radius.** Tombol aksi dan chip filter berbentuk pil (menggemakan lengkung), kartu 14 sampai 22 px, input 12 px. Variasi ini membedakan "bisa ditekan" dari "wadah konten".
- **Bayangan.** Hanya pada lapisan yang benar-benar terangkat: modal, toast, dan kartu spesifikasi hero. Kartu produk datar.
- **Ikon.** Lucide React, sesuai stack yang diminta pemilik. Stroke 1,5 dipilih agar senada dengan garis tipis ilustrasi tubuh dan wajah.
- **Tema.** Terang saja. Kanvas cream adalah bagian dari identitas yang ditetapkan pemilik ("kanvas latar editorial"); mode gelap akan menghapus karakter itu.

## Ritme dan gerak

- RHYTHM 3: hero split dengan foto model, pita kota, tiga fitur editorial dengan komposisi berbeda (spesimen ukuran, daftar mode Studio, daftar sumber penjual), lalu grid produk.
- MOTION 2: transisi hover, carousel hero berganti tiap 6 detik dengan tombol jeda, pita kota bergerak dengan tombol jeda, konfeti satu kali di akhir onboarding. Semua berhenti saat `prefers-reduced-motion`.

## Kejujuran data

Toko, produk, harga, dan jumlah pengikut adalah data contoh untuk demo. Label "Data demo" tampil di beranda, katalog, profil toko, dan footer. Statistik pengunjung di dashboard penjual dihitung dari interaksi nyata di browser ini, mulai dari nol. Tidak ada ulasan atau komentar fiktif.
