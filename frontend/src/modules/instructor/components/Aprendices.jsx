// src/modules/instructor/components/Aprendices.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiClient } from '@/core/api/client';
import './Aprendices.css';

const Aprendices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarAprendices();
  }, []);

  const cargarAprendices = async () => {
    try {
      setLoading(true);
      setError(null);

      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor?.id;

      if (!instructorId) throw new Error('No hay instructor logueado');

      // 1. Obtener asignaciones del instructor
      const asignaciones = await apiClient.get('/asignaciones', {
        params: { instructor_id: instructorId, solo_activas: true },
      });

      // 2. Por cada ficha, obtener sus aprendices
      const todosAprendices = [];
      for (const a of (Array.isArray(asignaciones) ? asignaciones : [])) {
        try {
          const lista = await apiClient.get(`/fichas/${a.ficha_id}/aprendices`);
          for (const ap of (Array.isArray(lista) ? lista : [])) {
            todosAprendices.push({
              aprendiz_id: ap.aprendiz_id,
              identificacion: ap.documento || ap.aprendiz_documento || '—',
              nombre: ap.nombre || ap.aprendiz_nombre || 'Sin nombre',
              ficha: ap.ficha_numero || '—',
              estado: ap.estado || 'Sin estado',
            });
          }
        } catch (err) {
          console.warn(`Error al cargar aprendices de ficha ${a.ficha_id}:`, err);
        }
      }

      console.log('👥 Aprendices:', todosAprendices);
      setAprendices(todosAprendices);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al cargar aprendices');
    } finally {
      setLoading(false);
    }
  };

  const filteredAprendices = aprendices.filter((item) =>
    (item.identificacion || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.ficha || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando aprendices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarAprendices} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          <i className="fas fa-redo" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="aprendices-container">
      <div className="aprendices-header">
        <h2>Mis Aprendices</h2>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por identificación, nombre o ficha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-search" onClick={handleSearch}>Buscar</button>
        <button className="btn-clear" onClick={handleClear}>Limpiar</button>
      </div>

      {filteredAprendices.length === 0 ? (
        <div className="not-found">
          <h2><i className="fas fa-exclamation-circle"></i> {searchQuery ? 'Dato no encontrado' : 'No tienes aprendices'}</h2>
          <p>{searchQuery ? 'No existe ningún aprendiz con los datos ingresados.' : 'Aún no tienes aprendices asignados.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre Completo</th>
                <th>Ficha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredAprendices.map((item, index) => (
                <tr key={index}>
                  <td className="codigo">{item.identificacion}</td>
                  <td>{item.nombre}</td>
                  <td>{item.ficha}</td>
                  <td>
                    <span className={`status-ficha ${item.estado === 'Activo' || item.estado === 'ACTIVO' ? 'status-activa' : 'status-inactiva'}`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Aprendices;
