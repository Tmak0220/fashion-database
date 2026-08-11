-- Public profile fields live in profiles. Account/billing fields remain in users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on update cascade on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (id, username, display_name, bio, avatar_url, created_at, updated_at)
select id, username, display_name, bio, avatar_url,
       coalesce(created_at, now()), coalesce(updated_at, now())
from public.users
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  bio = excluded.bio,
  avatar_url = excluded.avatar_url,
  updated_at = excluded.updated_at;

-- Ensure the private account row is removed with its Auth identity.
do $$ begin
  alter table public.users add constraint users_auth_user_id_fkey
    foreign key (id) references auth.users(id)
    on update cascade on delete cascade;
exception when duplicate_object then null; end $$;

-- Point all user-owned/public relationships at profiles and cascade deletion.
do $$
declare
  mapping record;
  foreign_key record;
  column_number smallint;
begin
  for mapping in
    select * from (values
      ('posts', 'user_id', 'posts_user_id_fkey', 'profiles', 'id'),
      ('bookmarks', 'user_id', 'bookmarks_user_id_fkey', 'profiles', 'id'),
      ('brand_follows', 'user_id', 'brand_follows_user_id_fkey', 'profiles', 'id'),
      ('designer_follows', 'user_id', 'designer_follows_user_id_fkey', 'profiles', 'id'),
      ('likes', 'user_id', 'likes_user_id_fkey', 'profiles', 'id'),
      ('follows', 'follower_id', 'follows_follower_id_fkey', 'profiles', 'id'),
      ('follows', 'following_id', 'follows_following_id_fkey', 'profiles', 'id'),
      ('bookmarks', 'post_id', 'bookmarks_post_id_fkey', 'posts', 'id'),
      ('likes', 'post_id', 'likes_post_id_fkey', 'posts', 'id'),
      ('post_tags', 'post_id', 'post_tags_post_id_fkey', 'posts', 'id')
    ) as values_table(table_name, column_name, constraint_name, target_table, target_column)
  loop
    select attribute.attnum into column_number
    from pg_attribute attribute
    where attribute.attrelid = to_regclass(format('public.%I', mapping.table_name))
      and attribute.attname = mapping.column_name
      and not attribute.attisdropped;

    for foreign_key in
      select constraint_row.conname
      from pg_constraint constraint_row
      where constraint_row.conrelid = to_regclass(format('public.%I', mapping.table_name))
        and constraint_row.contype = 'f'
        and column_number = any(constraint_row.conkey)
    loop
      execute format(
        'alter table public.%I drop constraint %I',
        mapping.table_name,
        foreign_key.conname
      );
    end loop;

    execute format(
      'alter table public.%I add constraint %I foreign key (%I) references public.%I(%I) on update cascade on delete cascade',
      mapping.table_name,
      mapping.constraint_name,
      mapping.column_name,
      mapping.target_table,
      mapping.target_column
    );
  end loop;
end $$;

-- Keep account rows in sync for future Auth sign-ups.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, created_at, updated_at)
  values (new.id, new.email, now(), now())
  on conflict (id) do update set
    email = excluded.email,
    updated_at = excluded.updated_at;

  insert into public.profiles (id, created_at, updated_at)
  values (new.id, now(), now())
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists sync_public_account_on_auth_user_created on auth.users;
create trigger sync_public_account_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Remove old policies and define the public/private boundary explicitly.
do $$
declare policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename in ('profiles', 'users')
  loop
    execute format('drop policy if exists %I on %I.%I',
      policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.users enable row level security;

create policy "Public can read profiles"
on public.profiles for select to anon, authenticated using (true);
create policy "Users can insert own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy "Users can update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can read own account"
on public.users for select to authenticated
using ((select auth.uid()) = id);
create policy "Users can insert own account"
on public.users for insert to authenticated
with check ((select auth.uid()) = id);
create policy "Users can update own account"
on public.users for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke all on public.profiles, public.users from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, update on public.users to authenticated;
grant select, insert, update, delete on public.profiles, public.users to service_role;

-- Profile data is now copied and consumed from profiles.
alter table public.users
  drop column if exists username,
  drop column if exists display_name,
  drop column if exists bio,
  drop column if exists avatar_url,
  drop column if exists is_active;

create index if not exists profiles_username_idx on public.profiles(username);
