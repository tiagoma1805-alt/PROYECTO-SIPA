// src/core/services/centrosFormacionService.js
import { apiClient } from '../api/client';

export const centrosFormacionService = {
  // Listar todos los centros
  listar: async () => {
    return await apiClient.get('/centros-formacion/');
  },

  // Detalle de un centro (con programas)
  obtenerDetalle: async (centroId) => {
    return await apiClient.get(`/centros-formacion/${centroId}`);
  },

  // Crear un centro (solo admin)
  crear: async (data) => {
    return await apiClient.post('/centros-formacion/', data);
  },
};

export default centrosFormacionService;