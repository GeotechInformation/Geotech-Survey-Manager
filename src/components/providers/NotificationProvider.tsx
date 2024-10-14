import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Notification from '@/components/modals/Notification';

interface Notification {
  id: string;
  message: string;
  type: 'error' | 'success' | 'neutral';
  duration?: number;
}

interface NotificationContextType {
  addNotification: (message: string, type: 'error' | 'success' | 'neutral', duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};



export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: 'error' | 'success' | 'neutral', duration?: number) => {
    const id = Math.random().toString(36).slice(2, 11);
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};
