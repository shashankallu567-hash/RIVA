'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { DEMO_USERS } from '@/data/mockUsers';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  signup: (name: string, email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchPersona: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USERS.customer);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage for persisted user or default to customer demo
    try {
      const stored = localStorage.getItem('riva_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(DEMO_USERS.customer);
      }
    } catch {
      setUser(DEMO_USERS.customer);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, preferredRole: UserRole = 'CUSTOMER') => {
    setIsLoading(true);
    try {
      // Find matching demo user or create dummy
      const found = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      const selectedUser = found || {
        id: `usr-${Date.now().toString(36)}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: preferredRole,
        storeId: 'store-blr-01',
        createdAt: new Date().toISOString()
      };
      setUser(selectedUser);
      localStorage.setItem('riva_user', JSON.stringify(selectedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, role: UserRole = 'CUSTOMER') => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: `usr-${Date.now().toString(36)}`,
        name,
        email,
        role,
        storeId: 'store-blr-01',
        createdAt: new Date().toISOString()
      };
      setUser(newUser);
      localStorage.setItem('riva_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('riva_user');
  };

  const switchPersona = (newRole: UserRole) => {
    let persona = DEMO_USERS.customer;
    if (newRole === 'STAFF') persona = DEMO_USERS.staff;
    else if (newRole === 'ADMIN') persona = DEMO_USERS.admin;
    setUser(persona);
    localStorage.setItem('riva_user', JSON.stringify(persona));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        switchPersona,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
