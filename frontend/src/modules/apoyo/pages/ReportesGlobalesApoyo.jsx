// src/pages/apoyo/ReportesGlobalesApoyo.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ReportesGlobalesApoyo.css';

const ReportesGlobalesApoyo = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const goToInicio = () => {
    navigate('/apoyo');
    window.location.reload();
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const rolesData = [
    { rol: 'Instructores', cantidad: 8 },
    { rol: 'Coordinadores', cantidad: 3 },
    { rol: 'Aprendices', cantidad: 245 },
    { rol: 'Admins', cantidad: 2 }
  ];

  const filteredRoles = rolesData.filter(r =>
    r.rol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const evolucionData = [
    { mes: 'Enero', valor: 120 },
    { mes: 'Febrero', valor: 145 },
    { mes: 'Marzo', valor: 180 },
    { mes: 'Abril', valor: 210 },
    { mes: 'Mayo', valor: 245 },
    { mes: 'Junio', valor: 265 }
  ];

  return (
    <div className="reportes-apoyo-container">
      {/* MIGA DE PAN */}
      <nav className="breadcrumb-apoyo">
        <ol>
          <li>
            <Link to="/apoyo" className="breadcrumb-link-apoyo">
              <i className="fas fa-home"></i> Inicio
            </Link>
            <span className="separator"> &gt; </span>
          </li>
          <li>
            <Link to="/apoyo/dashboard" className="breadcrumb-link-apoyo">
              <i className="fas fa-th-large"></i> Dashboard
            </Link>
            <span className="separator"> &gt; </span>
          </li>
          <li className="active-apoyo">
            <i className="fas fa-chart-bar"></i> Reportes Globales
          </li>
        </ol>
      </nav>

      {/* ENCABEZADO */}
      <div className="reportes-apoyo-header">
        <div>
          <h2>Reportes Globales - Consulta</h2>
          <p className="subtitulo-apoyo">Visualización de métricas del sistema. (Solo consulta)</p>
          <span className="badge-consulta-apoyo">
            <i className="fas fa-eye"></i> Modo consulta - Solo lectura
          </span>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="stats-grid-apoyo">
        <div className="stat-card-apoyo">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">5</span>
            <span className="stat-label">Nuevos Usuarios</span>
            <span className="stat-period">en el último mes</span>
          </div>
        </div>
        <div className="stat-card-apoyo">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
            <i className="fas fa-folder-plus"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">2</span>
            <span className="stat-label">Nuevas Fichas</span>
            <span className="stat-period">en el último mes</span>
          </div>
        </div>
        <div className="stat-card-apoyo">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">4</span>
            <span className="stat-label">Instructores Activos</span>
            <span className="stat-period">gestionando fichas</span>
          </div>
        </div>
        <div className="stat-card-apoyo">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">245</span>
            <span className="stat-label">Total Aprendices</span>
            <span className="stat-period">matriculados en el sistema</span>
          </div>
        </div>
      </div>

      {/* EVOLUCIÓN DE USUARIOS */}
      <div className="table-wrapper-apoyo">
        <h3 className="table-title">Evolución de Usuarios</h3>
        <table className="evolucion-table">
          <thead>
            <tr>
              <th>Mes</th>
              {evolucionData.map((item) => (
                <th key={item.mes}>{item.mes}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Usuarios</strong></td>
              {evolucionData.map((item) => (
                <td key={item.mes}>{item.valor}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* DISTRIBUCIÓN DE ROLES */}
      <div className="table-wrapper-apoyo">
        <h3 className="table-title">Distribución de Roles</h3>
        <div className="search-container-apoyo" style={{ marginBottom: '15px' }}>
          <input
            type="text"
            className="search-input-apoyo"
            placeholder="Buscar rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-search-apoyo" onClick={handleSearch}>
            <i className="fas fa-search"></i> Buscar
          </button>
          <button className="btn-clear-apoyo" onClick={handleClear}>
            <i className="fas fa-times"></i> Limpiar
          </button>
        </div>
        <table className="roles-table">
          <thead>
            <tr>
              <th>Rol</th>
              <th style={{ textAlign: 'center' }}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>
                  No se encontraron roles
                </td>
              </tr>
            ) : (
              filteredRoles.map((item, index) => (
                <tr key={index}>
                  <td>{item.rol}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="rol-cantidad">{item.cantidad}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesGlobalesApoyo;
