-- Account roles: Pengguna (shopper) or Mitra Penjual (seller who can also shop).
-- Safe to re-run.

alter table public.profiles
  add column if not exists role text not null default 'pengguna';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('pengguna', 'mitra'));

-- New accounts take the role picked in the sign-up form (sent as user metadata).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    case when new.raw_user_meta_data ->> 'role' = 'mitra' then 'mitra' else 'pengguna' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Only a Mitra Penjual may open or claim a store.
drop policy if exists "stores create" on public.stores;
create policy "stores create" on public.stores for insert to authenticated
  with check (owner_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'mitra'));

create or replace function public.claim_store(p_store text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  ok boolean;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'mitra') then
    return false;
  end if;
  update public.stores set owner_id = auth.uid() where id = p_store and owner_id is null returning true into ok;
  return coalesce(ok, false);
end $$;
