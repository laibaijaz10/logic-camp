'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, MessageSquare, Users, FolderPlus, Calendar } from 'lucide-react';
import { getNotifications, markAsRead } from '@/services/notificationService';

// Lightweight notification types local to this component to avoid tight coupling
type Notification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | string;
  readAt?: Date | string | null;
  relatedEntityType?: string;
  relatedEntityId?: number;
};

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

interface NotificationDropdownProps {
  userId: number;
}

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [notificationData, setNotificationData] = useState<NotificationResponse>({
    notifications: [],
    unreadCount: 0,
    totalCount: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      // Set up polling for real-time updates (every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(userId);
      setNotificationData(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      setNotificationData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'project_created':
        return <FolderPlus className="h-5 w-5 text-green-500" />;
      case 'task_assigned':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'task_completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;

      case 'project_updated':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'team_added':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'project_created':
        return 'border-l-green-500 bg-green-50';
      case 'task_assigned':
        return 'border-l-blue-500 bg-blue-50';
      case 'task_completed':
        return 'border-l-green-500 bg-green-50';

      case 'project_updated':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'team_added':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Optional: Navigate to related entity
    if (notification.relatedEntityType && notification.relatedEntityId) {
      // This could be implemented to navigate to the related project, task, etc.
      console.log(`Navigate to ${notification.relatedEntityType} ${notification.relatedEntityId}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
        aria-label={`Notifications (${notificationData.unreadCount} unread)`}
      >
        <Bell className="h-6 w-6" />
        {notificationData.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {notificationData.unreadCount > 99 ? '99+' : notificationData.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">
                  {notificationData.unreadCount} unread of {notificationData.totalCount} total
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : notificationData.notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>No notifications yet</p>
                <p className="text-sm">You'll see updates about your projects and tasks here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificationData.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? `border-l-4 ${getNotificationColor(notification.type)}` : 'hover:bg-gray-50'
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                          {notification.isRead && notification.readAt && (
                            <p className="text-xs text-gray-400">
                              Read {formatTimeAgo(notification.readAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notificationData.notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    // Mark all as read functionality
                    const unreadNotifications = notificationData.notifications.filter(n => !n.isRead);
                    Promise.all(unreadNotifications.map(n => markAsRead(n.id)))
                      .then(() => {
                        setNotificationData(prev => ({
                          ...prev,
                          notifications: prev.notifications.map(n => ({ ...n, isRead: true, readAt: new Date() })),
                          unreadCount: 0
                        }));
                      })
                      .catch(console.error);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                  disabled={notificationData.unreadCount === 0}
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}