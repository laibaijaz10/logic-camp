import { db } from '@/lib/mockData';
import { User } from '@/types';

export const updateUser = async (id: number, data: Partial<User>) => {
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');
  db.users[index] = { ...db.users[index], ...data } as any;
  return db.users[index];
};