
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager, ActivityIndicator } from 'react-native';

import { useNavigation, useIsFocused } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { apiService } from '../../../services/apiService';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface VendorPayable {
    id: string;
    name: string;
    amount: number;
    status: 'overdue' | 'pending' | 'paid';
    days: number;
    receipts: any[];
    lastDate?: string;
}

export const PayablesSection = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [vendors, setVendors] = useState<VendorPayable[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState<string>('');
    const [expandedVendors, setExpandedVendors] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (isFocused) {
            fetchPayablesData();
        }
    }, [isFocused]);

    const fetchPayablesData = async () => {
        try {
            setLoading(true);

            // Set current date
            const today = new Date();
            setCurrentDate(today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));

            // Get today's date range for filtering
            const todayStart = new Date(today.setHours(0, 0, 0, 0));
            const todayEnd = new Date(today.setHours(23, 59, 59, 999));

            // Fetch all vendors
            const vendorsResponse = await apiService.get('/vendors');
            const allVendors = vendorsResponse.data.data || [];

            // Fetch all inventory receipts
            const receiptsResponse = await apiService.get('/inventory/receipts');
            const allReceipts = receiptsResponse.data.data || [];

            // Calculate payables for each vendor
            const calculatedPayables: VendorPayable[] = allVendors.map((vendor: any) => {
                // Filter receipts for this vendor AND today's date only
                const vendorReceipts = allReceipts.filter((receipt: any) => {
                    if (!receipt.vendorId || !(receipt.vendorId._id === vendor._id || receipt.vendorId === vendor._id)) {
                        return false;
                    }
                    // Filter by today's date
                    const receiptDate = new Date(receipt.date);
                    return receiptDate >= todayStart && receiptDate <= todayEnd;
                });

                // Calculate total payable (Total Amount - Amount Paid)
                const totalPayable = vendorReceipts.reduce((sum: number, receipt: any) => {
                    const amount = (receipt.totalAmount || 0) - (receipt.amountPaid || 0);
                    return sum + (amount > 0 ? amount : 0);
                }, 0);

                // Find latest receipt date (should be today)
                let lastDate = '';
                if (vendorReceipts.length > 0) {
                    const sortedReceipts = [...vendorReceipts].sort((a: any, b: any) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                    const dateObj = new Date(sortedReceipts[0].date);
                    lastDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                }

                // Determine status
                const status = totalPayable > 0 ? 'pending' : 'paid';

                return {
                    id: vendor._id,
                    name: vendor.name,
                    amount: totalPayable,
                    status: status,
                    days: 0,
                    receipts: vendorReceipts,
                    lastDate: lastDate
                };
            });

            // Sort by amount descending
            calculatedPayables.sort((a, b) => b.amount - a.amount);

            setVendors(calculatedPayables);
        } catch (error) {
            console.error('Error fetching payables data:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalOutstanding = vendors.reduce((sum, v) => sum + v.amount, 0);

    const toggleVendorExpand = (vendorId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedVendors(prev => ({
            ...prev,
            [vendorId]: !prev[vendorId]
        }));
    };

    if (loading && !vendors.length) {
        return (
            <View style={[styles.sectionContainer, styles.loadingContainer]}>
                <ActivityIndicator size="small" color="#1E73B8" />
            </View>
        );
    }

    return (
        <View style={styles.sectionContainer}>
            {/* Section Header - Always Visible */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    <View style={styles.titleIndicator} />
                    <View>
                        <Text style={styles.sectionTitle}>Payables</Text>
                        {currentDate ? (
                            <Text style={styles.headerDateText}>{currentDate}</Text>
                        ) : null}
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.totalSummary}>
                        Total: <Text style={styles.totalAmount}>₹ {totalOutstanding.toLocaleString()}</Text>
                    </Text>
                </View>
            </View>

            {/* Vendor Accordions */}
            <View style={styles.vendorsList}>
                {vendors.length > 0 ? (
                    vendors.map((vendor, index) => (
                        <View key={vendor.id} style={[
                            styles.vendorAccordion,
                            index === vendors.length - 1 && styles.lastVendorAccordion
                        ]}>
                            {/* Vendor Header */}
                            <TouchableOpacity
                                onPress={() => toggleVendorExpand(vendor.id)}
                                activeOpacity={0.7}
                                style={styles.vendorHeader}
                            >
                                <View style={styles.vendorHeaderLeft}>
                                    <Text style={styles.vendorName}>{vendor.name}</Text>
                                    {vendor.lastDate ? (
                                        <Text style={styles.vendorDate}>{vendor.lastDate}</Text>
                                    ) : null}
                                </View>
                                <View style={styles.vendorHeaderRight}>
                                    <Text style={styles.vendorAmount}>₹ {vendor.amount.toLocaleString()}</Text>
                                    <Feather
                                        name={expandedVendors[vendor.id] ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        color="#666"
                                        style={styles.chevronIcon}
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* Vendor Expanded Content - Product List */}
                            {expandedVendors[vendor.id] && (
                                <View style={styles.vendorContent}>
                                    {vendor.receipts.length > 0 ? (
                                        vendor.receipts.map((receipt: any, receiptIndex: number) => (
                                            <View key={receipt._id || receiptIndex} style={styles.receiptBlock}>
                                                <Text style={styles.receiptDate}>
                                                    {receipt.date ?
                                                        new Date(receipt.date).toLocaleDateString('en-US', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                        : 'Date not available'
                                                    }
                                                </Text>
                                                {receipt.items && receipt.items.length > 0 ? (
                                                    receipt.items.map((item: any, itemIndex: number) => {
                                                        const productName = item.storeProductId?.name ||
                                                            item.storeProductId?.product?.name ||
                                                            'Unknown Product';
                                                        return (
                                                            <View key={itemIndex} style={styles.productRow}>
                                                                <Text style={styles.productName}>{productName}</Text>
                                                                <Text style={styles.productDetails}>
                                                                    {item.receivedQuantity} × ₹{item.unitPrice} = ₹{(item.receivedQuantity * item.unitPrice).toFixed(2)}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })
                                                ) : (
                                                    <Text style={styles.noProductsText}>No products in this receipt</Text>
                                                )}
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noReceiptsText}>No stock receipts found</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.noPayablesText}>No vendors with payables.</Text>
                )}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleIndicator: {
        width: 4,
        height: 16,
        backgroundColor: '#1E73B8',
        marginRight: 8,
        borderRadius: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333333',
    },
    headerDateText: {
        fontSize: 11,
        color: '#888888',
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalSummary: {
        fontSize: 14,
        color: '#666666',
        marginRight: 8,
    },
    totalAmount: {
        fontWeight: 'bold',
        color: '#1C1C1C',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vendorsList: {
        marginTop: 16,
    },
    vendorAccordion: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingVertical: 12,
    },
    lastVendorAccordion: {
        borderBottomWidth: 0,
    },
    vendorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    vendorHeaderLeft: {
        flex: 1,
    },
    vendorName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 2,
    },
    vendorDate: {
        fontSize: 11,
        color: '#888888',
    },
    vendorHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vendorAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E73B8',
        marginRight: 8,
    },
    chevronIcon: {
        marginLeft: 4,
    },
    vendorContent: {
        marginTop: 12,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#E0E0E0',
    },
    receiptBlock: {
        marginBottom: 12,
    },
    receiptDate: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '600',
        marginBottom: 8,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: '#F9F9F9',
        borderRadius: 6,
        marginBottom: 4,
    },
    productName: {
        fontSize: 13,
        color: '#333333',
        fontWeight: '500',
        flex: 1,
    },
    productDetails: {
        fontSize: 12,
        color: '#666666',
        marginLeft: 8,
    },
    noProductsText: {
        fontSize: 12,
        color: '#999999',
        fontStyle: 'italic',
        paddingVertical: 8,
    },
    noReceiptsText: {
        fontSize: 12,
        color: '#999999',
        fontStyle: 'italic',
        paddingVertical: 8,
    },
    noPayablesText: {
        fontSize: 13,
        color: '#999999',
        textAlign: 'center',
        paddingVertical: 16,
    },
});
