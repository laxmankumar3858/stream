import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../../../components/BottomNavBar';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isOnline?: boolean;
  unreadCount?: number;
  isBot?: boolean;
}

const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'c1',
    name: 'Mommy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'where are you from',
    time: '13:16',
  },
  {
    id: 'c2',
    name: 'la negra',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'hola mi amor',
    time: '01:54',
  },
  {
    id: 'c3',
    name: 'ANGELICA ANGELICA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'hola amor como estas',
    time: '01:45',
    isOnline: true,
  },
  {
    id: 'c4',
    name: 'Sophia',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'Hey! Are you free for a video call?',
    time: 'Yesterday',
    isOnline: true,
  },
  {
    id: 'c5',
    name: 'Elena',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&auto=format&fit=crop&q=80',
    lastMessage: 'Nice to meet you! 😊',
    time: '2 days ago',
  },
];

interface ChatScreenProps {
  navigation?: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const handleTabChange = (tab: string) => {
    if (navigation && navigation.navigate) {
      if (tab === 'hot') {
        try { navigation.navigate('Home'); } catch (e) { navigation.navigate('MainTabs', { screen: 'Home' }); }
      } else if (tab === 'chat') {
        try { navigation.navigate('Chat'); } catch (e) { navigation.navigate('MainTabs', { screen: 'Chat' }); }
      } else if (tab === 'profile') {
        try { navigation.navigate('Profile'); } catch (e) { navigation.navigate('MainTabs', { screen: 'Profile' }); }
      } else if (tab === 'tokens') {
        navigation.navigate('GetTokens');
      }
    }
  };

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E', '#80065D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Message</Text>

          <View style={styles.headerIconsRow}>
            <TouchableOpacity style={styles.iconCircleBtn} activeOpacity={0.7}>
              <Ionicons name="headset-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircleBtn} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Quick Action Category Tiles (Call, Visitors, Notice) */}
          <View style={styles.quickActionRow}>
            {/* Call Tile */}
            <TouchableOpacity style={styles.quickTile} activeOpacity={0.8}>
              <View style={[styles.tileIconCircle, { backgroundColor: 'rgba(38, 208, 206, 0.2)' }]}>
                <Ionicons name="call" size={22} color="#26D0CE" />
              </View>
              <Text style={styles.tileLabel}>Call</Text>
            </TouchableOpacity>

            {/* Visitors Tile */}
            <TouchableOpacity style={styles.quickTile} activeOpacity={0.8}>
              <View style={[styles.tileIconCircle, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
                <Ionicons name="people" size={22} color="#8B5CF6" />
              </View>
              <Text style={styles.tileLabel}>Visitors</Text>
            </TouchableOpacity>

            {/* Notice Tile */}
            <TouchableOpacity style={styles.quickTile} activeOpacity={0.8}>
              <View style={[styles.tileIconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                <Ionicons name="notifications" size={22} color="#EC4899" />
              </View>
              <Text style={styles.tileLabel}>Notice</Text>
            </TouchableOpacity>
          </View>

          {/* Official Bot Banner (Toki Bot) */}
          <TouchableOpacity style={styles.botBannerCard} activeOpacity={0.85}>
            <View style={styles.botAvatarContainer}>
              <Image
                source={require('../../auth/assets/WelcomeBg.png')}
                style={styles.botAvatarImg}
              />
              <View style={styles.botBadgePill}>
                <Text style={styles.botBadgeCheck}>✓</Text>
              </View>
            </View>
            <View style={styles.botTextCol}>
              <Text style={styles.botTitle}>Toki Bot</Text>
              <Text style={styles.botSubtitle}>New update from Toki</Text>
            </View>
          </TouchableOpacity>

          {/* Conversations List */}
          <View style={styles.chatListContainer}>
            {MOCK_CONVERSATIONS.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatItemRow}
                onPress={() => navigation?.navigate('ChatDetail', { chatUser: chat })}
                activeOpacity={0.75}
              >
                {/* Avatar with optional green online ring */}
                <View style={[styles.avatarWrapper, chat.isOnline && styles.avatarOnlineRing]}>
                  <Image source={{ uri: chat.avatar }} style={styles.chatAvatar} />
                </View>

                {/* Info Column */}
                <View style={styles.chatInfoCol}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatLastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                </View>

                {/* Time */}
                <Text style={styles.chatTime}>{chat.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Custom Bottom Navigation Bar */}
        <BottomNavBar activeTab="chat" onTabChange={handleTabChange} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerIconsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickTile: {
    width: (width - 64) / 3,
    height: 94,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tileIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileIconText: {
    fontSize: 22,
  },
  tileLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  botBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  botAvatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  botAvatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF2A85',
  },
  botBadgePill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#EC4899',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botBadgeCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  botTextCol: {
    flex: 1,
  },
  botTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  botSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
  },
  chatListContainer: {
    gap: 16,
  },
  chatItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarWrapper: {
    marginRight: 14,
    borderRadius: 28,
    padding: 2,
  },
  avatarOnlineRing: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  chatInfoCol: {
    flex: 1,
  },
  chatName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  chatLastMessage: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
  },
  chatTime: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    fontWeight: '500',
  },

  // MODAL STYLES
  modalGradient: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  headerUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerUserName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerUserStatus: {
    color: '#10B981',
    fontSize: 11,
  },
  headerCallBtn: {
    padding: 8,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF2A85',
  },
  friendBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  inputActionIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 21,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#FF2A85',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default ChatScreen;
