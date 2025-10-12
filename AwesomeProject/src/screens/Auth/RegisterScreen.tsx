import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useNavigation } from '@react-navigation/native';

export const RegisterScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [role, setRole] = useState<'Customer' | 'DeliveryPartner' | 'StoreManager'>('Customer');
  const [storeName, setStoreName] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [loading, setLoading] = useState(false);

  // error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [storeNameError, setStoreNameError] = useState('');
  const [aadharError, setAadharError] = useState('');

  useEffect(() => {
    const requestLocationPermission = async () => {
      const fetchLocation = () => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          (error) => {
            Alert.alert('Location Error', error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
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
            Alert.alert('Permission Denied', 'Location permission is required for registration.');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestLocationPermission();
  }, []);

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
      Alert.alert(
        'Location Error',
        'Could not determine location. Please ensure location services are enabled.'
      );
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
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
      navigation.navigate('Login' as never);
    } catch (error: any) {
      const message = error.response?.data?.message || 'An unexpected error occurred.';
      Alert.alert('Registration Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        {/* Role selector */}
        <View style={styles.roleSelectorContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'Customer' && styles.selectedRoleButton]}
            onPress={() => setRole('Customer')}
          >
            <Text style={[styles.roleButtonText, role === 'Customer' && styles.selectedRoleButtonText]}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'DeliveryPartner' && styles.selectedRoleButton]}
            onPress={() => setRole('DeliveryPartner')}
          >
            <Text style={[styles.roleButtonText, role === 'DeliveryPartner' && styles.selectedRoleButtonText]}>Delivery Partner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'StoreManager' && styles.selectedRoleButton]}
            onPress={() => setRole('StoreManager')}
          >
            <Text style={[styles.roleButtonText, role === 'StoreManager' && styles.selectedRoleButtonText]}>Store Manager</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

        {role === 'StoreManager' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Store Name"
              value={storeName}
              onChangeText={setStoreName}
            />
            {storeNameError ? <Text style={styles.errorText}>{storeNameError}</Text> : null}
          </>
        )}

        {role === 'DeliveryPartner' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Aadhar Number"
              keyboardType="numeric"
              value={aadhar}
              onChangeText={setAadhar}
            />
            {aadharError ? <Text style={styles.errorText}>{aadharError}</Text> : null}
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>Latitude: {location.latitude}</Text>
            <Text style={styles.locationText}>Longitude: {location.longitude}</Text>
          </View>
        )}

        <Button title={loading ? 'Registering...' : 'Register'} onPress={handleRegister} />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  input: {
    width: '100%',
    height: 50,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 10, marginLeft: 5 },
  loginContainer: { flexDirection: 'row', marginTop: 30 },
  loginText: { color: COLORS.text },
  loginLink: { color: COLORS.primary, fontWeight: 'bold' },
  roleSelectorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedRoleButton: {
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  selectedRoleButtonText: {
    color: COLORS.white,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    marginHorizontal: 10,
  },
});
