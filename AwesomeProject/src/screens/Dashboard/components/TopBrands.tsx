import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export const TopBrands = ({ styles }: { styles: any }) => {
  return (
    <View style={styles.topBrandsSection}>
      <View style={styles.topBrandsHeader}>
        <Text style={styles.sectionTitle}>Top Brands</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.brandCard}><Text style={styles.brandInitial}>A</Text></View>
        <View style={styles.brandCard}><Text style={styles.brandInitial}>N</Text></View>
        <View style={styles.brandCard}><Text style={styles.brandInitial}>A</Text></View>
        <View style={styles.brandCard}><Text style={styles.brandInitial}>P</Text></View>
        <View style={styles.brandCard}><Text style={styles.brandInitial}>S</Text></View>
      </ScrollView>
    </View>
  );
};
