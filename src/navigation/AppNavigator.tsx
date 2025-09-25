import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MainStack } from './stacks/MainStack';
import { AuthStack } from './stacks/AuthStack';
import { useUserStore } from '../store/userStore';

export const AppNavigator = () => {
  const { authToken } = useUserStore();

  return (
    <NavigationContainer>
      {authToken ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};