// src/modules/shared/layouts/LayoutAprendiz.jsx
import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from '@/modules/shared/components/Header';
import SidebarAprendiz from '@/modules/aprendiz/components/SidebarAprendiz';
import '../../../App.css';

// Páginas
import DashboardAprendiz from "@/modules/aprendiz/pages/DashboardAprendiz";
import MisMomentos from "@/modules/aprendiz/pages/MisMomentos";
import MisBitacoras from "@/modules/aprendiz/pages/MisBitacoras";
import MisCartasPresentacion from "@/modules/aprendiz/pages/MisCartasPresentacion";
import MiPerfil from "@/modules/aprendiz/pages/MiPerfil";
import Novedades from "@/modules/aprendiz/pages/Novedades";

const LayoutAprendiz = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar página activa según la URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('/mis-momentos')) return 'momentos';
    if (path.includes('/mis-bitacoras')) return 'bitacoras';
    if (path.includes('/mis-cartas-presentacion')) return 'cartas-presentacion';
    if (path.includes('/novedades')) return 'novedades';
    if (path.includes('/mi-perfil')) return 'perfil';
    return 'dashboard';
  };

  const handleSidebarClick = (pageId) => {
    const routes = {
      dashboard: '/aprendiz',
      momentos: '/aprendiz/mis-momentos',
      bitacoras: '/aprendiz/mis-bitacoras',
      'cartas-presentacion': '/aprendiz/mis-cartas-presentacion',
      novedades: '/aprendiz/novedades',
      perfil: '/aprendiz/mi-perfil',
    };
    navigate(routes[pageId] || '/aprendiz');
  };

  return (
    <div className="app-layout">
      <Header notifications={[]} />
      <div className="main-body">
        <SidebarAprendiz 
          setActivePage={handleSidebarClick} 
          activePage={getActivePage()}
        />
        <div className="content-area" style={{ width: '100%', padding: '30px', boxSizing: 'border-box', backgroundColor: '#f6f8fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<DashboardAprendiz user={user} />} />
              <Route path="/mis-momentos" element={<MisMomentos />} />
              <Route path="/mis-bitacoras" element={<MisBitacoras />} />
              <Route path="/mis-cartas-presentacion" element={<MisCartasPresentacion />} />
              <Route path="/novedades" element={<Novedades />} />
              <Route path="/mi-perfil" element={<MiPerfil />} />
              <Route path="*" element={<Navigate to="/aprendiz" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutAprendiz;