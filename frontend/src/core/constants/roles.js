// src/core/constants/roles.js
// Roles del sistema

export const ROLES = {
  ADMIN: 'admin',
  COORDINADOR: 'coordinador',
  INSTRUCTOR: 'instructor',
  APRENDIZ: 'aprendiz',
  APOYO: 'apoyo'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.COORDINADOR]: 'Coordinador',
  [ROLES.INSTRUCTOR]: 'Instructor',
  [ROLES.APRENDIZ]: 'Aprendiz',
  [ROLES.APOYO]: 'Apoyo'
};

export const ROLE_ROUTES = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.COORDINADOR]: '/coordinador',
  [ROLES.INSTRUCTOR]: '/instructor',
  [ROLES.APRENDIZ]: '/aprendiz',
  [ROLES.APOYO]: '/apoyo'
};

export const ROLE_ICONS = {
  [ROLES.ADMIN]: 'fa-user-shield',
  [ROLES.COORDINADOR]: 'fa-user-tie',
  [ROLES.INSTRUCTOR]: 'fa-chalkboard-teacher',
  [ROLES.APRENDIZ]: 'fa-user-graduate',
  [ROLES.APOYO]: 'fa-user-cog'
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: '#dc3545',
  [ROLES.COORDINADOR]: '#0d6efd',
  [ROLES.INSTRUCTOR]: '#198754',
  [ROLES.APRENDIZ]: '#ffc107',
  [ROLES.APOYO]: '#6f42c1'
};
