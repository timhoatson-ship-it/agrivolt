import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, setAuthToken, getAuthToken, type AuthResponse } from './api';

interface AuthState {
  isAuthenticated: boolean;
  developer: AuthResponse['developer'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: Parameters<typeof api.auth.register>[0]) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  developer: null,
  loading: true,
  login: async () => 'Not initialized',
  register: async () => 'Not initialized',
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [developer, setDeveloper] = useState<AuthResponse['developer'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { setLoading(false); return; }
    api.auth.me().then(res => {
      if (res.success && res.data) {
        setDeveloper(res.data);
      } else {
        setAuthToken(null);
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await api.auth.login(email, password);
    if (!res.success || !res.data) return res.error || 'Login failed';
    setAuthToken(res.data.token);
    setDeveloper(res.data.developer);
    return null;
  }, []);

  const register = useCallback(async (data: Parameters<typeof api.auth.register>[0]): Promise<string | null> => {
    const res = await api.auth.register(data);
    if (!res.success || !res.data) return res.error || 'Registration failed';
    setAuthToken(res.data.token);
    setDeveloper(res.data.developer);
    return null;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setDeveloper(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!developer, developer, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
