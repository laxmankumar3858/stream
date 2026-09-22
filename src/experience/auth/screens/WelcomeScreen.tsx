import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getDeviceId } from '../../../services/authService';

interface WelcomeScreenProps {
  navigation?: any;
  deviceIdProps?: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  navigation,
  deviceIdProps,
}) => {
  const { loginWithDeviceId, isLoading } = useAuth();
  const [currentDeviceId] = useState<string>(deviceIdProps || getDeviceId());
  const [statusText, setStatusText] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleOpenTerms = () => {
    Linking.openURL('https://example.com/terms').catch(err =>
      console.log('Failed to open Terms URL:', err)
    );
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://example.com/privacy').catch(err =>
      console.log('Failed to open Privacy URL:', err)
    );
  };

  const handleGetStarted = async () => {
    if (!isChecked) {
      setStatusText('Please read and agree to the user agreement and privacy policy first');
      return;
    }
    try {
      setStatusText('Connecting to Live Stream Server...');
      await loginWithDeviceId(currentDeviceId);
    } catch (err) {
      setStatusText('Connection failed. Please try again.');
    }
  };

  return (
     <ImageBackground
      source={require('../assets/WelcomeBg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
      />
      <SafeAreaView style={styles.contentContainer}>
        {/* Center Branding Section */}
        <View style={styles.brandSection}>
          <View style={styles.iconContainer}>
             <Image
                source={require('../../../assets/logopng.png')}
                style={styles.appIcon}
                resizeMode="contain"  
              />
          </View>

          <Text style={styles.title}>Stream Fiz</Text>
          <Text style={styles.subtitle}>
            Watch Live Streams & Connect With Millions
          </Text>

          {/* Feature Pills */}
          <View style={styles.featureRow}>
            <View style={styles.featurePill}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Randome Videos</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureText}>Chat with new friends</Text>
            </View>
          </View>
        </View>

        {/* Bottom CTA Section */}
        <View style={styles.bottomSection}>
          {statusText ? (
            <Text style={styles.statusMsg}>{statusText}</Text>
          ) : null}

          {/* Checkbox Section for Terms of Service & Privacy Policy */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxTouch}
              onPress={() => setIsChecked(!isChecked)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
            >
              <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              Please read and agree to the user agreement and privacy policy first{' '}
              <Text style={styles.linkText} onPress={handleOpenTerms}>
                Terms of Service
              </Text>
              {' and '}
              <Text style={styles.linkText} onPress={handleOpenPrivacy}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={handleGetStarted}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.btnContentRow}>
                <ActivityIndicator color="#80065D" size="small" />
                <Text style={[styles.getStartedText, { marginLeft: 10 }]}>
                  Authenticating Device...
                </Text>
              </View>
            ) : (
              <View style={styles.btnContentRow}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Instant Guest Auth via Device ID ({currentDeviceId})
          </Text>
        </View>
      </SafeAreaView>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  brandSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  appIcon:{
    width: 200,
    height: 200
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  featureIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  featureText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  statusMsg: {
    color: '#A7F3D0',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },
  getStartedBtn: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#80065D',
    fontSize: 18,
    fontWeight: '800',
  },
  disclaimerText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  checkboxTouch: {
    padding: 4,
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#80065D',
    borderColor: '#FFFFFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  termsText: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    lineHeight: 18,
  },
  linkText: {
    color: '#60A5FA',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default WelcomeScreen;
