import React from 'react';

// Lightweight notification shape to avoid depending on a Notification model
interface NotificationProps {
  id?: number;
  title?: string;
  message?: string;
  type?: string;
  createdAt?: string | Date;
}

export default function Notification({ notification }: { notification: NotificationProps }) {
  const createdAtDate = notification.createdAt
    ? new Date(notification.createdAt)
    : null;
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <p className="text-gray-800">{notification.message}</p>
      {createdAtDate && (
        <span className="text-sm text-gray-500">{createdAtDate.toLocaleString()}</span>
      )}
    </div>
  );
}