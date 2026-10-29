// src/modules/shared/layouts/LayoutApoyo.jsx
import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/modules/shared/components/Header';
import SidebarApoyo from '@/modules/apoyo/components/SidebarApoyo';
import '../../../App.css';

// Importar páginas del apoyo usando el alias @
import DashboardApoyo from "@/modules/apoyo/pages/DashboardApoyo";
import GestionUsuariosApoyo from "@/modules/apoyo/pages/GestionUsuariosApoyo";
import GestionFichasApoyo from "@/modules/apoyo/pages/GestionFichasApoyo";
import ReportesGlobalesApoyo from "@/modules/apoyo/pages/ReportesGlobalesApoyo";
import MiPerfil from "@/modules/apoyo/pages/MiPerfil";

const LayoutApoyo = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (url) => {
    navigate(url);
  };

  // Determinar qué página está activa basado en la URL
  const pathname = location.pathname;
  let activePage = 'dashboard';
  
  if (pathname.includes('/gestion-usuarios') || pathname.includes('/usuarios')) {
    activePage = 'usuarios';
  } else if (pathname.includes('/gestion-fichas') || pathname.includes('/fichas')) {
    activePage = 'fichas';
  } else if (pathname.includes('/reportes')) {
    activePage = 'reportes';
  } else if (pathname === '/apoyo' || pathname === '/apoyo/' || pathname.includes('/dashboard')) {
    activePage = 'dashboard';
  }

  return (
    <div className="app-layout">
      {/* 👇 DATOS ESPECÍFICOS DEL ROL APOYO + NOTIFICACIONES */}
      <Header 
        user={{ nombre: 'Lia Vasquez', role: 'Apoyo', avatar: 'https://i.pravatar.cc/150?img=47' }}
        notifications={[
          { id: 1, mensaje: 'Solicitud de consulta recibida', tiempo: 'Hoy, 10:00 a.m.' },
          { id: 2, mensaje: 'Reporte generado exitosamente', tiempo: 'Hoy, 08:45 a.m.' },
          { id: 3, mensaje: 'Usuario modificado', tiempo: 'Ayer, 04:20 p.m.' },
        ]}
      />
      <div className="main-body">
        <SidebarApoyo 
          onNavigate={handleNavigation} 
          activePage={activePage}
        />
        <div className="content-area" style={{ padding: '30px', boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/" element={<DashboardApoyo />} />
            <Route path="/dashboard" element={<DashboardApoyo />} />
            <Route path="/gestion-usuarios" element={<GestionUsuariosApoyo />} />
            <Route path="/usuarios" element={<GestionUsuariosApoyo />} />
            <Route path="/gestion-fichas" element={<GestionFichasApoyo />} />
            <Route path="/fichas" element={<GestionFichasApoyo />} />
            <Route path="/reportes" element={<ReportesGlobalesApoyo />} />
            {/* 👇 PASA LOS DATOS CORRECTOS AL PERFIL */}
            <Route path="/mi-perfil" element={<MiPerfil user={{ nombre: 'Lia Vasquez', role: 'Apoyo', avatar: 'https://i.pravatar.cc/150?img=47' }} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LayoutApoyo;
