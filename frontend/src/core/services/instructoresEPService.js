// src/core/services/instructoresEPService.js
import { apiClient } from '../api/client';

export const instructoresEPService = {
  // Stats generales
  getStats: async () => {
    return await apiClient.get('/instructores-ep/stats');
  },

  // Lista de instructores (con búsqueda opcional)
  listar: async (search = '') => {
    const url = search
      ? `/instructores-ep/?search=${encodeURIComponent(search)}`
      : '/instructores-ep/';
    return await apiClient.get(url);
  },

  // Detalle de un instructor (con sus aprendices)
  obtenerDetalle: async (instructorId) => {
    return await apiClient.get(`/instructores-ep/${instructorId}`);
  },
};

export default instructoresEPService; 