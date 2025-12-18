import { db } from "@/lib/mockData";

export const login = async (email: string, password: string) => {
  return { ...db.users[0], token: 'mock-token' };
};

export const register = async (name: string, email: string, password: string) => {
  const newUser = { id: Date.now(), name, email, role: 'employee' as const, isActive: true };
  db.users.push(newUser);
  return { ...newUser, token: 'mock-token' };
};
