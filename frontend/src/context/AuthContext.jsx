import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('ecoatlas_user');
      const token = localStorage.getItem('ecoatlas_token');
      
      if (storedUser && token) {
        try {
          // Verify existing token with backend
          const meResp = await api.get('/auth/me');
          setUser(meResp.data);
          setLoading(false);
          return;
        } catch (e) {
          // Token expired or invalid for this backend instance; clean up and re-authenticate
          localStorage.removeItem('ecoatlas_user');
          localStorage.removeItem('ecoatlas_token');
        }
      }

      // Automatically sign in with default admin credentials so users can immediately create projects & explore
      try {
        const response = await api.post('/auth/login', {
          email: 'admin@ecoatlas.earth',
          password: 'Admin123!',
        });
        const { access_token, user: userData } = response.data;
        localStorage.setItem('ecoatlas_token', access_token);
        localStorage.setItem('ecoatlas_user', JSON.stringify(userData));
        setUser(userData);
      } catch (err) {
        console.warn('Auto demo login skipped:', err?.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('ecoatlas_token', access_token);
    localStorage.setItem('ecoatlas_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (email, password, full_name) => {
    const response = await api.post('/auth/register', { email, password, full_name });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('ecoatlas_token', access_token);
    localStorage.setItem('ecoatlas_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('ecoatlas_token');
    localStorage.removeItem('ecoatlas_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
