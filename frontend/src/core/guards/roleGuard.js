// src/core/guards/roleGuard.js
// Guardias de roles para proteger rutas

import { ROLES } from '../constants/roles';

/**
 * Verifica si un usuario tiene acceso a un rol específico
 */
export const hasRole = (user, allowedRoles) => {
  if (!user || !user.role) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(user.role);
};

/**
 * Verifica si un usuario es administrador
 */
export const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN;
};

/**
 * Verifica si un usuario es coordinador
 */
export const isCoordinador = (user) => {
  return user?.role === ROLES.COORDINADOR;
};

/**
 * Verifica si un usuario es instructor
 */
export const isInstructor = (user) => {
  return user?.role === ROLES.INSTRUCTOR;
};

/**
 * Verifica si un usuario es aprendiz
 */
export const isAprendiz = (user) => {
  return user?.role === ROLES.APRENDIZ;
};

/**
 * Verifica si un usuario es apoyo
 */
export const isApoyo = (user) => {
  return user?.role === ROLES.APOYO;
};

/**
 * Obtiene el rol de un usuario
 */
export const getUserRole = (user) => {
  return user?.role || null;
};

/**
 * Verifica si un usuario tiene acceso a un módulo
 */
export const hasModuleAccess = (user, moduleName) => {
  const roleModuleMap = {
    [ROLES.ADMIN]: ['admin', 'usuarios', 'fichas', 'reportes'],
    [ROLES.COORDINADOR]: ['coordinador', 'fichas', 'aprendices', 'instructores', 'empresas'],
    [ROLES.INSTRUCTOR]: ['instructor', 'fichas', 'bitacoras', 'seguimiento'],
    [ROLES.APRENDIZ]: ['aprendiz', 'bitacoras', 'certificados'],
    [ROLES.APOYO]: ['apoyo', 'fichas', 'reportes']
  };

  const userModules = roleModuleMap[user?.role] || [];
  return userModules.includes(moduleName);
};
