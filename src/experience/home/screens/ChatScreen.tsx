import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNavBar from '../../../components/BottomNavBar';
import {
  AUTO_CHAT_PROFILES,
  AutoChatProfile,
  ProfileGender,
} from '../../../data/autoChatData';

interface ChatScreenProps {
  navigation?: any;
}

type ProfileFilter = 'all' | ProfileGender;

const ChatScreen: React.FC<ChatScreenProps> = ({navigation}) => {
  const [filter, setFilter] = useState<ProfileFilter>('all');
  const profiles = useMemo(
    () =>
      filter === 'all'
        ? AUTO_CHAT_PROFILES
        : AUTO_CHAT_PROFILES.filter(profile => profile.gender === filter),
    [filter],
  );

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

  const renderProfile = ({item}: {item: AutoChatProfile}) => (
    <TouchableOpacity
      style={styles.chatItemRow}
      onPress={() => navigation?.navigate('ChatDetail', {chatUser: item})}
      activeOpacity={0.75}>
      <View style={[styles.avatarWrapper, item.isOnline && styles.avatarOnlineRing]}>
        <Image source={{uri: item.avatar}} style={styles.chatAvatar} />
        {item.isOnline ? <View style={styles.onlineDot} /> : null}
      </View>

      <View style={styles.chatInfoCol}>
        <View style={styles.nameRow}>
          <Text style={styles.chatName}>{item.name}, {item.age}</Text>
          <Text style={styles.autoBadge}>AUTO</Text>
        </View>
        <Text style={styles.chatLastMessage} numberOfLines={1}>
          {item.firstMessage}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#FFFFFF55" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E', '#80065D']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradientContainer}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>130 adult auto-chat profiles</Text>
          </View>
          <View style={styles.coinHint}>
            <Text style={styles.coinHintText}>1st free · then 🪙1</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {([
            ['all', 'All 130'],
            ['girl', 'Girls 100'],
            ['boy', 'Boys 30'],
          ] as const).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[styles.filterPill, filter === value && styles.filterPillActive]}
              onPress={() => setFilter(value)}>
              <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={profiles}
          renderItem={renderProfile}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          windowSize={7}
          removeClippedSubviews
        />

        <BottomNavBar activeTab="chat" onTabChange={handleTabChange} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {flex: 1},
  container: {flex: 1, backgroundColor: 'transparent'},
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {fontSize: 28, fontWeight: '900', color: '#FFFFFF'},
  headerSubtitle: {fontSize: 12, color: '#FFFFFF88', marginTop: 3},
  coinHint: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  coinHintText: {color: '#FFD166', fontSize: 11, fontWeight: '800'},
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {backgroundColor: '#FF2A85'},
  filterText: {color: '#FFFFFF99', fontSize: 12, fontWeight: '700'},
  filterTextActive: {color: '#FFFFFF'},
  listContent: {paddingHorizontal: 20, paddingBottom: 20},
  chatItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarWrapper: {marginRight: 14, borderRadius: 30, padding: 2},
  avatarOnlineRing: {borderWidth: 2, borderColor: '#10B981'},
  chatAvatar: {width: 52, height: 52, borderRadius: 26, backgroundColor: '#24172F'},
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
  chatInfoCol: {flex: 1, paddingRight: 10},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 7},
  chatName: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  autoBadge: {
    color: '#F9A8D4',
    fontSize: 8,
    fontWeight: '900',
    backgroundColor: 'rgba(236, 72, 153, 0.16)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  chatLastMessage: {color: '#FFFFFF99', fontSize: 13, marginTop: 4},
});

export default ChatScreen;
