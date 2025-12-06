import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Modal,
  Linking,
  AppState,
  AppStateStatus,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { useUserStore } from '../../store/userStore';
import { reset } from '../../navigation/NavigationRef';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../../components/ui/CustomButton';

type StoreCreationScreenProps = StackScreenProps<
  MainStackParamList,
  'StoreCreation'
>;

export const StoreCreationScreen = ({
  navigation,
}: StoreCreationScreenProps) => {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [isLocationError, setIsLocationError] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);

  const { user, setUser } = useUserStore();
  const appState = useRef(AppState.currentState);

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
            setIsLocationError(true);
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
            message: 'This app needs access to your location for store creation.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchLocation();
        } else {
          setIsCheckingLocation(false);
          setIsLocationError(true);
        }
      } catch (err) {
        console.warn(err);
        setIsCheckingLocation(false);
        setIsLocationError(true);
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

  const handleCreateStore = async () => {
    if (
      !name ||
      !street ||
      !city ||
      !state ||
      !zip ||
      !country ||
      !location
    ) {
      Alert.alert('Error', 'Please fill in all required fields and ensure location is detected.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.post('/store/create', {
        name,
        address: { street, city, state, zip, country },
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        status,
      });
      console.log('Create store response:', response.data);

      if (response.data && response.data.store) {
        Alert.alert('Success', response.data.message || 'Store created successfully!');
        if (user) {
          setUser({ ...user, storeId: response.data.store._id });
        }
        reset('SelectCategory');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to create store.');
      }
    } catch (error: any) {
      console.error('Store creation error (catch):', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred during store creation.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Store</Text>

      <TextInput
        style={styles.input}
        placeholder="Store Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.sectionTitle}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Street"
        value={street}
        onChangeText={setStreet}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="State"
        value={state}
        onChangeText={setState}
      />
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        value={zip}
        onChangeText={setZip}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
      />

      <Text style={styles.sectionTitle}>Location (Coordinates)</Text>
      {location && (
        <View style={styles.locationDisplayContainer}>
          <Text style={styles.locationText}>
            Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {!location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationErrorText}>
            Location not detected?{' '}
          </Text>
          <TouchableOpacity onPress={checkLocationPermission}>
            <Text style={styles.retryText}>
              Fetch Location
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Status</Text>
      <Picker
        selectedValue={status}
        style={styles.picker}
        onValueChange={itemValue => setStatus(itemValue)}
      >
        <Picker.Item label="Active" value="active" />
        <Picker.Item label="Maintenance" value="maintenance" />
        <Picker.Item label="Closed" value="closed" />
      </Picker>

      <CustomButton
        title="Create Store"
        onPress={handleCreateStore}
        disabled={loading || !location}
        loading={loading}
      />

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
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            )}

            {isCheckingLocation ? (
              <>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.modalText}>
                  Verifying location...
                </Text>
              </>
            ) : (
              <>
                <Icon name="map-marker-off" size={50} color="#007AFF" />
                <Text style={styles.modalTitle}>
                  Location Required
                </Text>
                <Text style={styles.modalText}>
                  We need your location to create the store. Please enable GPS/Location Services.
                </Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  picker: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  locationDisplayContainer: {
    width: '100%',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  locationErrorText: {
    fontSize: 14,
    color: '#666',
  },
  retryText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});
