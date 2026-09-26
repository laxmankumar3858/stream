import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAvoidingFlatList } from 'react-native-keyboard-avoiding-scroll-view';
import BottomNavBar from '../../../components/BottomNavBar';
import { useAuth } from '../../../context/AuthContext';
import {
  ActiveChatSummary,
  getActiveChatSummaries,
} from '../../../services/autoChatService';

interface ChatScreenProps {
  navigation?: any;
}

const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeSummaries, setActiveSummaries] = useState<ActiveChatSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const flatListData = React.useMemo(
    () => activeSummaries.map(item => ({ ...item, id: item.profile.id })),
    [activeSummaries],
  );

  const fetchActiveChats = useCallback(async () => {
    try {
      const summaries = await getActiveChatSummaries(user?.gender ?? null);
      setActiveSummaries(summaries);
    } catch {
      setActiveSummaries([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.gender]);

  useEffect(() => {
    fetchActiveChats();

    // Auto refresh active chats every 4 seconds to catch new incoming messages
    const interval = setInterval(() => {
      fetchActiveChats();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchActiveChats]);

  // Refetch when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchActiveChats();
    });
    return unsubscribe;
  }, [navigation, fetchActiveChats]);

  const handleTabChange = (tab: string) => {
    if (!navigation?.navigate) {
      return;
    }
    if (tab === 'hot') {
      navigation.navigate('Home');
    } else if (tab === 'chat') {
      navigation.navigate('Chat');
    } else if (tab === 'profile') {
      navigation.navigate('Profile');
    } else if (tab === 'tokens') {
      navigation.navigate('GetTokens');
    }
  };

  const renderItem = ({ item }: { item: ActiveChatSummary }) => {
    const hasUnread = item.unreadCount > 0;
    return (
      <TouchableOpacity
        style={styles.chatItemRow}
        onPress={() => navigation?.navigate('ChatDetail', { chatUser: item.profile })}
        activeOpacity={0.75}
      >
        <View
          style={[
            styles.avatarWrapper,
            item.profile.isOnline && styles.avatarOnlineRing,
          ]}
        >
          <Image source={{ uri: item.profile.avatar }} style={styles.chatAvatar} />
          {item.profile.isOnline ? <View style={styles.onlineDot} /> : null}
        </View>

        <View style={styles.chatInfoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.chatName}>
              {item.profile.name}, {item.profile.age}
            </Text>
            <Text style={[styles.timeText, hasUnread && styles.timeTextUnread]}>
              {formatMessageTime(item.lastMessage.createdAt)}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.chatLastMessage,
                hasUnread && styles.chatLastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.text}
            </Text>
            {hasUnread ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF44" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="chatbubbles-outline" size={44} color="#FF2A85" />
      </View>
      <Text style={styles.emptyTitle}>No Messages Yet</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E', '#80065D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
          </View>
          <View style={styles.coinHint}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>🪙 {user?.coinBalance}</Text>
          </View>
        </View>

        <KeyboardAvoidingFlatList
          data={flatListData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            flatListData.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!isLoading ? renderEmptyState : undefined}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                fetchActiveChats();
              }}
              tintColor="#FF2A85"
            />
          }
        />

        <BottomNavBar activeTab="chat" onTabChange={handleTabChange} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#FFFFFF88', marginTop: 3 },
  coinHint: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  coinHintText: { color: '#FFD166', fontSize: 11, fontWeight: '800' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyListContent: { flex: 1, justifyContent: 'center' },
  chatItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarWrapper: { marginRight: 14, borderRadius: 30, padding: 2 },
  avatarOnlineRing: { borderWidth: 2, borderColor: '#10B981' },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#24172F',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#28132E',
  },
  chatInfoCol: { flex: 1, paddingRight: 10 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  timeText: { color: '#FFFFFF66', fontSize: 11, fontWeight: '600' },
  timeTextUnread: { color: '#10B981', fontWeight: '800' },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  chatLastMessage: { color: '#FFFFFF88', fontSize: 13, flex: 1, paddingRight: 6 },
  chatLastMessageUnread: { color: '#FFFFFF', fontWeight: '700' },
  unreadBadge: {
    backgroundColor: '#10B981',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 42, 133, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 133, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#FFFFFF88',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.25)',
    gap: 6,
  },
  timerBadgeText: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ChatScreen;
