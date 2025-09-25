import React from 'react';
import { View, Text } from 'react-native';

export const Header = ({ styles }: { styles: any }) => {
  return (
    <View style={styles.header}>
      <View style={styles.iconButton}>
        <Text style={styles.icon}>≡</Text>
      </View>
      <Text style={styles.logo}>FLEXIPAY</Text>
      <View style={styles.iconButton}>
        <Text style={styles.icon}>👤</Text>
      </View>
    </View>
  );
};
