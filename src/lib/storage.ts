'use client';

import { useCallback, useSyncExternalStore } from 'react';

const PREFIX = 'outfitly:';

export const STORE_KEYS = {
  profile: 'profile',
  session: 'session',
  catalog: 'catalog',
  stores: 'stores',
  wardrobe: 'wardrobe',
  favorites: 'favorites',
  bookmarks: 'bookmarks',
  following: 'following',
  savedOutfits: 'saved_outfits',
  comments: 'comments',
  chatSessions: 'chat_sessions',
  chatQuota: 'chat_quota',
  notifications: 'notifications',
  analytics: 'analytics',
  communityLikes: 'community_likes',
  sellerStoreId: 'seller_store_id',
  handoff: 'handoff',
  communityPosts: 'community_posts',
} as const;

export type StoreKey = (typeof STORE_KEYS)[keyof typeof STORE_KEYS];

const eventName = (key: string): string => `outfitly_${key}`;

interface CacheEntry {
  raw: string | null;
  value: unknown;
}

const cache = new Map<string, CacheEntry>();

export function readStore<T>(key: StoreKey, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PREFIX + key);
  } catch {
    raw = null;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export type WriteListener = (key: StoreKey, prev: unknown, next: unknown) => void;
const writeListeners = new Set<WriteListener>();

/** Observe every local write (the cloud sync pushes changes from here). */
export function onStoreWrite(l: WriteListener): () => void {
  writeListeners.add(l);
  return () => {
    writeListeners.delete(l);
  };
}

/**
 * Persist a value and notify components. `silent` skips write listeners; the
 * cloud sync uses it when loading server data so it does not echo it back.
 */
export function writeStore<T>(key: StoreKey, value: T, opts?: { silent?: boolean }): boolean {
  if (typeof window === 'undefined') return false;
  const prev = writeListeners.size && !opts?.silent ? readStore<unknown>(key, undefined) : undefined;
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(PREFIX + key, raw);
  } catch {
    emitToast('Penyimpanan browser penuh. Hapus beberapa foto lemari lalu coba lagi.', 'error');
    return false;
  }
  cache.set(key, { raw, value });
  window.dispatchEvent(new Event(eventName(key)));
  if (!opts?.silent) writeListeners.forEach((l) => l(key, prev, value));
  return true;
}

export function removeStore(key: StoreKey): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
  cache.delete(key);
  window.dispatchEvent(new Event(eventName(key)));
}

function subscribeKey(key: StoreKey, cb: () => void): () => void {
  const onStorage = (e: StorageEvent): void => {
    if (e.key === PREFIX + key) cb();
  };
  window.addEventListener(eventName(key), cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(eventName(key), cb);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * Reactive localStorage state. Every write dispatches `outfitly_<key>` so all
 * components reading the same key re-render instantly without a reload.
 * `fallback` must be a stable reference (module-level constant).
 */
export function useStored<T>(
  key: StoreKey,
  fallback: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback((cb: () => void) => subscribeKey(key, cb), [key]);
  const value = useSyncExternalStore(
    subscribe,
    () => readStore<T>(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readStore<T>(key, fallback);
      const resolved =
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      writeStore<T>(key, resolved);
    },
    [key, fallback],
  );
  return [value, set];
}

/* ---------- Hydration flag ---------- */

const noopSubscribe = (): (() => void) => () => undefined;

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/* ---------- Toast bus ---------- */

export type ToastTone = 'success' | 'info' | 'error';

export interface ToastPayload {
  id: string;
  message: string;
  tone: ToastTone;
}

export function emitToast(message: string, tone: ToastTone = 'success'): void {
  if (typeof window === 'undefined') return;
  const detail: ToastPayload = { id: uid('t'), message, tone };
  window.dispatchEvent(new CustomEvent<ToastPayload>('outfitly_toast', { detail }));
}

/* ---------- Overlay registry (hides mobile bottom nav) ---------- */

let overlayCount = 0;
const overlayListeners = new Set<() => void>();

export function registerOverlay(): () => void {
  overlayCount += 1;
  overlayListeners.forEach((l) => l());
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  window.dispatchEvent(new Event('outfitly_overlay'));
  return () => {
    overlayCount = Math.max(0, overlayCount - 1);
    overlayListeners.forEach((l) => l());
    if (overlayCount === 0 && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    window.dispatchEvent(new Event('outfitly_overlay'));
  };
}

export function useOverlayOpen(): boolean {
  return useSyncExternalStore(
    (cb) => {
      overlayListeners.add(cb);
      return () => {
        overlayListeners.delete(cb);
      };
    },
    () => overlayCount > 0,
    () => false,
  );
}

/* ---------- Utils ---------- */

export { uid, todayKey, formatIDR, formatCount } from './format';
import { uid } from './format';
