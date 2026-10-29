// src/modules/shared/services/authService.js
import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

export const authService = {
  login: async (email, password) => {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  register: async (userData) => {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    } catch (error) {
      throw new Error(error.message || 'Error al registrar usuario');
    }
  },

  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT || '/auth/logout');
    } catch (error) {
      console.warn('Logout remoto falló, limpiando sesión local');
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },

  recoverPassword: async (email) => {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.REQUEST_RESET, { email });
    } catch (error) {
      throw new Error(error.message || 'Error al recuperar contraseña');
    }
  },

  verifyCode: async (email, code) => {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_CODE, { email, code });
    } catch (error) {
      throw new Error(error.message || 'Código inválido');
    }
  },

  resetPassword: async (email, code, newPassword) => {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
        code,
        new_password: newPassword,
      });
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  },

  me: async () => {
    try {
      return await apiClient.get(API_ENDPOINTS.AUTH.ME);
    } catch (error) {
      throw new Error('No se pudo obtener el usuario actual');
    }
  },

  verifyToken: async () => {
    try {
      return await apiClient.get(API_ENDPOINTS.AUTH.ME);
    } catch (error) {
      throw new Error('Token inválido');
    }
  },
};

export default authService;