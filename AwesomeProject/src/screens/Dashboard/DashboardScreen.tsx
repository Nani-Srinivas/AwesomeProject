import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { DashboardScreenProps } from '../../navigation/types';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FeatureShortcuts } from './components/FeatureShortcuts';
import { HighlightCard } from './components/HighlightCard';
import { PurchaseSummary } from './components/PurchaseSummary';
import { OrderStatusShortcuts } from './components/OrderStatusShortcuts';
import { TopBrands } from './components/TopBrands';
import { BottomNav } from './components/BottomNav';

const FlexiPayContent = ({ navigation }: { navigation: DashboardScreenProps['navigation'] }) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#D9F2F7', '#F8FBFC']}
      style={[styles.flexiPay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView>
        <View style={styles.container}>
          <Header styles={styles} />
          <SearchBar styles={styles} />
          <FeatureShortcuts styles={styles} />
          <HighlightCard styles={styles} />
          <PurchaseSummary styles={styles} />
          <OrderStatusShortcuts styles={styles} />
          <TopBrands styles={styles} />
        </View>
      </ScrollView>
      <BottomNav styles={styles} navigation={navigation} />
    </LinearGradient>
  );
}

export const DashboardScreen = ({ navigation }: DashboardScreenProps) => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <FlexiPayContent navigation={navigation} />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  flexiPay: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CCCCCC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  icon: {
    fontSize: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#CCCCCC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1C1C1C',
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  shortcutButton: {
    alignItems: 'center',
  },
  shortcutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#CCCCCC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  shortcutIcon: {
    fontSize: 30,
  },
  shortcutIconShop: {
    color: '#4C9DFE',
  },
  shortcutIconInStore: {
    color: '#47D7AC',
  },
  shortcutIconRewards: {
    color: '#A58BFE',
  },
  shortcutIconDeals: {
    color: '#FEBB6D',
  },
  shortcutIconSaved: {
    color: '#FF6B6B',
  },
  shortcutLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#008080',
    borderRadius: 15,
    padding: 16,
    marginBottom: 24,
  },
  highlightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  highlightIcon: {
    fontSize: 24,
    color: '#008080',
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  highlightSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  purchaseSummaryCard: {
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#CCCCCC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryIcon: {
    fontSize: 24,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
  summarySeparator: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
  },
  orderStatusCard: {
    borderRadius: 15,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#CCCCCC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  orderStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  orderStatusButton: {
    alignItems: 'center',
  },
  orderStatusIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#CCCCCC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderStatusIcon: {
    fontSize: 24,
    color: '#1C1C1C',
  },
  orderStatusLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
  topBrandsSection: {
    marginBottom: 24,
  },
  topBrandsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  seeAll: {
    fontSize: 14,
    color: '#4C9DFE',
  },
  brandCard: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CCCCCC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  brandInitial: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#1C1C1C',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navTab: {
    alignItems: 'center',
  },
   navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#1C1C1C',
  },
});
