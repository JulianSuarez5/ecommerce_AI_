import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.me()
      .then((userData) => {
        setUser({
          id: userData.userId || userData.id,
          nombre: userData.nombre,
          apellido: userData.apellido || '',
          email: userData.email,
          roles: userData.roles || [],
        });
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    const userData = {
      id: data.userId || data.id,
      nombre: data.nombre,
      apellido: data.apellido || '',
      email: data.email,
      roles: data.roles || [],
    };
    setUser(userData);
    window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));
    return userData;
  }, []);

  const registro = useCallback(async (datos) => {
    const data = await authService.registro(datos);
    const userData = {
      id: data.userId || data.id,
      nombre: data.nombre,
      apellido: data.apellido || '',
      email: data.email,
      roles: data.roles || [],
    };
    setUser(userData);
    window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Clean up local state even if server request fails
    }
    setUser(null);
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isClient = user?.roles?.includes('ROLE_CLIENT');

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isAdmin, isClient, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
