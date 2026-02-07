// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Animated,
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
// } from 'react-native';
// import Feather from 'react-native-vector-icons/Feather';
// import { apiService } from '../../../services/apiService';

// const { height } = Dimensions.get('window');

// interface AddExtraProductModalProps {
//   isVisible: boolean;
//   onClose: () => void;
//   onAddProducts: (products: any[]) => void;
// }

// export const AddExtraProductBottomSheet: React.FC<AddExtraProductModalProps> = ({
//   isVisible,
//   onClose,
//   onAddProducts,
// }) => {
//   const [search, setSearch] = useState('');
//   const [products, setProducts] = useState<any[]>([]);
//   const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const slideAnim = useRef(new Animated.Value(height)).current;

//   useEffect(() => {
//     if (isVisible) {
//       fetchProducts();
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: height,
//         duration: 250,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [isVisible]);

//   const fetchProducts = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await apiService.get('/products/all');
//       const data = response.data.data.map((p: any) => ({
//         ...p,
//         _id: p._id ?? p.id, // fallback if _id missing
//         inStock: p.inStock ?? true,
//       }));
//       setProducts(data);
//     } catch (err) {
//       setError('Failed to fetch products.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredProducts = products.filter(p =>
//     p.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const increment = (id: string) => {
//     setQuantities(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
//   };

//   const decrement = (id: string) => {
//     setQuantities(prev => {
//       const current = prev[id] ?? 0;
//       if (current <= 1) {
//         const copy = { ...prev };
//         delete copy[id];
//         return copy;
//       }
//       return { ...prev, [id]: current - 1 };
//     });
//   };

//   const handleAdd = () => {
//     const selected = products
//       .filter(p => (quantities[p._id] ?? 0) > 0)
//       .map(p => ({
//         productId: p._id,
//         name: p.name,
//         quantity: quantities[p._id],
//       }));
//     onAddProducts(selected);
//     onClose();
//     setQuantities({});
//     setSearch('');
//   };

//   return (
//     <View style={styles.overlay}>
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.overlay} />
//       </TouchableWithoutFeedback>

//       <Animated.View
//         style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           style={{ flex: 1 }}
//         >
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.dragIndicator} />
//             <Text style={styles.title}>Add Extra Products</Text>
//           </View>

//           {/* Search */}
//           <View style={styles.searchContainer}>
//             <TextInput
//               placeholder="Search products..."
//               placeholderTextColor="#999"
//               value={search}
//               onChangeText={setSearch}
//               style={styles.searchInput}
//             />
//           </View>

//           {/* List */}
//           {loading ? (
//             <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 50 }} />
//           ) : error ? (
//             <Text style={styles.errorText}>{error}</Text>
//           ) : (
//             <FlatList
//               data={filteredProducts}
//               keyExtractor={item => item._id}
//               renderItem={({ item }) => {
//                 const qty = quantities[item._id] ?? 0;
//                 const disabled = !item.inStock;
//                 return (
//                   <View style={[styles.itemContainer, disabled && { opacity: 0.5 }]}>
//                     <Text style={styles.itemText}>{item.name}</Text>
//                     <View style={styles.qtyContainer}>
//                       <TouchableOpacity
//                         style={[styles.qtyBtn, styles.minusBtn]}
//                         onPress={() => decrement(item._id)}
//                         disabled={qty === 0 || disabled}
//                       >
//                         <Feather
//                           name="minus"
//                           size={16}
//                           color={qty === 0 || disabled ? '#ccc' : '#fff'}
//                         />
//                       </TouchableOpacity>
//                       <Text style={styles.qtyText}>{qty}</Text>
//                       <TouchableOpacity
//                         style={[styles.qtyBtn, styles.plusBtn]}
//                         onPress={() => increment(item._id)}
//                         disabled={disabled}
//                       >
//                         <Feather
//                           name="plus"
//                           size={16}
//                           color={disabled ? '#ccc' : '#fff'}
//                         />
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 );
//               }}
//               ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
//               contentContainerStyle={{ paddingBottom: 100 }}
//             />
//           )}

//           {/* Footer */}
//           <View style={styles.footer}>
//             <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
//               <Text style={styles.addText}>Add</Text>
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     position: 'absolute',
//     top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//   },
//   bottomSheet: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     height: height * 0.65,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     overflow: 'hidden',
//   },
//   header: {
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   dragIndicator: {
//     width: 40,
//     height: 4,
//     backgroundColor: '#ccc',
//     borderRadius: 2,
//     marginBottom: 6,
//   },
//   title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
//   searchContainer: {
//     margin: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   searchInput: { flex: 1, height: 40, fontSize: 14, color: '#333' },
//   itemContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   itemText: { fontSize: 15, color: '#333' },
//   qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   qtyBtn: { padding: 6, borderRadius: 6 },
//   plusBtn: { backgroundColor: '#27ae60' },
//   minusBtn: { backgroundColor: '#d9534f' },
//   qtyText: { minWidth: 20, textAlign: 'center', fontSize: 15, color: '#333' },
//   emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
//   errorText: { textAlign: 'center', marginTop: 50, color: 'red' },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   cancelBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#f2f2f2', borderRadius: 8 },
//   cancelText: { color: '#555', fontWeight: '500' },
//   addBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#27ae60', borderRadius: 8 },
//   addText: { color: '#fff', fontWeight: '600' },
// });


import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { apiService } from '../../../services/apiService';

const { height } = Dimensions.get('window');

interface AddExtraProductModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddProducts: (products: any[]) => void;
}

export const AddExtraProductBottomSheet: React.FC<AddExtraProductModalProps> = ({
  isVisible,
  onClose,
  onAddProducts,
}) => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomSheetAnim = useRef(new Animated.Value(height)).current;
  const topSheetAnim = useRef(new Animated.Value(height)).current;

  const BOTTOM_SHEET_HEIGHT = height * 0.6; // 60%
  const TOP_SHEET_HEIGHT = height * 0.3;    // 30%
  const GAP_BETWEEN_SHEETS = 12;            // small gap

  useEffect(() => {
    if (isVisible) {
      fetchProducts();
      openBottomSheet();
    } else {
      closeAllSheets();
    }
  }, [isVisible]);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      openTopSheet();
    } else {
      closeTopSheet();
    }
  }, [selectedProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/product/store');
      // The controller returns { success: true, data: [...] }
      const data = response.data.data.map((p: any) => ({
        ...p,
        _id: p._id ?? p.id,
        inStock: p.inStock ?? true,
      }));
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openBottomSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: height - BOTTOM_SHEET_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const openTopSheet = () => {
    Animated.timing(topSheetAnim, {
      toValue: height - BOTTOM_SHEET_HEIGHT - TOP_SHEET_HEIGHT - GAP_BETWEEN_SHEETS,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeTopSheet = () => {
    Animated.timing(topSheetAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseTopSheet = () => {
    setSelectedProducts([]);
    setQuantities({});
  };

  const closeAllSheets = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start();
    closeTopSheet();
    setSelectedProducts([]);
    setQuantities({});
    setSearch('');
    onClose();
  };

  const filteredProducts = products.filter(
    p =>
      !selectedProducts.some(sp => sp._id === p._id) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectProduct = (product: any) => {
    if (!selectedProducts.find(p => p._id === product._id)) {
      setSelectedProducts(prev => [...prev, product]);
      setQuantities(prev => ({ ...prev, [product._id]: 1 }));
    }
  };

  const increment = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const decrement = (id: string) => {
    setQuantities(prev => {
      const current = prev[id] ?? 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        setSelectedProducts(prevProducts =>
          prevProducts.filter(p => p._id !== id)
        );
        return copy;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleAdd = () => {
    const finalProducts = selectedProducts.map(p => ({
      productId: p._id,
      name: p.name,
      quantity: quantities[p._id],
    }));
    onAddProducts(finalProducts);
    closeAllSheets();
  };

  return (
    <TouchableWithoutFeedback onPress={closeAllSheets}>
      <View style={styles.overlay}>
        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: bottomSheetAnim }], height: BOTTOM_SHEET_HEIGHT },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.header}>
              <View style={styles.dragIndicator} />
              <Text style={styles.title}>Select Products</Text>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search products..."
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 50 }} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.itemContainer, !item.inStock && { opacity: 0.5 }]}
                    onPress={() => selectProduct(item)}
                    disabled={!item.inStock}
                  >
                    <Text style={styles.itemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
                contentContainerStyle={{ paddingBottom: 80 }}
              />
            )}
          </KeyboardAvoidingView>
        </Animated.View>

        {/* Top Sheet */}
        {selectedProducts.length > 0 && (
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: topSheetAnim }],
                height: TOP_SHEET_HEIGHT,
                position: 'absolute',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
            >
              <View style={styles.header}>
                <View style={styles.dragIndicator} />
                <Text style={styles.title}>Selected Products</Text>
              </View>

              <FlatList
                data={selectedProducts}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>{item.name}</Text>
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        style={[styles.qtyBtn, styles.minusBtn]}
                        onPress={() => decrement(item._id)}
                      >
                        <Feather name="minus" size={16} color="#fff" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{quantities[item._id]}</Text>
                      <TouchableOpacity
                        style={[styles.qtyBtn, styles.plusBtn]}
                        onPress={() => increment(item._id)}
                      >
                        <Feather name="plus" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 80 }}
              />

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCloseTopSheet}
                >
                  <Text style={styles.cancelText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
  bottomSheet: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: { alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dragIndicator: { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 6 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  searchContainer: { margin: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: '#333' },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 15, color: '#333' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { padding: 6, borderRadius: 6 },
  plusBtn: { backgroundColor: '#27ae60' },
  minusBtn: { backgroundColor: '#d9534f' },
  qtyText: { minWidth: 20, textAlign: 'center', fontSize: 15, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' },
  errorText: { textAlign: 'center', marginTop: 50, color: 'red' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#f2f2f2', borderRadius: 8 },
  cancelText: { color: '#555', fontWeight: '500' },
  addBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#27ae60', borderRadius: 8 },
  addText: { color: '#fff', fontWeight: '600' },
});