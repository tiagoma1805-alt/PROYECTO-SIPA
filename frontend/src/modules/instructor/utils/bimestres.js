// src/modules/instructor/utils/bimestres.js

export const getNombreBimestre = (key) => {
  const nombres = {
    bimestre1: '1er Bimestre',
    bimestre2: '2do Bimestre',
    bimestre3: '3er Bimestre',
    bimestre4: '4to Bimestre'
  };
  return nombres[key] || key;
};

export const getIconoBimestre = (key) => {
  const iconos = {
    bimestre1: 'fa-calendar-alt',
    bimestre2: 'fa-calendar-check',
    bimestre3: 'fa-calendar-day',
    bimestre4: 'fa-calendar-week'
  };
  return iconos[key] || 'fa-calendar';
};

export const getColorBimestre = (key) => {
  const colores = {
    bimestre1: '#3ca203',
    bimestre2: '#0ea5e9',
    bimestre3: '#f59e0b',
    bimestre4: '#8b5cf6'
  };
  return colores[key] || '#6b7280';
};

export const getIniciales = (nombre) => {
  return nombre
    .split(' ')
    .map(palabra => palabra[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};