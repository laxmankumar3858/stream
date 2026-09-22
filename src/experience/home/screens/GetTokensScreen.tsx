import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface TokenPackage {
  id: string;
  tokens: number;
  price: string;
  discountBadge?: string;
  onceBadge?: string;
  isPopular?: boolean;
}

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'p1',
    tokens: 120,
    price: 'Rs 81',
    discountBadge: '60% off',
    onceBadge: 'ONCE',
    isPopular: true,
  },
  {
    id: 'p2',
    tokens: 160,
    price: 'Rs 163',
  },
  {
    id: 'p3',
    tokens: 240,
    price: 'Rs 245',
  },
  {
    id: 'p4',
    tokens: 530,
    price: 'Rs 487',
  },
  {
    id: 'p5',
    tokens: 880,
    price: 'Rs 807',
  },
  {
    id: 'p6',
    tokens: 1800,
    price: 'Rs 1608',
  },
  {
    id: 'p7',
    tokens: 4600,
    price: 'Rs 4012',
  },
  {
    id: 'p8',
    tokens: 10000,
    price: 'Rs 8017',
  },
];

interface GetTokensScreenProps {
  navigation?: any;
}

const GetTokensScreen: React.FC<GetTokensScreenProps> = ({ navigation }) => {
  const [balance, setBalance] = useState<number>(2);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('p1');
  const [toastMessage, setToastMessage] = useState<string>('');

  const handlePurchase = (pkg: TokenPackage) => {
    setSelectedPackageId(pkg.id);
    setBalance((prev) => prev + pkg.tokens);
    setToastMessage(`Success! Purchased ${pkg.tokens} Tokens 🎉`);
    setTimeout(() => setToastMessage(''), 3000);
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
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[
                      styles.packageBox,
                      isSelected && styles.packageBoxSelected,
                    ]}
                    onPress={() => handlePurchase(pkg)}
                    activeOpacity={0.8}
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

                    {/* Token Icon & Amount */}
                    <View style={styles.packageContent}>
                      <View style={styles.tokenIconWrapper}>
                        <Image
                          source={require('../../../assets/wallet.png')}
                          style={{ width: 28, height: 28 }}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.tokenAmountText}>{pkg.tokens}</Text>
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
    justifyContent: 'space-between',
    gap: 12,
  },
  packageBox: {
    width: (width - 72) / 3,
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
