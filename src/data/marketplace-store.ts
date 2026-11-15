import { UMKMProductPost, MarketplaceOrder, BodyMeasurements, StoreProfile, PostComment, CommunityPost } from '@/types';
import { INITIAL_MARKETPLACE_PRODUCTS } from './umkm-products';

const PRODUCTS_STORAGE_KEY = 'outfitly_marketplace_products_v4';
const ORDERS_STORAGE_KEY = 'outfitly_marketplace_orders_v4';
const REPORTS_STORAGE_KEY = 'outfitly_reported_listings_v4';
const STORES_STORAGE_KEY = 'outfitly_store_profiles_v1';
const COMMENTS_STORAGE_KEY = 'outfitly_post_comments_v1';
const COMMUNITY_POSTS_STORAGE_KEY = 'outfitly_community_posts_v1';
const FOLLOWED_STORES_KEY = 'outfitly_followed_stores_v1';

// Initial Store Profiles with Stories ("Kenapa Buka Akun UMKM")
export const INITIAL_STORE_PROFILES: StoreProfile[] = [
  {
    id: 'seller-umkm-01',
    name: 'Pena Leather Works',
    username: 'penaleather_id',
    avatarUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80',
    city: 'Yogyakarta',
    rating: 4.9,
    reviewCount: 142,
    sellerType: 'umkm',
    bio: 'Pengrajin kulit nabati premium Kotagede. Aksesoris dan tas tahan puluhan tahun.',
    story: 'Berawal dari workshop kecil di Kotagede tahun 2018, kami ingin menghidupkan kembali kerajinan kulit nabati asli pengrajin lokal yang ramah lingkungan. Membuka toko di Outfitly memungkinkan kami langsung terhubung dengan sobat gaya yang menghargai ketelitian tangan pengrajin tanpa perantara panjang.',
    foundedYear: '2018',
    productCount: 8,
    followerCount: 1240,
    contactNumber: '6281234567801',
    instagramHandle: '@penaleather.id',
    externalShopUrl: 'https://shopee.co.id'
  },
  {
    id: 'seller-umkm-02',
    name: 'Atelier Senja',
    username: 'ateliersenja_bdg',
    avatarUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    city: 'Bandung',
    rating: 4.8,
    reviewCount: 98,
    sellerType: 'umkm',
    bio: 'Tailored denim & kemeja katun poplin modern untuk gaya smart casual Indonesia.',
    story: 'Atelier Senja lahir dari kecintaan kami terhadap perpaduan denim lokal dan tailoring klasik Bandung. Kami percaya setiap orang berhak memiliki setelan pakaian berpotongan tegas yang nyaman di iklim tropis. Di Outfitly, kami menghadirkan rilisan busana dengan spesifikasi ukuran sentimeter (cm) nyata.',
    foundedYear: '2020',
    productCount: 12,
    followerCount: 2180,
    contactNumber: '6281234567802',
    instagramHandle: '@ateliersenja.official',
    externalShopUrl: 'https://tokopedia.com'
  },
  {
    id: 'seller-umkm-03',
    name: 'Kala Studio',
    username: 'kalastudio_solo',
    avatarUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80',
    city: 'Solo',
    rating: 4.9,
    reviewCount: 76,
    sellerType: 'collab_mitra',
    bio: 'Wastra batik & gaun sutra kontemporer karya ibu pembatik Solo.',
    story: 'Kala Studio didirikan oleh perempuan muda di Solo yang ingin membawa sentuhan wastra dan kain sutra lokal ke panggung busana harian. Setiap helai kain diproses dengan pewarnaan alami ramah lingkungan. Bergabung dengan Outfitly adalah langkah kami memperluas apresiasi generasi muda terhadap warisan budaya nusantara.',
    foundedYear: '2021',
    productCount: 6,
    followerCount: 940,
    contactNumber: '6281234567803',
    instagramHandle: '@kalastudio.id',
    externalShopUrl: 'https://shopee.co.id'
  },
  {
    id: 'seller-preloved-01',
    name: 'Nadia Preloved Wardrobe',
    username: 'nadiapreloved_jkt',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    city: 'Jakarta Selatan',
    rating: 5.0,
    reviewCount: 45,
    sellerType: 'collab_mitra',
    bio: 'Kurasi busana preloved terawat & vintage lookbook berkualitas.',
    story: 'Sebagai fashion enthusiast, lemari saya sering penuh dengan pakaian berkualitas yang baru dipakai 1-2 kali untuk photoshoot atau acara. Lewat Outfitly Collab Mitra, saya ingin mengkurasi pakaian-pakaian ini agar menemukan pemilik baru, mendukung gerakan sustainable fashion dan sirkularitas busana.',
    foundedYear: '2023',
    productCount: 9,
    followerCount: 650,
    contactNumber: '6281234567804',
    instagramHandle: '@nadiapreloved',
    externalShopUrl: 'https://wa.me/6281234567804'
  }
];

// Initial Community Inspiration Posts
export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'comm-1',
    author: 'Nadia Rahmawati',
    authorUsername: 'nadiarahma',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    title: 'Weekend Stroll di Braga dengan Vest Denim',
    caption: 'Paduan vest denim dari @Atelier Senja dengan kemeja putih poplin dan celana kulot sage green. Nyaman banget untuk jalan santai sore hari!',
    tags: ['#OOTDIndo', '#CasualChic', '#BandungVibe', '#SawoMatang'],
    likes: 89,
    isLiked: false,
    commentsCount: 14,
    createdAt: '2026-03-20T14:30:00Z'
  },
  {
    id: 'comm-2',
    author: 'Dimas Satria',
    authorUsername: 'dimas_street',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    title: 'Minimalist Boxy Cut untuk Kuliah',
    caption: 'Kaos oversized katun berat warna off-white dipadu celana chino hitam dan sneakers lokal. Simple, effortless, dan proporsional untuk badan tinggi.',
    tags: ['#Streetwear', '#CampusOutfit', '#Minimalist', '#OutfitPria'],
    likes: 124,
    isLiked: true,
    commentsCount: 22,
    createdAt: '2026-03-19T09:15:00Z'
  },
  {
    id: 'comm-3',
    author: 'Clara Putri',
    authorUsername: 'claraputri',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    title: 'Earthy Silk Dress untuk Acara Semi-Formal',
    caption: 'Suka banget detail drapery sutra dari Kala Studio Solo. Warnanya hangat dan serasi banget dengan kulit sawo matang.',
    tags: ['#BatikSolo', '#EarthyTone', '#WarmUndertone', '#KondanganLook'],
    likes: 167,
    isLiked: false,
    commentsCount: 31,
    createdAt: '2026-03-18T18:00:00Z'
  }
];

export interface ListingReport {
  id: string;
  productId: string;
  productTitle: string;
  reporterName: string;
  reason: 'spam' | 'misleading_photo' | 'fake_condition' | 'prohibited_item' | 'inaccurate_measurements' | 'other';
  notes: string;
  createdAt: string;
  status: 'pending' | 'resolved_takedown' | 'dismissed';
}

/**
 * Get all active products from localStorage or fallback to defaults
 */
export function getStoredProducts(): UMKMProductPost[] {
  if (typeof window === 'undefined') return INITIAL_MARKETPLACE_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_MARKETPLACE_PRODUCTS));
      return INITIAL_MARKETPLACE_PRODUCTS;
    }
    const parsed: UMKMProductPost[] = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error('Failed to load products from storage:', e);
    return INITIAL_MARKETPLACE_PRODUCTS;
  }
}

/**
 * Save products to localStorage and dispatch update event
 */
export function saveStoredProducts(products: UMKMProductPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('outfitly_products_updated', { detail: products }));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
}

/**
 * Add a new product listing (UMKM or Preloved Community)
 */
export function addNewProductListing(newProduct: Omit<UMKMProductPost, 'id' | 'createdAt' | 'likes' | 'saves'>): UMKMProductPost {
  const current = getStoredProducts();
  const created: UMKMProductPost = {
    ...newProduct,
    id: `prod-${Date.now()}`,
    likes: 0,
    saves: 0,
    createdAt: new Date().toISOString()
  };
  const updated = [created, ...current];
  saveStoredProducts(updated);
  return created;
}

/**
 * Update an existing product
 */
export function updateProductListing(updatedProduct: UMKMProductPost): void {
  const current = getStoredProducts();
  const index = current.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    current[index] = { ...updatedProduct, updatedAt: new Date().toISOString() };
    saveStoredProducts(current);
  }
}

/**
 * Toggle stock availability for a product
 */
export function toggleProductStock(productId: string): void {
  const current = getStoredProducts();
  const item = current.find(p => p.id === productId);
  if (item) {
    item.isAvailable = !item.isAvailable;
    if (!item.isAvailable) {
      item.stockCount = 0;
    } else if (item.stockCount === 0) {
      item.stockCount = item.isOneOfAKind ? 1 : 10;
    }
    saveStoredProducts(current);
  }
}

/**
 * Delete a product listing
 */
export function deleteProductListing(productId: string): void {
  const current = getStoredProducts();
  const filtered = current.filter(p => p.id !== productId);
  saveStoredProducts(filtered);
}

// ----------------- ORDERS MANAGEMENT -----------------

export function getStoredOrders(): MarketplaceOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredOrders(orders: MarketplaceOrder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('outfitly_orders_updated', { detail: orders }));
  } catch (e) {}
}

export function createOrder(orderData: Omit<MarketplaceOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'estimatedDelivery'>): MarketplaceOrder {
  const current = getStoredOrders();
  const now = new Date();
  const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days estimation

  const order: MarketplaceOrder = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber: `OFY-${Date.now().toString().slice(-6)}`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    estimatedDelivery: deliveryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  const updated = [order, ...current];
  saveStoredOrders(updated);

  // If one of a kind, auto decrement stock & mark unavailable
  if (order.product.isOneOfAKind) {
    const products = getStoredProducts();
    const target = products.find(p => p.id === order.product.id);
    if (target) {
      target.stockCount = 0;
      target.isAvailable = false;
      saveStoredProducts(products);
    }
  }

  return order;
}

export function updateOrderStatus(
  orderId: string, 
  newStatus: MarketplaceOrder['orderStatus'],
  extra?: { trackingNumber?: string; review?: MarketplaceOrder['review'] }
): void {
  const current = getStoredOrders();
  const order = current.find(o => o.id === orderId);
  if (order) {
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();
    if (extra?.trackingNumber) order.trackingNumber = extra.trackingNumber;
    if (extra?.review) order.review = extra.review;
    if (newStatus === 'completed') {
      order.escrowStatus = 'released_to_seller';
    } else if (newStatus === 'cancelled') {
      order.escrowStatus = 'refunded';
    }
    saveStoredOrders(current);
  }
}

// ----------------- REPORTING & MODERATION -----------------

export function getStoredReports(): ListingReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredReports(reports: ListingReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('outfitly_reports_updated', { detail: reports }));
  } catch (e) {}
}

export function reportProductListing(
  productId: string, 
  productTitle: string, 
  reporterName: string, 
  reason: ListingReport['reason'], 
  notes: string
): void {
  const reports = getStoredReports();
  const newReport: ListingReport = {
    id: `rep-${Date.now()}`,
    productId,
    productTitle,
    reporterName,
    reason,
    notes,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  saveStoredReports([newReport, ...reports]);

  // Mark product as reported
  const products = getStoredProducts();
  const target = products.find(p => p.id === productId);
  if (target) {
    target.isReported = true;
    saveStoredProducts(products);
  }
}

export function moderateProductListing(reportId: string, action: 'takedown' | 'dismiss'): void {
  const reports = getStoredReports();
  const rep = reports.find(r => r.id === reportId);
  if (rep) {
    rep.status = action === 'takedown' ? 'resolved_takedown' : 'dismissed';
    saveStoredReports(reports);

    if (action === 'takedown') {
      const products = getStoredProducts();
      const target = products.find(p => p.id === rep.productId);
      if (target) {
        target.isModerated = true;
        target.isAvailable = false;
        saveStoredProducts(products);
      }
    }
  }
}

// ----------------- STORE PROFILES & FOLLOWS -----------------

export function getFollowedStoreIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FOLLOWED_STORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveFollowedStoreIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FOLLOWED_STORES_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('outfitly_store_follows_updated', { detail: ids }));
  } catch (e) {}
}

export function getStoreProfiles(): StoreProfile[] {
  if (typeof window === 'undefined') return INITIAL_STORE_PROFILES;
  try {
    const raw = localStorage.getItem(STORES_STORAGE_KEY);
    const followed = getFollowedStoreIds();
    let list: StoreProfile[] = raw ? JSON.parse(raw) : INITIAL_STORE_PROFILES;
    return list.map(store => ({
      ...store,
      isFollowed: followed.includes(store.id),
      followerCount: followed.includes(store.id) ? store.followerCount + 1 : store.followerCount
    }));
  } catch (e) {
    return INITIAL_STORE_PROFILES;
  }
}

export function getStoreProfileByNameOrId(identifier: string): StoreProfile {
  const all = getStoreProfiles();
  const match = all.find(
    s => s.id === identifier || 
    s.name.toLowerCase() === identifier.toLowerCase() ||
    s.username.toLowerCase() === identifier.toLowerCase()
  );
  if (match) return match;

  // Fallback dynamic profile if not found
  return {
    id: `seller-${identifier.toLowerCase().replace(/\s+/g, '-')}`,
    name: identifier,
    username: identifier.toLowerCase().replace(/\s+/g, '_'),
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    city: 'Indonesia',
    rating: 5.0,
    reviewCount: 12,
    sellerType: 'umkm',
    bio: 'Koleksi busana pilihan UMKM & Collab Mitra lokal terverifikasi di Outfitly.',
    story: `Kami membuka toko di Outfitly untuk menghadirkan karya busana kurasi yang dirancang dengan perhatian pada detail dan ukuran nyata. Senang bisa menjadi bagian dari perjalanan gaya teman-teman semua!`,
    productCount: 4,
    followerCount: 156,
    isFollowed: false,
    contactNumber: '6281234567890',
    instagramHandle: `@${identifier.toLowerCase().replace(/\s+/g, '')}.id`
  };
}

export function toggleFollowStore(storeId: string): boolean {
  const followed = getFollowedStoreIds();
  const isCurrently = followed.includes(storeId);
  const updated = isCurrently ? followed.filter(id => id !== storeId) : [...followed, storeId];
  saveFollowedStoreIds(updated);
  return !isCurrently;
}

export function saveStoreProfiles(stores: StoreProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
    window.dispatchEvent(new CustomEvent('outfitly_store_profiles_updated', { detail: stores }));
  } catch (e) {}
}

export function updateStoreProfile(updatedProfile: StoreProfile): void {
  const all = getStoreProfiles();
  const index = all.findIndex(s => s.id === updatedProfile.id || s.name.toLowerCase() === updatedProfile.name.toLowerCase());
  if (index !== -1) {
    all[index] = { ...all[index], ...updatedProfile };
    saveStoreProfiles(all);
  } else {
    saveStoreProfiles([updatedProfile, ...all]);
  }
}

// Store & Product Analytics Tracker
export interface StoreTrafficStats {
  viewsCount: number;
  productImpressions: number;
  externalLinkClicks: number;
  whatsappInquiries: number;
  savedCount: number;
}

const TRAFFIC_STORAGE_KEY = 'outfitly_seller_traffic_stats_v1';

export function getStoreTrafficStats(): StoreTrafficStats {
  if (typeof window === 'undefined') {
    return { viewsCount: 1420, productImpressions: 5830, externalLinkClicks: 284, whatsappInquiries: 97, savedCount: 312 };
  }
  try {
    const raw = localStorage.getItem(TRAFFIC_STORAGE_KEY);
    if (!raw) {
      const initial = { viewsCount: 1420, productImpressions: 5830, externalLinkClicks: 284, whatsappInquiries: 97, savedCount: 312 };
      localStorage.setItem(TRAFFIC_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { viewsCount: 1420, productImpressions: 5830, externalLinkClicks: 284, whatsappInquiries: 97, savedCount: 312 };
  }
}

export function incrementStoreTraffic(field: keyof StoreTrafficStats): void {
  if (typeof window === 'undefined') return;
  try {
    const stats = getStoreTrafficStats();
    stats[field] = (stats[field] || 0) + 1;
    localStorage.setItem(TRAFFIC_STORAGE_KEY, JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('outfitly_traffic_updated', { detail: stats }));
  } catch (e) {}
}


// ----------------- COMMENTS & LIKES -----------------

export function getStoredComments(postId: string): PostComment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${COMMENTS_STORAGE_KEY}_${postId}`);
    if (raw) return JSON.parse(raw);
    
    // Default initial mock comments for demo engagement
    const defaults: PostComment[] = [
      {
        id: `c-1-${postId}`,
        postId,
        author: 'Rina Sasmita',
        text: 'Potongannya cakep banget! Pas banget buat badan petite ga bikin keliatan tenggelam.',
        timestamp: '1 jam lalu'
      },
      {
        id: `c-2-${postId}`,
        postId,
        author: 'Fajar Nugraha',
        text: 'Bahannya adem ya? Pengiriman dari kota mana kak?',
        timestamp: '30m lalu'
      }
    ];
    return defaults;
  } catch (e) {
    return [];
  }
}

export function addCommentToPost(postId: string, author: string, text: string): PostComment {
  const current = getStoredComments(postId);
  const newComment: PostComment = {
    id: `c-${Date.now()}`,
    postId,
    author: author || 'Teman Gaya',
    text,
    timestamp: 'Baru saja'
  };
  const updated = [newComment, ...current];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${COMMENTS_STORAGE_KEY}_${postId}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('outfitly_comments_updated', { detail: { postId, comments: updated } }));
    } catch (e) {}
  }
  return newComment;
}

// ----------------- COMMUNITY POSTS -----------------

export function getCommunityPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return INITIAL_COMMUNITY_POSTS;
  try {
    const raw = localStorage.getItem(COMMUNITY_POSTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMMUNITY_POSTS_STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_POSTS));
      return INITIAL_COMMUNITY_POSTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_COMMUNITY_POSTS;
  }
}

export function saveCommunityPosts(posts: CommunityPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMMUNITY_POSTS_STORAGE_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('outfitly_community_posts_updated', { detail: posts }));
  } catch (e) {}
}

export function toggleLikeCommunityPost(postId: string): { likes: number; isLiked: boolean } {
  const posts = getCommunityPosts();
  const target = posts.find(p => p.id === postId);
  if (target) {
    target.isLiked = !target.isLiked;
    target.likes = target.isLiked ? target.likes + 1 : Math.max(0, target.likes - 1);
    saveCommunityPosts(posts);
    return { likes: target.likes, isLiked: target.isLiked };
  }
  return { likes: 0, isLiked: false };
}
