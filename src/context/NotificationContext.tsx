// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import '../styles/Notification.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  removing?: boolean;
}

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, title?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  setPendingMessage: (message: { type: MessageType; content: string }) => void;
  pendingMessage: { type: MessageType; content: string } | null;
  clearPendingMessage: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingMessage, setPendingMessage] = useState<{ type: MessageType; content: string } | null>(null);

  // Helper function to create a new notification
  const showNotification = (
    type: NotificationType,
    message: string,
    title?: string,
    duration = 3000
  ) => {
    const id = Date.now().toString();
    const newNotification = { id, type, message, title, duration };
    
    // Add new notification to the BEGINNING of the array
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    
    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  // Remove a notification by ID
  const removeNotification = (id: string) => {
    // First mark the notification as removing for animation
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id
          ? { ...notification, removing: true }
          : notification
      )
    );
    
    // Then actually remove it after animation completes
    setTimeout(() => {
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== id)
      );
    }, 300); // Match the animation duration
  };

  const clearPendingMessage = () => {
    setPendingMessage(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
        setPendingMessage,
        pendingMessage,
        clearPendingMessage
      }}
    >
      {children}
      
      {/* Notification Container */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification ${notification.type} ${notification.removing ? 'removing' : ''}`}
          >
            <div className="notification-content">
              {notification.title && (
                <div className="notification-title">{notification.title}</div>
              )}
              <div className="notification-message">{notification.message}</div>
            </div>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Helper functions for common notification types
export const notificationService = {
  success: (message: string, title?: string, duration?: number) => {
    const context = useContext(NotificationContext);
    if (context) {
      context.showNotification('success', message, title, duration);
    }
  },
  error: (message: string, title?: string, duration?: number) => {
    const context = useContext(NotificationContext);
    if (context) {
      context.showNotification('error', message, title, duration);
    }
  },
  warning: (message: string, title?: string, duration?: number) => {
    const context = useContext(NotificationContext);
    if (context) {
      context.showNotification('warning', message, title, duration);
    }
  },
  info: (message: string, title?: string, duration?: number) => {
    const context = useContext(NotificationContext);
    if (context) {
      context.showNotification('info', message, title, duration);
    }
  }
};