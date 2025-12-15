import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, FlatList } from 'react-native';
import { Button } from '../common/Button';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';

interface AddCustomerFormHeaderProps {
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
  areas: any[];
  selectedArea: any;
  setSelectedArea: (value: any) => void;
}

export const AddCustomerFormHeader = React.memo(({
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
  areas,
  selectedArea,
  setSelectedArea,
}: AddCustomerFormHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Customer</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Address (Apartment/Building)" value={address} onChangeText={setAddress} />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedArea}
          onValueChange={(itemValue) => setSelectedArea(itemValue)}
        >
          {areas.map(area => (
            <Picker.Item key={area._id} label={area.name} value={area._id} />
          ))}
        </Picker>
      </View>
      <TextInput style={styles.input} placeholder="Delivery Cost" value={deliveryCost} onChangeText={setDeliveryCost} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Advance Amount" value={advanceAmount} onChangeText={setAdvanceAmount} keyboardType="numeric" />
      <View style={styles.switchContainer}>
        <Text>Subscribed</Text>
        <Switch value={isSubscribed} onValueChange={setIsSubscribed} />
      </View>

      <Button title="Manage Required Products" onPress={() => setProductSelectorVisible(true)} />


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
  pickerContainer: {
    width: '100%',
    height: 50,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 5,
  },

});