import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../lib/supabase';

const RECENT_VIDEO_KEY = '@stream/recent_fallback_videos';
const RECENT_VIDEO_TTL_MS = 24 * 60 * 60 * 1000;

export interface FallbackVideo {
  id: string;
  sourcePath: string;
  playbackUrl: string;
  coinCost: number;
}

interface FallbackVideoRow {
  id: string;
  source_path: string;
  coin_cost: number;
}

interface RecentVideo {
  id: string;
  shownAt: number;
}

export interface MatchRoom {
  roomId: string;
  peerUserId: string;
  isInitiator: boolean;
}

interface MatchRoomRow {
  room_id: string;
  peer_user_id: string;
  is_initiator: boolean;
}

export interface CallSignal {
  id: number;
  signalType: 'offer' | 'answer' | 'candidate' | 'hangup';
  payload: Record<string, unknown>;
}

export type CallKind = 'live' | 'fallback';

export interface BilledCall {
  callId: string;
  newBalance: number;
}

export interface CallHistoryItem {
  id: string;
  callKind: CallKind;
  startedAt: string;
  durationSeconds: number;
  coinsSpent: number;
  peerName: string | null;
}

interface BilledCallRow {
  call_id: string;
  new_balance: number;
}

interface CallHistoryRow {
  id: string;
  call_kind: CallKind;
  started_at: string;
  duration_seconds: number;
  coins_spent: number;
  peer_name: string | null;
}

interface CallSignalRow {
  id: number;
  signal_type: CallSignal['signalType'];
  payload: Record<string, unknown>;
}

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase URL is not configured.');
  }

  return supabase;
};

const resolvePlaybackUrl = (sourcePath: string): string => {
  if (/^https?:\/\//i.test(sourcePath)) {
    return sourcePath;
  }

  const normalizedPath = sourcePath.replace(/^\/+/, '');
  const storagePath = normalizedPath.startsWith('videos/')
    ? normalizedPath.slice('videos/'.length)
    : normalizedPath;

  return requireSupabase().storage.from('videos').getPublicUrl(storagePath).data
    .publicUrl;
};

export const heartbeatUser = async (deviceId: string): Promise<void> => {
  const {error} = await requireSupabase().rpc('heartbeat_user', {
    p_installation_id: deviceId,
  });

  if (error) {
    throw error;
  }
};

export const getHomeAvailability = async (
  deviceId: string,
): Promise<{videoCount: number; activeUserCount: number}> => {
  const {data, error} = await requireSupabase()
    .rpc('get_home_availability', {p_installation_id: deviceId})
    .single<{video_count: number; active_user_count: number}>();

  if (error) {
    throw error;
  }

  return {
    videoCount: Number(data.video_count ?? 0),
    activeUserCount: Number(data.active_user_count ?? 0),
  };
};

export const pickUnseenFallbackVideo = async (
  deviceId: string,
): Promise<FallbackVideo | null> => {
  const client = requireSupabase();
  const {data, error} = await client.rpc('get_fallback_videos', {
    p_installation_id: deviceId,
  });

  if (error) {
    throw error;
  }

  const videos = (data ?? []) as FallbackVideoRow[];
  if (videos.length === 0) {
    return null;
  }

  const now = Date.now();
  let recent: RecentVideo[] = [];

  try {
    const stored = await AsyncStorage.getItem(RECENT_VIDEO_KEY);
    recent = stored ? (JSON.parse(stored) as RecentVideo[]) : [];
  } catch {
    recent = [];
  }

  const validRecent = recent.filter(item => now - item.shownAt < RECENT_VIDEO_TTL_MS);
  const recentIds = new Set(validRecent.map(item => item.id));
  const unseenVideos = videos.filter(video => !recentIds.has(video.id));

  if (unseenVideos.length === 0) {
    await AsyncStorage.setItem(RECENT_VIDEO_KEY, JSON.stringify(validRecent));
    return null;
  }

  const selected = unseenVideos[Math.floor(Math.random() * unseenVideos.length)];
  await AsyncStorage.setItem(
    RECENT_VIDEO_KEY,
    JSON.stringify([...validRecent, {id: selected.id, shownAt: now}]),
  );

  return {
    id: selected.id,
    sourcePath: selected.source_path,
    playbackUrl: resolvePlaybackUrl(selected.source_path),
    coinCost: selected.coin_cost,
  };
};

export const startBilledCall = async (
  deviceId: string,
  callKind: CallKind,
  referenceId: string | null,
): Promise<BilledCall> => {
  const {data, error} = await requireSupabase()
    .rpc('start_billed_call', {
      p_installation_id: deviceId,
      p_call_kind: callKind,
      p_reference_id: referenceId,
    })
    .single<BilledCallRow>();

  if (error) {
    throw error;
  }

  return {
    callId: data.call_id,
    newBalance: Number(data.new_balance),
  };
};

export const chargeCallMinute = async (
  deviceId: string,
  callId: string,
): Promise<number> => {
  const {data, error} = await requireSupabase().rpc('charge_call_minute', {
    p_installation_id: deviceId,
    p_call_id: callId,
  });

  if (error) {
    throw error;
  }

  return Number(data);
};

export const endBilledCall = async (
  deviceId: string,
  callId: string,
): Promise<void> => {
  const {error} = await requireSupabase().rpc('end_billed_call', {
    p_installation_id: deviceId,
    p_call_id: callId,
  });

  if (error) {
    throw error;
  }
};

export const getRecentCallHistory = async (
  deviceId: string,
): Promise<CallHistoryItem[]> => {
  const {data, error} = await requireSupabase().rpc('get_recent_call_history', {
    p_installation_id: deviceId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as CallHistoryRow[]).slice(0, 5).map(row => ({
    id: row.id,
    callKind: row.call_kind,
    startedAt: row.started_at,
    durationSeconds: Number(row.duration_seconds ?? 0),
    coinsSpent: Number(row.coins_spent ?? 0),
    peerName: row.peer_name,
  }));
};

const mapRoom = (row: MatchRoomRow | null): MatchRoom | null =>
  row
    ? {
        roomId: row.room_id,
        peerUserId: row.peer_user_id,
        isInitiator: row.is_initiator,
      }
    : null;

export const joinMatchmaking = async (
  deviceId: string,
): Promise<MatchRoom | null> => {
  const {data, error} = await requireSupabase()
    .rpc('join_matchmaking', {p_installation_id: deviceId})
    .maybeSingle<MatchRoomRow>();

  if (error) {
    throw error;
  }

  return mapRoom(data);
};

export const pollMatchmaking = async (
  deviceId: string,
): Promise<MatchRoom | null> => {
  const {data, error} = await requireSupabase()
    .rpc('poll_matchmaking', {p_installation_id: deviceId})
    .maybeSingle<MatchRoomRow>();

  if (error) {
    throw error;
  }

  return mapRoom(data);
};

export const leaveMatchmaking = async (deviceId: string): Promise<void> => {
  const {error} = await requireSupabase().rpc('leave_matchmaking', {
    p_installation_id: deviceId,
  });

  if (error) {
    throw error;
  }
};

export const pushCallSignal = async (
  deviceId: string,
  room: MatchRoom,
  signalType: CallSignal['signalType'],
  payload: Record<string, unknown>,
): Promise<void> => {
  const {error} = await requireSupabase().rpc('push_call_signal', {
    p_installation_id: deviceId,
    p_room_id: room.roomId,
    p_receiver_id: room.peerUserId,
    p_signal_type: signalType,
    p_payload: payload,
  });

  if (error) {
    throw error;
  }
};

export const pullCallSignals = async (
  deviceId: string,
  roomId: string,
  afterId: number,
): Promise<CallSignal[]> => {
  const {data, error} = await requireSupabase().rpc('pull_call_signals', {
    p_installation_id: deviceId,
    p_room_id: roomId,
    p_after_id: afterId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as CallSignalRow[]).map(row => ({
    id: Number(row.id),
    signalType: row.signal_type,
    payload: row.payload,
  }));
};
