import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';

interface FinanceHeroCardProps {
    totalDue: number;
    creditBalance: number;
    onCollectPayment: () => void;
}

const { width } = Dimensions.get('window');

export const FinanceHeroCard = ({ totalDue, creditBalance, onCollectPayment }: FinanceHeroCardProps) => {
    const isCredit = creditBalance > 0 && totalDue === 0;

    // Dynamic styling based on status
    const cardBackgroundColor = isCredit
        ? '#E8F5E9' // Soft Green for Credit
        : totalDue > 0
            ? '#FFEBEE' // Soft Red for Dues
            : '#E3F2FD'; // Soft Blue for Cleared

    const accentColor = isCredit
        ? '#2E7D32' // Dark Green
        : totalDue > 0
            ? '#C62828' // Dark Red
            : '#1565C0'; // Dark Blue

    const labelText = isCredit ? 'Available Credit' : 'Total Outstanding';
    const amountText = isCredit ? `₹${creditBalance.toFixed(2)}` : `₹${totalDue.toFixed(2)}`;

    return (
        <View style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
            <View style={styles.backgroundPattern}>
                <Feather name="activity" size={120} color={accentColor} style={{ opacity: 0.05 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.label, { color: accentColor }]}>{labelText}</Text>
                <Text style={[styles.amount, { color: accentColor }]}>{amountText}</Text>

                {totalDue === 0 && !isCredit && (
                    <View style={styles.clearedBadge}>
                        <Feather name="check-circle" size={16} color={accentColor} />
                        <Text style={[styles.clearedText, { color: accentColor }]}>All Dues Cleared</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={styles.collectButton}
                onPress={onCollectPayment}
                activeOpacity={0.8}
            >
                <View style={styles.iconCircle}>
                    <Feather name="credit-card" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.buttonText}>Collect Payment</Text>
                <Feather name="chevron-right" size={20} color={COLORS.white} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        paddingTop: 24,
        paddingBottom: 24,
        paddingHorizontal: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        marginTop: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    backgroundPattern: {
        position: 'absolute',
        right: -20,
        top: -20,
    },
    content: {
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    amount: {
        fontSize: 36,
        fontWeight: '800',
    },
    collectButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 50,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    clearedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 8,
    },
    clearedText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
    },
});
