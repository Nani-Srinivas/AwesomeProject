import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { AddDeliveryBoyModal } from '../../components/deliveryBoy/AddDeliveryBoyModal';
import { EditDeliveryBoyModal } from '../../components/deliveryBoy/EditDeliveryBoyModal';

const initialDeliveryBoys = [
  {
    id: '#DB1001',
    name: 'Rahul Sharma',
    contact: '+91 9988776655',
    status: 'Active',
  },
  {
    id: '#DB1002',
    name: 'Priya Singh',
    contact: '+91 9977665544',
    status: 'Inactive',
  },
  {
    id: '#DB1003',
    name: 'Amit Kumar',
    contact: '+91 9966554433',
    status: 'On-Duty',
  },
  {
    id: '#DB1004',
    name: 'Sneha Gupta',
    contact: '+91 9955443322',
    status: 'Active',
  },
  {
    id: '#DB1005',
    name: 'Vikas Yadav',
    contact: '+91 9944332211',
    status: 'Inactive',
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Active':
      return { color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
    case 'Inactive':
      return { color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
    case 'On-Duty':
      return { color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' };
    default:
      return { color: COLORS.primary, backgroundColor: 'rgba(30, 115, 184, 0.1)' };
  }
};

const DeliveryBoyCard = ({ deliveryBoy, onPress, onEdit }: { deliveryBoy: any, onPress: () => void, onEdit: (deliveryBoy: any) => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.statusBorder, { backgroundColor: getStatusStyle(deliveryBoy.status).color }]} />
    <View style={styles.cardContent}>
      <Text style={styles.deliveryBoyName}>{deliveryBoy.name}</Text>
      <Text style={styles.deliveryBoyInfo}>ID | {deliveryBoy.id}</Text>
      <Text style={styles.deliveryBoyInfo}>Contact: {deliveryBoy.contact}</Text>
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(deliveryBoy.status).backgroundColor }]}>
      <Text style={[styles.statusText, { color: getStatusStyle(deliveryBoy.status).color }]}>
        {deliveryBoy.status}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onEdit(deliveryBoy)} style={styles.editButton}>
      <Feather name="edit-2" size={20} color={COLORS.text} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export const DeliveryBoyListScreen = ({ navigation: _navigation, route }: { navigation: any, route: any }) => {
  const [filter, setFilter] = useState(route.params?.filter || 'All');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState(initialDeliveryBoys);
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState<any>(null);

  const filteredDeliveryBoys = useMemo(() => {
    if (filter === 'All') {
      return deliveryBoys;
    }
    return deliveryBoys.filter((deliveryBoy) => deliveryBoy.status === filter);
  }, [filter, deliveryBoys]);

  const handleDeliveryBoyPress = (deliveryBoy: any) => {
    console.log('Delivery Boy Pressed:', deliveryBoy);
  };

  const handleAddDeliveryBoy = useCallback(() => {
    setAddModalVisible(true);
  }, []);

  const onAddDeliveryBoy = useCallback((name: string, contact: string) => {
    const newDeliveryBoy = {
      id: `#DB${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      contact,
      status: 'Active',
    };
    setDeliveryBoys(prev => [newDeliveryBoy, ...prev]);
    setAddModalVisible(false);
    Alert.alert('Success', `Delivery boy "${name}" has been added.`);
  }, []);

  const handleEditPress = (deliveryBoy: any) => {
    setEditingDeliveryBoy(deliveryBoy);
    setEditModalVisible(true);
  };

  const handleSaveDeliveryBoy = (updatedDeliveryBoy: any) => {
    setDeliveryBoys(prev =>
      prev.map(db => (db.id === updatedDeliveryBoy.id ? updatedDeliveryBoy : db))
    );
    setEditModalVisible(false);
    setEditingDeliveryBoy(null);
    Alert.alert('Success', `Delivery boy "${updatedDeliveryBoy.name}" has been updated.`);
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
        <TouchableOpacity style={[styles.filterTab, filter === 'On-Duty' && styles.activeTab]} onPress={() => setFilter('On-Duty')}>
          <Text style={[styles.filterText, filter === 'On-Duty' && styles.activeFilterText]}>On-Duty</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredDeliveryBoys}
        renderItem={({ item }) => (
          <DeliveryBoyCard
            deliveryBoy={item}
            onPress={() => handleDeliveryBoyPress(item)}
            onEdit={handleEditPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollViewContent}
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
  // statusBadge: {
  //   position: 'absolute',
  //   top: 16,
  //   right: 16,
  //   paddingVertical: 4,
  //   paddingHorizontal: 10,
  //   borderRadius: 12,
  // },
  // statusText: {
  //   fontSize: 12,
  //   fontWeight: '600',
  // },

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
