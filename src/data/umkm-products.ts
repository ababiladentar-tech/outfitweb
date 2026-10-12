import { UMKMProductPost } from '../types';

export const INITIAL_MARKETPLACE_PRODUCTS: UMKMProductPost[] = [
  // 1. UMKM Brand: Pena Leather Works (Yogyakarta)
  {
    id: 'prod-01',
    sellerId: 'seller-umkm-01',
    sellerName: 'Pena Leather Works',
    sellerType: 'umkm',
    sellerCity: 'Yogyakarta',
    sellerRating: 4.9,
    sellerReviewCount: 142,
    sellerContact: '6281234567801',
    platform: 'outfitly_direct',
    title: 'Tas Kulit Handbag "Kencana" Hitam Elegan',
    description: 'Tas kulit handbag untuk wanita berwarna hitam elegan dengan kompartemen luas. Dibuat dari bahan kulit nabati pull-up premium asli pengrajin Yogyakarta dengan aksen jahitan tangan rapi dan hardware kuningan antik.',
    category: 'bag',
    style: 'minimalist',
    colorFamily: 'black',
    colorHex: ['#1C1C1C', '#333333'],
    price: 185000,
    originalPrice: 220000,
    condition: 'new',
    isOneOfAKind: false,
    stockCount: 15,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'All Size',
        garmentLengthCm: 28, // Tinggi 28cm, Lebar 34cm
        chestBustCm: undefined,
        waistCm: undefined
      }
    ],
    fitType: 'regular',
    measurementMethod: 'Dimensi tas diukur dalam kondisi terisi (Panjang 34cm x Lebar 12cm x Tinggi 28cm)',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Genuine Pull-Up Cow Leather',
    occasion: 'formal_meeting',
    genderTarget: 'female',
    likes: 1240,
    saves: 856,
    tags: ['Bag', 'Tas Kulit', 'Casual', 'Black Luxury', 'Minimalist', 'UMKM Jogja'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['hourglass', 'pear', 'rectangle', 'apple', 'inverted_triangle', 'oval', 'trapezoid'],
    bestForFaceShapes: ['oval', 'round', 'square', 'rectangle', 'diamond', 'heart'],
    createdAt: '2026-03-15T10:00:00Z'
  },

  // 2. UMKM Brand: Atelier Senja (Bandung)
  {
    id: 'prod-02',
    sellerId: 'seller-umkm-02',
    sellerName: 'Atelier Senja',
    sellerType: 'umkm',
    sellerCity: 'Bandung',
    sellerRating: 4.8,
    sellerReviewCount: 98,
    sellerContact: '6281234567802',
    platform: 'outfitly_direct',
    title: 'Vest Denim Tailored & White Shirt 2-Piece Set',
    description: 'Setelan vest denim berstruktur tegas dengan kancing kuningan vintage berpadu kemeja katun poplin putih bersih. Sangat menonjolkan siluet pinggang ramping dan memberi kesan smart casual.',
    category: 'casual_outfit',
    style: 'casual',
    colorFamily: 'blue',
    colorHex: ['#2F4858', '#FFFFFF'],
    price: 245000,
    originalPrice: 289000,
    condition: 'new',
    isOneOfAKind: false,
    stockCount: 8,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'S',
        chestBustCm: 92,
        waistCm: 76,
        shoulderWidthCm: 38,
        sleeveLengthCm: 56,
        garmentLengthCm: 62
      },
      {
        sizeLabel: 'M',
        chestBustCm: 98,
        waistCm: 82,
        shoulderWidthCm: 40,
        sleeveLengthCm: 57,
        garmentLengthCm: 64
      },
      {
        sizeLabel: 'L',
        chestBustCm: 104,
        waistCm: 88,
        shoulderWidthCm: 42,
        sleeveLengthCm: 58,
        garmentLengthCm: 66
      },
      {
        sizeLabel: 'XL',
        chestBustCm: 110,
        waistCm: 94,
        shoulderWidthCm: 44,
        sleeveLengthCm: 59,
        garmentLengthCm: 68
      }
    ],
    fitType: 'regular',
    measurementToleranceCm: 1.5,
    measurementMethod: 'Diukur mendatar di atas meja (flat-lay measurement) dari ujung jahitan ke jahitan.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Premium Denim 12oz & 100% Cotton Poplin',
    occasion: 'kuliah_kerja',
    genderTarget: 'female',
    likes: 3410,
    saves: 2150,
    tags: ['Casual Outfit', 'Denim Vest', 'Layering', 'Trendy', 'Casual', 'UMKM Bandung'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['hourglass', 'rectangle', 'inverted_triangle', 'pear'],
    bestForFaceShapes: ['oval', 'round', 'square', 'heart'],
    createdAt: '2026-03-20T11:30:00Z'
  },

  // 3. Community Preloved: Rania Thrift Closet (Jakarta Selatan)
  {
    id: 'prod-03',
    sellerId: 'seller-user-01',
    sellerName: 'Rania (@rania_thrift)',
    sellerType: 'community_preloved',
    sellerCity: 'Jakarta Selatan',
    sellerRating: 5.0,
    sellerReviewCount: 34,
    sellerContact: '6281311223344',
    platform: 'outfitly_direct',
    title: 'Preloved Vintage Silk Draped Midi Dress Cream "Niskala"',
    description: 'Koleksi pribadi dress midi silk jatuh flowy warna cream champagne. Baru dipakai 1x untuk resepsi pernikahan indoor hotel. Tidak ada sobekan, jahitan sangat mulus, sudah dicuci dry clean wangi siap pakai.',
    category: 'dress',
    style: 'formal',
    colorFamily: 'neutral',
    colorHex: ['#F5F5DC', '#FAF0E6'],
    price: 165000,
    originalPrice: 380000, // Diskon 56% dari beli baru
    condition: 'like_new',
    usageDuration: 'Dipakai 1x acara wisuda indoor',
    defectNotes: 'Tidak ada cacat / noda. Resleting belakang lancar 100%.',
    isOneOfAKind: true,
    stockCount: 1,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'Size M (Vintage Fit)',
        chestBustCm: 94,
        waistCm: 76,
        hipsCm: 102,
        shoulderWidthCm: 39,
        garmentLengthCm: 115
      }
    ],
    fitType: 'relaxed',
    measurementToleranceCm: 1.0,
    measurementMethod: 'Pengukuran baju dilakukan mandiri menggunakan meteran pita kain.',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Mulberry Satin Silk Premium',
    occasion: 'kondangan_pesta',
    genderTarget: 'female',
    likes: 2890,
    saves: 1940,
    tags: ['Dress', 'Preloved', 'Thrift', 'Midi Dress', 'Cream Silk', 'Kondangan'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['hourglass', 'pear', 'apple', 'rectangle'],
    bestForFaceShapes: ['oval', 'diamond', 'heart', 'round'],
    createdAt: '2026-04-01T09:15:00Z'
  },

  // 4. UMKM Brand: Modest Hijab Chic (Surabaya)
  {
    id: 'prod-04',
    sellerId: 'seller-umkm-03',
    sellerName: 'Modest Hijab Chic',
    sellerType: 'umkm',
    sellerCity: 'Surabaya',
    sellerRating: 4.9,
    sellerReviewCount: 310,
    sellerContact: '6281234567804',
    platform: 'outfitly_direct',
    title: 'Pashmina Silk Crinkle & Brown Cap OOTD Set',
    description: 'Setelan pashmina crinkle breathable anti gerah dipadukan dengan topi baseball suede cokelat vintage. Cocok untuk daily outfit santai, kuliah, hingga hangout cafe.',
    category: 'hijab',
    style: 'sporty',
    colorFamily: 'brown',
    colorHex: ['#8B5A2B', '#D2B48C'],
    price: 135000,
    originalPrice: 165000,
    condition: 'new',
    isOneOfAKind: false,
    stockCount: 22,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'All Size',
        garmentLengthCm: 180, // Panjang 180cm x Lebar 75cm
        chestBustCm: undefined,
        waistCm: undefined
      }
    ],
    fitType: 'regular',
    measurementMethod: 'Dimensi pashmina 180 x 75 cm dengan finishing jahit tepi super rapi.',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Silk Crinkle Premium & Suede Cap',
    occasion: 'hangout',
    genderTarget: 'female',
    likes: 1950,
    saves: 1320,
    tags: ['Hijab', 'Pashmina', 'Sporty Hijab', 'Earth Tone', 'UMKM Surabaya'],
    bestForSkinTones: ['warm', 'neutral'],
    bestForBodyShapes: ['hourglass', 'apple', 'inverted_triangle', 'rectangle', 'pear', 'oval', 'trapezoid'],
    bestForFaceShapes: ['round', 'oval', 'square', 'heart'],
    createdAt: '2026-03-25T14:20:00Z'
  },

  // 5. Community Preloved: Dimas Thrift Room (Semarang)
  {
    id: 'prod-05',
    sellerId: 'seller-user-02',
    sellerName: 'Dimas (@dimas_archive)',
    sellerType: 'community_preloved',
    sellerCity: 'Semarang',
    sellerRating: 4.8,
    sellerReviewCount: 19,
    sellerContact: '6281556677889',
    platform: 'outfitly_direct',
    title: 'Preloved Oversized Streetwear Graphic Hoodie Charcoal',
    description: 'Hoodie streetwear tebal gramasi 330gsm warna charcoal washed. Kondisi sangat bagus terawat, sablon plastisol tidak retak. Ada sedikit pudar alami di bagian saku kanguru yang justru memberi estetika vintage distressed.',
    category: 'outerwear',
    style: 'streetwear',
    colorFamily: 'black',
    colorHex: ['#2B2B2B', '#3D3D3D'],
    price: 120000,
    originalPrice: 350000,
    condition: 'very_good',
    usageDuration: 'Pemakaian wajar sekitar 5-6 bulan',
    defectNotes: 'Ada slight fading lembut di bibir saku depan, tidak ada noda atau lubang sama sekali.',
    isOneOfAKind: true,
    stockCount: 1,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'Size L (Boxy Fit)',
        chestBustCm: 118,
        waistCm: 114,
        shoulderWidthCm: 54,
        sleeveLengthCm: 61,
        garmentLengthCm: 71
      }
    ],
    fitType: 'oversized',
    measurementToleranceCm: 2.0,
    measurementMethod: 'Diukur flat lay dari ketiak ke ketiak (pit-to-pit 59cm -> keliling 118cm).',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Heavyweight Cotton Fleece 330gsm',
    occasion: 'daily_casual',
    genderTarget: 'unisex',
    likes: 4120,
    saves: 2890,
    tags: ['Streetwear', 'Hoodie', 'Boxy Fit', 'Thrift', 'Preloved', 'Charcoal'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['rectangle', 'inverted_triangle', 'apple', 'trapezoid', 'triangle'],
    bestForFaceShapes: ['oval', 'square', 'round', 'diamond'],
    createdAt: '2026-04-02T16:45:00Z'
  },

  // 6. Reseller Partner: Urban Heritage Resale (Jakarta Barat)
  {
    id: 'prod-06',
    sellerId: 'seller-reseller-01',
    sellerName: 'Urban Heritage Resale',
    sellerType: 'reseller',
    sellerCity: 'Jakarta Barat',
    sellerRating: 4.9,
    sellerReviewCount: 88,
    sellerContact: '6281789012345',
    platform: 'outfitly_direct',
    title: 'Curated Blazer Double-Breasted Olive Green "Old Money"',
    description: 'Blazer double-breasted warna olive sage curated vintage impor Jepang. Bahan wool blend berbobot dengan furing satin halus. Memiliki potongan bahu terstruktur yang memberi kesan karismatik.',
    category: 'outerwear',
    style: 'formal',
    colorFamily: 'green',
    colorHex: ['#556B2F', '#8FBC8F'],
    price: 285000,
    originalPrice: 650000,
    condition: 'very_good',
    usageDuration: 'Vintage curated, sudah full steam laundered',
    defectNotes: 'Kancing kedua sedikit longgar benangnya, sudah dikencangkan kembali oleh kurator.',
    isOneOfAKind: true,
    stockCount: 1,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'Size M-L (Tagged 94A6)',
        chestBustCm: 106,
        waistCm: 96,
        shoulderWidthCm: 45,
        sleeveLengthCm: 60,
        garmentLengthCm: 74
      }
    ],
    fitType: 'regular',
    measurementToleranceCm: 1.0,
    measurementMethod: 'Diukur standar tailor profesional (bahu, dada, pinggang blazer terkancing).',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Wool Blend & Satin Lining',
    occasion: 'formal_meeting',
    genderTarget: 'unisex',
    likes: 3100,
    saves: 2450,
    tags: ['Blazer', 'Old Money', 'Vintage Blazer', 'Olive Green', 'Formal', 'Resale'],
    bestForSkinTones: ['warm', 'neutral'],
    bestForBodyShapes: ['hourglass', 'inverted_triangle', 'trapezoid', 'rectangle'],
    bestForFaceShapes: ['oval', 'square', 'heart', 'diamond'],
    createdAt: '2026-03-28T08:10:00Z'
  },

  // 7. UMKM Brand: Rinjani Batik Craft (Pekalongan)
  {
    id: 'prod-07',
    sellerId: 'seller-umkm-04',
    sellerName: 'Rinjani Batik Craft',
    sellerType: 'umkm',
    sellerCity: 'Pekalongan',
    sellerRating: 4.9,
    sellerReviewCount: 175,
    sellerContact: '6281234567807',
    platform: 'outfitly_direct',
    title: 'Kemeja Batik Cap Katun Primissima Motif Parang Modern',
    description: 'Kemeja batik modern cap motif Parang Barong kontemporer dengan kombinasi warna navy indigo dan terracotta. Pewarnaan alami ramah lingkungan, tidak luntur, serta adem untuk iklim tropis.',
    category: 'top',
    style: 'etnik_batik_modern',
    colorFamily: 'blue',
    colorHex: ['#1A2B4C', '#C86432'],
    price: 195000,
    originalPrice: 240000,
    condition: 'new',
    isOneOfAKind: false,
    stockCount: 14,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'S',
        chestBustCm: 100,
        waistCm: 96,
        shoulderWidthCm: 43,
        sleeveLengthCm: 24,
        garmentLengthCm: 70
      },
      {
        sizeLabel: 'M',
        chestBustCm: 106,
        waistCm: 102,
        shoulderWidthCm: 45,
        sleeveLengthCm: 25,
        garmentLengthCm: 72
      },
      {
        sizeLabel: 'L',
        chestBustCm: 112,
        waistCm: 108,
        shoulderWidthCm: 47,
        sleeveLengthCm: 26,
        garmentLengthCm: 74
      },
      {
        sizeLabel: 'XL',
        chestBustCm: 118,
        waistCm: 114,
        shoulderWidthCm: 49,
        sleeveLengthCm: 27,
        garmentLengthCm: 76
      }
    ],
    fitType: 'regular',
    measurementToleranceCm: 1.5,
    measurementMethod: 'Pengukuran baju flat lay dari jahitan samping ke samping.',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
    ],
    material: '100% Katun Primissima Mercerized',
    occasion: 'formal_meeting',
    genderTarget: 'unisex',
    likes: 1840,
    saves: 990,
    tags: ['Batik', 'Etnik Modern', 'Kemeja Batik', 'Navy Indigo', 'UMKM Pekalongan'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['trapezoid', 'oval', 'rectangle', 'inverted_triangle'],
    bestForFaceShapes: ['oval', 'square', 'round'],
    createdAt: '2026-03-30T10:00:00Z'
  },

  // 8. Community Preloved: Tiara Thrift (Yogyakarta)
  {
    id: 'prod-08',
    sellerId: 'seller-user-03',
    sellerName: 'Tiara (@tiara_preloved)',
    sellerType: 'community_preloved',
    sellerCity: 'Yogyakarta',
    sellerRating: 4.7,
    sellerReviewCount: 12,
    sellerContact: '6281909876543',
    platform: 'outfitly_direct',
    title: 'Preloved Wide-Leg Highwaist Denim Jeans Light Blue',
    description: 'Celana jeans highwaist potongan wide-leg longgar warna biru muda vintage. Sangat nyaman di paha dan pinggul, memberi ilusi kaki jenjang. Kondisi kain kuat tebal tanpa robek.',
    category: 'jeans',
    style: 'casual',
    colorFamily: 'blue',
    colorHex: ['#7BA0C0', '#D0E0EC'],
    price: 95000,
    originalPrice: 280000,
    condition: 'good',
    usageDuration: 'Pemakaian sekitar 8 bulan untuk kuliah',
    defectNotes: 'Ada sedikit jejak pemakaian di ujung bawah celana (hem) karena kena sneakers, tidak kelihatan saat dipakai.',
    isOneOfAKind: true,
    stockCount: 1,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'Size 28 (Fit Pinggang 70-73cm)',
        waistCm: 72,
        hipsCm: 98,
        thighCm: 58,
        garmentLengthCm: 102
      }
    ],
    fitType: 'relaxed',
    measurementToleranceCm: 1.5,
    measurementMethod: 'Lingkar pinggang diukur melingkar di atas pusar (highwaist).',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Non-Stretch Rigid Denim 100% Cotton',
    occasion: 'kuliah_kerja',
    genderTarget: 'female',
    likes: 2450,
    saves: 1820,
    tags: ['Jeans', 'Highwaist', 'Wide Leg', 'Preloved', 'Thrift', 'Casual'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['hourglass', 'pear', 'rectangle', 'inverted_triangle'],
    bestForFaceShapes: ['oval', 'round', 'square', 'heart'],
    createdAt: '2026-04-03T12:00:00Z'
  },

  // 9. UMKM Brand: Svara Footwear (Bandung)
  {
    id: 'prod-09',
    sellerId: 'seller-umkm-05',
    sellerName: 'Svara Footwear',
    sellerType: 'umkm',
    sellerCity: 'Bandung',
    sellerRating: 4.9,
    sellerReviewCount: 220,
    sellerContact: '6281234567809',
    platform: 'outfitly_direct',
    title: 'Sepatu Loafers Kulit "Chunky Classic" Black Polished',
    description: 'Sepatu loafers berbahan kulit vegan semi-glossy dengan sol lug chunky ringan dan insole memory foam ekstra empuk. Cocok dipadukan dengan celana ankle atau rok midi untuk vibe preppy look modern.',
    category: 'shoes',
    style: 'minimalist',
    colorFamily: 'black',
    colorHex: ['#1A1A1A', '#2E2E2E'],
    price: 265000,
    originalPrice: 320000,
    condition: 'new',
    isOneOfAKind: false,
    stockCount: 18,
    isAvailable: true,
    availableSizes: [
      { sizeLabel: 'EU 38 (Insole 24.0 cm)', garmentLengthCm: 24 },
      { sizeLabel: 'EU 39 (Insole 24.5 cm)', garmentLengthCm: 24.5 },
      { sizeLabel: 'EU 40 (Insole 25.0 cm)', garmentLengthCm: 25 },
      { sizeLabel: 'EU 41 (Insole 25.5 cm)', garmentLengthCm: 25.5 },
      { sizeLabel: 'EU 42 (Insole 26.5 cm)', garmentLengthCm: 26.5 }
    ],
    fitType: 'regular',
    measurementMethod: 'Panjang insole telapak kaki dalam sentimeter (cm).',
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Vegan Microfiber Leather & Lightweight Phylon Sole',
    occasion: 'kuliah_kerja',
    genderTarget: 'unisex',
    likes: 3890,
    saves: 2610,
    tags: ['Shoes', 'Loafers', 'Chunky Sole', 'Black Shoes', 'Minimalist', 'UMKM Bandung'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['hourglass', 'apple', 'inverted_triangle', 'rectangle', 'pear', 'oval', 'trapezoid'],
    bestForFaceShapes: ['oval', 'round', 'square', 'heart'],
    createdAt: '2026-03-18T13:40:00Z'
  },

  // 10. Community Preloved: Bella Wardrobe (Surabaya)
  {
    id: 'prod-10',
    sellerId: 'seller-user-04',
    sellerName: 'Bella (@bella_wardrobe)',
    sellerType: 'community_preloved',
    sellerCity: 'Surabaya',
    sellerRating: 4.9,
    sellerReviewCount: 28,
    sellerContact: '6281239988776',
    platform: 'outfitly_direct',
    title: 'Preloved Pastel Pink Oversized Knit Cardigan',
    description: 'Cardigan rajut lembut warna pastel dusty pink dengan kancing tempurung kelapa. Potongan loose cozy sangat pas untuk kuliah ruangan ber-AC atau nongkrong sore di coffee shop.',
    category: 'outerwear',
    style: 'casual',
    colorFamily: 'pink',
    colorHex: ['#E8B4B8', '#F3D2D5'],
    price: 85000,
    originalPrice: 230000,
    condition: 'like_new',
    usageDuration: 'Dipakai 2x saat liburan di Malang',
    defectNotes: 'Kondisi 98% seperti baru, tidak ada bulu rajut yang berantakan (no pilling).',
    isOneOfAKind: true,
    stockCount: 1,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'Size Free (Oversized fit S-L)',
        chestBustCm: 114,
        waistCm: 110,
        shoulderWidthCm: 50,
        sleeveLengthCm: 54,
        garmentLengthCm: 65
      }
    ],
    fitType: 'relaxed',
    measurementToleranceCm: 2.0,
    measurementMethod: 'Diukur santai tanpa ditarik paksa.',
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Soft Acrylic Wool Knitted',
    occasion: 'hangout',
    genderTarget: 'female',
    likes: 1720,
    saves: 1350,
    tags: ['Cardigan', 'Pastel Pink', 'Knitwear', 'Preloved', 'Thrift', 'Casual Chic'],
    bestForSkinTones: ['cool', 'neutral'],
    bestForBodyShapes: ['hourglass', 'rectangle', 'pear', 'inverted_triangle'],
    bestForFaceShapes: ['oval', 'round', 'heart'],
    createdAt: '2026-04-04T15:10:00Z'
  },

  // 11. UMKM Brand: Svara Footwear (Bandung) — Pembanding Sepatu
  {
    id: 'prod-11',
    sellerId: 'seller-umkm-05',
    sellerName: 'Svara Footwear',
    sellerType: 'umkm',
    sellerCity: 'Bandung',
    sellerRating: 4.9,
    sellerReviewCount: 185,
    sellerContact: '6281234567809',
    platform: 'outfitly_direct',
    title: 'Sepatu Sneakers Kanvas Retro Low-Top Off-White',
    description: 'Sneakers kanvas klasik 12oz breathable dengan sol karet vulkanisir lentur dan insole berkontur anatomi telapak kaki. Sangat ringan untuk mobilitas harian, kuliah, atau jalan santai.',
    category: 'shoes',
    style: 'casual',
    colorFamily: 'white',
    colorHex: ['#F8F8F6', '#E5E4E0'],
    price: 235000,
    originalPrice: 280000,
    condition: 'new',
    isOneOfAKind: false,
    stockCount: 20,
    isAvailable: true,
    availableSizes: [
      { sizeLabel: 'EU 38 (Insole 24.0 cm)', garmentLengthCm: 24.0 },
      { sizeLabel: 'EU 39 (Insole 24.5 cm)', garmentLengthCm: 24.5 },
      { sizeLabel: 'EU 40 (Insole 25.0 cm)', garmentLengthCm: 25.0 },
      { sizeLabel: 'EU 41 (Insole 25.5 cm)', garmentLengthCm: 25.5 },
      { sizeLabel: 'EU 42 (Insole 26.5 cm)', garmentLengthCm: 26.5 }
    ],
    fitType: 'regular',
    measurementToleranceCm: 0.5,
    measurementMethod: 'Panjang insole telapak kaki dalam sentimeter (cm).',
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Heavy Cotton Canvas 12oz & Vulcanized Rubber Sole',
    occasion: 'daily_casual',
    genderTarget: 'unisex',
    likes: 2190,
    saves: 1470,
    tags: ['Shoes', 'Sneakers', 'Canvas Retro', 'Off-White', 'Casual', 'UMKM Bandung'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['hourglass', 'apple', 'inverted_triangle', 'rectangle', 'pear', 'oval', 'trapezoid'],
    bestForFaceShapes: ['oval', 'round', 'square', 'heart'],
    createdAt: '2026-04-05T10:00:00Z'
  },

  // 12. UMKM Brand: Pena Leather Works (Yogyakarta) — Pembanding Tas
  {
    id: 'prod-12',
    sellerId: 'seller-umkm-01',
    sellerName: 'Pena Leather Works',
    sellerType: 'umkm',
    sellerCity: 'Yogyakarta',
    sellerRating: 4.9,
    sellerReviewCount: 110,
    sellerContact: '6281234567801',
    platform: 'outfitly_direct',
    title: 'Tas Tote Bag Kanvas Etnik Tenun Jepara Natural',
    description: 'Tote bag kanvas tebal dengan aksen tenun lurik Jepara dan tali handle kulit nabati asli. Kompartemen lapang muat laptop hingga 14 inch dan buku catatan.',
    category: 'bag',
    style: 'etnik_batik_modern',
    colorFamily: 'brown',
    colorHex: ['#8B5A2B', '#E5D3B3'],
    price: 145000,
    originalPrice: 175000,
    condition: 'new',
    isOneOfAKind: false,
    stockCount: 12,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'All Size (P 38cm x T 32cm)',
        garmentLengthCm: 32,
        chestBustCm: undefined,
        waistCm: undefined
      }
    ],
    fitType: 'regular',
    measurementMethod: 'Dimensi tas diukur datar (Panjang 38cm x Lebar 10cm x Tinggi 32cm).',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Natural Cotton Canvas & Leather Straps',
    occasion: 'kuliah_kerja',
    genderTarget: 'unisex',
    likes: 1540,
    saves: 980,
    tags: ['Bag', 'Tote Bag', 'Etnik', 'Kanvas', 'UMKM Jogja'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['hourglass', 'pear', 'rectangle', 'apple', 'inverted_triangle', 'oval', 'trapezoid'],
    bestForFaceShapes: ['oval', 'round', 'square', 'heart'],
    createdAt: '2026-04-05T12:00:00Z'
  },

  // 13. UMKM Brand: Atelier Senja (Bandung) — Pembanding Bawahan
  {
    id: 'prod-13',
    sellerId: 'seller-umkm-02',
    sellerName: 'Atelier Senja',
    sellerType: 'umkm',
    sellerCity: 'Bandung',
    sellerRating: 4.8,
    sellerReviewCount: 76,
    sellerContact: '6281234567802',
    platform: 'outfitly_direct',
    title: 'Celana Panjang Chino Ankle Cut Khaki Stretch',
    description: 'Celana chino katun twill stretch dengan potongan slim ankle-cut yang rapi. Nyaman digunakan untuk mobilitas kantor maupun hangout kasual akhir pekan.',
    category: 'pants',
    style: 'casual',
    colorFamily: 'brown',
    colorHex: ['#C3B091', '#8C7D6B'],
    price: 198000,
    originalPrice: 235000,
    condition: 'new',
    isOneOfAKind: false,
    stockCount: 16,
    isAvailable: true,
    availableSizes: [
      {
        sizeLabel: 'Size 29',
        waistCm: 74,
        hipsCm: 96,
        thighCm: 56,
        garmentLengthCm: 92
      },
      {
        sizeLabel: 'Size 30',
        waistCm: 77,
        hipsCm: 99,
        thighCm: 58,
        garmentLengthCm: 93
      },
      {
        sizeLabel: 'Size 32',
        waistCm: 82,
        hipsCm: 104,
        thighCm: 60,
        garmentLengthCm: 94
      },
      {
        sizeLabel: 'Size 34',
        waistCm: 87,
        hipsCm: 109,
        thighCm: 62,
        garmentLengthCm: 96
      }
    ],
    fitType: 'regular',
    measurementToleranceCm: 1.0,
    measurementMethod: 'Diukur mendatar di atas meja (flat-lay measurement).',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'
    ],
    material: 'Cotton Twill Stretch 98% Cotton 2% Spandex',
    occasion: 'kuliah_kerja',
    genderTarget: 'unisex',
    likes: 1980,
    saves: 1420,
    tags: ['Pants', 'Chino', 'Khaki', 'Slim Fit', 'Casual', 'UMKM Bandung'],
    bestForSkinTones: ['cool', 'neutral', 'warm'],
    bestForBodyShapes: ['trapezoid', 'rectangle', 'oval', 'inverted_triangle'],
    bestForFaceShapes: ['oval', 'round', 'square'],
    createdAt: '2026-04-05T14:00:00Z'
  }
];

// Re-export alias for legacy compatibility
export const OFTEA_POSTS = INITIAL_MARKETPLACE_PRODUCTS;
