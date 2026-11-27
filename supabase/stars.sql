-- ─────────────────────────────────────────────────────────────
-- LuJa Closet · Stars section (weekly stars + loser's challenge)
-- Run after setup.sql. Safe to run again.
-- ─────────────────────────────────────────────────────────────

-- a star one of you gives the other (week = the Sunday the week started, YYYY-MM-DD)
create table if not exists public.stars (
  id        text primary key,
  week      text not null,
  giver     text not null check (giver in ('jojo', 'lulu')),
  receiver  text not null check (receiver in ('jojo', 'lulu')),
  note      text,
  created   bigint not null,
  check (giver <> receiver)
);
create index if not exists stars_week on public.stars (week);

-- the challenge each of you sets for the loser of that week (id = week:account)
create table if not exists public.challenges (
  id       text primary key,
  week     text not null,
  by       text not null check (by in ('jojo', 'lulu')),
  text     text not null default '',
  done     boolean not null default false,
  updated  bigint not null
);

grant select, insert, update, delete on public.stars, public.challenges to authenticated;
alter table public.stars      enable row level security;
alter table public.challenges enable row level security;

drop policy if exists "read" on public.stars;
drop policy if exists "read" on public.challenges;
create policy "read" on public.stars      for select to authenticated using (public.my_account() is not null);
create policy "read" on public.challenges for select to authenticated using (public.my_account() is not null);

-- stars: you only give stars to the other person; take back your own, admin removes any
drop policy if exists "give to other" on public.stars;
drop policy if exists "take back own" on public.stars;
create policy "give to other" on public.stars for insert to authenticated
  with check (giver = public.my_account() and receiver <> giver);
create policy "take back own" on public.stars for delete to authenticated
  using (giver = public.my_account() or public.is_admin());

-- challenges: you write your own; either of you can tick "done"
drop policy if exists "write own" on public.challenges;
drop policy if exists "update" on public.challenges;
drop policy if exists "delete own or admin" on public.challenges;
create policy "write own" on public.challenges for insert to authenticated
  with check (by = public.my_account());
create policy "update" on public.challenges for update to authenticated
  using (public.my_account() is not null) with check (public.my_account() is not null);
create policy "delete own or admin" on public.challenges for delete to authenticated
  using (by = public.my_account() or public.is_admin());

do $$
declare t text;
begin
  for t in select unnest(array['stars','challenges']) loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

select tablename from pg_publication_tables where pubname = 'supabase_realtime' and tablename in ('stars', 'challenges');
