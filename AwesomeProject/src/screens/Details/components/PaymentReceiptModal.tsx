import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Share from 'react-native-share';
import { COLORS } from '../../../constants/colors';
import { BillPreviewModal } from './BillPreviewModal';

interface PaymentReceiptModalProps {
    isVisible: boolean;
    onClose: () => void;
    receiptData: {
        amount: number;
        method: string;
        billsAllocated: {
            billNo: string;
            period: string;
            amountPaid: number;
        }[];
        remainingBalance: number;
    };
    pdfPath?: string;
}

const { width } = Dimensions.get('window');

export const PaymentReceiptModal = ({ isVisible, onClose, receiptData, pdfPath }: PaymentReceiptModalProps) => {
    const [showPreview, setShowPreview] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        if (!pdfPath) {
            Alert.alert('Error', 'Receipt not available for sharing.');
            return;
        }

        setIsSharing(true);
        try {
            await Share.open({
                url: Platform.OS === 'android' ? `file://${pdfPath}` : pdfPath,
                title: 'Payment Receipt',
                message: `Payment Receipt - ₹${receiptData.amount}`,
                type: 'application/pdf',
            });
        } catch (error) {
            console.error('Share error:', error);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <>
            <Modal
                visible={isVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                    <View style={styles.modalContainer}>
                        {/* Success Icon */}
                        <View style={styles.successIconCircle}>
                            <Feather name="check" size={40} color="#FFFFFF" />
                        </View>

                        <Text style={styles.title}>Payment Received!</Text>
                        <Text style={styles.subtitle}>₹{receiptData.amount.toFixed(2)} via {receiptData.method}</Text>

                        {/* Bills Allocated */}
                        <View style={styles.allocationsContainer}>
                            <Text style={styles.allocationsTitle}>Applied to:</Text>
                            {receiptData.billsAllocated.map((bill, index) => (
                                <View key={index} style={styles.allocationRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.billNumber}>{bill.billNo}</Text>
                                        <Text style={styles.billPeriod}>{bill.period}</Text>
                                    </View>
                                    <Text style={styles.billAmount}>₹{bill.amountPaid.toFixed(2)}</Text>
                                    {bill.amountPaid >= 0 && (
                                        <View style={styles.paidBadge}>
                                            <Text style={styles.paidBadgeText}>
                                                {/* You can add logic to show "Fully Paid" or "Partially Paid" */}
                                                Paid
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* New Balance */}
                        <View style={styles.balanceContainer}>
                            <Text style={styles.balanceLabel}>New Balance:</Text>
                            <Text style={styles.balanceAmount}>₹{receiptData.remainingBalance.toFixed(2)}</Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionsRow}>
                            {pdfPath && (
                                <>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => setShowPreview(true)}
                                    >
                                        <Feather name="eye" size={20} color={COLORS.primary} />
                                        <Text style={styles.actionButtonText}>View Receipt</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.primaryButton]}
                                        onPress={handleShare}
                                        disabled={isSharing}
                                    >
                                        {isSharing ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <>
                                                <Feather name="share-2" size={20} color="#FFF" />
                                                <Text style={[styles.actionButtonText, { color: '#FFF' }]}>Share</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {/* Done Button */}
                        <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bill Preview Modal */}
            <BillPreviewModal
                isVisible={showPreview}
                onClose={() => setShowPreview(false)}
                pdfUrl={pdfPath ? `file://${pdfPath}` : null}
            />
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        width: width * 0.9,
        maxWidth: 400,
        alignItems: 'center',
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1C1C1C',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#757575',
        marginBottom: 24,
    },
    allocationsContainer: {
        width: '100%',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    allocationsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    allocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    billNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1C',
    },
    billPeriod: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
    },
    billAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1C',
        marginRight: 8,
    },
    paidBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    paidBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#4CAF50',
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    balanceLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    balanceAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.primary,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 14,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    doneButton: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
});
