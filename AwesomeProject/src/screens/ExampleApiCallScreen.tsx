import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { apiService } from '../services/apiService'; // Assuming apiService is correctly imported

export const ExampleApiCallScreen = () => {
  // Define an interface for your API response data here
  interface YourApiDataType {
    id: number;
    name: string;
    // ... other properties
  }
  const [data, setData] = useState<YourApiDataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate an API call using apiService with the AbortSignal
        // In a real scenario, replace '/some-endpoint' with your actual API endpoint
        // and adjust data/params as needed.
        const result = await apiService.get('/some-endpoint', {}, signal);
        setData(result);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Request aborted by component unmount');
          // Do nothing, as the request was intentionally cancelled
        } else {
          setError(err.message || 'Failed to fetch data');
          Alert.alert('Error', err.message || 'Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function to abort the request if the component unmounts
    return () => {
      abortController.abort();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Example API Call with Cancellation</Text>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      {data && <Text style={styles.dataText}>Data: {JSON.stringify(data, null, 2)}</Text>}
      <Button title="Refetch Data (Not implemented in this example)" onPress={() => Alert.alert('Info', 'Refetch logic would go here.')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  dataText: {
    marginTop: 10,
    textAlign: 'center',
  },
});
