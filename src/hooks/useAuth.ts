import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/mockData';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    // Already authenticated in mock mode
    return;
  }, []);

  useEffect(() => {
    // In future, we could check an existing session or token here.
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState({
      isAuthenticated: true,
      user: {
        userId: 1,
        email: email,
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + 86400000,
      },
      loading: false,
      error: null,
    });
    return { token: 'mock-token', user: db.users[0] };
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    return login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
  }, []);

  return { ...authState, login, adminLogin, logout, checkAuth };
}