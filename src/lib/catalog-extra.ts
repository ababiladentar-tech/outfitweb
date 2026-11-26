import type { GarmentMeasurement, ProductCategory, ProductCondition, StoreProfile } from './types';

/**
 * Extended demo catalog: 12 more stores and 96 more products so search,
 * filters, the stylist agent, and budget splits have realistic variety.
 * Each product has a photo; its flat-lay illustration (art) is the fallback.
 */

export interface ExtraSeed {
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
  sizes: GarmentMeasurement[];
  art: string;
  photo?: string;
  material: string;
  stretch?: boolean;
  likes: number;
  saves: number;
  tags: string[];
  daysAgo: number;
}

/* ---------- Size helpers (flat-lay cm) ---------- */

const tops = (chest: number, shoulder: number, length: number): GarmentMeasurement[] => [
  { sizeLabel: 'S', chestBustCm: chest, shoulderWidthCm: shoulder, garmentLengthCm: length },
  { sizeLabel: 'M', chestBustCm: chest + 4, shoulderWidthCm: shoulder + 1, garmentLengthCm: length + 1 },
  { sizeLabel: 'L', chestBustCm: chest + 8, shoulderWidthCm: shoulder + 2, garmentLengthCm: length + 2 },
  { sizeLabel: 'XL', chestBustCm: chest + 12, shoulderWidthCm: shoulder + 3, garmentLengthCm: length + 3 },
];

const dress = (chest: number, waist: number, shoulder: number, length: number): GarmentMeasurement[] => [
  { sizeLabel: 'S', chestBustCm: chest, waistCm: waist, shoulderWidthCm: shoulder, garmentLengthCm: length },
  { sizeLabel: 'M', chestBustCm: chest + 4, waistCm: waist + 4, shoulderWidthCm: shoulder + 1, garmentLengthCm: length + 1 },
  { sizeLabel: 'L', chestBustCm: chest + 8, waistCm: waist + 8, shoulderWidthCm: shoulder + 2, garmentLengthCm: length + 2 },
];

const bottoms = (waist: number, hips: number, length: number): GarmentMeasurement[] => [
  { sizeLabel: '27', waistCm: waist, hipsCm: hips, garmentLengthCm: length },
  { sizeLabel: '28', waistCm: waist + 2.5, hipsCm: hips + 2.5, garmentLengthCm: length },
  { sizeLabel: '30', waistCm: waist + 5, hipsCm: hips + 5, garmentLengthCm: length + 1 },
  { sizeLabel: '32', waistCm: waist + 10, hipsCm: hips + 10, garmentLengthCm: length + 2 },
  { sizeLabel: '34', waistCm: waist + 15, hipsCm: hips + 14, garmentLengthCm: length + 2 },
];

const elastic = (waist: number, hips: number, length: number): GarmentMeasurement[] => [
  { sizeLabel: 'S', waistCm: waist, hipsCm: hips, garmentLengthCm: length },
  { sizeLabel: 'M', waistCm: waist + 4, hipsCm: hips + 4, garmentLengthCm: length + 1 },
  { sizeLabel: 'L', waistCm: waist + 8, hipsCm: hips + 8, garmentLengthCm: length + 2 },
  { sizeLabel: 'XL', waistCm: waist + 12, hipsCm: hips + 12, garmentLengthCm: length + 2 },
];

const shoes = (from: number, insole: number, count = 6): GarmentMeasurement[] =>
  Array.from({ length: count }, (_, i) => ({ sizeLabel: String(from + i), insoleCm: Math.round((insole + i * 0.67) * 10) / 10 }));

const bag = (label: string, l: number, w: number, h: number): GarmentMeasurement[] => [{ sizeLabel: label, bagLengthCm: l, bagWidthCm: w, bagHeightCm: h }];
const scarf = (label: string, length: number): GarmentMeasurement[] => [{ sizeLabel: label, garmentLengthCm: length }];
const one = (label: string, m: Omit<GarmentMeasurement, 'sizeLabel'>): GarmentMeasurement[] => [{ sizeLabel: `${label} (flat-lay)`, ...m }];

/** Stable pseudo-random numbers per id, so counts look organic but never change between builds. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

type Row = [
  id: string,
  store: string,
  title: string,
  description: string,
  category: ProductCategory,
  style: string,
  colorFamily: string,
  colorHex: string[],
  price: number,
  stock: number,
  sizes: GarmentMeasurement[],
  art: string,
  material: string,
  tags: string[],
  extra?: { originalPrice?: number; condition?: ProductCondition; stretch?: boolean },
];

/* ---------- Stores ---------- */

export const EXTRA_STORES: StoreProfile[] = [
  {
    id: 's_kawung', name: 'Kawung Lasem', city: 'Lasem', followerCount: 8420, contactNumber: '6285290011223',
    bio: 'Batik tulis Lasem tiga negeri, dipotong jadi kemeja dan outer harian.',
    story: 'Kami bekerja dengan empat rumah batik tua di Karangturi. Lewat Outfitly, pembeli bisa melihat ukuran cm setiap potong sebelum memesan, jadi kain tulis yang mahal tidak salah ukuran.',
    externalShopUrl: 'https://www.tokopedia.com/', instagram: '@kawunglasem', sellerType: 'umkm', bannerHex: '#9C3D2E', avatarHex: '#5E2219',
  },
  {
    id: 's_samak', name: 'Samak Garut', city: 'Garut', followerCount: 11230, contactNumber: '6282214455667',
    bio: 'Jaket dan sepatu kulit domba dari Sukaregang.',
    story: 'Bengkel kami ada di sentra penyamakan Sukaregang sejak 1998. Kami mencantumkan lebar bahu dan panjang insole di setiap produk karena kulit tidak bisa dikecilkan setelah dijahit.',
    externalShopUrl: 'https://shopee.co.id/', instagram: '@samakgarut', sellerType: 'umkm', bannerHex: '#5A3B28', avatarHex: '#2E1D13',
  },
  {
    id: 's_endek', name: 'Tenun Pagi', city: 'Denpasar', followerCount: 6780, contactNumber: '6281338877001',
    bio: 'Endek Bali ATBM untuk atasan, rok, dan outer resort.',
    story: 'Penenun kami di Klungkung bekerja pagi hari sebelum panas. Nama toko kami dari situ. Outfitly membantu kami menjual ke luar Bali tanpa harus menebak ukuran pembeli.',
    externalShopUrl: 'https://www.tokopedia.com/', instagram: '@tenunpagi.bali', sellerType: 'umkm', bannerHex: '#2F6F73', avatarHex: '#18413F',
  },
  {
    id: 's_sengkang', name: 'Sutra Sengkang', city: 'Makassar', followerCount: 5310, contactNumber: '6281245566778',
    bio: 'Sutra Wajo tenun tangan: blouse, outer, dan selendang.',
    story: 'Ibu kami menenun sutra di Sengkang. Kami membawanya ke potongan modern supaya bisa dipakai ke kantor dan kondangan di kota mana pun.',
    externalShopUrl: 'https://shopee.co.id/', instagram: '@sutrasengkang', sellerType: 'umkm', bannerHex: '#B4495A', avatarHex: '#6E2333',
  },
  {
    id: 's_kotatua', name: 'Kota Tua Thrift', city: 'Jakarta', followerCount: 18900, contactNumber: '6281288990011',
    bio: 'Preloved streetwear dan workwear, sudah dicuci dan diukur ulang.',
    story: 'Kami mulai dari lapak di Pasar Senen. Sekarang setiap barang difoto apa adanya dan diukur flat-lay. Satu barang, satu pembeli.',
    externalShopUrl: 'https://shopee.co.id/', instagram: '@kotatuathrift', sellerType: 'community_preloved', bannerHex: '#4A4A46', avatarHex: '#1F1F1D',
  },
  {
    id: 's_arek', name: 'Arek Workwear', city: 'Surabaya', followerCount: 9650, contactNumber: '6281330044556',
    bio: 'Kemeja kerja, chino, dan celana bahan pria yang tahan seharian.',
    story: 'Kami membuat pakaian kerja untuk anak muda Surabaya yang harus rapi dari pagi sampai malam. Ukuran kami diuji pada 40 orang sebelum diproduksi.',
    externalShopUrl: 'https://www.tokopedia.com/', instagram: '@arekworkwear', sellerType: 'umkm', bannerHex: '#3E4B5C', avatarHex: '#1E2733',
  },
  {
    id: 's_apel', name: 'Apel Knitwear', city: 'Malang', followerCount: 7340, contactNumber: '6285655667788',
    bio: 'Rajutan katun dan akrilik untuk udara sejuk Malang.',
    story: 'Mesin rajut kami ada di Batu. Kami menulis berapa cm rajutan akan melar setelah dipakai, karena itu pertanyaan yang paling sering datang.',
    externalShopUrl: 'https://shopee.co.id/', instagram: '@apelknit', sellerType: 'umkm', bannerHex: '#C8A98A', avatarHex: '#7A4F35',
  },
  {
    id: 's_voal', name: 'Rumah Voal', city: 'Bandung', followerCount: 21400, contactNumber: '6281322113344',
    bio: 'Hijab voal, pashmina, dan gamis harian.',
    story: 'Kami menjahit sendiri setiap hijab di Cigondewah. Ukuran dan jenis bahan selalu kami tulis, supaya tidak ada lagi hijab yang ternyata menerawang.',
    externalShopUrl: 'https://shopee.co.id/', instagram: '@rumahvoal', sellerType: 'umkm', bannerHex: '#D8C3B4', avatarHex: '#8E6A5A',
  },
  {
    id: 's_senen', name: 'Arsip Senen', city: 'Jakarta', followerCount: 6120, contactNumber: '6287788112233',
    bio: 'Preloved formal: blazer, celana bahan, dan dress kantor.',
    story: 'Banyak blazer bagus berakhir di gudang. Kami memilih yang jahitannya masih kuat, membersihkannya, lalu mencantumkan ukuran bahu dan dada yang sebenarnya.',
    externalShopUrl: 'https://www.tokopedia.com/', instagram: '@arsipsenen', sellerType: 'community_preloved', bannerHex: '#6C6255', avatarHex: '#2F2A24',
  },
  {
    id: 's_lemari', name: 'Lemari Bersama', city: 'Surabaya', followerCount: 4870, contactNumber: '6281234009988',
    bio: 'Collab Mitra: kurasi preloved musiman bersama stylist Outfitly.',
    story: 'Setiap bulan kami memilih 30 potong preloved yang mudah dipadukan dengan brand UMKM di Outfitly, lalu menyusunnya per tema.',
    externalShopUrl: 'https://shopee.co.id/', instagram: '@lemaribersama.sby', sellerType: 'collab_mitra', bannerHex: '#9DB3A6', avatarHex: '#2C4A3E',
  },
  {
    id: 's_kanvas', name: 'Jejak Kanvas', city: 'Bandung', followerCount: 13750, contactNumber: '6281221998877',
    bio: 'Sneaker kanvas vulkanisir buatan Cibaduyut.',
    story: 'Kami melanjutkan bengkel sepatu kakek di Cibaduyut, tapi dengan sol vulkanisir dan kanvas tebal. Panjang insole tertulis di setiap ukuran.',
    externalShopUrl: 'https://www.tokopedia.com/', instagram: '@jejakkanvas', sellerType: 'umkm', bannerHex: '#B9B4A6', avatarHex: '#3B3A35',
  },
  {
    id: 's_anyam', name: 'Anyam Nusa', city: 'Tasikmalaya', followerCount: 5980, contactNumber: '6285223344551',
    bio: 'Tas anyaman pandan, mendong, dan rotan dari Rajapolah.',
    story: 'Pengrajin anyaman di Rajapolah sudah menganyam turun-temurun. Kami membantu mendesain bentuk tas yang masuk akal untuk kampus dan kantor.',
    externalShopUrl: 'https://shopee.co.id/', instagram: '@anyamnusa', sellerType: 'umkm', bannerHex: '#C9A86B', avatarHex: '#6B5326',
  },
];

/* ---------- Products ---------- */

const ROWS: Row[] = [
  // Kawung Lasem
  ['p25', 's_kawung', 'Kemeja Batik Tulis Tiga Negeri', 'Batik tulis Lasem merah-biru-soga di katun primissima, potongan regular lengan pendek.', 'top', 'etnik_modern', 'Merah', ['#9C3D2E', '#2E3F5C'], 485000, 9, tops(102, 45, 72), 'shirt:batik', 'Katun primissima', ['kantor', 'kondangan', 'pria', 'batik']],
  ['p26', 's_kawung', 'Blouse Batik Lasem Latohan', 'Blouse batik motif latohan dengan kerah V dan lengan balon pendek.', 'top', 'etnik_modern', 'Merah', ['#A84A38', '#EADBC2'], 365000, 14, tops(90, 37, 62), 'blouse:plain', 'Katun prima', ['kantor', 'kuliah', 'batik']],
  ['p27', 's_kawung', 'Outer Batik Kawung Indigo', 'Outer longgar dengan motif kawung indigo pewarna alam, tanpa kancing.', 'outerwear', 'etnik_modern', 'Biru', ['#2E3F5C', '#C9B48F'], 425000, 7, tops(108, 46, 84), 'kimono:batik', 'Katun, pewarna indigo alam', ['kantor', 'kondangan', 'batik']],
  ['p28', 's_kawung', 'Dress Batik Lasem A-Line', 'Dress A-line selutut, pinggang berkaret di belakang supaya fleksibel.', 'dress', 'etnik_modern', 'Merah', ['#8E3A2C', '#E3CFAE'], 549000, 6, dress(88, 72, 37, 104), 'dress:batik', 'Katun primissima', ['kondangan', 'kantor', 'batik']],
  ['p29', 's_kawung', 'Rok Lilit Batik Sekar Jagad', 'Rok lilit dengan tali samping, motif sekar jagad warna soga.', 'pants', 'etnik_modern', 'Coklat', ['#7A4E2D', '#E2CFA9'], 319000, 11, elastic(64, 98, 92), 'skirt:plain', 'Katun', ['kondangan', 'kantor', 'batik']],
  ['p30', 's_kawung', 'Kemeja Batik Pria Lengan Panjang Soga', 'Kemeja lengan panjang furing katun, cocok untuk acara resmi.', 'top', 'formal', 'Coklat', ['#6B4226', '#D8C09A'], 529000, 8, tops(104, 46, 74), 'shirt:batik', 'Katun primissima, furing katun', ['kondangan', 'kantor', 'pria', 'batik']],
  ['p31', 's_kawung', 'Selendang Batik Tulis Lasem', 'Selendang batik tulis ringan untuk pelengkap kebaya atau outer.', 'hijab', 'etnik_modern', 'Merah', ['#A33B2E', '#F0E2C8'], 245000, 15, scarf('200 x 50', 200), 'hijab:plain', 'Katun paris', ['kondangan', 'batik']],
  ['p32', 's_kawung', 'Kemeja Batik Cap Pesisir Biru', 'Batik cap motif pesisir dengan harga lebih ramah untuk kuliah.', 'top', 'casual', 'Biru', ['#3A5A7C', '#EDE3CF'], 229000, 22, tops(100, 44, 70), 'shirt:batik', 'Katun', ['kuliah', 'kasual', 'pria', 'batik']],

  // Samak Garut
  ['p33', 's_samak', 'Jaket Kulit Domba Rider Hitam', 'Jaket rider kulit domba asli dengan ritsleting YKK dan furing satin.', 'outerwear', 'streetwear', 'Hitam', ['#1F1E1C', '#4A4744'], 1350000, 5, tops(100, 44, 62), 'jacket:plain', 'Kulit domba, furing satin', ['weekend', 'pria', 'kulit'], { originalPrice: 1550000 }],
  ['p34', 's_samak', 'Jaket Kulit Bomber Coklat', 'Bomber kulit domba coklat tua dengan rib rajut di leher dan ujung lengan.', 'outerwear', 'casual', 'Coklat', ['#5A3B28', '#2E1D13'], 1250000, 4, tops(104, 46, 64), 'jacket:plain', 'Kulit domba', ['weekend', 'kasual', 'pria', 'kulit']],
  ['p35', 's_samak', 'Blazer Kulit Suede Camel', 'Blazer suede ringan untuk acara malam, bahu sedikit berstruktur.', 'outerwear', 'old_money', 'Coklat', ['#B07D4F', '#7A5435'], 1150000, 3, tops(94, 39, 66), 'blazer:plain', 'Suede kambing', ['kantor', 'weekend', 'kulit']],
  ['p36', 's_samak', 'Chelsea Boots Kulit Coklat', 'Chelsea boots dengan karet samping elastis dan sol karet jahit.', 'shoes', 'old_money', 'Coklat', ['#5A3B28', '#2E1D13'], 899000, 9, shoes(39, 25.0), 'loafer:plain', 'Kulit sapi crazy horse', ['kantor', 'weekend', 'pria', 'kulit']],
  ['p37', 's_samak', 'Loafer Kulit Hitam Penny', 'Penny loafer hitam untuk kantor, sol karet anti licin.', 'shoes', 'formal', 'Hitam', ['#1D1C1A', '#3A3835'], 699000, 12, shoes(38, 24.3), 'loafer:plain', 'Kulit sapi', ['kantor', 'kondangan', 'kulit']],
  ['p38', 's_samak', 'Sling Bag Kulit Domba Mini', 'Sling bag kulit domba lembut, muat ponsel besar dan dompet.', 'bag', 'casual', 'Coklat', ['#8B5A3C', '#5A3B28'], 299000, 18, bag('Mini', 20, 6, 14), 'sling:plain', 'Kulit domba', ['kuliah', 'weekend', 'kulit']],
  ['p39', 's_samak', 'Tas Kerja Kulit Briefcase', 'Briefcase kulit sapi muat laptop 15 inci, dua sekat dalam.', 'bag', 'formal', 'Coklat', ['#4E3322', '#2E1D13'], 1090000, 4, bag('Besar', 40, 9, 29), 'tote:plain', 'Kulit sapi', ['kantor', 'pria', 'kulit']],
  ['p40', 's_samak', 'Sandal Kulit Slide Garut', 'Sandal slide kulit dengan footbed empuk, untuk akhir pekan.', 'shoes', 'casual', 'Coklat', ['#9A6A45', '#5A3B28'], 189000, 30, shoes(37, 23.6, 7), 'loafer:plain', 'Kulit sapi, sol EVA', ['weekend', 'kasual', 'kulit']],

  // Tenun Pagi (Denpasar)
  ['p41', 's_endek', 'Atasan Endek Kerah Kotak', 'Atasan boxy endek Bali dengan kerah kotak, ringan untuk cuaca panas.', 'top', 'etnik_modern', 'Hijau', ['#2F6F73', '#E7D7B6'], 345000, 10, tops(96, 40, 60), 'blouse:stripe', 'Tenun endek ATBM', ['kuliah', 'weekend', 'tenun']],
  ['p42', 's_endek', 'Kemeja Endek Pria Rangrang', 'Kemeja pria dari endek rangrang, motif geometris khas Nusa Penida.', 'top', 'etnik_modern', 'Biru', ['#26406A', '#D9C28E'], 465000, 7, tops(104, 46, 72), 'shirt:stripe', 'Tenun endek ATBM', ['kantor', 'kondangan', 'pria', 'tenun']],
  ['p43', 's_endek', 'Rok Midi Endek Lurus', 'Rok midi lurus dengan belahan belakang, pinggang ritsleting samping.', 'pants', 'etnik_modern', 'Hijau', ['#2F6F73', '#B9A57E'], 389000, 8, bottoms(64, 94, 78), 'skirt:plain', 'Tenun endek ATBM', ['kantor', 'kondangan', 'tenun']],
  ['p44', 's_endek', 'Outer Resort Endek Pendek', 'Outer pendek tanpa kancing untuk dipakai di atas tank top atau kaos.', 'outerwear', 'casual', 'Krem', ['#E7D7B6', '#2F6F73'], 329000, 12, tops(100, 42, 58), 'kimono:stripe', 'Tenun endek ATBM', ['weekend', 'kasual', 'tenun']],
  ['p45', 's_endek', 'Dress Endek Lengan Kerut', 'Dress midi endek dengan lengan kerut dan tali pinggang kain.', 'dress', 'etnik_modern', 'Biru', ['#26406A', '#E7D7B6'], 589000, 5, dress(90, 74, 37, 112), 'dress:batik', 'Tenun endek ATBM', ['kondangan', 'tenun']],
  ['p46', 's_endek', 'Kulot Linen Pantai Sage', 'Kulot linen bertali, cocok dipadukan dengan atasan endek.', 'pants', 'casual', 'Hijau', ['#9DB3A6', '#6F8A7E'], 239000, 20, elastic(66, 104, 90), 'culottes:plain', 'Linen campuran', ['weekend', 'kasual', 'kuliah']],
  ['p47', 's_endek', 'Tote Endek Kanvas', 'Tote kanvas dengan panel endek di depan dan saku ritsleting dalam.', 'bag', 'casual', 'Hijau', ['#2F6F73', '#E7D7B6'], 179000, 25, bag('Sedang', 38, 10, 34), 'tote:plain', 'Kanvas, endek', ['kuliah', 'weekend', 'tenun']],
  ['p48', 's_endek', 'Kemeja Endek Pria Lengan Pendek Merah', 'Endek merah marun untuk acara siang yang santai.', 'top', 'casual', 'Merah', ['#7A2E35', '#D9C28E'], 399000, 0, tops(102, 45, 70), 'shirt:stripe', 'Tenun endek ATBM', ['weekend', 'kondangan', 'pria', 'tenun']],

  // Sutra Sengkang (Makassar)
  ['p49', 's_sengkang', 'Blouse Sutra Wajo Dusty Pink', 'Blouse sutra jatuh dengan kancing tertutup, mengilap lembut.', 'top', 'formal', 'Pink', ['#D8A3A6', '#B4495A'], 689000, 6, tops(90, 37, 62), 'blouse:satin', 'Sutra Wajo 100%', ['kondangan', 'kantor', 'sutra']],
  ['p50', 's_sengkang', 'Outer Sutra Lipa Sabbe', 'Outer panjang dari kain lipa sabbe kotak-kotak khas Bugis.', 'outerwear', 'etnik_modern', 'Merah', ['#B4495A', '#3C2A4D'], 759000, 4, tops(104, 44, 96), 'kimono:stripe', 'Sutra Wajo', ['kondangan', 'sutra']],
  ['p51', 's_sengkang', 'Selendang Sutra Ungu Terong', 'Selendang sutra ringan untuk pelengkap kebaya.', 'hijab', 'formal', 'Ungu', ['#5B3A6B', '#C9A9D1'], 389000, 10, scarf('180 x 45', 180), 'hijab:plain', 'Sutra Wajo', ['kondangan', 'sutra']],
  ['p52', 's_sengkang', 'Slip Dress Sutra Hijau Zamrud', 'Slip dress bias cut dengan tali bisa diatur, panjang midi.', 'dress', 'formal', 'Hijau', ['#1F5E4C', '#2F7A63'], 899000, 3, dress(84, 70, 32, 118), 'slipdress:satin', 'Sutra Wajo', ['kondangan', 'sutra']],
  ['p53', 's_sengkang', 'Rok Plisket Sutra Emas', 'Rok plisket sutra emas pucat, pinggang karet tersembunyi.', 'pants', 'formal', 'Emas', ['#C9A65B', '#E8D9A8'], 549000, 7, elastic(62, 100, 84), 'skirt:pleat', 'Sutra campuran', ['kondangan', 'sutra']],
  ['p54', 's_sengkang', 'Kemeja Sutra Pria Abu', 'Kemeja sutra pria abu-abu untuk acara malam.', 'top', 'formal', 'Abu', ['#7D7F80', '#4E5052'], 789000, 4, tops(104, 46, 74), 'shirt:satin', 'Sutra Wajo', ['kondangan', 'pria', 'sutra']],
  ['p55', 's_sengkang', 'Clutch Sutra Tenun', 'Clutch kecil berlapis tenun sutra, tali rantai bisa dilepas.', 'bag', 'formal', 'Merah', ['#B4495A', '#C9A65B'], 259000, 14, bag('Clutch', 24, 4, 13), 'sling:plain', 'Sutra, kulit sintetis', ['kondangan', 'sutra']],
  ['p56', 's_sengkang', 'Atasan Sutra Tanpa Lengan Krem', 'Atasan sutra tanpa lengan untuk dilapis blazer di kantor.', 'top', 'minimalist', 'Krem', ['#E8DCC4', '#CDBE9F'], 459000, 9, tops(88, 34, 58), 'blouse:satin', 'Sutra Wajo', ['kantor', 'sutra']],

  // Kota Tua Thrift (preloved)
  ['p57', 's_kotatua', 'Jaket Varsity Wol Navy', 'Jaket varsity lengan kulit sintetis, kancing jepret lengkap. Ada sedikit pudar di kerah.', 'outerwear', 'streetwear', 'Biru', ['#1F2D4A', '#E6E1D4'], 285000, 1, one('L', { chestBustCm: 116, shoulderWidthCm: 50, garmentLengthCm: 68 }), 'jacket:plain', 'Wol campuran', ['weekend', 'kuliah', 'pria', 'thrift'], { originalPrice: 1200000, condition: 'very_good' }],
  ['p58', 's_kotatua', 'Kemeja Flanel Kotak Merah', 'Flanel tebal kotak merah-hitam, cocok dilapis kaos.', 'top', 'streetwear', 'Merah', ['#8A2F2F', '#1F1E1C'], 95000, 1, one('M', { chestBustCm: 108, shoulderWidthCm: 47, garmentLengthCm: 74 }), 'shirt:stripe', 'Katun flanel', ['kuliah', 'weekend', 'pria', 'thrift'], { originalPrice: 450000, condition: 'very_good' }],
  ['p59', 's_kotatua', 'Celana Kargo Olive', 'Celana kargo enam saku, pinggang ada tali serut.', 'pants', 'streetwear', 'Hijau', ['#5B6343', '#3F452E'], 145000, 1, one('30', { waistCm: 80, hipsCm: 104, garmentLengthCm: 100 }), 'trousers:twill', 'Katun ripstop', ['weekend', 'kuliah', 'pria', 'thrift'], { originalPrice: 600000, condition: 'very_good' }],
  ['p60', 's_kotatua', 'Hoodie Abu Heavyweight', 'Hoodie katun fleece tebal, sablon kecil di dada sudah sedikit retak.', 'outerwear', 'streetwear', 'Abu', ['#8C8B87', '#5E5D5A'], 165000, 1, one('XL', { chestBustCm: 124, shoulderWidthCm: 54, garmentLengthCm: 72 }), 'cardigan:knit', 'Katun fleece', ['kuliah', 'weekend', 'thrift'], { originalPrice: 700000, condition: 'good' }],
  ['p61', 's_kotatua', 'Jeans Straight Washed Hitam', 'Jeans straight hitam washed, ada sobekan kecil sudah ditambal rapi.', 'jeans', 'streetwear', 'Hitam', ['#2B2A28', '#4A4744'], 135000, 1, one('31', { waistCm: 80, hipsCm: 100, garmentLengthCm: 102 }), 'jeans:denim', 'Denim 12 oz', ['weekend', 'kuliah', 'pria', 'thrift'], { originalPrice: 799000, condition: 'good' }],
  ['p62', 's_kotatua', 'Kaos Band Vintage Pudar', 'Kaos katun tipis vintage dengan grafis pudar, single stitch.', 'top', 'streetwear', 'Hitam', ['#2B2A28', '#9C9B96'], 120000, 1, one('L', { chestBustCm: 110, shoulderWidthCm: 50, garmentLengthCm: 72 }), 'tee:plain', 'Katun', ['weekend', 'kasual', 'thrift'], { originalPrice: 300000, condition: 'good' }],
  ['p63', 's_kotatua', 'Sneaker Kanvas High Putih', 'Sneaker kanvas high-top, sol masih tebal, sudah dicuci.', 'shoes', 'streetwear', 'Putih', ['#F2EFE8', '#2B2A28'], 155000, 1, [{ sizeLabel: '41', insoleCm: 26.2 }], 'sneaker:plain', 'Kanvas, karet', ['kuliah', 'weekend', 'thrift'], { originalPrice: 899000, condition: 'very_good' }],
  ['p64', 's_kotatua', 'Jaket Coach Nilon Hijau', 'Jaket coach nilon tahan angin, kancing jepret.', 'outerwear', 'streetwear', 'Hijau', ['#2E4D3A', '#1F3328'], 175000, 1, one('M', { chestBustCm: 112, shoulderWidthCm: 48, garmentLengthCm: 70 }), 'jacket:plain', 'Nilon', ['kuliah', 'weekend', 'thrift'], { originalPrice: 650000, condition: 'like_new' }],

  // Arek Workwear (Surabaya)
  ['p65', 's_arek', 'Kemeja Oxford Biru Muda Slim', 'Kemeja oxford slim fit, kerah button-down, tidak mudah kusut.', 'top', 'formal', 'Biru', ['#A9C1DB', '#7D97B4'], 259000, 30, tops(98, 43, 73), 'shirt:plain', 'Katun oxford', ['kantor', 'pria']],
  ['p66', 's_arek', 'Kemeja Putih Non-Iron', 'Kemeja putih katun campuran yang tetap rapi tanpa disetrika.', 'top', 'formal', 'Putih', ['#F4F2EC', '#C9C6BD'], 279000, 35, tops(100, 44, 74), 'shirt:plain', 'Katun 70%, poliester 30%', ['kantor', 'kondangan', 'pria']],
  ['p67', 's_arek', 'Celana Chino Slim Navy', 'Chino slim dengan 2% spandex, nyaman untuk naik motor.', 'pants', 'casual', 'Biru', ['#2A3552', '#1C243A'], 249000, 28, bottoms(72, 94, 100), 'trousers:twill', 'Katun twill 98%, spandex 2%', ['kantor', 'kuliah', 'pria'], { stretch: true }],
  ['p68', 's_arek', 'Celana Bahan Abu Tapered', 'Celana bahan formal tapered dengan lipit depan tunggal.', 'pants', 'formal', 'Abu', ['#6B6E72', '#4A4D51'], 299000, 22, bottoms(73, 98, 101), 'trousers:plain', 'Wol sintetis', ['kantor', 'kondangan', 'pria']],
  ['p69', 's_arek', 'Polo Piqué Hijau Botol', 'Polo katun piqué dengan kerah rib, potongan regular.', 'top', 'casual', 'Hijau', ['#24483A', '#173027'], 179000, 40, tops(100, 44, 70), 'tee:plain', 'Katun piqué', ['kantor', 'kuliah', 'weekend', 'pria']],
  ['p70', 's_arek', 'Blazer Unstructured Charcoal', 'Blazer tanpa bantalan bahu, bisa dipakai dengan kaos atau kemeja.', 'outerwear', 'minimalist', 'Abu', ['#3E4246', '#26292C'], 649000, 10, tops(102, 45, 74), 'blazer:plain', 'Poliviskos', ['kantor', 'kondangan', 'pria'], { originalPrice: 749000 }],
  ['p71', 's_arek', 'Chino Pendek Khaki', 'Celana pendek chino 7 inci untuk akhir pekan.', 'pants', 'casual', 'Krem', ['#C2A878', '#A48C5E'], 169000, 25, bottoms(72, 96, 46), 'trousers:twill', 'Katun twill', ['weekend', 'kasual', 'pria']],
  ['p72', 's_arek', 'Kemeja Linen Pria Hitam', 'Kemeja linen hitam lengan panjang, bisa digulung.', 'top', 'minimalist', 'Hitam', ['#262523', '#3E3C39'], 319000, 0, tops(104, 46, 74), 'shirt:plain', 'Linen 100%', ['kantor', 'weekend', 'pria', 'linen']],

  // Apel Knitwear (Malang)
  ['p73', 's_apel', 'Cardigan Rajut Krem Kancing Kayu', 'Cardigan rajut katun krem dengan kancing kayu. Melar sekitar 2 cm setelah dipakai.', 'outerwear', 'casual', 'Krem', ['#E4D6BC', '#C9B48F'], 229000, 20, tops(100, 42, 60), 'cardigan:knit', 'Katun rajut', ['kuliah', 'kantor', 'rajut']],
  ['p74', 's_apel', 'Sweater Crewneck Hijau Lumut', 'Sweater rajut crewneck untuk udara sejuk, tidak gatal.', 'top', 'casual', 'Hijau', ['#5E6B45', '#3F4A2E'], 249000, 16, tops(104, 46, 64), 'cardigan:knit', 'Akrilik campuran', ['kuliah', 'weekend', 'rajut']],
  ['p75', 's_apel', 'Vest Rajut Argyle Coklat', 'Vest rajut motif argyle, enak dilapis di atas kemeja.', 'top', 'old_money', 'Coklat', ['#7A4F35', '#C8A98A'], 199000, 18, tops(96, 38, 60), 'cardigan:knit', 'Akrilik', ['kuliah', 'kantor', 'rajut']],
  ['p76', 's_apel', 'Cardigan Crop Rajut Pink', 'Cardigan crop dengan rajutan halus dan kancing mutiara.', 'outerwear', 'casual', 'Pink', ['#E7B8B5', '#C98E8A'], 189000, 22, tops(88, 36, 46), 'cardigan:knit', 'Katun rajut', ['kuliah', 'weekend', 'rajut']],
  ['p77', 's_apel', 'Rok Rajut Midi Abu', 'Rok rajut ribbed panjang midi, pinggang karet lebar.', 'pants', 'minimalist', 'Abu', ['#8C8B87', '#6B6A66'], 219000, 14, elastic(62, 92, 80), 'skirt:pleat', 'Viskos rajut', ['kantor', 'kuliah', 'rajut'], { stretch: true }],
  ['p78', 's_apel', 'Sweater Turtleneck Hitam', 'Turtleneck rajut halus untuk dilapis blazer atau mantel.', 'top', 'minimalist', 'Hitam', ['#262523', '#3E3C39'], 239000, 12, tops(92, 38, 62), 'cardigan:knit', 'Viskos rajut', ['kantor', 'kuliah', 'rajut'], { stretch: true }],
  ['p79', 's_apel', 'Knit Polo Pria Navy', 'Polo rajut lengan pendek dengan kerah klasik.', 'top', 'old_money', 'Biru', ['#1F2D4A', '#34466B'], 259000, 15, tops(102, 45, 68), 'cardigan:knit', 'Katun rajut', ['kantor', 'weekend', 'pria', 'rajut']],
  ['p80', 's_apel', 'Syal Rajut Panjang Mustard', 'Syal rajut panjang warna mustard untuk ke Batu atau Bromo.', 'hijab', 'casual', 'Kuning', ['#C99A3A', '#A47A26'], 99000, 30, scarf('170 x 30', 170), 'hijab:plain', 'Akrilik', ['weekend', 'rajut']],

  // Rumah Voal (Bandung)
  ['p81', 's_voal', 'Hijab Voal Segi Empat Sage', 'Voal premium tidak menerawang, tepi dijahit tangan.', 'hijab', 'minimalist', 'Hijau', ['#8EA89D', '#6F8A7E'], 89000, 60, scarf('115 x 115', 115), 'hijab:plain', 'Voal premium', ['kuliah', 'kantor']],
  ['p82', 's_voal', 'Pashmina Ceruty Mocca', 'Pashmina ceruty babydoll yang jatuh dan mudah dibentuk.', 'hijab', 'minimalist', 'Coklat', ['#B39A7E', '#8E7660'], 79000, 80, scarf('180 x 75', 180), 'hijab:plain', 'Ceruty babydoll', ['kuliah', 'kantor', 'kondangan']],
  ['p83', 's_voal', 'Hijab Bordir Tepi Putih Gading', 'Hijab voal dengan bordir kecil di tepi, untuk acara resmi.', 'hijab', 'formal', 'Putih', ['#F0E8D8', '#D8C8A8'], 129000, 35, scarf('115 x 115', 115), 'hijab:embroidery', 'Voal, benang bordir', ['kondangan']],
  ['p84', 's_voal', 'Gamis Katun Rayon Navy', 'Gamis harian dengan kancing depan busui dan saku samping.', 'dress', 'minimalist', 'Biru', ['#26355A', '#3A4C78'], 329000, 18, dress(96, 90, 38, 138), 'dress:batik', 'Katun rayon', ['kuliah', 'kantor', 'weekend']],
  ['p85', 's_voal', 'Tunik Linen Dusty Pink', 'Tunik panjang dengan belahan samping, cocok dipadukan kulot.', 'top', 'minimalist', 'Pink', ['#D8A3A6', '#B98386'], 239000, 24, tops(100, 40, 98), 'tunic:plain', 'Linen campuran', ['kuliah', 'kantor']],
  ['p86', 's_voal', 'Inner Ciput Rajut Hitam', 'Inner rajut nyaman dipakai seharian, tidak panas.', 'hijab', 'minimalist', 'Hitam', ['#262523', '#3E3C39'], 35000, 120, scarf('All size', 40), 'hijab:plain', 'Rajut spandex', ['kuliah', 'kantor']],
  ['p87', 's_voal', 'Set Tunik dan Kulot Abu', 'Setelan tunik dan kulot satu warna, praktis untuk kantor.', 'top', 'minimalist', 'Abu', ['#8C8B87', '#6B6A66'], 389000, 12, tops(102, 40, 96), 'tunic:plain', 'Rayon twill', ['kantor', 'kuliah'], { originalPrice: 459000 }],
  ['p88', 's_voal', 'Pashmina Kaos Oatmeal', 'Pashmina bahan kaos, tidak licin, nyaman untuk aktivitas.', 'hijab', 'casual', 'Krem', ['#D9CBB1', '#BFAF92'], 69000, 70, scarf('180 x 70', 180), 'hijab:plain', 'Kaos rayon', ['kuliah', 'weekend']],

  // Arsip Senen (preloved formal)
  ['p89', 's_senen', 'Blazer Double Breasted Navy', 'Blazer double breasted wol, kancing emas lengkap, lapisan dalam utuh.', 'outerwear', 'old_money', 'Biru', ['#1F2D4A', '#C9A65B'], 245000, 1, one('M', { chestBustCm: 100, shoulderWidthCm: 43, garmentLengthCm: 72 }), 'blazer:plain', 'Wol campuran', ['kantor', 'kondangan', 'thrift'], { originalPrice: 1900000, condition: 'very_good' }],
  ['p90', 's_senen', 'Celana Bahan High Waist Hitam', 'Celana bahan high waist dengan lipit, panjang semata kaki.', 'pants', 'formal', 'Hitam', ['#262523', '#3E3C39'], 115000, 1, one('28', { waistCm: 70, hipsCm: 98, garmentLengthCm: 96 }), 'trousers:plain', 'Poliester', ['kantor', 'thrift'], { originalPrice: 550000, condition: 'like_new' }],
  ['p91', 's_senen', 'Dress Kantor Sheath Maroon', 'Dress sheath selutut dengan ritsleting belakang, masih sangat rapi.', 'dress', 'formal', 'Merah', ['#6E2333', '#4E1824'], 185000, 1, one('M', { chestBustCm: 90, waistCm: 74, shoulderWidthCm: 37, garmentLengthCm: 98 }), 'dress:plain', 'Poliester stretch', ['kantor', 'kondangan', 'thrift'], { originalPrice: 899000, condition: 'very_good', stretch: true }],
  ['p92', 's_senen', 'Blazer Abu Single Button', 'Blazer abu satu kancing, bahu berstruktur ringan.', 'outerwear', 'formal', 'Abu', ['#7D7F80', '#5A5C5E'], 175000, 1, one('L', { chestBustCm: 106, shoulderWidthCm: 45, garmentLengthCm: 74 }), 'blazer:plain', 'Poliviskos', ['kantor', 'pria', 'thrift'], { originalPrice: 1200000, condition: 'very_good' }],
  ['p93', 's_senen', 'Kemeja Sutra Vintage Motif', 'Kemeja sutra vintage motif paisley kecil, ada satu kancing pengganti.', 'top', 'old_money', 'Biru', ['#34466B', '#C9A65B'], 145000, 1, one('M', { chestBustCm: 100, shoulderWidthCm: 41, garmentLengthCm: 68 }), 'blouse:satin', 'Sutra', ['kantor', 'kondangan', 'thrift'], { originalPrice: 950000, condition: 'good' }],
  ['p94', 's_senen', 'Rok Pensil Tweed Krem', 'Rok pensil tweed dengan belahan belakang, furing utuh.', 'pants', 'old_money', 'Krem', ['#D8C8A8', '#A8957A'], 125000, 1, one('27', { waistCm: 68, hipsCm: 94, garmentLengthCm: 62 }), 'skirt:plain', 'Tweed wol', ['kantor', 'thrift'], { originalPrice: 780000, condition: 'very_good' }],
  ['p95', 's_senen', 'Mantel Trench Camel', 'Trench coat panjang dengan sabuk, cocok untuk musim hujan.', 'outerwear', 'old_money', 'Coklat', ['#B88B5A', '#8C6A44'], 325000, 1, one('M', { chestBustCm: 108, shoulderWidthCm: 43, garmentLengthCm: 104 }), 'blazer:plain', 'Katun gabardin', ['kantor', 'weekend', 'thrift', 'hujan'], { originalPrice: 2100000, condition: 'very_good' }],
  ['p96', 's_senen', 'Pantofel Kulit Pria Hitam', 'Pantofel kulit hitam, sol sudah diganti baru.', 'shoes', 'formal', 'Hitam', ['#1D1C1A', '#3A3835'], 195000, 1, [{ sizeLabel: '42', insoleCm: 27.0 }], 'loafer:plain', 'Kulit sapi', ['kantor', 'kondangan', 'pria', 'thrift'], { originalPrice: 1100000, condition: 'good' }],

  // Lemari Bersama (collab mitra)
  ['p97', 's_lemari', 'Kemeja Denim Washed Biru', 'Kemeja denim ringan dikurasi untuk tema "biru akhir pekan".', 'top', 'casual', 'Biru', ['#6E8BA8', '#4F6C8C'], 135000, 1, one('M', { chestBustCm: 104, shoulderWidthCm: 44, garmentLengthCm: 72 }), 'shirt:plain', 'Denim chambray', ['weekend', 'kuliah', 'thrift'], { originalPrice: 499000, condition: 'very_good' }],
  ['p98', 's_lemari', 'Rok Midi Plisket Navy', 'Rok plisket navy, pinggang karet, dipilih untuk tema kantor santai.', 'pants', 'minimalist', 'Biru', ['#26355A', '#3A4C78'], 110000, 1, one('All size', { waistCm: 66, hipsCm: 110, garmentLengthCm: 80 }), 'skirt:pleat', 'Poliester', ['kantor', 'kuliah', 'thrift'], { originalPrice: 399000, condition: 'like_new' }],
  ['p99', 's_lemari', 'Cardigan Rajut Hijau Mint', 'Cardigan mint dikurasi untuk dipadukan dengan batik pesisir.', 'outerwear', 'casual', 'Hijau', ['#A3C9B4', '#7FAA94'], 95000, 1, one('M', { chestBustCm: 98, shoulderWidthCm: 40, garmentLengthCm: 58 }), 'cardigan:knit', 'Akrilik', ['kuliah', 'weekend', 'thrift'], { originalPrice: 350000, condition: 'very_good' }],
  ['p100', 's_lemari', 'Celana Kulot Linen Hitam', 'Kulot linen hitam, jatuh dan tidak menerawang.', 'pants', 'minimalist', 'Hitam', ['#262523', '#3E3C39'], 120000, 1, one('M', { waistCm: 70, hipsCm: 108, garmentLengthCm: 92 }), 'culottes:plain', 'Linen campuran', ['kantor', 'kuliah', 'thrift'], { originalPrice: 420000, condition: 'like_new' }],
  ['p101', 's_lemari', 'Blouse Ruffle Putih', 'Blouse putih dengan ruffle kecil di kerah, untuk tema "kantor lembut".', 'top', 'formal', 'Putih', ['#F4F2EC', '#DCD8CE'], 105000, 1, one('S', { chestBustCm: 90, shoulderWidthCm: 36, garmentLengthCm: 60 }), 'blouse:plain', 'Katun voile', ['kantor', 'kondangan', 'thrift'], { originalPrice: 380000, condition: 'very_good' }],
  ['p102', 's_lemari', 'Dress Linen Terracotta', 'Dress linen terracotta dengan kancing depan, cocok untuk undertone hangat.', 'dress', 'casual', 'Oranye', ['#B5603C', '#8E4A2E'], 165000, 1, one('M', { chestBustCm: 94, waistCm: 80, shoulderWidthCm: 38, garmentLengthCm: 112 }), 'dress:plain', 'Linen', ['weekend', 'kondangan', 'thrift'], { originalPrice: 650000, condition: 'very_good' }],
  ['p103', 's_lemari', 'Tas Bahu Kulit Hitam Vintage', 'Tas bahu kulit hitam vintage, ada goresan halus di sudut.', 'bag', 'old_money', 'Hitam', ['#1D1C1A', '#3A3835'], 175000, 1, bag('Sedang', 30, 10, 22), 'tote:plain', 'Kulit sapi', ['kantor', 'thrift'], { originalPrice: 1300000, condition: 'good' }],
  ['p104', 's_lemari', 'Loafer Suede Coklat Wanita', 'Loafer suede coklat, sol masih tebal.', 'shoes', 'old_money', 'Coklat', ['#8B5A3C', '#5A3B28'], 145000, 1, [{ sizeLabel: '38', insoleCm: 24.4 }], 'loafer:plain', 'Suede', ['kantor', 'kuliah', 'thrift'], { originalPrice: 700000, condition: 'very_good' }],

  // Jejak Kanvas (Bandung)
  ['p105', 's_kanvas', 'Sneaker Kanvas Low Krem', 'Sneaker kanvas 12 oz dengan sol vulkanisir krem.', 'shoes', 'casual', 'Krem', ['#E4D6BC', '#C9B48F'], 279000, 40, shoes(37, 23.5, 8), 'sneaker:plain', 'Kanvas 12 oz, karet vulkanisir', ['kuliah', 'weekend', 'kasual']],
  ['p106', 's_kanvas', 'Sneaker Kanvas High Hitam', 'High-top kanvas hitam dengan lubang tali logam.', 'shoes', 'streetwear', 'Hitam', ['#262523', '#F2EFE8'], 299000, 32, shoes(38, 24.2, 7), 'sneaker:plain', 'Kanvas 12 oz', ['kuliah', 'weekend', 'pria']],
  ['p107', 's_kanvas', 'Sneaker Kanvas Low Hijau Army', 'Sneaker kanvas hijau army, cocok dengan chino khaki.', 'shoes', 'casual', 'Hijau', ['#5B6343', '#F2EFE8'], 279000, 26, shoes(38, 24.2, 7), 'sneaker:plain', 'Kanvas 12 oz', ['kuliah', 'weekend', 'pria']],
  ['p108', 's_kanvas', 'Slip-On Kanvas Navy', 'Slip-on kanvas tanpa tali dengan karet samping.', 'shoes', 'casual', 'Biru', ['#26355A', '#F2EFE8'], 249000, 30, shoes(37, 23.5, 8), 'sneaker:plain', 'Kanvas', ['kuliah', 'weekend', 'kasual']],
  ['p109', 's_kanvas', 'Sneaker Kanvas Putih Gum Sole', 'Sneaker putih bersol karet coklat yang tidak cepat kuning.', 'shoes', 'minimalist', 'Putih', ['#F2EFE8', '#A8673E'], 309000, 0, shoes(37, 23.5, 8), 'sneaker:plain', 'Kanvas, sol gum', ['kuliah', 'kantor', 'weekend']],
  ['p110', 's_kanvas', 'Tote Kanvas Tebal Hitam', 'Tote kanvas tebal muat laptop 14 inci dan botol minum.', 'bag', 'minimalist', 'Hitam', ['#262523', '#3E3C39'], 149000, 45, bag('Besar', 40, 12, 36), 'tote:plain', 'Kanvas 16 oz', ['kuliah', 'kantor']],
  ['p111', 's_kanvas', 'Sneaker Kanvas Maroon Low', 'Sneaker kanvas maroon untuk tampilan akhir pekan yang beda.', 'shoes', 'casual', 'Merah', ['#6E2333', '#F2EFE8'], 279000, 18, shoes(37, 23.5, 7), 'sneaker:plain', 'Kanvas 12 oz', ['weekend', 'kasual']],
  ['p112', 's_kanvas', 'Sling Bag Kanvas Abu', 'Sling bag kanvas waterproof dengan dua kompartemen.', 'bag', 'streetwear', 'Abu', ['#7D7F80', '#4E5052'], 129000, 38, bag('Kecil', 26, 8, 16), 'sling:plain', 'Kanvas berlapis', ['kuliah', 'weekend', 'hujan']],

  // Anyam Nusa (Tasikmalaya)
  ['p113', 's_anyam', 'Tote Anyaman Pandan Natural', 'Tote pandan dianyam tangan dengan pegangan kulit.', 'bag', 'casual', 'Krem', ['#D9C08E', '#A88A55'], 189000, 22, bag('Sedang', 36, 12, 30), 'tote:plain', 'Pandan, kulit', ['weekend', 'kuliah', 'anyaman']],
  ['p114', 's_anyam', 'Tas Rotan Bulat', 'Tas rotan bulat dengan tali kulit panjang, cocok untuk kondangan siang.', 'bag', 'etnik_modern', 'Coklat', ['#B98C55', '#8C6532'], 259000, 14, bag('Bulat', 20, 8, 20), 'sling:plain', 'Rotan, kulit', ['kondangan', 'weekend', 'anyaman']],
  ['p115', 's_anyam', 'Clutch Mendong Hitam', 'Clutch mendong dianyam rapat dengan kancing magnet.', 'bag', 'formal', 'Hitam', ['#2B2A28', '#6B5326'], 149000, 20, bag('Clutch', 26, 3, 14), 'sling:plain', 'Mendong', ['kondangan', 'anyaman']],
  ['p116', 's_anyam', 'Tas Laptop Anyaman Mendong', 'Tas laptop mendong dengan lapisan busa dalam.', 'bag', 'minimalist', 'Coklat', ['#9A7A48', '#6B5326'], 299000, 10, bag('Laptop', 38, 6, 28), 'tote:plain', 'Mendong, busa', ['kantor', 'kuliah', 'anyaman']],
  ['p117', 's_anyam', 'Sling Anyaman Pandan Mini', 'Sling kecil pandan untuk ponsel dan dompet.', 'bag', 'casual', 'Krem', ['#E2D4B8', '#B9A57E'], 119000, 30, bag('Mini', 18, 6, 14), 'sling:plain', 'Pandan', ['weekend', 'kasual', 'anyaman']],
  ['p118', 's_anyam', 'Sandal Anyaman Mendong', 'Sandal teplek dengan tali anyaman mendong, sol karet.', 'shoes', 'casual', 'Krem', ['#D9C08E', '#8C6532'], 139000, 26, shoes(36, 22.8, 6), 'loafer:plain', 'Mendong, karet', ['weekend', 'kasual', 'anyaman']],
  ['p119', 's_anyam', 'Tote Anyaman Bergaris', 'Tote pandan dengan garis warna hijau dan bata.', 'bag', 'etnik_modern', 'Hijau', ['#6F8A7E', '#B5603C'], 209000, 0, bag('Besar', 42, 14, 34), 'tote:plain', 'Pandan', ['weekend', 'kuliah', 'anyaman']],
  ['p120', 's_anyam', 'Keranjang Belanja Anyaman Mendong', 'Tas keranjang mendong berbentuk kotak, kuat untuk belanja ke pasar.', 'bag', 'casual', 'Coklat', ['#B98C55', '#6B5326'], 129000, 35, bag('Besar', 40, 20, 30), 'tote:plain', 'Mendong', ['weekend', 'kasual', 'anyaman']],
];


/**
 * Real product photos (Unsplash, free licence) for the extended catalog. Some
 * titles and colours are adjusted so the listing matches what the photo shows.
 * The photos are representative pieces, not the sellers' own stock.
 */
const PHOTOS: Record<string, Partial<ExtraSeed> & { photo: string }> = {
  p25: { photo: '1760457356908-807c70c1ebd4' },
  p26: { photo: '1746637192370-ffbed6d951f6' },
  p27: { photo: '1761516659902-2994696b362e', title: 'Outer Batik Kawung Soga', colorFamily: 'Coklat', colorHex: ['#7A4E2D', '#EADBC2'], material: 'Katun, pewarna soga alam', description: 'Outer longgar dengan motif kawung soga coklat-krem pewarna alam, tanpa kancing.' },
  p28: { photo: '1758169744470-097641049fb7', title: 'Dress Batik Lasem Panjang' },
  p29: { photo: '1786114139608-fb90510a7720', title: 'Rok Plisket Batik Biru Kuning', description: 'Rok plisket dengan motif batik biru dan kuning, pinggang karet tersembunyi.', colorFamily: 'Biru', colorHex: ['#2E4A7C', '#D9A93A'], art: 'skirt:pleat' },
  p30: { photo: '1762708548366-a4aeac157758' },
  p31: { photo: '1761516126183-6edcbaa8be57', title: 'Selendang Batik Tulis Bunga Soga', colorFamily: 'Krem', colorHex: ['#EADBC2', '#7A4E2D'] },
  p32: { photo: '1768478701502-c6b378f85167', title: 'Kemeja Batik Cap Pesisir Warna-warni', colorFamily: 'Multi', colorHex: ['#C0573E', '#2E4A7C'], tags: ['kuliah', 'kasual', 'batik'] },
  p33: { photo: '1551028719-00167b16eac5' },
  p34: { photo: '1591047139829-d91aecb6caea' },
  p35: { photo: '1623854156816-4c4fc355ffc7', title: 'Jaket Kulit Suede Camel', art: 'jacket:plain', description: 'Jaket suede ringan dengan kerah klasik, enak dipakai untuk acara malam.' },
  p36: { photo: '1777987601423-f350ac29b3e9' },
  p37: { photo: '1760616172899-0681b97a2de3' },
  p38: { photo: '1598532163257-ae3c6b2524b6', title: 'Tas Tangan Kulit Domba Coklat', description: 'Tas tangan kulit domba dengan tali bahu yang bisa dilepas.', sizes: bag('Kecil', 24, 8, 16), art: 'tote:plain' },
  p39: { photo: '1654773215728-4387196bc2a8' },
  p40: { photo: '1625563206627-7e713d1ac0a8' },
  p41: { photo: '1768478701635-3cbf03c25abe', title: 'Atasan Tunik Endek Bali', art: 'tunic:stripe' },
  p42: { photo: '1748141951488-9c9fb9603daf', colorFamily: 'Merah', colorHex: ['#9C2F2A', '#D9A93A'] },
  p43: { photo: '1768478701507-24b1c8de2df0', title: 'Celana Kulot Endek', description: 'Kulot lebar dari tenun endek, pinggang karet dengan tali.', art: 'culottes:stripe', sizes: elastic(66, 104, 92) },
  p44: { photo: '1784295039401-2225df40ee7c' },
  p45: { photo: '1768478701560-671e7b391c94' },
  p46: { photo: '1789110520410-4fce7246f844', title: 'Celana Linen Cropped Hijau Muda' },
  p47: { photo: '1544816155-12df9643f363', title: 'Tote Kanvas Natural Panel Endek', colorFamily: 'Krem', colorHex: ['#E2D4B8', '#2F6F73'] },
  p48: { photo: '1761517099249-9cf89da692ab', title: 'Kemeja Endek Pria Motif Bunga', colorFamily: 'Coklat', colorHex: ['#8E5A3C', '#D9C28E'] },
  p49: { photo: '1761117228880-df2425bd70da', title: 'Blouse Sutra Wajo Merah', colorFamily: 'Merah', colorHex: ['#B3262E', '#7E1A20'] },
  p50: { photo: '1612423284934-2850a4ea6b0f' },
  p51: { photo: '1551883647-470f3460b4f9' },
  p52: { photo: '1789110519607-6176d668fb72', title: 'Slip Dress Sutra Hijau Pupus', colorHex: ['#A9C7A0', '#7FA478'] },
  p53: { photo: '1777566131421-a2c0a4806fcf' },
  p54: { photo: '1564584217132-2271feaeb3c5' },
  p55: { photo: '1761646238176-b480909e6ba6', title: 'Tas Tangan Sutra Plisket Krem', colorFamily: 'Krem', colorHex: ['#EADFC8', '#C9B48F'], description: 'Tas tangan berlapis sutra plisket dengan pegangan melengkung.' },
  p56: { photo: '1578747522731-9e5a179b02f7', title: 'Atasan Sutra Tanpa Lengan Putih', colorFamily: 'Putih', colorHex: ['#F4F1EA', '#DCD8CE'] },
  p57: { photo: '1727515546577-f7d82a47b51d', title: 'Jaket Kulit Hitam Vintage', description: 'Jaket kulit hitam vintage, ritsleting lancar, ada sedikit retak halus di siku.', colorFamily: 'Hitam', colorHex: ['#1F1E1C', '#3A3835'], material: 'Kulit sapi', tags: ['weekend', 'pria', 'thrift'] },
  p58: { photo: '1613332658633-551aef234b70' },
  p59: { photo: '1511794322962-129ddbd0af38', title: 'Celana Kargo Coklat', colorFamily: 'Coklat', colorHex: ['#7A5C3E', '#5A4330'] },
  p60: { photo: '1556821840-3a63f95609a7' },
  p61: { photo: '1718252540511-e958742e4165' },
  p62: { photo: '1581655353564-df123a1eb820', title: 'Kaos Putih Heavyweight Vintage', description: 'Kaos putih katun tebal vintage, kerah masih rapat.', colorFamily: 'Putih', colorHex: ['#F4F2EC', '#DCD8CE'] },
  p63: { photo: '1562105962-2fbaaf107fe3', title: 'Sneaker Kanvas High Hitam Putih', colorFamily: 'Hitam', colorHex: ['#262523', '#F2EFE8'] },
  p64: { photo: '1564557287817-3785e38ec1f5', title: 'Jaket Hoodie Ritsleting Abu', description: 'Hoodie ritsleting abu, fleece masih tebal, tali serut lengkap.', colorFamily: 'Abu', colorHex: ['#8C8B87', '#5E5D5A'], material: 'Katun fleece', art: 'cardigan:knit' },
  p65: { photo: '1617117475026-2eb3e68b63cf' },
  p66: { photo: '1602810318383-e386cc2a3ccf' },
  p67: { photo: '1601561446301-fecc99036f4b', title: 'Celana Chino Slim Coklat', colorFamily: 'Coklat', colorHex: ['#8B6A4A', '#6B5038'] },
  p68: { photo: '1694447814836-c93ab70f7398', title: 'Celana Bahan Hitam Tapered', colorFamily: 'Hitam', colorHex: ['#262523', '#3E3C39'] },
  p69: { photo: '1771919331453-9a52362d8909' },
  p70: { photo: '1592343516109-362f7bd871aa', title: 'Blazer Unstructured Hitam', colorFamily: 'Hitam', colorHex: ['#1F1E1C', '#3A3835'] },
  p71: { photo: '1789238052416-d6c439162025', title: 'Celana Chino Regular Tan', description: 'Chino potongan regular warna tan, nyaman dari kantor sampai nongkrong.', sizes: bottoms(72, 96, 100), tags: ['kantor', 'weekend', 'pria'] },
  p72: { photo: '1594387040646-53379461bf56' },
  p73: { photo: '1579206464424-7e43a81cadc1', title: 'Cardigan Rajut Abu Kancing Kayu', colorFamily: 'Abu', colorHex: ['#8C8B87', '#6B6A66'] },
  p74: { photo: '1760127537832-0bae1e09bfbb', title: 'Sweater Rajut Hijau Motif Daisy', description: 'Sweater rajut hijau dengan motif bunga daisy putih, tidak gatal.' },
  p75: { photo: '1758981400268-1181291b9503', title: 'Cardigan Rajut Nordic Coklat', description: 'Cardigan rajut tebal motif nordic putih, untuk udara dingin Batu.', category: 'outerwear', sizes: tops(100, 42, 62) },
  p76: { photo: '1631669991586-0465d15a41f5', title: 'Cardigan Rajut Merah', colorFamily: 'Merah', colorHex: ['#B3262E', '#7E1A20'] },
  p77: { photo: '1773747203295-dc002c421c33', title: 'Sweater Rajut Rust Oversize', description: 'Sweater rajut kasar warna rust dengan potongan oversize.', category: 'top', colorFamily: 'Oranye', colorHex: ['#A8552E', '#7E3E20'], sizes: tops(108, 50, 64), art: 'cardigan:knit', stretch: false },
  p78: { photo: '1574201635302-388dd92a4c3f', title: 'Sweater Rajut Abu Crewneck', colorFamily: 'Abu', colorHex: ['#9C9B96', '#6B6A66'] },
  p79: { photo: '1770058428104-9dab343b7ccc' },
  p80: { photo: '1610288311735-39b7facbd095', title: 'Cardigan Rajut Mustard', description: 'Cardigan rajut mustard dengan kancing depan, cerah untuk akhir pekan.', category: 'outerwear', sizes: tops(96, 40, 58), art: 'cardigan:knit', price: 189000, stockCount: 18 },
  p81: { photo: '1542380841-5eef57349ca1', title: 'Hijab Voal Segi Empat Biru', colorFamily: 'Biru', colorHex: ['#3A6EA5', '#2A5280'] },
  p82: { photo: '1693985007521-e08e64770947', title: 'Pashmina Ceruty Ungu', colorFamily: 'Ungu', colorHex: ['#7A5A8E', '#5B3A6B'] },
  p83: { photo: '1585728748176-455ac5eed962' },
  p84: { photo: '1747396206869-75ea57b325ce', title: 'Gamis Linen Polos Krem', colorFamily: 'Krem', colorHex: ['#E4D6BC', '#C9B48F'], material: 'Linen campuran' },
  p85: { photo: '1789111161026-1763989e210c', title: 'Celana Linen Pink Tali Serut', description: 'Celana linen pink dengan tali serut, enak dipadukan tunik panjang.', category: 'pants', sizes: elastic(66, 104, 96), art: 'trousers:plain' },
  p86: { photo: '1629637753054-59b070247608', title: 'Hijab Jersey Instan Hitam', description: 'Hijab instan jersey hitam, tidak perlu peniti, nyaman seharian.', price: 59000 },
  p87: { photo: '1789110854083-e4752bded644', title: 'Celana Kulot Garis Putih', description: 'Kulot high waist putih dengan garis hitam tipis vertikal.', category: 'pants', colorFamily: 'Putih', colorHex: ['#F4F2EC', '#262523'], sizes: elastic(64, 100, 94), art: 'culottes:stripe' },
  p88: { photo: '1730454626266-e6d47134c044', title: 'Pashmina Kaos Biru Muda', colorFamily: 'Biru', colorHex: ['#9DB8D4', '#7A98B8'] },
  p89: { photo: '1770757587875-18505e8c4054' },
  p90: { photo: '1776153627325-a5950e50b33a', title: 'Celana Bahan High Waist Tan', colorFamily: 'Coklat', colorHex: ['#B89A72', '#967A56'] },
  p91: { photo: '1677537947200-c0c34db22a95', title: 'Dress Kantor Coklat Selutut', colorFamily: 'Coklat', colorHex: ['#6B4226', '#4E301B'] },
  p92: { photo: '1622497170185-5d668f816a56' },
  p93: { photo: '1603252110481-7ba873bf42ab', title: 'Kemeja Vintage Putih Ungu', description: 'Kemeja vintage putih dengan aksen ungu, satu kancing pengganti.', colorFamily: 'Putih', colorHex: ['#F1EEE7', '#7A5A8E'], art: 'shirt:plain' },
  p94: { photo: '1617647858823-2424b6dc472f', title: 'Blazer Kotak Coklat Vintage', description: 'Blazer kotak-kotak coklat hitam, furing utuh, bahu berstruktur ringan.', category: 'outerwear', colorFamily: 'Coklat', colorHex: ['#7A5435', '#262523'], sizes: one('M', { chestBustCm: 98, shoulderWidthCm: 40, garmentLengthCm: 70 }), art: 'blazer:plain' },
  p95: { photo: '1592327877233-90b9bfd92e48' },
  p96: { photo: '1615979474401-8a6a344de5bd', title: 'Sepatu Slip-On Kulit Hitam' },
  p97: { photo: '1740711152088-88a009e877bb' },
  p98: { photo: '1789110853398-539d78dd63bc', title: 'Rok Midi Hitam', colorFamily: 'Hitam', colorHex: ['#262523', '#3E3C39'] },
  p99: { photo: '1679847628912-4c3e7402abc7', title: 'Jaket Rajut Crochet', description: 'Jaket crochet buatan tangan, dikurasi untuk tema "akhir pekan santai".', colorFamily: 'Krem', colorHex: ['#E4D6BC', '#B9A57E'] },
  p100: { photo: '1789110520143-9f54f069b43f', title: 'Celana Linen Mustard', colorFamily: 'Kuning', colorHex: ['#C99A3A', '#A47A26'], art: 'trousers:plain' },
  p101: { photo: '1770294758906-c8762abb2c8b', title: 'Atasan Putih Tanpa Lengan', description: 'Atasan putih tanpa lengan, dikurasi untuk dilapis cardigan atau blazer.' },
  p102: { photo: '1789110853872-f416085557fa' },
  p103: { photo: '1705909237050-7a7625b47fac' },
  p104: { photo: '1576792741377-eb0f4f6d1a47' },
  p105: { photo: '1777811662707-95d400b6672b', title: 'Sneaker Kanvas Low Putih', colorFamily: 'Putih', colorHex: ['#F2EFE8', '#DCD8CE'] },
  p106: { photo: '1641997465126-c73cc4070337' },
  p107: { photo: '1784715435231-5547da837fa9', title: 'Sneaker Kanvas Low Biru Muda', colorFamily: 'Biru', colorHex: ['#9DB8D4', '#F2EFE8'] },
  p108: { photo: '1700673698394-270378d1a70d', title: 'Sneaker Kanvas Biru', description: 'Sneaker kanvas biru dengan tali, sol vulkanisir.' },
  p109: { photo: '1676379760823-ebf91f45de0b', title: 'Sneaker Kanvas Hitam Sol Putih', colorFamily: 'Hitam', colorHex: ['#262523', '#F2EFE8'] },
  p110: { photo: '1572196284554-4e321b0e7e0b' },
  p111: { photo: '1781660953322-e2dc76dedbc4', title: 'Sneaker Kanvas High Oranye', colorFamily: 'Oranye', colorHex: ['#D9692E', '#F2EFE8'] },
  p112: { photo: '1574365569389-a10d488ca3fb', title: 'Tote Kanvas Putih Lipat', description: 'Tote kanvas ringan yang bisa dilipat kecil, cocok untuk belanja.', colorFamily: 'Putih', colorHex: ['#F2EFE8', '#DCD8CE'], art: 'tote:plain' },
  p113: { photo: '1524679813234-66a389fe1a42' },
  p114: { photo: '1771237873540-4e4f4d5b0def' },
  p115: { photo: '1749294435693-4f39ec7e0ab2', title: 'Clutch Mendong Coklat', colorFamily: 'Coklat', colorHex: ['#8C6532', '#6B5326'] },
  p116: { photo: '1641934777532-d277296b111c', title: 'Tas Bahu Anyaman Mendong', sizes: bag('Sedang', 34, 10, 28) },
  p117: { photo: '1793788691160-9ea531ea4b3f' },
  p118: { photo: '1613662632164-7f2b081a5b46', title: 'Sandal Teplek Tali Coklat', material: 'Kulit sintetis, karet', colorFamily: 'Coklat', colorHex: ['#8C6532', '#5A3B28'] },
  p119: { photo: '1785704440157-ac28234e2010', title: 'Tas Kain Bergaris Dasar Anyaman', colorFamily: 'Multi' },
  p120: { photo: '1601330862030-1e08c703ac04' },
};

export const EXTRA_SEEDS: ExtraSeed[] = ROWS.map(([id, store, title, description, category, style, colorFamily, colorHex, price, stock, sizes, art, material, tags, extra]) => {
  const r = hash(id);
  const preloved = store === 's_kotatua' || store === 's_senen' || store === 's_lemari';
  return {
    id,
    store,
    title,
    description,
    category,
    style,
    colorFamily,
    colorHex,
    price,
    originalPrice: extra?.originalPrice,
    condition: extra?.condition ?? 'new',
    isOneOfAKind: preloved || undefined,
    stockCount: stock,
    sizes,
    art,
    material,
    stretch: extra?.stretch,
    likes: Math.round(60 + r * (preloved ? 900 : 1600)),
    saves: Math.round(20 + hash(`${id}s`) * (preloved ? 400 : 700)),
    tags,
    daysAgo: Math.floor(hash(`${id}d`) * 40),
    ...PHOTOS[id],
  };
});
