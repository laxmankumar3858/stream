import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AUTO_CHAT_PROFILES,
  AutoChatProfile,
  ProfileGender,
  getUniqueOpenerForProfile,
  normalizeChatMessage,
} from '../data/autoChatData';
import {supabase} from '../lib/supabase';

const THREAD_PREFIX = '@stream/auto_chat_thread:';
const ACTIVE_THREADS_KEY = '@stream/active_chat_thread_ids';
const FIRST_LOGIN_TIME_KEY = '@stream/first_login_time';
const ALL_USED_INCOMING_KEY = '@stream/all_used_incoming_messages';
const MAX_LOCAL_MESSAGES = 200;

export interface AutoChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  createdAt: number;
  isRead?: boolean;
}

export interface ActiveChatSummary {
  profile: AutoChatProfile;
  lastMessage: AutoChatMessage;
  unreadCount: number;
}

interface ChatChargeRow {
  new_balance: number;
  was_charged: boolean;
}

const threadKey = (profileId: string) => `${THREAD_PREFIX}${profileId}`;

export const makeChatMessage = (
  text: string,
  isUser: boolean,
  isRead: boolean = isUser,
): AutoChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text,
  isUser,
  isRead,
  createdAt: Date.now(),
});

export const getActiveThreadIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_THREADS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
};

export const addActiveThreadId = async (profileId: string): Promise<void> => {
  try {
    const current = await getActiveThreadIds();
    if (!current.includes(profileId)) {
      const updated = [...current, profileId];
      await AsyncStorage.setItem(ACTIVE_THREADS_KEY, JSON.stringify(updated));
    }
  } catch {}
};

export const getAllUsedIncomingMessages = async (
  excludeProfileId?: string,
): Promise<string[]> => {
  const activeIds = await getActiveThreadIds();
  const usedMessages: string[] = [];
  const seenNorm = new Set<string>();

  for (const id of activeIds) {
    if (excludeProfileId && id === excludeProfileId) {
      continue;
    }
    try {
      const stored = await AsyncStorage.getItem(threadKey(id));
      if (stored) {
        const parsed = JSON.parse(stored) as AutoChatMessage[];
        if (Array.isArray(parsed)) {
          for (const msg of parsed) {
            if (!msg.isUser && msg.text) {
              const norm = normalizeChatMessage(msg.text);
              if (norm && !seenNorm.has(norm)) {
                seenNorm.add(norm);
                usedMessages.push(msg.text);
              }
            }
          }
        }
      }
    } catch {}
  }

  try {
    const rawHistory = await AsyncStorage.getItem(ALL_USED_INCOMING_KEY);
    if (rawHistory) {
      const historyParsed = JSON.parse(rawHistory);
      if (Array.isArray(historyParsed)) {
        for (const t of historyParsed) {
          if (typeof t === 'string') {
            const norm = normalizeChatMessage(t);
            if (norm && !seenNorm.has(norm)) {
              seenNorm.add(norm);
              usedMessages.push(t);
            }
          }
        }
      }
    }
  } catch {}

  return usedMessages;
};

export const recordUsedIncomingMessage = async (text: string): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(ALL_USED_INCOMING_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const norm = normalizeChatMessage(text);
    if (!list.some(item => normalizeChatMessage(item) === norm)) {
      list.push(text);
      await AsyncStorage.setItem(ALL_USED_INCOMING_KEY, JSON.stringify(list.slice(-500)));
    }
  } catch {}
};

export const loadAutoChatThread = async (
  profile: AutoChatProfile,
): Promise<AutoChatMessage[]> => {
  await addActiveThreadId(profile.id);
  let messages: AutoChatMessage[] = [];
  try {
    const stored = await AsyncStorage.getItem(threadKey(profile.id));
    if (stored) {
      const parsed = JSON.parse(stored) as AutoChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        messages = parsed;
      }
    }
  } catch {
    // Start a fresh thread if local data is unreadable.
  }

  if (messages.length === 0) {
    const usedMessages = await getAllUsedIncomingMessages(profile.id);
    const initialText = getUniqueOpenerForProfile(profile, usedMessages);
    await recordUsedIncomingMessage(initialText);

    messages = [makeChatMessage(initialText, false, true)];
    await AsyncStorage.setItem(threadKey(profile.id), JSON.stringify(messages));
  } else {
    // Mark all unread incoming messages as read
    let updated = false;
    messages = messages.map(msg => {
      if (!msg.isUser && msg.isRead !== true) {
        updated = true;
        return { ...msg, isRead: true };
      }
      return msg;
    });

    if (updated) {
      await AsyncStorage.setItem(
        threadKey(profile.id),
        JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES)),
      );
    }
  }

  return messages.slice(-MAX_LOCAL_MESSAGES);
};

export const saveAutoChatThread = async (
  profileId: string,
  messages: AutoChatMessage[],
): Promise<void> => {
  await addActiveThreadId(profileId);
  await AsyncStorage.setItem(
    threadKey(profileId),
    JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES)),
  );
};

export const getActiveChatSummaries = async (
  userGender: string | null,
): Promise<ActiveChatSummary[]> => {
  const activeIds = await getActiveThreadIds();
  const oppositeGender: ProfileGender = userGender === 'female' ? 'boy' : 'girl';

  const candidateProfiles = AUTO_CHAT_PROFILES.filter(
    p => p.gender === oppositeGender && activeIds.includes(p.id),
  );

  const summaries: ActiveChatSummary[] = [];
  const usedNormInSummaries = new Set<string>();

  for (const profile of candidateProfiles) {
    try {
      const stored = await AsyncStorage.getItem(threadKey(profile.id));
      if (stored) {
        let parsed = JSON.parse(stored) as AutoChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Detect if incoming first message is duplicate across different profiles
          const firstIncomingIndex = parsed.findIndex(m => !m.isUser);
          if (firstIncomingIndex !== -1) {
            const firstIncoming = parsed[firstIncomingIndex];
            const norm = normalizeChatMessage(firstIncoming.text);

            if (usedNormInSummaries.has(norm)) {
              // Duplicate found! Replace with a distinct variation
              const newText = getUniqueOpenerForProfile(
                profile,
                Array.from(usedNormInSummaries),
              );
              parsed[firstIncomingIndex] = {
                ...firstIncoming,
                text: newText,
              };
              await saveAutoChatThread(profile.id, parsed);
              await recordUsedIncomingMessage(newText);
            }
          }

          const lastMsg = parsed[parsed.length - 1];
          if (!lastMsg.isUser) {
            usedNormInSummaries.add(normalizeChatMessage(lastMsg.text));
          }

          const unreadCount = parsed.filter(m => !m.isUser && m.isRead === false).length;
          summaries.push({
            profile,
            lastMessage: lastMsg,
            unreadCount,
          });
        }
      }
    } catch {}
  }

  summaries.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

  return summaries;
};

export const triggerAutoIncomingMessage = async (
  userGender: string | null,
): Promise<ActiveChatSummary | null> => {
  const activeIds = await getActiveThreadIds();
  const oppositeGender: ProfileGender = userGender === 'female' ? 'boy' : 'girl';

  const pool = AUTO_CHAT_PROFILES.filter(
    p => p.gender === oppositeGender && !activeIds.includes(p.id),
  );

  if (pool.length === 0) {
    return null;
  }

  const chosenProfile = pool[Math.floor(Math.random() * pool.length)];
  const usedMessages = await getAllUsedIncomingMessages();
  const initialText = getUniqueOpenerForProfile(chosenProfile, usedMessages);
  await recordUsedIncomingMessage(initialText);

  const initialMsg = makeChatMessage(initialText, false, false);

  await saveAutoChatThread(chosenProfile.id, [initialMsg]);

  return {
    profile: chosenProfile,
    lastMessage: initialMsg,
    unreadCount: 1,
  };
};

const MAX_AUTO_MESSAGES = 5;
const TARGET_SCHEDULE_MS = [
  40_000, // Msg 1: 40s after login
  100_000, // Msg 2: 1 min (60s) after Msg 1
  120_000, // Msg 3: 20s after Msg 2
  140_000, // Msg 4: 20s after Msg 3
  160_000, // Msg 5: 20s after Msg 4
];

let schedulerTimer: ReturnType<typeof setTimeout> | null = null;

export const initAutoChatScheduler = async (
  userGender: string | null,
  onNewMessage?: () => void,
) => {
  try {
    let firstLoginStr = await AsyncStorage.getItem(FIRST_LOGIN_TIME_KEY);
    let firstLoginTime: number;

    if (!firstLoginStr) {
      firstLoginTime = Date.now();
      await AsyncStorage.setItem(FIRST_LOGIN_TIME_KEY, String(firstLoginTime));
    } else {
      firstLoginTime = parseInt(firstLoginStr, 10);
    }

    if (schedulerTimer) {
      clearTimeout(schedulerTimer);
      schedulerTimer = null;
    }

    const processNextStep = async () => {
      const activeIds = await getActiveThreadIds();
      const currentCount = activeIds.length;

      if (currentCount >= MAX_AUTO_MESSAGES) {
        return; // Max 5 auto messages limit reached
      }

      const targetTime = firstLoginTime + TARGET_SCHEDULE_MS[currentCount];
      const remainingMs = targetTime - Date.now();

      if (remainingMs <= 0) {
        const result = await triggerAutoIncomingMessage(userGender);
        if (result && onNewMessage) {
          onNewMessage();
        }
        void processNextStep();
      } else {
        schedulerTimer = setTimeout(async () => {
          const result = await triggerAutoIncomingMessage(userGender);
          if (result && onNewMessage) {
            onNewMessage();
          }
          void processNextStep();
        }, remainingMs);
      }
    };

    void processNextStep();
  } catch {}
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
