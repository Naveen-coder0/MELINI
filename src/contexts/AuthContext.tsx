import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAdminToken, getAdminToken, setAdminToken } from '@/lib/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface AuthContextValue {
  isAuthenticated: boolean;
  adminEmail: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAdminToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          clearAdminToken();
          setIsLoading(false);
          return;
        }

        const payload = await response.json();
        setAdminEmail(payload?.admin?.email || null);
        setIsAuthenticated(true);
      } catch {
        clearAdminToken();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    adminEmail,
    isLoading,
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Login failed');
      }

      setAdminToken(payload.token);
      setAdminEmail(payload?.admin?.email || email);
      setIsAuthenticated(true);
    },
    logout: () => {
      clearAdminToken();
      setAdminEmail(null);
      setIsAuthenticated(false);
    },
  }), [adminEmail, isAuthenticated, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
