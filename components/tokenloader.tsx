// components/TokenLoader.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';

export const TokenLoader: React.FC = () => {
  // const { login, user } = useAuth();
  const [tokenInput, setTokenInput] = useState('');

  const handleLoadToken = () => {
    if (tokenInput.trim()) {
      // login(tokenInput.trim());
      setTokenInput('');
    }
  };

  const handleLoadFromStorage = () => {
    // Buscar token en el storage y cargarlo
    const possibleKeys = ['token', 'access_token', 'jwt', 'auth_token'];
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        // login(token);
        break;
      }
    }
  };

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🛠️ Cargar Token Manual</h3>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Pega el token aquí..."
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
        />
        <button
          onClick={handleLoadToken}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Cargar Token
        </button>
        <button
          onClick={handleLoadFromStorage}
          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          Cargar del Storage
        </button>
      </div>
      {user && (
        <div className="mt-2 text-sm">
          ✅ Usuario: <span className="font-medium">{user.name}</span> (Rol: <span className="font-bold">{user.role}</span>)
        </div>
      )}
    </div>
  );
};