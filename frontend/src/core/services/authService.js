// src/core/services/authService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    console.log('🔍 [authService] RESPONSE BACKEND:', response);

    if (!response || !response.access_token) {
      throw new Error('Credenciales inválidas');
    }

    // 🔥 El user viene en response.user
    const user = response.user;
    if (!user || !user.id) {
      console.error('❌ response.user está vacío:', response);
      throw new Error('Respuesta inválida del servidor');
    }

    // Guardar en localStorage
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(user));

    console.log('✅ [authService] USER GUARDADO:', user);

    return {
      access_token: response.access_token,
      user,
    };
  },

  register: async (userData) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  verifyToken: async () => {
    try {
      await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return true;
    } catch {
      return false;
    }
  },

  getCurrentUser: () => JSON.parse(localStorage.getItem('user') || 'null'),

  isAuthenticated: () => !!localStorage.getItem('token'),

  requestPasswordReset: async (email) => apiClient.post(API_ENDPOINTS.AUTH.REQUEST_RESET, { email }),
  verifyResetCode: async (email, code) => apiClient.post(API_ENDPOINTS.AUTH.VERIFY_CODE, { email, code }),
  resetPassword: async (email, code, newPassword) => apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, code, newPassword }),
  changePassword: async (currentPassword, newPassword) => apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword }),
};

export default authService;
