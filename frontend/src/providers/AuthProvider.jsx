// src/providers/AuthProvider.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/core/services/authService';

export const AuthContext = createContext();

export const ROLES_ROUTES = {
  1: '/admin',
  2: '/coordinador',
  3: '/instructor',
  4: '/aprendiz',
  5: '/apoyo',
  6: '/apoyo',
};

export const ROLES_NAMES = {
  1: 'Administrador',
  2: 'Coordinador',
  3: 'Instructor',
  4: 'Aprendiz',
  5: 'Apoyo Administrativo',
  6: 'Consulta',
};

// 🔥 Normalizar el objeto usuario (garantiza todos los campos)
const normalizarUsuario = (rawUser, fallbackEmail = '') => {
  if (!rawUser || !rawUser.id) return null;

  const rolIdNum = Number(rawUser.rol_id);

  return {
    id: rawUser.id,
    nombre: rawUser.nombre || '',
    apellido: rawUser.apellido || '',
    email: rawUser.email || fallbackEmail,
    rol_id: isNaN(rolIdNum) ? null : rolIdNum,
    rol_nombre: rawUser.rol_nombre || ROLES_NAMES[rolIdNum] || 'Usuario',
    tipo_documento: rawUser.tipo_documento || null,
    documento_identidad: rawUser.documento_identidad || null,
    telefono: rawUser.telefono || null,
    avatar_url: rawUser.avatar_url || null,
    is_active: rawUser.is_active !== false,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // 1. Cargar usuario desde localStorage al montar
  // ==========================================================
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        const parsed = JSON.parse(storedUser);
        const normalizado = normalizarUsuario(parsed);
        if (normalizado) {
          setUser(normalizado);
          console.log('✅ [AuthProvider] Usuario restaurado:', normalizado);
        }
      }
    } catch (e) {
      console.error('❌ [AuthProvider] Error init auth:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // 2. Sincronizar si cambia localStorage en otra pestaña
  // ==========================================================
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        try {
          const storedUser = localStorage.getItem('user');
          const token = localStorage.getItem('token');

          if (token && storedUser) {
            const parsed = JSON.parse(storedUser);
            const normalizado = normalizarUsuario(parsed);
            if (normalizado) {
              setUser(normalizado);
              console.log('🔄 [AuthProvider] Usuario sincronizado:', normalizado);
            }
          } else {
            setUser(null);
            console.log('🚪 [AuthProvider] Sesión cerrada en otra pestaña');
          }
        } catch (err) {
          console.error('Error sincronizando usuario:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ==========================================================
  // 3. Login
  // ==========================================================
  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    console.log('🔍 [AuthProvider] response:', response);

    const rawUser = response?.user || response?.data?.user || response;
    if (!rawUser || !rawUser.id) {
      console.error('❌ No hay id en user:', response);
      throw new Error('Respuesta inválida del servidor');
    }

    const userData = normalizarUsuario(rawUser, email);
    if (!userData) {
      throw new Error('No se pudo normalizar el usuario');
    }

    console.log('✅ [AuthProvider] userData final:', userData);

    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  // ==========================================================
  // 4. Register
  // ==========================================================
  const register = useCallback(async (userData) => {
    return await authService.register(userData);
  }, []);

  // ==========================================================
  // 5. Logout
  // ==========================================================
  const logout = useCallback(async () => {
    authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // ==========================================================
  // 6. Actualizar usuario (para cuando se edita el perfil)
  // ==========================================================
  const actualizarUsuario = useCallback((cambios) => {
    setUser((prev) => {
      if (!prev) return prev;
      const actualizado = { ...prev, ...cambios };
      localStorage.setItem('user', JSON.stringify(actualizado));
      return actualizado;
    });
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    actualizarUsuario,
    isAuthenticated: !!user,
    role: user?.rol_id || null,
    getRutaInicial: () => (user ? ROLES_ROUTES[user.rol_id] : '/login'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;