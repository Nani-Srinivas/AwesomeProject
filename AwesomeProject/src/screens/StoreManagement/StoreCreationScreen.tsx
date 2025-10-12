import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { apiService } from '../../services/apiService';
import { useUserStore } from '../../store/userStore';
import { reset } from '../../navigation/NavigationRef';

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
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useUserStore();

  const requestLocationPermission = async () => {
    const fetchLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLatitude(latitude.toString());
          setLongitude(longitude.toString());
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
            message: 'This app needs access to your location for store creation.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchLocation();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required for store creation.');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Initial location request on component mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleCreateStore = async () => {
        if (
          !name ||
          !street ||
          !city ||
          !state ||
          !zip ||
          !country ||
          !location // Validate that location is available
        ) {
          Alert.alert('Error', 'Please fill in all required fields and get your location.');
          return;
        }
    
        setLoading(true);
        try {
          const response = await apiService.post('/store/create', {
            name,
            address: { street, city, state, zip, country },
            location: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude], // Use fetched location
            },
            status,
          });
  console.log('Create store response:', response.data);

if (response.data && response.data.store) {
  Alert.alert('Success', response.data.message || 'Store created successfully!');
  if (user) {
    setUser({ ...user, storeId: response.data.store._id });
  }
        reset('SelectCategory'); // Navigate to SelectCategory and reset stack
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
      {/* <Button title="Get Current Location" onPress={requestLocationPermission} /> */}
      <View style={styles.locationDisplayContainer}>
        <Text style={styles.locationText}>Latitude: {latitude || 'N/A'}</Text>
        <Text style={styles.locationText}>Longitude: {longitude || 'N/A'}</Text>
      </View>

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

      <Button
        title={loading ? 'Creating...' : 'Create Store'}
        onPress={handleCreateStore}
        disabled={loading}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
