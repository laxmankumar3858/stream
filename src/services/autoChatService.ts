import AsyncStorage from '@react-native-async-storage/async-storage';
import {AutoChatProfile} from '../data/autoChatData';
import {supabase} from '../lib/supabase';

const THREAD_PREFIX = '@stream/auto_chat_thread:';
const MAX_LOCAL_MESSAGES = 200;

export interface AutoChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  createdAt: number;
}

interface ChatChargeRow {
  new_balance: number;
  was_charged: boolean;
}

const threadKey = (profileId: string) => `${THREAD_PREFIX}${profileId}`;

export const makeChatMessage = (
  text: string,
  isUser: boolean,
): AutoChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text,
  isUser,
  createdAt: Date.now(),
});

export const loadAutoChatThread = async (
  profile: AutoChatProfile,
): Promise<AutoChatMessage[]> => {
  try {
    const stored = await AsyncStorage.getItem(threadKey(profile.id));
    if (stored) {
      const parsed = JSON.parse(stored) as AutoChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(-MAX_LOCAL_MESSAGES);
      }
    }
  } catch {
    // Start a fresh thread if local data is unreadable.
  }

  const initial = [makeChatMessage(profile.firstMessage, false)];
  await AsyncStorage.setItem(threadKey(profile.id), JSON.stringify(initial));
  return initial;
};

export const saveAutoChatThread = async (
  profileId: string,
  messages: AutoChatMessage[],
): Promise<void> => {
  await AsyncStorage.setItem(
    threadKey(profileId),
    JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES)),
  );
};

export const chargeOutgoingChatMessage = async (
  deviceId: string,
): Promise<{newBalance: number; wasCharged: boolean}> => {
  if (!supabase) {
    throw new Error('Supabase URL is not configured.');
  }

  const {data, error} = await supabase
    .rpc('charge_chat_message', {p_installation_id: deviceId})
    .single<ChatChargeRow>();

  if (error) {
    throw error;
  }

  return {
    newBalance: Number(data.new_balance),
    wasCharged: Boolean(data.was_charged),
  };
};
