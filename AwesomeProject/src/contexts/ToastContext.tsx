import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Toast, ToastType } from '../components/common/Toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');
    const [duration, setDuration] = useState(3000);

    const showToast = useCallback((msg: string, toastType: ToastType = 'info', dur: number = 3000) => {
        setMessage(msg);
        setType(toastType);
        setDuration(dur);
        setVisible(true);
    }, []);

    const hideToast = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <Toast
                message={message}
                type={type}
                visible={visible}
                onHide={hideToast}
                duration={duration}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
