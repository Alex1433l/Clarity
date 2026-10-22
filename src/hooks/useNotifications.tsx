import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: number;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  browserPermission: NotificationPermission | 'unsupported';
  enabled: boolean;
  notify: (title: string, message: string) => void;
  dismiss: (id: string) => void;
  requestPermission: () => Promise<NotificationPermission | 'unsupported'>;
  setEnabled: (enabled: boolean) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function getPermission(): NotificationPermission | 'unsupported' {
  return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(getPermission);
  const [enabled, setEnabledState] = useState(() => localStorage.getItem('clarity-notifications') !== 'off');

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    localStorage.setItem('clarity-notifications', value ? 'on' : 'off');
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    const permission = await Notification.requestPermission();
    setBrowserPermission(permission);
    if (permission === 'granted') setEnabled(true);
    return permission;
  }, [setEnabled]);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const notify = useCallback((title: string, message: string) => {
    if (!enabled) return;

    const notification: AppNotification = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      message,
      createdAt: Date.now(),
    };
    setNotifications((current) => [...current, notification]);

    if (browserPermission === 'granted') {
      new Notification(title, { body: message, icon: '/favicon.png' });
    }
  }, [browserPermission, enabled]);

  useEffect(() => {
    const timers = notifications.map((notification) => window.setTimeout(() => dismiss(notification.id), 7000));
    return () => timers.forEach(window.clearTimeout);
  }, [notifications, dismiss]);

  const value = useMemo(() => ({
    notifications,
    browserPermission,
    enabled,
    notify,
    dismiss,
    requestPermission,
    setEnabled,
  }), [notifications, browserPermission, enabled, notify, dismiss, requestPermission, setEnabled]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
}
