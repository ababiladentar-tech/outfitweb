'use client';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { DEFAULT_PROFILE, DEFAULT_WARDROBE, SEED_COMMENTS, SEED_PRODUCTS, STORES } from '../data';
import { STORE_KEYS, emitToast, onStoreWrite, readStore, writeStore, type StoreKey } from '../storage';
import type {
  ChatSession,
  CommunityPost,
  ProductComment,
  SavedOutfit,
  StoreAnalytics,
  StoreProfile,
  UMKMProductPost,
  UserProfile,
  WardrobeItem,
} from '../types';
import { supabase } from './client';

/**
 * Cloud sync between the reactive localStorage cache and Supabase.
 *
 * The UI keeps reading and writing the local cache exactly as in demo mode.
 * This module loads server data into that cache (silently, so it is not
 * echoed back) and turns every local write into the matching insert, update,
 * or delete. Row level security on the server decides what a user may change.
 */

type Row = Record<string, unknown>;

interface State {
  sb: SupabaseClient;
  userId: string | null;
  cloudPostIds: Set<string>;
}

let state: State | null = null;
let chain: Promise<void> = Promise.resolve();
let lastErrorToast = 0;

const USER_KEYS: StoreKey[] = [
  STORE_KEYS.profile,
  STORE_KEYS.wardrobe,
  STORE_KEYS.savedOutfits,
  STORE_KEYS.chatSessions,
  STORE_KEYS.favorites,
  STORE_KEYS.bookmarks,
  STORE_KEYS.following,
  STORE_KEYS.communityLikes,
];

const FALLBACK: Partial<Record<StoreKey, unknown>> = {
  [STORE_KEYS.profile]: DEFAULT_PROFILE,
  [STORE_KEYS.wardrobe]: DEFAULT_WARDROBE,
  [STORE_KEYS.savedOutfits]: [],
  [STORE_KEYS.chatSessions]: [],
  [STORE_KEYS.favorites]: [],
  [STORE_KEYS.bookmarks]: [],
  [STORE_KEYS.following]: [],
  [STORE_KEYS.communityLikes]: [],
  [STORE_KEYS.communityPosts]: [],
  [STORE_KEYS.catalog]: SEED_PRODUCTS,
  [STORE_KEYS.stores]: STORES,
  [STORE_KEYS.comments]: SEED_COMMENTS,
  [STORE_KEYS.analytics]: {},
};

function report(err: unknown): void {
  const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : String(err);
  console.warn('[outfitly sync]', msg);
  if (Date.now() - lastErrorToast > 8000) {
    lastErrorToast = Date.now();
    emitToast(`Gagal menyimpan ke server: ${msg}`, 'error');
  }
}

function enqueue(job: () => Promise<void>): void {
  chain = chain.then(job).catch(report);
}

/** Wait for pending pushes (used before logout). */
export function flushSync(): Promise<void> {
  return chain;
}

async function must<T>(p: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  return data;
}

const silent = <T,>(key: StoreKey, value: T): void => {
  writeStore(key, value, { silent: true });
};

/* ---------- Row mappers ---------- */

export function storeFromRow(r: Row): StoreProfile {
  return {
    id: r.id as string,
    name: r.name as string,
    city: r.city as string,
    followerCount: (r.follower_count as number) ?? 0,
    contactNumber: (r.contact_number as string) ?? '',
    bio: (r.bio as string) ?? '',
    story: (r.story as string) ?? '',
    externalShopUrl: (r.external_shop_url as string | null) ?? undefined,
    instagram: (r.instagram as string | null) ?? undefined,
    sellerType: r.seller_type as StoreProfile['sellerType'],
    bannerHex: r.banner_hex as string,
    avatarHex: r.avatar_hex as string,
    ownerId: (r.owner_id as string | null) ?? null,
  };
}

function storeToRow(s: StoreProfile, owner: string): Row {
  return {
    id: s.id,
    owner_id: owner,
    name: s.name,
    city: s.city,
    contact_number: s.contactNumber,
    bio: s.bio,
    story: s.story,
    external_shop_url: s.externalShopUrl ?? null,
    instagram: s.instagram ?? null,
    seller_type: s.sellerType,
    banner_hex: s.bannerHex,
    avatar_hex: s.avatarHex,
  };
}

export function productFromRow(r: Row, stores: Map<string, StoreProfile>): UMKMProductPost | null {
  const s = stores.get(r.store_id as string);
  if (!s) return null;
  return {
    id: r.id as string,
    sellerId: s.id,
    sellerName: s.name,
    sellerType: s.sellerType,
    sellerCity: s.city,
    sellerContact: s.contactNumber,
    externalLink: (r.external_link as string | null) ?? s.externalShopUrl,
    title: r.title as string,
    description: r.description as string,
    category: r.category as UMKMProductPost['category'],
    style: r.style as string,
    colorFamily: r.color_family as string,
    colorHex: (r.color_hex as string[]) ?? [],
    price: r.price as number,
    originalPrice: (r.original_price as number | null) ?? undefined,
    condition: r.condition as UMKMProductPost['condition'],
    isOneOfAKind: !!r.is_one_of_a_kind,
    stockCount: r.stock_count as number,
    isAvailable: !!r.is_available,
    availableSizes: (r.available_sizes as UMKMProductPost['availableSizes']) ?? [],
    imageUrl: r.image_url as string,
    material: (r.material as string | null) ?? undefined,
    stretch: !!r.stretch,
    likes: (r.likes as number) ?? 0,
    saves: (r.saves as number) ?? 0,
    tags: (r.tags as string[]) ?? [],
    createdAt: r.created_at as string,
  };
}

function productToRow(p: UMKMProductPost, storeUrl?: string): Row {
  return {
    id: p.id,
    store_id: p.sellerId,
    title: p.title,
    description: p.description,
    category: p.category,
    style: p.style,
    color_family: p.colorFamily,
    color_hex: p.colorHex,
    price: p.price,
    original_price: p.originalPrice ?? null,
    condition: p.condition,
    is_one_of_a_kind: !!p.isOneOfAKind,
    stock_count: p.stockCount,
    is_available: p.isAvailable,
    available_sizes: p.availableSizes,
    image_url: p.imageUrl,
    material: p.material ?? null,
    stretch: !!p.stretch,
    external_link: p.externalLink && p.externalLink !== storeUrl ? p.externalLink : null,
    tags: p.tags,
    created_at: p.createdAt,
  };
}

function profileFromRow(r: Row): UserProfile {
  return {
    name: r.name as string,
    email: r.email as string,
    gender: r.gender as UserProfile['gender'],
    skinTone: r.skin_tone as UserProfile['skinTone'],
    bodyShape: r.body_shape as UserProfile['bodyShape'],
    faceShape: r.face_shape as UserProfile['faceShape'],
    palette: (r.palette as string[]) ?? [],
    styles: (r.styles as UserProfile['styles']) ?? [],
    measurements: { ...DEFAULT_PROFILE.measurements, ...((r.measurements as object) ?? {}) },
    onboarded: !!r.onboarded,
  };
}

function profileToRow(p: UserProfile, id: string): Row {
  return {
    id,
    name: p.name,
    email: p.email,
    gender: p.gender,
    skin_tone: p.skinTone,
    body_shape: p.bodyShape,
    face_shape: p.faceShape,
    palette: p.palette,
    styles: p.styles,
    measurements: p.measurements,
    onboarded: p.onboarded,
    updated_at: new Date().toISOString(),
  };
}

const wardrobeFromRow = (r: Row): WardrobeItem => ({
  id: r.id as string,
  name: r.name as string,
  category: r.category as WardrobeItem['category'],
  imageUrl: r.image_url as string,
  color: r.color as string,
  colorHex: r.color_hex as string,
  style: r.style as string,
  sizeLabel: (r.size_label as string | null) ?? undefined,
});

const wardrobeToRow = (w: WardrobeItem): Row => ({
  id: w.id,
  name: w.name,
  category: w.category,
  image_url: w.imageUrl,
  color: w.color,
  color_hex: w.colorHex,
  style: w.style,
  size_label: w.sizeLabel ?? null,
});

const noDataUrl = (url: string | undefined): string | undefined => (url && url.startsWith('data:') ? undefined : url);

const outfitFromRow = (r: Row): SavedOutfit => ({
  id: r.id as string,
  title: r.title as string,
  mode: r.mode as SavedOutfit['mode'],
  occasion: r.occasion as SavedOutfit['occasion'],
  pieces: (r.pieces as SavedOutfit['pieces']) ?? [],
  totalPrice: (r.total_price as number) ?? 0,
  createdAt: r.created_at as string,
});

const outfitToRow = (o: SavedOutfit): Row => ({
  id: o.id,
  title: o.title,
  mode: o.mode,
  occasion: o.occasion,
  pieces: o.pieces.map((p) => ({ ...p, imageUrl: noDataUrl(p.imageUrl) ?? '' })),
  total_price: o.totalPrice,
  created_at: o.createdAt,
});

const chatFromRow = (r: Row): ChatSession => ({
  id: r.id as string,
  title: r.title as string,
  mode: r.mode as ChatSession['mode'],
  messages: (r.messages as ChatSession['messages']) ?? [],
  updatedAt: r.updated_at as string,
});

const chatToRow = (c: ChatSession): Row => ({
  id: c.id,
  title: c.title,
  mode: c.mode,
  // Attached photos stay in this browser; the text, outfits, and steps are kept.
  messages: c.messages.map((m) => ({ ...m, imageUrl: noDataUrl(m.imageUrl) })),
  updated_at: c.updatedAt,
});

const commentFromRow = (r: Row): ProductComment => ({
  id: r.id as string,
  productId: r.product_id as string,
  author: r.author as string,
  text: r.text as string,
  createdAt: r.created_at as string,
});

function postFromRow(r: Row, me: string | null): CommunityPost {
  const likes = Array.isArray(r.community_likes) ? ((r.community_likes[0] as { count?: number } | undefined)?.count ?? 0) : 0;
  return {
    id: r.id as string,
    author: r.author as string,
    city: r.city as string,
    caption: r.caption as string,
    occasion: r.occasion as string,
    productIds: (r.product_ids as string[]) ?? [],
    pieces: (r.pieces as CommunityPost['pieces']) ?? undefined,
    paletteHex: (r.palette_hex as string[]) ?? [],
    likes,
    createdAt: r.created_at as string,
    isOwn: !!me && r.user_id === me,
  };
}

const postToRow = (p: CommunityPost): Row => ({
  id: p.id,
  author: p.author,
  city: p.city,
  caption: p.caption,
  occasion: p.occasion,
  product_ids: p.productIds,
  pieces: p.pieces ? p.pieces.map((x) => ({ ...x, imageUrl: noDataUrl(x.imageUrl) ?? '' })) : null,
  palette_hex: p.paletteHex,
  created_at: p.createdAt,
});

const ANALYTICS_COLUMN: Record<keyof StoreAnalytics, string> = {
  storeVisits: 'store_visits',
  impressions: 'impressions',
  linkClicks: 'link_clicks',
  waChats: 'wa_chats',
  bookmarks: 'bookmarks',
};

/* ---------- Photos ---------- */

async function uploadDataUrl(sb: SupabaseClient, bucket: 'products' | 'wardrobe', path: string, dataUrl: string): Promise<string | null> {
  const m = dataUrl.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
  if (!m) return null;
  const bin = atob(m[3]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  const file = `${path}.${m[2] === 'jpeg' ? 'jpg' : m[2]}`;
  const { error } = await sb.storage.from(bucket).upload(file, bytes, { contentType: m[1], upsert: true });
  if (error) throw error;
  return sb.storage.from(bucket).getPublicUrl(file).data.publicUrl;
}

/** Upload data: URL photos, then swap the local copy to the hosted URL. */
async function hostPhotos<T extends { id: string; imageUrl: string }>(
  sb: SupabaseClient,
  key: StoreKey,
  items: T[],
  bucket: 'products' | 'wardrobe',
  folder: (item: T) => string,
): Promise<T[]> {
  const out: T[] = [];
  const swapped = new Map<string, string>();
  for (const it of items) {
    if (it.imageUrl.startsWith('data:')) {
      const url = await uploadDataUrl(sb, bucket, `${folder(it)}/${it.id}`, it.imageUrl);
      if (url) {
        swapped.set(it.id, url);
        out.push({ ...it, imageUrl: url });
        continue;
      }
    }
    out.push(it);
  }
  if (swapped.size) {
    const cur = readStore<T[]>(key, []);
    silent(key, cur.map((x) => (swapped.has(x.id) ? { ...x, imageUrl: swapped.get(x.id) as string } : x)));
  }
  return out;
}

/* ---------- Diff helpers ---------- */

function diffById<T extends { id: string }>(prev: T[], next: T[]): { upserts: T[]; removed: string[] } {
  const before = new Map(prev.map((x) => [x.id, JSON.stringify(x)]));
  const ids = new Set(next.map((x) => x.id));
  return {
    upserts: next.filter((x) => before.get(x.id) !== JSON.stringify(x)),
    removed: prev.filter((x) => !ids.has(x.id)).map((x) => x.id),
  };
}

function diffIds(prev: string[], next: string[]): { added: string[]; removed: string[] } {
  return { added: next.filter((x) => !prev.includes(x)), removed: prev.filter((x) => !next.includes(x)) };
}

const ownedStoreIds = (uid: string): Set<string> =>
  new Set(readStore<StoreProfile[]>(STORE_KEYS.stores, STORES).filter((s) => s.ownerId === uid).map((s) => s.id));

/* ---------- Push: local write -> server ---------- */

async function pushIdSet(sb: SupabaseClient, table: string, column: string, prev: string[], next: string[], uid: string): Promise<void> {
  const d = diffIds(prev, next);
  if (d.added.length) await must(sb.from(table).upsert(d.added.map((id) => ({ user_id: uid, [column]: id })), { onConflict: `user_id,${column}`, ignoreDuplicates: true }));
  if (d.removed.length) await must(sb.from(table).delete().eq('user_id', uid).in(column, d.removed));
}

async function pushList<T extends { id: string }>(sb: SupabaseClient, table: string, prev: T[], next: T[], toRow: (x: T) => Row, scope: { column: string; value: string } | null, onConflict = 'id'): Promise<void> {
  const d = diffById(prev, next);
  if (d.upserts.length) await must(sb.from(table).upsert(d.upserts.map(toRow), { onConflict }));
  if (d.removed.length) {
    let q = sb.from(table).delete().in('id', d.removed);
    if (scope) q = q.eq(scope.column, scope.value);
    await must(q);
  }
}

function push(key: StoreKey, prevRaw: unknown, nextRaw: unknown): void {
  const s = state;
  if (!s) return;
  const prev = (prevRaw ?? FALLBACK[key]) as never;
  const next = nextRaw as never;
  const { sb } = s;
  const uid = s.userId;

  // Signing out from the account menu writes session = null.
  if (key === STORE_KEYS.session) {
    if (next === null && uid) enqueue(async () => { await sb.auth.signOut(); });
    return;
  }

  if (key === STORE_KEYS.analytics) {
    enqueue(async () => {
      const a = prev as Record<string, StoreAnalytics>;
      const b = next as Record<string, StoreAnalytics>;
      for (const [store, cur] of Object.entries(b)) {
        for (const f of Object.keys(ANALYTICS_COLUMN) as (keyof StoreAnalytics)[]) {
          const delta = cur[f] - (a[store]?.[f] ?? 0);
          if (delta > 0) await must(sb.rpc('track_store_event', { p_store: store, p_field: ANALYTICS_COLUMN[f], p_by: Math.min(20, delta) }));
        }
      }
    });
    return;
  }

  if (!uid) return; // Guests stay local; their data is uploaded on first sign-in.

  switch (key) {
    case STORE_KEYS.profile:
      enqueue(async () => { await must(sb.from('profiles').upsert(profileToRow(next as UserProfile, uid))); });
      break;
    case STORE_KEYS.wardrobe:
      enqueue(async () => {
        const d = diffById(prev as WardrobeItem[], next as WardrobeItem[]);
        const rows = await hostPhotos(sb, key, d.upserts, 'wardrobe', () => uid);
        if (rows.length) await must(sb.from('wardrobe_items').upsert(rows.map((w) => ({ ...wardrobeToRow(w), user_id: uid })), { onConflict: 'user_id,id' }));
        if (d.removed.length) await must(sb.from('wardrobe_items').delete().eq('user_id', uid).in('id', d.removed));
      });
      break;
    case STORE_KEYS.savedOutfits:
      enqueue(() => pushList(sb, 'saved_outfits', prev, next, (o: SavedOutfit) => ({ ...outfitToRow(o), user_id: uid }), { column: 'user_id', value: uid }, 'user_id,id'));
      break;
    case STORE_KEYS.chatSessions:
      enqueue(() => pushList(sb, 'chat_sessions', prev, next, (c: ChatSession) => ({ ...chatToRow(c), user_id: uid }), { column: 'user_id', value: uid }, 'user_id,id'));
      break;
    case STORE_KEYS.favorites:
      enqueue(() => pushIdSet(sb, 'favorites', 'product_id', prev, next, uid));
      break;
    case STORE_KEYS.bookmarks:
      enqueue(() => pushIdSet(sb, 'bookmarks', 'product_id', prev, next, uid));
      break;
    case STORE_KEYS.following:
      enqueue(() => pushIdSet(sb, 'follows', 'store_id', prev, next, uid));
      break;
    case STORE_KEYS.communityLikes: {
      const onServer = (ids: string[]) => ids.filter((id) => s.cloudPostIds.has(id));
      enqueue(() => pushIdSet(sb, 'community_likes', 'post_id', onServer(prev), onServer(next), uid));
      break;
    }
    case STORE_KEYS.communityPosts:
      enqueue(async () => {
        const mine = (xs: CommunityPost[]) => xs.filter((p) => p.isOwn);
        const d = diffById(mine(prev), mine(next));
        const fresh = d.upserts.filter((p) => !s.cloudPostIds.has(p.id));
        if (fresh.length) {
          await must(sb.from('community_posts').insert(fresh.map((p) => ({ ...postToRow(p), user_id: uid }))));
          fresh.forEach((p) => s.cloudPostIds.add(p.id));
        }
        if (d.removed.length) await must(sb.from('community_posts').delete().eq('user_id', uid).in('id', d.removed));
      });
      break;
    case STORE_KEYS.comments:
      enqueue(async () => {
        const known = new Set((prev as ProductComment[]).map((c) => c.id));
        const fresh = (next as ProductComment[]).filter((c) => !known.has(c.id));
        if (fresh.length) await must(sb.from('product_comments').insert(fresh.map((c) => ({ id: c.id, product_id: c.productId, author: c.author, text: c.text, user_id: uid, created_at: c.createdAt }))));
      });
      break;
    case STORE_KEYS.stores:
      enqueue(async () => {
        // Only stores this user owns are written; others are read-only here.
        const mine = (xs: StoreProfile[]) => xs.filter((x) => x.ownerId === uid);
        await pushList(sb, 'stores', mine(prev), mine(next), (x: StoreProfile) => storeToRow(x, uid), { column: 'owner_id', value: uid });
      });
      break;
    case STORE_KEYS.catalog:
      enqueue(async () => {
        const owned = ownedStoreIds(uid);
        const urls = new Map(readStore<StoreProfile[]>(STORE_KEYS.stores, STORES).map((x) => [x.id, x.externalShopUrl]));
        const mine = (xs: UMKMProductPost[]) => xs.filter((p) => owned.has(p.sellerId));
        // Like and save counts are kept by the server, so they are left out of the comparison.
        const strip = (xs: UMKMProductPost[]) => mine(xs).map((p) => ({ ...p, likes: 0, saves: 0 }));
        const d = diffById(strip(prev), strip(next));
        const rows = await hostPhotos(sb, key, d.upserts, 'products', (p) => p.sellerId);
        if (rows.length) await must(sb.from('products').upsert(rows.map((p) => productToRow(p, urls.get(p.sellerId)))));
        if (d.removed.length) await must(sb.from('products').delete().in('id', d.removed));
      });
      break;
    default:
      break;
  }
}

/* ---------- Pull: server -> local ---------- */

async function loadPublic(s: State): Promise<void> {
  const [storeRows, productRows, commentRows, postRows] = await Promise.all([
    must(s.sb.from('stores').select('*').order('created_at')),
    must(s.sb.from('products').select('*').order('created_at', { ascending: false }).limit(500)),
    must(s.sb.from('product_comments').select('*').order('created_at', { ascending: false }).limit(500)),
    must(s.sb.from('community_posts').select('*, community_likes(count)').order('created_at', { ascending: false }).limit(100)),
  ]);
  if (!(storeRows as Row[]).length) {
    console.warn('[outfitly sync] Database kosong. Jalankan supabase/seed.sql. Katalog contoh lokal dipakai sementara.');
    return;
  }
  const stores = (storeRows as Row[]).map(storeFromRow);
  const byId = new Map(stores.map((x) => [x.id, x]));
  silent(STORE_KEYS.stores, stores);
  silent(STORE_KEYS.catalog, (productRows as Row[]).map((r) => productFromRow(r, byId)).filter((p): p is UMKMProductPost => !!p));
  silent(STORE_KEYS.comments, (commentRows as Row[]).map(commentFromRow));
  const posts = (postRows as Row[]).map((r) => postFromRow(r, s.userId));
  s.cloudPostIds = new Set(posts.map((p) => p.id));
  silent(STORE_KEYS.communityPosts, posts);
}

/** Pick server data when it exists, otherwise upload what this browser has (first sign-in). */
async function adopt<T>(key: StoreKey, server: T[], fromServer: (xs: T[]) => unknown): Promise<void> {
  if (server.length) {
    silent(key, fromServer(server));
    return;
  }
  const local = readStore<unknown>(key, FALLBACK[key]);
  push(key, Array.isArray(local) ? [] : FALLBACK[key], local);
}

async function loadUser(s: State, user: User): Promise<void> {
  const uid = user.id;
  const sb = s.sb;
  const [profileRows, wardrobe, outfits, chats, favs, marks, follows, likes] = await Promise.all([
    must(sb.from('profiles').select('*').eq('id', uid)),
    must(sb.from('wardrobe_items').select('*').eq('user_id', uid).order('created_at')),
    must(sb.from('saved_outfits').select('*').eq('user_id', uid).order('created_at', { ascending: false })),
    must(sb.from('chat_sessions').select('*').eq('user_id', uid).order('updated_at', { ascending: false }).limit(50)),
    must(sb.from('favorites').select('product_id').eq('user_id', uid)),
    must(sb.from('bookmarks').select('product_id').eq('user_id', uid)),
    must(sb.from('follows').select('store_id').eq('user_id', uid)),
    must(sb.from('community_likes').select('post_id').eq('user_id', uid)),
  ]);

  const localProfile = readStore<UserProfile>(STORE_KEYS.profile, DEFAULT_PROFILE);
  const serverProfile = (profileRows as Row[])[0] ? profileFromRow((profileRows as Row[])[0]) : null;
  if (serverProfile && serverProfile.onboarded) {
    silent(STORE_KEYS.profile, serverProfile);
  } else {
    // First sign-in: keep what the user filled in as a guest, with the account's name and email.
    const merged: UserProfile = { ...localProfile, name: serverProfile?.name || localProfile.name, email: user.email ?? localProfile.email };
    silent(STORE_KEYS.profile, merged);
    push(STORE_KEYS.profile, null, merged);
  }

  await adopt(STORE_KEYS.wardrobe, wardrobe as Row[], (xs) => xs.map(wardrobeFromRow));
  await adopt(STORE_KEYS.savedOutfits, outfits as Row[], (xs) => xs.map(outfitFromRow));
  await adopt(STORE_KEYS.chatSessions, chats as Row[], (xs) => xs.map(chatFromRow));
  await adopt(STORE_KEYS.favorites, (favs as Row[]).map((r) => r.product_id as string), (xs) => xs);
  await adopt(STORE_KEYS.bookmarks, (marks as Row[]).map((r) => r.product_id as string), (xs) => xs);
  await adopt(STORE_KEYS.following, (follows as Row[]).map((r) => r.store_id as string), (xs) => xs);

  // The UI adds the user's own like/follow on top of the shown count, and the
  // server count already includes it, so take it out once here.
  const likedPosts = (likes as Row[]).map((r) => r.post_id as string);
  silent(STORE_KEYS.communityLikes, likedPosts);
  silent(
    STORE_KEYS.communityPosts,
    readStore<CommunityPost[]>(STORE_KEYS.communityPosts, []).map((p) => ({
      ...p,
      isOwn: p.isOwn || false,
      likes: likedPosts.includes(p.id) ? Math.max(0, p.likes - 1) : p.likes,
    })),
  );
  const followed = (follows as Row[]).map((r) => r.store_id as string);
  silent(
    STORE_KEYS.stores,
    readStore<StoreProfile[]>(STORE_KEYS.stores, STORES).map((x) => (followed.includes(x.id) ? { ...x, followerCount: Math.max(0, x.followerCount - 1) } : x)),
  );

  const owned = [...ownedStoreIds(uid)];
  if (owned.length) {
    const rows = await must(sb.from('store_analytics').select('*').in('store_id', owned));
    const cur = readStore<Record<string, StoreAnalytics>>(STORE_KEYS.analytics, {});
    const next = { ...cur };
    for (const r of rows as Row[]) {
      next[r.store_id as string] = {
        storeVisits: r.store_visits as number,
        impressions: r.impressions as number,
        linkClicks: r.link_clicks as number,
        waChats: r.wa_chats as number,
        bookmarks: r.bookmarks as number,
      };
    }
    silent(STORE_KEYS.analytics, next);
  }
}

function resetUserData(): void {
  for (const k of USER_KEYS) silent(k, FALLBACK[k]);
}

async function onSignedIn(s: State, user: User): Promise<void> {
  if (s.userId === user.id) return;
  s.userId = user.id;
  const meta = user.user_metadata as Record<string, string | undefined>;
  const provider = (user.app_metadata?.provider as string | undefined) ?? 'email';
  silent(STORE_KEYS.session, {
    id: user.id,
    name: meta.name || meta.full_name || (user.email ?? 'Pengguna').split('@')[0],
    email: user.email ?? '',
    provider: provider === 'google' ? 'google' : 'email',
  });
  await loadPublic(s); // own posts and owned stores depend on who is signed in
  await loadUser(s, user);
}

async function onSignedOut(s: State): Promise<void> {
  const wasSignedIn = s.userId !== null;
  s.userId = null;
  silent(STORE_KEYS.session, null);
  if (wasSignedIn) resetUserData();
  await loadPublic(s);
}

/* ---------- Public API ---------- */

export function startCloudSync(client?: SupabaseClient | null): () => void {
  const sb = client ?? supabase();
  if (!sb || state) return () => undefined;
  const s: State = { sb, userId: null, cloudPostIds: new Set() };
  state = s;
  const offWrite = onStoreWrite(push);
  const { data } = sb.auth.onAuthStateChange((event, session) => {
    // Supabase warns against awaiting its own calls inside this callback.
    window.setTimeout(() => {
      const run = session?.user ? onSignedIn(s, session.user) : event === 'INITIAL_SESSION' || event === 'SIGNED_OUT' ? onSignedOut(s) : Promise.resolve();
      run.catch(report);
    }, 0);
  });
  return () => {
    offWrite();
    data.subscription.unsubscribe();
    state = null;
  };
}

export async function claimStore(storeId: string): Promise<boolean> {
  const s = state;
  if (!s?.userId) return false;
  const ok = await must(s.sb.rpc('claim_store', { p_store: storeId }));
  if (!ok) return false;
  silent(STORE_KEYS.stores, readStore<StoreProfile[]>(STORE_KEYS.stores, STORES).map((x) => (x.id === storeId ? { ...x, ownerId: s.userId } : x)));
  return true;
}

export async function submitReport(productId: string, reason: string): Promise<void> {
  const s = state;
  if (!s?.userId) return;
  await must(s.sb.from('product_reports').insert({ product_id: productId, reason: reason.slice(0, 500), user_id: s.userId }));
}
