import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef, reset } from './NavigationRef';
import { MainStack } from './stacks/MainStack';
import { AuthStack } from './stacks/AuthStack';
import { useUserStore } from '../store/userStore';

export const AppNavigator = () => {
  const { authToken, user } = useUserStore();

  useEffect(() => {
    if (authToken && user) {
      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
      if (currentRoute === 'SelectCategory' || currentRoute === 'SelectProduct') {
        return;
      }

      if (user.roles && user.roles.includes('StoreManager')) {
        if (!user.storeId) {
          reset('StoreCreation');
        } else if (!user.hasSelectedCategories) {
          reset('SelectCategory');
        } else if (!user.hasSelectedProducts) {
          reset('SelectProduct', { selectedCategories: user.selectedCategoryIds });
        } else {
          reset('Dashboard');
        }
      } else {
        reset('Dashboard');
      }
    }
  }, [authToken, user]);

  return (
    <NavigationContainer ref={navigationRef}>
      {authToken ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};