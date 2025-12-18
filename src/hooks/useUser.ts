import { useState, useEffect } from 'react';
import { db } from '@/lib/mockData';

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'team_lead' | 'employee';
  is_active: boolean;
  is_approved: boolean;
  projects?: any[];
  assignedTasks?: any[];
  notifications?: any[];
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const mockUser = db.getCurrentUser();
        setUserData({
          ...mockUser,
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role === 'teamLead' ? 'team_lead' : mockUser.role as any,
          is_active: true,
          is_approved: true,
          projects: db.getProjects(),
          assignedTasks: db.getTasks().filter(t => t.assigned_to_id === mockUser.id),
          notifications: db.notifications.filter(n => n.userId === mockUser.id),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading, error };
}