import React, {useEffect} from 'react';
import {AppNavigator} from './navigation/AppNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useUserStore} from './store/userStore';
const App = () => {
  const {checkAuth} = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
        <AppNavigator />
    </GestureHandlerRootView>
  );
};

export default App;