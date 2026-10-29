// src/modules/admin/components/SidebarAdmin.jsx
import React from 'react';
import '../../instructor/components/Sidebar.css';

const SidebarAdmin = ({ onNavigate, activePage }) => {
  return (
    <nav className="sidebar">
      <div className="sidebar-menu">
        <ul>
          {/* 1. Panel Global */}
          <li 
            className={activePage === 'dashboard' ? 'active' : ''} 
            onClick={() => onNavigate('/admin/', 'dashboard')}
          >
            <i className="fas fa-chart-pie"></i> Panel Global
          </li>

          {/* 2. Gestión de Usuarios */}
          <li 
            className={activePage === 'usuarios' ? 'active' : ''} 
            onClick={() => onNavigate('/admin/usuarios', 'usuarios')}
          >
            <i className="fas fa-users-cog"></i> Gestión de Usuarios
          </li>

          {/* 3. Gestión de Fichas */}
          <li 
            className={activePage === 'fichas' ? 'active' : ''} 
            onClick={() => onNavigate('/admin/fichas', 'fichas')}
          >
            <i className="fas fa-layer-group"></i> Gestión de Fichas
          </li>

          {/* 4. Reportes Globales */}
          <li 
            className={activePage === 'reportes' ? 'active' : ''} 
            onClick={() => onNavigate('/admin/reportes', 'reportes')}
          >
            <i className="fas fa-chart-bar"></i> Reportes Globales
          </li>

          {/* 🔥 5. Soportes (NUEVO) */}
          <li 
            className={activePage === 'soportes' ? 'active' : ''} 
            onClick={() => onNavigate('/admin/soportes', 'soportes')}
          >
            <i className="fas fa-headset"></i> Soportes
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SidebarAdmin;