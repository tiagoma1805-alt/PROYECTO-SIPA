// src/core/api/endpoints.js
export const API_ENDPOINTS = {
  // ============ AUTH ============
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/cambiar-password',
    REQUEST_RESET: '/auth/recuperar-password',
    VERIFY_CODE: '/auth/verificar-codigo',
    RESET_PASSWORD: '/auth/restablecer-password',
    RESEND_CODE: '/auth/reenviar-codigo',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
  },

  // ============ USUARIOS ============
  USUARIOS: {
    GET_ALL: '/usuarios/',
    GET_BY_ID: (id) => `/usuarios/${id}`,
    CREATE: '/usuarios/',
    UPDATE: (id) => `/usuarios/${id}`,
    DELETE: (id) => `/usuarios/${id}`,
    ME: '/usuarios/me',
    ROLES: '/usuarios/roles',
    STATS: '/usuarios/stats/total',
    ACTIVATE: (id) => `/usuarios/${id}/activate`,
    PREFERENCIAS: (id) => `/usuarios/${id}/preferencias`,
  },

  // ============ EMPRESAS ============
  EMPRESAS: {
    GET_ALL: '/empresas/',
    GET_BY_ID: (id) => `/empresas/${id}`,
    CREATE: '/empresas/',
    UPDATE: (id) => `/empresas/${id}`,
    DELETE: (id) => `/empresas/${id}`,
    COORDINADORES: (id) => `/empresas/${id}/coordinadores`,
    COORDINADOR_BY_ID: (id) => `/empresas/coordinadores/${id}`,
  },

  // ============ MODALIDADES ============
  MODALIDADES: {
    GET_ALL: '/modalidades/',
    GET_BY_ID: (id) => `/modalidades/${id}`,
    CREATE: '/modalidades/',
    UPDATE: (id) => `/modalidades/${id}`,
    DELETE: (id) => `/modalidades/${id}`,
  },

  // ============ PROGRAMAS Y FICHAS ============
  PROGRAMAS_FICHAS: {
    GET_PROGRAMAS: '/programas',
    GET_PROGRAMA: (id) => `/programas/${id}`,
    CREATE_PROGRAMA: '/programas',
    UPDATE_PROGRAMA: (id) => `/programas/${id}`,
    DELETE_PROGRAMA: (id) => `/programas/${id}`,
    GET_FICHAS: '/fichas',
    GET_FICHA: (id) => `/fichas/${id}`,
    CREATE_FICHA: '/fichas',
    UPDATE_FICHA: (id) => `/fichas/${id}`,
    DELETE_FICHA: (id) => `/fichas/${id}`,
    GET_APRENDICES_BY_FICHA: (id) => `/fichas/${id}/aprendices`,
  },

  // ============ PROCESOS ============
  PROCESOS: {
    GET_ALL: '/procesos/',
    GET_BY_ID: (id) => `/procesos/${id}`,
    CREATE: '/procesos/',
    UPDATE: (id) => `/procesos/${id}`,
    DELETE: (id) => `/procesos/${id}`,
    AVANCE: (id) => `/procesos/${id}/avance`,
    CHECKLIST: (id) => `/procesos/${id}/checklist`,
    EVALUACION: (id) => `/procesos/${id}/evaluacion`,
    NOVEDADES: (id) => `/procesos/${id}/novedades`,
  },

  // ============ BITÁCORAS ============
  BITACORAS: {
    GET_ALL: '/bitacoras/',
    GET_BY_ID: (id) => `/bitacoras/${id}`,
    GET_BY_FICHA: (fichaId) => `/bitacoras/ficha/${fichaId}`,
    GET_BY_APRENDIZ: (aprendizId) => `/bitacoras/aprendiz/${aprendizId}`,
    GET_EVIDENCIAS: (id) => `/bitacoras/${id}/evidencias`,
    CREATE: '/bitacoras/',
    UPDATE: (id) => `/bitacoras/${id}`,
    DELETE: (id) => `/bitacoras/${id}`,
  },

  // ============ CHARLAS ============
  CHARLAS: {
    GET_ALL: '/charlas/',
    GET_BY_ID: (id) => `/charlas/${id}`,
    CREATE: '/charlas/',
    UPDATE: (id) => `/charlas/${id}`,
    DELETE: (id) => `/charlas/${id}`,
    ASISTENCIAS: (id) => `/charlas/${id}/asistencias`,
  },

  // ============ SEGUIMIENTOS ============
  SEGUIMIENTOS: {
    GET_ALL: '/seguimientos/',
    GET_BY_ID: (id) => `/seguimientos/${id}`,
    CREATE: '/seguimientos/',
    UPDATE: (id) => `/seguimientos/${id}`,
    DELETE: (id) => `/seguimientos/${id}`,
    VENCIDAS: '/seguimientos/vencidas',
  },

  // ============ NOTIFICACIONES ============
  NOTIFICACIONES: {
    MIS_NOTIFICACIONES: '/notificaciones/mis-notificaciones',
    BY_USUARIO: (id) => `/notificaciones/usuario/${id}`,
    CREATE: '/notificaciones/enviar',
    GENERAR_ALERTAS: '/notificaciones/generar-alertas',
    GET_BY_ID: (id) => `/notificaciones/${id}`,
    DELETE: (id) => `/notificaciones/${id}`,
    MARCAR_ENVIADA: (id) => `/notificaciones/${id}/marcar-enviada`,
  },

  // ============ DASHBOARDS ============
  DASHBOARDS: {
    ADMIN: '/dashboards/admin',
    COORDINADOR: '/dashboards/coordinador',
    INSTRUCTOR: '/dashboards/instructor',
    APRENDIZ: '/dashboards/aprendiz',
    APOYO: '/dashboards/apoyo',
  },

  // ============ REPORTES ============
  REPORTES: {
    PROCESOS_RIESGO: '/reportes/procesos-riesgo',
    DOCUMENTOS_PENDIENTES: '/reportes/documentos-pendientes',
    SEGUIMIENTOS: '/reportes/seguimientos',
    BITACORAS: '/reportes/bitacoras',
    ESTADO_APRENDICES: '/reportes/estado-aprendices',
    ALTERNATIVAS: '/reportes/alternativas',
    SIN_ALTERNATIVA: '/reportes/aprendices-sin-alternativa',
    EVALUADOS_SIN_EVALUAR: '/reportes/evaluados-sin-evaluar',
    INDICADORES: '/reportes/indicadores-gestion',
  },

  // ============ CERTIFICADOS ============
  CERTIFICADOS: {
    GET_ALL: '/certificados/',
    GET_BY_ID: (id) => `/certificados/${id}`,
    CREATE: '/certificados/',
    UPDATE: (id) => `/certificados/${id}`,
    DELETE: (id) => `/certificados/${id}`,
    BY_APRENDIZ: (id) => `/certificados/aprendiz/${id}`,
    BY_FICHA: (id) => `/certificados/ficha/${id}`,
    GENERAR: '/certificados/generar',
    GENERAR_MASIVO: '/certificados/generar-masivo',
    STATS: '/certificados/stats',
  },

  // ============ IMPORTACIÓN ============
  IMPORTACION: {
    IMPORTAR: (tipo) => `/importacion/${tipo}`,
    USUARIOS: '/importacion/usuarios',
    FICHAS: '/importacion/fichas',
  },

  // ============ BÚSQUEDA ============
  BUSQUEDA: {
    BUSCAR: '/busqueda/',
  },

  // ============ AUDITORÍA ============
  AUDITORIA: {
    GET_ALL: '/auditoria/',
    CONTAR: '/auditoria/contar',
  },

  // ============ HEALTH ============
  HEALTH: '/health',
};