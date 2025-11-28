import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import CustomSafeAreaView from '../../components/global/CustomSafeAreaView';
import CustomText from '../../components/ui/CustomText';
import CustomButton from '../../components/ui/CustomButton';
import { Colors, Fonts } from '../../utils/Constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { RFValue } from 'react-native-responsive-fontsize';
import { ExpandableCalendar, CalendarProvider } from 'react-native-calendars';

// Mock Data (Replace with API later)
const MOCK_AREAS = [
    { id: '1', name: 'Rajeev Nagar' },
    { id: '2', name: 'Sai Sadan' },
    { id: '3', name: 'Green Valley' },
];

const MOCK_SUBSCRIPTIONS = [
    { id: '1', areaId: '1', product: 'Full Cream Milk 500ml', qty: 2, customer: 'Flat 101' },
    { id: '2', areaId: '1', product: 'Full Cream Milk 500ml', qty: 1, customer: 'Flat 102' },
    { id: '3', areaId: '1', product: 'Curd 500ml', qty: 1, customer: 'Flat 102' },
    { id: '4', areaId: '1', product: 'Bread', qty: 1, customer: 'Flat 204' },
    { id: '5', areaId: '2', product: 'Full Cream Milk 500ml', qty: 5, customer: 'Flat 303' },
];

export const DispatchSummaryScreen = ({ navigation }: any) => {
    const [selectedArea, setSelectedArea] = useState(MOCK_AREAS[0]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Aggregate Data Logic
    const dispatchSummary = useMemo(() => {
        const areaSubs = MOCK_SUBSCRIPTIONS.filter(sub => sub.areaId === selectedArea.id);
        const summary: Record<string, number> = {};

        areaSubs.forEach(sub => {
            if (summary[sub.product]) {
                summary[sub.product] += sub.qty;
            } else {
                summary[sub.product] = sub.qty;
            }
        });

        return Object.entries(summary).map(([name, total]) => ({ name, total }));
    }, [selectedArea]);

    const goToNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    const goToPreviousMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate.toISOString().split('T')[0]);
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

    return (
        <CustomSafeAreaView>
            <CalendarProvider date={selectedDate} onDateChanged={setSelectedDate}>
                <ExpandableCalendar
                    renderHeader={renderCustomHeader}
                    hideArrows
                    markedDates={{
                        [selectedDate]: { selected: true, selectedColor: Colors.primary },
                    }}
                    theme={{
                        selectedDayBackgroundColor: Colors.primary,
                        todayTextColor: Colors.primary,
                        arrowColor: Colors.primary,
                    }}
                />

                {/* Controls */}
                <View style={styles.controls}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaScroll}>
                        {MOCK_AREAS.map(area => (
                            <TouchableOpacity
                                key={area.id}
                                style={[
                                    styles.areaChip,
                                    selectedArea.id === area.id && styles.areaChipActive
                                ]}
                                onPress={() => setSelectedArea(area)}
                            >
                                <CustomText
                                    style={[
                                        styles.areaText,
                                        selectedArea.id === area.id && styles.areaTextActive
                                    ]}
                                    fontFamily={selectedArea.id === area.id ? Fonts.Bold : Fonts.Regular}
                                >
                                    {area.name}
                                </CustomText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Summary Cards */}
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.summaryHeader}>
                        <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
                            Packing List
                        </CustomText>
                        <View style={styles.totalBadge}>
                            <CustomText variant="h6" style={{ color: Colors.primary }} fontFamily={Fonts.Bold}>
                                {dispatchSummary.reduce((acc, item) => acc + item.total, 0)} Items
                            </CustomText>
                        </View>
                    </View>

                    {dispatchSummary.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="basket-off-outline" size={64} color="#ccc" />
                            <CustomText style={{ marginTop: 16, color: '#999' }} variant="h5">No items to dispatch</CustomText>
                        </View>
                    ) : (
                        dispatchSummary.map((item, index) => (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardIcon}>
                                    <Icon name="package-variant-closed" size={24} color={Colors.primary} />
                                </View>
                                <View style={styles.cardContent}>
                                    <CustomText variant="h5" fontFamily={Fonts.Medium} style={styles.productName}>{item.name}</CustomText>
                                    <CustomText variant="h8" style={styles.unitText}>Unit: Pcs</CustomText>
                                </View>
                                <View style={styles.cardCount}>
                                    <CustomText variant="h3" fontFamily={Fonts.Bold} style={{ color: Colors.primary }}>
                                        {item.total}
                                    </CustomText>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                {/* Action Button */}
                <View style={styles.footer}>
                    <CustomButton
                        title="Confirm Dispatch"
                        onPress={() => alert('Dispatch Confirmed!')}
                        loading={false}
                        disabled={dispatchSummary.length === 0}
                    />
                </View>
            </CalendarProvider>
        </CustomSafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#fff', // Ensure background is white
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
    monthText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333', // Explicit color
    },
    controls: {
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    areaScroll: {
        flexDirection: 'row',
    },
    areaChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#F5F6FA',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#F5F6FA',
    },
    areaChipActive: {
        backgroundColor: '#E3F2FD',
        borderColor: Colors.primary,
    },
    areaText: {
        color: '#666',
        fontSize: RFValue(12),
    },
    areaTextActive: {
        color: Colors.primary,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    summaryHeader: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F5F6FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    productName: {
        color: Colors.text,
        marginBottom: 4,
    },
    unitText: {
        color: '#999',
    },
    cardCount: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
        backgroundColor: '#F5F6FA',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 80,
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});
