import React from 'react';
import { View, Text } from 'react-native';

export const FeatureShortcuts = ({ styles }: { styles: any }) => {
  return (
    <View style={styles.shortcutsRow}>
      <View style={styles.shortcutButton}>
        <View style={styles.shortcutIconContainer}>
          <Text style={[styles.shortcutIcon, styles.shortcutIconShop]}>🛒</Text>
        </View>
        <Text style={styles.shortcutLabel}>Shop</Text>
      </View>
      <View style={styles.shortcutButton}>
        <View style={styles.shortcutIconContainer}>
          <Text style={[styles.shortcutIcon, styles.shortcutIconInStore]}>🏷️</Text>
        </View>
        <Text style={styles.shortcutLabel}>In-store</Text>
      </View>
      <View style={styles.shortcutButton}>
        <View style={styles.shortcutIconContainer}>
          <Text style={[styles.shortcutIcon, styles.shortcutIconRewards]}>🎁</Text>
        </View>
        <Text style={styles.shortcutLabel}>Rewards</Text>
      </View>
      <View style={styles.shortcutButton}>
        <View style={styles.shortcutIconContainer}>
          <Text style={[styles.shortcutIcon, styles.shortcutIconDeals]}>🔥</Text>
        </View>
        <Text style={styles.shortcutLabel}>Deals</Text>
      </View>
      <View style={styles.shortcutButton}>
        <View style={styles.shortcutIconContainer}>
          <Text style={[styles.shortcutIcon, styles.shortcutIconSaved]}>❤️</Text>
        </View>
        <Text style={styles.shortcutLabel}>Saved</Text>
      </View>
    </View>
  );
};
