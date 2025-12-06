import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { AddDeliveryBoyModal } from '../../components/deliveryBoy/AddDeliveryBoyModal';
import { EditDeliveryBoyModal } from '../../components/deliveryBoy/EditDeliveryBoyModal';
import { EmptyState } from '../../components/common/EmptyState';
import { DependencyPrompt } from '../../components/common/DependencyPrompt';
import { apiService } from '../../services/apiService';
import { checkAreasExist } from '../../utils/dependencyChecks';

const getStatusStyle = (status: boolean) => {
  switch (status) {
    case true:
      return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
    case false:
      return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
    default:
      return { color: COLORS.primary, backgroundColor: 'rgba(30, 115, 184, 0.1)' };
  }
};

const DeliveryBoyCard = ({ deliveryBoy, onPress, onEdit, onDelete }: { deliveryBoy: any, onPress: () => void, onEdit: (deliveryBoy: any) => void, onDelete: (deliveryBoy: any) => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(deliveryBoy.isActive).color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.deliveryBoyName}>{deliveryBoy.name}</Text>
      <Text style={styles.deliveryBoyInfo}>ID | {deliveryBoy._id}</Text>
      <Text style={styles.deliveryBoyInfo}>Contact: {deliveryBoy.phone}</Text>
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(deliveryBoy.isActive).backgroundColor }]}>
      <Text style={[styles.statusText, { color: getStatusStyle(deliveryBoy.isActive).color }]}>
        {deliveryBoy.isActive ? 'Active' : 'Inactive'}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onEdit(deliveryBoy)} style={styles.editButton}>
      <Feather name="edit-2" size={20} color={COLORS.text} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onDelete(deliveryBoy)} style={styles.deleteButton}>
      <Feather name="trash-2" size={20} color={COLORS.danger} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const DeliveryBoyEmptyState = ({ onAddPress }: { onAddPress: () => void }) => (
  <EmptyState
    icon="🚴"
    title="No Delivery Partners Yet"
    description="Delivery partners handle order deliveries in specific areas. Add your first delivery partner to get started."
    actionLabel="Add Delivery Partner"
    onAction={onAddPress}
  />
);

export const DeliveryBoyListScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [filter, setFilter] = useState(route.params?.filter || 'All');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState<any>(null);
  const [showDependencyPrompt, setShowDependencyPrompt] = useState(false);

  const fetchDeliveryBoys = async () => {
    try {
      const response = await apiService.get('/delivery/delivery-boys');
      setDeliveryBoys(response.data.data);
    } catch (error) {
      console.error('Failed to fetch delivery boys:', error);
      Alert.alert('Error', 'Failed to fetch delivery boys. Please try again.');
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const filteredDeliveryBoys = useMemo(() => {
    if (filter === 'All') {
      return deliveryBoys;
    }
    return deliveryBoys.filter((deliveryBoy) => (filter === 'Active' ? deliveryBoy.isActive : !deliveryBoy.isActive));
  }, [filter, deliveryBoys]);

  const handleDeliveryBoyPress = (deliveryBoy: any) => {
    console.log('Delivery Boy Pressed:', deliveryBoy);
  };

  const handleAddDeliveryBoy = useCallback(async () => {
    // Check if areas exist before allowing delivery boy creation
    const hasAreas = await checkAreasExist();
    if (!hasAreas) {
      setShowDependencyPrompt(true);
      return;
    }
    setAddModalVisible(true);
  }, []);

  const onAddDeliveryBoy = useCallback(() => {
    fetchDeliveryBoys();
    setAddModalVisible(false);
  }, []);

  const handleEditPress = (deliveryBoy: any) => {
    setEditingDeliveryBoy(deliveryBoy);
    setEditModalVisible(true);
  };

  const handleSaveDeliveryBoy = (updatedDeliveryBoy: any) => {
    setDeliveryBoys(prev =>
      prev.map(db => (db._id === updatedDeliveryBoy._id ? updatedDeliveryBoy : db))
    );
    setEditModalVisible(false);
    setEditingDeliveryBoy(null);
    Alert.alert('Success', `Delivery boy "${updatedDeliveryBoy.name}" has been updated.`);
  };

  const handleDeleteDeliveryBoy = async (deliveryBoy: any) => {
    Alert.alert(
      'Delete Delivery Boy',
      `Are you sure you want to delete ${deliveryBoy.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await apiService.delete(`/delivery/delivery-boy/delete/${deliveryBoy._id}`);
              fetchDeliveryBoys();
              Alert.alert('Success', `Delivery boy "${deliveryBoy.name}" has been deleted.`);
            } catch (error) {
              console.error('Failed to delete delivery boy:', error);
              Alert.alert('Error', 'Failed to delete delivery boy. Please try again.');
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
        data={filteredDeliveryBoys}
        renderItem={({ item }) => (
          <DeliveryBoyCard
            deliveryBoy={item}
            onPress={() => handleDeliveryBoyPress(item)}
            onEdit={handleEditPress}
            onDelete={handleDeleteDeliveryBoy}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.scrollViewContent}
        ListEmptyComponent={<DeliveryBoyEmptyState onAddPress={handleAddDeliveryBoy} />}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddDeliveryBoy}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddDeliveryBoyModal
        isVisible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddDeliveryBoy={onAddDeliveryBoy}
      />

      {editingDeliveryBoy && (
        <EditDeliveryBoyModal
          isVisible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          deliveryBoy={editingDeliveryBoy}
          onSave={handleSaveDeliveryBoy}
        />
      )}

      <DependencyPrompt
        visible={showDependencyPrompt}
        title="Create an Area First"
        message="To add delivery partners, please create a delivery area first. Areas help organize deliveries by location."
        actionLabel="Create Area"
        onAction={() => navigation.navigate('AreaList')}
        onDismiss={() => setShowDependencyPrompt(false)}
      />
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
  deliveryBoyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 80, // Make space for the badge
  },
  deliveryBoyInfo: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopRightRadius: 12,   // match card's radius
    borderBottomLeftRadius: 12, // diagonal rounded edge
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  statusText: {
    fontSize: 12,
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
