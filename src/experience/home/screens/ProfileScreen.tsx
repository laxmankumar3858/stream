import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../../context/AuthContext';
import BottomNavBar from '../../../components/BottomNavBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const tokens = user?.coinBalance ?? 0;
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
    { id: 'tasks', title: 'Tasks', icon: 'calendar-outline', color: '#38BDF8' },
    { id: 'package', title: 'Package', icon: 'wallet-outline', color: '#F43F5E' },
    { id: 'level', title: 'My Level', icon: 'trophy-outline', color: '#FBBF24' },
    { id: 'verify', title: 'Verify', icon: 'shield-checkmark-outline', color: '#10B981' },
    { id: 'settings', title: 'Settings', icon: 'settings-outline', color: '#A855F7', isSettings: true },
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
              <Text style={styles.avatarInitial}>
                {user?.gender === 'female' ? 'F' : 'G'}
              </Text>
            </View>

            <View style={styles.profileInfoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {user?.gender === 'female' ? 'Female User' : 'Guest'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.6)" />
              </View>

              <View style={styles.locationTagRow}>
                <Ionicons name="location" size={13} color="#FF2A85" />
                <Text style={styles.locationTagText}>India</Text>
                <Text style={styles.genderTagText}>
                  {user?.gender === 'female' ? '♀' : '♂'}
                </Text>
              </View>
            </View>
          </View>

          {/* Tokens / Wallet Banner */}
          <View style={styles.tokensCard}>
            <View style={styles.tokensLeft}>
              <View style={styles.tokensBadgePill}>
                <Text style={{ fontSize: 24 }}>🪙</Text>
                <View>
                  <Text style={styles.tokensBadgeText}>Tokens</Text>
                  <Text style={styles.tokensAmount}>{tokens}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.getTokensBtn}
              onPress={() => navigation?.navigate('GetTokens')}
              activeOpacity={0.85}
            >
              <Text style={styles.getTokensText}>Get Tokens</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
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
                        <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                      ) : (
                        <Text style={{ fontSize: 16 }}>🪙</Text>
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
                  <View style={[styles.menuIconBox, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.45)" />
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
  locationTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTagText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  genderTagText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
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
  tokensBadgePill: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 8,
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
    paddingVertical: 14,
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
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ProfileScreen;
