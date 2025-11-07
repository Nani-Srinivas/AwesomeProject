// components/communication/CustomerCommunicationPanel.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import { NotificationService } from '../../services/notifications/NotificationService';

interface CustomerCommunicationPanelProps {
  customerId: string;
  customerName: string;
  customerPhone: string;
  isVisible: boolean;
  onClose: () => void;
}

export const CustomerCommunicationPanel = ({
  customerId,
  customerName,
  customerPhone,
  isVisible,
  onClose
}: CustomerCommunicationPanelProps) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'notification' | 'sms'>('notification');

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      let result;
      
      if (messageType === 'sms') {
        // In a real app, this would call a backend service that uses Twilio or similar
        result = await NotificationService.sendSMSNotification(customerPhone, message);
      } else {
        // Send app notification
        result = await NotificationService.sendNotification(
          customerId,
          'Message from Store',
          message,
          'general'
        );
      }

      if (result.success) {
        Alert.alert('Success', 'Message sent successfully!');
        setMessage('');
        onClose();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleRequestExtraItems = () => {
    // This would typically be a more complex flow
    Alert.alert(
      'Request Extra Items',
      'This feature allows customers to request extra items for specific days. In a full implementation, this would send a specific request to the system.',
      [
        {
          text: 'OK',
          onPress: () => {
            // In a real app, this would integrate with the order system
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Communicate with {customerName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.messageTypeSelector}>
            <TouchableOpacity
              style={[
                styles.messageTypeButton,
                messageType === 'notification' && styles.activeMessageTypeButton
              ]}
              onPress={() => setMessageType('notification')}
            >
              <Text style={[
                styles.messageTypeText,
                messageType === 'notification' && styles.activeMessageTypeText
              ]}>
                App Notification
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.messageTypeButton,
                messageType === 'sms' && styles.activeMessageTypeButton
              ]}
              onPress={() => setMessageType('sms')}
            >
              <Text style={[
                styles.messageTypeText,
                messageType === 'sms' && styles.activeMessageTypeText
              ]}>
                SMS
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.messageInput}
            placeholder={`Enter message for ${customerName}...`}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.sendMessageButton]}
              onPress={handleSendMessage}
            >
              <Feather name="send" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.requestItemsButton]}
              onPress={handleRequestExtraItems}
            >
              <Feather name="shopping-cart" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Request Extra Items</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  messageTypeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  messageTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeMessageTypeButton: {
    backgroundColor: COLORS.primary,
  },
  messageTypeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  activeMessageTypeText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  sendMessageButton: {
    backgroundColor: COLORS.primary,
  },
  requestItemsButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});