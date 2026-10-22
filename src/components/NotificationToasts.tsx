import { Bell, Check, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationToasts() {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed right-4 top-16 z-50 flex w-[min(360px,calc(100vw-32px))] flex-col gap-2" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-lg shadow-sand-900/10 dark:border-brand-900/50 dark:bg-sand-900">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <Bell className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sand-800 dark:text-sand-100">{notification.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-sand-500 dark:text-sand-400">{notification.message}</p>
          </div>
          <button onClick={() => dismiss(notification.id)} className="rounded-lg p-1 text-sand-400 hover:bg-sand-100 hover:text-sand-700 dark:hover:bg-sand-800 dark:hover:text-sand-200" aria-label="Dispensar notificação">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
