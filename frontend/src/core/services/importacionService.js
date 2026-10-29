// src/core/services/importacionService.js
import { API_ENDPOINTS } from '../api/endpoints';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Servicio para importación masiva de datos (Excel/CSV).
 * Envía el archivo como multipart/form-data al backend.
 */
export const importacionService = {
  importar: async (tipo, archivo) => {
    const formData = new FormData();
    formData.append('file', archivo);

    const token = localStorage.getItem('token');

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.IMPORTACION.IMPORTAR(tipo)}`,
      {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.detail || `Error ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  },
};

export default importacionService;