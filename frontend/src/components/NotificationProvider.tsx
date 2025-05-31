import React, { useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { NotificationContext } from '../hooks/useNotification';
import type { Notification } from '../types';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove após o tempo especificado
    setTimeout(() => {
      hideNotification(id);
    }, newNotification.duration);
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const getAlertSeverity = (type: Notification['type']): AlertColor => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, notifications }}>
      {children}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => hideNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={() => hideNotification(notification.id)}
            severity={getAlertSeverity(notification.type)}
            variant="filled"
            sx={{ width: '100%' }}
          >
            <strong>{notification.title}</strong>
            <br />
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}; 