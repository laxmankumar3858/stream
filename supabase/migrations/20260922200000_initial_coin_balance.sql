begin;

alter table public.users
  alter column coin_balance set default 10;

-- This project is still pre-launch: give already-created anonymous rows the
-- same one-time starting balance as new installations.
update public.users
set coin_balance = 10
where coin_balance = 0;

drop function if exists public.register_installation(text);

create function public.register_installation(p_installation_id text)
returns table (
  id uuid,
  username text,
  profile_photo_url text,
  coin_balance integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_installation_id is null
    or btrim(p_installation_id) = ''
    or length(p_installation_id) > 128 then
    raise exception 'Invalid installation ID';
  end if;

  return query
  insert into public.users as existing_user (
    installation_id,
    coin_balance,
    last_active_at
  )
  values (
    p_installation_id,
    10,
    now()
  )
  on conflict (installation_id) do update
    set last_active_at = excluded.last_active_at
  returning
    existing_user.id,
    existing_user.username,
    existing_user.profile_photo_url,
    existing_user.coin_balance;
end;
$$;

revoke all on function public.register_installation(text) from public;
grant usage on schema public to anon;
grant execute on function public.register_installation(text) to anon;

notify pgrst, 'reload schema';

commit;
