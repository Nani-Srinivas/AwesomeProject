import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { AddAreaModal } from '../../components/area/AddAreaModal';
import { EditAreaModal } from '../../components/area/EditAreaModal';

import { apiService } from '../../services/apiService';

const getStatusStyle = (status: boolean) => {
  switch (status) {
    case true:
      return { color: '#4CAF50', backgroundColor: '#E6F7E6' };
    case false:
      return { color: '#F44336', backgroundColor: '#FDEDED' };
    default:
      return { color: COLORS.primary, backgroundColor: '#E6F0FA' };
  }
};

const AreaCard = ({ area, onPress, onEdit, onDelete }: { area: any, onPress: () => void, onEdit: (area: any) => void, onDelete: (area: any) => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(area.isActive).color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.areaName}>{area.name}</Text>
      <Text style={styles.areaInfo}>ID | {area._id}</Text>
      <Text style={styles.areaInfo}>Total Subscribed Items: {area.totalSubscribedItems}</Text>
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(area.isActive).backgroundColor }]}>
      <Text style={[styles.statusText, { color: getStatusStyle(area.isActive).color }]}>
        {area.isActive ? 'Active' : 'Inactive'}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onEdit(area)} style={styles.editButton}>
      <Feather name="edit-2" size={20} color={COLORS.text} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onDelete(area)} style={styles.deleteButton}>
      <Feather name="trash-2" size={20} color={COLORS.danger} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <Feather name="map-pin" size={50} color={COLORS.text} style={styles.emptyStateIcon} />
    <Text style={styles.emptyStateText}>No areas found.</Text>
    <Text style={styles.emptyStateSubText}>Tap the '+' button to add a new area.</Text>
  </View>
);

export const AreaListScreen = ({ navigation: _navigation, route }: { navigation: any, route: any }) => {
  const [filter, setFilter] = useState(route.params?.filter || 'All');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [areas, setAreas] = useState([]);
  const [editingArea, setEditingArea] = useState<any>(null);

  const fetchAreas = async () => {
    try {
      const response = await apiService.get('/delivery/area');
      setAreas(response.data.data);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
      Alert.alert('Error', 'Failed to fetch areas. Please try again.');
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const filteredAreas = useMemo(() => {
    if (filter === 'All') return areas;
    return areas.filter((area) => (filter === 'Active' ? area.isActive : !area.isActive));
  }, [filter, areas]);

  const handleAreaPress = (area: any) => {
    console.log('Area Pressed:', area);
  };

  const handleAddArea = useCallback(() => {
    setAddModalVisible(true);
  }, []);

  const onAddArea = useCallback(() => {
    fetchAreas();
    setAddModalVisible(false);
  }, []);

  const handleEditPress = (area: any) => {
    setEditingArea(area);
    setEditModalVisible(true);
  };

  const handleSaveArea = (updatedArea: any) => {
    setAreas(prev =>
      prev.map(a => (a._id === updatedArea._id ? updatedArea : a))
    );
    setEditModalVisible(false);
    setEditingArea(null);
    Alert.alert('Success', `Area "${updatedArea.name}" has been updated.`);
  };

  const handleDeleteArea = async (area: any) => {
    Alert.alert(
      'Delete Area',
      `Are you sure you want to delete ${area.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await apiService.delete(`/delivery/area/delete/${area._id}`);
              fetchAreas();
              Alert.alert('Success', `Area "${area.name}" has been deleted.`);
            } catch (error) {
              console.error('Failed to delete area:', error);
              Alert.alert('Error', 'Failed to delete area. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
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
            onDelete={handleDeleteArea}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.scrollViewContent}
        ListEmptyComponent={<EmptyState />}
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
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    right: 56,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateIcon: {
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 5,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
