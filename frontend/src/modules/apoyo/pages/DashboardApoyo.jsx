// src/pages/apoyo/DashboardApoyo.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './DashboardApoyo.css';

const DashboardApoyo = () => {
  const navigate = useNavigate();

  const stats = [
    { id: 1, titulo: 'Usuarios Totales', valor: '24', icono: 'fa-users', color: '#3ca203', bgColor: '#e6f7ed' },
    { id: 2, titulo: 'Fichas Activas', valor: '12', icono: 'fa-folder-open', color: '#0ea5e9', bgColor: '#e0f2fe' },
    { id: 3, titulo: 'Roles Activos', valor: '4', icono: 'fa-user-tag', color: '#f59e0b', bgColor: '#fef3c7' },
    { id: 4, titulo: 'Solicitudes Pendientes', valor: '15', icono: 'fa-clock', color: '#ef4444', bgColor: '#fee2e2' },
  ];

  const ultimosUsuarios = [
    { nombre: 'Carlos Andrés López', rol: 'Instructor' },
    { nombre: 'María Fernanda Ruiz', rol: 'Coordinador' },
    { nombre: 'Andrés Felipe Castro', rol: 'Aprendiz' },
    { nombre: 'Laura Sofia Martínez', rol: 'Aprendiz' },
  ];

  const actividades = [
    { id: 1, descripcion: 'Nuevo usuario registrado por Admin', tiempo: 'Hoy, 10:30 a.m.' },
    { id: 2, descripcion: 'Ficha 2875901 actualizada por Coordinador', tiempo: 'Hoy, 09:15 a.m.' },
    { id: 3, descripcion: 'Certificado masivo descargado por Coordinador', tiempo: 'Ayer, 05:00 p.m.' },
    { id: 4, descripcion: 'Instructor Carlos A. asignado a ficha por Admin', tiempo: 'Ayer, 02:45 p.m.' },
  ];

  return (
    <div className="dashboard-apoyo-container">
      {/* MIGA DE PAN */}
      <nav className="breadcrumb-apoyo">
        <ol>
          <li>
            <Link to="/apoyo" className="breadcrumb-link-apoyo">
              <i className="fas fa-home"></i> Inicio
            </Link>
            <span className="separator"> &gt; </span>
          </li>
          <li className="active-apoyo">
            <i className="fas fa-th-large"></i> Dashboard
          </li>
        </ol>
      </nav>

      {/* ENCABEZADO */}
      <div className="dashboard-apoyo-header">
        <div>
          <h2>Panel de Control - Apoyo Administrativo</h2>
          <p className="subtitulo-apoyo">
            Gestión centralizada de usuarios, fichas y configuración del sistema. <strong>(Solo consulta)</strong>
          </p>
          <span className="badge-consulta-apoyo">
            <i className="fas fa-eye"></i> Modo consulta - Solo lectura
          </span>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="stats-grid-apoyo">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card-apoyo">
            <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
              <i className={`fas ${stat.icono}`}></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stat.valor}</span>
              <span className="stat-label">{stat.titulo}</span>
            </div>
          </div>
        ))}
      </div>

      {/* GRID: ÚLTIMOS USUARIOS + ACTIVIDAD RECIENTE */}
      <div className="dashboard-grid-apoyo">
        {/* Últimos Usuarios */}
        <div className="card-apoyo">
          <h3 className="card-title">
            <i className="fas fa-users" style={{ color: '#3ca203' }}></i> Últimos usuarios
          </h3>
          <div className="usuarios-list">
            <div className="usuarios-header-list">
              <span>Nombre</span>
              <span>Rol</span>
            </div>
            {ultimosUsuarios.map((usuario, index) => (
              <div key={index} className="usuario-item-list">
                <span className="usuario-nombre-list">{usuario.nombre}</span>
                <span className={`usuario-rol-list ${usuario.rol.toLowerCase()}`}>
                  {usuario.rol}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="card-apoyo">
          <h3 className="card-title">
            <i className="fas fa-clock" style={{ color: '#3ca203' }}></i> Actividad Reciente
          </h3>
          <div className="actividad-list">
            {actividades.map((actividad) => (
              <div key={actividad.id} className="actividad-item">
                <div className="actividad-dot"></div>
                <div>
                  <p className="actividad-descripcion">{actividad.descripcion}</p>
                  <span className="actividad-tiempo">
                    <i className="fas fa-clock"></i> {actividad.tiempo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PIE DE PÁGINA */}
      <div className="footer-info-apoyo">
        <div className="info-card-apoyo">
          <i className="fas fa-info-circle"></i>
          <span>Visualizando datos en <strong>modo consulta</strong></span>
        </div>
        <div className="info-card-apoyo">
          <i className="fas fa-sync-alt"></i>
          <span>Última actualización: <strong>Hoy, 10:30 a.m.</strong></span>
        </div>
      </div>
    </div>
  );
};

export default DashboardApoyo;
