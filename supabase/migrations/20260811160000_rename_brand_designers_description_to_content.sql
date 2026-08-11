-- The text describes the history of a brand/designer relationship, so use the
-- same `content` name as the other historical-content tables.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_designers'
      and column_name = 'description'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_designers'
      and column_name = 'content'
  ) then
    alter table public.brand_designers rename column description to content;
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_designers'
      and column_name = 'description'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_designers'
      and column_name = 'content'
  ) then
    update public.brand_designers
    set content = coalesce(content, description);
    alter table public.brand_designers drop column description;
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_designers'
      and column_name = 'content'
  ) then
    alter table public.brand_designers add column content text;
  end if;
end $$;
