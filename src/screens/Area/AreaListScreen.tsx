import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { AddAreaModal } from '../../components/area/AddAreaModal';
import { EditAreaModal } from '../../components/area/EditAreaModal';

const initialAreas = [
  { id: '#AREA001', name: 'Downtown', pincode: '10001', status: 'Active' },
  { id: '#AREA002', name: 'Uptown', pincode: '10002', status: 'Inactive' },
  { id: '#AREA003', name: 'Midtown', pincode: '10003', status: 'Active' },
  { id: '#AREA004', name: 'Westside', pincode: '10004', status: 'Active' },
  { id: '#AREA005', name: 'Eastside', pincode: '10005', status: 'Inactive' },
];

// Updated colors for modern badge style
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Active':
      return { color: '#4CAF50', backgroundColor: '#E6F7E6' };
    case 'Inactive':
      return { color: '#F44336', backgroundColor: '#FDEDED' };
    default:
      return { color: COLORS.primary, backgroundColor: '#E6F0FA' };
  }
};

const AreaCard = ({ area, onPress, onEdit }: { area: any, onPress: () => void, onEdit: (area: any) => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(area.status).color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.areaName}>{area.name}</Text>
      <Text style={styles.areaInfo}>ID | {area.id}</Text>
      <Text style={styles.areaInfo}>Pincode: {area.pincode}</Text>
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(area.status).backgroundColor }]}>
      <Text style={[styles.statusText, { color: getStatusStyle(area.status).color }]}>
        {area.status}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onEdit(area)} style={styles.editButton}>
      <Feather name="edit-2" size={20} color={COLORS.text} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export const AreaListScreen = ({ navigation: _navigation, route }: { navigation: any, route: any }) => {
  const [filter, setFilter] = useState(route.params?.filter || 'All');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [areas, setAreas] = useState(initialAreas);
  const [editingArea, setEditingArea] = useState<any>(null);

  const filteredAreas = useMemo(() => {
    if (filter === 'All') return areas;
    return areas.filter((area) => area.status === filter);
  }, [filter, areas]);

  const handleAreaPress = (area: any) => {
    console.log('Area Pressed:', area);
  };

  const handleAddArea = useCallback(() => {
    setAddModalVisible(true);
  }, []);

  const onAddArea = useCallback((name: string, pincode: string) => {
    const newArea = {
      id: `#AREA${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      pincode,
      status: 'Active',
    };
    setAreas(prev => [newArea, ...prev]);
    setAddModalVisible(false);
    Alert.alert('Success', `Area "${name}" has been added.`);
  }, []);

  const handleEditPress = (area: any) => {
    setEditingArea(area);
    setEditModalVisible(true);
  };

  const handleSaveArea = (updatedArea: any) => {
    setAreas(prev =>
      prev.map(a => (a.id === updatedArea.id ? updatedArea : a))
    );
    setEditModalVisible(false);
    setEditingArea(null);
    Alert.alert('Success', `Area "${updatedArea.name}" has been updated.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterTab, filter === 'All' && styles.activeTab]} onPress={() => setFilter('All')}>
          <Text style={[styles.filterText, filter === 'All' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'Active' && styles.activeTab]} onPress={() => setFilter('Active')}>
          <Text style={[styles.filterText, filter === 'Active' && styles.activeFilterText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, filter === 'Inactive' && styles.activeTab]} onPress={() => setFilter('Inactive')}>
          <Text style={[styles.filterText, filter === 'Inactive' && styles.activeFilterText]}>Inactive</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredAreas}
        renderItem={({ item }) => (
          <AreaCard
            area={item}
            onPress={() => handleAreaPress(item)}
            onEdit={handleEditPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollViewContent}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddArea}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddAreaModal
        isVisible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddArea={onAddArea}
      />

      {editingArea && (
        <EditAreaModal
          isVisible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          area={editingArea}
          onSave={handleSaveArea}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.white,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.background,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.text,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  scrollViewContent: {
    paddingBottom: 80, // To make space for the FAB
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  statusBorder: {
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 80, // Make space for the badge
  },
  areaInfo: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 4,
  },
  // Status Badge hugging the corner
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopRightRadius: 12,     // same as card radius
    borderBottomLeftRadius: 12,   // tag-like shape
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    elevation: 8,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
});
