import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        description?: string;
        price: number;
        stock: number;
        images?: string[];
        storeCategoryId?: {
            name: string;
        };
        storeSubcategoryId?: {
            name: string;
        };
        isAvailable?: boolean;
    };
    onEdit: (productId: string) => void;
    onDelete: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${product.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete(product._id),
                },
            ]
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {product.images && product.images.length > 0 ? (
                    <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                ) : (
                    <View style={[styles.productImage, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>📦</Text>
                    </View>
                )}

                <View style={styles.productInfo}>
                    <View style={styles.headerRow}>
                        <Text style={styles.productName} numberOfLines={1}>
                            {product.name}
                        </Text>
                        <Text style={styles.price}>₹{product.price}</Text>
                    </View>

                    <View style={styles.metaRow}>
                        <Text style={styles.category}>
                            {product.storeCategoryId?.name || 'Uncategorized'}
                            {product.storeSubcategoryId?.name && ` • ${product.storeSubcategoryId.name}`}
                        </Text>
                    </View>

                    <View style={styles.stockRow}>
                        <Text style={[styles.stock, product.stock === 0 && styles.outOfStock]}>
                            {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                        </Text>
                        {product.isAvailable === false && (
                            <View style={styles.unavailableBadge}>
                                <Text style={styles.unavailableText}>Unavailable</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(product._id)}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    placeholderImage: {
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 32,
    },
    productInfo: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        marginRight: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    metaRow: {
        marginBottom: 4,
    },
    category: {
        fontSize: 13,
        color: COLORS.gray,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stock: {
        fontSize: 13,
        color: COLORS.success,
        fontWeight: '500',
    },
    outOfStock: {
        color: COLORS.error,
    },
    unavailableBadge: {
        backgroundColor: COLORS.error,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    unavailableText: {
        fontSize: 11,
        color: COLORS.white,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: COLORS.primary,
    },
    editButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: COLORS.error,
    },
    deleteButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14,
    },
});
