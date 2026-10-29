// src/core/services/fichaService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const fichaService = {
  // ============ FICHAS ============

  getFichas: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.PROGRAMAS_FICHAS.GET_FICHAS, { params });
  },

  getFichaById: async (id) => {
    return await apiClient.get(API_ENDPOINTS.PROGRAMAS_FICHAS.GET_FICHA(id));
  },

  createFicha: async (fichaData) => {
    return await apiClient.post(API_ENDPOINTS.PROGRAMAS_FICHAS.CREATE_FICHA, fichaData);
  },

  updateFicha: async (id, fichaData) => {
    return await apiClient.put(API_ENDPOINTS.PROGRAMAS_FICHAS.UPDATE_FICHA(id), fichaData);
  },

  deleteFicha: async (id) => {
    return await apiClient.delete(API_ENDPOINTS.PROGRAMAS_FICHAS.DELETE_FICHA(id));
  },

  // ============ APRENDICES POR FICHA ============
  // Usa el endpoint del backend: GET /fichas/{id}/aprendices
  getAprendicesByFicha: async (idFicha) => {
    try {
      const response = await apiClient.get(`/fichas/${idFicha}/aprendices`);
      return response;
    } catch (error) {
      console.error('Error al obtener aprendices de la ficha:', error);
      return [];
    }
  },

  // ============ PROGRAMAS ============

  getProgramas: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.PROGRAMAS_FICHAS.GET_PROGRAMAS, { params });
  },

  getProgramaById: async (id) => {
    return await apiClient.get(API_ENDPOINTS.PROGRAMAS_FICHAS.GET_PROGRAMA(id));
  },

  createPrograma: async (data) => {
    return await apiClient.post(API_ENDPOINTS.PROGRAMAS_FICHAS.CREATE_PROGRAMA, data);
  },

  updatePrograma: async (id, data) => {
    return await apiClient.put(API_ENDPOINTS.PROGRAMAS_FICHAS.UPDATE_PROGRAMA(id), data);
  },

  deletePrograma: async (id) => {
    return await apiClient.delete(API_ENDPOINTS.PROGRAMAS_FICHAS.DELETE_PROGRAMA(id));
  },
};

export default fichaService;