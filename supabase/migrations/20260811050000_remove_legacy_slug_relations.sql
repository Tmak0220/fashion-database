-- Abort rather than dropping compatibility columns when required relations
-- are still missing.
do $$
begin
  if exists (select 1 from public.collections where brand_id is null) then
    raise exception 'collections.brand_id still has null values';
  end if;
  if exists (select 1 from public.brand_follows where brand_id is null) then
    raise exception 'brand_follows.brand_id still has null values';
  end if;
  if exists (select 1 from public.designer_follows where designer_id is null) then
    raise exception 'designer_follows.designer_id still has null values';
  end if;
  if exists (select 1 from public.brand_designers where brand_id is null or designer_id is null) then
    raise exception 'brand_designers still has null entity IDs';
  end if;
end $$;

alter table public.collections alter column brand_id set not null;
alter table public.brand_follows alter column brand_id set not null;
alter table public.designer_follows alter column designer_id set not null;
alter table public.brand_designers alter column brand_id set not null;
alter table public.brand_designers alter column designer_id set not null;

create unique index if not exists brand_follows_user_brand_unique
  on public.brand_follows(user_id, brand_id);
create unique index if not exists designer_follows_user_designer_unique
  on public.designer_follows(user_id, designer_id);

-- Merging is now handled explicitly by the protected admin screen. Remove the
-- old automatic triggers because their functions wrote compatibility slugs.
drop trigger if exists reconcile_pending_brand_trigger on public.brands;
drop trigger if exists reconcile_pending_designer_trigger on public.designers;
drop function if exists public.reconcile_pending_brand();
drop function if exists public.reconcile_pending_designer();

alter table public.posts
  drop column if exists brand_slug,
  drop column if exists designer_slug,
  drop column if exists collection_slug,
  drop column if exists season_slug;

alter table public.collections drop column if exists brand_slug;
alter table public.brand_follows drop column if exists brand_slug;
alter table public.designer_follows drop column if exists designer_slug;
alter table public.brand_designers
  drop column if exists brand_slug,
  drop column if exists designer_slug;
