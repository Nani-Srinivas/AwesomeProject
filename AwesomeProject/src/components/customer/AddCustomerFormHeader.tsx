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
  apartments: string[];
  flatNo: string;
  setFlatNo: (text: string) => void;
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
  apartments = [],
  flatNo, setFlatNo
}: AddCustomerFormHeaderProps) => {
  const isKnownApartment = apartments.includes(address);
  // If address has a value but it's not in the list, it's a custom value (OTHER).
  // If address is empty, we show the default "Select" option (value "").
  // But if the user explicitly selected "OTHER" previously and cleared the text input, we still want to show the text input.
  // To verify this state, we might need a local state, OR just assume if it's not in the list, it's custom.
  const pickerValue = isKnownApartment ? address : 'OTHER';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Customer</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      {/* Area Selection - Moved to Top */}
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

      {/* Apartment Selection */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={pickerValue}
          onValueChange={(itemValue) => {
            if (itemValue === 'OTHER') {
              // Only clear address if we are switching FROM a known apartment.
              // If we represent "Add New" with proper UX, we might want to clear it.
              if (isKnownApartment) setAddress('');
            } else {
              setAddress(itemValue);
            }
          }}
        >
          <Picker.Item label="Select Apartment..." value="" enabled={false} />
          {apartments.map(apt => (
            <Picker.Item key={apt} label={apt} value={apt} />
          ))}
          <Picker.Item label="Add New Apartment..." value="OTHER" />
        </Picker>
      </View>

      {/* Show TextInput if 'OTHER' is selected (meaning address is custom or empty/being typed) */}
      {(pickerValue === 'OTHER' || !isKnownApartment) && (
        <TextInput
          style={styles.input}
          placeholder="Enter Apartment Name"
          value={address}
          onChangeText={setAddress}
        />
      )}

      {/* Flat Number Input */}
      <TextInput
        style={styles.input}
        placeholder="Flat No"
        value={flatNo}
        onChangeText={setFlatNo}
      />

      <TextInput style={styles.input} placeholder="Delivery Cost" value={deliveryCost} onChangeText={setDeliveryCost} keyboardType="numeric" />

      <View style={styles.switchContainer}>
        <Text>Subscribed</Text>
        <Switch value={isSubscribed} onValueChange={setIsSubscribed} />
      </View>

      {isSubscribed && (
        <TextInput style={styles.input} placeholder="Advance Amount" value={advanceAmount} onChangeText={setAdvanceAmount} keyboardType="numeric" />
      )}

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