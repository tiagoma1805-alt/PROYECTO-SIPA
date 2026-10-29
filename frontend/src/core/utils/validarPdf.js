// src/core/utils/validarPdf.js
// ============================================================
// VALIDADOR CENTRAL DE PDF
// Uso en TODO el sistema excepto cargas masivas
// ============================================================

const PDF_MAGIC = '%PDF-';
const MAX_MB_DEFAULT = 5;

/**
 * Valida que un archivo sea PDF de forma ESTRICTA.
 */
export const validarPdf = async (file, maxMB = MAX_MB_DEFAULT) => {
  if (!file) {
    return { ok: false, msg: '⚠️ Por favor selecciona un archivo' };
  }

  const nombre = (file.name || '').toLowerCase();
  if (!nombre.endsWith('.pdf')) {
    return { ok: false, msg: '❌ Solo se permiten archivos PDF (.pdf)' };
  }

  const mimeOk = file.type === 'application/pdf' || file.type === '';
  if (!mimeOk) {
    return { ok: false, msg: '❌ El archivo no es un PDF válido' };
  }

  if (file.size > maxMB * 1024 * 1024) {
    return { ok: false, msg: `❌ El archivo no debe superar los ${maxMB}MB` };
  }

  try {
    const slice = file.slice(0, 5);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const firma = String.fromCharCode(...bytes);

    if (firma !== PDF_MAGIC) {
      return { ok: false, msg: '❌ El archivo no es un PDF real (contenido inválido)' };
    }
  } catch {
    return { ok: false, msg: '❌ No se pudo verificar el archivo' };
  }

  return { ok: true };
};

export const validarPdfs = async (files, maxMB = MAX_MB_DEFAULT) => {
  const arr = Array.from(files || []);
  if (arr.length === 0) {
    return { ok: false, msg: '⚠️ Selecciona al menos un archivo' };
  }
  for (const f of arr) {
    const r = await validarPdf(f, maxMB);
    if (!r.ok) return r;
  }
  return { ok: true };
};

export const formatearTamano = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const abrirArchivo = (url) => {
  if (!url) return;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const finalUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  window.open(finalUrl, '_blank');
};