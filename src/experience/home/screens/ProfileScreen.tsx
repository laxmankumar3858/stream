import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../../context/AuthContext';
import BottomNavBar from '../../../components/BottomNavBar';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [tokens, setTokens] = useState<number>(2);
  const [claimedDays, setClaimedDays] = useState<number[]>([1]); // Day 1 claimed

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

  const handleClaimBonus = (dayNumber: number) => {
    if (!claimedDays.includes(dayNumber)) {
      setClaimedDays((prev) => [...prev, dayNumber]);
      setTokens((prev) => prev + 2);
    }
  };

  const dailyBonusDays = [
    { day: 1, reward: '+2' },
    { day: 2, reward: '+2' },
    { day: 3, reward: '+2' },
    { day: 4, reward: '+2' },
    { day: 5, reward: '+2' },
    { day: 6, reward: '+2' },
  ];

  const menuItems = [
    { id: 'tasks', title: 'Tasks', icon: '📅' },
    { id: 'package', title: 'Package', icon: '💳' },
    { id: 'level', title: 'My Level', icon: '💎' },
    { id: 'verify', title: 'Verify', icon: '🛡️' },
    { id: 'settings', title: 'Settings', icon: '⚙️', isSettings: true },
  ];

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E', '#80065D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Top Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>I</Text>
            </View>

            <View style={styles.profileInfoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>flex</Text>
                <Text style={styles.headerChevron}>›</Text>
              </View>

              <View style={styles.locationTagRow}>
                <Text style={styles.locationTagText}>📍 India</Text>
                <Text style={styles.genderTagText}>♂ 64</Text>
              </View>
            </View>
          </View>

          {/* Fans / Following / Friends Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Fans</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>

          {/* Tokens / Wallet Banner */}
          <View style={styles.tokensCard}>
            <View style={styles.tokensLeft}>
              <View style={styles.coinsStackIcon}>
                <Text style={{ fontSize: 24 }}>🪙</Text>
              </View>
              <View style={styles.tokensBadgePill}>
                <Text style={styles.tokensBadgeText}>Tokens</Text>
              </View>
              <Text style={styles.tokensAmount}>{tokens}</Text>
            </View>

            <TouchableOpacity
              style={styles.getTokensBtn}
              onPress={() => navigation?.navigate('GetTokens')}
              activeOpacity={0.85}
            >
              <Text style={styles.getTokensText}>Get Tokens ›</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Bonus Card Section */}
          <View style={styles.dailyBonusCard}>
            <Text style={styles.sectionTitle}>Daily Bonus</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bonusDaysScroll}>
              {dailyBonusDays.map((item) => {
                const isClaimed = claimedDays.includes(item.day);
                return (
                  <TouchableOpacity
                    key={item.day}
                    style={[
                      styles.bonusDayBox,
                      isClaimed && styles.bonusDayBoxClaimed,
                    ]}
                    onPress={() => handleClaimBonus(item.day)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bonusRewardText}>{item.reward}</Text>

                    <View style={styles.bonusIconCircle}>
                      {isClaimed ? (
                        <Text style={styles.checkIcon}>✓</Text>
                      ) : (
                        <Text style={{ fontSize: 16 }}>💳</Text>
                      )}
                    </View>

                    <Text style={styles.bonusDayLabel}>Day {item.day}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Grouped Settings & Menu Card */}
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItemRow,
                  index === menuItems.length - 1 && styles.menuItemRowLast,
                ]}
                onPress={() => {
                  if (item.isSettings) {
                    navigation?.navigate('Settings');
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>

                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Custom Bottom Navigation Bar Component */}
        <BottomNavBar activeTab="profile" onTabChange={handleTabChange} />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  profileInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 6,
  },
  headerChevron: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 20,
    fontWeight: '300',
  },
  locationTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationTagText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '600',
  },
  genderTagText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '600',
  },
  tokensCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tokensLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsStackIcon: {
    marginRight: 8,
  },
  tokensBadgePill: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 10,
  },
  tokensBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  tokensAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  getTokensBtn: {
    backgroundColor: '#FF1493',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  getTokensText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  dailyBonusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  bonusDaysScroll: {
    flexDirection: 'row',
  },
  bonusDayBox: {
    width: 64,
    height: 78,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bonusDayBoxClaimed: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  bonusRewardText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  bonusIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '900',
  },
  bonusDayLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '600',
  },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItemRowLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  menuChevron: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 20,
    fontWeight: '300',
  },
});

export default ProfileScreen;
