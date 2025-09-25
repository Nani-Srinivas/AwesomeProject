import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const DetailsScreen = ({ route }: { route: any }) => {
  const { customer } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{customer.name}</Text>
      <Text style={styles.info}>ID: {customer.id}</Text>
      <Text style={styles.info}>Contact: {customer.contact}</Text>
      <Text style={styles.info}>Status: {customer.status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 18,
    marginBottom: 8,
  },
});