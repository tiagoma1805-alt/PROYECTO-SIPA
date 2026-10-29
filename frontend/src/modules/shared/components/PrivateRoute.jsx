// src/modules/shared/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, ROLES_ROUTES } from '@/providers/AuthProvider';

const PrivateRoute = ({ children, rolesPermitidos = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mientras carga la sesión desde localStorage, no redirigir
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666',
      }}>
        Cargando...
      </div>
    );
  }

  // Sin sesión → al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 Convertir rol_id a número para comparar bien
  const rolId = Number(user?.rol_id);

  // Con sesión pero sin permiso de rol → a su home
  if (rolesPermitidos && !rolesPermitidos.includes(rolId)) {
    return <Navigate to={ROLES_ROUTES[rolId] || '/login'} replace />;
  }

  return children;
};

export default PrivateRoute;
