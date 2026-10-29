// src/modules/shared/hooks/useRole.js
// Hook para manejar roles

import { useAuth } from './useAuth';
import { ROLES } from '../../../core/constants/roles';

export const useRole = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === ROLES.ADMIN;
  const isCoordinador = user?.role === ROLES.COORDINADOR;
  const isInstructor = user?.role === ROLES.INSTRUCTOR;
  const isAprendiz = user?.role === ROLES.APRENDIZ;
  const isApoyo = user?.role === ROLES.APOYO;
  
  const hasRole = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user?.role);
  };
  
  return {
    user,
    role: user?.role,
    isAdmin,
    isCoordinador,
    isInstructor,
    isAprendiz,
    isApoyo,
    hasRole
  };
};

export default useRole;
