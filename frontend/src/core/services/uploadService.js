// src/core/services/uploadService.js
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const uploadService = {
  // ============ CARGA MASIVA DE USUARIOS ============
  
  uploadUsers: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.USERS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ CARGA MASIVA DE FICHAS ============
  
  uploadFichas: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.FICHAS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ CARGA MASIVA DE EMPRESAS ============
  
  uploadEmpresas: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.EMPRESAS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ CARGA MASIVA DE BITÁCORAS ============
  
  uploadBitacoras: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.BITACORAS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ CARGA MASIVA DE CERTIFICADOS ============
  
  uploadCertificados: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.CERTIFICADOS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ DESCARGA DE PLANTILLAS ============
  
  downloadTemplate: async (type) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.UPLOAD.TEMPLATE(type), {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `plantilla_${type}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ ESTADO DE CARGA ============
  
  getUploadStatus: async (uploadId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.UPLOAD.STATUS(uploadId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancelar carga masiva
  cancelUpload: async (uploadId) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.UPLOAD.CANCEL(uploadId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ OBTENER HISTORIAL DE CARGAS ============
  
  getUploadHistory: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.UPLOAD.HISTORY, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
};