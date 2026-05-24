import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

const STORAGE_KEY = 'grocery-pos-auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('grocery-pos-token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        setUser(response.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
      } catch (error) {
        localStorage.removeItem('grocery-pos-token');
        localStorage.removeItem(STORAGE_KEY);
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [token]);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('grocery-pos-token', response.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
    toast.success(`Welcome back, ${response.user.fullName}`);
    return response.user;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('grocery-pos-token');
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Logged out');
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, isAuthenticated: Boolean(token && user) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
