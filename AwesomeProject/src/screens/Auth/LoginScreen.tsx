import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Keyboard,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import CustomSafeAreaView from '../../components/global/CustomSafeAreaView';
import ProductSlider from '../../components/login/ProductSlider';
import { Colors, Fonts, lightColors } from '../../utils/Constants';
import CustomText from '../../components/ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import useKeyboardOffsetHeight from '../../utils/useKeyboardOffsetHeight';
import LinearGradient from 'react-native-linear-gradient';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserStore } from '../../store/userStore';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import { LoginResponse } from '../../types/user';

const bottomColors = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', '#FFFFFF', '#FFFFFF'];

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('deliveryboy1@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'Customer' | 'DeliveryPartner' | 'StoreManager' | 'Admin'>('StoreManager');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email'); // For StoreManager login
  const [gestureSequence, setGestureSequence] = useState<string[]>([]);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const keyboardOffsetHeight = useKeyboardOffsetHeight();

  const { setAuthToken, setUser, setRefreshToken } = useUserStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (Platform.OS === 'android') {
      return;
    }
    if (keyboardOffsetHeight === 0) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: -keyboardOffsetHeight * 0.84,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [keyboardOffsetHeight]);

  const handleGesture = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const { translationX, translationY } = nativeEvent;
      let direction = '';
      if (Math.abs(translationX) > Math.abs(translationY)) {
        direction = translationX > 0 ? 'right' : 'left';
      } else {
        direction = translationY > 0 ? 'down' : 'up';
      }

      const newSequence = [...gestureSequence, direction].slice(-5);
      setGestureSequence(newSequence);

      if (newSequence?.join(' ') === 'up up down left right') {
        setGestureSequence([]);
        setRole('Admin');
        showToast('Admin Mode Activated! 🔐', 'info');
      }
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      let credentials;
      if (role === 'Customer') {
        credentials = { phone: phoneNumber };
      } else if (role === 'StoreManager' && loginMethod === 'phone') {
        credentials = { phone: phoneNumber, password };
      } else {
        credentials = { email, password };
      }

      const response = await authService.login(role, credentials);
      const { accessToken, refreshToken, user } = response.data as LoginResponse;

      setUser(user);
      setAuthToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      showToast('Login successful!', 'success');
      // Navigation is handled by AppNavigator
    } catch (err: any) {
      console.log('Login failed', err);
      let message = err.response?.data?.message;
      if (!message) {
        message = err.message === 'Network Error' ? 'Network error. Please check your connection.' : 'Login failed. Please check your credentials.';
      }
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderInputs = () => {
    if (role === 'Customer') {
      return (
        <CustomInput
          onChangeText={text => setPhoneNumber(text.slice(0, 10))}
          onClear={() => setPhoneNumber('')}
          value={phoneNumber}
          placeholder="Enter mobile number"
          inputMode="numeric"
          left={
            <CustomText
              style={styles.phoneText}
              variant="h6"
              fontFamily={Fonts.SemiBold}>
              + 91
            </CustomText>
          }
        />
      );
    } else if (role === 'StoreManager') {
      return (
        <>
          {/* Login Method Toggle for StoreManager */}
          <View style={styles.loginMethodToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'email' && styles.toggleButtonActive
              ]}
              onPress={() => setLoginMethod('email')}>
              <CustomText
                variant="h7"
                fontFamily={Fonts.SemiBold}
                style={{
                  ...styles.toggleText,
                  ...(loginMethod === 'email' && styles.toggleTextActive)
                }}>
                Email
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'phone' && styles.toggleButtonActive
              ]}
              onPress={() => setLoginMethod('phone')}>
              <CustomText
                variant="h7"
                fontFamily={Fonts.SemiBold}
                style={{
                  ...styles.toggleText,
                  ...(loginMethod === 'phone' && styles.toggleTextActive)
                }}>
                Phone
              </CustomText>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          {loginMethod === 'email' ? (
            <CustomInput
              onChangeText={setEmail}
              onClear={() => setEmail('')}
              value={email}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              right={false}
            />
          ) : (
            <CustomInput
              onChangeText={text => setPhoneNumber(text.slice(0, 10))}
              onClear={() => setPhoneNumber('')}
              value={phoneNumber}
              placeholder="Enter mobile number"
              inputMode="numeric"
              left={
                <CustomText
                  style={styles.phoneText}
                  variant="h6"
                  fontFamily={Fonts.SemiBold}>
                  + 91
                </CustomText>
              }
            />
          )}
          <CustomInput
            onChangeText={setPassword}
            onClear={() => setPassword('')}
            value={password}
            placeholder="Password"
            secureTextEntry
            right={false}
          />
        </>
      );
    } else {
      return (
        <>
          <CustomInput
            onChangeText={setEmail}
            onClear={() => setEmail('')}
            value={email}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            right={false}
          />
          <CustomInput
            onChangeText={setPassword}
            onClear={() => setPassword('')}
            value={password}
            placeholder="Password"
            secureTextEntry
            right={false}
          />
        </>
      );
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <CustomSafeAreaView>
          <ProductSlider />

          <PanGestureHandler onHandlerStateChange={handleGesture}>
            <Animated.ScrollView
              bounces={false}
              style={{ transform: [{ translateY: animatedValue }] }}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.subContainer}>

              <LinearGradient colors={bottomColors} style={styles.gradient} />

              <View style={styles.content}>
                <Image
                  source={require('../../assets/images/logo.jpeg')}
                  style={styles.logo}
                />

                <CustomText variant="h2" fontFamily={Fonts.Bold}>
                  Grocery Delivery App
                </CustomText>
                <CustomText
                  variant="h5"
                  fontFamily={Fonts.SemiBold}
                  style={styles.text}>
                  Login to continue
                </CustomText>


                {renderInputs()}

                <CustomButton
                  disabled={
                    role === 'Customer'
                      ? phoneNumber?.length !== 10
                      : role === 'StoreManager' && loginMethod === 'phone'
                        ? phoneNumber?.length !== 10 || !password
                        : (!email || !password)
                  }
                  onPress={() => handleLogin()}
                  loading={loading}
                  title="Login"
                />

                <View style={styles.signUpContainer}>
                  <CustomText variant="h7" fontFamily={Fonts.Medium}>
                    Don't have an account?{' '}
                  </CustomText>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <CustomText variant="h7" fontFamily={Fonts.Bold} style={styles.signUpLink}>
                      Sign Up
                    </CustomText>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 10 }}>
                  <CustomText variant="h7" fontFamily={Fonts.Medium} style={{ color: Colors.primary }}>
                    Forgot Password?
                  </CustomText>
                </TouchableOpacity>
              </View>
            </Animated.ScrollView>
          </PanGestureHandler>
        </CustomSafeAreaView>

        <View style={styles.footer}>
          <CustomText fontSize={RFValue(6)}>
            By Continuing, you agree to our Terms of Service & Privacy Policy
          </CustomText>
        </View>

        <TouchableOpacity
          style={[
            styles.absoluteSwitch,
            styles.storeSwitch,
            role === 'StoreManager' && styles.activeSwitch
          ]}
          onPress={() => setRole('StoreManager')}
        >
          <CustomText style={styles.emojiText}>🏪</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.absoluteSwitch,
            styles.customerSwitch,
            role === 'Customer' && styles.activeSwitch
          ]}
          onPress={() => setRole('Customer')}
        >
          <CustomText style={styles.emojiText}>👤</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.absoluteSwitch,
            styles.deliverySwitch,
            role === 'DeliveryPartner' && styles.activeSwitch
          ]}
          onPress={() => setRole('DeliveryPartner')}
        >
          <CustomText style={styles.emojiText}>🚴‍♂️</CustomText>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  phoneText: {
    marginLeft: 10,
  },
  text: {
    marginTop: 2,
    marginBottom: 15,
    opacity: 0.8,
  },
  logo: {
    height: 50,
    width: 50,
    borderRadius: 20,
    marginVertical: 10,
  },
  subContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  footer: {
    borderTopWidth: 0.8,
    borderColor: Colors.border,
    paddingBottom: 10,
    zIndex: 22,
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fc',
    width: '100%',
  },
  gradient: {
    paddingTop: 60,
    width: '100%',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  absoluteSwitch: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    padding: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    width: 55,
    borderRadius: 50,
    zIndex: 99,
  },
  storeSwitch: {
    backgroundColor: '#C8E6C9',
    right: 140,
  },
  customerSwitch: {
    backgroundColor: '#BBDEFB',
    right: 75,
  },
  deliverySwitch: {
    backgroundColor: '#FFCCBC',
    right: 10,
  },
  activeSwitch: {
    borderWidth: 3,
    borderColor: Colors.primary,
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: RFValue(24),
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
  },
  signUpLink: {
    color: Colors.primary,
  },
  loginMethodToggle: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: Colors.text,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
});
