import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Linking, Platform, PermissionsAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';

interface Invoice {
  _id: string;
  customerId: string;
  period: string;
  invoiceUrl: string;
  createdAt: string;
}

export const InvoiceHistoryScreen = () => {
  const route = useRoute();
  const { customerId } = route.params as { customerId: string };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.get(`/invoices/${customerId}`);
        setInvoices(response.data);
      } catch (err: any) {
        console.error('Failed to fetch invoices:', err);
        setError(err.response?.data?.message || 'Failed to load invoices.');
        Alert.alert('Error', err.response?.data?.message || 'Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchInvoices();
    }
  }, [customerId]);

  const handleViewPDF = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Don't know how to open this URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open invoice PDF.');
    }
  };

  const handleDownloadPDF = async (invoiceUrl: string, period: string, invoiceId: string) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to download the invoice',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot download invoice without storage permission.');
          return;
        }
      }

      const fileName = `invoice_${period.replace(/\s/g, '_')}_${invoiceId.substring(0, 5)}.pdf`;
      const downloadDest = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/${fileName}`,
        android: `${RNFS.DownloadDirectoryPath}/${fileName}`,
      });

      if (!downloadDest) {
        Alert.alert('Error', 'Could not determine download destination.');
        return;
      }

      const { promise } = RNFS.downloadFile({
        fromUrl: invoiceUrl,
        toFile: downloadDest,
        // headers: { 'Cache-Control': 'no-store' }, // Optional: to prevent caching issues
      });

      const result = await promise;

      if (result.statusCode === 200) {
        Alert.alert('Success', `Invoice downloaded to: ${downloadDest}`);
        // Optionally, open the downloaded file
        // RNFS.viewFile(downloadDest);
      } else {
        Alert.alert('Download Failed', `Status Code: ${result.statusCode}. Check console for details.`);
        console.error('Download failed with status code:', result.statusCode);
      }
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download invoice PDF.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading invoices...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Invoices for Customer: {customerId}</Text>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.invoiceCard} onPress={() => handleViewPDF(item.invoiceUrl)}>
            <View>
              <Text style={styles.invoicePeriod}>{item.period}</Text>
              <Text style={styles.invoiceDate}>Generated: {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.iconContainer}> {/* New container for icons */}
              <TouchableOpacity onPress={() => handleViewPDF(item.invoiceUrl)} style={styles.iconButton}>
                <Feather name="external-link" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDownloadPDF(item.invoiceUrl, item.period, item._id)} style={styles.iconButton}>
                <Feather name="download" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No invoices found for this customer.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  invoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  invoicePeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  invoiceDate: {
    fontSize: 12,
    color: COLORS.accent,
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: COLORS.accent,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
});
