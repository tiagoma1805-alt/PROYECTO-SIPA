// src/modules/coordinador/pages/InstructoresEP.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { instructoresEPService } from '@/core/services/instructoresEPService';
import './InstructoresEP.css';

const InstructoresEP = () => {
  const [instructores, setInstructores] = useState([]);
  const [stats, setStats] = useState({
    total_instructores: 0,
    total_aprendices: 0,
    total_fichas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandido, setExpandido] = useState(null);
  const [detalleCache, setDetalleCache] = useState({});
  const [cargandoDetalle, setCargandoDetalle] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarInstructores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const cargarDatos = async () => {
    try {
      const resStats = await instructoresEPService.getStats();
      setStats(resStats);
    } catch (err) {
      console.warn('No se pudieron cargar stats:', err);
    }
  };

  const cargarInstructores = async () => {
    try {
      setLoading(true);
      const res = await instructoresEPService.listar(searchQuery);
      setInstructores(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error al cargar instructores:', err);
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudieron cargar los instructores',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => setSearchQuery(searchTerm);
  const handleLimpiar = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const handleExpandir = async (instructor) => {
    if (expandido === instructor.id) {
      setExpandido(null);
      return;
    }
    if (detalleCache[instructor.id]) {
      setExpandido(instructor.id);
      return;
    }
    try {
      setCargandoDetalle(instructor.id);
      const detalle = await instructoresEPService.obtenerDetalle(instructor.id);
      setDetalleCache((prev) => ({ ...prev, [instructor.id]: detalle }));
      setExpandido(instructor.id);
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudo cargar el detalle',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setCargandoDetalle(null);
    }
  };

  const getIniciales = (nombre, apellido) => {
    const n = (nombre || '').charAt(0).toUpperCase();
    const a = (apellido || '').charAt(0).toUpperCase();
    return `${n}${a}`;
  };

  if (loading && instructores.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando instructores...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div className="iep-header">
        <div className="iep-header-titulo">
          <h2>
            <i className="fas fa-user-tie"></i>
            Instructores de Etapa Productiva
          </h2>
          <p>Instructores a cargo del seguimiento de aprendices en etapa productiva.</p>
        </div>
      </div>

      <div className="iep-stats-grid">
        <div className="iep-stat-card">
          <div className="iep-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <i className="fas fa-user-tie"></i>
          </div>
          <div className="iep-stat-info">
            <span className="iep-stat-numero">{stats.total_instructores}</span>
            <span className="iep-stat-label">Instructores activos</span>
          </div>
        </div>

        <div className="iep-stat-card">
          <div className="iep-stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="iep-stat-info">
            <span className="iep-stat-numero">{stats.total_aprendices}</span>
            <span className="iep-stat-label">Aprendices bajo seguimiento</span>
          </div>
        </div>

        <div className="iep-stat-card">
          <div className="iep-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="fas fa-layer-group"></i>
          </div>
          <div className="iep-stat-info">
            <span className="iep-stat-numero">{stats.total_fichas}</span>
            <span className="iep-stat-label">Fichas con etapa productiva</span>
          </div>
        </div>
      </div>

      <div className="iep-search-container">
        <input
          type="text"
          className="iep-search-input"
          placeholder="Buscar por nombre, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
        />
        <button className="iep-btn iep-btn-primary" onClick={handleBuscar}>
          <i className="fas fa-search"></i> Buscar
        </button>
        <button className="iep-btn iep-btn-secondary" onClick={handleLimpiar}>
          Limpiar
        </button>
      </div>

      {instructores.length === 0 ? (
        <div className="iep-empty">
          <i className="fas fa-user-tie" style={{ fontSize: '56px', color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
            {searchQuery ? 'Sin resultados' : 'No hay instructores con aprendices a cargo'}
          </h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Los instructores aparecerán aquí cuando tengan aprendices asignados en etapa productiva.
          </p>
        </div>
      ) : (
        <div className="iep-lista">
          {instructores.map((inst) => {
            const abierto = expandido === inst.id;
            const detalle = detalleCache[inst.id];
            const cargando = cargandoDetalle === inst.id;

            return (
              <div key={inst.id} className={`iep-card ${abierto ? 'abierto' : ''}`}>
                <div className="iep-card-header" onClick={() => handleExpandir(inst)}>
                  <div className="iep-card-avatar">
                    {inst.avatar_url ? (
                      <img src={inst.avatar_url} alt={inst.nombre_completo} />
                    ) : (
                      <span>{getIniciales(inst.nombre, inst.apellido)}</span>
                    )}
                  </div>

                  <div className="iep-card-info">
                    <h3 className="iep-card-nombre">{inst.nombre_completo}</h3>
                    <div className="iep-card-meta">
                      <span>
                        <i className="fas fa-envelope"></i> {inst.email}
                      </span>
                      {inst.documento_identidad && (
                        <span>
                          <i className="fas fa-id-card"></i> {inst.documento_identidad}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="iep-card-stats">
                    <div className="iep-card-stat">
                      <span className="iep-card-stat-numero">{inst.total_aprendices}</span>
                      <span className="iep-card-stat-label">aprendices</span>
                    </div>
                    <div className="iep-card-stat">
                      <span className="iep-card-stat-numero">{inst.total_fichas}</span>
                      <span className="iep-card-stat-label">fichas</span>
                    </div>
                  </div>

                  <button className="iep-card-toggle">
                    {cargando ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className={`fas fa-chevron-${abierto ? 'up' : 'down'}`}></i>
                    )}
                  </button>
                </div>

                {abierto && (
                  <div className="iep-card-detalle">
                    {!detalle ? (
                      <div className="iep-detalle-loading">
                        <i className="fas fa-spinner fa-spin"></i> Cargando aprendices...
                      </div>
                    ) : detalle.aprendices.length === 0 ? (
                      <div className="iep-detalle-vacio">
                        <i className="fas fa-info-circle"></i> Sin aprendices asignados
                      </div>
                    ) : (
                      <>
                        <div className="iep-detalle-header">
                          <h4>
                            <i className="fas fa-user-graduate"></i>
                            Aprendices a cargo
                            <span className="iep-detalle-badge">{detalle.aprendices.length}</span>
                          </h4>
                          {detalle.fichas.length > 0 && (
                            <div className="iep-detalle-fichas">
                              <i className="fas fa-layer-group"></i> Fichas:
                              {detalle.fichas.map((f) => (
                                <span key={f} className="iep-ficha-tag">{f}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="iep-tabla-wrapper">
                          <table className="iep-tabla">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Aprendiz</th>
                                <th>Documento</th>
                                <th>Ficha</th>
                                <th>Programa</th>
                                <th>Alternativa</th>
                                <th>Empresa</th>
                                <th>Periodo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detalle.aprendices.map((ap, i) => (
                                <tr key={ap.proceso_id}>
                                  <td>{i + 1}</td>
                                  <td className="iep-td-nombre">{ap.aprendiz_nombre}</td>
                                  <td className="iep-td-doc">{ap.aprendiz_documento || '-'}</td>
                                  <td className="iep-td-ficha">{ap.ficha_numero || '-'}</td>
                                  <td className="iep-td-programa">{ap.programa_nombre || '-'}</td>
                                  <td>
                                    <span className="iep-badge-alternativa">
                                      {ap.modalidad_nombre || 'Sin asignar'}
                                    </span>
                                  </td>
                                  <td className="iep-td-empresa">{ap.empresa_nombre || '-'}</td>
                                  <td className="iep-td-periodo">
                                    {ap.fecha_inicio} → {ap.fecha_fin}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InstructoresEP;