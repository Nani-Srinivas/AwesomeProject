import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';

interface BillActionsModalProps {
    isVisible: boolean;
    onClose: () => void;
    billDate: string;
    billAmount: number;
    onView: () => void;
    onShare: () => void;
    onDownload: () => void;
    onRegenerate: () => void;
    onDelete: () => void;
}

export const BillActionsModal = ({
    isVisible,
    onClose,
    billDate,
    billAmount,
    onView,
    onShare,
    onDownload,
    onRegenerate,
    onDelete,
}: BillActionsModalProps) => {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.title}>Bill Options</Text>
                                    <Text style={styles.subtitle}>
                                        {billDate} • ₹{billAmount}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Feather name="x" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {/* Actions */}
                            <View style={styles.actionsContainer}>
                                <ActionItem
                                    icon="eye"
                                    label="View Bill"
                                    onPress={onView}
                                    color={COLORS.primary}
                                />
                                <ActionItem
                                    icon="share-2"
                                    label="Share Bill"
                                    onPress={onShare}
                                    color={COLORS.primary}
                                />
                                <ActionItem
                                    icon="download"
                                    label="Download PDF"
                                    onPress={onDownload}
                                    color={COLORS.primary}
                                />
                                <View style={styles.divider} />
                                <ActionItem
                                    icon="refresh-cw"
                                    label="Regenerate Bill"
                                    onPress={onRegenerate}
                                    color={COLORS.primary}
                                />
                                <ActionItem
                                    icon="trash-2"
                                    label="Delete Bill"
                                    onPress={onDelete}
                                    color={COLORS.error}
                                    isDestructive
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const ActionItem = ({ icon, label, onPress, color, isDestructive }: any) => (
    <TouchableOpacity
        style={[styles.actionItem, isDestructive && styles.destructiveItem]}
        onPress={onPress}
    >
        <View style={[styles.iconBox, isDestructive ? styles.destructiveIconBox : styles.primaryIconBox]}>
            <Feather name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.actionLabel, { color: isDestructive ? COLORS.error : '#333' }]}>
            {label}
        </Text>
        <Feather name="chevron-right" size={16} color="#CCC" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
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
    actionsContainer: {
        gap: 12,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    destructiveItem: {
        backgroundColor: '#FFEBEE',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    primaryIconBox: {
        backgroundColor: '#E3F2FD',
    },
    destructiveIconBox: {
        backgroundColor: '#FFCDD2',
    },
    actionLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 4,
    },
});
