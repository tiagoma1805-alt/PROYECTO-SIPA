// src/core/services/bitacoraService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const bitacoraService = {
  getBitacoras: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.BITACORAS.GET_ALL, { params });
  },

  getBitacoraById: async (id) => {
    return await apiClient.get(API_ENDPOINTS.BITACORAS.GET_BY_ID(id));
  },

  getBitacorasByFicha: async (fichaId) => {
    return await apiClient.get(API_ENDPOINTS.BITACORAS.GET_BY_FICHA(fichaId));
  },

  getBitacorasByAprendiz: async (aprendizId) => {
    return await apiClient.get(API_ENDPOINTS.BITACORAS.GET_BY_APRENDIZ(aprendizId));
  },

  getEvidencias: async (bitacoraId) => {
    return await apiClient.get(API_ENDPOINTS.BITACORAS.GET_EVIDENCIAS(bitacoraId));
  },

  createBitacora: async (data) => {
    return await apiClient.post(API_ENDPOINTS.BITACORAS.CREATE, data);
  },

  updateBitacora: async (id, data) => {
    return await apiClient.put(API_ENDPOINTS.BITACORAS.UPDATE(id), data);
  },

  deleteBitacora: async (id) => {
    return await apiClient.delete(API_ENDPOINTS.BITACORAS.DELETE(id));
  },
};