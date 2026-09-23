begin;

alter table public.users
  add column if not exists gender text;

alter table public.users
  drop constraint if exists users_gender_check;

alter table public.users
  add constraint users_gender_check
  check (gender in ('male', 'female'));

alter table public.videos
  alter column coin_cost set default 3;

create table if not exists public.matchmaking_queue (
  user_id uuid primary key references public.users(id) on delete cascade,
  gender text not null check (gender in ('male', 'female')),
  status text not null default 'waiting' check (status in ('waiting', 'matched')),
  peer_user_id uuid references public.users(id) on delete set null,
  room_id uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.call_signals (
  id bigint generated always as identity primary key,
  room_id uuid not null,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  signal_type text not null check (signal_type in ('offer', 'answer', 'candidate', 'hangup')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists call_signals_receiver_room_idx
  on public.call_signals(receiver_id, room_id, id);

alter table public.matchmaking_queue enable row level security;
alter table public.call_signals enable row level security;

drop function if exists public.register_installation(text);

create function public.register_installation(p_installation_id text)
returns table (
  id uuid,
  username text,
  profile_photo_url text,
  coin_balance integer,
  gender text
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
    existing_user.coin_balance,
    existing_user.gender;
end;
$$;

create or replace function public.set_user_gender(
  p_installation_id text,
  p_gender text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_gender text;
begin
  if p_gender not in ('male', 'female') then
    raise exception 'Invalid gender';
  end if;

  update public.users
  set gender = p_gender,
      last_active_at = now()
  where installation_id = p_installation_id
  returning gender into saved_gender;

  if saved_gender is null then
    raise exception 'User not found';
  end if;

  return saved_gender;
end;
$$;

create or replace function public.heartbeat_user(p_installation_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.users
  set last_active_at = now()
  where installation_id = p_installation_id;
$$;

create or replace function public.get_home_availability(p_installation_id text)
returns table (video_count bigint, active_user_count bigint)
language sql
security definer
set search_path = ''
as $$
  select
    (
      select count(*)
      from public.videos v
      join public.users me on me.installation_id = p_installation_id
      where v.is_active
        and v.category = case me.gender when 'male' then 'girls' else 'boys' end
    ) as video_count,
    (
      select count(*)
      from public.users u
      where u.installation_id <> p_installation_id
        and u.gender is not null
        and u.last_active_at > now() - interval '30 seconds'
    ) as active_user_count;
$$;

create or replace function public.get_fallback_videos(p_installation_id text)
returns table (id uuid, source_path text, coin_cost integer)
language sql
security definer
set search_path = ''
as $$
  select v.id, v.source_path, v.coin_cost
  from public.videos v
  join public.users me on me.installation_id = p_installation_id
  where v.is_active
    and me.gender is not null
    and v.category = case me.gender when 'male' then 'girls' else 'boys' end;
$$;

create or replace function public.charge_video_match(p_installation_id text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_balance integer;
begin
  update public.users
  set coin_balance = coin_balance - 3,
      last_active_at = now()
  where installation_id = p_installation_id
    and coin_balance >= 3
  returning coin_balance into new_balance;

  if new_balance is null then
    raise exception 'INSUFFICIENT_BALANCE';
  end if;

  return new_balance;
end;
$$;

create or replace function public.join_matchmaking(p_installation_id text)
returns table (room_id uuid, peer_user_id uuid, is_initiator boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  current_gender text;
  candidate_id uuid;
  new_room_id uuid;
begin
  select u.id, u.gender
  into current_user_id, current_gender
  from public.users u
  where u.installation_id = p_installation_id;

  if current_user_id is null or current_gender is null then
    raise exception 'User gender is required';
  end if;

  delete from public.matchmaking_queue mq
  where mq.updated_at < now() - interval '20 seconds';

  return query
  select mq.room_id, mq.peer_user_id,
         current_user_id::text < mq.peer_user_id::text
  from public.matchmaking_queue mq
  where mq.user_id = current_user_id
    and mq.status = 'matched';

  if found then
    return;
  end if;

  select mq.user_id
  into candidate_id
  from public.matchmaking_queue mq
  where mq.status = 'waiting'
    and mq.gender <> current_gender
    and mq.user_id <> current_user_id
  order by mq.updated_at
  for update skip locked
  limit 1;

  if candidate_id is null then
    insert into public.matchmaking_queue as queue (
      user_id, gender, status, peer_user_id, room_id, updated_at
    ) values (
      current_user_id, current_gender, 'waiting', null, null, now()
    )
    on conflict (user_id) do update
      set gender = excluded.gender,
          status = 'waiting',
          peer_user_id = null,
          room_id = null,
          updated_at = now();
    return;
  end if;

  new_room_id := gen_random_uuid();

  update public.matchmaking_queue
  set status = 'matched',
      peer_user_id = current_user_id,
      room_id = new_room_id,
      updated_at = now()
  where user_id = candidate_id;

  insert into public.matchmaking_queue as queue (
    user_id, gender, status, peer_user_id, room_id, updated_at
  ) values (
    current_user_id, current_gender, 'matched', candidate_id, new_room_id, now()
  )
  on conflict (user_id) do update
    set gender = excluded.gender,
        status = excluded.status,
        peer_user_id = excluded.peer_user_id,
        room_id = excluded.room_id,
        updated_at = now();

  return query
  select new_room_id, candidate_id,
         current_user_id::text < candidate_id::text;
end;
$$;

create or replace function public.poll_matchmaking(p_installation_id text)
returns table (room_id uuid, peer_user_id uuid, is_initiator boolean)
language sql
security definer
set search_path = ''
as $$
  select mq.room_id, mq.peer_user_id, u.id::text < mq.peer_user_id::text
  from public.users u
  join public.matchmaking_queue mq on mq.user_id = u.id
  where u.installation_id = p_installation_id
    and mq.status = 'matched'
    and mq.updated_at > now() - interval '20 seconds';
$$;

create or replace function public.leave_matchmaking(p_installation_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  current_peer_id uuid;
  current_room_id uuid;
begin
  select u.id into current_user_id
  from public.users u
  where u.installation_id = p_installation_id;

  select mq.peer_user_id, mq.room_id
  into current_peer_id, current_room_id
  from public.matchmaking_queue mq
  where mq.user_id = current_user_id;

  delete from public.matchmaking_queue
  where user_id = current_user_id;

  if current_peer_id is not null then
    update public.matchmaking_queue
    set status = 'waiting', peer_user_id = null, room_id = null, updated_at = now()
    where user_id = current_peer_id;
  end if;

  if current_room_id is not null then
    delete from public.call_signals
    where room_id = current_room_id
      and created_at < now() - interval '2 minutes';
  end if;
end;
$$;

create or replace function public.push_call_signal(
  p_installation_id text,
  p_room_id uuid,
  p_receiver_id uuid,
  p_signal_type text,
  p_payload jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  sender_user_id uuid;
  signal_id bigint;
begin
  if p_signal_type not in ('offer', 'answer', 'candidate', 'hangup') then
    raise exception 'Invalid signal type';
  end if;

  select u.id into sender_user_id
  from public.users u
  join public.matchmaking_queue mq on mq.user_id = u.id
  where u.installation_id = p_installation_id
    and mq.room_id = p_room_id
    and mq.peer_user_id = p_receiver_id;

  if sender_user_id is null then
    raise exception 'Invalid call room';
  end if;

  insert into public.call_signals (
    room_id, sender_id, receiver_id, signal_type, payload
  ) values (
    p_room_id, sender_user_id, p_receiver_id, p_signal_type, coalesce(p_payload, '{}'::jsonb)
  )
  returning id into signal_id;

  return signal_id;
end;
$$;

create or replace function public.pull_call_signals(
  p_installation_id text,
  p_room_id uuid,
  p_after_id bigint
)
returns table (id bigint, signal_type text, payload jsonb)
language sql
security definer
set search_path = ''
as $$
  select s.id, s.signal_type, s.payload
  from public.call_signals s
  join public.users u on u.id = s.receiver_id
  where u.installation_id = p_installation_id
    and s.room_id = p_room_id
    and s.id > p_after_id
  order by s.id;
$$;

revoke all on function public.register_installation(text) from public;
revoke all on function public.set_user_gender(text, text) from public;
revoke all on function public.heartbeat_user(text) from public;
revoke all on function public.get_home_availability(text) from public;
revoke all on function public.get_fallback_videos(text) from public;
revoke all on function public.charge_video_match(text) from public;
revoke all on function public.join_matchmaking(text) from public;
revoke all on function public.poll_matchmaking(text) from public;
revoke all on function public.leave_matchmaking(text) from public;
revoke all on function public.push_call_signal(text, uuid, uuid, text, jsonb) from public;
revoke all on function public.pull_call_signals(text, uuid, bigint) from public;

grant execute on function public.register_installation(text) to anon;
grant execute on function public.set_user_gender(text, text) to anon;
grant execute on function public.heartbeat_user(text) to anon;
grant execute on function public.get_home_availability(text) to anon;
grant execute on function public.get_fallback_videos(text) to anon;
grant execute on function public.charge_video_match(text) to anon;
grant execute on function public.join_matchmaking(text) to anon;
grant execute on function public.poll_matchmaking(text) to anon;
grant execute on function public.leave_matchmaking(text) to anon;
grant execute on function public.push_call_signal(text, uuid, uuid, text, jsonb) to anon;
grant execute on function public.pull_call_signals(text, uuid, bigint) to anon;

notify pgrst, 'reload schema';

commit;
