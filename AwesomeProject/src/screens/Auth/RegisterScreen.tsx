import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Keyboard,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Modal,
  Linking,
  AppState,
  AppStateStatus,
  ActivityIndicator,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Geolocation from '@react-native-community/geolocation';
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
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from '@react-navigation/native';

const bottomColors = [...lightColors].reverse();

export const RegisterScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [role, setRole] = useState<'Customer' | 'DeliveryPartner' | 'StoreManager'>('StoreManager');
  const [storeName, setStoreName] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocationError, setIsLocationError] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);

  // error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [storeNameError, setStoreNameError] = useState('');
  const [aadharError, setAadharError] = useState('');

  const animatedValue = useRef(new Animated.Value(0)).current;
  const keyboardOffsetHeight = useKeyboardOffsetHeight();
  const appState = useRef(AppState.currentState);

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

  const checkLocationPermission = async () => {
    setIsCheckingLocation(true);
    const fetchLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setIsLocationError(false);
          setIsCheckingLocation(false);
        },
        (error) => {
          // Error code 2 is POSITION_UNAVAILABLE, 3 is TIMEOUT
          if (error.code === 2 || error.code === 3 || error.message.toLowerCase().includes('provider')) {
            Geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setIsLocationError(false);
                setIsCheckingLocation(false);
              },
              (secondError) => {
                setIsLocationError(true);
                setIsCheckingLocation(false);
              },
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
            );
          } else {
            setIsCheckingLocation(false);
            showToast(`Location Error: ${error.message}`, 'error');
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    };

    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      fetchLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for registration.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchLocation();
        } else {
          setIsCheckingLocation(false);
          showToast('Location permission is required for registration.', 'error');
        }
      } catch (err) {
        console.warn(err);
        setIsCheckingLocation(false);
      }
    }
  };

  useEffect(() => {
    checkLocationPermission();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkLocationPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const openSettings = () => {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
    } else {
      Linking.openSettings();
    }
  };

  const handleRegister = async () => {
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setStoreNameError('');
    setAadharError('');

    let isValid = true;

    if (!name) {
      setNameError('Name is required');
      isValid = false;
    }
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }
    if (!phone) {
      setPhoneError('Phone number is required');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    if (role === 'StoreManager' && !storeName) {
      setStoreNameError('Store Name is required for Store Managers');
      isValid = false;
    }
    if (role === 'DeliveryPartner' && !aadhar) {
      setAadharError('Aadhar number is required for Delivery Partners');
      isValid = false;
    }
    if (!location) {
      showToast('Could not determine location. Please ensure location services are enabled.', 'error');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        latitude: location?.latitude,
        longitude: location?.longitude,
        ...(role === 'StoreManager' && { storeName }),
        ...(role === 'DeliveryPartner' && { aadhar: Number(aadhar) }),
      };

      await authService.register(payload);
      showToast('Verification email sent! Please check your inbox.', 'success');
      navigation.navigate('Login' as never);
    } catch (error: any) {
      let message = error.response?.data?.message;
      if (!message) {
        message = error.message === 'Network Error' ? 'Network error. Please check your connection.' : 'An unexpected error occurred during registration.';
      }
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderInputs = () => {
    return (
      <>
        <CustomInput
          onChangeText={setName}
          onClear={() => setName('')}
          value={name}
          placeholder="Name"
          right={false}
        />
        {nameError ? <CustomText style={styles.errorText} variant="h8" fontFamily={Fonts.Regular}>{nameError}</CustomText> : null}

        <CustomInput
          onChangeText={setEmail}
          onClear={() => setEmail('')}
          value={email}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          right={false}
        />
        {emailError ? <CustomText style={styles.errorText} variant="h8" fontFamily={Fonts.Regular}>{emailError}</CustomText> : null}

        <CustomInput
          onChangeText={setPhone}
          onClear={() => setPhone('')}
          value={phone}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          right={false}
        />
        {phoneError ? <CustomText style={styles.errorText} variant="h8" fontFamily={Fonts.Regular}>{phoneError}</CustomText> : null}

        {role === 'StoreManager' && (
          <>
            <CustomInput
              onChangeText={setStoreName}
              onClear={() => setStoreName('')}
              value={storeName}
              placeholder="Store Name"
              right={false}
            />
            {storeNameError ? <CustomText style={styles.errorText} variant="h8" fontFamily={Fonts.Regular}>{storeNameError}</CustomText> : null}
          </>
        )}

        {role === 'DeliveryPartner' && (
          <>
            <CustomInput
              onChangeText={setAadhar}
              onClear={() => setAadhar('')}
              value={aadhar}
              placeholder="Aadhar Number"
              keyboardType="numeric"
              right={false}
            />
            {aadharError ? <CustomText style={styles.errorText} variant="h8" fontFamily={Fonts.Regular}>{aadharError}</CustomText> : null}
          </>
        )}

        <CustomInput
          onChangeText={setPassword}
          onClear={() => setPassword('')}
          value={password}
          placeholder="Password"
          secureTextEntry
          right={false}
        />
        {passwordError ? <CustomText style={styles.errorText} variant="h8" fontFamily={Fonts.Regular}>{passwordError}</CustomText> : null}

        <CustomInput
          onChangeText={setConfirmPassword}
          onClear={() => setConfirmPassword('')}
          value={confirmPassword}
          placeholder="Confirm Password"
          secureTextEntry
          right={false}
        />
        {confirmPasswordError ? <CustomText style={styles.errorText} variant="h8" fontFamily={Fonts.Regular}>{confirmPasswordError}</CustomText> : null}
      </>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <CustomSafeAreaView>
          <ProductSlider />

          <PanGestureHandler>
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
                  Create an account
                </CustomText>



                {renderInputs()}

                {location && (
                  <View style={styles.locationContainer}>
                    <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.locationText}>
                      Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
                    </CustomText>
                  </View>
                )}

                <CustomButton
                  onPress={() => handleRegister()}
                  loading={loading}
                  disabled={loading || !location}
                  title="Register"
                />

                <View style={styles.loginContainer}>
                  <CustomText variant="h7" fontFamily={Fonts.Medium}>
                    Already have an account?{' '}
                  </CustomText>
                  <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                    <CustomText variant="h7" fontFamily={Fonts.Bold} style={styles.loginLink}>
                      Login
                    </CustomText>
                  </TouchableOpacity>
                </View>

                {!location && (
                  <View style={styles.loginContainer}>
                    <CustomText variant="h7" fontFamily={Fonts.Medium}>
                      Location not detected?{' '}
                    </CustomText>
                    <TouchableOpacity onPress={checkLocationPermission}>
                      <CustomText variant="h7" fontFamily={Fonts.Bold} style={styles.loginLink}>
                        Fetch Location
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                )}

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

        <Modal
          animationType="slide"
          transparent={true}
          visible={isLocationError || isCheckingLocation}
          onRequestClose={() => setIsLocationError(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {!isCheckingLocation && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsLocationError(false)}
                >
                  <Icon name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              )}

              {isCheckingLocation ? (
                <>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <CustomText variant="h6" fontFamily={Fonts.Medium} style={styles.modalText}>
                    Verifying location...
                  </CustomText>
                </>
              ) : (
                <>
                  <Icon name="map-marker-off" size={50} color={Colors.primary} />
                  <CustomText variant="h4" fontFamily={Fonts.Bold} style={styles.modalTitle}>
                    Location Required
                  </CustomText>
                  <CustomText variant="h6" fontFamily={Fonts.Medium} style={styles.modalText}>
                    We need your location to register you. Please enable GPS/Location Services.
                  </CustomText>
                  <CustomButton
                    title="Enable Location"
                    onPress={openSettings}
                    loading={false}
                    disabled={false}
                  />
                  <View style={{ marginTop: 10, width: '100%' }}>
                    <CustomButton
                      title="Retry"
                      onPress={checkLocationPermission}
                      loading={false}
                      disabled={false}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
  },
  loginLink: {
    color: Colors.primary,
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  locationText: {
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    marginVertical: 10,
    color: Colors.text,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});
