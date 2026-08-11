-- Keep slugs on brands/designers for URLs, but use stable numeric IDs for relations.
alter table public.brands
  add column if not exists status text not null default 'published',
  add column if not exists normalized_name text;

alter table public.designers
  add column if not exists status text not null default 'published',
  add column if not exists normalized_name text;

alter table public.brands drop constraint if exists brands_status_check;
alter table public.brands add constraint brands_status_check
  check (status in ('pending', 'published'));
alter table public.designers drop constraint if exists designers_status_check;
alter table public.designers add constraint designers_status_check
  check (status in ('pending', 'published'));

create or replace function public.normalize_entity_name(value text)
returns text
language sql
immutable
parallel safe
as $$
  select lower(regexp_replace(coalesce(value, ''), '[[:space:]‐‑‒–—―ー・･_-]+', '', 'g'));
$$;

update public.brands
set normalized_name = public.normalize_entity_name(coalesce(name, name_ja, slug))
where normalized_name is null;

update public.designers
set normalized_name = public.normalize_entity_name(coalesce(name, name_ja, slug))
where normalized_name is null;

alter table public.posts
  add column if not exists brand_id bigint,
  add column if not exists designer_id bigint;

do $$ begin
  alter table public.posts add constraint posts_brand_id_fkey
    foreign key (brand_id) references public.brands(id)
    on update cascade on delete set null;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.posts add constraint posts_designer_id_fkey
    foreign key (designer_id) references public.designers(id)
    on update cascade on delete set null;
exception when duplicate_object then null; end $$;

update public.posts p set brand_id = b.id
from public.brands b
where p.brand_id is null and p.brand_slug = b.slug;

update public.posts p set designer_id = d.id
from public.designers d
where p.designer_id is null and p.designer_slug = d.slug;

create index if not exists posts_brand_id_idx on public.posts(brand_id);
create index if not exists posts_designer_id_idx on public.posts(designer_id);
create index if not exists brands_normalized_name_idx on public.brands(normalized_name);
create index if not exists designers_normalized_name_idx on public.designers(normalized_name);
create index if not exists brands_status_idx on public.brands(status);
create index if not exists designers_status_idx on public.designers(status);

-- If an official record is inserted after a pending record, move all post
-- relations to the official ID. Exact normalized matches only are automatic.
create or replace function public.reconcile_pending_brand()
returns trigger language plpgsql security definer set search_path = public as $$
declare pending_ids bigint[];
begin
  if new.status = 'published' then
    select array_agg(id) into pending_ids from public.brands
      where id <> new.id and status = 'pending' and normalized_name = new.normalized_name;
    if pending_ids is not null then
      update public.posts set brand_id = new.id, brand_slug = new.slug
        where brand_id = any(pending_ids);
      delete from public.brands where id = any(pending_ids);
    end if;
  end if;
  return new;
end $$;

create or replace function public.reconcile_pending_designer()
returns trigger language plpgsql security definer set search_path = public as $$
declare pending_ids bigint[];
begin
  if new.status = 'published' then
    select array_agg(id) into pending_ids from public.designers
      where id <> new.id and status = 'pending' and normalized_name = new.normalized_name;
    if pending_ids is not null then
      update public.posts set designer_id = new.id, designer_slug = new.slug
        where designer_id = any(pending_ids);
      delete from public.designers where id = any(pending_ids);
    end if;
  end if;
  return new;
end $$;

create or replace function public.set_brand_normalized_name()
returns trigger language plpgsql as $$
begin
  new.normalized_name := public.normalize_entity_name(coalesce(new.name, new.name_ja, new.slug));
  return new;
end $$;

create or replace function public.set_designer_normalized_name()
returns trigger language plpgsql as $$
begin
  new.normalized_name := public.normalize_entity_name(coalesce(new.name, new.name_ja, new.slug));
  return new;
end $$;

drop trigger if exists set_brand_normalized_name_trigger on public.brands;
create trigger set_brand_normalized_name_trigger before insert or update of name, name_ja, slug on public.brands
for each row execute function public.set_brand_normalized_name();

drop trigger if exists set_designer_normalized_name_trigger on public.designers;
create trigger set_designer_normalized_name_trigger before insert or update of name, name_ja, slug on public.designers
for each row execute function public.set_designer_normalized_name();

drop trigger if exists reconcile_pending_brand_trigger on public.brands;
create trigger reconcile_pending_brand_trigger after insert or update on public.brands
for each row execute function public.reconcile_pending_brand();

drop trigger if exists reconcile_pending_designer_trigger on public.designers;
create trigger reconcile_pending_designer_trigger after insert or update on public.designers
for each row execute function public.reconcile_pending_designer();
