import React from 'react';
import { View, Text, TextInput } from 'react-native';

export const SearchBar = ({ styles }: { styles: any }) => {
  return (
    <View style={styles.searchBar}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        placeholder="Search & Shop anywhere"
        style={styles.searchInput}
        placeholderTextColor="#9E9E9E"
      />
    </View>
  );
};
