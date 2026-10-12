import { 
  WardrobeItem, 
  UMKMProductPost, 
  OutfitSlot, 
  OutfitSlotType, 
  SavedOutfit, 
  OutfitBuilderMode, 
  OutfitWeather,
  BodyMeasurements 
} from '@/types';
import { calculateSizeCompatibility } from './sizing-engine';

export interface OutfitGenerationParams {
  mode: OutfitBuilderMode;
  wardrobeItems: WardrobeItem[];
  marketplaceProducts: UMKMProductPost[];
  occasion: string;
  styleVibe: string;
  maxBudget?: number;
  preferredColors?: string[];
  weather?: OutfitWeather | string;
  userMeasurements?: BodyMeasurements | null;
  preselectedWardrobeItems?: WardrobeItem[];
}

/**
 * Maps marketplace product category to outfit slot type
 */
export function mapProductCategoryToSlot(category: string): OutfitSlotType {
  const c = category.toLowerCase();
  if (c === 'top' || c === 'casual_outfit' || c === 'hijab') return 'top';
  if (c === 'jeans' || c === 'pants' || c === 'skirt') return 'bottom';
  if (c === 'outerwear') return 'outerwear';
  if (c === 'dress') return 'dress';
  if (c === 'shoes') return 'shoes';
  if (c === 'bag') return 'bag';
  return 'accessory';
}

/**
 * Maps wardrobe category to outfit slot type
 */
export function mapWardrobeCategoryToSlot(category: string): OutfitSlotType {
  const c = category.toLowerCase();
  if (c === 'tops') return 'top';
  if (c === 'bottoms') return 'bottom';
  if (c === 'outerwear') return 'outerwear';
  if (c === 'dresses') return 'dress';
  if (c === 'shoes') return 'shoes';
  if (c === 'bags') return 'bag';
  return 'accessory';
}

/**
 * Intelligent Outfit Generator Engine
 * Recommends complete, harmonious outfits based on mode (My Closet, Shop New, or Hybrid).
 */
export function generateOutfitCombination(params: OutfitGenerationParams): SavedOutfit {
  const {
    mode,
    wardrobeItems,
    marketplaceProducts,
    occasion,
    styleVibe,
    maxBudget,
    weather,
    userMeasurements,
    preselectedWardrobeItems = []
  } = params;

  const slots: OutfitSlot[] = [];
  const availableMarketplace = marketplaceProducts.filter(p => p.isAvailable && p.stockCount > 0);

  // Group wardrobe items
  const wardrobeTops = wardrobeItems.filter(i => i.category === 'tops');
  const wardrobeBottoms = wardrobeItems.filter(i => i.category === 'bottoms');
  const wardrobeOuter = wardrobeItems.filter(i => i.category === 'outerwear');
  const wardrobeDresses = wardrobeItems.filter(i => i.category === 'dresses');
  const wardrobeShoes = wardrobeItems.filter(i => i.category === 'shoes');
  const wardrobeBags = wardrobeItems.filter(i => i.category === 'bags');

  // Group marketplace items
  const mktTops = availableMarketplace.filter(p => ['top', 'casual_outfit', 'hijab'].includes(p.category));
  const mktBottoms = availableMarketplace.filter(p => ['jeans', 'pants', 'skirt'].includes(p.category));
  const mktOuter = availableMarketplace.filter(p => p.category === 'outerwear');
  const mktDresses = availableMarketplace.filter(p => p.category === 'dress');
  const mktShoes = availableMarketplace.filter(p => p.category === 'shoes');
  const mktBags = availableMarketplace.filter(p => p.category === 'bag');

  // Helper to pick items with style or occasion preference
  const pickBestWardrobeItem = (candidates: WardrobeItem[]): WardrobeItem | undefined => {
    if (candidates.length === 0) return undefined;
    // Prefer style match
    const match = candidates.find(c => c.style?.toLowerCase().includes(styleVibe.toLowerCase()));
    if (match) return match;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const pickBestMarketplaceProduct = (candidates: UMKMProductPost[], remainingBudget?: number): UMKMProductPost | undefined => {
    if (candidates.length === 0) return undefined;
    let pool = candidates;
    if (remainingBudget !== undefined && remainingBudget > 0) {
      const withinBudget = pool.filter(p => p.price <= remainingBudget);
      if (withinBudget.length > 0) pool = withinBudget;
    }
    // Prefer matching style or occasion
    const match = pool.find(p => 
      p.style?.toLowerCase().includes(styleVibe.toLowerCase()) || 
      p.occasion?.toLowerCase().includes(occasion.toLowerCase())
    );
    if (match) return match;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  let budgetLeft = maxBudget || 1000000;

  // Check pre-selected items from wardrobe first
  preselectedWardrobeItems.forEach(item => {
    const slot = mapWardrobeCategoryToSlot(item.category);
    slots.push({
      slotType: slot,
      source: 'wardrobe',
      wardrobeItem: item
    });
  });

  const hasSlot = (type: OutfitSlotType) => slots.some(s => s.slotType === type);

  // DECIDE BASE: Dress vs Top + Bottom
  const shouldUseDress = (mode === 'closet' && wardrobeDresses.length > 0 && Math.random() > 0.6) ||
    (mode === 'shop' && mktDresses.length > 0 && occasion === 'party');

  if (shouldUseDress && !hasSlot('top') && !hasSlot('dress')) {
    if (mode === 'closet' && wardrobeDresses.length > 0) {
      const dress = pickBestWardrobeItem(wardrobeDresses);
      if (dress) slots.push({ slotType: 'dress', source: 'wardrobe', wardrobeItem: dress });
    } else if (mktDresses.length > 0) {
      const dress = pickBestMarketplaceProduct(mktDresses, budgetLeft);
      if (dress) {
        slots.push({ slotType: 'dress', source: 'marketplace', marketplaceProduct: dress });
        budgetLeft -= dress.price;
      }
    }
  }

  // TOP SLOT (if no dress)
  if (!hasSlot('dress') && !hasSlot('top')) {
    if (mode === 'closet' || (mode === 'hybrid' && wardrobeTops.length > 0)) {
      const top = pickBestWardrobeItem(wardrobeTops);
      if (top) slots.push({ slotType: 'top', source: 'wardrobe', wardrobeItem: top });
    } else {
      const top = pickBestMarketplaceProduct(mktTops, budgetLeft);
      if (top) {
        slots.push({ slotType: 'top', source: 'marketplace', marketplaceProduct: top });
        budgetLeft -= top.price;
      }
    }
  }

  // BOTTOM SLOT (if no dress)
  if (!hasSlot('dress') && !hasSlot('bottom')) {
    if (mode === 'closet') {
      const bottom = pickBestWardrobeItem(wardrobeBottoms);
      if (bottom) slots.push({ slotType: 'bottom', source: 'wardrobe', wardrobeItem: bottom });
    } else if (mode === 'hybrid' && wardrobeBottoms.length > 0 && Math.random() > 0.5) {
      const bottom = pickBestWardrobeItem(wardrobeBottoms);
      if (bottom) slots.push({ slotType: 'bottom', source: 'wardrobe', wardrobeItem: bottom });
    } else {
      const bottom = pickBestMarketplaceProduct(mktBottoms, budgetLeft);
      if (bottom) {
        slots.push({ slotType: 'bottom', source: 'marketplace', marketplaceProduct: bottom });
        budgetLeft -= bottom.price;
      }
    }
  }

  // OUTERWEAR SLOT (optional: if weather cool_ac, rainy, or occasion formal/streetwear)
  const wantsOuter = weather === 'cool_ac' || weather === 'rainy' || occasion === 'campus' || occasion === 'formal';
  if (wantsOuter && !hasSlot('outerwear')) {
    if (mode === 'closet' && wardrobeOuter.length > 0) {
      const outer = pickBestWardrobeItem(wardrobeOuter);
      if (outer) slots.push({ slotType: 'outerwear', source: 'wardrobe', wardrobeItem: outer });
    } else if (mktOuter.length > 0) {
      const outer = pickBestMarketplaceProduct(mktOuter, budgetLeft);
      if (outer) {
        slots.push({ slotType: 'outerwear', source: 'marketplace', marketplaceProduct: outer });
        budgetLeft -= outer.price;
      }
    }
  }

  // SHOES SLOT
  if (!hasSlot('shoes')) {
    if (mode === 'closet' && wardrobeShoes.length > 0) {
      const shoes = pickBestWardrobeItem(wardrobeShoes);
      if (shoes) slots.push({ slotType: 'shoes', source: 'wardrobe', wardrobeItem: shoes });
    } else if (mktShoes.length > 0) {
      const shoes = pickBestMarketplaceProduct(mktShoes, budgetLeft);
      if (shoes) {
        slots.push({ slotType: 'shoes', source: 'marketplace', marketplaceProduct: shoes });
        budgetLeft -= shoes.price;
      }
    }
  }

  // BAG SLOT
  if (!hasSlot('bag')) {
    if (mode === 'closet' && wardrobeBags.length > 0) {
      const bag = pickBestWardrobeItem(wardrobeBags);
      if (bag) slots.push({ slotType: 'bag', source: 'wardrobe', wardrobeItem: bag });
    } else if (mktBags.length > 0) {
      const bag = pickBestMarketplaceProduct(mktBags, budgetLeft);
      if (bag) {
        slots.push({ slotType: 'bag', source: 'marketplace', marketplaceProduct: bag });
        budgetLeft -= bag.price;
      }
    }
  }

  // Calculate actual total price of marketplace products needed for purchase
  const totalPrice = slots.reduce((sum, slot) => {
    if (slot.source === 'marketplace' && slot.marketplaceProduct) {
      return sum + slot.marketplaceProduct.price;
    }
    return sum;
  }, 0);

  // Derive human, natural Indonesian fashion styling notes
  const topName = slots.find(s => s.slotType === 'top')?.wardrobeItem?.name || 
                  slots.find(s => s.slotType === 'top')?.marketplaceProduct?.title || 
                  slots.find(s => s.slotType === 'dress')?.wardrobeItem?.name || 
                  slots.find(s => s.slotType === 'dress')?.marketplaceProduct?.title || 'atasan pilihan';

  const bottomName = slots.find(s => s.slotType === 'bottom')?.wardrobeItem?.name || 
                     slots.find(s => s.slotType === 'bottom')?.marketplaceProduct?.title || 'bawahan serasi';

  const shoesName = slots.find(s => s.slotType === 'shoes')?.wardrobeItem?.name || 
                    slots.find(s => s.slotType === 'shoes')?.marketplaceProduct?.title || 'alas kaki pilihan';

  const occasionLabel = occasion === 'campus' ? 'aktivitas kampus dan kuliah' :
                        occasion === 'formal' ? 'pertemuan formal dan kantor' :
                        occasion === 'date' ? 'acara kencan santai' :
                        occasion === 'party' ? 'pesta dan perayaan semi-formal' :
                        occasion === 'interview' ? 'sesi wawancara profesional' : 'suasana kasual santai';

  const explanation = mode === 'closet'
    ? `Kombinasi ${topName} dan ${bottomName} dari lemarimu menciptakan siluet yang proporsional untuk ${occasionLabel}. Dipadukan dengan ${shoesName} untuk kenyamanan mobilitas harian tanpa perlu membeli pakaian baru.`
    : `Kurasi paduan ${topName} dan ${bottomName} dari UMKM lokal pilihan memberikan tampilan ${styleVibe} yang rapi untuk ${occasionLabel}. Estimasi total belanja tetap berada dalam acuan budget terjangkau.`;

  const colorHarmonyNote = 'Harmoni palet warna memadukan rona netral seimbang dengan aksen kontras lembut agar wajah tampak cerah alami.';

  const weatherNote = weather === 'hot'
    ? 'Menggunakan material berpori dan sejuk untuk sirkulasi udara optimal di cuaca panas tropis.'
    : weather === 'cool_ac' || weather === 'rainy'
    ? 'Dilengkapi lapisan luaran nyaman untuk menghadapi udara dingin ruangan ber-AC atau cuaca hujan.'
    : 'Bahan fleksibel yang adaptif untuk berbagai kondisi cuaca sepanjang hari.';

  // Size advice note
  let sizeAdviceNote = 'Gunakan panduan sentimeter (cm) pada setiap produk untuk memastikan fitting yang presisi.';
  if (userMeasurements?.chestBustCm && userMeasurements?.waistCm) {
    sizeAdviceNote = `Disesuaikan dengan profil lingkar dada ${userMeasurements.chestBustCm} cm dan pinggang ${userMeasurements.waistCm} cm Anda.`;
  }

  const titlePrefix = occasion === 'campus' ? 'Smart Campus' :
                      occasion === 'formal' ? 'Urban Tailored' :
                      occasion === 'date' ? 'Effortless Chic' :
                      occasion === 'party' ? 'Evening Elegant' : 'Casual Daily';

  return {
    id: `outfit-${Date.now()}`,
    userId: 'current_user',
    title: `${titlePrefix} ${styleVibe.charAt(0).toUpperCase() + styleVibe.slice(1)}`,
    occasion,
    style: styleVibe,
    slots,
    totalPrice,
    explanation,
    colorHarmonyNote,
    weatherNote,
    sizeAdviceNote,
    isFavorite: false,
    createdAt: new Date().toISOString()
  };
}

/**
 * Replace a single slot in an outfit while preserving all other slots!
 */
export function replaceOutfitSlot(
  outfit: SavedOutfit,
  slotIndex: number,
  newItem: WardrobeItem | UMKMProductPost,
  sourceType: 'wardrobe' | 'marketplace'
): SavedOutfit {
  const updatedSlots = [...outfit.slots];
  const targetSlot = updatedSlots[slotIndex];
  if (!targetSlot) return outfit;

  if (sourceType === 'wardrobe') {
    updatedSlots[slotIndex] = {
      slotType: targetSlot.slotType,
      source: 'wardrobe',
      wardrobeItem: newItem as WardrobeItem,
      marketplaceProduct: undefined
    };
  } else {
    updatedSlots[slotIndex] = {
      slotType: targetSlot.slotType,
      source: 'marketplace',
      wardrobeItem: undefined,
      marketplaceProduct: newItem as UMKMProductPost
    };
  }

  // Recalculate total price
  const newTotalPrice = updatedSlots.reduce((sum, slot) => {
    if (slot.source === 'marketplace' && slot.marketplaceProduct) {
      return sum + slot.marketplaceProduct.price;
    }
    return sum;
  }, 0);

  return {
    ...outfit,
    slots: updatedSlots,
    totalPrice: newTotalPrice,
    updatedAt: new Date().toISOString()
  };
}
