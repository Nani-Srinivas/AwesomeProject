import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef, reset } from './NavigationRef';
import { MainStack } from './stacks/MainStack';
import { AuthStack } from './stacks/AuthStack';
import { SetupWizardScreen } from '../screens/Setup/SetupWizardScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { useUserStore } from '../store/userStore';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { authToken, user, isCheckingAuth, isSetupComplete } = useUserStore();

  useEffect(() => {
    if (authToken && user) {
      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
      // Don't redirect if user is already in onboarding flow or setup wizard
      if (currentRoute === 'StoreCreation' || currentRoute === 'SelectCategory' ||
        currentRoute === 'SelectSubcategory' || currentRoute === 'SelectProduct' ||
        currentRoute === 'PricingConfig' || currentRoute === 'SetupWizard') {
        return;
      }

      if (user.roles && user.roles.includes('StoreManager')) {
        // Check if onboarding is complete
        if (!user.storeId) {
          reset('StoreCreation');
        } else if (!user.additionalDetailsCompleted) {
          // Onboarding not complete - redirect to appropriate step
          if (!user.hasSelectedCategories) {
            reset('SelectCategory');
          } else if (!user.hasSelectedSubcategories) {
            // User has selected categories but not subcategories
            // Pass the selected categories from the user object
            reset('SelectSubcategory', { selectedCategories: user.selectedCategoryIds });
          } else if (!user.hasSelectedProducts) {
            // User has selected subcategories but not products
            reset('SelectProduct', {
              selectedCategories: user.selectedCategoryIds,
              selectedSubcategories: user.selectedSubcategoryIds,
              selectedProducts: user.selectedProductIds
            });
          } else if (!user.hasAddedProductPricing) {
            // This shouldn't happen as pricing is the last step, but handle it
            reset('SelectCategory');
          } else {
            // Onboarding complete but setup wizard not shown yet
            if (!isSetupComplete) {
              reset('SetupWizard');
            } else {
              reset('Home');
            }
          }
        } else {
          // Onboarding complete - check setup wizard status
          if (!isSetupComplete) {
            reset('SetupWizard');
          } else {
            reset('Home');
          }
        }
      } else {
        // Other roles go to home (or setup wizard if not complete)
        if (!isSetupComplete) {
          reset('SetupWizard');
        } else {
          reset('Home');
        }
      }
    }
  }, [authToken, user, isSetupComplete]);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!authToken ? (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        ) : (
          <>
            {!isSetupComplete ? (
              <RootStack.Screen name="SetupWizard" component={SetupWizardScreen} />
            ) : (
              <RootStack.Screen name="Main" component={MainStack} />
            )}
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});