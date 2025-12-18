import { StatusItem } from '@/types';

// Default statuses for all entity types (same for projects/tasks)
export const getDefaultStatuses = (entityType: 'project' | 'task'): StatusItem[] => {
  const baseStatuses = [
    { id: 1, title: 'todo', description: 'Item is pending', color: '#6B7280', isDeletable: true },
    { id: 2, title: 'inProgress', description: 'Item is in progress', color: '#3B82F6', isDeletable: true },
    { id: 3, title: 'testing', description: 'Item is being tested', color: '#F59E0B', isDeletable: false },
    { id: 4, title: 'review', description: 'Item is under review', color: '#8B5CF6', isDeletable: true },
    { id: 5, title: 'done', description: 'Item is completed', color: '#10B981', isDeletable: false }
  ];
  
  return baseStatuses;
};

// Helper function to get status by title from a statuses array
export const getStatusByTitle = (statuses: StatusItem[] | null | undefined, title: string): StatusItem | null => {
  if (!statuses) return null;
  return statuses.find(status => status.title === title) || null;
};

// Helper function to get status color by title
export const getStatusColor = (statuses: StatusItem[] | null | undefined, title: string): string => {
  const status = getStatusByTitle(statuses, title);
  return status?.color || '#6B7280';
};

// Helper function to get status description by title
export const getStatusDescription = (statuses: StatusItem[] | null | undefined, title: string): string => {
  const status = getStatusByTitle(statuses, title);
  return status?.description || '';
};

// Helper function to add a new status to an existing statuses array
export const addStatusToArray = (statuses: StatusItem[] | null | undefined, newStatus: Omit<StatusItem, 'id'>): StatusItem[] => {
  const currentStatuses = statuses || [];
  const maxId = currentStatuses.length > 0 ? Math.max(...currentStatuses.map(s => s.id)) : 0;
  const statusWithId: StatusItem = {
    ...newStatus,
    id: maxId + 1
  };
  return [...currentStatuses, statusWithId];
};

// Helper function to update a status in the array
export const updateStatusInArray = (statuses: StatusItem[] | null | undefined, id: number, updates: Partial<Omit<StatusItem, 'id'>>): StatusItem[] => {
  const currentStatuses = statuses || [];
  return currentStatuses.map(status => 
    status.id === id ? { ...status, ...updates } : status
  );
};

// Helper function to remove a status from the array
export const removeStatusFromArray = (statuses: StatusItem[] | null | undefined, id: number): StatusItem[] => {
  const currentStatuses = statuses || [];
  return currentStatuses.filter(status => status.id !== id);
};

export type { StatusItem };

