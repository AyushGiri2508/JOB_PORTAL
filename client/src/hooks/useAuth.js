import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/AuthContext';
import { loginUser, registerUser, googleLogin, getMe } from '../api';

/**
 * Custom hook for authentication actions.
 * Connects the API layer to the Auth store.
 */
export const useAuth = () => {
  const store = useAuthStore();
  const { setUser, setLoading, setError, clearUser } = store;

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await getMe();
          setUser(data.user);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const { data } = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const { data } = await registerUser(userData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    try {
      setError(null);
      const { data } = await googleLogin({ credential });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    clearUser();
  }, []);

  return {
    ...store,
    login,
    register,
    loginWithGoogle,
    logout,
  };
};
