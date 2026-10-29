// src/core/services/certificadoService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const certificadoService = {
  // ============ CRUD BÁSICO ============

  // Obtener todos los certificados
  getCertificados: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CERTIFICADOS.GET_ALL, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener certificado por ID
  getCertificadoById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CERTIFICADOS.GET_BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Crear certificado
  createCertificado: async (certificadoData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CERTIFICADOS.CREATE, certificadoData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar certificado
  updateCertificado: async (id, certificadoData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CERTIFICADOS.UPDATE(id), certificadoData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar certificado
  deleteCertificado: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CERTIFICADOS.DELETE(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ FILTROS ============

  // Obtener certificados por aprendiz
  getCertificadosByAprendiz: async (aprendizId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CERTIFICADOS.GET_BY_APRENDIZ(aprendizId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener certificados por ficha
  getCertificadosByFicha: async (fichaId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CERTIFICADOS.GET_BY_FICHA(fichaId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ GENERACIÓN ============

  // Generar certificado individual
  generateCertificado: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CERTIFICADOS.GENERATE, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generar certificados masivos
  generateCertificadosMasivos: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CERTIFICADOS.GENERATE_MASIVO, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ CARGA MASIVA ============

  // Carga masiva de certificados
  bulkCreateCertificados: async (certificadosData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CERTIFICADOS.BULK_CREATE, { certificados: certificadosData });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ ESTADÍSTICAS ============

  // Obtener estadísticas de certificados
  getCertificadosStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CERTIFICADOS.STATS);
      return response;
    } catch (error) {
      throw error;
    }
  }
};