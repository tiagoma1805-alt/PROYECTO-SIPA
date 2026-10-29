// src/core/config/index.js
// Configuraciones globales de la aplicación

export const APP_CONFIG = {
  name: 'SIPA - Sistema de Seguimiento de Etapa Productiva',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  environment: import.meta.env.NODE_ENV || 'development',
  isProduction: import.meta.env.NODE_ENV === 'production',
  isDevelopment: import.meta.env.NODE_ENV === 'development'
};

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100]
};

export const DATE_FORMATS = {
  default: 'DD/MM/YYYY',
  time: 'HH:mm',
  full: 'DD/MM/YYYY HH:mm',
  api: 'YYYY-MM-DD'
};
