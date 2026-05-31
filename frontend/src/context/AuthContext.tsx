import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { AuthUser } from '../types/auth';
import {
  clearAuthToken,
  getCurrentUser,
  getStoredAuthToken,
  logoutUser,
} from '../services/authService';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getStoredAuthToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await getCurrentUser();
      setUser(response.data?.user ?? null);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // logoutUser already clears the token on failure
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
