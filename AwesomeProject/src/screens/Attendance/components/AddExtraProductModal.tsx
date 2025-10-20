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
//   customer?: any;
// }

// export const AddExtraProductBottomSheet: React.FC<AddExtraProductModalProps> = ({
//   isVisible,
//   onClose,
//   onAddProducts,
// }) => {
//   const [search, setSearch] = useState('');
//   const [products, setProducts] = useState<any[]>([]);
//   const [filteredData, setFilteredData] = useState<any[]>([]);
//   const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
//   const [isLoading, setIsLoading] = useState(false);
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
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await apiService.get('/products/all');
//       setProducts(response.data.data);
//       setFilteredData(response.data.data);
//     } catch (err) {
//       setError('Failed to fetch products.');
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSearch = (text: string) => {
//     setSearch(text);
//     const filtered = products.filter(item =>
//       item.name.toLowerCase().includes(text.toLowerCase())
//     );
//     setFilteredData(filtered);
//   };

//   const incrementQty = (id: string) => {
//     setQuantities(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
//   };

//   const decrementQty = (id: string) => {
//     setQuantities(prev => {
//       const current = prev[id] ?? 0;
//       if (current <= 1) {
//         const updated = { ...prev };
//         delete updated[id];
//         return updated;
//       }
//       return { ...prev, [id]: current - 1 };
//     });
//   };

//   const handleAdd = () => {
//     const selected = products
//       .filter(item => quantities[item._id] > 0)
//       .map(item => ({
//         productId: item._id,
//         name: item.name,
//         quantity: quantities[item._id],
//       }));

//     onAddProducts(selected);
//     onClose();
//     setSearch('');
//     setQuantities({});
//   };

//   return (
//     <TouchableWithoutFeedback onPress={onClose}>
//       <View style={styles.overlay}>
//         <TouchableWithoutFeedback>
//           <Animated.View
//             style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
//           >
//             <KeyboardAvoidingView
//               behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//               style={{ flex: 1 }}
//             >
//               {/* Header */}
//               <View style={styles.header}>
//                 <View style={styles.dragIndicator} />
//                 <Text style={styles.title}>Add Extra Products</Text>
//               </View>

//               {/* Search Bar */}
//               <View style={styles.searchContainer}>
//                 <TextInput
//                   placeholder="Search products..."
//                   placeholderTextColor="#999"
//                   value={search}
//                   onChangeText={handleSearch}
//                   style={styles.searchInput}
//                 />
//               </View>

//               {/* Product List */}
//               {isLoading ? (
//                 <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 50 }} />
//               ) : error ? (
//                 <Text style={styles.errorText}>{error}</Text>
//               ) : (
//                 <FlatList
//                   data={filteredData}
//                   keyExtractor={item => item._id.toString()}
//                   renderItem={({ item }) => {
//                     const qty = quantities[item._id] ?? 0;
//                     const disabled = !item.inStock;

//                     return (
//                       <View
//                         style={[styles.itemContainer, disabled && { opacity: 0.5 }]}
//                       >
//                         <Text style={styles.itemText}>{item.name}</Text>
//                         <View style={styles.qtyContainer}>
//                           <TouchableOpacity
//                             style={[styles.qtyBtn, styles.minusBtn]}
//                             onPress={() => decrementQty(item._id)}
//                             disabled={qty === 0 || disabled}
//                           >
//                             <Feather
//                               name="minus"
//                               size={16}
//                               color={qty === 0 || disabled ? '#ccc' : '#fff'}
//                             />
//                           </TouchableOpacity>
//                           <Text style={styles.qtyText}>{qty}</Text>
//                           <TouchableOpacity
//                             style={[styles.qtyBtn, styles.plusBtn]}
//                             onPress={() => incrementQty(item._id)}
//                             disabled={disabled}
//                           >
//                             <Feather name="plus" size={16} color={disabled ? '#ccc' : '#fff'} />
//                           </TouchableOpacity>
//                         </View>
//                       </View>
//                     );
//                   }}
//                   ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
//                   contentContainerStyle={{ paddingBottom: 100 }}
//                 />
//               )}

//               {/* Footer Buttons */}
//               <View style={styles.footer}>
//                 <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
//                   <Text style={styles.cancelText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
//                   <Text style={styles.addText}>Add</Text>
//                 </TouchableOpacity>
//               </View>
//             </KeyboardAvoidingView>
//           </Animated.View>
//         </TouchableWithoutFeedback>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     position: 'absolute',
//     top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'flex-end',
//   },
//   bottomSheet: {
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
//   searchInput: {
//     flex: 1,
//     height: 40,
//     color: '#333',
//     fontSize: 14,
//   },
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
//   qtyContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   qtyBtn: {
//     padding: 6,
//     borderRadius: 6,
//   },
//   plusBtn: {
//     backgroundColor: '#27ae60',
//   },
//   minusBtn: {
//     backgroundColor: '#d9534f',
//   },
//   qtyText: {
//     minWidth: 20,
//     textAlign: 'center',
//     fontSize: 15,
//     color: '#333',
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 50,
//     color: '#888',
//   },
//   errorText: {
//     textAlign: 'center',
//     marginTop: 50,
//     color: 'red',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   cancelBtn: {
//     paddingVertical: 10,
//     paddingHorizontal: 24,
//     backgroundColor: '#f2f2f2',
//     borderRadius: 8,
//   },
//   cancelText: { color: '#555', fontWeight: '500' },
//   addBtn: {
//     paddingVertical: 10,
//     paddingHorizontal: 24,
//     backgroundColor: '#27ae60',
//     borderRadius: 8,
//   },
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
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible) {
      fetchProducts();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/products/all');
      const data = response.data.data.map((p: any) => ({
        ...p,
        _id: p._id ?? p.id, // fallback if _id missing
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const increment = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const decrement = (id: string) => {
    setQuantities(prev => {
      const current = prev[id] ?? 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleAdd = () => {
    const selected = products
      .filter(p => (quantities[p._id] ?? 0) > 0)
      .map(p => ({
        productId: p._id,
        name: p.name,
        quantity: quantities[p._id],
      }));
    onAddProducts(selected);
    onClose();
    setQuantities({});
    setSearch('');
  };

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <Text style={styles.title}>Add Extra Products</Text>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* List */}
          {loading ? (
            <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 50 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={item => item._id}
              renderItem={({ item }) => {
                const qty = quantities[item._id] ?? 0;
                const disabled = !item.inStock;
                return (
                  <View style={[styles.itemContainer, disabled && { opacity: 0.5 }]}>
                    <Text style={styles.itemText}>{item.name}</Text>
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        style={[styles.qtyBtn, styles.minusBtn]}
                        onPress={() => decrement(item._id)}
                        disabled={qty === 0 || disabled}
                      >
                        <Feather
                          name="minus"
                          size={16}
                          color={qty === 0 || disabled ? '#ccc' : '#fff'}
                        />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{qty}</Text>
                      <TouchableOpacity
                        style={[styles.qtyBtn, styles.plusBtn]}
                        onPress={() => increment(item._id)}
                        disabled={disabled}
                      >
                        <Feather
                          name="plus"
                          size={16}
                          color={disabled ? '#ccc' : '#fff'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.65,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginBottom: 6,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  searchContainer: {
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: '#333' },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: { fontSize: 15, color: '#333' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { padding: 6, borderRadius: 6 },
  plusBtn: { backgroundColor: '#27ae60' },
  minusBtn: { backgroundColor: '#d9534f' },
  qtyText: { minWidth: 20, textAlign: 'center', fontSize: 15, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  errorText: { textAlign: 'center', marginTop: 50, color: 'red' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#f2f2f2', borderRadius: 8 },
  cancelText: { color: '#555', fontWeight: '500' },
  addBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#27ae60', borderRadius: 8 },
  addText: { color: '#fff', fontWeight: '600' },
});
