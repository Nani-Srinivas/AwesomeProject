import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import DraggableFlatList, { ScaleDecorator, OpacityDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { apiService } from '../../services/apiService';
import { EditAttendanceBottomSheet } from './components/EditAttendanceModal';
import { AddExtraProductBottomSheet } from './components/AddExtraProductModal';
import { COLORS } from '../../constants/colors';
import { CustomerAttendanceItem } from './components/CustomerAttendanceItem';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useAttendanceStore } from '../../store/attendanceStore';

const agendaItems = {
  '2025-09-20': [{ time: '10:00 AM', title: 'Meeting with John' }],
  '2025-09-21': [{ time: '02:00 PM', title: 'Project Deadline' }],
};

// Interfaces
interface Area {
  _id: string;
  name: string;
  totalSubscribedItems: number;
}

interface Product {
  product: { // Changed from productId to product to match existing usage
    _id: string;
    name: string;
    price?: number; // Price might be optional
  };
  quantity: number;
  status?: 'delivered' | 'not_delivered'; // Status is often added later
  _id?: string; // For requiredProduct array items
}

interface Customer {
  _id: string;
  name: string;
  requiredProduct: Product[]; // Changed from products to requiredProduct to match existing usage
  submitted?: boolean;
}

interface AttendanceState {
  [customerId: string]: {
    [productId: string]: {
      status: string;
      quantity: number;
    };
  };
}

export const AddAttendance = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSections, setCustomerSections] = useState<{ title: string; data: Customer[] }[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [expandedSections, setExpandedSections] = useState<{ [apartment: string]: boolean }>({});
  const [areAllExpanded, setAreAllExpanded] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddExtraProductModalVisible, setIsAddExtraProductModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackMessageType, setFeedbackMessageType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [isAttendanceSubmitted, setIsAttendanceSubmitted] = useState(false);
  const [attendanceRecordId, setAttendanceRecordId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true); // Allow editing by default for new dates

  // States for Reconciliation
  const [totalDispatched, setTotalDispatched] = useState<string>('');
  const [returnedExpression, setReturnedExpression] = useState<string>('');
  const [returnedQuantity, setReturnedQuantity] = useState(0);

  // --- Calculations ---

  // 1. Calculate Returned Quantity from Expression
  useEffect(() => {
    if (!returnedExpression) {
      setReturnedQuantity(0);
      return;
    }

    const parseExpression = (expr: string) => {
      if (!expr) return 0;
      try {
        const sanitized = expr.replace(/[^0-9+\-.]/g, ''); // Allow .
        if (!sanitized) return 0;
        const result = sanitized.split('+').reduce((acc, part) => {
          const subParts = part.split('-');
          let subSum = parseFloat(subParts[0] || '0');
          for (let i = 1; i < subParts.length; i++) {
            subSum -= parseFloat(subParts[i] || '0');
          }
          return acc + subSum;
        }, 0);
        return isNaN(result) ? 0 : result;
      } catch (e) {
        return 0;
      }
    };

    setReturnedQuantity(parseExpression(returnedExpression));
  }, [returnedExpression]);

  // 2. Calculate Total Given Quantity from Expression
  const totalGivenQuantity = useMemo(() => {
    const expr = totalDispatched;
    if (!expr) return 0;
    try {
      const sanitized = expr.replace(/[^0-9+\-.]/g, '');
      if (!sanitized) return 0;
      const result = sanitized.split('+').reduce((acc, part) => {
        const subParts = part.split('-');
        let subSum = parseFloat(subParts[0] || '0');
        for (let i = 1; i < subParts.length; i++) {
          subSum -= parseFloat(subParts[i] || '0');
        }
        return acc + subSum;
      }, 0);
      return isNaN(result) ? 0 : result;
    } catch (e) {
      return 0;
    }
  }, [totalDispatched]);

  // 3. Calculate Total Delivered
  const totalDelivered = useMemo(() => {
    let total = 0;
    Object.values(attendance).forEach(customerAttendance => {
      Object.values(customerAttendance).forEach((prod: any) => {
        if (prod.status === 'delivered') {
          total += (parseFloat(prod.quantity) || 0);
        }
      });
    });
    return total;
  }, [attendance]);

  const balance = (totalGivenQuantity + returnedQuantity) - totalDelivered;

  // --- Persistence Logic ---
  const { setDraft, getDraft, clearDraft, setApartmentOrder, getApartmentOrder } = useAttendanceStore();
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [modifiedCustomerIds, setModifiedCustomerIds] = useState<Set<string>>(new Set());

  // Load Draft
  const loadDraft = useCallback(() => {
    if (!selectedDate || !selectedArea) return;

    const draft = getDraft(selectedDate, selectedArea);
    if (draft) {
      console.log('Loading draft for:', selectedDate, selectedArea);
      if (draft.totalDispatched !== undefined) setTotalDispatched(draft.totalDispatched);
      if (draft.returnedExpression !== undefined) setReturnedExpression(draft.returnedExpression);
      if (draft.attendance !== undefined && Object.keys(draft.attendance).length > 0) {
        setAttendance(draft.attendance);
      }
    }
    setIsDraftLoaded(true);
  }, [selectedDate, selectedArea, getDraft]);

  // Save Draft (Auto-save)
  useEffect(() => {
    if (!isDraftLoaded || !selectedDate || !selectedArea) return;

    // specific check to avoid saving empty state over draft if something weird happens
    // but relies on isDraftLoaded being true only after we attempted load.
    const timeoutId = setTimeout(() => {
      // Construct modifiedProductLists
      const modifiedProductLists = {};
      modifiedCustomerIds.forEach(id => {
        const customer = customers.find(c => c._id === id);
        if (customer) {
          modifiedProductLists[id] = customer.requiredProduct;
        }
      });

      setDraft(selectedDate, selectedArea, {
        totalDispatched,
        returnedExpression,
        attendance,
        modifiedProductLists: Object.keys(modifiedProductLists).length > 0 ? modifiedProductLists : undefined
      });
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [totalDispatched, returnedExpression, attendance, selectedDate, selectedArea, isDraftLoaded, setDraft, customers, modifiedCustomerIds]);

  // ✅ fetch areas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await apiService.get('/delivery/area');
        const fetchedAreas = response.data.data;
        if (fetchedAreas?.length > 0) {
          setAreas(fetchedAreas);
          setSelectedArea(fetchedAreas[0]._id);
          // ✅ Auto-fill total dispatched from first area
          if (fetchedAreas[0].totalSubscribedItems) {
            setTotalDispatched(String(fetchedAreas[0].totalSubscribedItems));
          }
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };
    fetchAreas();
  }, []);


  // ✅ fetch customers for selected area - REFRESH ON FOCUS
  useFocusEffect(
    useCallback(() => {
      if (!selectedArea) return;

      // Helper to calculate defaults
      const calculateDefaultAttendance = (custs: Customer[]) => {
        const initial = {};
        custs.forEach(customer => {
          initial[customer._id] = {};
          if (Array.isArray(customer.requiredProduct)) {
            customer.requiredProduct.forEach(product => {
              if (product.product?._id) {
                initial[customer._id][product.product._id] = {
                  quantity: product.quantity,
                  status: 'delivered',
                };
              }
            });
          }
        });
        return initial;
      };

      const fetchCustomers = async () => {
        try {
          const response = await apiService.get(`/customer/area/${selectedArea}`);
          const fetchedCustomers = response.data.data;

          if (!Array.isArray(fetchedCustomers)) {
            setCustomers([]);
            setAttendance({});
            return;
          }

          // --- Helper to Sort, Group, and Set State ---
          const processAndSetCustomers = async (customersToProcess: Customer[]) => {
            // 1. Sort
            const sortedCustomers = customersToProcess.sort((a, b) => {
              const apartmentA = (a.address?.Apartment || '').toLowerCase();
              const apartmentB = (b.address?.Apartment || '').toLowerCase();
              if (apartmentA !== apartmentB) return apartmentA.localeCompare(apartmentB);
              const flatA = a.address?.FlatNo || '';
              const flatB = b.address?.FlatNo || '';
              const numA = parseInt(flatA.replace(/\D/g, '')) || 0;
              const numB = parseInt(flatB.replace(/\D/g, '')) || 0;
              if (numA !== numB) return numA - numB;
              return flatA.localeCompare(flatB);
            });

            setCustomers(sortedCustomers);

            // 2. Group
            const sectionsMap: { [apartment: string]: Customer[] } = {};
            sortedCustomers.forEach((customer) => {
              const apartment = customer.address?.Apartment || 'No Apartment Info';
              if (!sectionsMap[apartment]) sectionsMap[apartment] = [];
              sectionsMap[apartment].push(customer);
            });

            // 3. Order Sections (Try Backend -> Local -> Default)
            const apartments = Object.keys(sectionsMap);
            let orderedApartments: string[] = [];
            let savedOrder: string[] | null = null;

            // Check Backend/Local for order
            try {
              const areaResponse = await apiService.get(`/delivery/area`);
              const areaData = areaResponse.data.data;
              const currentAreaData = areaData?.find((a: any) => a._id === selectedArea);
              if (currentAreaData?.apartmentOrder?.length > 0) {
                savedOrder = currentAreaData.apartmentOrder;
                setApartmentOrder(selectedArea, savedOrder);
              }
            } catch (e) {
              // Fallback to local
              savedOrder = getApartmentOrder(selectedArea);
            }

            if (!savedOrder) savedOrder = getApartmentOrder(selectedArea);

            if (savedOrder && apartments.every(apt => savedOrder!.includes(apt))) {
              orderedApartments = savedOrder.filter(apt => apartments.includes(apt));
            } else {
              orderedApartments = apartments.sort((a, b) => {
                if (a === 'No Apartment Info') return 1;
                if (b === 'No Apartment Info') return -1;
                return a.localeCompare(b);
              });
            }

            const sections = orderedApartments.map(apt => ({
              title: apt,
              data: sectionsMap[apt],
            }));

            setCustomerSections(sections);
            const initialExpandedSections: { [apartment: string]: boolean } = {};
            sections.forEach(section => { initialExpandedSections[section.title] = true; });
            setExpandedSections(initialExpandedSections);
          };

          // --- Logic Start ---
          console.log('🔄 Starting data load for date:', selectedDate, 'area:', selectedArea);

          // 1. Check Server (Submitted Attendance)
          console.log('🌐 Checking server for saved attendance...');
          try {
            const historyResponse = await apiService.get('/attendance', {
              date: selectedDate, areaId: selectedArea
            });
            const historyData = historyResponse.data.data;
            const existingRecord = Array.isArray(historyData) ? historyData[0] : historyData;

            if (existingRecord) {
              console.log('✅ Found server history');
              setAttendanceRecordId(existingRecord._id);

              setTotalDispatched(String(existingRecord.totalDispatched || 0));
              setReturnedExpression(existingRecord.returnedItems?.expression || '');

              const serverAttendanceMap = {};

              // Map server attendance to local Map & Restore Extra Products
              if (Array.isArray(existingRecord.attendance)) {
                existingRecord.attendance.forEach((entry: any) => {
                  const cId = entry.customerId._id || entry.customerId;

                  // Restore Extra Products Logic
                  const customerIndex = fetchedCustomers.findIndex(c => c._id === cId);
                  if (customerIndex !== -1) {
                    const customer = fetchedCustomers[customerIndex];
                    const existingProductIds = new Set(customer.requiredProduct.map(p => p.product._id));

                    serverAttendanceMap[cId] = {}; // Init map for this customer

                    if (Array.isArray(entry.products)) {
                      entry.products.forEach((p: any) => {
                        // Handle case where populated productId is null (deleted product)
                        const pId = p.productId ? (p.productId._id || p.productId) : p._id;

                        if (!pId) return; // Skip if no ID at all

                        serverAttendanceMap[cId][pId] = { quantity: p.quantity, status: p.status };

                        if (!existingProductIds.has(pId)) {
                          // Restore missing product
                          console.log(`♻️ Restoring extra product for ${customer.address?.FlatNo}`);
                          customer.requiredProduct.push({
                            product: {
                              _id: pId,
                              name: p.productId?.name || 'Unknown Product',
                              price: p.productId?.price || 0
                            },
                            quantity: p.quantity,
                            // isPartial or isDeleted flag could be added here for UI styling
                          });
                          // Track modification
                          setModifiedCustomerIds(prev => new Set(prev).add(cId));
                        }
                      });
                    }
                  }
                });
              }

              // Merge with Defaults (so we don't lose customers who have no attendance record yet?)
              // Actually server record should be authoritative for that day if it exists.
              // But we usually want to show all customers even if they were skipped?
              // Yes, calculateDefaultAttendance gives structure for ALL customers.
              const defaultAtt = calculateDefaultAttendance(fetchedCustomers);
              const finalAttendance = { ...defaultAtt };

              // Overlay Server Data
              Object.keys(serverAttendanceMap).forEach(cId => {
                // Only overlay if customer exists in current list (already filtered/handled above)
                if (finalAttendance[cId]) {
                  finalAttendance[cId] = { ...finalAttendance[cId], ...serverAttendanceMap[cId] };
                }
              });

              setAttendance(finalAttendance);
              clearDraft(selectedDate, selectedArea);
              setIsAttendanceSubmitted(true);
              setIsEditing(false); // Disable editing for submitted attendance

              // Finalize UI
              await processAndSetCustomers(fetchedCustomers);
              setIsDraftLoaded(true);
              return;
            }
          } catch (historyError) {
            console.log('❌ Server history check failed (or empty), checking draft...');
          }

          // 2. Check Draft
          console.log('📝 Checking for local draft...');
          const draft = getDraft(selectedDate, selectedArea);
          if (draft) {
            console.log('✅ Found draft');
            if (draft.totalDispatched !== undefined) setTotalDispatched(draft.totalDispatched);
            if (draft.returnedExpression !== undefined) setReturnedExpression(draft.returnedExpression);
            if (draft._id) setAttendanceRecordId(draft._id);

            // Restore Modified Lists from Draft
            if (draft.modifiedProductLists) {
              const modifiedIds = Object.keys(draft.modifiedProductLists);
              setModifiedCustomerIds(new Set(modifiedIds));
              fetchedCustomers.forEach(customer => {
                if (draft.modifiedProductLists![customer._id]) {
                  customer.requiredProduct = draft.modifiedProductLists![customer._id];
                }
              });
            }

            if (draft.attendance && Object.keys(draft.attendance).length > 0) {
              setAttendance(draft.attendance);
              setIsAttendanceSubmitted(false);
              setIsEditing(true); // Allow editing for draft
            } else {
              setAttendance(calculateDefaultAttendance(fetchedCustomers));
            }

            await processAndSetCustomers(fetchedCustomers);
            setIsDraftLoaded(true);
            return;
          }

          // 3. Fallback to Defaults (New Day)
          console.log('⚠️ Using defaults (New Day)');
          setIsAttendanceSubmitted(false);
          setAttendanceRecordId(null);
          setIsEditing(true); // Allow editing for new dates
          setAttendance(calculateDefaultAttendance(fetchedCustomers));

          await processAndSetCustomers(fetchedCustomers);

          // Default Area Total
          if (areas.length > 0) {
            const currentArea = areas.find(a => a._id === selectedArea);
            setTotalDispatched(currentArea?.totalSubscribedItems ? String(currentArea.totalSubscribedItems) : '0');
          }
          setReturnedExpression('');

          setIsDraftLoaded(true);

        } catch (error) {
          console.error('Fatal fetchCustomers error:', error);
          setCustomers([]);
          setIsDraftLoaded(true);
        }
      };



      // Reset draft loaded state when needs refresh
      setIsDraftLoaded(false);
      fetchCustomers();

    }, [selectedArea, areas, selectedDate, getDraft])
  );



  const onDateChanged = date => setSelectedDate(date);

  const toggleSectionExpansion = (apartment: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [apartment]: !prev[apartment],
    }));
  };

  const toggleAllSections = () => {
    const newExpandedState = !areAllExpanded;
    setAreAllExpanded(newExpandedState);

    if (newExpandedState) {
      // Expand All -> Clear specific false overrides
      setExpandedSections({});
    } else {
      // Collapse All -> Set all current sections to false
      const collapsedState: { [apartment: string]: boolean } = {};
      customerSections.forEach(section => {
        collapsedState[section.title] = false;
      });
      setExpandedSections(collapsedState);
    }
  };



  const handleProductStatusChange = (customerId, productId, newStatus) => {
    console.log('handleProductStatusChange called', { customerId, productId, newStatus });

    const startUpdate = () => {
      console.log('startUpdate executed - updating state');
      setAttendance(prev => {
        const currentProductState = prev[customerId]?.[productId] || {};

        const updatedProduct = {
          ...currentProductState,
          status: newStatus,
        };

        // Reset to 0 if status is not 'delivered'
        if (newStatus !== 'delivered') {
          updatedProduct.quantity = 0;
        }

        return {
          ...prev,
          [customerId]: {
            ...prev[customerId],
            [productId]: updatedProduct,
          },
        };
      });
    };

    // If changing to non-delivered, check if we need confirmation
    if (newStatus !== 'delivered') {
      const customerAttendance = attendance[customerId] || {};
      const productState = customerAttendance[productId] || {};

      // Check current status from state or default to 'delivered'
      const currentStatus = productState.status || 'delivered';
      console.log('Checking confirmation', { currentStatus, newStatus });

      if (currentStatus === 'delivered') {
        console.log('Showing Confirmation Alert');
        Alert.alert(
          "Clear Quantity?",
          "Changing status to 'Not Delivered' will set the quantity to 0. Continue?",
          [
            { text: "Cancel", style: "cancel", onPress: () => console.log('Alert Cancelled') },
            { text: "Yes", onPress: startUpdate }
          ]
        );
        return;
      }
    }

    startUpdate();
  };

  const handleProductQuantityChange = (customerId, productId, newQuantity) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          quantity: newQuantity, // Allow string input
        },
      },
    }));
  };

  const handleDeleteProduct = (customerId, productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to remove this product from the list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: 'destructive',
          onPress: () => {
            // 1. Update Customers State (Remove from requiredProduct)
            let updatedCustomer: Customer | null = null;

            setCustomers(prevCustomers => {
              return prevCustomers.map(customer => {
                if (customer._id === customerId) {
                  const updatedRequiredProducts = customer.requiredProduct.filter(
                    p => p.product._id !== productId
                  );

                  updatedCustomer = {
                    ...customer,
                    requiredProduct: updatedRequiredProducts
                  };
                  return updatedCustomer;
                }
                return customer;
              });
            });

            // ✅ Track modification
            setModifiedCustomerIds(prev => new Set(prev).add(customerId));

            // 2. Update Customer Sections (Sync with Customers)
            // We use a timeout to ensure 'updatedCustomer' is captured or simply re-derive logic 
            // because setCustomers is async. Better to replicate logic safely.

            setCustomerSections(prevSections =>
              prevSections.map(section => ({
                ...section,
                data: section.data.map(c => {
                  if (c._id === customerId) {
                    return {
                      ...c,
                      requiredProduct: c.requiredProduct.filter(p => p.product._id !== productId)
                    };
                  }
                  return c;
                })
              }))
            );

            // 3. Update Attendance State (Remove from attendance object)
            setAttendance(prev => {
              const customerAttendance = { ...prev[customerId] };
              if (customerAttendance) {
                delete customerAttendance[productId];
              }
              return {
                ...prev,
                [customerId]: customerAttendance
              };
            });
          }
        }
      ]
    );
  };

  const openEditModal = customer => {
    setSelectedCustomer(customer);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedCustomer(null);
  };

  // ✅ New: open bottom sheet for Add Extra Product
  const openAddExtraProductModal = customer => {
    setSelectedCustomer(customer);
    setIsAddExtraProductModalVisible(true);
  };

  const closeAddExtraProductModal = () => {
    setIsAddExtraProductModalVisible(false);
    setSelectedCustomer(null);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleSaveAttendance = (customerId, editedRequiredProducts, addedExtraProducts) => {
    // 1. Calculate the new products list for the target customer
    let updatedCustomer: Customer | null = null;
    let newRequiredProducts: any[] = [];

    // Helper to get normalized products
    // We need to do this calculation *outside* the setCustomers callback 
    // so we can use the result to update customerSections too.

    // Find the current customer to get their current data
    const currentCustomer = customers.find(c => c._id === customerId);
    if (!currentCustomer) return;

    // Start with the edited list (which might just be the current list if not edited)
    let allProducts = [...editedRequiredProducts];

    // Handle the newly added products
    if (Array.isArray(addedExtraProducts) && addedExtraProducts.length > 0) {
      addedExtraProducts.forEach(newProduct => {
        if (newProduct.quantity > 0) {
          // Normalize the new product
          const normalizedProduct = {
            product: { _id: newProduct.productId, name: newProduct.name },
            quantity: newProduct.quantity,
          };

          // Check if this product already exists in the list
          const existingIndex = allProducts.findIndex(
            p => p.product._id === normalizedProduct.product._id
          );

          if (existingIndex !== -1) {
            // Update quantity
            allProducts[existingIndex] = {
              ...allProducts[existingIndex],
              quantity: normalizedProduct.quantity
            };
          } else {
            // Add new
            allProducts.push(normalizedProduct);
          }
        }
      });
    }

    newRequiredProducts = allProducts;

    // 2. Prepare the updated customer object
    updatedCustomer = {
      ...currentCustomer,
      requiredProduct: newRequiredProducts
    };

    // 3. Update 'customers' state
    setCustomers(prevCustomers =>
      prevCustomers.map(c => c._id === customerId ? updatedCustomer! : c)
    );

    // ✅ Track modification if products were added or list modified
    if (addedExtraProducts.length > 0 || editedRequiredProducts.length !== currentCustomer.requiredProduct.length) {
      setModifiedCustomerIds(prev => new Set(prev).add(customerId));
    }

    // 4. Update 'customerSections' state
    // We must update the data inside the specific section without changing section order
    setCustomerSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        data: section.data.map(c => c._id === customerId ? updatedCustomer! : c)
      }))
    );

    // 5. Update attendance state
    const newAttendanceForCustomer = {};
    newRequiredProducts.forEach(p => {
      if (p.product && p.product._id) {
        newAttendanceForCustomer[p.product._id] = {
          quantity: p.quantity,
          status: p.status || 'delivered',
        };
      }
    });

    setAttendance(prev => ({
      ...prev,
      [customerId]: newAttendanceForCustomer,
    }));

    // Close the modals
    closeEditModal();
    closeAddExtraProductModal();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);

    const today = new Date().toISOString().split('T')[0];

    // Allow modification of past dates ONLY if we are in explicit Edit Mode for a record that was already started/submitted
    if (selectedDate < today && !isEditing) {
      setFeedbackMessage('Cannot modify attendance for past dates.');
      setFeedbackMessageType('error');
      setIsLoading(false);
      return;
    }

    const formattedAttendance = Object.keys(attendance)
      .map(customerId => ({
        customerId,
        products: Object.keys(attendance[customerId]).map(productId => ({
          productId,
          quantity: parseFloat(String(attendance[customerId][productId].quantity)) || 0,
          status: attendance[customerId][productId].status,
        })),
      }))
      .filter(c => c.products.length > 0);

    if (formattedAttendance.length === 0) {
      setFeedbackMessage('No attendance data to submit.');
      setFeedbackMessageType('error');
      setIsLoading(false);
      return;
    }

    const payload = {
      date: selectedDate,
      areaId: selectedArea,
      attendance: formattedAttendance,
      totalDispatched: parseFloat(totalDispatched) || 0,
      returnedItems: {
        quantity: returnedQuantity,
        expression: returnedExpression
      }
    };

    if (balance !== 0) {
      Alert.alert(
        'Stock Mismatch',
        `The stock does not match!\n\nGiven: ${totalDispatched || 0}\nDelivered: ${totalDelivered}\nReturned: ${returnedQuantity}\n\nBalance: ${balance}\n\nPlease adjust the delivered quantities until the balance is 0.`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    submitData(payload);
  };

  const submitData = async (payload) => {
    try {
      if (isEditModalVisible) closeEditModal();

      let response;
      if (attendanceRecordId) {
        console.log('Updating existing attendance:', attendanceRecordId);
        response = await apiService.put(`/attendance/${attendanceRecordId}`, payload);
      } else {
        console.log('Creating new attendance');
        response = await apiService.postWithConfig('/attendance', payload, {
          headers: { 'X-Suppress-Global-Error-Alert': true },
        });
      }

      setFeedbackMessage(response.data.message || 'Attendance submitted successfully!');
      setFeedbackMessageType('success');

      setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));

      // Sync customerSections with the submitted status
      setCustomerSections(prev => prev.map(section => ({
        ...section,
        data: section.data.map(c => ({ ...c, submitted: true }))
      })));

      // ✅ Clear draft on successful submit
      if (selectedDate && selectedArea) {
        clearDraft(selectedDate, selectedArea);
      }
      setIsEditing(false); // Lock it back after successful submit

      setTimeout(() => {
        navigation.goBack();
      }, 2000); // 2 second delay to see the toast
    } catch (error) {
      console.error('Attendance submit error:', error);

      if (error.response?.status === 409) {
        setFeedbackMessage(error.response.data.message || 'Attendance already exists for this date.');
        setFeedbackMessageType('error');
        setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));
      } else {
        setFeedbackMessage(
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred while submitting attendance.'
        );
        setFeedbackMessageType('error');
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackMessageType(null);
      }, 5000);
    }
  };

  /* Placeholder for original submit logic to avoid errors */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _originalSubmit = async () => {
  };

  const renderCustomHeader = (date: any) => {
    const header = date.toString('MMMM yyyy');
    const [month, year] = header.split(' ');

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="calendar" size={24} color="#1E73B8" />
          <Text style={styles.monthText}>{`${month} ${year}`}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Feather name="chevron-left" size={24} color="#1E73B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth}>
            <Feather name="chevron-right" size={24} color="#1E73B8" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.attendanceHeader}>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedArea}
            onValueChange={setSelectedArea}
            style={styles.picker}
            dropdownIconColor={COLORS.primary}
            mode="dropdown"
          >
            {areas.map(area => (
              <Picker.Item key={area._id} label={area.name} value={area._id} color="#000000" />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleAllSections}>
          <Feather
            name={areAllExpanded ? "chevrons-up" : "chevrons-down"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        <View style={styles.totalEmployeesContainer}>
          <Text style={styles.totalEmployeesLabel}>Total Customers</Text>
          <Text style={styles.totalEmployeesCount}>{customers.length}</Text>
        </View>
      </View>

      {/* Top Row Inputs (Given | Returns | Info) */}
      <View style={styles.topInputRow}>
        <View style={[styles.topInputGroup, { flex: 1 }]}>
          <Text style={styles.topLabel}>Given</Text>
          <TextInput
            style={[styles.topInput, { backgroundColor: '#f0f0f0', color: '#666' }]}
            value={totalDispatched}
            // onChangeText={setTotalDispatched} // Read-only from Store
            editable={false}
            placeholder="0"
            placeholderTextColor="#999"
          />
        </View>
        <View style={[styles.topInputGroup, { flex: 1 }]}>
          <Text style={styles.topLabel}>Adj (+/-)</Text>
          <TextInput
            style={[styles.topInput, { backgroundColor: '#f0f0f0', color: '#666' }]}
            value={returnedExpression}
            // onChangeText={setReturnedExpression} // Read-only from Store
            editable={false}
            placeholder="e.g. +3 or -5"
            placeholderTextColor="#999"
          />
        </View>
        <View style={[styles.topInputGroup, { flex: 1 }]}>
          <Text style={[styles.topLabel, { color: COLORS.primary }]}>Delivered</Text>
          <TextInput
            style={[styles.topInput, { backgroundColor: '#e8f5e9', color: COLORS.primary, fontWeight: 'bold', textAlign: 'center', borderColor: COLORS.primary }]}
            value={String(totalDelivered)}
            editable={false}
          />
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setIsSummaryModalVisible(true)}
        >
          <Feather name="info" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );

  // Render Item for DraggableFlatList (SECTION BASED)
  const renderItem = useCallback(({ item: section, drag, isActive }: { item: { title: string; data: Customer[] }, drag: () => void, isActive: boolean }) => {
    const isExpanded = expandedSections[section.title] !== false; // Default true

    // Calculate total delivered for this section
    let sectionDeliveredTotal = 0;
    section.data.forEach(cust => {
      const custAttendance = attendance[cust._id];
      if (custAttendance) {
        Object.values(custAttendance).forEach((prod: any) => {
          if (prod.status === 'delivered') {
            sectionDeliveredTotal += (parseFloat(String(prod.quantity)) || 0);
          }
        });
      }
    });

    return (
      <ScaleDecorator>
        <View style={[styles.sectionContainer, isActive && styles.activeSection]}>
          <View style={styles.sectionHeaderRow}>
            <TouchableOpacity onLongPress={drag} disabled={isActive} style={styles.dragHandle}>
              <Feather name="menu" size={24} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sectionHeaderContent}
              onPress={() => toggleSectionExpansion(section.title)}
            >
              <Text style={styles.sectionHeaderText}>
                {section.title.length > 15 ? `${section.title.substring(0, 15)}...` : section.title}
                <Text style={styles.sectionCount}> (Flats: {section.data.length} | Qty: {Number(sectionDeliveredTotal.toFixed(2))})</Text>
              </Text>
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B6B6B"
              />
            </TouchableOpacity>
          </View>

          {isExpanded && (
            <View>
              {section.data.map((customer: Customer) => (
                <CustomerAttendanceItem
                  key={customer._id}
                  customer={customer}
                  isExpanded={true}
                  onToggleExpansion={null}
                  attendance={attendance[customer._id] || {}}
                  onProductStatusChange={(productId: string, newStatus: string) =>
                    handleProductStatusChange(customer._id, productId, newStatus)
                  }
                  onProductQuantityChange={(productId: string, newQuantity: number) =>
                    handleProductQuantityChange(customer._id, productId, newQuantity)
                  }
                  onDeleteProduct={(productId: string) => handleDeleteProduct(customer._id, productId)}
                  onAdd={() => openAddExtraProductModal(customer)}
                  onEdit={() => openEditModal(customer)}
                  isPastDate={selectedDate < new Date().toISOString().split('T')[0]}
                  isReadOnly={!isEditing}
                  flatNumber={customer.address?.FlatNo}
                />
              ))}
            </View>
          )}
        </View>
      </ScaleDecorator>
    );
  }, [expandedSections, attendance, handleProductStatusChange, handleProductQuantityChange, selectedDate, areas]);

  const handleSectionDragEnd = async ({ data }: { data: { title: string; data: Customer[] }[] }) => {
    setCustomerSections(data);
    // Persist the new apartment order
    if (selectedArea) {
      const newOrder = data.map(section => section.title);
      // Save to local store immediately for instant UI feedback
      setApartmentOrder(selectedArea, newOrder);

      // Save to backend for cross-device sync
      try {
        await apiService.saveApartmentOrder(selectedArea, newOrder);
        console.log('Apartment order saved to backend successfully');
      } catch (error) {
        console.error('Failed to save apartment order to backend:', error);
        // Still keep it in local storage, it will sync next time
      }
    }
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {feedbackMessage && (
          <View
            style={[
              styles.feedbackContainer,
              feedbackMessageType === 'success'
                ? styles.successBackground
                : styles.errorBackground,
            ]}
          >
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {/* Calendar + List */}
        <CalendarProvider date={selectedDate} onDateChanged={onDateChanged}>
          <ExpandableCalendar
            renderHeader={renderCustomHeader}
            hideArrows
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#1E73B8' },
              ...Object.keys(agendaItems).reduce((acc, date) => {
                acc[date] = { marked: true };
                return acc;
              }, {}),
            }}
            theme={{
              selectedDayBackgroundColor: COLORS.primary,
              todayTextColor: COLORS.primary,
              arrowColor: COLORS.primary,
            }}
          />

          <DraggableFlatList
            data={customerSections}
            extraData={attendance} // Ensure re-render on attendance change
            onDragEnd={handleSectionDragEnd}
            keyExtractor={(item) => item.title}
            stickyHeaderIndices={[]}
            ListHeaderComponent={renderListHeader()}
            contentContainerStyle={styles.listContentContainer}
            renderItem={renderItem}
            activationDistance={20}
            ListEmptyComponent={
              areas.length === 0 ? (
                <EmptyState
                  icon="📍"
                  title="No Delivery Areas Found"
                  description="You haven't created any delivery areas yet. Please create an area first to start managing attendance."
                  actionLabel="Create Area"
                  onAction={() => navigation.navigate('AreaList')}
                />
              ) : (
                <EmptyState
                  icon="👥"
                  title="No Customers in This Area"
                  description="There are no customers subscribed in the selected area yet. Add customers with delivery subscriptions to start managing their daily attendance."
                  actionLabel="Go to Customers"
                  onAction={() => navigation.navigate('CustomerList')}
                />
              )
            }
          />

          {customers.length > 0 && (
            <View style={styles.fixedFooter}>
              {/* Show status message for past dates or when submitted */}
              {(selectedDate < new Date().toISOString().split('T')[0] || isAttendanceSubmitted) && (
                <View style={{
                  backgroundColor: isAttendanceSubmitted ? '#E8F5E9' : '#FFF3E0',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: isAttendanceSubmitted ? '#4CAF50' : '#FF9800'
                }}>
                  <Text style={{
                    color: isAttendanceSubmitted ? '#2E7D32' : '#E65100',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 14
                  }}>
                    {isAttendanceSubmitted
                      ? '✅ Attendance already marked for this date and area'
                      : '⚠️ No attendance marked for this date and area'
                    }
                  </Text>
                </View>
              )}
              {(balance !== 0 && (!isAttendanceSubmitted || isEditing)) && (
                <Text style={{
                  color: 'red',
                  textAlign: 'center',
                  marginBottom: 8,
                  fontWeight: 'bold'
                }}>
                  Balance ({balance}) must be 0 to submit.
                </Text>
              )}
              {/* For past dates OR already submitted: show Edit button */}
              {!isEditing && isAttendanceSubmitted ? (
                <Button
                  title="Edit Attendance"
                  onPress={() => {
                    Alert.alert(
                      'Edit Attendance',
                      'Do you want to modify this attendance? This will allow you to make changes and re-submit.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Yes, Edit',
                          onPress: () => {
                            setIsEditing(true);
                            Alert.alert('Edit Mode', 'You can now modify the attendance. Make sure the balance is 0 before submitting.');
                          }
                        }
                      ]
                    );
                  }}
                  style={{ backgroundColor: '#FF9800' }}
                />
              ) : (
                <Button
                  title={isLoading ? 'Submitting...' : 'Submit Attendance'}
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading || balance !== 0}
                  style={{ opacity: (isLoading || balance !== 0) ? 0.5 : 1 }}
                />
              )}
            </View>
          )}



        </CalendarProvider>

        {/* ✅ Summary Modal - Moved to Root */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSummaryModalVisible}
          onRequestClose={() => setIsSummaryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Stock Reconciliation</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Total Given:</Text>
                <Text style={styles.summaryValue}>{totalDispatched || 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>(+/-) Adjustments:</Text>
                <Text style={styles.summaryValue}>{returnedQuantity >= 0 ? '+' : ''}{returnedQuantity}</Text>
              </View>
              <View style={[styles.summaryRow, styles.balanceRow]}>
                <Text style={[styles.summaryText, styles.balanceText]}>= Actual Given:</Text>
                <Text style={[styles.summaryValue, styles.balanceValue]}>
                  {totalGivenQuantity + returnedQuantity}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>(-) Delivered:</Text>
                <Text style={styles.summaryValue}>{totalDelivered}</Text>
              </View>
              <View style={[styles.summaryRow, styles.balanceRow]}>
                <Text style={[styles.summaryText, styles.balanceText]}>(=) Balance:</Text>
                <Text style={[styles.summaryValue, styles.balanceValue, { color: balance === 0 ? COLORS.success : COLORS.error }]}>
                  {balance}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsSummaryModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Edit modal - Moved to Root */}
        <EditAttendanceBottomSheet
          isVisible={isEditModalVisible}
          customer={selectedCustomer}
          currentAttendance={attendance[selectedCustomer?._id] || {}}
          onClose={closeEditModal}
          onSave={handleSaveAttendance}
        />

        {/* ✅ Add Extra Product Bottom Sheet - Moved to Root */}
        {
          isAddExtraProductModalVisible && (
            <AddExtraProductBottomSheet
              isVisible={isAddExtraProductModalVisible}
              customer={selectedCustomer}
              currentAttendance={attendance[selectedCustomer?._id] || {}}
              onClose={closeAddExtraProductModal}
              onAddProducts={(addedProducts) =>
                handleSaveAttendance(selectedCustomer._id, selectedCustomer.requiredProduct || [], addedProducts)
              }
            />
          )
        }
      </View >
    </GestureHandlerRootView >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 300, // Space for fixed footer
  },
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeSection: {
    backgroundColor: '#f9f9f9',
    borderColor: COLORS.primary,
    borderWidth: 2,
    opacity: 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  dragHandle: {
    padding: 8,
    marginRight: 4,
  },
  sectionHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
    paddingVertical: 4,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  monthText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  totalEmployeesContainer: { alignItems: 'flex-end' },
  totalEmployeesLabel: { fontSize: 12, color: '#666666' },
  totalEmployeesCount: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
  listContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  dropdownContainer: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%' },
  toggleButton: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackContainer: {
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  successBackground: { backgroundColor: COLORS.success },
  errorBackground: { backgroundColor: COLORS.error },
  feedbackText: { color: COLORS.white, fontWeight: 'bold' },

  inputSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#F8F9FA',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  topInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 5,
    marginBottom: 5,
  },
  topInputGroup: {
    flex: 1,
  },
  topLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  topInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    height: 40,
  },
  infoButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerContainer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20, // Add some bottom padding for safe area
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 10, // Shadow for Android
    zIndex: 100,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: { fontSize: 14, color: '#555' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  balanceRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  balanceText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  balanceValue: { fontSize: 16, fontWeight: 'bold' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  dragHandle: {
    padding: 10,
    paddingRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggingItem: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: COLORS.white,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
});