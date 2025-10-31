import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';

interface Invoice {
  _id: string;
  customerId: string;
  billNo: string;
  period: string;
  fromDate: string;
  toDate: string;
  grandTotal: string;
  url: string;  // Updated to match new API response
  generatedAt: string;
}

export const InvoiceHistoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { customerId } = route.params as { customerId: string };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        // Updated API endpoint to match the new service
        const response = await apiService.get(`/invoice/customer/${customerId}`);
        setInvoices(response.data.invoices || []);
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

  const handleViewInvoice = (invoice: Invoice) => {
    // Navigate to invoice preview screen or open in web view
    // For now, we'll use the existing statement period selection
    navigation.navigate('StatementPeriodSelection', { customerId });
  };

  const handleDownloadPDF = async (invoiceUrl: string, billNo: string) => {
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

      const fileName = `${billNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
      });

      const result = await promise;

      if (result.statusCode === 200) {
        Alert.alert('Success', `Invoice downloaded to: ${downloadDest}`);
      } else {
        Alert.alert('Download Failed', `Status Code: ${result.statusCode}. Check console for details.`);
        console.error('Download failed with status code:', result.statusCode);
      }
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download invoice PDF.');
    }
  };

  const handleShareInvoice = (invoice: Invoice) => {
    // For now, just show an alert - in a real app, implement actual sharing
    Alert.alert('Share Invoice', `Sharing functionality for ${invoice.billNo} would go here.`);
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
      <View style={styles.header}>
        <Text style={styles.headerText}>Invoice History</Text>
        <Text style={styles.subHeaderText}>Customer: {customerId}</Text>
      </View>
      
      <FlatList
        data={invoices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.invoiceCard}>
            <View style={styles.invoiceInfo}>
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceNumber}>{item.billNo}</Text>
                <Text style={styles.invoiceAmount}>₹{item.grandTotal}</Text>
              </View>
              <Text style={styles.invoicePeriod}>{item.period}</Text>
              <Text style={styles.invoiceDate}>Generated: {new Date(item.generatedAt).toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.invoiceActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleViewInvoice(item)}
              >
                <Feather name="eye" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleShareInvoice(item)}
              >
                <Feather name="share-2" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDownloadPDF(item.url, item.billNo)}
              >
                <Feather name="download" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={styles.emptySubtext}>Invoices will appear here once generated</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 14,
    color: COLORS.accent,
    textAlign: 'center',
  },
  invoiceCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceInfo: {
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  invoicePeriod: {
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#999',
  },
  invoiceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  actionButton: {
    marginLeft: 20,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.accent,
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});
