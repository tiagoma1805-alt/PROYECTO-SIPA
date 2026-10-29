// src/core/theme/index.js
// Tema y colores globales de la aplicación

export const THEME = {
  colors: {
    primary: '#0d4a2a',
    primaryLight: '#1a6a3a',
    primaryDark: '#0a3a1a',
    secondary: '#8bc34a',
    secondaryLight: '#a5d6a7',
    secondaryDark: '#7cb342',
    
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    
    white: '#ffffff',
    black: '#000000',
    
    gray: {
      50: '#f8f9fa',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%'
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xxl: '0 16px 32px rgba(0, 0, 0, 0.1)'
  },
  
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px'
  }
};

export default THEME;
