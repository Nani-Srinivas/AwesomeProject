import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../screens/Auth/LoginScreen';
import { RegisterScreen } from '../../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../../screens/Auth/ForgotPasswordScreen';
import { AuthStackParamList } from '../types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthStackProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
