import type {
  AppNotification,
  BodyMeasurements,
  CommunityPost,
  ProductCategory,
  ProductComment,
  ProductCondition,
  SellerType,
  StoreAnalytics,
  StoreProfile,
  StylePreference,
  UMKMProductPost,
  UserProfile,
  WardrobeCategory,
  WardrobeItem,
} from './types';

/* ---------- Labels ---------- */

export const SELLER_TYPE_LABEL: Record<SellerType, string> = {
  umkm: 'Brand UMKM Baru',
  community_preloved: 'Preloved Thrift',
  collab_mitra: 'Collab Mitra',
};

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  top: 'Atasan',
  pants: 'Celana',
  dress: 'Dress',
  outerwear: 'Outer',
  jeans: 'Jeans',
  bag: 'Tas',
  shoes: 'Sepatu',
  hijab: 'Hijab',
};

export const CONDITION_LABEL: Record<ProductCondition, string> = {
  new: 'Baru',
  like_new: 'Seperti Baru',
  very_good: 'Sangat Baik',
  good: 'Baik',
};

export const WARDROBE_CATEGORY_LABEL: Record<WardrobeCategory, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  outerwear: 'Outerwear',
  dresses: 'Dresses',
  shoes: 'Shoes',
  bags: 'Bags',
  accessories: 'Accessories',
};

export const STYLE_LABEL: Record<StylePreference, string> = {
  casual: 'Casual',
  formal: 'Formal',
  minimalist: 'Minimalist',
  streetwear: 'Streetwear',
  old_money: 'Old Money',
  etnik_modern: 'Etnik Modern',
};

export const CITIES = ['Bandung', 'Solo', 'Yogya', 'Pekalongan', 'Tasikmalaya'] as const;

/* ---------- Defaults ---------- */

export const DEFAULT_MEASUREMENTS: BodyMeasurements = {
  chestCm: 88,
  waistCm: 72,
  shoulderCm: 39,
  heightCm: 160,
  weightKg: 54,
  footCm: 23.5,
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Tamu Outfitly',
  email: '',
  gender: 'girl',
  skinTone: 'warm',
  bodyShape: 'hourglass',
  faceShape: 'oval',
  palette: ['#8EA89D', '#E8DCC4', '#7A5C46'],
  styles: ['casual', 'minimalist'],
  measurements: DEFAULT_MEASUREMENTS,
  onboarded: false,
};

/** Analytics start empty and only count real interactions in this browser. */
export const DEFAULT_ANALYTICS: Record<string, StoreAnalytics> = {};

/* ---------- Stores ---------- */

export const STORES: StoreProfile[] = [
  {
    id: 's_senja',
    name: 'Atelier Senja',
    city: 'Bandung',
    followerCount: 12480,
    contactNumber: '6281221004411',
    bio: 'Linen dan katun lokal, dijahit tangan di Dago.',
    story:
      'Kami mulai dari satu mesin jahit di garasi rumah tahun 2019. Outfitly membantu kami bertemu pembeli yang peduli ukuran cm nyata, sehingga angka retur turun dan penjahit kami bisa fokus pada kualitas jahitan, bukan revisi ukuran.',
    externalShopUrl: 'https://shopee.co.id/',
    instagram: '@ateliersenja.bdg',
    sellerType: 'umkm',
    bannerHex: '#C9B9A2',
    avatarHex: '#162D24',
  },
  {
    id: 's_kala',
    name: 'Kala Studio',
    city: 'Solo',
    followerCount: 8930,
    contactNumber: '6281329007722',
    bio: 'Lurik dan tenun Klaten untuk siluet kantor modern.',
    story:
      'Ibu-ibu penenun di Pedan menenun lurik untuk kami setiap minggu. Kami membuka akun di Outfitly karena di sini pembeli menghargai cerita kain dan mau membaca tabel ukuran sebelum membeli.',
    externalShopUrl: 'https://www.tokopedia.com/',
    instagram: '@kalastudio.solo',
    sellerType: 'umkm',
    bannerHex: '#A88A6A',
    avatarHex: '#7A5C46',
  },
  {
    id: 's_denim',
    name: 'Denim Lab',
    city: 'Pekalongan',
    followerCount: 15720,
    contactNumber: '6285640003311',
    bio: 'Selvedge denim 13,5 oz, potong dan cuci sendiri.',
    story:
      'Kami percaya denim yang baik harus pas sejak hari pertama. Dengan Panduan Ukuran (cm) Outfitly, pelanggan tahu persis kelonggaran pinggang sebelum checkout. Itu alasan kami bergabung.',
    externalShopUrl: 'https://shopee.co.id/',
    instagram: '@denimlab.pkl',
    sellerType: 'umkm',
    bannerHex: '#3D4F66',
    avatarHex: '#2A3A4F',
  },
  {
    id: 's_rengganis',
    name: 'Batik Rengganis',
    city: 'Pekalongan',
    followerCount: 6210,
    contactNumber: '6285742008899',
    bio: 'Batik cap dan tulis pewarna alam, potongan kontemporer.',
    story:
      'Generasi ketiga pembatik di Kauman. Kami ingin batik dipakai ke kampus dan ke kantor, bukan hanya ke kondangan. Outfitly memberi ruang bagi kami untuk menunjukkan cara memadukannya.',
    externalShopUrl: 'https://www.tokopedia.com/',
    instagram: '@batikrengganis',
    sellerType: 'umkm',
    bannerHex: '#8A5A3C',
    avatarHex: '#5B3A26',
  },
  {
    id: 's_sulam',
    name: 'Sulam Tasik',
    city: 'Tasikmalaya',
    followerCount: 4980,
    contactNumber: '6282118006655',
    bio: 'Bordir Kawalu dan hijab voal premium.',
    story:
      'Bordir Tasik dikerjakan per helai oleh pengrajin di Kawalu. Kami bergabung dengan Outfitly supaya karya mereka sampai ke lemari anak muda di seluruh Indonesia.',
    externalShopUrl: 'https://shopee.co.id/',
    instagram: '@sulamtasik',
    sellerType: 'umkm',
    bannerHex: '#D9C7C0',
    avatarHex: '#E58B94',
  },
  {
    id: 's_lawas',
    name: 'Lawas Yogya',
    city: 'Yogya',
    followerCount: 9340,
    contactNumber: '6287738001122',
    bio: 'Preloved terverifikasi, dicuci dan diukur ulang manual.',
    story:
      'Setiap barang kami ukur ulang dalam posisi flat-lay dan kami foto kondisinya apa adanya. Satu barang, satu pemilik baru. Di Outfitly kami bisa mencantumkan cm nyata sehingga pembeli thrift tidak lagi menebak.',
    externalShopUrl: 'https://shopee.co.id/',
    instagram: '@lawas.yogya',
    sellerType: 'community_preloved',
    bannerHex: '#B7A68A',
    avatarHex: '#4E5B3F',
  },
  {
    id: 's_rupa',
    name: 'Rupa Kembali',
    city: 'Bandung',
    followerCount: 7120,
    contactNumber: '6281394005566',
    bio: 'Collab Mitra: kurasi preloved bersama stylist Outfitly.',
    story:
      'Kami adalah thrift shop mitra yang dikurasi langsung bersama tim stylist Outfitly. Setiap koleksi dipilih per musim agar mudah dipadukan dengan brand UMKM lain.',
    externalShopUrl: 'https://www.tokopedia.com/',
    instagram: '@rupakembali',
    sellerType: 'collab_mitra',
    bannerHex: '#A3B9AD',
    avatarHex: '#153329',
  },
  {
    id: 's_langkah',
    name: 'Langkah Kriya',
    city: 'Yogya',
    followerCount: 5560,
    contactNumber: '6281578002244',
    bio: 'Sepatu dan tas kulit nabati, jahitan tangan.',
    story:
      'Kulit kami disamak nabati di Magetan dan dijahit di bengkel kecil di Kotagede. Kami mencantumkan panjang insole cm di setiap produk karena kami ingin sepatu pertama Anda langsung pas.',
    externalShopUrl: 'https://shopee.co.id/',
    instagram: '@langkahkriya',
    sellerType: 'umkm',
    bannerHex: '#6B4A35',
    avatarHex: '#3A2A1F',
  },
];

/* ---------- Products ---------- */

interface Seed {
  id: string;
  store: string;
  title: string;
  description: string;
  category: ProductCategory;
  style: string;
  colorFamily: string;
  colorHex: string[];
  price: number;
  originalPrice?: number;
  condition: ProductCondition;
  isOneOfAKind?: boolean;
  stockCount: number;
  sizes: UMKMProductPost['availableSizes'];
  art: string;
  photo?: string;
  material: string;
  stretch?: boolean;
  likes: number;
  saves: number;
  tags: string[];
  daysAgo: number;
}

const tops = (base: number, shoulder: number, length: number) => [
  { sizeLabel: 'S', chestBustCm: base, shoulderWidthCm: shoulder, garmentLengthCm: length },
  { sizeLabel: 'M', chestBustCm: base + 4, shoulderWidthCm: shoulder + 1, garmentLengthCm: length + 1 },
  { sizeLabel: 'L', chestBustCm: base + 8, shoulderWidthCm: shoulder + 2, garmentLengthCm: length + 2 },
  { sizeLabel: 'XL', chestBustCm: base + 12, shoulderWidthCm: shoulder + 3, garmentLengthCm: length + 3 },
];

const bottoms = (waist: number, hips: number, length: number) => [
  { sizeLabel: '27', waistCm: waist, hipsCm: hips, garmentLengthCm: length },
  { sizeLabel: '28', waistCm: waist + 2.5, hipsCm: hips + 2.5, garmentLengthCm: length },
  { sizeLabel: '30', waistCm: waist + 5, hipsCm: hips + 5, garmentLengthCm: length + 1 },
  { sizeLabel: '32', waistCm: waist + 10, hipsCm: hips + 10, garmentLengthCm: length + 2 },
];

const SEEDS: Seed[] = [
  {
    id: 'p01', photo: '1752047763318-901b21a622c5', store: 's_senja', title: 'Kemeja Linen Oversize Sage',
    description: 'Kemeja linen ramie dengan bahu jatuh dan kancing batok kelapa. Ringan untuk iklim tropis, makin lembut setelah dicuci.',
    category: 'top', style: 'minimalist', colorFamily: 'Hijau', colorHex: ['#8EA89D', '#6F8A7E'],
    price: 289000, condition: 'new', stockCount: 18, sizes: tops(104, 46, 72), art: 'shirt:plain',
    material: 'Linen ramie 100%', likes: 842, saves: 311, tags: ['kantor', 'kuliah', 'linen'], daysAgo: 3,
  },
  {
    id: 'p02', photo: '1745381251702-67b07225e516', store: 's_senja', title: 'Blouse Katun Krem Kerah Shanghai',
    description: 'Blouse katun voile dengan kerah shanghai rendah dan lengan 3/4. Siluet lurus yang aman untuk tubuh rectangle dan hourglass.',
    category: 'top', style: 'etnik_modern', colorFamily: 'Krem', colorHex: ['#E8DCC4', '#CDBE9F'],
    price: 239000, condition: 'new', stockCount: 24, sizes: tops(92, 37, 64), art: 'blouse:plain',
    material: 'Katun voile', likes: 615, saves: 204, tags: ['kantor', 'kondangan'], daysAgo: 6,
  },
  {
    id: 'p03', photo: '1769703078470-3bbf68b3900a', store: 's_kala', title: 'Outer Kimono Tenun Motif Bata',
    description: 'Outer kimono dari tenun ATBM Pedan bermotif geometris warna bata. Potongan lurus dan terbuka memberi garis vertikal yang memanjangkan siluet.',
    category: 'outerwear', style: 'etnik_modern', colorFamily: 'Pink', colorHex: ['#D99A8C', '#6B4A3A'],
    price: 365000, condition: 'new', stockCount: 9, sizes: tops(108, 44, 78), art: 'kimono:stripe',
    material: 'Lurik tenun ATBM', likes: 1032, saves: 487, tags: ['kantor', 'weekend', 'tenun'], daysAgo: 2,
  },
  {
    id: 'p04', photo: '1789110520755-058df30bf9cb', store: 's_kala', title: 'Celana Kulot Tenun Hitam',
    description: 'Kulot high waist dengan pinggang karet belakang. Jatuh lurus, nyaman untuk naik motor ke kampus.',
    category: 'pants', style: 'minimalist', colorFamily: 'Hitam', colorHex: ['#2B2A28', '#4A4845'],
    price: 259000, condition: 'new', stockCount: 20, sizes: bottoms(66, 100, 92), art: 'culottes:plain',
    material: 'Tenun katun campur', stretch: true, likes: 501, saves: 166, tags: ['kuliah', 'kantor'], daysAgo: 9,
  },
  {
    id: 'p05', photo: '1725387072845-7431bbc453bc', store: 's_denim', title: 'Straight Jeans Selvedge Indigo',
    description: 'Selvedge 13,5 oz non-stretch, potongan straight. Akan melar sekitar 1 cm di pinggang setelah dua minggu pemakaian.',
    category: 'jeans', style: 'streetwear', colorFamily: 'Biru', colorHex: ['#2F4A6D', '#C7A15A'],
    price: 449000, condition: 'new', stockCount: 14, sizes: bottoms(70, 96, 100), art: 'jeans:denim',
    material: 'Denim selvedge 13,5 oz', stretch: false, likes: 1488, saves: 702, tags: ['kasual', 'weekend', 'denim'], daysAgo: 1,
  },
  {
    id: 'p06', photo: '1611312449408-fcece27cdbb7', store: 's_denim', title: 'Trucker Jacket Washed Blue',
    description: 'Jaket denim cuci batu dengan kancing tembaga. Lapisan pas untuk cuaca sejuk Bandung atau ruang kelas ber-AC.',
    category: 'outerwear', style: 'streetwear', colorFamily: 'Biru', colorHex: ['#6E8BA8', '#C7A15A'],
    price: 489000, condition: 'new', stockCount: 7, sizes: tops(100, 43, 60), art: 'jacket:denim',
    material: 'Denim 12 oz', likes: 977, saves: 420, tags: ['kasual', 'sejuk'], daysAgo: 5,
  },
  {
    id: 'p07', photo: '1790283727726-f8ba027df653', store: 's_denim', title: 'Wide Leg Jeans Light Wash',
    description: 'Jeans wide leg cuci terang dengan kandungan 2% elastane. Pinggang tinggi menyeimbangkan bentuk tubuh pear.',
    category: 'jeans', style: 'casual', colorFamily: 'Biru', colorHex: ['#A9C1D9', '#C7A15A'],
    price: 419000, condition: 'new', stockCount: 11, sizes: bottoms(68, 98, 102), art: 'widejeans:denim',
    material: 'Denim katun 98%, elastane 2%', stretch: true, likes: 734, saves: 288, tags: ['kuliah', 'weekend'], daysAgo: 4,
  },
  {
    id: 'p08', photo: '1760546659331-17903ed0d447', store: 's_rengganis', title: 'Kemeja Batik Cap Sogan',
    description: 'Batik cap motif parang kecil dengan pewarna soga alam. Potongan regular, kerah kemeja modern.',
    category: 'top', style: 'etnik_modern', colorFamily: 'Coklat', colorHex: ['#7A4E2D', '#E8C690'],
    price: 325000, condition: 'new', stockCount: 16, sizes: tops(100, 44, 70), art: 'shirt:batik',
    material: 'Katun primisima', likes: 689, saves: 251, tags: ['kondangan', 'kantor', 'batik'], daysAgo: 7,
  },
  {
    id: 'p09', photo: '1779501029074-3d48e7f6bbb9', store: 's_rengganis', title: 'Dress Batik Tulis Indigo Midi',
    description: 'Dress midi batik tulis pewarna indigo alam. Potongan A-line dengan tali pinggang, ideal untuk kondangan siang.',
    category: 'dress', style: 'etnik_modern', colorFamily: 'Biru', colorHex: ['#2E3F5C', '#D9CBB0'],
    price: 685000, condition: 'new', stockCount: 4, sizes: tops(88, 36, 118), art: 'dress:batik',
    material: 'Katun prima, batik tulis', likes: 1210, saves: 655, tags: ['kondangan', 'batik'], daysAgo: 2,
  },
  {
    id: 'p10', photo: '1601869610370-907c3e63d7e0', store: 's_sulam', title: 'Hijab Voal Bordir Kawalu Dusty Pink',
    description: 'Hijab segi empat voal 115 x 115 cm dengan bordir tangan di satu sudut. Tidak licin dan mudah dibentuk.',
    category: 'hijab', style: 'minimalist', colorFamily: 'Pink', colorHex: ['#E58B94', '#F3D3D6'],
    price: 129000, condition: 'new', stockCount: 40, sizes: [{ sizeLabel: '115 x 115', garmentLengthCm: 115 }], art: 'hijab:embroidery',
    material: 'Voal premium', likes: 1532, saves: 812, tags: ['kuliah', 'kondangan'], daysAgo: 1,
  },
  {
    id: 'p11', photo: '1790440966381-cc89370feb72', store: 's_sulam', title: 'Tunik Bordir Putih Gading',
    description: 'Tunik katun dengan bordir kerawang di bagian dada. Panjang menutup pinggul.',
    category: 'top', style: 'etnik_modern', colorFamily: 'Putih', colorHex: ['#F4EFE3', '#D8CDB5'],
    price: 345000, condition: 'new', stockCount: 8, sizes: tops(96, 38, 86), art: 'tunic:embroidery',
    material: 'Katun toyobo', likes: 466, saves: 190, tags: ['kantor', 'kondangan'], daysAgo: 11,
  },
  {
    id: 'p12', photo: '1604914509286-abc02036617c', store: 's_lawas', title: 'Blazer Wol Vintage Camel',
    description: 'Blazer wol 1990-an, label Jepang. Bahu berstruktur, satu noda kecil di lapisan dalam (sudah difoto).',
    category: 'outerwear', style: 'old_money', colorFamily: 'Coklat', colorHex: ['#B88B5A', '#8C6A44'],
    price: 215000, originalPrice: 1800000, condition: 'very_good', isOneOfAKind: true, stockCount: 1,
    sizes: [{ sizeLabel: 'M (flat-lay)', chestBustCm: 98, shoulderWidthCm: 42, garmentLengthCm: 70 }], art: 'blazer:plain',
    material: 'Wol 80%, nilon 20%', likes: 2104, saves: 960, tags: ['kantor', 'old money'], daysAgo: 1,
  },
  {
    id: 'p13', photo: '1756483500042-12c4444fc2f4', store: 's_lawas', title: 'Rok Plisket Vintage Hijau Botol',
    description: 'Rok plisket midi era 80-an dengan pinggang karet. Plisket masih tegas.',
    category: 'pants', style: 'old_money', colorFamily: 'Hijau', colorHex: ['#244C3A', '#183427'],
    price: 98000, originalPrice: 450000, condition: 'like_new', isOneOfAKind: true, stockCount: 1,
    sizes: [{ sizeLabel: 'All size (flat-lay)', waistCm: 64, hipsCm: 104, garmentLengthCm: 78 }], art: 'skirt:pleat',
    material: 'Poliester', stretch: true, likes: 870, saves: 344, tags: ['kuliah', 'weekend'], daysAgo: 3,
  },
  {
    id: 'p14', photo: '1791391280267-a83f5649e762', store: 's_lawas', title: 'Kemeja Oxford Stripe Preloved',
    description: 'Oxford katun garis biru muda. Kerah button down, kondisi sangat baik tanpa cacat.',
    category: 'top', style: 'old_money', colorFamily: 'Biru', colorHex: ['#BFD0E0', '#FFFFFF'],
    price: 85000, originalPrice: 650000, condition: 'very_good', isOneOfAKind: true, stockCount: 1,
    sizes: [{ sizeLabel: 'L (flat-lay)', chestBustCm: 108, shoulderWidthCm: 46, garmentLengthCm: 76 }], art: 'shirt:stripe',
    material: 'Katun oxford', likes: 540, saves: 210, tags: ['kantor', 'kuliah'], daysAgo: 8,
  },
  {
    id: 'p15', photo: '1683315565563-f72590773805', store: 's_rupa', title: 'Cardigan Rajut Oatmeal',
    description: 'Cardigan rajut tebal preloved, dikurasi stylist untuk padu padan musim hujan.',
    category: 'outerwear', style: 'minimalist', colorFamily: 'Krem', colorHex: ['#D8C9AE', '#BFAE90'],
    price: 135000, originalPrice: 520000, condition: 'like_new', isOneOfAKind: true, stockCount: 1,
    sizes: [{ sizeLabel: 'M (flat-lay)', chestBustCm: 104, shoulderWidthCm: 44, garmentLengthCm: 66 }], art: 'cardigan:knit',
    material: 'Akrilik wol campur', likes: 760, saves: 402, tags: ['sejuk', 'kuliah'], daysAgo: 2,
  },
  {
    id: 'p16', photo: '1790802243983-e6de0e275f59', store: 's_rupa', title: 'Slip Dress Satin Silver',
    description: 'Slip dress satin preloved, tali bisa diatur. Layer dengan kemeja atau cardigan untuk acara siang.',
    category: 'dress', style: 'old_money', colorFamily: 'Abu', colorHex: ['#B9B7B1', '#8E8C86'],
    price: 165000, originalPrice: 700000, condition: 'very_good', isOneOfAKind: true, stockCount: 1,
    sizes: [{ sizeLabel: 'S (flat-lay)', chestBustCm: 86, waistCm: 74, garmentLengthCm: 112 }], art: 'slipdress:satin',
    material: 'Satin poliester', likes: 1180, saves: 590, tags: ['kondangan', 'weekend'], daysAgo: 4,
  },
  {
    id: 'p17', photo: '1768696081901-5be7058d67da', store: 's_rupa', title: 'Trousers Wol Abu Pleated',
    description: 'Celana bahan pleated dengan lipit depan. Potongan tapered, pinggang bisa dikecilkan 2 cm di penjahit.',
    category: 'pants', style: 'old_money', colorFamily: 'Abu', colorHex: ['#8B8C88', '#6E6F6B'],
    price: 145000, originalPrice: 600000, condition: 'good', isOneOfAKind: true, stockCount: 1,
    sizes: [{ sizeLabel: '30 (flat-lay)', waistCm: 76, hipsCm: 102, garmentLengthCm: 100 }], art: 'trousers:plain',
    material: 'Wol campur', stretch: false, likes: 410, saves: 170, tags: ['kantor'], daysAgo: 10,
  },
  {
    id: 'p18', photo: '1777987601447-266e128de448', store: 's_langkah', title: 'Loafer Kulit Nabati Coklat Tua',
    description: 'Loafer penny dengan sol karet dijahit. Kulit nabati akan membentuk kaki setelah beberapa kali pakai.',
    category: 'shoes', style: 'old_money', colorFamily: 'Coklat', colorHex: ['#5B3A26', '#3A2A1F'],
    price: 545000, condition: 'new', stockCount: 12,
    sizes: [
      { sizeLabel: '37', insoleCm: 23.5 }, { sizeLabel: '38', insoleCm: 24.2 }, { sizeLabel: '39', insoleCm: 24.9 },
      { sizeLabel: '40', insoleCm: 25.6 }, { sizeLabel: '41', insoleCm: 26.3 }, { sizeLabel: '42', insoleCm: 27.0 },
    ],
    art: 'loafer:plain', material: 'Kulit sapi samak nabati', likes: 920, saves: 455, tags: ['kantor', 'kondangan'], daysAgo: 5,
  },
  {
    id: 'p19', photo: '1727061180303-d91cdeca6f9c', store: 's_langkah', title: 'Sneakers Kulit Putih Low Top',
    description: 'Sneakers low top kulit sapi putih dengan sol karet jahit. Insole lateks empuk.',
    category: 'shoes', style: 'casual', colorFamily: 'Putih', colorHex: ['#F2F0EA', '#B07A45'],
    price: 389000, condition: 'new', stockCount: 22,
    sizes: [
      { sizeLabel: '37', insoleCm: 23.8 }, { sizeLabel: '38', insoleCm: 24.5 }, { sizeLabel: '39', insoleCm: 25.2 },
      { sizeLabel: '40', insoleCm: 25.9 }, { sizeLabel: '41', insoleCm: 26.6 }, { sizeLabel: '42', insoleCm: 27.3 },
    ],
    art: 'sneaker:plain', material: 'Kulit sapi, karet alam', likes: 1305, saves: 610, tags: ['kuliah', 'kasual', 'weekend'], daysAgo: 3,
  },
  {
    id: 'p20', photo: '1624687943971-e86af76d57de', store: 's_langkah', title: 'Tote Kulit Natural Medium',
    description: 'Tote kulit nabati muat laptop 14 inci. Tanpa lapisan, tepi dibakar manual.',
    category: 'bag', style: 'minimalist', colorFamily: 'Coklat', colorHex: ['#B98557', '#8C5F3A'],
    price: 625000, condition: 'new', stockCount: 6,
    sizes: [{ sizeLabel: 'Medium', bagLengthCm: 36, bagWidthCm: 12, bagHeightCm: 30 }], art: 'tote:plain',
    material: 'Kulit sapi samak nabati', likes: 780, saves: 390, tags: ['kantor', 'kuliah'], daysAgo: 6,
  },
  {
    id: 'p21', photo: '1600857062241-98e5dba7f214', store: 's_langkah', title: 'Sling Bag Kulit Coklat Mini',
    description: 'Sling bag kulit nabati dengan tali bisa diatur. Cukup untuk ponsel, dompet, dan kunci motor.',
    category: 'bag', style: 'casual', colorFamily: 'Coklat', colorHex: ['#A8673E', '#6B3F24'],
    price: 179000, condition: 'new', stockCount: 30,
    sizes: [{ sizeLabel: 'Mini', bagLengthCm: 22, bagWidthCm: 7, bagHeightCm: 15 }], art: 'sling:plain',
    material: 'Kulit sapi samak nabati', likes: 455, saves: 201, tags: ['kuliah', 'weekend'], daysAgo: 12,
  },
  {
    id: 'p22', photo: '1627686011747-74adda3d2343', store: 's_kala', title: 'Kemeja Pria Katun Putih',
    description: 'Kemeja pria katun putih potongan regular, lengan bisa digulung. Pilihan aman untuk kantor dan kondangan siang.',
    category: 'top', style: 'etnik_modern', colorFamily: 'Putih', colorHex: ['#F1EEE7', '#B9B6AD'],
    price: 299000, condition: 'new', stockCount: 15, sizes: tops(104, 45, 74), art: 'shirt:stripe',
    material: 'Katun oxford', likes: 388, saves: 140, tags: ['kantor', 'pria'], daysAgo: 13,
  },
  {
    id: 'p23', photo: '1473966968600-fa801b869a1a', store: 's_senja', title: 'Celana Chino Katun Twill Khaki',
    description: 'Chino katun twill dengan 3% spandex. Kelonggaran pinggang lebih toleran dibanding denim non-stretch.',
    category: 'pants', style: 'casual', colorFamily: 'Krem', colorHex: ['#C2A878', '#A48C5E'],
    price: 279000, condition: 'new', stockCount: 19, sizes: bottoms(70, 96, 98), art: 'trousers:twill',
    material: 'Katun twill 97%, spandex 3%', stretch: true, likes: 512, saves: 230, tags: ['kantor', 'kuliah', 'pria'], daysAgo: 7,
  },
  {
    id: 'p24', photo: '1762343935300-4828111fee03', store: 's_rengganis', title: 'Outer Batik Kombinasi Linen Hitam',
    description: 'Outer panjang linen hitam dengan panel batik cap di kerah dan saku.',
    category: 'outerwear', style: 'etnik_modern', colorFamily: 'Hitam', colorHex: ['#262523', '#C79A5B'],
    price: 415000, condition: 'new', stockCount: 0, sizes: tops(106, 44, 96), art: 'kimono:batik',
    material: 'Linen, katun batik', likes: 650, saves: 300, tags: ['kondangan', 'kantor'], daysAgo: 15,
  },
];

/** Representative product photos from Unsplash (free licence). The garments are similar pieces, not the sellers' own stock. */
export const productPhoto = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=720&h=900&q=80`;

const daysAgoIso = (d: number): string =>
  new Date(Date.UTC(2026, 10, 20 - d, 9, 0, 0)).toISOString();

const storeById = (id: string): StoreProfile => {
  const s = STORES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown store ${id}`);
  return s;
};

export const SEED_PRODUCTS: UMKMProductPost[] = SEEDS.map((s) => {
  const store = storeById(s.store);
  return {
    id: s.id,
    sellerId: store.id,
    sellerName: store.name,
    sellerType: store.sellerType,
    sellerCity: store.city,
    sellerContact: store.contactNumber,
    externalLink: store.externalShopUrl,
    title: s.title,
    description: s.description,
    category: s.category,
    style: s.style,
    colorFamily: s.colorFamily,
    colorHex: s.colorHex,
    price: s.price,
    originalPrice: s.originalPrice,
    condition: s.condition,
    isOneOfAKind: s.isOneOfAKind,
    stockCount: s.stockCount,
    isAvailable: s.stockCount > 0,
    availableSizes: s.sizes,
    imageUrl: s.photo ? productPhoto(s.photo) : `art:${s.art}`,
    material: s.material,
    stretch: s.stretch,
    likes: s.likes,
    saves: s.saves,
    tags: s.tags,
    createdAt: daysAgoIso(s.daysAgo),
  };
});

/* ---------- Wardrobe presets ---------- */

export const WARDROBE_PRESETS: Omit<WardrobeItem, 'id'>[] = [
  { name: 'Kaos Putih Basic', category: 'tops', imageUrl: 'art:tee:plain|#F4F1EA', color: 'Putih', colorHex: '#F4F1EA', style: 'casual', sizeLabel: 'M' },
  { name: 'Kemeja Hitam Rayon', category: 'tops', imageUrl: 'art:shirt:plain|#2B2A28', color: 'Hitam', colorHex: '#2B2A28', style: 'minimalist', sizeLabel: 'M' },
  { name: 'Jeans Biru Lama', category: 'bottoms', imageUrl: 'art:jeans:denim|#46607F', color: 'Biru', colorHex: '#46607F', style: 'casual', sizeLabel: '28' },
  { name: 'Rok Midi Krem', category: 'bottoms', imageUrl: 'art:skirt:plain|#E4D6BC', color: 'Krem', colorHex: '#E4D6BC', style: 'minimalist', sizeLabel: 'M' },
  { name: 'Cardigan Abu', category: 'outerwear', imageUrl: 'art:cardigan:knit|#9C9B96', color: 'Abu', colorHex: '#9C9B96', style: 'casual', sizeLabel: 'L' },
  { name: 'Dress Hitam Simpel', category: 'dresses', imageUrl: 'art:dress:plain|#262523', color: 'Hitam', colorHex: '#262523', style: 'formal', sizeLabel: 'M' },
  { name: 'Sneakers Putih', category: 'shoes', imageUrl: 'art:sneaker:plain|#F2EFE8', color: 'Putih', colorHex: '#F2EFE8', style: 'casual', sizeLabel: '38' },
  { name: 'Tote Kanvas Natural', category: 'bags', imageUrl: 'art:tote:plain|#E2D4B8', color: 'Krem', colorHex: '#E2D4B8', style: 'casual' },
  { name: 'Hijab Voal Mocca', category: 'accessories', imageUrl: 'art:hijab:plain|#B39A7E', color: 'Coklat', colorHex: '#B39A7E', style: 'minimalist' },
];

export const DEFAULT_WARDROBE: WardrobeItem[] = WARDROBE_PRESETS.slice(0, 7).map((w, i) => ({
  ...w,
  id: `w_seed_${i + 1}`,
}));

/* ---------- Community feed ---------- */

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'c1', author: 'Nadia Prameswari', city: 'Bandung',
    caption: 'Ke kampus pakai outer lurik dan kulot hitam. Garis vertikalnya bikin terlihat lebih tinggi, padahal saya 155 cm.',
    occasion: 'Kuliah', productIds: ['p03', 'p04', 'p19'], paletteHex: ['#9B7652', '#2B2A28', '#EDE3CF'], likes: 0, createdAt: daysAgoIso(1), isDemo: true,
  },
  {
    id: 'c2', author: 'Raka Aditya', city: 'Solo',
    caption: 'Jumat batik ke kantor. Kemeja sogan dipadukan chino khaki dan loafer, warna tanah semua supaya kulit sawo matang tetap hangat.',
    occasion: 'Kantor', productIds: ['p08', 'p23', 'p18'], paletteHex: ['#7A4E2D', '#C2A878', '#5B3A26'], likes: 0, createdAt: daysAgoIso(2), isDemo: true,
  },
  {
    id: 'c3', author: 'Salsa Maharani', city: 'Yogya',
    caption: 'Blazer camel dari thrift, cuma 215 ribu. Diukur dulu bahunya 42 cm, pas dengan bahu saya 40 cm plus kelonggaran.',
    occasion: 'Kantor', productIds: ['p12', 'p02', 'p20'], paletteHex: ['#B88B5A', '#E8DCC4', '#B98557'], likes: 0, createdAt: daysAgoIso(1), isDemo: true,
  },
  {
    id: 'c4', author: 'Intan Lestari', city: 'Tasikmalaya',
    caption: 'Kondangan siang: dress batik indigo dengan hijab dusty pink. Kontras sejuk-hangat yang tetap lembut.',
    occasion: 'Kondangan', productIds: ['p09', 'p10', 'p18'], paletteHex: ['#2E3F5C', '#E58B94', '#5B3A26'], likes: 0, createdAt: daysAgoIso(3), isDemo: true,
  },
  {
    id: 'c5', author: 'Dimas Nugroho', city: 'Pekalongan',
    caption: 'Weekend denim on denim, tapi beda tone. Jaket washed blue di atas selvedge gelap supaya tidak terlihat seragam.',
    occasion: 'Weekend', productIds: ['p06', 'p05', 'p19'], paletteHex: ['#6E8BA8', '#2F4A6D', '#EDE3CF'], likes: 0, createdAt: daysAgoIso(4), isDemo: true,
  },
];

export const SEED_COMMENTS: ProductComment[] = [];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Isi ukuran tubuh Anda', body: 'Panduan Ukuran (cm) memakai angka bawaan sampai Anda mengisi LD, LP, dan bahu sendiri.', read: false, createdAt: daysAgoIso(0) },
  { id: 'n2', title: 'Ini versi demo', body: 'Toko, produk, dan harga di katalog adalah data contoh. Semua data Anda tersimpan di browser ini saja.', read: false, createdAt: daysAgoIso(0) },
];

/* ---------- Hero showcase ---------- */

export interface HeroLook {
  id: string;
  title: string;
  maker: string;
  city: string;
  material: string;
  silhouette: string;
  arts: string[];
  tint: string;
  productIds: string[];
}

export const HERO_LOOKS: HeroLook[] = [
  {
    id: 'h1', title: 'Linen Sore Hari', maker: 'Atelier Senja', city: 'Bandung',
    material: 'Linen ramie 100%', silhouette: 'Relaxed, bahu jatuh',
    arts: ['art:shirt:plain|#8EA89D', 'art:culottes:plain|#E8DCC4', 'art:sling:plain|#A3B9AD'],
    tint: '#DDE5DF', productIds: ['p01', 'p21'],
  },
  {
    id: 'h2', title: 'Garis Tenun Kantor', maker: 'Kala Studio', city: 'Solo',
    material: 'Lurik tenun ATBM Pedan', silhouette: 'Kimono lurus, garis vertikal',
    arts: ['art:kimono:stripe|#9B7652', 'art:culottes:plain|#2B2A28', 'art:loafer:plain|#5B3A26'],
    tint: '#EADFD2', productIds: ['p03', 'p04'],
  },
  {
    id: 'h3', title: 'Indigo Akhir Pekan', maker: 'Denim Lab', city: 'Pekalongan',
    material: 'Selvedge 13,5 oz non-stretch', silhouette: 'Straight, pinggang sedang',
    arts: ['art:jacket:denim|#6E8BA8', 'art:jeans:denim|#2F4A6D', 'art:sneaker:plain|#EDE3CF'],
    tint: '#DCE2EA', productIds: ['p06', 'p05'],
  },
];

export const PALETTE_PRESETS: { name: string; colors: string[] }[] = [
  { name: 'Warm Earthy', colors: ['#7A5C46', '#B88B5A', '#E8DCC4', '#9B7652'] },
  { name: 'Sage Forest', colors: ['#162D24', '#8EA89D', '#A3B9AD', '#E8E4D9'] },
  { name: 'Pastel Dream', colors: ['#F3D3D6', '#E58B94', '#DCE2EA', '#F4EFE3'] },
  { name: 'Monochrome', colors: ['#1C1C1B', '#6E6F6B', '#B9B6AD', '#FAF9F5'] },
];

/* ---------- Hero model photos ---------- */

/**
 * Reference photos from Unsplash (free licence), carried over from outfit-ai-umkm.
 * Captions describe what is actually in each photo; the linked product is a
 * similar piece from the catalog, not the garment in the photo.
 */
export interface HeroModel {
  id: string;
  src: string;
  alt: string;
  style: string;
  mood: string;
  tone: string;
  productId: string;
}

const unsplash = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=1100&q=80`;

export const HERO_MODELS: HeroModel[] = [
  {
    id: 'm1',
    src: unsplash('1515886657613-9f3515b0c78f'),
    alt: 'Model memakai hoodie crop kuning, jogger kuning, dan sepatu bot putih di lapangan tepi pantai',
    style: 'Hoodie crop & jogger kuning',
    mood: 'Athleisure',
    tone: 'Cocok untuk warm tone',
    productId: 'p19',
  },
  {
    id: 'm2',
    src: unsplash('1496747611176-843222e1e57c'),
    alt: 'Model memakai dress putih bermotif bunga merah di tepi laut',
    style: 'Dress motif bunga',
    mood: 'Romantis siang',
    tone: 'Cocok untuk neutral tone',
    productId: 'p09',
  },
  {
    id: 'm3',
    src: unsplash('1509631179647-0177331693ae'),
    alt: 'Model memakai atasan putih dan celana lebar bergaris hitam putih dengan latar hijau toska',
    style: 'Celana lebar bergaris',
    mood: 'Monokrom berani',
    tone: 'Cocok untuk cool tone',
    productId: 'p04',
  },
  {
    id: 'm4',
    src: unsplash('1529139574466-a303027c1d8b'),
    alt: 'Model berkacamata memakai kaus merah dan jaket hitam oversize dengan latar biru toska',
    style: 'Kaus merah & jaket oversize',
    mood: 'Streetwear',
    tone: 'Cocok untuk warm tone',
    productId: 'p06',
  },
];
