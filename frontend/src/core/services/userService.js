// src/core/services/userService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const userService = {
  // ============ CRUD BÁSICO ============

  getUsers: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.USUARIOS.GET_ALL, { params });
  },

  getUserById: async (id) => {
    return await apiClient.get(API_ENDPOINTS.USUARIOS.GET_BY_ID(id));
  },

  createUser: async (userData) => {
    return await apiClient.post(API_ENDPOINTS.USUARIOS.CREATE, userData);
  },

  updateUser: async (id, userData) => {
    return await apiClient.put(API_ENDPOINTS.USUARIOS.UPDATE(id), userData);
  },

  deleteUser: async (id) => {
    return await apiClient.delete(API_ENDPOINTS.USUARIOS.DELETE(id));
  },

  // ============ PERFIL DEL USUARIO ACTUAL ============

  // Obtener datos del usuario logueado
  getMe: async () => {
    return await apiClient.get(API_ENDPOINTS.AUTH.ME);
  },

  // Actualizar mi propio perfil (nombre, apellido, teléfono, documento)
  updateMiPerfil: async (userId, userData) => {
    return await apiClient.put(API_ENDPOINTS.USUARIOS.UPDATE(userId), userData);
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
  },

  // 🔥 NUEVO: Subir foto de perfil
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post('/usuarios/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ============ FILTROS POR ROL ============

  getUsersByRole: async (rolId) => {
    return await apiClient.get(API_ENDPOINTS.USUARIOS.GET_ALL, {
      params: { rol_id: rolId },
    });
  },

  getInstructors: async () => {
    return await apiClient.get(API_ENDPOINTS.USUARIOS.GET_ALL, {
      params: { rol_id: 3 },
    });
  },

  getAprendices: async () => {
    return await apiClient.get(API_ENDPOINTS.USUARIOS.GET_ALL, {
      params: { rol_id: 4 },
    });
  },

  getAprendicesByFicha: async (fichaId) => {
    return await apiClient.get(API_ENDPOINTS.USUARIOS.GET_ALL, {
      params: { ficha_id: fichaId },
    });
  },

  // ============ CARGA MASIVA ============

  bulkCreateUsers: async (usersData) => {
    return await apiClient.post(API_ENDPOINTS.IMPORTACION.IMPORTAR('usuarios'), {
      users: usersData,
    });
  },

  bulkUploadUsers: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post(
      API_ENDPOINTS.IMPORTACION.IMPORTAR('usuarios'),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  // ============ ESTADÍSTICAS Y BÚSQUEDA ============

  getUsersStats: async () => {
    return await apiClient.get(API_ENDPOINTS.USUARIOS.STATS);
  },

  searchUsers: async (query) => {
    return await apiClient.get(API_ENDPOINTS.USUARIOS.GET_ALL, {
      params: { search: query },
    });
  },
};

export default userService;