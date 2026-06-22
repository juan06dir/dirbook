import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (!savedToken) return;

      setToken(savedToken);

      // Mostrar de inmediato el usuario cacheado para no perder la sesión
      const cached = await AsyncStorage.getItem('user');
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch {}
      }

      // Refrescar el perfil en segundo plano
      try {
        const me = await getMe();
        setUser(me);
        await AsyncStorage.setItem('user', JSON.stringify(me));
      } catch (e) {
        // Solo cerrar sesión si el token es inválido/expirado (401/403).
        // Ante errores de red o servidor frío (Render), mantener la sesión.
        if (e?.status === 401 || e?.status === 403) {
          await AsyncStorage.multiRemove(['token', 'user']);
          setToken(null);
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function signIn(tokenValue, userData) {
    await AsyncStorage.setItem('token', tokenValue);
    if (userData) await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }

  async function signOut() {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
