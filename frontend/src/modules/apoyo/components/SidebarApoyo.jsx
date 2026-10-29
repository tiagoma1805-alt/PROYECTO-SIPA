// src/modules/apoyo/components/SidebarApoyo.jsx
import React from 'react';
import '../../instructor/components/Sidebar.css';

const SidebarApoyo = ({ onNavigate, activePage }) => {
  return (
    <nav className="sidebar">
      <div className="sidebar-menu">
        <ul>
          <li 
            className={activePage === 'dashboard' ? 'active' : ''} 
            onClick={() => onNavigate('/apoyo', 'dashboard')}
          >
            <i className="fas fa-home"></i> Dashboard
          </li>

          <li 
            className={activePage === 'usuarios' ? 'active' : ''} 
            onClick={() => onNavigate('/apoyo/usuarios', 'usuarios')}
          >
            <i className="fas fa-users"></i> Usuarios
          </li>

          <li 
            className={activePage === 'fichas' ? 'active' : ''} 
            onClick={() => onNavigate('/apoyo/fichas', 'fichas')}
          >
            <i className="fas fa-layer-group"></i> Fichas
          </li>

          <li 
            className={activePage === 'reportes' ? 'active' : ''} 
            onClick={() => onNavigate('/apoyo/reportes', 'reportes')}
          >
            <i className="fas fa-chart-line"></i> Reportes
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SidebarApoyo;
