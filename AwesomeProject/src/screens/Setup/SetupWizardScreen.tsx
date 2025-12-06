import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { apiService } from '../../services/apiService';
import { useUserStore } from '../../store/userStore';
import { COLORS } from '../../constants/colors';
import { SetupWizardProps } from '../../navigation/types';

type WizardStep = 1 | 2 | 3;

export const SetupWizardScreen = ({ navigation }: SetupWizardProps) => {
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [loading, setLoading] = useState(false);
    const setSetupComplete = useUserStore(state => state.setSetupComplete);

    // Step 1: Area data
    const [areaName, setAreaName] = useState('');
    const [totalSubscribedItems, setTotalSubscribedItems] = useState('');
    const [createdAreaId, setCreatedAreaId] = useState<string | null>(null);

    // Step 2: Delivery Boy data
    const [deliveryBoyName, setDeliveryBoyName] = useState('');
    const [deliveryBoyContact, setDeliveryBoyContact] = useState('');

    const handleSkip = () => {
        setSetupComplete(true);
        navigation.replace('Main');
    };

    const handleCreateArea = async () => {
        if (!areaName || !totalSubscribedItems) {
            Alert.alert('Error', 'Please enter both area name and total subscribed items.');
            return;
        }

        const items = Number(totalSubscribedItems);
        if (isNaN(items)) {
            Alert.alert('Error', 'Total subscribed items must be a number.');
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.post('/delivery/area/create', {
                name: areaName,
                totalSubscribedItems: items,
            });
            console.log('Area created:', response.data);
            setCreatedAreaId(response.data.data._id);
            Alert.alert('Success', 'Area created successfully!');
            setCurrentStep(2);
        } catch (error: any) {
            console.error('Failed to create area:', error);
            console.error('Error response:', error.response?.data);

            // Extract the actual error message from the API
            let errorMessage = 'Failed to create area. Please try again.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;

                // Special handling for duplicate area error
                if (error.response.status === 409) {
                    Alert.alert(
                        'Area Already Exists',
                        `${errorMessage}\n\nPlease use a different area name or check if the area was already created.`,
                        [
                            {
                                text: 'Try Different Name',
                                onPress: () => {
                                    // Clear the area name to let user enter new one
                                    setAreaName('');
                                }
                            },
                            {
                                text: 'Use Existing Area',
                                onPress: async () => {
                                    // Fetch the existing area and proceed
                                    try {
                                        const areasResponse = await apiService.get('/delivery/area');
                                        const areas = areasResponse.data?.data || areasResponse.data || [];
                                        // Find the area with matching name
                                        const existingArea = areas.find((a: any) => a.name === areaName);
                                        if (existingArea) {
                                            setCreatedAreaId(existingArea._id);
                                            Alert.alert('Success', 'Using existing area. Proceeding to next step...');
                                            setCurrentStep(2);
                                        } else {
                                            Alert.alert('Error', 'Could not find the existing area. Please try again.');
                                        }
                                    } catch (fetchError) {
                                        console.error('Failed to fetch areas:', fetchError);
                                        Alert.alert('Error', 'Could not fetch existing areas. Please try again.');
                                    }
                                }
                            }
                        ]
                    );
                    return;
                }
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDeliveryBoy = async () => {
        console.log('=== Creating Delivery Boy ===');
        console.log('Name:', deliveryBoyName);
        console.log('Contact:', deliveryBoyContact);
        console.log('Area ID:', createdAreaId);
        console.log('Area Name:', areaName);

        if (!deliveryBoyName || !deliveryBoyContact) {
            Alert.alert('Error', 'Please enter both name and contact.');
            return;
        }

        if (!createdAreaId) {
            Alert.alert('Error', 'No area found. Please go back and create an area first.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: deliveryBoyName,
                phone: deliveryBoyContact,
                areaId: createdAreaId,
            };
            console.log('API Payload:', JSON.stringify(payload, null, 2));

            const response = await apiService.post('/delivery/delivery-boy/create', payload);
            console.log('API Response:', JSON.stringify(response.data, null, 2));

            Alert.alert('Success', 'Delivery partner added successfully!');
            setCurrentStep(3);
        } catch (error: any) {
            console.error('=== Delivery Boy Creation Failed ===');
            console.error('Error object:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error message:', error.message);

            const errorMessage = error.response?.data?.message || error.message || 'Failed to add delivery partner. Please try again.';
            Alert.alert('Error Details', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        console.log('🎉 Setup Wizard - handleFinish called');
        console.log('Setting setup complete to TRUE');
        setSetupComplete(true);
        console.log('Navigating to Main screen');
        navigation.replace('Main');
    };

    const renderProgressIndicator = () => (
        <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${(currentStep / 3) * 100}%` },
                    ]}
                />
            </View>
            <Text style={styles.progressText}>Step {currentStep} of 3</Text>
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🗺️</Text>
            </View>
            <Text style={styles.stepTitle}>Create Your First Delivery Area</Text>
            <Text style={styles.stepDescription}>
                Areas help you organize deliveries by location. You'll need at least one area to manage delivery partners and customers.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Area Name (e.g., Central City)"
                value={areaName}
                onChangeText={setAreaName}
                placeholderTextColor="#999"
            />
            <TextInput
                style={styles.input}
                placeholder="Total Subscribed Items"
                value={totalSubscribedItems}
                onChangeText={setTotalSubscribedItems}
                keyboardType="numeric"
                placeholderTextColor="#999"
            />
            <Button
                title="Create Area & Continue"
                onPress={handleCreateArea}
                loading={loading}
                style={styles.button}
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🚴</Text>
            </View>
            <Text style={styles.stepTitle}>Add Your First Delivery Partner</Text>
            <Text style={styles.stepDescription}>
                Delivery partners handle order deliveries in specific areas. Let's add one to "{areaName}".
            </Text>

            {/* Display selected area */}
            <View style={styles.selectedAreaCard}>
                <Text style={styles.selectedAreaLabel}>Assigned Area:</Text>
                <Text style={styles.selectedAreaValue}>{areaName}</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Delivery Partner Name"
                value={deliveryBoyName}
                onChangeText={setDeliveryBoyName}
                placeholderTextColor="#999"
            />
            <TextInput
                style={styles.input}
                placeholder="Contact (e.g., +91 9876543210)"
                value={deliveryBoyContact}
                onChangeText={setDeliveryBoyContact}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
            />
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setCurrentStep(1)}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Button
                    title="Add Partner & Continue"
                    onPress={handleCreateDeliveryBoy}
                    loading={loading}
                    style={styles.flexButton}
                />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>✅</Text>
            </View>
            <Text style={styles.stepTitle}>Setup Complete!</Text>
            <Text style={styles.stepDescription}>
                Great! You've created your first delivery area and added a delivery partner. You're all set to start managing your grocery delivery business.
            </Text>
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Area:</Text>
                    <Text style={styles.summaryValue}>{areaName}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Partner:</Text>
                    <Text style={styles.summaryValue}>{deliveryBoyName}</Text>
                </View>
            </View>
            <Text style={styles.nextStepsTitle}>Next Steps:</Text>
            <View style={styles.nextStepsList}>
                <Text style={styles.nextStepItem}>• Add products to your catalog</Text>
                <Text style={styles.nextStepItem}>• Add customers to start taking orders</Text>
                <Text style={styles.nextStepItem}>• Record stock receipts as inventory arrives</Text>
            </View>
            <Button
                title="Go to Home Screen"
                onPress={handleFinish}
                style={styles.button}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Welcome! Let's Get Started</Text>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipButton}>Skip for now</Text>
                </TouchableOpacity>
            </View>
            {renderProgressIndicator()}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    skipButton: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
    },
    iconContainer: {
        marginBottom: 16,
    },
    icon: {
        fontSize: 64,
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 12,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: COLORS.primary,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        color: COLORS.text,
        backgroundColor: COLORS.background,
        fontSize: 14,
    },
    button: {
        width: '100%',
        marginTop: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
    backButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
    },
    flexButton: {
        flex: 1,
    },
    selectedAreaCard: {
        width: '100%',
        backgroundColor: '#E6F0FA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    selectedAreaLabel: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 4,
    },
    selectedAreaValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    summaryCard: {
        width: '100%',
        backgroundColor: '#F5F9FC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
    },
    nextStepsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 12,
        width: '100%',
    },
    nextStepsList: {
        width: '100%',
        marginBottom: 24,
    },
    nextStepItem: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 24,
    },
});
