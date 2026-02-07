import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { useUserStore } from '../../store/userStore';
import { apiService } from '../../services/apiService';

export const ProfileSettingsScreen = ({ navigation }: { navigation: any }) => {
    const { user, setUser } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [upiId, setUpiId] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setUpiId(user.upiId || '');
        }
    }, [user]);

    const validateUpiId = (upi: string): boolean => {
        if (!upi) return true; // Empty is valid (optional field)

        // UPI ID format: username@provider
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
        return upiRegex.test(upi);
    };

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Name is required');
            return;
        }

        if (upiId && !validateUpiId(upiId)) {
            Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g., yourname@paytm)');
            return;
        }

        setIsSaving(true);
        try {
            const updateData: any = {
                name: name.trim(),
            };

            // Only include fields that have changed
            if (upiId !== user?.upiId) {
                updateData.upiId = upiId.trim() || null;
            }

            const response = await apiService.patch('/user/profile', updateData);

            if (response.data.success) {
                // Update local user store
                setUser(response.data.data);

                Alert.alert(
                    'Success',
                    'Profile updated successfully!',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                throw new Error(response.data.message || 'Update failed');
            }
        } catch (error: any) {
            console.error('Profile update error:', error);
            Alert.alert(
                'Update Failed',
                error.response?.data?.message || 'Failed to update profile. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile Settings</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* User Info Card */}
                    <View style={styles.userInfoCard}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Feather name="user" size={40} color="#FFF" />
                            </View>
                        </View>
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        <Text style={styles.userRole}>
                            {user?.roles?.join(', ') || 'Store Manager'}
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>

                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Full Name <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <Feather name="user" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        {/* Email (Read Only) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputContainer, styles.readOnlyInput]}>
                                <Feather name="mail" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    editable={false}
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <Text style={styles.hint}>Email cannot be changed</Text>
                        </View>

                        {/* Phone (Read Only) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone</Text>
                            <View style={[styles.inputContainer, styles.readOnlyInput]}>
                                <Feather name="phone" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    editable={false}
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <Text style={styles.hint}>Phone cannot be changed</Text>
                        </View>

                        {/* UPI ID */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>UPI ID</Text>
                            <View style={styles.inputContainer}>
                                <Feather name="smartphone" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={upiId}
                                    onChangeText={setUpiId}
                                    placeholder="yourname@paytm"
                                    placeholderTextColor="#999"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            <Text style={styles.hint}>
                                This UPI ID will be shown to customers for payment collection
                            </Text>
                        </View>

                        {/* UPI Instructions */}
                        {upiId && validateUpiId(upiId) && (
                            <View style={styles.upiPreviewCard}>
                                <View style={styles.upiPreviewHeader}>
                                    <Feather name="check-circle" size={20} color="#4CAF50" />
                                    <Text style={styles.upiPreviewTitle}>Valid UPI ID</Text>
                                </View>
                                <Text style={styles.upiPreviewText}>
                                    Customers will see: "Pay to {upiId}"
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Feather name="save" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    content: {
        flex: 1,
    },
    userInfoCard: {
        backgroundColor: '#FFF',
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 16,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#999',
    },
    formSection: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    required: {
        color: '#F44336',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 16,
    },
    readOnlyInput: {
        backgroundColor: '#FAFAFA',
        opacity: 0.7,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        paddingVertical: 14,
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 6,
    },
    upiPreviewCard: {
        backgroundColor: '#F1F8E9',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#4CAF50',
        marginTop: 8,
    },
    upiPreviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    upiPreviewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 8,
    },
    upiPreviewText: {
        fontSize: 14,
        color: '#666',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: '#BDBDBD',
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
