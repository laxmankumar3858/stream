import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNavPill}>
        {/* 1. Hot / Match Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange('hot')}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/call.png')}
            style={[
              styles.navIconImage,
              activeTab === 'hot' ? styles.iconActive : styles.iconInactive,
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 3. Messages / Chat Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange('chat')}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/chat.png')}
            style={[
              styles.navIconImage,
              activeTab === 'chat' ? styles.iconActive : styles.iconInactive,
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 4. Get Tokens / Wallet Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange('tokens')}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/wallet.png')}
            style={[
              styles.navIconImage,
              activeTab === 'tokens' ? styles.iconActive : styles.iconInactive,
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 5. Profile Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange('profile')}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/profile.png')}
            style={[
              styles.navIconImage,
              activeTab === 'profile' ? styles.iconActive : styles.iconInactive,
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    alignItems: 'center',
  },
  bottomNavPill: {
    flexDirection: 'row',
    width: width * 0.9,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconImage: {
    width: 24,
    height: 24,
  },
  iconActive: {
    opacity: 1,
    tintColor: '#FF2A85',
  },
  iconInactive: {
    opacity: 0.5,
    tintColor: '#FFFFFF',
  },
  navRadarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRadarCircleActive: {
    backgroundColor: '#00D2C8',
  },
  radarIconImage: {
    width: 26,
    height: 26,
  },
  gameBadgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadgePill: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF2A85',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    zIndex: 5,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
});

export default BottomNavBar;
