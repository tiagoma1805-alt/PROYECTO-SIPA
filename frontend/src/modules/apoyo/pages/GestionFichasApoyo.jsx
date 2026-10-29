// src/pages/apoyo/GestionFichasApoyo.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GestionFichasApoyo.css';

const GestionFichasApoyo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [fichas] = useState([
    { id: 1, codigo: '2875901', programa: 'Análisis y Desarrollo de Software', nivel: 'Tecnólogo', aprendices: 28, estado: 'Activa' },
    { id: 2, codigo: '2875902', programa: 'Gestión Empresarial', nivel: 'Tecnólogo', aprendices: 24, estado: 'Activa' },
    { id: 3, codigo: '2875903', programa: 'Contabilidad y Finanzas', nivel: 'Técnico', aprendices: 32, estado: 'Inactiva' },
    { id: 4, codigo: '2875904', programa: 'Desarrollo Web', nivel: 'Tecnólogo', aprendices: 20, estado: 'Activa' }
  ]);

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const filteredFichas = fichas.filter(f =>
    f.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.programa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="gestion-fichas-apoyo-container">
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
            <i className="fas fa-folder-open"></i> Gestión de Fichas
          </li>
        </ol>
      </nav>

      {/* ENCABEZADO */}
      <div className="fichas-apoyo-header">
        <div>
          <h2>Gestión de Fichas</h2>
          <p className="subtitulo-apoyo">Administra todas las fichas de formación del sistema.</p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="search-container-apoyo">
        <input
          type="text"
          className="search-input-apoyo"
          placeholder="Buscar por código o programa..."
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
        <table className="fichas-table-apoyo">
          <thead>
            <tr>
              <th>Código</th>
              <th>Programa</th>
              <th>Nivel</th>
              <th style={{ textAlign: 'center' }}>Aprendices</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredFichas.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-exclamation-circle" style={{ color: '#dc2626', fontSize: '24px' }}></i>
                  <h3 style={{ color: '#dc2626', margin: '10px 0 5px 0' }}>Dato no encontrado</h3>
                  <p style={{ color: '#6b7280' }}>No se encontraron fichas con ese criterio.</p>
                </td>
              </tr>
            ) : (
              filteredFichas.map((ficha) => (
                <tr key={ficha.id}>
                  <td className="ficha-codigo-apoyo">{ficha.codigo}</td>
                  <td>{ficha.programa}</td>
                  <td>
                    <span className={`nivel-badge-apoyo ${ficha.nivel.toLowerCase()}`}>
                      {ficha.nivel}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="aprendices-count-apoyo">{ficha.aprendices}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span 
                      className={`estado-badge-apoyo ${ficha.estado.toLowerCase()}`}
                      style={{ 
                        background: ficha.estado === 'Activa' ? '#d1fae5' : '#fef2f2',
                        color: ficha.estado === 'Activa' ? '#065f46' : '#dc2626'
                      }}
                    >
                      <i className={`fas ${ficha.estado === 'Activa' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      {ficha.estado}
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
          <i className="fas fa-folder-open"></i>
          <span>Total fichas: <strong>{fichas.length}</strong></span>
        </div>
        <div className="info-card-apoyo">
          <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
          <span>Activas: <strong style={{ color: '#10b981' }}>{fichas.filter(f => f.estado === 'Activa').length}</strong></span>
        </div>
        <div className="info-card-apoyo">
          <i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i>
          <span>Inactivas: <strong style={{ color: '#ef4444' }}>{fichas.filter(f => f.estado === 'Inactiva').length}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default GestionFichasApoyo;
