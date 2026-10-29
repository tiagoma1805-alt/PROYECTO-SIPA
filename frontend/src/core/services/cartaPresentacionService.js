// src/core/services/cartaPresentacionService.js
import { apiClient } from '../api/client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const cartaPresentacionService = {
  // Listar cartas (según el rol del usuario logueado)
  listar: async (params = {}) => {
    return await apiClient.get('/cartas-presentacion/', { params });
  },

  // Coordinador sube el PDF firmado (FormData con fetch nativo)
  subir: async (procesoId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    const response = await fetch(
      `${API_BASE}/cartas-presentacion/subir?proceso_id=${procesoId}`,
      {
        method: 'POST',
        headers: {
          // No poner Content-Type: el navegador agrega multipart + boundary
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const detail = error.detail || error.message || 'Error al subir la carta';
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }

    return response.json();
  },

  // Carga masiva de varios PDFs
  subirMasivo: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/cartas-presentacion/subir-masivo`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const detail = error.detail || error.message || 'Error en carga masiva';
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }

    return response.json();
  },

  // Descargar plantilla Excel de aprendices
  descargarPlantilla: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_BASE}/cartas-presentacion/plantilla-aprendices`,
      {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'No se pudo descargar la plantilla');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_cartas_aprendices.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Actualizar estado (APROBADA / RECHAZADA / CARGADA)
  actualizarEstado: async (cartaId, estado, observaciones = null) => {
    return await apiClient.patch(`/cartas-presentacion/${cartaId}/estado`, {
      estado,
      observaciones,
    });
  },

  // Eliminar (soft delete)
  eliminar: async (cartaId) => {
    return await apiClient.delete(`/cartas-presentacion/${cartaId}`);
  },
};

export default cartaPresentacionService;