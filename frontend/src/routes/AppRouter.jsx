// src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import ProtectedRoute from './ProtectedRoute';
import { roleRoutes } from './roleRoutes';

// Páginas públicas
import Landing from '@/modules/auth/pages/Landing';
import Login from '@/modules/auth/pages/Login';
import Register from '@/modules/auth/pages/Register';
import RecuperarContrasena from '@/modules/auth/pages/RecuperarContrasena';
import VerificacionCodigo from '@/modules/auth/pages/VerificacionCodigo';
import CambiarContrasena from '@/modules/auth/pages/CambiarContrasena';

const Unauthorized = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Acceso Denegado</h1>
    <p>No tienes permisos para ver esta página.</p>
    <button onClick={() => window.location.href = '/'}>Volver al inicio</button>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recuperar" element={<RecuperarContrasena />} />
            <Route path="/verificar" element={<VerificacionCodigo />} />
            <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {roleRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute allowedRoles={route.roles}>
                    {route.element}
                  </ProtectedRoute>
                }
              />
            ))}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default AppRouter;