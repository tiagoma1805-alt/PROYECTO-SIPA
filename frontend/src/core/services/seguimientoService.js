// src/core/services/seguimientoService.js
import { apiClient } from '../api/client';

export const seguimientoService = {
  // Lista de momentos agrupados por ficha y aprendiz
  getMomentos: async () => {
    return await apiClient.get('/reportes/momentos');
  },

  // Detalle de una ficha por momentos
  getMomentosByFicha: async (fichaId) => {
    return await apiClient.get(`/reportes/momentos/ficha/${fichaId}`);
  },
};

export default seguimientoService;