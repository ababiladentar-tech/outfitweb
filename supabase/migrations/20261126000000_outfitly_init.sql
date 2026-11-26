-- Outfitly: schema, row level security, triggers, RPC, and storage buckets.
-- Run once in the Supabase SQL Editor (or `supabase db push`), then run seed.sql.

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  gender text not null default 'girl' check (gender in ('girl', 'boy')),
  skin_tone text not null default 'warm' check (skin_tone in ('cool', 'warm', 'neutral')),
  body_shape text not null default 'hourglass',
  face_shape text not null default 'oval',
  palette text[] not null default '{}',
  styles text[] not null default '{}',
  measurements jsonb not null default '{}'::jsonb,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Stores and products (public catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.stores (
  id text primary key default ('s_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  owner_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  city text not null default '',
  follower_count integer not null default 0 check (follower_count >= 0),
  contact_number text not null default '',
  bio text not null default '',
  story text not null default '',
  external_shop_url text,
  instagram text,
  seller_type text not null default 'umkm' check (seller_type in ('umkm', 'community_preloved', 'collab_mitra')),
  banner_hex text not null default '#C9B9A2',
  avatar_hex text not null default '#162D24',
  created_at timestamptz not null default now()
);
create index if not exists stores_owner_idx on public.stores (owner_id);

create table if not exists public.products (
  id text primary key,
  store_id text not null references public.stores (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  description text not null default '',
  category text not null check (category in ('top', 'pants', 'dress', 'outerwear', 'jeans', 'bag', 'shoes', 'hijab')),
  style text not null default 'casual',
  color_family text not null default 'Lainnya',
  color_hex text[] not null default '{}',
  price integer not null check (price >= 0),
  original_price integer check (original_price is null or original_price >= 0),
  condition text not null default 'new' check (condition in ('new', 'like_new', 'very_good', 'good')),
  is_one_of_a_kind boolean not null default false,
  stock_count integer not null default 0 check (stock_count >= 0),
  is_available boolean not null default true,
  available_sizes jsonb not null default '[]'::jsonb,
  image_url text not null default '',
  material text,
  stretch boolean not null default false,
  external_link text,
  likes integer not null default 0,
  saves integer not null default 0,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists products_store_idx on public.products (store_id);
create index if not exists products_created_idx on public.products (created_at desc);

create table if not exists public.product_comments (
  id text primary key,
  product_id text not null references public.products (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author text not null default '',
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists comments_product_idx on public.product_comments (product_id);

create table if not exists public.store_analytics (
  store_id text primary key references public.stores (id) on delete cascade,
  store_visits integer not null default 0,
  impressions integer not null default 0,
  link_clicks integer not null default 0,
  wa_chats integer not null default 0,
  bookmarks integer not null default 0
);

create table if not exists public.product_reports (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id) on delete cascade,
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  reason text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Per-user data
-- ---------------------------------------------------------------------------
create table if not exists public.wardrobe_items (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  category text not null check (category in ('tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'bags', 'accessories')),
  image_url text not null default '',
  color text not null default '',
  color_hex text not null default '#888888',
  style text not null default 'casual',
  size_label text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists wardrobe_user_idx on public.wardrobe_items (user_id);

create table if not exists public.saved_outfits (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  mode text not null check (mode in ('wardrobe', 'umkm', 'hybrid')),
  occasion text not null,
  pieces jsonb not null default '[]'::jsonb,
  total_price integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists outfits_user_idx on public.saved_outfits (user_id);

create table if not exists public.chat_sessions (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null default '',
  mode text not null default 'ringkas' check (mode in ('ringkas', 'lengkap')),
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists chats_user_idx on public.chat_sessions (user_id, updated_at desc);

create table if not exists public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.bookmarks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.follows (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  store_id text not null references public.stores (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, store_id)
);

create table if not exists public.community_posts (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author text not null default '',
  city text not null default '',
  caption text not null check (char_length(caption) between 1 and 600),
  occasion text not null default '',
  product_ids text[] not null default '{}',
  pieces jsonb,
  palette_hex text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists posts_created_idx on public.community_posts (created_at desc);

create table if not exists public.community_likes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  post_id text not null references public.community_posts (id) on delete cascade,
  primary key (user_id, post_id)
);

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  used integer not null default 0,
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------------
-- Counters kept by triggers (clients never write them directly)
-- ---------------------------------------------------------------------------
create or replace function public.bump_product_counter()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  col text := case when tg_table_name = 'favorites' then 'likes' else 'saves' end;
  pid text := coalesce(new.product_id, old.product_id);
  delta int := case when tg_op = 'INSERT' then 1 else -1 end;
begin
  execute format('update public.products set %I = greatest(0, %I + $1) where id = $2', col, col) using delta, pid;
  return null;
end $$;

drop trigger if exists favorites_count on public.favorites;
create trigger favorites_count after insert or delete on public.favorites
  for each row execute function public.bump_product_counter();
drop trigger if exists bookmarks_count on public.bookmarks;
create trigger bookmarks_count after insert or delete on public.bookmarks
  for each row execute function public.bump_product_counter();

create or replace function public.bump_follower_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.stores
     set follower_count = greatest(0, follower_count + case when tg_op = 'INSERT' then 1 else -1 end)
   where id = coalesce(new.store_id, old.store_id);
  return null;
end $$;

drop trigger if exists follows_count on public.follows;
create trigger follows_count after insert or delete on public.follows
  for each row execute function public.bump_follower_count();

-- Store owners cannot rewrite their own like/save counts.
create or replace function public.keep_product_counters()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.likes := 0;
    new.saves := 0;
  else
    new.likes := old.likes;
    new.saves := old.saves;
  end if;
  return new;
end $$;

drop trigger if exists products_counters on public.products;
create trigger products_counters before insert or update on public.products
  for each row when (current_user = 'authenticated')
  execute function public.keep_product_counters();

-- ---------------------------------------------------------------------------
-- RPC
-- ---------------------------------------------------------------------------
create or replace function public.track_store_event(p_store text, p_field text, p_by integer default 1)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_field not in ('store_visits', 'impressions', 'link_clicks', 'wa_chats', 'bookmarks') then
    raise exception 'invalid field %', p_field;
  end if;
  if p_by < 1 or p_by > 20 then
    raise exception 'invalid amount';
  end if;
  insert into public.store_analytics (store_id) values (p_store) on conflict (store_id) do nothing;
  execute format('update public.store_analytics set %I = %I + $1 where store_id = $2', p_field, p_field) using p_by, p_store;
end $$;

-- A signed-in seller takes over an unclaimed demo store.
create or replace function public.claim_store(p_store text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  ok boolean;
begin
  if auth.uid() is null then
    return false;
  end if;
  update public.stores set owner_id = auth.uid() where id = p_store and owner_id is null returning true into ok;
  return coalesce(ok, false);
end $$;

-- Counts one model-backed stylist consultation. Returns remaining quota, or -1 when used up.
create or replace function public.consume_ai_quota(p_limit integer default 10)
returns integer language plpgsql security definer set search_path = public as $$
declare
  n integer;
begin
  if auth.uid() is null then
    return -1;
  end if;
  insert into public.ai_usage (user_id, day, used) values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set used = public.ai_usage.used + 1
    where public.ai_usage.used < p_limit
  returning used into n;
  if n is null then
    return -1;
  end if;
  return p_limit - n;
end $$;

revoke all on function public.track_store_event(text, text, integer) from public;
grant execute on function public.track_store_event(text, text, integer) to anon, authenticated;
revoke all on function public.claim_store(text) from public;
grant execute on function public.claim_store(text) to authenticated;
revoke all on function public.consume_ai_quota(integer) from public;
grant execute on function public.consume_ai_quota(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.product_comments enable row level security;
alter table public.store_analytics enable row level security;
alter table public.product_reports enable row level security;
alter table public.wardrobe_items enable row level security;
alter table public.saved_outfits enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.favorites enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_likes enable row level security;
alter table public.ai_usage enable row level security;

-- Profiles: only the owner.
drop policy if exists "profile self read" on public.profiles;
create policy "profile self read" on public.profiles for select using (id = auth.uid());
drop policy if exists "profile self write" on public.profiles;
create policy "profile self write" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "profile self update" on public.profiles;
create policy "profile self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Stores: public read, owner writes.
drop policy if exists "stores read" on public.stores;
create policy "stores read" on public.stores for select using (true);
drop policy if exists "stores create" on public.stores;
create policy "stores create" on public.stores for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "stores update" on public.stores;
create policy "stores update" on public.stores for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "stores delete" on public.stores;
create policy "stores delete" on public.stores for delete to authenticated using (owner_id = auth.uid());

-- Products: public read, store owner writes.
drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select using (true);
drop policy if exists "products write" on public.products;
create policy "products write" on public.products for all to authenticated
  using (exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid()));

-- Comments: public read, signed-in users post and delete their own.
drop policy if exists "comments read" on public.product_comments;
create policy "comments read" on public.product_comments for select using (true);
drop policy if exists "comments create" on public.product_comments;
create policy "comments create" on public.product_comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "comments delete" on public.product_comments;
create policy "comments delete" on public.product_comments for delete to authenticated using (user_id = auth.uid());

-- Analytics: only the store owner reads; writes go through track_store_event.
drop policy if exists "analytics owner read" on public.store_analytics;
create policy "analytics owner read" on public.store_analytics for select to authenticated
  using (exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid()));

-- Reports: anyone signed in can file one; nobody reads them from the client.
drop policy if exists "reports create" on public.product_reports;
create policy "reports create" on public.product_reports for insert to authenticated with check (user_id = auth.uid());

-- Private per-user tables.
drop policy if exists "wardrobe own" on public.wardrobe_items;
create policy "wardrobe own" on public.wardrobe_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "outfits own" on public.saved_outfits;
create policy "outfits own" on public.saved_outfits for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "chats own" on public.chat_sessions;
create policy "chats own" on public.chat_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "favorites own" on public.favorites;
create policy "favorites own" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "bookmarks own" on public.bookmarks;
create policy "bookmarks own" on public.bookmarks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "follows own" on public.follows;
create policy "follows own" on public.follows for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "ai usage own" on public.ai_usage;
create policy "ai usage own" on public.ai_usage for select to authenticated using (user_id = auth.uid());

-- Community: public read, authors write their own.
drop policy if exists "posts read" on public.community_posts;
create policy "posts read" on public.community_posts for select using (true);
drop policy if exists "posts create" on public.community_posts;
create policy "posts create" on public.community_posts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "posts delete" on public.community_posts;
create policy "posts delete" on public.community_posts for delete to authenticated using (user_id = auth.uid());
drop policy if exists "likes read" on public.community_likes;
create policy "likes read" on public.community_likes for select using (true);
drop policy if exists "likes own" on public.community_likes;
create policy "likes own" on public.community_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "likes delete" on public.community_likes;
create policy "likes delete" on public.community_likes for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: product photos and wardrobe photos (public read)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('wardrobe', 'wardrobe', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Wardrobe photos live under <user id>/...
drop policy if exists "wardrobe photos write" on storage.objects;
create policy "wardrobe photos write" on storage.objects for insert to authenticated
  with check (bucket_id = 'wardrobe' and (storage.foldername(objects.name))[1] = auth.uid()::text);
drop policy if exists "wardrobe photos update" on storage.objects;
create policy "wardrobe photos update" on storage.objects for update to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(objects.name))[1] = auth.uid()::text);
drop policy if exists "wardrobe photos delete" on storage.objects;
create policy "wardrobe photos delete" on storage.objects for delete to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(objects.name))[1] = auth.uid()::text);

-- Product photos live under <store id>/... and only that store's owner writes them.
drop policy if exists "product photos write" on storage.objects;
create policy "product photos write" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and exists (select 1 from public.stores s where s.id = (storage.foldername(objects.name))[1] and s.owner_id = auth.uid()));
drop policy if exists "product photos update" on storage.objects;
create policy "product photos update" on storage.objects for update to authenticated
  using (bucket_id = 'products' and exists (select 1 from public.stores s where s.id = (storage.foldername(objects.name))[1] and s.owner_id = auth.uid()));
drop policy if exists "product photos delete" on storage.objects;
create policy "product photos delete" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and exists (select 1 from public.stores s where s.id = (storage.foldername(objects.name))[1] and s.owner_id = auth.uid()));

-- Upserts (re-uploading a photo) need to see the existing object.
drop policy if exists "wardrobe photos read" on storage.objects;
create policy "wardrobe photos read" on storage.objects for select to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(objects.name))[1] = auth.uid()::text);
drop policy if exists "product photos read" on storage.objects;
create policy "product photos read" on storage.objects for select using (bucket_id = 'products');
