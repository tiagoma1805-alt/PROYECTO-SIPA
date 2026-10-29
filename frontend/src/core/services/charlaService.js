// src/core/services/charlaService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const charlaService = {
  // ============ CRUD BÁSICO ============

  // Obtener todas las charlas
  getCharlas: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHARLAS.GET_ALL, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener charla por ID
  getCharlaById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHARLAS.GET_BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Crear charla
  createCharla: async (charlaData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHARLAS.CREATE, charlaData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar charla
  updateCharla: async (id, charlaData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CHARLAS.UPDATE(id), charlaData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar charla
  deleteCharla: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CHARLAS.DELETE(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ FILTROS ============

  // Obtener charlas por instructor
  getCharlasByInstructor: async (instructorId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHARLAS.GET_BY_INSTRUCTOR(instructorId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener charlas por ficha
  getCharlasByFicha: async (fichaId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHARLAS.GET_BY_FICHA(fichaId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener charlas por fecha
  getCharlasByFecha: async (fecha) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHARLAS.GET_BY_FECHA(fecha));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener charlas programadas
  getCharlasProgramadas: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHARLAS.GET_PROGRAMADAS);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ ASISTENCIA ============

  // Registrar asistencia a charla
  registrarAsistencia: async (charlaId, aprendizId) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.CHARLAS.REGISTRAR_ASISTENCIA(charlaId), { aprendizId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener asistentes de una charla
  getAsistentes: async (charlaId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHARLAS.GET_ASISTENTES(charlaId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ ESTADÍSTICAS ============

  // Obtener estadísticas de charlas
  getCharlasStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHARLAS.STATS);
      return response;
    } catch (error) {
      throw error;
    }
  }
};