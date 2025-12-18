import { db } from '@/lib/mockData';

interface Notification {
  id: number;
  message: string;
  read: boolean;
}

export const getNotifications = async (_userId: number): Promise<Notification[]> => {
  return db.notifications.map(n => ({
    id: n.id,
    message: n.message,
    read: n.isRead,
  }));
};

export const markAsRead = async (id: number) => {
  const index = db.notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    db.notifications[index].isRead = true;
    return { success: true };
  }
  throw new Error("Notification not found");
};
