import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, FlatList } from 'react-native';
import { Button } from '../common/Button';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';

interface EditCustomerFormHeaderProps {
  name: string;
  setName: (text: string) => void;
  phone: string;
  setPhone: (text: string) => void;
  address: string;
  setAddress: (text: string) => void;
  deliveryCost: string;
  setDeliveryCost: (text: string) => void;
  advanceAmount: string;
  setAdvanceAmount: (text: string) => void;
  isSubscribed: boolean;
  setIsSubscribed: (value: boolean) => void;
  setProductSelectorVisible: (value: boolean) => void;
  requiredProducts: any[];
  handleQuantityChange: (text: string, index: number) => void;
  handleRemoveProduct: (index: number) => void;
}

export const EditCustomerFormHeader = React.memo(({
  name, setName,
  phone, setPhone,
  address, setAddress,
  deliveryCost, setDeliveryCost,
  advanceAmount, setAdvanceAmount,
  isSubscribed, setIsSubscribed,
  setProductSelectorVisible,
  requiredProducts,
  handleQuantityChange,
  handleRemoveProduct,
}: EditCustomerFormHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Customer</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Address (Apartment/Building)" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="Delivery Cost" value={deliveryCost} onChangeText={setDeliveryCost} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Advance Amount" value={advanceAmount} onChangeText={setAdvanceAmount} keyboardType="numeric" />
      <View style={styles.switchContainer}>
        <Text>Subscribed</Text>
        <Switch value={isSubscribed} onValueChange={setIsSubscribed} />
      </View>
      
      <Button title="Manage Required Products" onPress={() => setProductSelectorVisible(true)} />

      <Text style={styles.listHeader}>Required Products</Text>
      <View style={styles.productListContainer}>
        <FlatList
          data={requiredProducts}
          keyExtractor={item => item.product._id}
          renderItem={({ item, index }) => (
            <View style={styles.productItem}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <TextInput
                style={styles.quantityInput}
                value={String(item.quantity)}
                onChangeText={(text) => handleQuantityChange(text, index)}
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                <Feather name="x-circle" size={22} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyListText}>No products selected.</Text>}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
    textAlign: 'center',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.text,
    alignSelf: 'flex-start',
  },
  productListContainer: {
    width: '100%',
    minHeight: 50, // Ensure it has some height even if empty
    maxHeight: 150, // Adjust as needed
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 8,
    marginTop: 10,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  productName: {
    flex: 1,
  },
  quantityInput: {
    width: 50,
    textAlign: 'center',
    borderColor: COLORS.grey,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 5,
    marginHorizontal: 10,
  },
  emptyListText: {
    textAlign: 'center',
    padding: 20,
    color: COLORS.grey,
  },
});