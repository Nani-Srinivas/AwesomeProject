import React, { useEffect } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUserStore } from './store/userStore';
import { ToastProvider } from './contexts/ToastContext';

const App = () => {
  const { checkAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;