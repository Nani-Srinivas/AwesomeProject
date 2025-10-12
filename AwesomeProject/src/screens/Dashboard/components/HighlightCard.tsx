import React from 'react';
import { View, Text } from 'react-native';

export const HighlightCard = ({ styles }: { styles: any }) => {
  return (
    <View style={styles.highlightCard}>
      <View style={styles.highlightIconContainer}>
        <Text style={styles.highlightIcon}>✨</Text>
      </View>
      <View>
        <Text style={styles.highlightTitle}>Tap to Compare Prices</Text>
        <Text style={styles.highlightSubtitle}>Compare prices in one tap!</Text>
      </View>
    </View>
  );
};
