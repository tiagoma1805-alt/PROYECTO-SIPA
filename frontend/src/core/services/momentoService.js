// src/core/services/momentoService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const momentoService = {
  // ============ CRUD BÁSICO ============

  // Obtener todos los momentos
  getMomentos: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MOMENTOS.GET_ALL, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener momento por ID
  getMomentoById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MOMENTOS.GET_BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Crear momento
  createMomento: async (momentoData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MOMENTOS.CREATE, momentoData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar momento
  updateMomento: async (id, momentoData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MOMENTOS.UPDATE(id), momentoData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar momento
  deleteMomento: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MOMENTOS.DELETE(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ FILTROS ============

  // Obtener momentos por aprendiz
  getMomentosByAprendiz: async (aprendizId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MOMENTOS.GET_BY_APRENDIZ(aprendizId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener momentos por ficha
  getMomentosByFicha: async (fichaId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MOMENTOS.GET_BY_FICHA(fichaId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener momentos por tipo
  getMomentosByTipo: async (tipo) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MOMENTOS.GET_BY_TIPO(tipo));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ CARGA MASIVA ============

  // Carga masiva de momentos
  bulkCreateMomentos: async (momentosData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MOMENTOS.BULK_CREATE, { momentos: momentosData });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ ESTADÍSTICAS ============

  // Obtener estadísticas de momentos
  getMomentosStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MOMENTOS.STATS);
      return response;
    } catch (error) {
      throw error;
    }
  }
};