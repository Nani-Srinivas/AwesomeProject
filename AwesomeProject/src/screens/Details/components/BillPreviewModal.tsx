import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../../constants/colors';

interface BillPreviewModalProps {
    isVisible: boolean;
    onClose: () => void;
    pdfUrl: string | null;
}

export const BillPreviewModal = ({ isVisible, onClose, pdfUrl }: BillPreviewModalProps) => {
    if (!pdfUrl) return null;

    // Google Docs Viewer is often used to display PDFs in WebView on Android/iOS if the URL is a direct PDF link
    // But if the URL is already a viewer (like from some services), we use it directly.
    // Assuming the URL is a direct PDF link, we might need Google Viewer.
    // However, let's try direct first or use the Google Viewer hack if it's a PDF.
    const isPdf = pdfUrl.toLowerCase().endsWith('.pdf');
    const uri = isPdf
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
        : pdfUrl;

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Bill Preview</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <WebView
                    source={{ uri }}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    )}
                    style={styles.webview}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error: ', nativeEvent);
                        Alert.alert('Error', 'Failed to load bill preview.');
                    }}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        // Safe area spacing for iOS
        paddingTop: 50,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1C',
    },
    closeButton: {
        padding: 8,
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
});
