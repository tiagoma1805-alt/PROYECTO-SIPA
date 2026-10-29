// src/modules/coordinador/components/SidebarCoordinador.jsx
import React from 'react';
import '../../instructor/components/Sidebar.css';

const SidebarCoordinador = ({ onNavigate, activePage }) => {
  return (
    <nav className="sidebar">
      <div className="sidebar-menu">
        <ul>
          {/* 1. Dashboard */}
          <li 
            className={activePage === 'dashboard' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador', 'dashboard')}
          >
            <i className="fas fa-home"></i> Dashboard
          </li>

          {/* 2. Parametrización */}
          <li 
            className={activePage === 'parametrizacion' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/parametrizacion', 'parametrizacion')}
          >
            <i className="fas fa-cog"></i> Parametrización
          </li>

          {/* 3. Centro de Fichas */}
          <li 
            className={activePage === 'fichas' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/fichas', 'fichas')}
          >
            <i className="fas fa-layer-group"></i> Centro de Fichas
          </li>

          {/* 4. Cartas de Presentación */}
          <li 
            className={activePage === 'cartas-presentacion' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/cartas-presentacion', 'cartas-presentacion')}
          >
            <i className="fas fa-envelope-open-text"></i> Cartas de Presentación
          </li>

          {/* 5. Reportes */}
          <li 
            className={activePage === 'reportes' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/reportes', 'reportes')}
          >
            <i className="fas fa-chart-line"></i> Reportes
          </li>

          {/* 6. Bitácoras */}
          <li 
            className={activePage === 'reporte-bitacoras' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/reporte-bitacoras', 'reporte-bitacoras')}
          >
            <i className="fas fa-book"></i> Bitácoras
          </li>

          {/* 7. Momentos */}
          <li 
            className={activePage === 'momentos' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/momentos', 'momentos')}
          >
            <i className="fas fa-clock"></i> Momentos
          </li>

          {/* 8. Centros de Formación */}
          <li 
            className={activePage === 'centros-formacion' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/centros-formacion', 'centros-formacion')}
          >
            <i className="fas fa-university"></i> Centros de Formación
          </li>

          {/* 9. Empresas */}
          <li 
            className={activePage === 'empresas' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/empresas', 'empresas')}
          >
            <i className="fas fa-building"></i> Empresas
          </li>

          {/* 10. Aprendices */}
          <li 
            className={activePage === 'aprendices' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/aprendices', 'aprendices')}
          >
            <i className="fas fa-users"></i> Aprendices
          </li>

          {/* 11. Instructores */}
          <li 
            className={activePage === 'instructores' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/instructores', 'instructores')}
          >
            <i className="fas fa-user-tie"></i> Instructores
          </li>

          {/* 12. Instructores EP */}
          <li 
            className={activePage === 'instructores-ep' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/instructores-ep', 'instructores-ep')}
          >
            <i className="fas fa-user-graduate"></i> Instructores EP
          </li>

          {/* 13. Subir Alternativa */}
          <li 
            className={activePage === 'subir-alternativa' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/subir-alternativa', 'subir-alternativa')}
          >
            <i className="fas fa-exchange-alt"></i> Subir Alternativa
          </li>

          {/* 🔥 14. Soportes (NUEVO) */}
          <li 
            className={activePage === 'soportes' ? 'active' : ''} 
            onClick={() => onNavigate('/coordinador/soportes', 'soportes')}
          >
            <i className="fas fa-headset"></i> Soportes
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SidebarCoordinador;