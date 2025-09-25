import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { useUserStore } from '../../store/userStore';
import { apiService } from '../../services/apiService';
import { LoginResponse, User } from '../../types/user';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [phone, setPhone] = useState('9876543210');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [role, setRole] = useState('Customer'); // 'Customer' or 'DeliveryPartner'
  const { setAuthToken, setUser } = useUserStore();

  useEffect(() => {
    const abortController = new AbortController();
    return () => {
      abortController.abort();
    };
  }, []);

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setPhoneError('');

    let isValid = true;
    if (role === 'DeliveryPartner') {
      if (!email) {
        setEmailError('Email is required');
        isValid = false;
      }
      else if (!/\S+@\S+\.\S+/.test(email)) {
        setEmailError('Invalid email format');
        isValid = false;
      }

      if (!password) {
        setPasswordError('Password is required');
        isValid = false;
      }
      else if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        isValid = false;
      }
    } else {
      if (!phone) {
        setPhoneError('Phone number is required');
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    setLoading(true);
    const abortController = new AbortController();
    try {
      let response: LoginResponse;
      if (role === 'DeliveryPartner') {
        response = await apiService.post('/delivery/login', { email, password }, abortController.signal);
      } else {
        response = await apiService.post('/customer/login', { phone }, abortController.signal);
      }

      const { accessToken, customer, deliveryPartner } = response;
      const user = (role === 'Customer' ? customer : deliveryPartner) as User;

      setUser(user);
      setAuthToken(accessToken);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
      }
      // Global error handler in axiosInstance will show an alert
      console.error('Login failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <View style={styles.roleSwitcher}>
          <TouchableOpacity onPress={() => setRole('Customer')} style={[styles.roleButton, role === 'Customer' && styles.activeRole]}>
            <Text style={styles.roleText}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRole('DeliveryPartner')} style={[styles.roleButton, role === 'DeliveryPartner' && styles.activeRole]}>
            <Text style={styles.roleText}>Delivery Partner</Text>
          </TouchableOpacity>
        </View>

        {role === 'DeliveryPartner' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.text}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.text}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={COLORS.text}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button title={loading ? 'Logging In...' : 'Login'} onPress={handleLogin} />

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 40,
  },
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
  forgotPasswordText: {
    color: COLORS.primary,
    marginBottom: 20,
    alignSelf: 'flex-end',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  signUpText: {
    color: COLORS.text,
  },
  signUpLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  roleSwitcher: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeRole: {
    backgroundColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.text,
  },
});
