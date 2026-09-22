import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface InsufficientBalanceModalProps {
  visible: boolean;
  currentBalance: number;
  requiredBalance?: number;
  onClose: () => void;
  onGetTokens: () => void;
}

const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({
  visible,
  currentBalance,
  requiredBalance = 50,
  onClose,
  onGetTokens,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Close Cross Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>

          {/* Glowing Coin Icon Circle */}
          <View style={styles.iconCircleOuter}>
            <LinearGradient
              colors={['#FF2A85', '#FF1493', '#7928CA']}
              style={styles.iconCircleGradient}
            >
              <Image
                source={require('../assets/wallet.png')}
                style={{ width: 36, height: 36, tintColor: '#FFFFFF' }}
                resizeMode="contain"
              />
            </LinearGradient>
            <View style={styles.warningBadge}>
              <Text style={{ fontSize: 10 }}>⚠️</Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text style={styles.modalTitle}>Insufficient Balance</Text>
          <Text style={styles.modalSubtitle}>
            You need at least <Text style={styles.highlightText}>{requiredBalance} tokens</Text> to start a video call.
          </Text>

          {/* Current Balance Tag */}
          <View style={styles.balancePill}>
            <Text style={styles.balanceLabel}>Current Balance:</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.balanceAmount}>{currentBalance}</Text>
              <Text style={styles.coinIconEmoji}>🪙</Text>
            </View>
          </View>

          {/* Get Tokens Primary Action Button */}
          <TouchableOpacity
            style={styles.getTokensBtn}
            onPress={onGetTokens}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FF2A85', '#FF1493', '#E01A4F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>Get Tokens</Text>
              <Text style={styles.btnIcon}>⚡</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel Secondary Button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: width * 0.86,
    backgroundColor: '#1C162E',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 42, 133, 0.4)',
    shadowColor: '#FF2A85',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconCircleOuter: {
    marginBottom: 16,
    position: 'relative',
  },
  iconCircleGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2A85',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  warningBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1C162E',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  highlightText: {
    color: '#FF2A85',
    fontWeight: '800',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceAmount: {
    color: '#FBBF24',
    fontSize: 16,
    fontWeight: '900',
  },
  coinIconEmoji: {
    fontSize: 14,
  },
  getTokensBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 10,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnIcon: {
    fontSize: 16,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InsufficientBalanceModal;
