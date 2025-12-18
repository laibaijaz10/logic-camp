// Notification types for the application

export enum NotificationType {
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
    USER_ADDED_TO_TEAM = 'user_added_to_team',
  PROJECT_STATUS_CHANGED = 'project_status_changed',
  TASK_STATUS_CHANGED = 'task_status_changed',
  DEADLINE_REMINDER = 'deadline_reminder',
  SYSTEM_ANNOUNCEMENT = 'system_announcement'
}

export interface NotificationData {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityType?: 'project' | 'task' | 'team' | 'user';
  relatedEntityId?: number;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

export interface CreateNotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: 'project' | 'task' | 'team' | 'user';
  relatedEntityId?: number;
}

export interface NotificationResponse {
  notifications: NotificationData[];
  unreadCount: number;
  totalCount: number;
}