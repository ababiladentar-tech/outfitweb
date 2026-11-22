'use client';

import { useCallback } from 'react';
import {
  DEFAULT_ANALYTICS,
  DEFAULT_PROFILE,
  DEFAULT_WARDROBE,
  SEED_COMMENTS,
  SEED_NOTIFICATIONS,
  SEED_PRODUCTS,
  STORES,
} from './data';
import { STORE_KEYS, emitToast, useStored } from './storage';
import type {
  AppNotification,
  ChatSession,
  CommunityPost,
  ProductComment,
  SavedOutfit,
  StoreAnalytics,
  StoreProfile,
  UMKMProductPost,
  UserProfile,
  WardrobeItem,
} from './types';

export interface AuthSession {
  name: string;
  email: string;
  provider: 'email' | 'google' | 'x' | 'facebook';
}

export interface ChatQuota {
  date: string;
  used: number;
}

export interface Handoff {
  target: 'studio' | 'stylist';
  wardrobeIds: string[];
  at: number;
}

const EMPTY_IDS: string[] = [];
const EMPTY_OUTFITS: SavedOutfit[] = [];
const EMPTY_POSTS: CommunityPost[] = [];
const EMPTY_CHATS: ChatSession[] = [];
const NO_SESSION: AuthSession | null = null;
const NO_QUOTA: ChatQuota = { date: '', used: 0 };
const NO_HANDOFF: Handoff | null = null;
const DEFAULT_SELLER = 's_senja';

export const useProfile = () => useStored<UserProfile>(STORE_KEYS.profile, DEFAULT_PROFILE);
export const useSession = () => useStored<AuthSession | null>(STORE_KEYS.session, NO_SESSION);
export const useCatalog = () => useStored<UMKMProductPost[]>(STORE_KEYS.catalog, SEED_PRODUCTS);
export const useStores = () => useStored<StoreProfile[]>(STORE_KEYS.stores, STORES);
export const useWardrobe = () => useStored<WardrobeItem[]>(STORE_KEYS.wardrobe, DEFAULT_WARDROBE);
export const useSavedOutfits = () => useStored<SavedOutfit[]>(STORE_KEYS.savedOutfits, EMPTY_OUTFITS);
export const useComments = () => useStored<ProductComment[]>(STORE_KEYS.comments, SEED_COMMENTS);
export const useChatSessions = () => useStored<ChatSession[]>(STORE_KEYS.chatSessions, EMPTY_CHATS);
export const useChatQuota = () => useStored<ChatQuota>(STORE_KEYS.chatQuota, NO_QUOTA);
export const useNotifications = () => useStored<AppNotification[]>(STORE_KEYS.notifications, SEED_NOTIFICATIONS);
export const useAnalytics = () => useStored<Record<string, StoreAnalytics>>(STORE_KEYS.analytics, DEFAULT_ANALYTICS);
export const useSellerStoreId = () => useStored<string>(STORE_KEYS.sellerStoreId, DEFAULT_SELLER);
export const useHandoff = () => useStored<Handoff | null>(STORE_KEYS.handoff, NO_HANDOFF);
export const useCommunityPosts = () => useStored<CommunityPost[]>(STORE_KEYS.communityPosts, EMPTY_POSTS);
export const useCommunityLikes = () => useStored<string[]>(STORE_KEYS.communityLikes, EMPTY_IDS);

function useIdSet(key: typeof STORE_KEYS.favorites | typeof STORE_KEYS.bookmarks | typeof STORE_KEYS.following) {
  const [ids, setIds] = useStored<string[]>(key, EMPTY_IDS);
  const toggle = useCallback(
    (id: string): boolean => {
      let added = false;
      setIds((prev) => {
        added = !prev.includes(id);
        return added ? [...prev, id] : prev.filter((x) => x !== id);
      });
      return added;
    },
    [setIds],
  );
  return { ids, has: (id: string) => ids.includes(id), toggle };
}

export const useFavorites = () => useIdSet(STORE_KEYS.favorites);
export const useBookmarks = () => useIdSet(STORE_KEYS.bookmarks);
export const useFollowing = () => useIdSet(STORE_KEYS.following);

/** Increment a store analytics counter (used by product modal, store modal). */
export function useTrack() {
  const [, setAnalytics] = useAnalytics();
  return useCallback(
    (storeId: string, field: keyof StoreAnalytics, by = 1) => {
      setAnalytics((prev) => {
        const cur: StoreAnalytics = prev[storeId] ?? { storeVisits: 0, impressions: 0, linkClicks: 0, waChats: 0, bookmarks: 0 };
        return { ...prev, [storeId]: { ...cur, [field]: cur[field] + by } };
      });
    },
    [setAnalytics],
  );
}

export function useLikeProduct() {
  const fav = useFavorites();
  const [, setCatalog] = useCatalog();
  return {
    has: fav.has,
    toggle: (id: string) => {
      const added = fav.toggle(id);
      setCatalog((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + (added ? 1 : -1) } : p)));
      emitToast(added ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit', 'info');
    },
  };
}
