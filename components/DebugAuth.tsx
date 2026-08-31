"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/components/context/AuthContext';

export const DebugAuth: React.FC = () => {
  const { user, isLoading, isAdminOrLeader, hasRole } = useAuth();

  useEffect(() => {
    console.log("=== DEBUG COMPLETO DE AUTENTICACIÓN ===");
    console.log("1. isLoading:", isLoading);
    console.log("2. user:", user);
    console.log("3. user?.role:", user?.role);
    console.log("4. isAdminOrLeader():", isAdminOrLeader());
    console.log("5. hasRole(['ADMIN', 'LEADER']):", hasRole(['ADMIN', 'LEADER']));
    console.log("6. portal_user en localStorage:", localStorage.getItem('portal_user'));
    console.log("7. portal_access_token en localStorage:", localStorage.getItem('portal_access_token'));
    console.log("8. Todas las claves de localStorage:", Object.keys(localStorage));
    console.log("=== FIN DEBUG ===");
  }, [user, isLoading]);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 mb-4">
      <h3 className="font-bold text-sm mb-2">🔍 Debug de Autenticación</h3>
      <div className="space-y-1 text-xs font-mono">
        <p>Loading: <span className="font-bold">{String(isLoading)}</span></p>
        <p>Usuario: <span className="font-bold">{user?.name || 'null'}</span></p>
        <p>Rol: <span className="font-bold text-primary">{user?.role || 'null'}</span></p>
        <p>isAdminOrLeader: <span className="font-bold">{String(isAdminOrLeader())}</span></p>
        <p>hasRole(['ADMIN','LEADER']): <span className="font-bold">{String(hasRole(['ADMIN', 'LEADER']))}</span></p>
        <p>portal_user: <span className="font-bold">{localStorage.getItem('portal_user') ? '✅' : '❌'}</span></p>
        <p>portal_access_token: <span className="font-bold">{localStorage.getItem('portal_access_token') ? '✅' : '❌'}</span></p>
      </div>
    </div>
  );
};