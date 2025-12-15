import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { apiService } from '../../../services/apiService';

export const CustomersSection = ({ navigation }: { navigation: any }) => {
  const [counts, setCounts] = useState({ total: 0, paid: 0, pending: 0 });

  useFocusEffect(
    useCallback(() => {
      const fetchCustomerCounts = async () => {
        try {
          const response = await apiService.getCustomers();
          if (response.data.success) {
            const customers = response.data.data || [];
            const total = customers.length;
            const paid = customers.filter((c: any) => (c.paymentStatus || c.Bill) === 'Paid').length;
            // Considering non-paid as pending (Unpaid, Partially Paid, Pending)
            const pending = total - paid;

            setCounts({ total, paid, pending });
          }
        } catch (error) {
          console.error('Failed to fetch customer counts:', error);
        }
      };

      fetchCustomerCounts();
    }, [])
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.titleContainer}>
        <View style={styles.titleIndicator} />
        <Text style={styles.sectionTitle}>Customers</Text>
      </View>
      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.largeCardWrapper} onPress={() => navigation.navigate('CustomerList', { filter: 'All' })}>
          <View style={styles.largeCard}>
            <View style={styles.cardContent}>
              <Feather name="users" size={32} color="#FFFFFF" />
              <View style={styles.textContainer}>
                <Text style={styles.largeCardLabel}>Customers</Text>
                <Text style={styles.largeCardValue}>{counts.total}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.smallCardsColumn}>
          <TouchableOpacity onPress={() => navigation.navigate('CustomerList', { filter: 'Paid' })}>
            <View style={styles.smallCardGreen}>
              <View style={styles.cardContent}>
                <Feather name="user-check" size={24} color="#FFFFFF" />
                <View style={styles.textContainer}>
                  <Text style={styles.smallCardLabel}>Paid</Text>
                  <Text style={styles.smallCardValue}>{counts.paid}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CustomerList', { filter: 'Pending' })}>
            <View style={styles.smallCardOrange}>
              <View style={styles.cardContent}>
                <Feather name="user-x" size={24} color="#FFFFFF" />
                <View style={styles.textContainer}>
                  <Text style={styles.smallCardLabel}>Pending</Text>
                  <Text style={styles.smallCardValue}>{counts.pending}</Text>

                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#1E73B8',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  largeCard: {
    flex: 1,
    backgroundColor: '#0066FF',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
  largeCardLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  largeCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  smallCardsColumn: {
    flex: 1,
    marginLeft: 8,
  },
  smallCardGreen: {
    backgroundColor: '#34A853',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    justifyContent: 'center',
  },
  smallCardOrange: {
    backgroundColor: '#FB8C00',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  smallCardLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  smallCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  largeCardWrapper: {
    flex: 1,
    marginRight: 8,
  },
});
