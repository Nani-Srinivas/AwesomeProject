import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';

interface TimelineEvent {
    id: string;
    type: 'PAYMENT' | 'BILL_GENERATED';
    title: string;
    subtitle: string;
    date: string;
    amount?: string;
    status?: string;
}

interface TransactionTimelineProps {
    events: TimelineEvent[];
}

export const TransactionTimeline = ({ events }: TransactionTimelineProps) => {
    if (!events || events.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Recent Activity</Text>
            <View style={styles.listContainer}>
                {events.map((event, index) => (
                    <View key={event.id} style={styles.row}>
                        {/* Timeline Line */}
                        <View style={styles.timelineColumn}>
                            <View style={[
                                styles.iconCircle,
                                event.type === 'PAYMENT' ? styles.paymentIcon : styles.billIcon
                            ]}>
                                <Feather
                                    name={event.type === 'PAYMENT' ? "arrow-down-left" : "file-text"}
                                    size={14}
                                    color={event.type === 'PAYMENT' ? '#4CAF50' : '#FF9800'}
                                />
                            </View>
                            {index !== events.length - 1 && <View style={styles.verticalLine} />}
                        </View>

                        {/* Content */}
                        <View style={styles.contentColumn}>
                            <View style={styles.dateRow}>
                                <Text style={styles.dateText}>{event.date}</Text>
                                {event.status && (
                                    <View style={[
                                        styles.statusBadge,
                                        // event.status === 'Completed' || event.status === 'Paid' ? styles.successBadge : styles.pendingBadge
                                    ]}>
                                        <Text style={styles.statusText}>{event.status}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.detailsRow}>
                                <View>
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                                </View>
                                {event.amount && (
                                    <Text style={[
                                        styles.amountText,
                                        event.type === 'PAYMENT' ? styles.paymentAmount : styles.billAmount
                                    ]}>
                                        {event.type === 'PAYMENT' ? '+' : ''} {event.amount}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1C',
        marginBottom: 16,
    },
    listContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    timelineColumn: {
        alignItems: 'center',
        marginRight: 12,
        width: 24,
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    paymentIcon: {
        backgroundColor: '#E8F5E9',
    },
    billIcon: {
        backgroundColor: '#FFF3E0',
    },
    verticalLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#F5F5F5',
        marginVertical: 4,
    },
    contentColumn: {
        flex: 1,
        paddingBottom: 20,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 11,
        color: '#9E9E9E',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#F5F5F5',
    },
    successBadge: {
        backgroundColor: '#E8F5E9',
    },
    pendingBadge: {
        backgroundColor: '#FFF3E0',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#616161',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1C',
        marginBottom: 2,
    },
    eventSubtitle: {
        fontSize: 12,
        color: '#757575',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '700',
    },
    paymentAmount: {
        color: '#4CAF50',
    },
    billAmount: {
        color: '#1C1C1C',
    },
});
