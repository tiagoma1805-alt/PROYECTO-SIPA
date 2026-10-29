// src/modules/aprendiz/components/SidebarAprendiz.jsx
import React from 'react';
import '../../instructor/components/Sidebar.css';

const SidebarAprendiz = ({ setActivePage, activePage }) => {
  return (
    <nav className="sidebar">
      <div className="sidebar-menu">
        <ul>
          <li 
            className={activePage === 'dashboard' ? 'active' : ''} 
            onClick={() => setActivePage('dashboard')}
          >
            <i className="fas fa-home"></i> Mi Proceso
          </li>
          <li 
            className={activePage === 'momentos' ? 'active' : ''} 
            onClick={() => setActivePage('momentos')}
          >
            <i className="fas fa-clock"></i> Mis Momentos
          </li>
          <li 
            className={activePage === 'bitacoras' ? 'active' : ''} 
            onClick={() => setActivePage('bitacoras')}
          >
            <i className="fas fa-book"></i> Mis Bitácoras
          </li>

          {/* 🔥 CAMBIO: Certificados → Mis Cartas de Presentación */}
          <li 
            className={activePage === 'cartas-presentacion' ? 'active' : ''} 
            onClick={() => setActivePage('cartas-presentacion')}
          >
            <i className="fas fa-envelope-open-text"></i> Mis Cartas de Presentación
          </li>

          {/* NOVEDADES */}
          <li 
            className={activePage === 'novedades' ? 'active' : ''} 
            onClick={() => setActivePage('novedades')}
          >
            <i className="fas fa-exclamation-circle"></i> Novedades
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SidebarAprendiz;