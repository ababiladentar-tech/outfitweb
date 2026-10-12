import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MARKETPLACE_PRODUCTS } from '@/data/umkm-products';
import { UMKMProductPost } from '@/types';
import { calculateSizeCompatibility } from '@/lib/sizing-engine';

export async function POST(req: NextRequest) {
  try {
    const { 
      message, 
      profile, 
      history,
      wardrobeItems 
    }: { 
      message: string; 
      profile?: any; 
      history?: Array<{ sender: 'ai' | 'user'; text: string }>;
      wardrobeItems?: Array<{ id: string; name: string; category: string; color: string; style: string }>;
    } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const raw = message.trim().toLowerCase();
    const name = profile?.name || profile?.username || 'Sobat Gaya';
    const skin = profile?.skinTone || 'warm';
    const userMeasurements = profile?.measurements;

    // Filter unified catalog for product recommendations
    let recommendedProducts: UMKMProductPost[] = [];

    // Check for budget constraints in user message (e.g. 250rb, 250000, 250.000, 150rb, 100rb)
    let maxBudget: number | null = null;
    const budgetMatch = raw.match(/(\d+)\s*(?:rb|ribu|k|000)/);
    if (budgetMatch) {
      const num = parseInt(budgetMatch[1]);
      maxBudget = num < 1000 ? num * 1000 : num;
    }

    // Check for condition preference
    const wantsPreloved = raw.includes('preloved') || raw.includes('thrift') || raw.includes('second') || raw.includes('bekas');
    const wantsNew = raw.includes('baru') || raw.includes('umkm') || raw.includes('brand');

    // Query catalog
    recommendedProducts = INITIAL_MARKETPLACE_PRODUCTS.filter((p) => {
      if (maxBudget && p.price > maxBudget) return false;
      if (wantsPreloved && p.sellerType !== 'community_preloved' && !wantsNew) return false;
      return true;
    });

    // If query mentions specific keywords
    if (raw.includes('hitam') || raw.includes('black')) {
      const blackItems = recommendedProducts.filter(p => p.colorFamily === 'black' || p.colorHex.some(h => h === '#1C1C1C' || h === '#1A1A1A'));
      if (blackItems.length > 0) recommendedProducts = blackItems;
    } else if (raw.includes('dress') || raw.includes('gaun')) {
      const dressItems = recommendedProducts.filter(p => p.category === 'dress');
      if (dressItems.length > 0) recommendedProducts = dressItems;
    } else if (raw.includes('blazer') || raw.includes('outer') || raw.includes('hoodie')) {
      const outerItems = recommendedProducts.filter(p => p.category === 'outerwear');
      if (outerItems.length > 0) recommendedProducts = outerItems;
    } else if (raw.includes('batik')) {
      const batikItems = recommendedProducts.filter(p => p.style === 'etnik_batik_modern' || p.tags.includes('Batik'));
      if (batikItems.length > 0) recommendedProducts = batikItems;
    }

    // Limit to top 3 products or fallback if empty
    if (recommendedProducts.length === 0) {
      recommendedProducts = INITIAL_MARKETPLACE_PRODUCTS.slice(0, 2);
    } else {
      recommendedProducts = recommendedProducts.slice(0, 3);
    }

    // Call Gemini Generative API if key is provided
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const systemPrompt = `Anda adalah Outfitly Stylist, konsultan fashion personal yang ramah, berpengetahuan gaya mendalam, dan bersahabat di Indonesia. 
Platform Outfitly mendukung:
1. Rekomendasi busana UMKM baru dan item thrift preloved terkurasi dari komunitas.
2. Panduan ukuran sentimeter (cm) nyata untuk mencegah salah pilih size.
3. Padu-padan cerdas antara pakaian yang sudah dimiliki di lemari pengguna dengan katalog baru/thrift.
4. Transaksi aman dengan sistem rekening bersama (Rekber / Escrow) dan garansi retur ukuran.

Profil Pengguna:
- Nama: ${name}
- Skin Tone: ${skin}
- Lingkar Dada (CM): ${userMeasurements?.chestBustCm || 'Belum diisi'} cm
- Lingkar Pinggang (CM): ${userMeasurements?.waistCm || 'Belum diisi'} cm
- Preferensi Fit: ${userMeasurements?.preferredFit || 'Regular Fit'}

${wardrobeItems && wardrobeItems.length > 0 ? `Koleksi Pakaian di Lemari Pengguna:
${wardrobeItems.map(w => `- [Lemari] ${w.name} (Kategori: ${w.category}, Warna: ${w.color}, Style: ${w.style})`).join('\n')}` : 'Pengguna belum menambahkan pakaian ke lemari profilnya.'}

Daftar Produk yang Direkomendasikan:
${recommendedProducts.map(p => `- ${p.title} (Harga: Rp ${p.price.toLocaleString('id-ID')}, Sumber: ${p.sellerType === 'community_preloved' ? 'Preloved Komunitas' : 'UMKM Baru'}, Kondisi: ${p.condition})`).join('\n')}

Instruksi Balasan:
- Berikan saran gaya yang cerdas, hangat, dan solutif.
- Jika pengguna meminta padu-padan baju dari lemarinya, sebutkan pakaian dari lemari mereka dan pasangkan secara serasi dengan produk katalog di atas.
- Jelaskan mengapa produk yang dipilih cocok dari segi warna, budget, dan perkiraan ukuran tubuh (cm).
- Tulis dalam bahasa Indonesia yang luwes dan ramah.`;

        const contents: any[] = [];
        if (history && history.length > 0) {
          history.slice(-6).forEach(h => {
            contents.push({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            });
          });
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.75, maxOutputTokens: 800 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({ reply: replyText, recommendedProducts });
          }
        }
      } catch (e) {
        console.warn('Gemini API fallback to local intelligent engine');
      }
    }

    // Local Intelligent Engine
    let reply = '';

    const mentionsWardrobe = raw.includes('lemari') || raw.includes('baju saya') || raw.includes('wardrobe') || raw.includes('padukan') || raw.includes('punya');
    if (mentionsWardrobe) {
      if (wardrobeItems && wardrobeItems.length > 0) {
        const topItem = wardrobeItems.find(w => w.category === 'tops' || w.category === 'outerwear') || wardrobeItems[0];
        const matchProduct = recommendedProducts[0] || INITIAL_MARKETPLACE_PRODUCTS[0];
        reply = `Tentu ${name}! Aku sudah mengecek isi lemari pakaianmu di profil.

Kamu punya **${topItem.name}** (Warna ${topItem.color}). Untuk tampilan yang seimbang dan tidak boros:

1. **Atasan/Item Lemarimu:** ${topItem.name} (Sudah milikmu • **Rp 0**)
2. **Kombinasi Katalog UMKM:** Kami pasangkan dengan **${matchProduct.title}** (Rp ${matchProduct.price.toLocaleString('id-ID')}) dari ${matchProduct.sellerName}.
${userMeasurements?.chestBustCm ? `\n📏 **Catatan Ukuran Pas:** Berdasarkan ukuran lingkar dada (${userMeasurements.chestBustCm}cm), setelan ini memberikan siluet proporsional dan nyaman.` : ''}

Paduan visual ini langsung tersinkron di profil dan studio gaya. Kamu bisa langsung mengganti item jika ingin melihat alternatif lainnya!`;
      } else {
        reply = `Halo ${name}! Kamu belum menambahkan pakaian ke **Lemari Saya** di profilmu. 

Buka menu profil kamu untuk menambahkan baju yang kamu miliki (bisa unggah foto atau pilih sampel), lalu kembali ke sini agar aku bisa langsung meracik paduan baju milikmu dengan produk UMKM! ✨`;
      }
    } else if (raw.includes('minimalis') && (raw.includes('hitam') || raw.includes('black')) && maxBudget) {
      reply = `Tentu ${name}! Ini kurasi outfit **minimalis serba hitam** dengan kombinasi produk **UMKM baru** dan **thrift preloved** di bawah Rp ${maxBudget.toLocaleString('id-ID')}:

1. **Tas Kulit Handbag "Kencana"** (UMKM Baru • Rp 185.000) — Desain minimalis elegan dari kulit pull-up Yogyakarta.
2. **Preloved Streetwear Graphic Hoodie Charcoal** (Thrift • Rp 120.000) — Boxy fit tebal 330gsm yang sangat nyaman.
${userMeasurements?.chestBustCm ? `\n💡 **Catatan Fitting Ukuran:** Berdasarkan lingkar dada Anda (${userMeasurements.chestBustCm} cm), produk hoodie ini memberikan ruang gerak ideal (+${118 - userMeasurements.chestBustCm}cm ease).` : '\n💡 *Tips: Lengkapi profil ukuran (cm) Anda agar rekomendasi ukuran semakin presisi!*'}

Semua produk di bawah ini terhubung ke sistem **Outfitly Rekber & Garansi Pas Ukuran**. Kamu bisa klik langsung untuk melihat detail dan perbandingan ukurannya! 👇`;
    } else if (raw.includes('ukuran') || raw.includes('size') || raw.includes('lingkar') || raw.includes('cm') || raw.includes('muat')) {
      reply = `Di Outfitly, kita menggunakan **analisis sentimeter nyata (cm)**, bukan sekadar tebak-tebakan label huruf S/M/L yang sering berbeda antar brand!

${userMeasurements?.chestBustCm ? `📐 **Data Ukuran Tubuh Anda Saat Ini:**
• Lingkar Dada: **${userMeasurements.chestBustCm} cm**
• Lingkar Pinggang: **${userMeasurements.waistCm} cm**
• Preferensi Fit: **${userMeasurements.preferredFit?.toUpperCase()}**

Sistem kami akan otomatis menghitung kelonggaran kain untuk setiap baju agar tidak terlalu sesak atau kebesaran.` : 'Kamu belum mengisi profil lingkar badan (cm). Klik menu **Panduan Ukuran** di profil untuk memasukkan lingkar dada & pinggangmu!'}

Ada baju tertentu yang mau kita cek kecocokan ukurannya? 😊`;
    } else if (wantsPreloved) {
      reply = `Pilihan tepat! Berbelanja **preloved & thrift** di Outfitly tidak hanya hemat budget, tapi juga mendukung gerakan slow fashion berkelanjutan. 🌱

Setiap item preloved di Outfitly wajib mencantumkan:
1. **Kondisi Jujur** (*Like New, Very Good, Good, atau Has Defects*).
2. **Ukuran Nyata Sentimeter (CM)** hasil ukur mendatar (*flat lay*).
3. **Catatan Defek Transparan**.

Berikut beberapa koleksi thrift terkurasi yang cocok untukmu:`;
    } else if (raw.includes('kondangan') || raw.includes('pesta') || raw.includes('formal')) {
      reply = `Untuk acara kondangan atau pesta formal:
✨ Rekomendasi terbaik:
• **Flowy Silk Draped Midi Dress "Niskala"** (Preloved Like New • Rp 165.000) — Bahan mulberry silk jatuh anggun dengan detail drapery mewah.
• **Blazer Double-Breasted Olive Green** (Resale Vintage • Rp 285.000) — Potongan terstruktur bergaya Old Money.

Keduanya memiliki garansi pas ukuran di rekening bersama Outfitly! ✨`;
    } else {
      reply = `Halo ${name}! Aku sudah menyiapkan kurasi produk UMKM dan thrift preloved yang cocok untukmu. 

Kamu bisa menanyakan rekomendasi setelan, mencari pakaian dengan rentang budget tertentu (misal: *"cari outer di bawah 200rb"*), atau mengecek apakah suatu pakaian pas dengan lingkar dada & pinggangmu dalam sentimeter (cm).

Berikut beberapa koleksi unggulan yang bisa kamu cek:`;
    }

    return NextResponse.json({ reply, recommendedProducts });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error stylist chat';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
