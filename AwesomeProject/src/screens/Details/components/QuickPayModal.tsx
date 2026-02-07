import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';

interface Bill {
    _id: string;
    billNo: string;
    period: string;
    totalAmount: number;
    dueAmount: number;
}

interface QuickPayModalProps {
    isVisible: boolean;
    onClose: () => void;
    customerName: string;
    totalDue: number;
    unpaidBills: Bill[];
    upiId?: string; // Store's UPI ID for displaying to user
    onPaymentSuccess: (amount: number, method: string, transactionId: string, allocations: { invoiceId: string; amount: number }[]) => Promise<void>;
}

const { width } = Dimensions.get('window');

export const QuickPayModal = ({ isVisible, onClose, totalDue, customerName, unpaidBills, upiId, onPaymentSuccess }: QuickPayModalProps) => {
    const [method, setMethod] = useState<'Cash' | 'UPI' | 'Online'>('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Payment Type: Full vs Partial
    const [isPartialPayment, setIsPartialPayment] = useState(false);
    const [amount, setAmount] = useState('');

    // Invoice Selection (only relevant when multiple invoices exist)
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    // Transaction ID for UPI/Online payments
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        if (isVisible) {
            // Reset state
            setMethod('Cash');
            setShowSuccess(false);
            setIsPartialPayment(false);
            setAmount(totalDue > 0 ? totalDue.toString() : '');
            setTransactionId('');

            // Auto-select invoice if only one exists
            if (unpaidBills.length === 1) {
                setSelectedInvoiceId(unpaidBills[0]._id);
            } else {
                setSelectedInvoiceId(null);
            }
        }
    }, [isVisible, totalDue, unpaidBills]);

    const handlePaymentTypeChange = (partial: boolean) => {
        setIsPartialPayment(partial);
        if (!partial) {
            // Full payment - set to total due
            setAmount(totalDue.toString());
        } else {
            setAmount('');
        }
    };

    const handlePay = async () => {
        const paymentAmount = parseFloat(amount);
        if (!amount || paymentAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }

        // Validate amount doesn't exceed current due
        if (paymentAmount > totalDue) {
            Alert.alert('Error', `Amount exceeds current due amount of ₹${totalDue.toFixed(2)}`);
            return;
        }

        // Validate transaction ID for non-cash payments
        if (method !== 'Cash' && (!transactionId || transactionId.trim() === '')) {
            Alert.alert('Transaction ID Required', 'Please enter the transaction ID for UPI/Online payments.');
            return;
        }

        setIsProcessing(true);
        try {
            // Build allocations
            const allocations: { invoiceId: string; amount: number }[] = [];

            if (selectedInvoiceId) {
                // User selected a specific invoice
                const selectedBill = unpaidBills.find(b => b._id === selectedInvoiceId);
                if (selectedBill) {
                    allocations.push({
                        invoiceId: selectedInvoiceId,
                        amount: Math.min(paymentAmount, selectedBill.dueAmount || selectedBill.totalAmount)
                    });
                }
            } else if (unpaidBills.length === 1) {
                // Only one invoice - allocate to it
                allocations.push({
                    invoiceId: unpaidBills[0]._id,
                    amount: paymentAmount
                });
            } else {
                // Multiple invoices, no selection - allocate to oldest first
                let remaining = paymentAmount;
                for (const bill of unpaidBills) {
                    if (remaining <= 0) break;
                    const billDue = bill.dueAmount || bill.totalAmount;
                    const allocated = Math.min(remaining, billDue);
                    allocations.push({
                        invoiceId: bill._id,
                        amount: allocated
                    });
                    remaining -= allocated;
                }
            }

            await onPaymentSuccess(paymentAmount, method, transactionId, allocations);
            setShowSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (showSuccess) {
        return (
            <Modal visible={isVisible} transparent={true} animationType="fade">
                <View style={styles.successOverlay}>
                    <View style={styles.successContainer}>
                        <View style={styles.successIconCircle}>
                            <Feather name="check" size={40} color="#FFFFFF" />
                        </View>
                        <Text style={styles.successTitle}>Payment Received!</Text>
                        <Text style={styles.successSubtitle}>₹{amount} via {method}</Text>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Collect Payment</Text>
                            <Text style={styles.subtitle}>from {customerName}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
                        {/* Current Due Summary */}
                        <View style={styles.dueCard}>
                            <Text style={styles.dueLabel}>Current Due Amount</Text>
                            <Text style={styles.dueAmount}>₹{totalDue.toFixed(2)}</Text>
                            {unpaidBills.length > 0 && (
                                <Text style={styles.invoiceCount}>{unpaidBills.length} unpaid invoice{unpaidBills.length > 1 ? 's' : ''}</Text>
                            )}
                        </View>

                        {/* Invoice Selection - Only show if multiple invoices */}
                        {unpaidBills.length > 1 && (
                            <View style={styles.invoicesCard}>
                                <Text style={styles.sectionTitle}>Select Invoice to Pay (Optional)</Text>
                                <Text style={styles.sectionHint}>Leave unselected to apply to oldest invoices</Text>
                                {unpaidBills.map((bill) => (
                                    <TouchableOpacity
                                        key={bill._id}
                                        style={[
                                            styles.invoiceRow,
                                            selectedInvoiceId === bill._id && styles.selectedInvoiceRow
                                        ]}
                                        onPress={() => setSelectedInvoiceId(selectedInvoiceId === bill._id ? null : bill._id)}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.invoicePeriod}>{bill.period}</Text>
                                            <Text style={styles.invoiceBillNo}>{bill.billNo}</Text>
                                        </View>
                                        <Text style={styles.invoiceAmount}>₹{(bill.dueAmount || bill.totalAmount).toFixed(2)}</Text>
                                        {selectedInvoiceId === bill._id && (
                                            <Feather name="check-circle" size={20} color={COLORS.primary} style={{ marginLeft: 8 }} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Payment Type: Full vs Partial */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Type</Text>

                            <TouchableOpacity
                                style={[
                                    styles.paymentTypeButton,
                                    !isPartialPayment && styles.paymentTypeButtonSelected
                                ]}
                                onPress={() => handlePaymentTypeChange(false)}
                            >
                                <View style={[
                                    styles.radioButton,
                                    !isPartialPayment && styles.radioButtonSelected
                                ]}>
                                    {!isPartialPayment && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.paymentTypeText}>Full Payment (₹{totalDue.toFixed(2)})</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.paymentTypeButton,
                                    isPartialPayment && styles.paymentTypeButtonSelected
                                ]}
                                onPress={() => handlePaymentTypeChange(true)}
                            >
                                <View style={[
                                    styles.radioButton,
                                    isPartialPayment && styles.radioButtonSelected
                                ]}>
                                    {isPartialPayment && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.paymentTypeText}>Partial Payment</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Amount Input - Only for partial payment */}
                        {isPartialPayment ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Enter Amount</Text>
                                <View style={styles.amountInputContainer}>
                                    <Text style={styles.currencyPrefix}>₹</Text>
                                    <TextInput
                                        style={styles.amountInput}
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="numeric"
                                        placeholder="0.00"
                                        placeholderTextColor="#BDBDBD"
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.fullPaymentDisplay}>
                                <Text style={styles.fullPaymentLabel}>Amount to Collect</Text>
                                <Text style={styles.fullPaymentAmount}>₹{totalDue.toFixed(2)}</Text>
                            </View>
                        )}

                        {/* Payment Method */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                            <View style={styles.methodsGrid}>
                                {(['Cash', 'UPI', 'Online'] as const).map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            styles.methodCard,
                                            method === m && styles.selectedMethodCard
                                        ]}
                                        onPress={() => setMethod(m)}
                                    >
                                        <Feather
                                            name={m === 'Cash' ? 'dollar-sign' : m === 'UPI' ? 'smartphone' : 'credit-card'}
                                            size={24}
                                            color={method === m ? COLORS.primary : '#9E9E9E'}
                                        />
                                        <Text style={[
                                            styles.methodText,
                                            method === m && styles.selectedMethodText
                                        ]}>{m}</Text>
                                        {method === m && (
                                            <View style={styles.checkBadge}>
                                                <Feather name="check" size={12} color="#FFF" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* UPI Payment Instructions */}
                        {method === 'UPI' && upiId && (
                            <View style={styles.upiInstructionsCard}>
                                <View style={styles.upiHeader}>
                                    <Feather name="info" size={20} color={COLORS.primary} />
                                    <Text style={styles.upiInstructionsTitle}>Pay via UPI</Text>
                                </View>
                                <View style={styles.upiIdContainer}>
                                    <Text style={styles.upiIdLabel}>UPI ID:</Text>
                                    <Text style={styles.upiIdText}>{upiId}</Text>
                                </View>
                                <Text style={styles.upiHint}>
                                    Ask customer to pay ₹{amount || '0'} to this UPI ID, then enter the transaction ID below.
                                </Text>
                            </View>
                        )}

                        {/* Transaction ID Input for UPI/Online */}
                        {(method === 'UPI' || method === 'Online') && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Transaction ID <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.transactionInput}
                                    value={transactionId}
                                    onChangeText={setTransactionId}
                                    placeholder={method === 'UPI' ? 'e.g., 123456789012' : 'Enter transaction/reference ID'}
                                    placeholderTextColor="#999"
                                    autoCapitalize="characters"
                                />
                                <Text style={styles.transactionHint}>
                                    {method === 'UPI'
                                        ? 'Enter the 12-digit transaction ID from the payment confirmation'
                                        : 'Enter the transaction reference from payment gateway'}
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.payButton, isProcessing && styles.disabledButton]}
                        onPress={handlePay}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <>
                                <Feather name="check-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.payButtonText}>Collect ₹{amount || '0'}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
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
        marginTop: 2,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    dueCard: {
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    dueLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    dueAmount: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 4,
    },
    invoiceCount: {
        fontSize: 12,
        color: '#757575',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    sectionHint: {
        fontSize: 12,
        color: '#999',
        marginBottom: 12,
        marginTop: -8,
    },
    invoicesCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    invoiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#FFF',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedInvoiceRow: {
        backgroundColor: '#F0F9FF',
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    invoicePeriod: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1C',
    },
    invoiceBillNo: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
    },
    invoiceAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1C',
        marginLeft: 12,
    },
    paymentTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        marginBottom: 10,
    },
    paymentTypeButtonSelected: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#999',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioButtonSelected: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    radioButtonInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    paymentTypeText: {
        fontSize: 16,
        color: '#1C1C1C',
        flex: 1,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    currencyPrefix: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        color: '#1C1C1C',
        paddingVertical: 14,
    },
    fullPaymentDisplay: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    fullPaymentLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    fullPaymentAmount: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.primary,
    },
    methodsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    methodCard: {
        flex: 1,
        aspectRatio: 1.2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    selectedMethodCard: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F9FF',
        borderWidth: 2,
    },
    methodText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#9E9E9E',
    },
    selectedMethodText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    checkBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 16,
        paddingVertical: 18,
        marginHorizontal: 24,
        marginTop: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#BDBDBD',
        shadowOpacity: 0,
        elevation: 0,
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successContainer: {
        backgroundColor: '#FFFFFF',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        width: width * 0.8,
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
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1C1C1C',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#757575',
    },
    upiInstructionsCard: {
        backgroundColor: '#FFF8E1',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFD54F',
    },
    upiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    upiInstructionsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1C',
        marginLeft: 8,
    },
    upiIdContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FFD54F',
    },
    upiIdLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    upiIdText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    upiHint: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    required: {
        color: '#F44336',
        fontWeight: '700',
    },
    transactionInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1C1C1C',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 8,
    },
    transactionHint: {
        fontSize: 12,
        color: '#999',
        lineHeight: 16,
    },
});
