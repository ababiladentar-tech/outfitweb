export type Gender = 'girl' | 'boy';
export type SkinTone = 'cool' | 'warm' | 'neutral';
export type BodyShape =
  | 'hourglass'
  | 'apple'
  | 'inverted_triangle'
  | 'rectangle'
  | 'pear'
  | 'oval'
  | 'triangle'
  | 'trapezoid';
export type FaceShape =
  | 'rectangle'
  | 'square'
  | 'hexagonal'
  | 'round'
  | 'oval'
  | 'triangle'
  | 'heart'
  | 'diamond';
export type SellerType = 'umkm' | 'community_preloved' | 'collab_mitra';
export type StylePreference =
  | 'casual'
  | 'formal'
  | 'minimalist'
  | 'streetwear'
  | 'old_money'
  | 'etnik_modern';

export type ProductCategory =
  | 'top'
  | 'pants'
  | 'dress'
  | 'outerwear'
  | 'jeans'
  | 'bag'
  | 'shoes'
  | 'hijab';

export type ProductCondition = 'new' | 'like_new' | 'very_good' | 'good';

export interface GarmentMeasurement {
  sizeLabel: string;
  chestBustCm?: number;
  waistCm?: number;
  hipsCm?: number;
  shoulderWidthCm?: number;
  garmentLengthCm?: number;
  insoleCm?: number;
  bagLengthCm?: number;
  bagWidthCm?: number;
  bagHeightCm?: number;
}

export interface UMKMProductPost {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerType: SellerType;
  sellerCity: string;
  sellerContact: string;
  externalLink?: string;
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
  isAvailable: boolean;
  availableSizes: GarmentMeasurement[];
  imageUrl: string;
  material?: string;
  stretch?: boolean;
  likes: number;
  saves: number;
  tags: string[];
  createdAt: string;
}

export type WardrobeCategory =
  | 'tops'
  | 'bottoms'
  | 'outerwear'
  | 'dresses'
  | 'shoes'
  | 'bags'
  | 'accessories';

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  imageUrl: string;
  color: string;
  colorHex: string;
  style: string;
  sizeLabel?: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  city: string;
  followerCount: number;
  contactNumber: string;
  bio: string;
  story: string;
  externalShopUrl?: string;
  instagram?: string;
  sellerType: SellerType;
  bannerHex: string;
  avatarHex: string;
}

export interface BodyMeasurements {
  chestCm: number;
  waistCm: number;
  shoulderCm: number;
  heightCm: number;
  weightKg: number;
  footCm: number;
}

export interface UserProfile {
  name: string;
  email: string;
  gender: Gender;
  skinTone: SkinTone;
  bodyShape: BodyShape;
  faceShape: FaceShape;
  palette: string[];
  styles: StylePreference[];
  measurements: BodyMeasurements;
  onboarded: boolean;
}

export type FitStatus = 'tight' | 'ideal' | 'loose';

export interface FitResult {
  status: FitStatus;
  score: number;
  notes: string[];
}

export type OutfitSlot = 'top' | 'bottom' | 'outer' | 'shoes' | 'bag';

export interface OutfitPiece {
  slot: OutfitSlot;
  source: 'wardrobe' | 'umkm';
  refId: string;
  name: string;
  imageUrl: string;
  colorHex: string;
  price: number;
  sellerName?: string;
  fit?: FitResult;
}

export type BuilderMode = 'wardrobe' | 'umkm' | 'hybrid';
export type Occasion = 'kuliah' | 'kantor' | 'kasual' | 'kondangan' | 'weekend';
export type Weather = 'cerah' | 'hujan' | 'sejuk';

export interface SavedOutfit {
  id: string;
  title: string;
  mode: BuilderMode;
  occasion: Occasion;
  pieces: OutfitPiece[];
  totalPrice: number;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  city: string;
  caption: string;
  occasion: string;
  productIds: string[];
  pieces?: OutfitPiece[];
  paletteHex: string[];
  likes: number;
  createdAt: string;
  /** Seeded example content, always labelled as demo in the UI. */
  isDemo?: boolean;
  /** Written by the person using this browser. */
  isOwn?: boolean;
}

export interface ProductComment {
  id: string;
  productId: string;
  author: string;
  text: string;
  createdAt: string;
}

export type ChatMode = 'ringkas' | 'lengkap';

export interface ChatMessage {
  id: string;
  role: 'user' | 'stylist';
  text: string;
  productIds?: string[];
  imageUrl?: string;
  wardrobeIds?: string[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: ChatMode;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface StoreAnalytics {
  storeVisits: number;
  impressions: number;
  linkClicks: number;
  waChats: number;
  bookmarks: number;
}

export type ViewKey =
  | 'home'
  | 'catalog'
  | 'wardrobe'
  | 'studio'
  | 'stylist'
  | 'seller';
