import React from 'react';
import Notification from '@/components/Notification';

// Lightweight notification shape aligned with Notification component props
type NotificationItem = {
  id?: number;
  title?: string;
  message?: string;
  type?: string;
  createdAt?: string | Date;
};

type NotificationsSectionProps = {
  notifications: NotificationItem[];
};

export default function NotificationsSection({ notifications }: NotificationsSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Notifications</h2>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Notification key={notif.id} notification={notif} />
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No notifications.</p>
        )}
      </div>
    </section>
  );
}