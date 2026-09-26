import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import {
  createRazorpayOrder,
  openRazorpayCheckout,
  verifyAndCreditCoins,
} from '../../../services/razorpayService';

const { width } = Dimensions.get('window');

interface TokenPackage {
  id: string;
  tokens: number;
  price: string;
  priceInRs: number;        // numeric value for Razorpay order
  discountBadge?: string;
  onceBadge?: string;
  isPopular?: boolean;
}

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'p1',
    tokens: 120,
    price: 'Rs 81',
    priceInRs: 81,
    discountBadge: '60% off',
    onceBadge: 'ONCE',
    isPopular: true,
  },
  { id: 'p2', tokens: 160,   price: 'Rs 163',  priceInRs: 163  },
  { id: 'p3', tokens: 240,   price: 'Rs 245',  priceInRs: 245  },
  { id: 'p4', tokens: 530,   price: 'Rs 487',  priceInRs: 487  },
  { id: 'p5', tokens: 880,   price: 'Rs 807',  priceInRs: 807  },
  { id: 'p6', tokens: 1800,  price: 'Rs 1608', priceInRs: 1608 },
  { id: 'p7', tokens: 4600,  price: 'Rs 4012', priceInRs: 4012 },
  { id: 'p8', tokens: 10000, price: 'Rs 8017', priceInRs: 8017 },
];

interface GetTokensScreenProps {
  navigation?: any;
}

const GetTokensScreen: React.FC<GetTokensScreenProps> = ({ navigation }) => {
  const { user, deviceId, updateCoinBalance } = useAuth();
  const balance = user?.coinBalance ?? 0;
  const [selectedPackageId, setSelectedPackageId] = useState<string>('p1');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handlePurchase = async (pkg: TokenPackage) => {
    if (isPurchasing || !deviceId) {
      return;
    }
    setSelectedPackageId(pkg.id);
    setIsPurchasing(true);

    try {
      // Step 1: Create Razorpay order
      const order = await createRazorpayOrder(pkg.priceInRs);

      // Step 2: Open Razorpay checkout sheet
      const paymentData = await openRazorpayCheckout(
        order,
        '',             // email (optional)
        user?.name ?? 'User',
      );

      // Step 3: Verify on server + credit coins
      const newBalance = await verifyAndCreditCoins(
        paymentData.razorpay_order_id,
        paymentData.razorpay_payment_id,
        paymentData.razorpay_signature,
        deviceId,
        pkg.tokens,
      );

      // Step 4: Update local coin balance
      await updateCoinBalance(newBalance);
      showToast(`✅ ${pkg.tokens} Tokens added! Balance: ${newBalance}`);
    } catch (error: any) {
      // User cancelled payment — Razorpay returns error code 0
      const isCancelled =
        error?.code === 0 ||
        error?.description === 'Payment cancelled by user';

      if (!isCancelled) {
        Alert.alert(
          'Payment Failed',
          error?.description ?? error?.message ?? 'Kuch gadbad ho gayi. Dobara try karein.',
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FF1493', '#C71585', '#3A0835', '#0F091A']}
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

          <Text style={styles.headerTitle}>Get Tokens</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Toast Notification */}
          {toastMessage ? (
            <View style={styles.toastCard}>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          ) : null}

          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <View style={styles.balanceRow}>
              <Text style={{ fontSize: 26, marginRight: 6 }}>🪙</Text>
              <Text style={styles.balanceAmount}>{balance}</Text>
            </View>
          </View>

          {/* Main Dark Card Container */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Pick Your Tokens</Text>

            {/* Grid of Packages (3 columns) */}
            <View style={styles.gridContainer}>
              {TOKEN_PACKAGES.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                const isLoadingThis = isPurchasing && isSelected;
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[
                      styles.packageBox,
                      isSelected && styles.packageBoxSelected,
                      isPurchasing && !isSelected && styles.packageBoxDimmed,
                    ]}
                    onPress={() => void handlePurchase(pkg)}
                    activeOpacity={0.8}
                    disabled={isPurchasing}
                  >
                    {/* Discount Badge */}
                    {pkg.discountBadge ? (
                      <View style={styles.discountBadgePill}>
                        <Text style={styles.discountBadgeText}>{pkg.discountBadge}</Text>
                      </View>
                    ) : null}

                    {/* Once Starburst Badge */}
                    {pkg.onceBadge ? (
                      <View style={styles.onceBadgePill}>
                        <Text style={styles.onceBadgeText}>{pkg.onceBadge}</Text>
                      </View>
                    ) : null}

                    {/* Token Icon & Amount — show spinner if loading this tile */}
                    <View style={styles.packageContent}>
                      {isLoadingThis ? (
                        <ActivityIndicator size="small" color="#FF2A85" />
                      ) : (
                        <>
                          <View style={styles.tokenIconWrapper}>
                            <Text style={{ fontSize: 26, marginRight: 6 }}>🪙</Text>
                          </View>
                          <Text style={styles.tokenAmountText}>{pkg.tokens}</Text>
                        </>
                      )}
                    </View>

                    {/* Price Strip */}
                    <View style={[styles.priceStrip, isSelected && styles.priceStripSelected]}>
                      <Text style={styles.priceText}>{pkg.price}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  toastCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  balanceSection: {
    marginBottom: 24,
    paddingLeft: 4,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  cardContainer: {
    backgroundColor: '#171424',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    alignItems: 'center',
  },
  packageBox: {
    width: '32%',
    height: 125,
    borderRadius: 16,
    backgroundColor: '#231F33',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  packageBoxSelected: {
    borderColor: '#FF2A85',
    backgroundColor: '#2A223D',
  },
  packageBoxDimmed: {
    opacity: 0.4,
  },
  discountBadgePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#FF2A85',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: 10,
    zIndex: 10,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  onceBadgePill: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#00D2C8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  onceBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  packageContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 16,
  },
  tokenIconWrapper: {
    marginBottom: 6,
  },
  tokenAmountText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  priceStrip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  priceStripSelected: {
    backgroundColor: 'rgba(255, 42, 133, 0.25)',
  },
  priceText: {
    color: '#EC4899',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default GetTokensScreen;
