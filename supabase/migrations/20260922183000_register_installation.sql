create or replace function public.register_installation(p_installation_id text)
returns table (
  id uuid,
  username text,
  profile_photo_url text
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
    last_active_at
  )
  values (
    p_installation_id,
    now()
  )
  on conflict (installation_id) do update
    set last_active_at = excluded.last_active_at
  returning
    existing_user.id,
    existing_user.username,
    existing_user.profile_photo_url;
end;
$$;

revoke all on function public.register_installation(text) from public;
grant usage on schema public to anon;
grant execute on function public.register_installation(text) to anon;

notify pgrst, 'reload schema';
