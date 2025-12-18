import { db } from '@/lib/mockData';

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee" | "teamLead" | "user";
  createdAt: string;
}

export async function updateUser(userId: number, userData: Partial<User>): Promise<User> {
  const user = db.users.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  Object.assign(user, userData);
  return user as any;
}

export async function getUserById(userId: number): Promise<User> {
  const user = db.users.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  return user as any;
}

export async function getAllUsers(): Promise<User[]> {
  return db.users as any;
}