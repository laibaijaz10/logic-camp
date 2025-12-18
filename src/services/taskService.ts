import { Status, Task } from '@/types';
import { db } from '@/lib/mockData';


export const getTasksByProject = async (projectId: number): Promise<{ tasks: Task[] }> => {
  return { tasks: db.getTasksByProject(projectId) };
};

export const updateTaskStatus = async (taskId: number, statusTitle: string) => {
  const task = db.updateTask(taskId, { status_title: statusTitle });
  if (!task) throw new Error("Task not found");
  return task;
};

export const updateTaskTime = async (taskId: number, expectedTime?: number, spentTime?: number) => {
  const updates: Partial<Task> = {};
  if (expectedTime !== undefined) updates.expected_time = expectedTime;
  if (spentTime !== undefined) updates.spent_time = spentTime;

  const task = db.updateTask(taskId, updates);
  if (!task) throw new Error("Task not found");
  return task;
};

export const updateTask = async (taskId: number, updates: Partial<Task>) => {
  const task = db.updateTask(taskId, updates);
  if (!task) throw new Error("Task not found");
  return task;
};

export const deleteTask = async (taskId: number) => {
  db.deleteTask(taskId);
  return { success: true };
};

export const createTask = async (task: Omit<Task, "id">) => {
  const newTask = db.createTask(task);
  return newTask;
};

export type { Task, Status };
