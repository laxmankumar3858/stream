import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../../context/AuthContext';
import {
  CallHistoryItem,
  getRecentCallHistory,
} from '../../../services/videoMatchService';

interface HistoryScreenProps {
  navigation?: any;
}

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatCallTime = (value: string) =>
  new Date(value).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const HistoryScreen: React.FC<HistoryScreenProps> = ({navigation}) => {
  const {deviceId} = useAuth();
  const [history, setHistory] = useState<CallHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHistory = useCallback(
    async (refreshing = false) => {
      if (!deviceId) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      refreshing ? setIsRefreshing(true) : setIsLoading(true);
      try {
        setHistory(await getRecentCallHistory(deviceId));
        setErrorMessage('');
      } catch {
        setErrorMessage('History load nahi ho saki. Pull down karke retry karein.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [deviceId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E', '#80065D']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradientContainer}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recent calls</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#FF2A85" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => void loadHistory(true)}
                tintColor="#FFFFFF"
                colors={['#FF2A85']}
              />
            }>
            {errorMessage ? (
              <Text style={styles.stateText}>{errorMessage}</Text>
            ) : history.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="videocam-outline" size={44} color="#FFFFFF66" />
                <Text style={styles.stateText}>Abhi koi call history nahi hai.</Text>
              </View>
            ) : (
              history.map(item => (
                <View key={item.id} style={styles.historyRow}>
                  <View style={styles.callIconCircle}>
                    <Ionicons
                      name={item.callKind === 'live' ? 'people' : 'play'}
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.callTitle}>
                      {item.callKind === 'live'
                        ? item.peerName || 'Live user'
                        : 'Video match'}
                    </Text>
                    <Text style={styles.timeText}>{formatCallTime(item.startedAt)}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.durationText}>
                      {formatDuration(item.durationSeconds)}
                    </Text>
                    <Text style={styles.coinText}>🪙 {item.coinsSpent}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {flex: 1},
  container: {flex: 1, backgroundColor: 'transparent'},
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
  headerTitle: {fontSize: 22, fontWeight: '900', color: '#FFFFFF'},
  headerSpacer: {width: 40},
  centerState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  listContent: {paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30},
  emptyState: {alignItems: 'center', paddingTop: 90, gap: 14},
  stateText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  callIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 13,
    backgroundColor: '#FF2A85',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {flex: 1},
  callTitle: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  timeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  metaCol: {alignItems: 'flex-end', marginLeft: 8},
  durationText: {color: '#FFFFFF', fontSize: 14, fontWeight: '700'},
  coinText: {color: '#FFD166', fontSize: 12, fontWeight: '800', marginTop: 5},
});

export default HistoryScreen;
