import { db } from '@/lib/mockData';
import type { Task } from '@/types';

interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

// All task operations below now work purely against the in-memory mock database.
// No network / API calls are performed.

export const getTasksByProject = async (projectId: number): Promise<Task[]> => {
  return db.getTasksByProject(projectId) as unknown as Task[];
};


export const updateTaskStatus = async (taskId: number, statusTitle: string) => {
  const updated = db.updateTask(taskId, { status_title: statusTitle });
  if (!updated) throw new Error('Failed to update task status');
  return updated;
};

export const createTask = async (task: Omit<Task, 'id'>) => {
  const created = db.createTask(task as any);
  if (!created) throw new Error('Failed to create task');
  return created;
};
