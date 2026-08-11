alter table public.brand_follows add column if not exists brand_id bigint;
alter table public.designer_follows add column if not exists designer_id bigint;
alter table public.brand_designers add column if not exists brand_id bigint;
alter table public.brand_designers add column if not exists designer_id bigint;
alter table public.collections add column if not exists designer_id bigint;

update public.collections c set designer_id = (
  select p.designer_id from public.posts p
  where p.collection_id = c.id and p.designer_id is not null
  group by p.designer_id order by count(*) desc limit 1
)
where c.designer_id is null;

update public.brand_follows f set brand_id = b.id from public.brands b
where f.brand_id is null and f.brand_slug = b.slug;
update public.designer_follows f set designer_id = d.id from public.designers d
where f.designer_id is null and f.designer_slug = d.slug;
update public.brand_designers bd set brand_id = b.id from public.brands b
where bd.brand_id is null and bd.brand_slug = b.slug;
update public.brand_designers bd set designer_id = d.id from public.designers d
where bd.designer_id is null and bd.designer_slug = d.slug;

do $$ begin alter table public.brand_follows add constraint brand_follows_brand_id_fkey
  foreign key (brand_id) references public.brands(id) on update cascade on delete cascade;
exception when duplicate_object then null; end $$;
do $$ begin alter table public.designer_follows add constraint designer_follows_designer_id_fkey
  foreign key (designer_id) references public.designers(id) on update cascade on delete cascade;
exception when duplicate_object then null; end $$;
do $$ begin alter table public.brand_designers add constraint brand_designers_brand_id_fkey
  foreign key (brand_id) references public.brands(id) on update cascade on delete cascade;
exception when duplicate_object then null; end $$;
do $$ begin alter table public.brand_designers add constraint brand_designers_designer_id_fkey
  foreign key (designer_id) references public.designers(id) on update cascade on delete cascade;
exception when duplicate_object then null; end $$;
do $$ begin alter table public.collections add constraint collections_designer_id_fkey
  foreign key (designer_id) references public.designers(id) on update cascade on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists brand_follows_brand_id_idx on public.brand_follows(brand_id);
create index if not exists designer_follows_designer_id_idx on public.designer_follows(designer_id);
create index if not exists brand_designers_brand_id_idx on public.brand_designers(brand_id);
create index if not exists brand_designers_designer_id_idx on public.brand_designers(designer_id);
create index if not exists collections_designer_id_idx on public.collections(designer_id);
