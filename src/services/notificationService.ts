import { db } from '@/lib/mockData';
import { NotificationData, NotificationType, NotificationResponse } from '@/types/notifications';

// Get notifications for a specific user
export const getNotifications = async (userId: number): Promise<NotificationResponse> => {
  const userNotifications = db.notifications.filter(n => n.userId === userId);
  return {
    notifications: userNotifications,
    unreadCount: userNotifications.filter(n => !n.isRead).length,
    totalCount: userNotifications.length
  };
};

// Mark notification as read
export const markAsRead = async (notificationId: number): Promise<void> => {
  const index = db.notifications.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    db.notifications[index].isRead = true;
    db.notifications[index].readAt = new Date();
  }
};

// Create a new notification
export const createNotification = async (notificationData: {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityType?: NotificationData['relatedEntityType'];
  relatedEntityId?: number;
}): Promise<NotificationData> => {
  const newNotification: NotificationData = {
    ...notificationData,
    id: Math.max(0, ...db.notifications.map(n => n.id)) + 1,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.notifications.push(newNotification);
  return newNotification;
};

// Notification helper functions for different scenarios
export const notifyProjectCreated = async (userIds: number[], projectName: string, projectId: number): Promise<void> => {
  const notifications = userIds.map(userId => ({
    userId,
    title: 'New Project Assigned',
    message: `A new project "${projectName}" has been assigned to your team.`,
    type: NotificationType.PROJECT_CREATED,
    relatedEntityType: 'project' as const,
    relatedEntityId: projectId,
  }));

  await Promise.all(notifications.map(notification => createNotification(notification)));
};

export const notifyTaskAssigned = async (userId: number, taskName: string, projectName: string, taskId: number): Promise<void> => {
  await createNotification({
    userId,
    title: 'New Task Assigned',
    message: `You have been assigned a new task "${taskName}" in project "${projectName}".`,
    type: NotificationType.TASK_ASSIGNED,
    relatedEntityType: 'task',
    relatedEntityId: taskId,
  });
};

// Notify all team members when a task is assigned
export const notifyTaskAssignedToTeam = async (teamMemberIds: number[], assignedUserId: number, taskName: string, projectName: string, taskId: number): Promise<void> => {
  const notifications = teamMemberIds.map(userId => {
    const isAssignedUser = userId === assignedUserId;
    return {
      userId,
      title: isAssignedUser ? 'New Task Assigned' : 'New Team Task Created',
      message: isAssignedUser
        ? `You have been assigned a new task "${taskName}" in project "${projectName}".`
        : `A new task "${taskName}" has been assigned to your team in project "${projectName}".`,
      type: NotificationType.TASK_ASSIGNED,
      relatedEntityType: 'task' as const,
      relatedEntityId: taskId,
    };
  });

  await Promise.all(notifications.map(notification => createNotification(notification)));
};

export const notifyTaskCompleted = async (userIds: number[], taskName: string, projectName: string, taskId: number): Promise<void> => {
  const notifications = userIds.map(userId => ({
    userId,
    title: 'Task Completed',
    message: `Task "${taskName}" in project "${projectName}" has been completed.`,
    type: NotificationType.TASK_COMPLETED,
    relatedEntityType: 'task' as const,
    relatedEntityId: taskId,
  }));

  await Promise.all(notifications.map(notification => createNotification(notification)));
};


export const notifyProjectUpdated = async (userIds: number[], projectName: string, updateType: string, projectId: number): Promise<void> => {
  const notifications = userIds.map(userId => ({
    userId,
    title: 'Project Updated',
    message: `Project "${projectName}" has been updated: ${updateType}.`,
    type: NotificationType.PROJECT_UPDATED,
    relatedEntityType: 'project' as const,
    relatedEntityId: projectId,
  }));

  await Promise.all(notifications.map(notification => createNotification(notification)));
};

export const notifyTeamAdded = async (userId: number, teamName: string, projectName: string, projectId: number): Promise<void> => {
  await createNotification({
    userId,
    title: 'Added to Team',
    message: `You have been added to team "${teamName}" for project "${projectName}".`,
    type: NotificationType.USER_ADDED_TO_TEAM,
    relatedEntityType: 'project',
    relatedEntityId: projectId,
  });
};