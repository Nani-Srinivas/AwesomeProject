import { apiService } from '../services/apiService';

/**
 * Utility functions to check for resource dependencies
 * Used across the app to determine if users can proceed with certain actions
 */

export interface DependencyCheckResult {
    hasAreas: boolean;
    hasDeliveryBoys: boolean;
    hasCustomers: boolean;
}

/**
 * Check if any delivery areas exist
 */
export const checkAreasExist = async (): Promise<boolean> => {
    try {
        const response = await apiService.get('/areas');
        const areas = response.data?.data || response.data || [];
        return Array.isArray(areas) && areas.length > 0;
    } catch (error) {
        console.error('Error checking areas:', error);
        return false;
    }
};

/**
 * Check if any delivery boys exist
 */
export const checkDeliveryBoysExist = async (): Promise<boolean> => {
    try {
        const response = await apiService.get('/delivery');
        const deliveryBoys = response.data?.data || response.data || [];
        return Array.isArray(deliveryBoys) && deliveryBoys.length > 0;
    } catch (error) {
        console.error('Error checking delivery boys:', error);
        return false;
    }
};

/**
 * Check if any customers exist
 */
export const checkCustomersExist = async (): Promise<boolean> => {
    try {
        const response = await apiService.get('/customer');
        const customers = response.data?.data || response.data || [];
        return Array.isArray(customers) && customers.length > 0;
    } catch (error) {
        console.error('Error checking customers:', error);
        return false;
    }
};

/**
 * Check all dependencies at once
 * Useful for screens that need multiple resources
 */
export const checkAllDependencies = async (): Promise<DependencyCheckResult> => {
    const [hasAreas, hasDeliveryBoys, hasCustomers] = await Promise.all([
        checkAreasExist(),
        checkDeliveryBoysExist(),
        checkCustomersExist(),
    ]);

    return {
        hasAreas,
        hasDeliveryBoys,
        hasCustomers,
    };
};
