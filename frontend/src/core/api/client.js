// src/core/api/client.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
  // 🔥 SOLO redirigir al login si es 401 Y el usuario tenía token
  if (response.status === 401) {
    const teníaToken = !!localStorage.getItem('token');
    const yaEstáEnLogin = window.location.pathname === '/login';
    
    // Si tenía token pero expiró → limpiar
    // Si NO tenía token (ej. /auth/login) → dejar pasar el error
    if (teníaToken && !yaEstáEnLogin) {
      console.warn('⚠️ Token expirado. Redirigiendo a login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }
    
    // Si estamos en /login, solo tirar error (NO redirigir en bucle)
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Credenciales incorrectas');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'Error en la petición');
  }
  
  if (response.status === 204) return null;
  return response.json();
};

const getHeaders = (customHeaders = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const buildUrl = (endpoint, params) => {
  let url = `${API_BASE_URL}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    ).toString();
    if (queryString) url += `?${queryString}`;
  }
  return url;
};

export const apiClient = {
  get: async (endpoint, options = {}) => {
    const url = buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(options.headers),
    });
    return handleResponse(response);
  },

  post: async (endpoint, data = {}, options = {}) => {
    const url = buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(options.headers),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (endpoint, data = {}, options = {}) => {
    const url = buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(options.headers),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  patch: async (endpoint, data = {}, options = {}) => {
    const url = buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(options.headers),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint, options = {}) => {
    const url = buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(options.headers),
    });
    return handleResponse(response);
  },
};

export default apiClient;
