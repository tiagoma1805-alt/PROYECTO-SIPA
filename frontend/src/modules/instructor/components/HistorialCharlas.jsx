// src/modules/instructor/components/HistorialCharlas.jsx
import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';
import './HistorialCharlas.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const HistorialCharlas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [charlas, setCharlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [charlaSeleccionada, setCharlaSeleccionada] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor && instructor.id;
      if (!instructorId) throw new Error('No se encontro el instructor logueado');

      const data = await apiClient.get('/instructor/historial-charlas/' + instructorId);
      setCharlas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError(err.message || 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (iso) => {
    if (!iso) return '--';
    const d = new Date(iso);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return dia + '/' + mes + '/' + anio;
  };

  const filteredCharlas = charlas.filter((c) =>
    (c.tema || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const handleVerDetalles = async (charla) => {
    setCharlaSeleccionada(charla);
    setModalAbierto(true);
    setCargandoEvidencias(true);
    try {
      const evs = await apiClient.get('/instructor/charlas/' + charla.id + '/evidencias');
      setEvidencias(Array.isArray(evs) ? evs : []);
    } catch (err) {
      console.error('Error al cargar evidencias:', err);
      setEvidencias([]);
    } finally {
      setCargandoEvidencias(false);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCharlaSeleccionada(null);
    setEvidencias([]);
  };

  const abrirArchivo = (ev) => {
    const url = API_BASE + ev.ruta_archivo;
    window.open(url, '_blank');
  };

  const evidenciasPorTipo = (tipo) => evidencias.filter((e) => e.tipo === tipo);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarHistorial} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          Reintentar
        </button>
      </div>
    );
  }

  const secciones = [
    { tipo: 'SOPORTE', titulo: 'Soportes subidos', icono: 'fa-paperclip' },
    { tipo: 'LISTADO', titulo: 'Listados subidos', icono: 'fa-list' },
    { tipo: 'FOTO', titulo: 'Fotos subidas', icono: 'fa-image' },
  ];

  return (
    <div className="historial-container">
      <Breadcrumb />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Historial de Charlas</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Buscar por tema de la charla..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Buscar</button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        {filteredCharlas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#6b7280' }}>Sin charlas en el historial</h3>
            <p style={{ color: '#9ca3af' }}>{searchQuery ? 'No existe ninguna charla con ese tema.' : 'Aun no tienes charlas pasadas.'}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '14px 12px', color: '#6b7280', fontWeight: '600' }}>Tema</th>
                <th style={{ textAlign: 'left', padding: '14px 12px', color: '#6b7280', fontWeight: '600' }}>Fecha</th>
                <th style={{ textAlign: 'left', padding: '14px 12px', color: '#6b7280', fontWeight: '600' }}>Instructor</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', color: '#6b7280', fontWeight: '600' }}>Asistencia</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', color: '#6b7280', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharlas.map((charla) => (
                <tr key={charla.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 12px', fontWeight: '500' }}>{charla.tema || '--'}</td>
                  <td style={{ padding: '16px 12px', color: '#6b7280' }}>{formatearFecha(charla.fecha_programada)}</td>
                  <td style={{ padding: '16px 12px', color: '#6b7280' }}>{charla.instructor_nombre || '--'}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'center', color: '#6b7280' }}>{charla.asistencias_count || 0}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleVerDetalles(charla)}
                      style={{ background: '#3ca203', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fas fa-eye" /> Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && charlaSeleccionada && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={cerrarModal}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '700px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{charlaSeleccionada.tema}</h3>
              <button onClick={cerrarModal} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>x</button>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span><i className="fas fa-calendar" style={{ color: '#3ca203', marginRight: '6px' }} />{formatearFecha(charlaSeleccionada.fecha_programada)}</span>
              <span><i className="fas fa-user" style={{ color: '#3ca203', marginRight: '6px' }} />{charlaSeleccionada.instructor_nombre}</span>
              <span><i className="fas fa-users" style={{ color: '#3ca203', marginRight: '6px' }} />{charlaSeleccionada.asistencias_count || 0} asistentes</span>
            </div>

            {cargandoEvidencias ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#3ca203' }}></i>
                <p>Cargando archivos...</p>
              </div>
            ) : (
              <>
                {secciones.map((sec) => {
                  const items = evidenciasPorTipo(sec.tipo);
                  return (
                    <div key={sec.tipo} style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={'fas ' + sec.icono} style={{ color: '#3ca203' }} />
                        {sec.titulo}
                      </h4>
                      {items.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '24px' }}>Sin archivos</p>
                      ) : (
                        <div style={{ marginLeft: '24px' }}>
                          {items.map((ev) => (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                              <i className="fas fa-file-pdf" style={{ color: '#dc2626' }} />
                              <span
                                onClick={() => abrirArchivo(ev)}
                                style={{ flex: 1, color: '#0369a1', cursor: 'pointer', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {ev.nombre_archivo}
                              </span>
                              <i className="fas fa-eye" style={{ color: '#3ca203', cursor: 'pointer' }} onClick={() => abrirArchivo(ev)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div style={{ marginTop: '20px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-info-circle" style={{ color: '#3ca203' }} />
                  Haz clic en cualquier archivo para ver su contenido.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialCharlas;