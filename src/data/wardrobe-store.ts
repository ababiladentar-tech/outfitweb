import { WardrobeItem, SavedOutfit, WardrobeCategory } from '@/types';

const WARDROBE_STORAGE_KEY = 'outfitly_user_wardrobe_v2';
const SAVED_OUTFITS_STORAGE_KEY = 'outfitly_saved_outfits_v2';

export const INITIAL_WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 'w-item-01',
    userId: 'default_user',
    name: 'Kemeja Katun Poplin Putih Bersih',
    category: 'tops',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    color: 'Putih',
    colorHex: '#FDFDFD',
    pattern: 'solid',
    style: 'minimalist',
    season: 'all_season',
    brand: 'Uniqlo',
    sizeLabel: 'M',
    notes: 'Kemeja katun bahan adem, cocok untuk kuliah dan kerja.',
    createdAt: '2026-04-01T10:00:00Z'
  },
  {
    id: 'w-item-02',
    userId: 'default_user',
    name: 'Celana Jeans Denim Straight Cut Biru Indigo',
    category: 'bottoms',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
    color: 'Biru Navy',
    colorHex: '#1B2A4A',
    pattern: 'solid',
    style: 'casual',
    season: 'all_season',
    brand: 'Levi\'s Vintage',
    sizeLabel: '30',
    notes: 'Denim non-stretch potongan lurus klasik, nyaman dipakai seharian.',
    createdAt: '2026-04-01T11:00:00Z'
  },
  {
    id: 'w-item-03',
    userId: 'default_user',
    name: 'Jaket Luaran Denim Washed Vintage',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    color: 'Biru Muda',
    colorHex: '#7BA0C0',
    pattern: 'solid',
    style: 'vintage_retro',
    season: 'all_season',
    brand: 'Thrift Archive',
    sizeLabel: 'L',
    notes: 'Layering hangat untuk ruangan AC atau jalan sore.',
    createdAt: '2026-04-02T09:30:00Z'
  },
  {
    id: 'w-item-04',
    userId: 'default_user',
    name: 'Sepatu Sneakers Kanvas Low Top Putih',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    color: 'Putih',
    colorHex: '#F8F8F6',
    pattern: 'solid',
    style: 'casual',
    season: 'all_season',
    brand: 'Compass',
    sizeLabel: 'EU 40',
    notes: 'Sneakers harian ringan dan fleksibel.',
    createdAt: '2026-04-02T14:15:00Z'
  },
  {
    id: 'w-item-05',
    userId: 'default_user',
    name: 'Tote Bag Kanvas Hitam Kompartemen Luas',
    category: 'bags',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    color: 'Hitam',
    colorHex: '#1A1A1A',
    pattern: 'solid',
    style: 'minimalist',
    season: 'all_season',
    brand: 'Artisan Bag',
    sizeLabel: 'All Size',
    notes: 'Muat laptop 14 inch dan buku catatan.',
    createdAt: '2026-04-03T08:00:00Z'
  },
  {
    id: 'w-item-06',
    userId: 'default_user',
    name: 'Kaos Polos Heavyweight Katun Sage Green',
    category: 'tops',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    color: 'Hijau Sage',
    colorHex: '#7D988D',
    pattern: 'solid',
    style: 'casual_chic',
    season: 'summer',
    brand: 'Local Basic',
    sizeLabel: 'M',
    notes: 'Gramasi tebal 220gsm tidak menerawang, sangat adem.',
    createdAt: '2026-04-03T16:00:00Z'
  }
];

export const INITIAL_SAVED_OUTFITS: SavedOutfit[] = [
  {
    id: 'outfit-01',
    userId: 'default_user',
    title: 'Smart Campus Look Minimalis',
    occasion: 'campus',
    style: 'minimalist',
    slots: [
      {
        slotType: 'top',
        source: 'wardrobe',
        wardrobeItem: INITIAL_WARDROBE_ITEMS[0]
      },
      {
        slotType: 'bottom',
        source: 'wardrobe',
        wardrobeItem: INITIAL_WARDROBE_ITEMS[1]
      },
      {
        slotType: 'outerwear',
        source: 'wardrobe',
        wardrobeItem: INITIAL_WARDROBE_ITEMS[2]
      },
      {
        slotType: 'shoes',
        source: 'wardrobe',
        wardrobeItem: INITIAL_WARDROBE_ITEMS[3]
      },
      {
        slotType: 'bag',
        source: 'wardrobe',
        wardrobeItem: INITIAL_WARDROBE_ITEMS[4]
      }
    ],
    totalPrice: 0,
    explanation: 'Paduan kemeja poplin putih dan denim lurus memberikan siluet bersih dan rapi untuk aktivitas perkuliahan. Layering jaket washed denim memberi kenyamanan di ruang kelas ber-AC.',
    colorHarmonyNote: 'Monokrom bersih (putih) berpadu kontras seimbang dengan biru indigo denim klasik.',
    weatherNote: 'Sangat fleksibel untuk suhu ruang AC 22°C maupun jalan siang hari.',
    isFavorite: true,
    createdAt: '2026-04-04T10:00:00Z'
  }
];

/**
 * Get all wardrobe items for user
 */
export function getStoredWardrobe(userId?: string): WardrobeItem[] {
  if (typeof window === 'undefined') return INITIAL_WARDROBE_ITEMS;
  try {
    const raw = localStorage.getItem(WARDROBE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(INITIAL_WARDROBE_ITEMS));
      return INITIAL_WARDROBE_ITEMS;
    }
    const parsed: WardrobeItem[] = JSON.parse(raw);
    if (userId && userId !== 'default_user') {
      const userItems = parsed.filter(item => item.userId === userId || item.userId === 'default_user');
      return userItems.length > 0 ? userItems : parsed;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load wardrobe items:', e);
    return INITIAL_WARDROBE_ITEMS;
  }
}

/**
 * Save wardrobe items
 */
export function saveStoredWardrobe(items: WardrobeItem[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('outfitly_wardrobe_updated', { detail: items }));
  } catch (e) {
    console.error('Failed to save wardrobe items:', e);
  }
}

/**
 * Add a new wardrobe item
 */
export function addWardrobeItem(newItem: Omit<WardrobeItem, 'id' | 'createdAt'>): WardrobeItem {
  const current = getStoredWardrobe(newItem.userId);
  const created: WardrobeItem = {
    ...newItem,
    id: `w-item-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const updated = [created, ...current];
  saveStoredWardrobe(updated, newItem.userId);
  return created;
}

/**
 * Update an existing wardrobe item
 */
export function updateWardrobeItem(id: string, updates: Partial<WardrobeItem>): WardrobeItem | null {
  const current = getStoredWardrobe();
  const index = current.findIndex(item => item.id === id);
  if (index === -1) return null;

  const updatedItem: WardrobeItem = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  current[index] = updatedItem;
  saveStoredWardrobe(current);
  return updatedItem;
}

/**
 * Delete a wardrobe item
 */
export function deleteWardrobeItem(id: string): boolean {
  const current = getStoredWardrobe();
  const filtered = current.filter(item => item.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredWardrobe(filtered);
  return true;
}

/**
 * Get all saved outfits
 */
export function getStoredOutfits(userId?: string): SavedOutfit[] {
  if (typeof window === 'undefined') return INITIAL_SAVED_OUTFITS;
  try {
    const raw = localStorage.getItem(SAVED_OUTFITS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_OUTFITS_STORAGE_KEY, JSON.stringify(INITIAL_SAVED_OUTFITS));
      return INITIAL_SAVED_OUTFITS;
    }
    const parsed: SavedOutfit[] = JSON.parse(raw);
    if (userId && userId !== 'default_user') {
      const userOutfits = parsed.filter(o => o.userId === userId || o.userId === 'default_user');
      return userOutfits.length > 0 ? userOutfits : parsed;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load saved outfits:', e);
    return INITIAL_SAVED_OUTFITS;
  }
}

/**
 * Save outfits list
 */
export function saveStoredOutfits(outfits: SavedOutfit[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_OUTFITS_STORAGE_KEY, JSON.stringify(outfits));
    window.dispatchEvent(new CustomEvent('outfitly_outfits_updated', { detail: outfits }));
  } catch (e) {
    console.error('Failed to save outfits:', e);
  }
}

/**
 * Save a newly created outfit
 */
export function saveNewOutfit(newOutfit: Omit<SavedOutfit, 'id' | 'createdAt'>): SavedOutfit {
  const current = getStoredOutfits(newOutfit.userId);
  const created: SavedOutfit = {
    ...newOutfit,
    id: `outfit-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const updated = [created, ...current];
  saveStoredOutfits(updated, newOutfit.userId);
  return created;
}

/**
 * Delete a saved outfit
 */
export function deleteSavedOutfit(id: string): boolean {
  const current = getStoredOutfits();
  const filtered = current.filter(o => o.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredOutfits(filtered);
  return true;
}

/**
 * Reset wardrobe to default sample collection
 */
export function resetToDefaultWardrobe(): WardrobeItem[] {
  if (typeof window === 'undefined') return INITIAL_WARDROBE_ITEMS;
  localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(INITIAL_WARDROBE_ITEMS));
  window.dispatchEvent(new CustomEvent('outfitly_wardrobe_updated', { detail: INITIAL_WARDROBE_ITEMS }));
  return INITIAL_WARDROBE_ITEMS;
}
