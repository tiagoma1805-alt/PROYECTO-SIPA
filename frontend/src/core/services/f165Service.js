// src/core/services/f165Service.js
import { apiClient } from '../api/client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const f165Service = {
  // Descargar F165 individual de un proceso (aprendiz)
  descargarIndividual: async (procesoId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/f165/generar/${procesoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      let errorMsg = 'No se pudo generar el F165';
      try {
        const err = await response.json();
        errorMsg = err.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `F165_${procesoId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Descargar F165 masivo (ZIP) de todos los aprendices de una ficha
  descargarMasivoPorFicha: async (fichaId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/f165/generar-ficha/${fichaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      let errorMsg = 'No se pudo generar el ZIP';
      try {
        const err = await response.json();
        errorMsg = err.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `F165_Ficha_${fichaId}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default f165Service;