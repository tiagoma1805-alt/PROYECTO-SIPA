// src/core/services/novedadesService.js
import { apiClient } from '../api/client';

export const novedadesService = {
  getStats: async () => {
    return await apiClient.get('/novedades/stats');
  },

  listar: async (search = '', tipo = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tipo) params.append('tipo', tipo);
    const url = params.toString()
      ? `/novedades/?${params.toString()}`
      : '/novedades/';
    return await apiClient.get(url);
  },

  obtenerDetalle: async (novedadId) => {
    return await apiClient.get(`/novedades/${novedadId}`);
  },
};

export default novedadesService;