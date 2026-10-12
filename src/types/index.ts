export type GenderType = 'boy' | 'girl' | 'unisex';

export type SkinToneVeinType = 'cool' | 'neutral' | 'warm';
export type SkintoneType = 'putih_gading' | 'kuning_langsat' | 'sawo_matang' | 'gelap_eksotis' | 'cool' | 'neutral' | 'warm';
export type UndertoneType = 'warm' | 'cool' | 'neutral';

export type FemaleBodyShapeType = 'hourglass' | 'apple' | 'inverted_triangle' | 'rectangle' | 'pear';
export type MaleBodyShapeType = 'oval' | 'trapezoid' | 'inverted_triangle' | 'rectangle' | 'triangle';
export type BodyShapeType = 
  | 'hourglass' 
  | 'apple' 
  | 'inverted_triangle' 
  | 'rectangle' 
  | 'pear' 
  | 'oval' 
  | 'trapezoid' 
  | 'triangle';

export type FaceShapeType = 
  | 'rectangle' 
  | 'square' 
  | 'hexagonal_straight_base' 
  | 'hexagonal_straight_sides' 
  | 'round' 
  | 'oval' 
  | 'triangle_pear' 
  | 'inverted_triangle_heart' 
  | 'diamond'
  | 'heart'
  | 'oblong';

export type OccasionType = 'hangout' | 'kuliah_kerja' | 'formal_meeting' | 'kondangan_pesta' | 'date_night' | 'liburan_casual' | 'daily_casual';

export type StyleVibeType = 
  | 'minimalist_korean' 
  | 'casual_chic' 
  | 'streetwear_edgy' 
  | 'etnik_batik_modern' 
  | 'old_money_smart' 
  | 'vintage_retro' 
  | 'casual' 
  | 'formal' 
  | 'minimalist' 
  | 'streetwear' 
  | 'sporty' 
  | 'bohemian';

export type StylePreferenceType = 
  | 'casual' 
  | 'formal' 
  | 'minimalist' 
  | 'streetwear' 
  | 'sporty' 
  | 'bohemian'
  | string;

// Fit preference for clothing
export type FitPreferenceType = 'slim' | 'regular' | 'relaxed' | 'oversized';

// Smart Sizing: Body Measurements in CM
export interface BodyMeasurements {
  heightCm?: number;      // Informational
  weightKg?: number;      // Informational
  chestBustCm: number;    // Lingkar Dada
  waistCm: number;        // Lingkar Pinggang
  hipsCm?: number;        // Lingkar Pinggul
  shoulderWidthCm?: number; // Lebar Bahu
  sleeveLengthCm?: number;  // Panjang Lengan
  bodyLengthCm?: number;    // Panjang Badan / Baju yang diinginkan
  preferredFit: FitPreferenceType;
  lastUpdated?: string;
}

// Garment Size Chart in CM
export interface GarmentMeasurement {
  sizeLabel: string; // 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'All Size' | 'Custom'
  chestBustCm?: number;
  waistCm?: number;
  hipsCm?: number;
  shoulderWidthCm?: number;
  sleeveLengthCm?: number;
  garmentLengthCm?: number;
  thighCm?: number;
  inseamCm?: number;
}

export type ProductConditionType = 
  | 'new'          // Baru dengan Tag / Brand New with Tag
  | 'like_new'     // Seperti Baru / 99% Mulus tanpa cacat
  | 'very_good'    // Sangat Bagus / Sedikit jejak pemakaian wajar
  | 'good'         // Bagus / Ada tanda pemakaian minor
  | 'has_defects'; // Ada Defek (Kancing hilang, noda samar tertera jelas)

export type SellerType = 
  | 'umkm'                // Independent Local Indonesian Brand / UMKM
  | 'community_preloved'  // Individual Community Seller (Thrift / Preloved)
  | 'reseller';           // Curated Vintage / Reseller Partner

export interface UserOnboardingProfile {
  username?: string;
  name?: string;
  birthDate?: string;
  gender: GenderType;
  skinTone: SkinToneVeinType;
  bodyShape: BodyShapeType;
  preferredColors: string[];
  stylePreferences: StylePreferenceType[];
  faceShape: FaceShapeType;
  measurements?: BodyMeasurements;
}

export interface UMKMProductPost {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerType: SellerType;
  sellerAvatar?: string;
  sellerCity: string;
  sellerRating: number;
  sellerReviewCount: number;
  sellerContact: string;
  platform?: 'shopee' | 'tokopedia' | 'whatsapp' | 'instagram' | 'outfitly_direct' | string;
  
  title: string;
  description: string;
  category: 'jeans' | 'bag' | 'dress' | 'shoes' | 'casual_outfit' | 'hijab' | 'outerwear' | 'top' | 'pants' | 'skirt' | string;
  style: StyleVibeType | string;
  colorFamily: 'black' | 'white' | 'brown' | 'blue' | 'green' | 'pink' | 'red' | 'neutral' | string;
  colorHex: string[];
  
  price: number;
  originalPrice?: number;
  
  condition: ProductConditionType;
  defectNotes?: string;
  usageDuration?: string; // e.g. "Pemakaian 2x acara pesta"
  
  isOneOfAKind: boolean; // Preloved usually true (only 1 item available)
  stockCount: number;
  isAvailable: boolean;
  
  availableSizes: GarmentMeasurement[];
  fitType?: FitPreferenceType;
  measurementToleranceCm?: number; // e.g. 1.5
  measurementMethod?: string; // e.g. "Diukur mendatar di atas meja (flat-lay)"
  
  imageUrl: string;
  galleryImages?: string[];
  material?: string;
  occasion?: OccasionType | string;
  genderTarget?: 'female' | 'male' | 'unisex';
  
  likes: number;
  saves: number;
  tags: string[];
  
  bestForSkinTones?: SkinToneVeinType[];
  bestForBodyShapes?: BodyShapeType[];
  bestForFaceShapes?: FaceShapeType[];
  
  createdAt: string;
  updatedAt?: string;
  
  isReported?: boolean;
  isModerated?: boolean;
}

// Size Compatibility Output
export type SizeFitStatus = 
  | 'perfect_match' 
  | 'good_fit' 
  | 'snug_fit' 
  | 'loose_fit' 
  | 'size_up' 
  | 'size_down' 
  | 'inconclusive' 
  | 'missing_data';

export interface SizeCompatibilityResult {
  recommendedSize: string | null;
  overallScore: number; // 0 - 100%
  fitStatus: SizeFitStatus;
  confidence: 'high' | 'medium' | 'low' | 'missing_measurements';
  fitHeadline: string;
  summaryExplanation: string;
  detailedChecks: {
    part: 'Dada' | 'Pinggang' | 'Pinggul' | 'Bahu' | 'Panjang Baju' | 'Lengan';
    userMeasurementCm?: number;
    garmentMeasurementCm?: number;
    differenceCm?: number;
    status: 'ideal' | 'tight' | 'loose' | 'missing';
    note: string;
  }[];
  disclaimer: string;
}

export interface FilterCriteria {
  searchQuery: string;
  category: string;
  sellerType: string; // 'all' | 'umkm' | 'community_preloved' | 'reseller'
  condition: string;  // 'all' | 'new' | 'like_new' | 'very_good' | 'good'
  style: string;
  color: string;
  sizeLabel: string;  // 'all' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  priceRange: [number, number];
  matchProfile: boolean;
  onlySmartFit: boolean; // filter only items compatible with user's CM measurements
  onlyInStock: boolean;
  sortBy: 'relevance' | 'smart_fit' | 'price_low' | 'price_high' | 'popular' | 'newest' | 'rating';
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  recommendedProducts?: UMKMProductPost[];
}

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: string;
  sellerId: string;
  sellerName: string;
  product: UMKMProductPost;
  selectedSize: string;
  quantity: number;
  totalPrice: number;
  shippingCourier: string;
  shippingCost: number;
  trackingNumber?: string;
  paymentMethod: 'qris' | 'bca_va' | 'mandiri_va' | 'gopay' | 'shopeepay';
  escrowStatus: 'held_in_escrow' | 'released_to_seller' | 'refunded';
  orderStatus: 'unpaid' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refund_requested';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  review?: {
    rating: number;
    comment: string;
    fitFeedback: 'true_to_size' | 'ran_small' | 'ran_large';
    createdAt: string;
  };
}

export type ActiveAppView = 
  | 'home' 
  | 'chat' 
  | 'reference' 
  | 'saved' 
  | 'dashboard' 
  | 'seller_dashboard' 
  | 'orders' 
  | 'moderation'
  | 'wardrobe'
  | 'outfit_builder';

// --- DIGITAL WARDROBE TYPES ---
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
  userId: string;
  name: string;
  category: WardrobeCategory;
  imageUrl: string;
  color: string;
  colorHex?: string;
  pattern?: 'solid' | 'stripes' | 'plaid' | 'floral' | 'batik' | 'graphic' | 'polka' | 'other';
  style: StyleVibeType | string;
  season?: 'all_season' | 'summer' | 'rainy' | 'cold_ac';
  brand?: string;
  sizeLabel?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// --- AI OUTFIT BUILDER TYPES ---
export type OutfitSlotType = 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'bag' | 'accessory';

export interface OutfitSlot {
  slotType: OutfitSlotType;
  source: 'wardrobe' | 'marketplace';
  wardrobeItem?: WardrobeItem;
  marketplaceProduct?: UMKMProductPost;
}

export type OutfitBuilderMode = 'closet' | 'shop' | 'hybrid';
export type OutfitOccasion = 'campus' | 'casual' | 'date' | 'formal' | 'interview' | 'party' | 'travel' | string;
export type OutfitWeather = 'hot' | 'cool_ac' | 'rainy' | 'moderate';

export interface SavedOutfit {
  id: string;
  userId: string;
  title: string;
  occasion: string;
  style: string;
  slots: OutfitSlot[];
  totalPrice: number; // Sum of marketplace items to purchase (IDR)
  explanation: string;
  colorHarmonyNote?: string;
  sizeAdviceNote?: string;
  weatherNote?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
}

