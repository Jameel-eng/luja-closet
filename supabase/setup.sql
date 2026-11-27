-- ─────────────────────────────────────────────────────────────
-- LuJa Closet · Supabase setup
-- Run this ONCE in Supabase → SQL Editor → New query → Run.
-- Before running: create the two users in Authentication → Users → Add user
--   jojo@luja.app   (Jamil)   — tick "Auto Confirm User"
--   lulu@luja.app   (Lupita)  — tick "Auto Confirm User"
-- Safe to run again; it only adds what is missing.
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── profiles: the two accounts ──────────────────────────────
create table if not exists public.profiles (
  account   text primary key check (account in ('jojo', 'lulu')),
  user_id   uuid unique references auth.users (id) on delete set null,
  username  text not null,
  owner     text not null check (owner in ('jamil', 'lupita')),
  is_admin  boolean not null default false
);
create unique index if not exists profiles_username_ci on public.profiles (lower(username));

insert into public.profiles (account, user_id, username, owner, is_admin)
select 'jojo', (select id from auth.users where email = 'jojo@luja.app'), 'JoJo', 'jamil', true
on conflict (account) do update set user_id = excluded.user_id;
insert into public.profiles (account, user_id, username, owner, is_admin)
select 'lulu', (select id from auth.users where email = 'lulu@luja.app'), 'LuLu', 'lupita', false
on conflict (account) do update set user_id = excluded.user_id;

-- helpers used by the security rules
create or replace function public.my_account() returns text
language sql stable security definer set search_path = public as
$$ select account from public.profiles where user_id = auth.uid() $$;

create or replace function public.my_owner() returns text
language sql stable security definer set search_path = public as
$$ select owner from public.profiles where user_id = auth.uid() $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select is_admin from public.profiles where user_id = auth.uid()), false) $$;

-- login screen: username → account key (works before signing in)
create or replace function public.account_for_username(uname text) returns text
language sql stable security definer set search_path = public as
$$ select account from public.profiles where lower(username) = lower(trim(uname)) $$;
grant execute on function public.account_for_username(text) to anon, authenticated;

-- admin (or yourself) sets a password; signs that account out on other phones
create or replace function public.set_account_password(target text, new_password text) returns void
language plpgsql security definer set search_path = public, auth, extensions as
$$
declare uid uuid;
begin
  if not (public.is_admin() or public.my_account() = target) then raise exception 'not allowed'; end if;
  if length(new_password) < 6 then raise exception 'password too short'; end if;
  select user_id into uid from public.profiles where account = target;
  if uid is null then raise exception 'unknown account'; end if;
  update auth.users set encrypted_password = crypt(new_password, gen_salt('bf')), updated_at = now() where id = uid;
  if uid <> auth.uid() then delete from auth.sessions where user_id = uid; end if;
end $$;
grant execute on function public.set_account_password(text, text) to authenticated;

-- ── data tables ─────────────────────────────────────────────
create table if not exists public.items (
  id        text primary key,
  owner     text not null check (owner in ('jamil', 'lupita')),
  cat       text not null,
  name      text not null,
  color     text not null,
  pattern   text not null default 'solid',
  occ       text[] not null default '{}',
  img_path  text,
  created   bigint not null
);
create table if not exists public.looks (
  id       text primary key,
  type     text not null,
  owner    text,
  occ      text not null,
  ids      text[] not null default '{}',
  jids     text[],
  score    double precision,
  style    text,
  created  bigint not null
);
create table if not exists public.daily (
  id        text primary key,
  by        text not null check (by in ('jojo', 'lulu')),
  date      text not null,
  occ       text,
  note      text,
  img_path  text,
  created   bigint not null
);
create table if not exists public.ratings (
  daily_id  text not null references public.daily (id) on delete cascade,
  rater     text not null check (rater in ('jojo', 'lulu')),
  stars     int not null check (stars between 1 and 5),
  primary key (daily_id, rater)
);

-- the app talks to these tables through the Data API (rules below still apply)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.items, public.looks, public.daily, public.ratings to authenticated;
grant execute on function public.my_account(), public.my_owner(), public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.items    enable row level security;
alter table public.looks    enable row level security;
alter table public.daily    enable row level security;
alter table public.ratings  enable row level security;

-- ── security rules (only JoJo & LuLu ever see anything) ─────
do $$
declare t text;
begin
  for t in select unnest(array['profiles','items','looks','daily','ratings']) loop
    execute format('drop policy if exists "read" on public.%I', t);
    execute format('create policy "read" on public.%I for select to authenticated using (public.my_account() is not null)', t);
  end loop;
end $$;

drop policy if exists "admin edits profiles" on public.profiles;
create policy "admin edits profiles" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- clothes: you add/edit your own closet; delete your own, admin deletes anything
drop policy if exists "add own" on public.items;
drop policy if exists "edit own" on public.items;
drop policy if exists "delete own or admin" on public.items;
create policy "add own" on public.items for insert to authenticated
  with check (owner = public.my_owner() or public.is_admin());
create policy "edit own" on public.items for update to authenticated
  using (owner = public.my_owner() or public.is_admin()) with check (owner = public.my_owner() or public.is_admin());
create policy "delete own or admin" on public.items for delete to authenticated
  using (owner = public.my_owner() or public.is_admin());

-- saved looks are shared by both
drop policy if exists "write" on public.looks;
create policy "write" on public.looks for all to authenticated
  using (public.my_account() is not null) with check (public.my_account() is not null);

-- daily: post/edit your own; delete your own, admin deletes anything
drop policy if exists "post own" on public.daily;
drop policy if exists "edit own" on public.daily;
drop policy if exists "delete own or admin" on public.daily;
create policy "post own" on public.daily for insert to authenticated with check (by = public.my_account() or public.is_admin());
create policy "edit own" on public.daily for update to authenticated
  using (by = public.my_account()) with check (by = public.my_account());
create policy "delete own or admin" on public.daily for delete to authenticated
  using (by = public.my_account() or public.is_admin());

-- ratings: you rate the OTHER person's posts only
drop policy if exists "rate others" on public.ratings;
drop policy if exists "change own rating" on public.ratings;
drop policy if exists "remove rating" on public.ratings;
create policy "rate others" on public.ratings for insert to authenticated
  with check (rater = public.my_account() and exists (select 1 from public.daily d where d.id = daily_id and d.by <> rater));
create policy "change own rating" on public.ratings for update to authenticated
  using (rater = public.my_account()) with check (rater = public.my_account());
create policy "remove rating" on public.ratings for delete to authenticated
  using (rater = public.my_account() or public.is_admin());

-- ── photos (private bucket, folder per account) ─────────────
insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "luja read photos" on storage.objects;
drop policy if exists "luja upload photos" on storage.objects;
drop policy if exists "luja update photos" on storage.objects;
drop policy if exists "luja delete photos" on storage.objects;
create policy "luja read photos" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.my_account() is not null);
create policy "luja upload photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and ((storage.foldername(name))[1] = public.my_account() or public.is_admin()));
create policy "luja update photos" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and ((storage.foldername(name))[1] = public.my_account() or public.is_admin()));
create policy "luja delete photos" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and ((storage.foldername(name))[1] = public.my_account() or public.is_admin()));

-- ── live updates ────────────────────────────────────────────
do $$
declare t text;
begin
  for t in select unnest(array['profiles','items','looks','daily','ratings']) loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- quick check: both rows should show a user_id
select account, username, user_id is not null as linked from public.profiles order by account;
