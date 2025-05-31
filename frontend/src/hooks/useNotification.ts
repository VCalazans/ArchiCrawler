import { createContext, useContext } from 'react';
import type { Notification } from '../types';

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  notifications: Notification[];
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook simplificado que funciona sem Provider
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  // Se não há contexto, retorna implementação mock
  if (!context) {
    return {
      showNotification: (notification: Omit<Notification, 'id'>) => {
        console.log(`[${notification.type?.toUpperCase()}] ${notification.title}:`, notification.message);
      },
      hideNotification: (id: string) => {
        console.log('Hide notification:', id);
      },
      notifications: [],
    };
  }
  
  return context;
}; 