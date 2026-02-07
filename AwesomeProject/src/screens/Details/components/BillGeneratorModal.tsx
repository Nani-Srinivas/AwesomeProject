import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../../constants/colors';

interface BillGeneratorModalProps {
    isVisible: boolean;
    onClose: () => void;
    onGenerate: (period: string, from?: string, to?: string) => Promise<void>;
    year?: number;
}

export const BillGeneratorModal = ({ isVisible, onClose, onGenerate, year = new Date().getFullYear() }: BillGeneratorModalProps) => {
    const [mode, setMode] = useState<'MONTHLY' | 'CUSTOM'>('MONTHLY');

    // Monthly State
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [currentYear, setCurrentYear] = useState(year);

    // Custom State
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            if (mode === 'MONTHLY') {
                if (selectedMonth === null) return;
                const period = `${months[selectedMonth]} ${currentYear}`;
                await onGenerate(period);
            } else {
                if (!startDate || !endDate) {
                    Alert.alert('Selection Required', 'Please select both start and end dates.');
                    return;
                }
                // Pass formatted strings or handle in parent
                await onGenerate('Custom Range', startDate, endDate);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // Custom Range Logic
    const onDayPress = (day: { dateString: string }) => {
        const picked = day.dateString;
        if (!startDate && !endDate) {
            setStartDate(picked);
        } else if (startDate && !endDate) {
            if (picked < startDate) {
                setStartDate(picked);
                setEndDate(startDate); // Swap if picked is earlier
            } else {
                setEndDate(picked);
            }
        } else {
            setStartDate(picked);
            setEndDate(null);
        }
    };

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        if (!startDate) return marks;

        if (startDate && !endDate) {
            marks[startDate] = { startingDay: true, endingDay: true, color: COLORS.primary, textColor: '#FFF' };
            return marks;
        }

        if (startDate && endDate) {
            let curr = new Date(startDate);
            const end = new Date(endDate);
            const endStr = endDate;

            while (curr <= end) {
                const d = curr.toISOString().split('T')[0];
                if (d === startDate) {
                    marks[d] = { startingDay: true, color: COLORS.primary, textColor: '#FFF' };
                } else if (d === endStr) {
                    marks[d] = { endingDay: true, color: COLORS.primary, textColor: '#FFF' };
                } else {
                    marks[d] = { color: '#E3F2FD', textColor: '#333' };
                }
                curr.setDate(curr.getDate() + 1);
            }
        }
        return marks;
    }, [startDate, endDate]);

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Generate New Bill</Text>
                            <Text style={styles.subtitle}>Select period to generate invoice</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'MONTHLY' && styles.activeTab]}
                            onPress={() => setMode('MONTHLY')}
                        >
                            <Text style={[styles.tabText, mode === 'MONTHLY' && styles.activeTabText]}>Monthly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'CUSTOM' && styles.activeTab]}
                            onPress={() => setMode('CUSTOM')}
                        >
                            <Text style={[styles.tabText, mode === 'CUSTOM' && styles.activeTabText]}>Custom Range</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.contentScroll}>
                        {mode === 'MONTHLY' ? (
                            <>
                                <View style={styles.yearSelector}>
                                    <TouchableOpacity onPress={() => setCurrentYear(p => p - 1)} style={styles.yearArrow}>
                                        <Feather name="chevron-left" size={20} color="#333" />
                                    </TouchableOpacity>
                                    <Text style={styles.yearText}>{currentYear}</Text>
                                    <TouchableOpacity onPress={() => setCurrentYear(p => p + 1)} style={styles.yearArrow}>
                                        <Feather name="chevron-right" size={20} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.grid}>
                                    {months.map((month, index) => {
                                        const isSelected = selectedMonth === index;
                                        return (
                                            <TouchableOpacity
                                                key={month}
                                                style={[styles.monthItem, isSelected && styles.selectedMonth]}
                                                onPress={() => setSelectedMonth(index)}
                                            >
                                                <Text style={[styles.monthText, isSelected && styles.selectedMonthText]}>
                                                    {month.slice(0, 3)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </>
                        ) : (
                            <View>
                                <Calendar
                                    onDayPress={onDayPress}
                                    markingType={'period'}
                                    markedDates={markedDates}
                                    theme={{
                                        todayTextColor: COLORS.primary,
                                        selectedDayBackgroundColor: COLORS.primary,
                                        arrowColor: COLORS.primary,
                                    }}
                                />
                                <View style={styles.dateDisplayRow}>
                                    <View style={styles.dateDisplay}>
                                        <Text style={styles.dateLabel}>From:</Text>
                                        <Text style={styles.dateValue}>{startDate || 'Select'}</Text>
                                    </View>
                                    <View style={styles.arrowContainer}>
                                        <Feather name="arrow-right" size={16} color="#999" />
                                    </View>
                                    <View style={styles.dateDisplay}>
                                        <Text style={styles.dateLabel}>To:</Text>
                                        <Text style={styles.dateValue}>{endDate || 'Select'}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.generateButton,
                                ((mode === 'MONTHLY' && selectedMonth === null) || (mode === 'CUSTOM' && (!startDate || !endDate)) || isGenerating) && styles.disabledButton
                            ]}
                            onPress={handleGenerate}
                            disabled={(mode === 'MONTHLY' && selectedMonth === null) || (mode === 'CUSTOM' && (!startDate || !endDate)) || isGenerating}
                        >
                            {isGenerating ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Feather name="file-plus" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.generateButtonText}>Generate Bill</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '80%', // Taller for calendar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1C',
    },
    subtitle: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
    },
    activeTabText: {
        color: COLORS.primary,
    },
    contentScroll: {
        flex: 1,
    },
    yearSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 8,
    },
    yearArrow: {
        padding: 10,
    },
    yearText: {
        fontSize: 18,
        fontWeight: '700',
        marginHorizontal: 20,
        color: '#333',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    monthItem: {
        width: '31%',
        aspectRatio: 1.5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    selectedMonth: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    monthText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#616161',
    },
    selectedMonthText: {
        color: '#FFFFFF',
    },
    dateDisplayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingHorizontal: 12,
        marginBottom: 24,
    },
    dateDisplay: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
    },
    dateLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    arrowContainer: {
        paddingHorizontal: 12,
    },
    footer: {
        marginTop: 16,
    },
    generateButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#BDBDBD',
    },
    generateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
