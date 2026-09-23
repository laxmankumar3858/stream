alter table public.users
  add column if not exists free_chat_message_used boolean not null default false;

create or replace function public.charge_chat_message(p_installation_id text)
returns table (new_balance integer, was_charged boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_row public.users%rowtype;
  updated_balance integer;
begin
  select u.* into user_row
  from public.users u
  where u.installation_id = p_installation_id
  for update;

  if user_row.id is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  if not user_row.free_chat_message_used then
    update public.users
    set free_chat_message_used = true,
        last_active_at = now()
    where id = user_row.id
    returning coin_balance into updated_balance;

    return query select updated_balance, false;
    return;
  end if;

  update public.users
  set coin_balance = coin_balance - 1,
      last_active_at = now()
  where id = user_row.id
    and coin_balance >= 1
  returning coin_balance into updated_balance;

  if updated_balance is null then
    raise exception 'INSUFFICIENT_BALANCE';
  end if;

  return query select updated_balance, true;
end;
$$;

revoke all on function public.charge_chat_message(text) from public;
grant execute on function public.charge_chat_message(text) to anon;
