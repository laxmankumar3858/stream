create table if not exists public.call_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  call_kind text not null check (call_kind in ('live', 'fallback')),
  reference_id uuid,
  peer_user_id uuid references public.users(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  coins_spent integer not null default 3 check (coins_spent >= 0),
  next_charge_at timestamptz not null default (now() + interval '30 seconds')
);

create index if not exists call_history_user_started_idx
  on public.call_history (user_id, started_at desc);

alter table public.call_history enable row level security;

create or replace function public.start_billed_call(
  p_installation_id text,
  p_call_kind text,
  p_reference_id uuid default null
)
returns table (call_id uuid, new_balance integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  current_peer_id uuid;
  created_call_id uuid;
  updated_balance integer;
begin
  if p_call_kind not in ('live', 'fallback') then
    raise exception 'INVALID_CALL_KIND';
  end if;

  select u.id into current_user_id
  from public.users u
  where u.installation_id = p_installation_id;

  if current_user_id is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  update public.users
  set coin_balance = coin_balance - 3,
      last_active_at = now()
  where id = current_user_id
    and coin_balance >= 3
  returning coin_balance into updated_balance;

  if updated_balance is null then
    raise exception 'INSUFFICIENT_BALANCE';
  end if;

  update public.call_history
  set ended_at = now(),
      duration_seconds = greatest(0, extract(epoch from (now() - started_at))::integer)
  where user_id = current_user_id
    and ended_at is null;

  if p_call_kind = 'live' then
    select mq.peer_user_id into current_peer_id
    from public.matchmaking_queue mq
    where mq.user_id = current_user_id
      and mq.room_id = p_reference_id;
  end if;

  insert into public.call_history (
    user_id,
    call_kind,
    reference_id,
    peer_user_id
  ) values (
    current_user_id,
    p_call_kind,
    p_reference_id,
    current_peer_id
  )
  returning id into created_call_id;

  delete from public.call_history history
  where history.user_id = current_user_id
    and history.id not in (
      select recent.id
      from public.call_history recent
      where recent.user_id = current_user_id
      order by recent.started_at desc, recent.id desc
      limit 5
    );

  return query select created_call_id, updated_balance;
end;
$$;

create or replace function public.charge_call_minute(
  p_installation_id text,
  p_call_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  due_at timestamptz;
  updated_balance integer;
begin
  select u.id into current_user_id
  from public.users u
  where u.installation_id = p_installation_id;

  select history.next_charge_at into due_at
  from public.call_history history
  where history.id = p_call_id
    and history.user_id = current_user_id
    and history.ended_at is null
  for update;

  if due_at is null then
    raise exception 'CALL_NOT_ACTIVE';
  end if;

  if now() < due_at then
    raise exception 'BILLING_TOO_EARLY';
  end if;

  update public.users
  set coin_balance = coin_balance - 5,
      last_active_at = now()
  where id = current_user_id
    and coin_balance >= 5
  returning coin_balance into updated_balance;

  if updated_balance is null then
    raise exception 'INSUFFICIENT_BALANCE';
  end if;

  update public.call_history
  set coins_spent = coins_spent + 5,
      next_charge_at = now() + interval '1 minute'
  where id = p_call_id;

  return updated_balance;
end;
$$;

create or replace function public.end_billed_call(
  p_installation_id text,
  p_call_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
begin
  select u.id into current_user_id
  from public.users u
  where u.installation_id = p_installation_id;

  update public.call_history
  set ended_at = coalesce(ended_at, now()),
      duration_seconds = case
        when ended_at is null then greatest(0, extract(epoch from (now() - started_at))::integer)
        else duration_seconds
      end
  where id = p_call_id
    and user_id = current_user_id;

  delete from public.call_history history
  where history.user_id = current_user_id
    and history.id not in (
      select recent.id
      from public.call_history recent
      where recent.user_id = current_user_id
      order by recent.started_at desc, recent.id desc
      limit 5
    );
end;
$$;

create or replace function public.get_recent_call_history(p_installation_id text)
returns table (
  id uuid,
  call_kind text,
  started_at timestamptz,
  duration_seconds integer,
  coins_spent integer,
  peer_name text
)
language sql
security definer
set search_path = ''
as $$
  select
    history.id,
    history.call_kind,
    history.started_at,
    case
      when history.ended_at is null
        then greatest(0, extract(epoch from (now() - history.started_at))::integer)
      else history.duration_seconds
    end,
    history.coins_spent,
    peer.username
  from public.users owner
  join public.call_history history on history.user_id = owner.id
  left join public.users peer on peer.id = history.peer_user_id
  where owner.installation_id = p_installation_id
  order by history.started_at desc, history.id desc
  limit 5;
$$;

revoke all on table public.call_history from anon, authenticated;
revoke all on function public.start_billed_call(text, text, uuid) from public;
revoke all on function public.charge_call_minute(text, uuid) from public;
revoke all on function public.end_billed_call(text, uuid) from public;
revoke all on function public.get_recent_call_history(text) from public;

grant execute on function public.start_billed_call(text, text, uuid) to anon;
grant execute on function public.charge_call_minute(text, uuid) to anon;
grant execute on function public.end_billed_call(text, uuid) to anon;
grant execute on function public.get_recent_call_history(text) to anon;
