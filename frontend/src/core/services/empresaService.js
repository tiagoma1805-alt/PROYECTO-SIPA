// src/core/services/empresaService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const empresaService = {
  // ============ CRUD BÁSICO ============

  getEmpresas: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.EMPRESAS.GET_ALL, { params });
  },

  getEmpresaById: async (id) => {
    return await apiClient.get(API_ENDPOINTS.EMPRESAS.GET_BY_ID(id));
  },

  createEmpresa: async (empresaData) => {
    return await apiClient.post(API_ENDPOINTS.EMPRESAS.CREATE, empresaData);
  },

  updateEmpresa: async (id, empresaData) => {
    return await apiClient.put(API_ENDPOINTS.EMPRESAS.UPDATE(id), empresaData);
  },

  deleteEmpresa: async (id) => {
    return await apiClient.delete(API_ENDPOINTS.EMPRESAS.DELETE(id));
  },

  // ============ COORDINADORES ============

  getCoordinadores: async (empresaId) => {
    return await apiClient.get(API_ENDPOINTS.EMPRESAS.COORDINADORES(empresaId));
  },

  // ============ CARGA MASIVA ============
  // Envía el archivo Excel/CSV al endpoint /importacion/empresas
  bulkUploadEmpresas: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/importacion/empresas`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },
};

export default empresaService;