// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';

const ROLE_ROUTES = {
  1: '/admin',
  2: '/coordinador',
  3: '/instructor',
  4: '/aprendiz',
  5: '/apoyo',
  6: '/apoyo',
};

const ROL_NOMBRE_A_ID = {
  'administrador': 1,
  'admin': 1,
  'coordinador': 2,
  'instructor': 3,
  'aprendiz': 4,
  'apoyo': 5,
  'apoyo administrativo': 5,
  'consulta': 6,
};

// 🔥 Extraer el ID del rol de forma robusta
const obtenerRolId = (user) => {
  if (!user) return null;

  // 1. rol_id directo
  if (user.rol_id != null) {
    const n = Number(user.rol_id);
    if (!isNaN(n)) return n;
  }

  // 2. rol (número o nombre)
  if (user.rol != null) {
    const n = Number(user.rol);
    if (!isNaN(n)) return n;
    if (typeof user.rol === 'string') {
      const key = user.rol.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (ROL_NOMBRE_A_ID[key]) return ROL_NOMBRE_A_ID[key];
    }
  }

  // 3. rol_nombre
  if (user.rol_nombre) {
    const key = user.rol_nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (ROL_NOMBRE_A_ID[key]) return ROL_NOMBRE_A_ID[key];
  }

  return null;
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // ⏳ Mientras carga el usuario → spinner
  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando...</p>
      </div>
    );
  }

  // 🚪 No autenticado → login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 🎯 Obtener rol
  const rolId = obtenerRolId(user);

  // ⚠️ No se pudo determinar el rol → login
  if (rolId == null) {
    console.error('❌ No se pudo determinar el rol del usuario');
    return <Navigate to="/login" replace />;
  }

  // 🚫 Rol no permitido → redirigir a SU dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(rolId)) {
    const destino = ROLE_ROUTES[rolId] || '/login';
    return <Navigate to={destino} replace />;
  }

  // ✅ Todo OK
  return children;
};

export default ProtectedRoute;