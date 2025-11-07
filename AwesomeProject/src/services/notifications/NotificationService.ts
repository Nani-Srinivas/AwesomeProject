// services/notifications/NotificationService.ts
import { Alert, Linking, Platform } from 'react-native';
import { apiService } from '../apiService';

export interface NotificationData {
  id?: string;
  customerId?: string;
  title: string;
  message: string;
  type: 'invoice' | 'reminder' | 'general';
  createdAt?: string;
  read?: boolean;
}

export class NotificationService {
  // Request notification permissions (for push notifications in the future)
  static async requestPermissions() {
    // For now, just return true as we're implementing local notifications
    // In a real app, you would integrate with react-native-push-notification or similar
    return true;
  }

  // Send notification to customer (would typically be push notification in production)
  static async sendNotification(customerId: string, title: string, message: string, type: 'invoice' | 'reminder' | 'general' = 'general') {
    try {
      // In a real implementation, this would call an API to send push notification
      // For now, we'll just store it locally as an alternative
      const notification: NotificationData = {
        customerId,
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
        read: false
      };

      // In a real app, we would send this to the backend which would handle push notifications
      console.log(`Notification sent to customer ${customerId}:`, notification);

      return { success: true, message: 'Notification sent successfully (simulated)' };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, message: 'Failed to send notification' };
    }
  }

  // Send invoice notification to customer
  static async sendInvoiceNotification(customerId: string, invoiceId: string, period: string) {
    const title = 'New Invoice Available';
    const message = `Your invoice for ${period} is now available. Please check your account.`;

    return await this.sendNotification(customerId, title, message, 'invoice');
  }

  // Send reminder notification to customer
  static async sendReminderNotification(customerId: string, message: string) {
    return await this.sendNotification(customerId, 'Reminder', message, 'reminder');
  }

  // For SMS/Email notifications, we would integrate with a service like Twilio
  static async sendSMSNotification(phoneNumber: string, message: string) {
    // This would require server-side implementation for security
    console.log(`SMS sent to ${phoneNumber}: ${message}`);
    return { success: true, message: 'SMS sent successfully (simulated)' };
  }

  // Handle deep linking to navigate to specific screens from notifications
  static handleNotificationNavigation(notification: any) {
    // This would handle navigation when user taps on notification
    console.log('Handling notification navigation:', notification);
    
    // Example implementation would navigate to invoice screen based on notification data
    // navigation.navigate('InvoiceHistory', { customerId: notification.customerId });
  }

  // Check if app can send notifications
  static canSendNotifications() {
    // In a real implementation, check if push notification service is available
    return true;
  }
}