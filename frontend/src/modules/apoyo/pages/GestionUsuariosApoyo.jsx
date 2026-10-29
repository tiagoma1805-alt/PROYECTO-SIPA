// src/pages/apoyo/GestionUsuariosApoyo.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GestionUsuariosApoyo.css';

const GestionUsuariosApoyo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [usuarios] = useState([
    { id: 1, nombre: 'Carlos Andrés López', rol: 'Instructor', correo: 'carlos.lopez@soy.sena.edu.co', estado: 'Activo' },
    { id: 2, nombre: 'María Fernanda Ruiz', rol: 'Coordinador', correo: 'maria.ruiz@soy.sena.edu.co', estado: 'Activo' },
    { id: 3, nombre: 'Andrés Felipe Castro', rol: 'Aprendiz', correo: 'andres.castro@soy.sena.edu.co', estado: 'Activo' },
    { id: 4, nombre: 'Laura Sofia Martínez', rol: 'Aprendiz', correo: 'laura.martinez@soy.sena.edu.co', estado: 'Activo' },
    { id: 5, nombre: 'Juan Diego Ramirez', rol: 'Instructor', correo: 'juan.ramirez@soy.sena.edu.co', estado: 'Inactivo' }
  ]);

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const filteredUsuarios = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.rol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorEstado = (estado) => {
    if (estado === 'Activo') return '#10b981';
    return '#ef4444';
  };

  return (
    <div className="gestion-usuarios-apoyo-container">
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
            <i className="fas fa-users"></i> Gestión de Usuarios
          </li>
        </ol>
      </nav>

      {/* ENCABEZADO */}
      <div className="usuarios-apoyo-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="subtitulo-apoyo">Administra los usuarios del sistema.</p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="search-container-apoyo">
        <input
          type="text"
          className="search-input-apoyo"
          placeholder="Buscar por nombre, rol o correo..."
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

      {/* TABLA */}
      <div className="table-wrapper-apoyo">
        <table className="usuarios-table-apoyo">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Correo institucional</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-exclamation-circle" style={{ color: '#dc2626', fontSize: '24px' }}></i>
                  <h3 style={{ color: '#dc2626', margin: '10px 0 5px 0' }}>Dato no encontrado</h3>
                  <p style={{ color: '#6b7280' }}>No se encontraron usuarios con ese criterio.</p>
                </td>
              </tr>
            ) : (
              filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="usuario-nombre-apoyo">{usuario.nombre}</td>
                  <td>
                    <span className={`rol-badge-apoyo ${usuario.rol.toLowerCase()}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>{usuario.correo}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span 
                      className={`estado-badge-apoyo ${usuario.estado.toLowerCase()}`}
                      style={{ 
                        background: `${getColorEstado(usuario.estado)}15`, 
                        color: getColorEstado(usuario.estado) 
                      }}
                    >
                      <i className={`fas ${usuario.estado === 'Activo' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      {usuario.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PIE DE PÁGINA */}
      <div className="footer-info-apoyo">
        <div className="info-card-apoyo">
          <i className="fas fa-users"></i>
          <span>Total usuarios: <strong>{usuarios.length}</strong></span>
        </div>
        <div className="info-card-apoyo">
          <i className="fas fa-user-check"></i>
          <span>Activos: <strong style={{ color: '#10b981' }}>{usuarios.filter(u => u.estado === 'Activo').length}</strong></span>
        </div>
        <div className="info-card-apoyo">
          <i className="fas fa-user-times"></i>
          <span>Inactivos: <strong style={{ color: '#ef4444' }}>{usuarios.filter(u => u.estado === 'Inactivo').length}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuariosApoyo;
