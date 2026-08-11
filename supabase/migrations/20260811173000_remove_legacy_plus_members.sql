-- plus_member is the canonical subscription flag used by the application.
-- Preserve any legacy true value before removing the duplicate plural column.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'plus_members'
  ) then
    update public.users
    set plus_member = coalesce(plus_member, false)
      or coalesce(plus_members, false);

    alter table public.users drop column plus_members;
  end if;
end
$$;

alter table public.users
  alter column plus_member set default false;

update public.users
set plus_member = false
where plus_member is null;

alter table public.users
  alter column plus_member set not null;
