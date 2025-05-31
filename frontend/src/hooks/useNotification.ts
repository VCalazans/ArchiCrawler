import { createContext, useContext } from 'react';
import type { Notification } from '../types';

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  notifications: Notification[];
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook temporário simplificado para evitar erros
export const useNotification = () => {
  // Retorna um mock simples se não houver contexto
  const context = useContext(NotificationContext);
  
  if (!context) {
    // Fallback temporário para evitar erro
    return {
      showNotification: (notification: Omit<Notification, 'id'>) => {
        console.log('Notification:', notification.title, '-', notification.message);
      },
      hideNotification: (id: string) => {
        console.log('Hide notification:', id);
      },
      notifications: [] as Notification[],
    };
  }
  
  return context;
}; 