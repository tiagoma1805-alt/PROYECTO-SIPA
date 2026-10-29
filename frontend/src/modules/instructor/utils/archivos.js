// src/modules/instructor/utils/archivos.js

export const getIconoArchivo = (tipo) => {
  if (!tipo) return 'fa-file';
  if (tipo.includes('pdf')) return 'fa-file-pdf';
  if (tipo.includes('image') || tipo.includes('jpg') || tipo.includes('png') || tipo.includes('jpeg')) return 'fa-file-image';
  if (tipo.includes('word') || tipo.includes('document') || tipo.includes('doc')) return 'fa-file-word';
  if (tipo.includes('excel') || tipo.includes('sheet') || tipo.includes('xls')) return 'fa-file-excel';
  if (tipo.includes('powerpoint') || tipo.includes('ppt')) return 'fa-file-powerpoint';
  return 'fa-file';
};

export const getColorArchivo = (tipo) => {
  if (!tipo) return '#6b7280';
  if (tipo.includes('pdf')) return '#dc2626';
  if (tipo.includes('image') || tipo.includes('jpg') || tipo.includes('png')) return '#8b5cf6';
  if (tipo.includes('word') || tipo.includes('doc')) return '#2563eb';
  if (tipo.includes('excel') || tipo.includes('xls')) return '#16a34a';
  if (tipo.includes('powerpoint') || tipo.includes('ppt')) return '#ea580c';
  return '#6b7280';
};