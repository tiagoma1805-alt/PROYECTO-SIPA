import apiClient from '../api/client';

const alertaService = {
  getPendientes: async () => apiClient.get('/alertas/pendientes'),
  getHistorial: async () => apiClient.get('/alertas/historial'),
  getContador: async () => apiClient.get('/alertas/contador'),
  resolver: async (alertaId, nota = null) => 
    apiClient.patch(`/alertas/${alertaId}/resolver`, { nota }),
};

export default alertaService;