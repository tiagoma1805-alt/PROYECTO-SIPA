// src/modules/shared/components/Breadcrumb.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = () => {
  const location = useLocation();
  const path = location.pathname;

  // ✅ DETECTAR EL ROL DESDE LA URL
  const getRole = () => {
    if (path.includes('/coordinador')) return 'coordinador';
    if (path.includes('/instructor')) return 'instructor';
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/aprendiz')) return 'aprendiz';
    return 'coordinador';
  };

  const role = getRole();

  // ✅ RUTA DE INICIO
  const getHomePath = () => {
    switch(role) {
      case 'coordinador': return '/coordinador';
      case 'instructor': return '/instructor/dashboard';
      case 'admin': return '/admin';
      case 'aprendiz': return '/aprendiz';
      default: return '/coordinador';
    }
  };

  const homePath = getHomePath();

  // ✅ OBTENER EL NOMBRE DE LA PÁGINA ACTUAL
  const getPageName = () => {
    // --- INSTRUCTOR ---
    if (role === 'instructor') {
      if (path === '/instructor' || path === '/instructor/' || path === '/instructor/dashboard') {
        return 'Dashboard';
      }
      if (path.includes('/fichas') && !path.includes('/ficha/')) return 'Mis Fichas';
      if (path.includes('/ficha/')) return 'Detalle Ficha';
      if (path.includes('/empresas')) return 'Empresas';
      if (path.includes('/charlas-programadas')) return 'Charlas Programadas';
      if (path.includes('/historial-charlas')) return 'Historial de Charlas';
      if (path.includes('/charla/')) return 'Editar Charla';
      if (path.includes('/seleccion-alternativa')) return 'Alternativa etapa productiva';
      if (path.includes('/momentos')) return 'Seguimiento por Momentos';
      if (path.includes('/bitacora')) return 'Bitácora';
      if (path.includes('/certificaciones')) return 'Certificaciones';
      if (path.includes('/reportes-finales')) return 'Reportes Finales';
      if (path.includes('/mi-perfil')) return 'Mi Perfil';
    }

    // --- COORDINADOR ---
    if (role === 'coordinador') {
      if (path === '/coordinador' || path === '/coordinador/') return 'Dashboard';
      if (path.includes('/parametrizacion')) return 'Parametrización';
      if (path.includes('/fichas') && !path.includes('/ficha-completa')) return 'Centro de Fichas';
      if (path.includes('/ficha-completa/')) return 'Detalle Ficha';
      if (path.includes('/certificados')) return 'Certificados';
      if (path.includes('/reportes') && !path.includes('/reporte-bitacoras')) return 'Reportes Globales';
      if (path.includes('/reportes/ficha/')) return 'Detalle Reporte';
      if (path.includes('/reporte-bitacoras') && !path.includes('/ficha/') && !path.includes('/aprendiz/')) return 'Reporte de Bitácoras';
      if (path.includes('/reporte-bitacoras/ficha/')) return 'Bitácoras por Ficha';
      if (path.includes('/reporte-bitacoras/aprendiz/')) return 'Bitácoras del Aprendiz';
      if (path.includes('/empresas')) return 'Empresas Globales';
      if (path.includes('/aprendices') && !path.includes('/aprendices/')) return 'Aprendices Globales';
      if (path.includes('/aprendices/')) return 'Detalle Aprendiz';
      if (path.includes('/instructores') && !path.includes('/instructores/')) return 'Instructores Globales';
      if (path.includes('/instructores/') && path.includes('/asignar')) return 'Asignar Fichas';
      if (path.includes('/subir-alternativa')) return 'Subir Alternativa de Etapa Productiva';
      if (path.includes('/momentos')) return 'Seguimiento por Momentos';
      if (path.includes('/mi-perfil')) return 'Mi Perfil';
    }

    // Fallback
    const segments = path.split('/').filter(p => p);
    const lastSegment = segments.length > 1 ? segments[segments.length - 1] : segments[0];
    if (lastSegment && !lastSegment.includes('-')) {
      return lastSegment.replace(/-/g, ' ').replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Página';
  };

  const pageName = getPageName();
  
  // ✅ SOLO ES HOME SI LA RUTA ES EL DASHBOARD
  const isHome = path === '/instructor' || path === '/instructor/' || path === '/instructor/dashboard';

  if (isHome) {
    return (
      <nav className="breadcrumb">
        <span className="breadcrumb-active" style={{ color: '#3ca203' }}>Inicio</span>
      </nav>
    );
  }

  // ✅ CONSTRUIR MIGAS DE PAN
  const getBreadcrumbs = () => {
    const crumbs = [];
    
    crumbs.push({
      label: 'Inicio',
      path: '/instructor/dashboard',
      isActive: false
    });

    const segments = path.split('/').filter(p => p);
    if (segments.length >= 3) {
      const parentPath = '/' + segments.slice(0, 2).join('/');
      const parentName = getParentPageName(parentPath);
      if (parentName && parentName !== pageName) {
        crumbs.push({
          label: parentName,
          path: parentPath,
          isActive: false
        });
      }
    }

    crumbs.push({
      label: pageName,
      path: path,
      isActive: true
    });

    return crumbs;
  };

  const getParentPageName = (parentPath) => {
    const parents = {
      '/instructor/fichas': 'Mis Fichas',
      '/instructor/charlas-programadas': 'Charlas Programadas',
      '/instructor/seleccion-alternativa': 'Alternativa etapa productiva',
      '/instructor/momentos': 'Seguimiento por Momentos',
      '/instructor/bitacora': 'Bitácora',
      '/instructor/certificaciones': 'Certificaciones',
      '/instructor/reportes-finales': 'Reportes Finales',
      '/instructor/empresas': 'Empresas',
      '/coordinador/aprendices': 'Aprendices Globales',
      '/coordinador/fichas': 'Centro de Fichas',
      '/coordinador/subir-alternativa': 'Subir Alternativa de Etapa Productiva',
      '/coordinador/reporte-bitacoras': 'Reporte de Bitácoras',
      '/coordinador/reportes': 'Reportes Globales',
      '/coordinador/empresas': 'Empresas Globales',
      '/coordinador/instructores': 'Instructores Globales',
      '/coordinador/momentos': 'Seguimiento por Momentos',
      '/coordinador/parametrizacion': 'Parametrización',
      '/coordinador/certificados': 'Certificados',
    };
    return parents[parentPath] || null;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="breadcrumb" aria-label="Migas de pan">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.isActive ? (
              <span className="breadcrumb-active">{item.label}</span>
            ) : (
              <Link to={item.path} style={{ color: '#3ca203' }}>
                {item.label}
              </Link>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="breadcrumb-separator"> &gt; </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;