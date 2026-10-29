// src/modules/shared/layouts/LayoutAdmin.jsx
import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import SidebarAdmin from '../../admin/components/SidebarAdmin';
import '../../../App.css';

// Páginas del Admin
import DashboardAdmin from '@/modules/admin/pages/DashboardAdmin';
import GestionUsuarios from '@/modules/admin/pages/GestionUsuarios';
import GestionFichas from '@/modules/admin/pages/GestionFichas';
import ReportesGlobales from '@/modules/admin/pages/ReportesGlobales';
import MiPerfil from '@/modules/admin/pages/MiPerfil';

// 🔥 Soportes (NUEVO) - compartida con coordinador
import Soportes from '@/modules/shared/pages/Novedades';

const LayoutAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (url) => {
    navigate(url);
  };

  let activePage = 'dashboard';
  if (location.pathname.includes('/usuarios')) activePage = 'usuarios';
  else if (location.pathname.includes('/fichas')) activePage = 'fichas';
  else if (location.pathname.includes('/reportes')) activePage = 'reportes';
  else if (location.pathname.includes('/soportes')) activePage = 'soportes'; // 🔥 NUEVO

  return (
    <div className="app-layout">
      <Header notifications={[]} />

      <div className="main-body">
        <SidebarAdmin
          onNavigate={handleNavigation}
          activePage={activePage}
        />
        <div className="content-area" style={{ padding: '30px', boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/" element={<DashboardAdmin />} />
            <Route path="/usuarios" element={<GestionUsuarios />} />
            <Route path="/fichas" element={<GestionFichas />} />
            <Route path="/reportes" element={<ReportesGlobales />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />

            {/* 🔥 Ruta de Soportes (NUEVO) */}
            <Route path="/soportes" element={<Soportes />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LayoutAdmin;