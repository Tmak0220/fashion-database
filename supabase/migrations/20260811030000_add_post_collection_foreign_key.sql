-- Collections keep their slug for URLs; posts reference them by stable ID.
alter table public.collections add column if not exists brand_id bigint;

update public.collections c set brand_id = b.id
from public.brands b
where c.brand_id is null and c.brand_slug = b.slug;

update public.collections set season = lower(season)
where season <> lower(season);

-- Remove historical duplicates before assigning the globally unique slug.
-- Any existing post relation is restored by the backfill below.
delete from public.collections duplicate using public.collections canonical
where duplicate.id > canonical.id
  and duplicate.brand_id = canonical.brand_id
  and duplicate.year = canonical.year
  and duplicate.season = canonical.season;

-- collections.slug already has a global UNIQUE constraint, so include the
-- brand slug rather than using a repeated value such as 1995-ss.
update public.collections
set slug = concat(brand_slug, '-', year, '-', season)
where brand_id is not null;

do $$ begin
  alter table public.collections add constraint collections_brand_id_fkey
    foreign key (brand_id) references public.brands(id)
    on update cascade on delete cascade;
exception when duplicate_object then null; end $$;

alter table public.posts add column if not exists collection_id bigint;

do $$ begin
  alter table public.posts add constraint posts_collection_id_fkey
    foreign key (collection_id) references public.collections(id)
    on update cascade on delete set null;
exception when duplicate_object then null; end $$;

update public.posts p
set collection_id = (
  select min(c.id) from public.collections c
  where c.brand_id = p.brand_id and c.year = p.year
    and c.season = lower(p.season)
)
where p.collection_id is null
  and exists (
    select 1 from public.collections c
    where c.brand_id = p.brand_id and c.year = p.year
      and c.season = lower(p.season)
  );

create unique index if not exists collections_brand_year_season_unique
  on public.collections(brand_id, year, season);
create index if not exists posts_collection_id_idx on public.posts(collection_id);
