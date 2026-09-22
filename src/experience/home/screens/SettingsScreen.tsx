import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';

interface SettingsScreenProps {
  navigation?: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { logout } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<string>('English');

  const handleOpenTerms = () => {
    Linking.openURL('https://example.com/terms').catch((err) =>
      console.log('Failed to open Terms:', err)
    );
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://example.com/privacy').catch((err) =>
      console.log('Failed to open Privacy:', err)
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          if (logout) logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. Do you wish to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (logout) logout();
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#0B132B', '#1C1035', '#4A0E4E', '#0F091A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>App Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 1. APP Language */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <Text style={styles.settingLabel}>APP Language</Text>
            <View style={styles.valueRow}>
              <Text style={styles.settingValue}>{currentLanguage}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 2. Camera Beauty */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <Text style={styles.settingLabel}>Camera Beauty</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 3. Blocked Accounts */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <Text style={styles.settingLabel}>Blocked Accounts</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 4. My cases */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <Text style={styles.settingLabel}>My cases</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 5. Check for Updates */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Alert.alert('Check for Updates', 'You are on the latest version (1.5.1).')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>Check for Updates</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 6. Terms of Service */}
          <TouchableOpacity style={styles.settingRow} onPress={handleOpenTerms} activeOpacity={0.7}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 7. Privacy Policy */}
          <TouchableOpacity style={styles.settingRow} onPress={handleOpenPrivacy} activeOpacity={0.7}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 8. Logout */}
          <TouchableOpacity style={styles.settingRow} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.settingLabel}>Logout</Text>
          </TouchableOpacity>

          {/* 9. Delete Account */}
          <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount} activeOpacity={0.7}>
            <Text style={styles.settingLabel}>Delete Account</Text>
          </TouchableOpacity>

          {/* Version Info Footer */}
          <View style={styles.versionFooter}>
            <Text style={styles.versionText}>Version: 1.5.1</Text>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  chevron: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 18,
    fontWeight: '300',
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 28,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettingsScreen;
