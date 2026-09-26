import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {KeyboardAvoidingScrollView} from 'react-native-keyboard-avoiding-scroll-view';
import InsufficientBalanceModal from '../../../components/InsufficientBalanceModal';
import {useAuth} from '../../../context/AuthContext';
import {
  AUTO_CHAT_PROFILES,
  AutoChatProfile,
  BOY_PROFILES,
  GIRL_PROFILES,
  createContextReply,
  INACTIVITY_NUDGES,
} from '../../../data/autoChatData';
import {
  AutoChatMessage,
  chargeOutgoingChatMessage,
  loadAutoChatThread,
  makeChatMessage,
  saveAutoChatThread,
} from '../../../services/autoChatService';

interface ChatDetailScreenProps {
  navigation?: any;
  route?: {params?: {chatUser?: AutoChatProfile}};
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as {message?: unknown}).message ?? '');
  }
  return '';
};

const formatTime = (createdAt: number) =>
  new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({navigation, route}) => {
  const {deviceId, user, updateCoinBalance} = useAuth();
  const defaultProfile = user?.gender === 'female' ? BOY_PROFILES[0] : GIRL_PROFILES[0];
  const chatUser = route?.params?.chatUser ?? defaultProfile;
  const [messages, setMessages] = useState<AutoChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const messagesRef = useRef<AutoChatMessage[]>([]);
  const mountedRef = useRef(true);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<any>(null);

  const replaceMessages = (nextMessages: AutoChatMessage[]) => {
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    void saveAutoChatThread(chatUser.id, nextMessages).catch(() => {});
  };

  const appendMessage = (message: AutoChatMessage) => {
    replaceMessages([...messagesRef.current, message].slice(-200));
  };

  const scheduleNudge = () => {
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
    }
    const delay = 18_000 + Math.floor(Math.random() * 17_000);
    nudgeTimerRef.current = setTimeout(() => {
      if (!mountedRef.current || isTyping) {
        return;
      }
      const nudge = INACTIVITY_NUDGES[
        Math.floor(Math.random() * INACTIVITY_NUDGES.length)
      ];
      appendMessage(makeChatMessage(nudge, false));
      scheduleNudge();
    }, delay);
  };

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    loadAutoChatThread(chatUser)
      .then(storedMessages => {
        if (!mountedRef.current) {
          return;
        }
        messagesRef.current = storedMessages;
        setMessages(storedMessages);
        scheduleNudge();
      })
      .catch(() => {
        const initial = [makeChatMessage(chatUser.firstMessage, false)];
        messagesRef.current = initial;
        setMessages(initial);
      })
      .finally(() => {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      mountedRef.current = false;
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
      if (nudgeTimerRef.current) {
        clearTimeout(nudgeTimerRef.current);
      }
    };
  }, [chatUser.id]);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({animated: true}));
  }, [messages, isTyping]);

  const CHAT_COST = 2;
  const [requiredBalance, setRequiredBalance] = useState(CHAT_COST);

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isSending) {
      return;
    }

    const currentCoins = user?.coinBalance ?? 0;
    if (currentCoins < CHAT_COST) {
      setRequiredBalance(CHAT_COST);
      setShowInsufficientModal(true);
      return;
    }

    setIsSending(true);
    try {
      appendMessage(makeChatMessage(text, true));
      setInputText('');

      let newBalance = currentCoins - CHAT_COST;
      if (deviceId) {
        try {
          const charge = await chargeOutgoingChatMessage(deviceId);
          newBalance = charge.newBalance;
        } catch {
          // If Supabase RPC is unavailable, fallback to local 2 coins deduction
        }
      }

      await updateCoinBalance(Math.max(0, newBalance));

      setIsTyping(true);
      if (nudgeTimerRef.current) {
        clearTimeout(nudgeTimerRef.current);
      }

      replyTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }
        appendMessage(makeChatMessage(createContextReply(chatUser, text), false));
        setIsTyping(false);
        scheduleNudge();
      }, 900 + Math.floor(Math.random() * 900));
    } catch {
      // Smooth fallback
    } finally {
      if (mountedRef.current) {
        setIsSending(false);
      }
    }
  };

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.chatHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerUserInfo}>
            <View style={[styles.avatarRing, chatUser.isOnline && styles.onlineRing]}>
              <Image source={{uri: chatUser.avatar}} style={styles.headerUserAvatar} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerUserName}>{chatUser.name}, {chatUser.age}</Text>
              <Text style={styles.headerUserStatus}>{chatUser.isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <View style={styles.balancePill}>
            <Text style={styles.balanceText}>🪙 {user?.coinBalance ?? 0}</Text>
          </View>
        </View>

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#FF2A85" />
            </View>
          ) : (
            <KeyboardAvoidingScrollView
              style={styles.messageList}
              contentContainerStyle={styles.messageContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              stickyFooter={
                <View>
                  <Text style={styles.billingHint}>🪙 2 tokens per message</Text>
                  <View style={styles.inputBarContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Type a message..."
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={inputText}
                      onChangeText={setInputText}
                      onSubmitEditing={() => void handleSendMessage()}
                      returnKeyType="send"
                      editable={!isSending}
                    />
                    <TouchableOpacity
                      style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendDisabled]}
                      onPress={() => void handleSendMessage()}
                      disabled={!inputText.trim() || isSending}>
                      {isSending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="send" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              }>
              {messages.map(message => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.friendBubble,
                  ]}>
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text style={styles.messageTime}>{formatTime(message.createdAt)}</Text>
                </View>
              ))}
              {isTyping ? (
                <View style={[styles.messageBubble, styles.friendBubble]}>
                  <Text style={styles.typingText}>typing…</Text>
                </View>
              ) : null}
            </KeyboardAvoidingScrollView>
          )}

        <InsufficientBalanceModal
          visible={showInsufficientModal}
          currentBalance={user?.coinBalance ?? 0}
          requiredBalance={requiredBalance}
          onClose={() => setShowInsufficientModal(false)}
          onGetTokens={() => {
            setShowInsufficientModal(false);
            navigation?.navigate('GetTokens');
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {flex: 1},
  safeArea: {flex: 1},
  keyboardArea: {flex: 1},
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {paddingHorizontal: 6, paddingVertical: 6},
  headerUserInfo: {flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 4},
  avatarRing: {borderRadius: 24, padding: 2},
  onlineRing: {borderWidth: 2, borderColor: '#10B981'},
  headerUserAvatar: {width: 42, height: 42, borderRadius: 21, backgroundColor: '#24172F'},
  headerTextCol: {marginLeft: 9, flex: 1},
  headerUserName: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  headerUserStatus: {color: '#F9A8D4', fontSize: 10, marginTop: 2},
  balancePill: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },
  balanceText: {color: '#FFD166', fontSize: 11, fontWeight: '800'},
  loadingState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  messageList: {flex: 1, paddingHorizontal: 16},
  messageContent: {paddingVertical: 16},
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {alignSelf: 'flex-end', backgroundColor: '#FF2A85', borderBottomRightRadius: 4},
  friendBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  messageText: {color: '#FFFFFF', fontSize: 15, lineHeight: 20},
  messageTime: {color: '#FFFFFF88', fontSize: 9, alignSelf: 'flex-end', marginTop: 4},
  typingText: {color: '#FFFFFF99', fontSize: 13, fontStyle: 'italic'},
  billingHint: {color: '#FFFFFF77', fontSize: 10, textAlign: 'center', paddingVertical: 5},
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
    backgroundColor: '#FF2A85',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {opacity: 0.45},
});

export default ChatDetailScreen;
