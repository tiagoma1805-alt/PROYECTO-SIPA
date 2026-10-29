// src/core/services/reporteService.js
import { apiClient } from '../api/client';

export const reporteService = {
  // 🔥 NUEVO: Lista de fichas con instructor, aprendices y avance
  getFichasReporte: async () => {
    return await apiClient.get('/reportes/fichas-json');
  },

  // 🔥 NUEVO: Detalle de una ficha con sus aprendices
  getFichaDetalleReporte: async (fichaId) => {
    return await apiClient.get(`/reportes/ficha-detalle/${fichaId}`);
  },

  // Los que ya tenías (para descargas)
  getDashboard: async () => {
    return await apiClient.get('/reportes/dashboard');
  },
};

export default reporteService;