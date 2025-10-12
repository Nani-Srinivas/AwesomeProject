import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './components/Header';
import { ServicesGrid } from './components/ServicesGrid';
import { CustomersSection } from './components/CustomersSection';
import { PayablesSection } from './components/PayablesSection';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreenProps } from '../../navigation/types';
import { SideMenu } from '../../components/common/SideMenu';
import { useUserStore } from '../../store/userStore';

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);
  
  const user = useUserStore(state => state.user) as { name?: string } | null;
  const logout = useUserStore(state => state.logout);
  console.log(user);


  const toggleSideMenu = useCallback(() => {
    setIsSideMenuVisible(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    toggleSideMenu(); // Close side menu after logout
  }, [logout, toggleSideMenu]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onMenuPress={toggleSideMenu} userName={user?.name ?? 'Guest'} />
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <ServicesGrid navigation={navigation} />
          <View style={styles.separator} />
          <CustomersSection navigation={navigation} />
          <View style={styles.separator} />
          <PayablesSection />
        </ScrollView>
        <BottomNavBar navigation={navigation} />
      </View>
      <SideMenu
        isVisible={isSideMenuVisible}
        onClose={toggleSideMenu}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
});
