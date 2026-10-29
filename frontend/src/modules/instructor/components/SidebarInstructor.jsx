// src/modules/instructor/components/SidebarInstructor.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../shared/components/Sidebar.css';

const SidebarInstructor = ({ setActivePage }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Detectar qué página está activa desde la URL
  const getActiveItem = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/fichas') && !path.includes('/ficha/')) return 'fichas';
    if (path.includes('/ficha/')) return 'fichas';
    if (path.includes('/empresas')) return 'empresas';
    if (path.includes('/charlas-programadas')) return 'charlas-programadas';
    if (path.includes('/historial-charlas')) return 'historial-charlas';
    if (path.includes('/seleccion-alternativa')) return 'seleccion-alternativa';
    if (path.includes('/momentos')) return 'momentos';
    if (path.includes('/bitacora')) return 'bitacora';
    if (path.includes('/certificaciones')) return 'certificaciones';
    if (path.includes('/reportes-finales')) return 'reportes-finales';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  // ✅ Navegar a la ruta específica
  const handleNavigation = (pageId, path) => {
    if (setActivePage) setActivePage(pageId);
    navigate(path);
  };

  const toggleSubmenu = (menuId, path) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
    navigate(path);
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-menu">
        <ul>
          <li 
            className={activeItem === 'dashboard' ? 'active' : ''} 
            onClick={() => handleNavigation('dashboard', '/instructor/dashboard')}
          >
            <i className="fas fa-home"></i> Dashboard
          </li>

          <li 
            className={activeItem === 'fichas' ? 'active' : ''} 
            onClick={() => handleNavigation('fichas', '/instructor/fichas')}
          >
            <i className="fas fa-layer-group"></i> Mis Fichas
          </li>

          <li 
            className={activeItem === 'empresas' ? 'active' : ''} 
            onClick={() => handleNavigation('empresas', '/instructor/empresas')}
          >
            <i className="fas fa-building"></i> Empresas
          </li>

          {/* CHARLAS */}
          <li 
            className={activeItem === 'charlas' ? 'active' : ''} 
            onClick={() => toggleSubmenu('charlas', '/instructor/charlas-programadas')}
          >
            <i className="fas fa-comments"></i> Charlas
            <i className={`fas fa-chevron-down menu-arrow ${openMenu === 'charlas' ? 'rotate' : ''}`}></i>
          </li>
          {openMenu === 'charlas' && (
            <ul className="submenu">
              <li className={activeItem === 'charlas-programadas' ? 'active' : ''} onClick={() => handleNavigation('charlas-programadas', '/instructor/charlas-programadas')}>Charlas programadas</li>
              <li className={activeItem === 'historial-charlas' ? 'active' : ''} onClick={() => handleNavigation('historial-charlas', '/instructor/historial-charlas')}>Historial de charlas</li>
            </ul>
          )}

          {/* ALTERNATIVA */}
          <li 
            className={activeItem === 'alternativa' ? 'active' : ''} 
            onClick={() => toggleSubmenu('alternativa', '/instructor/seleccion-alternativa')}
          >
            <i className="fas fa-exchange-alt"></i> Alternativa etapa productiva
            <i className={`fas fa-chevron-down menu-arrow ${openMenu === 'alternativa' ? 'rotate' : ''}`}></i>
          </li>
          {openMenu === 'alternativa' && (
            <ul className="submenu">
              <li className={activeItem === 'seleccion-alternativa' ? 'active' : ''} onClick={() => handleNavigation('seleccion-alternativa', '/instructor/seleccion-alternativa')}>Selección de alternativa</li>
            </ul>
          )}

          {/* SEGUIMIENTO */}
          <li 
            className={activeItem === 'seguimiento' ? 'active' : ''} 
            onClick={() => toggleSubmenu('seguimiento', '/instructor/momentos')}
          >
            <i className="fas fa-clipboard-list"></i> Seguimiento
            <i className={`fas fa-chevron-down menu-arrow ${openMenu === 'seguimiento' ? 'rotate' : ''}`}></i>
          </li>
          {openMenu === 'seguimiento' && (
            <ul className="submenu">
              <li className={activeItem === 'momentos' ? 'active' : ''} onClick={() => handleNavigation('momentos', '/instructor/momentos')}>Seguimiento por momentos</li>
              <li className={activeItem === 'bitacora' ? 'active' : ''} onClick={() => handleNavigation('bitacora', '/instructor/bitacora')}>Bitácora</li>
              <li className={activeItem === 'certificaciones' ? 'active' : ''} onClick={() => handleNavigation('certificaciones', '/instructor/certificaciones')}>Certificaciones</li>
            </ul>
          )}

          {/* REPORTES FINALES */}
          <li 
            className={activeItem === 'reportes-finales' ? 'active' : ''} 
            onClick={() => handleNavigation('reportes-finales', '/instructor/reportes-finales')}
          >
            <i className="fas fa-file-signature"></i> Reportes Finales
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SidebarInstructor;