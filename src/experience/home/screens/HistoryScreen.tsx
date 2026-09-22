import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InsufficientBalanceModal from '../../../components/InsufficientBalanceModal';

const { width } = Dimensions.get('window');

interface CallHistoryItem {
  id: string;
  name: string;
  avatar: string;
  time: string;
  duration: string;
}

const MOCK_HISTORY: CallHistoryItem[] = [
  {
    id: 'h1',
    name: 'ely',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    time: '02:29',
    duration: '00:00:10',
  },
  {
    id: 'h2',
    name: 'Deepali Baghel',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    time: '02:29',
    duration: '00:00:06',
  },
  {
    id: 'h3',
    name: 'muskan Sharm',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    time: '02:28',
    duration: '00:00:08',
  },
  {
    id: 'h4',
    name: 'Rupa',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    time: 'Yesterday',
    duration: '00:00:16',
  },
  {
    id: 'h5',
    name: 'mahi246',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&auto=format&fit=crop&q=80',
    time: 'Yesterday',
    duration: '00:00:20',
  },
  {
    id: 'h6',
    name: '🤙🤙📞📞',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&auto=format&fit=crop&q=80',
    time: 'Yesterday',
    duration: '00:00:20',
  },
  {
    id: 'h7',
    name: '😘Chandni😘',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    time: 'Yesterday',
    duration: '00:00:20',
  },
  {
    id: 'h8',
    name: 'shanaya',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    time: 'Yesterday',
    duration: '00:00:20',
  },
  {
    id: 'h9',
    name: 'Night Queen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    time: 'Yesterday',
    duration: '00:01:20',
  },
];

interface HistoryScreenProps {
  navigation?: any;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [showInsufficientModal, setShowInsufficientModal] = useState<boolean>(false);

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E', '#80065D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Top Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>History</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* History List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {MOCK_HISTORY.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              {/* Avatar */}
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />

              {/* Info Column */}
              <View style={styles.infoCol}>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={styles.subTextRow}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
              </View>

              {/* Call Action Button */}
              <TouchableOpacity
                style={styles.callIconBtn}
                onPress={() => setShowInsufficientModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="videocam" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* INSUFFICIENT BALANCE MODAL */}
        <InsufficientBalanceModal
          visible={showInsufficientModal}
          currentBalance={25}
          requiredBalance={50}
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
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  subTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 13,
    fontWeight: '600',
  },
  durationText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 13,
    fontWeight: '600',
  },
  callIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FF2A85',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2A85',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default HistoryScreen;
