// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'LEADER';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  area?: string | null;
  leaderId?: string | null;
  isLeader?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  isAdminOrLeader: () => boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  hasRole: () => false,
  isAdminOrLeader: () => false,
  setUser: () => {},
  logout: () => {},
  refreshUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback((): User | null => {
    try {
      const userStr = localStorage.getItem('portal_user');
      
      if (!userStr) {
        return null;
      }
      
      const data = JSON.parse(userStr);
      
      const roleRaw = data.role || 'EMPLOYEE';
      const role = roleRaw.toUpperCase() as UserRole;
      
      const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'LEADER'];
      if (!validRoles.includes(role)) {
        return null;
      }
      
      const userData: User = {
        id: data.id || '',
        name: data.name || 'Usuario',
        email: data.email || '',
        role: role,
        avatar: data.avatar || '',
        area: data.area || null,
        leaderId: data.leaderId || null,
        isLeader: Boolean(data.isLeader),
      };
      
      return userData;
      
    } catch (error) {
      console.error('Error al leer portal_user:', error);
      return null;
    }
  }, []);

  const refreshUser = useCallback(() => {
    const userData = loadUser();
    setUser(userData);
  }, [loadUser]);

  const getUserFromToken = useCallback((): User | null => {
    try {
      const token = localStorage.getItem('portal_access_token');
      if (!token) {
        return null;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      const roleRaw = payload.role || payload.rol || 'EMPLOYEE';
      const role = roleRaw.toUpperCase() as UserRole;
      
      const userData: User = {
        id: payload.userId || payload.sub || payload.id || '',
        name: payload.name || payload.nombre || 'Usuario',
        email: payload.email || payload.correo || '',
        role: role,
        avatar: payload.avatar || '',
        area: payload.area || null,
        leaderId: payload.leaderId || null,
        isLeader: Boolean(payload.isLeader),
      };
      
      localStorage.setItem('portal_user', JSON.stringify(userData));
      
      return userData;
      
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    try {
      let userData = loadUser();
      
      if (!userData) {
        userData = getUserFromToken();
      }
      
      setUser(userData);
      
    } catch (error) {
      console.error('Error en autenticacion:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadUser, getUserFromToken]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'portal_user' || event.key === 'portal_access_token') {
        const userData = loadUser();
        setUser(userData);
      }
      
      if (event.key === 'portal_user' && event.newValue === null) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      
      if (key === 'portal_user' || key === 'portal_access_token') {
        setTimeout(() => {
          const userData = loadUser();
          setUser(userData);
        }, 100);
      }
    };
    
    localStorage.removeItem = function(key) {
      originalRemoveItem.call(this, key);
      
      if (key === 'portal_user' || key === 'portal_access_token') {
        setTimeout(() => {
          setUser(null);
        }, 100);
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, [loadUser]);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    if ((roles.includes('LEADER') || (roles as string[]).includes('leader')) && user.isLeader) {
      return true;
    }
    return roles.includes(user.role);
  }, [user]);

  const isAdminOrLeader = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'LEADER' || Boolean(user.isLeader);
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem('portal_user');
    localStorage.removeItem('portal_access_token');
    localStorage.removeItem('portal_refresh_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      hasRole, 
      isAdminOrLeader, 
      setUser, 
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};