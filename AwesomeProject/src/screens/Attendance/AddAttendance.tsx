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
  status?: 'delivered' | 'not_delivered' | 'skipped' | 'out_of_stock'; // Status is often added later
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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddExtraProductModalVisible, setIsAddExtraProductModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackMessageType, setFeedbackMessageType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);

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
        const sanitized = expr.replace(/[^0-9+\-]/g, '');
        if (!sanitized) return 0;
        const result = sanitized.split('+').reduce((acc, part) => {
          const subParts = part.split('-');
          let subSum = parseInt(subParts[0] || '0', 10);
          for (let i = 1; i < subParts.length; i++) {
            subSum -= parseInt(subParts[i] || '0', 10);
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
      const sanitized = expr.replace(/[^0-9+\-]/g, '');
      if (!sanitized) return 0;
      const result = sanitized.split('+').reduce((acc, part) => {
        const subParts = part.split('-');
        let subSum = parseInt(subParts[0] || '0', 10);
        for (let i = 1; i < subParts.length; i++) {
          subSum -= parseInt(subParts[i] || '0', 10);
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
          total += (parseInt(prod.quantity, 10) || 0);
        }
      });
    });
    return total;
  }, [attendance]);

  const balance = (totalGivenQuantity + returnedQuantity) - totalDelivered;

  // --- Persistence Logic ---
  const { setDraft, getDraft, clearDraft } = useAttendanceStore();
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

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
      setDraft(selectedDate, selectedArea, {
        totalDispatched,
        returnedExpression,
        attendance
      });
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [totalDispatched, returnedExpression, attendance, selectedDate, selectedArea, isDraftLoaded, setDraft]);

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

      const fetchCustomers = async () => {
        try {
          const response = await apiService.get(`/customer/area/${selectedArea}`);
          const fetchedCustomers = response.data.data;
          if (!Array.isArray(fetchedCustomers)) {
            setCustomers([]);
            setAttendance({});
            return;
          }

          // ✅ Sort customers by Apartment, then by Flat Number
          const sortedCustomers = fetchedCustomers.sort((a, b) => {
            // Get apartment names (case-insensitive)
            const apartmentA = (a.address?.Apartment || '').toLowerCase();
            const apartmentB = (b.address?.Apartment || '').toLowerCase();

            // First, sort by apartment name
            if (apartmentA !== apartmentB) {
              return apartmentA.localeCompare(apartmentB);
            }

            // If same apartment, sort by flat number numerically
            const flatA = a.address?.FlatNo || '';
            const flatB = b.address?.FlatNo || '';

            // Extract numeric part from flat number (handles formats like "101", "A-101", "Flat 101")
            const numA = parseInt(flatA.replace(/\D/g, '')) || 0;
            const numB = parseInt(flatB.replace(/\D/g, '')) || 0;

            // Compare numbers first
            if (numA !== numB) {
              return numA - numB;
            }

            // If numbers are same, fall back to string comparison (for cases like "101A" vs "101B")
            return flatA.localeCompare(flatB);
          });

          setCustomers(sortedCustomers);

          // ✅ Group customers into sections by apartment
          const sections: { title: string; data: Customer[] }[] = [];
          let currentApartment = '';
          let currentSection: Customer[] = [];

          sortedCustomers.forEach((customer, index) => {
            const apartment = customer.address?.Apartment || 'No Apartment Info';
            if (apartment !== currentApartment) {
              if (currentSection.length > 0) sections.push({ title: currentApartment, data: currentSection });
              currentApartment = apartment;
              currentSection = [customer];
            } else {
              currentSection.push(customer);
            }
            if (index === sortedCustomers.length - 1) sections.push({ title: currentApartment, data: currentSection });
          });

          setCustomerSections(sections);

          // Initialize expanded sections
          const initialExpandedSections: { [apartment: string]: boolean } = {};
          sections.forEach(section => { initialExpandedSections[section.title] = true; });
          setExpandedSections(initialExpandedSections);

          // ------------------------------------------------------------------
          // Data Loading Priority: Draft -> Server (History) -> Defaults
          // ------------------------------------------------------------------

          // 1. Try Loading Draft
          const draft = getDraft(selectedDate, selectedArea);
          if (draft) {
            console.log('Using local draft for:', selectedDate);
            if (draft.totalDispatched !== undefined) setTotalDispatched(draft.totalDispatched);
            if (draft.returnedExpression !== undefined) setReturnedExpression(draft.returnedExpression);
            if (draft.attendance && Object.keys(draft.attendance).length > 0) {
              setAttendance(draft.attendance);
            } else {
              // Fallback to defaults if draft attendance is empty
              setAttendance(calculateDefaultAttendance(fetchedCustomers));
            }
            setIsDraftLoaded(true);
            return;
          }

          // 2. Fetch Server History (if no draft)
          try {
            const historyResponse = await apiService.get('/attendance', {
              date: selectedDate, areaId: selectedArea
            });
            const historyData = historyResponse.data.data; // Expecting array of records or single record

            // The API returns an array, we expect at most one record for (date, area, store)
            const existingRecord = Array.isArray(historyData) ? historyData[0] : historyData;

            if (existingRecord) {
              console.log('Found server history for:', selectedDate);
              // Populate from Server
              setTotalDispatched(String(existingRecord.totalDispatched || 0));
              setReturnedExpression(existingRecord.returnedItems?.expression || '');

              // Convert Server Attendance Array -> Map
              const serverAttendanceMap = {};
              if (Array.isArray(existingRecord.attendance)) {
                existingRecord.attendance.forEach((entry: any) => {
                  const cId = entry.customerId._id || entry.customerId; // Handle populated or unpopulated
                  serverAttendanceMap[cId] = {};
                  if (Array.isArray(entry.products)) {
                    entry.products.forEach((p: any) => {
                      const pId = p.productId._id || p.productId;
                      serverAttendanceMap[cId][pId] = {
                        quantity: p.quantity,
                        status: p.status
                      };
                    });
                  }
                });
              }

              // Merge with defaults to ensure missing customers are still present
              // (Server might only store those who had orders? or typically all?
              //  Safest is to start with defaults and override with server data)
              const defaultAtt = calculateDefaultAttendance(fetchedCustomers);
              const finalAttendance = { ...defaultAtt };

              // Overlay server data
              Object.keys(serverAttendanceMap).forEach(cId => {
                if (finalAttendance[cId]) {
                  finalAttendance[cId] = { ...finalAttendance[cId], ...serverAttendanceMap[cId] };
                } else {
                  // If customer exists in history but not in current list (maybe deleted?), optionally add them or ignore.
                  // For now, let's ignore to avoid crashes if they aren't in `customers` list.
                }
              });

              setAttendance(finalAttendance);
              setIsDraftLoaded(true);
              return;
            }
          } catch (historyError) {
            console.log('No history found or error fetching history:', historyError);
            // Verify 404 vs real error? Usually empty array just means no data.
          }

          // 3. Fallback to Defaults (New Day)
          console.log('No draft or history, using defaults.');
          setAttendance(calculateDefaultAttendance(fetchedCustomers));

          // Default Total Dispatched from Area
          const currentArea = areas.find(a => a._id === selectedArea);
          if (currentArea?.totalSubscribedItems) {
            setTotalDispatched(String(currentArea.totalSubscribedItems));
          } else {
            setTotalDispatched('0');
          }
          setReturnedExpression('');

          setIsDraftLoaded(true);


        } catch (error) {
          console.error('Error in data loading sequence:', error);
          setCustomers([]);
          setAttendance({});
          setIsDraftLoaded(true);
        }
      };

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

  const handleDragEnd = (apartmentTitle: string, reorderedData: Customer[]) => {
    // Update the section with new order
    setCustomerSections(prev =>
      prev.map(section =>
        section.title === apartmentTitle
          ? { ...section, data: reorderedData }
          : section
      )
    );
  };

  const handleProductStatusChange = (customerId, productId, newStatus) => {
    setAttendance(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [productId]: {
          ...prev[customerId]?.[productId],
          status: newStatus,
        },
      },
    }));
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
    setCustomers(prevCustomers =>
      prevCustomers.map(customer => {
        if (customer._id === customerId) {
          // Create a mutable copy of the products to work with
          let allProducts = [...editedRequiredProducts];

          // Handle the newly added products, which is an array
          if (Array.isArray(addedExtraProducts)) {
            addedExtraProducts.forEach(newProduct => {
              if (newProduct.quantity > 0) {
                // Normalize the new product to match the structure of existing ones
                const normalizedProduct = {
                  product: { _id: newProduct.productId, name: newProduct.name },
                  quantity: newProduct.quantity,
                };

                // Check if this product already exists in the list
                const existingIndex = allProducts.findIndex(
                  p => p.product._id === normalizedProduct.product._id
                );

                if (existingIndex !== -1) {
                  // If it exists, update the quantity
                  allProducts[existingIndex].quantity = normalizedProduct.quantity;
                } else {
                  // Otherwise, add it to the list
                  allProducts.push(normalizedProduct);
                }
              }
            });
          }

          // Update the attendance state for the customer
          const newAttendanceForCustomer = {};
          allProducts.forEach(p => {
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

          // Return the updated customer object
          return { ...customer, requiredProduct: allProducts };
        }
        return customer;
      })
    );

    // Close the modals
    closeEditModal();
    closeAddExtraProductModal();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);

    const today = new Date().toISOString().split('T')[0];

    if (selectedDate < today) {
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
        `The stock does not match!\n\nGiven: ${totalDispatched || 0}\nDelivered: ${totalDelivered}\nReturned: ${returnedQuantity}\n\nBalance: ${balance}\n\nDo you want to submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit Anyway', onPress: () => submitData(payload) }
        ]
      );
    } else {
      submitData(payload);
    }
  };

  const submitData = async (payload) => {
    try {
      if (isEditModalVisible) closeEditModal();
      const response = await apiService.postWithConfig('/attendance', payload, {
        headers: { 'X-Suppress-Global-Error-Alert': true },
      });

      setFeedbackMessage(response.data.message || 'Attendance submitted successfully!');
      setFeedbackMessageType('success');

      setCustomers(prev => prev.map(c => ({ ...c, submitted: true })));

      // ✅ Clear draft on successful submit
      if (selectedDate && selectedArea) {
        clearDraft(selectedDate, selectedArea);
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1000); // 1 second delay
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
          >
            {areas.map(area => (
              <Picker.Item key={area._id} label={area.name} value={area._id} />
            ))}
          </Picker>
        </View>
        <View style={styles.totalEmployeesContainer}>
          <Text style={styles.totalEmployeesLabel}>Total Customers</Text>
          <Text style={styles.totalEmployeesCount}>{customers.length}</Text>
        </View>
      </View>

      {/* Top Row Inputs (Given | Returns | Info) */}
      <View style={styles.topInputRow}>
        <View style={styles.topInputGroup}>
          <Text style={styles.topLabel}>Total Given</Text>
          <TextInput
            style={styles.topInput}
            value={totalDispatched}
            onChangeText={setTotalDispatched}
            placeholder="0"
            placeholderTextColor="#999"
          />
        </View>
        <View style={[styles.topInputGroup, { flex: 1.5 }]}>
          <Text style={styles.topLabel}>Adjustments (+/-)</Text>
          <TextInput
            style={styles.topInput}
            value={returnedExpression}
            onChangeText={setReturnedExpression}
            placeholder="e.g. +3 or -5"
            placeholderTextColor="#999"
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

  // Flatten data for DraggableFlatList
  const flatData = useMemo(() => {
    const data: any[] = [];

    // Add Global Header (formerly ListHeaderComponent)
    data.push({
      type: 'global_header',
      key: 'global_header_inputs',
    });

    customerSections.forEach(section => {
      // Add Header
      data.push({
        type: 'header',
        key: `header-${section.title}`,
        title: section.title,
        data: section.data
      });

      // Add Customers (if expanded)
      if (expandedSections[section.title]) {
        section.data.forEach(customer => {
          data.push({
            type: 'customer',
            key: customer._id,
            data: customer,
            sectionTitle: section.title
          });
        });
      }
    });
    return data;
  }, [customerSections, expandedSections]);

  // Calculate sticky header indices
  // logic remains same: only 'header' type sticks. 'global_header' does NOT stick.
  const stickyHeaderIndices = useMemo(() => {
    return flatData
      .map((item, index) => (item.type === 'header' ? index : null))
      .filter(item => item !== null) as number[];
  }, [flatData]);

  const handleFlatListDragEnd = ({ data }: { data: any[] }) => {
    // Filter out global header before processing sections
    const listData = data.filter(item => item.type !== 'global_header');

    const newSectionsMap: { [key: string]: Customer[] } = {};
    const newSectionOrder: string[] = [];
    let currentSectionTitle = '';

    listData.forEach(item => {
      if (item.type === 'header') {
        currentSectionTitle = item.title;
        newSectionOrder.push(currentSectionTitle);
        newSectionsMap[currentSectionTitle] = [];
      } else if (item.type === 'customer' && currentSectionTitle) {
        newSectionsMap[currentSectionTitle].push(item.data);
      }
    });

    const newSections = newSectionOrder.map(title => ({
      title,
      data: newSectionsMap[title]
    }));

    setCustomerSections(newSections);
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
            data={flatData}
            onDragEnd={handleFlatListDragEnd}
            keyExtractor={(item) => item.key}
            stickyHeaderIndices={stickyHeaderIndices}
            // ListHeaderComponent={renderListHeader} // REMOVED
            contentContainerStyle={styles.listContentContainer}
            renderItem={({ item, drag, isActive }) => {
              if (item.type === 'global_header') {
                return renderListHeader();
              }
              if (item.type === 'header') {
                return (
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSectionExpansion(item.title)}
                    disabled={isActive}
                  >
                    <Feather
                      name={expandedSections[item.title] ? 'chevron-down' : 'chevron-right'}
                      size={24}
                      color={COLORS.primary}
                    />
                    <Text style={styles.sectionHeaderText}>{item.title.toUpperCase()}</Text>
                  </TouchableOpacity>
                );
              }

              return (
                <ScaleDecorator>
                  <OpacityDecorator activeOpacity={0.8}>
                    <View style={[
                      styles.customerRow,
                      isActive && { backgroundColor: '#f0f0f0', elevation: 5 }
                    ]}>
                      <TouchableOpacity
                        onLongPress={drag}
                        style={styles.dragHandle}
                        disabled={isActive}
                      >
                        <Feather name="menu" size={20} color={COLORS.text} />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <CustomerAttendanceItem
                          customer={item.data}
                          isExpanded={true}
                          onToggleExpansion={null}
                          attendance={attendance[item.data._id] || {}}
                          onProductStatusChange={(productId, newStatus) =>
                            handleProductStatusChange(item.data._id, productId, newStatus)
                          }
                          onProductQuantityChange={(productId, newQuantity) =>
                            handleProductQuantityChange(item.data._id, productId, newQuantity)
                          }
                          onEdit={() => openEditModal(item.data)}
                          onAdd={() => openAddExtraProductModal(item.data)}
                          isPastDate={selectedDate < new Date().toISOString().split('T')[0]}
                          flatNumber={item.data.address?.FlatNo}
                        />
                      </View>
                    </View>
                  </OpacityDecorator>
                </ScaleDecorator>
              );
            }}
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
              <Button
                title={isLoading ? 'Submitting...' : 'Submit Attendance'}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
              />
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
    paddingBottom: 100, // Space for fixed footer
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