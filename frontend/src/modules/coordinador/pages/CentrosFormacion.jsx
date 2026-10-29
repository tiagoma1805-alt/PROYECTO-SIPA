// src/modules/coordinador/pages/CentrosFormacion.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { centrosFormacionService } from '@/core/services/centrosFormacionService';
import './CentrosFormacion.css';

const CentrosFormacion = () => {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [detalleCache, setDetalleCache] = useState({});
  const [cargandoDetalle, setCargandoDetalle] = useState(null);

  useEffect(() => {
    cargarCentros();
  }, []);

  const cargarCentros = async () => {
    try {
      setLoading(true);
      const res = await centrosFormacionService.listar();
      setCentros(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error al cargar centros:', err);
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudieron cargar los centros',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExpandir = async (centro) => {
    if (expandido === centro.id) {
      setExpandido(null);
      return;
    }
    if (detalleCache[centro.id]) {
      setExpandido(centro.id);
      return;
    }
    try {
      setCargandoDetalle(centro.id);
      const detalle = await centrosFormacionService.obtenerDetalle(centro.id);
      setDetalleCache((prev) => ({ ...prev, [centro.id]: detalle }));
      setExpandido(centro.id);
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

  const getIniciales = (codigo) => (codigo || '??').substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando centros de formación...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div className="cf-header">
        <div className="cf-header-titulo">
          <h2>
            <i className="fas fa-building"></i>
            Centros de Formación
          </h2>
          <p>Centros del SENA con programas y fichas de etapa productiva.</p>
        </div>
      </div>

      {centros.length === 0 ? (
        <div className="cf-empty">
          <i className="fas fa-building" style={{ fontSize: '56px', color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 8px 0' }}>No hay centros registrados</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Los centros aparecerán aquí cuando estén creados.</p>
        </div>
      ) : (
        <div className="cf-lista">
          {centros.map((centro) => {
            const abierto = expandido === centro.id;
            const detalle = detalleCache[centro.id];
            const cargando = cargandoDetalle === centro.id;

            return (
              <div key={centro.id} className={`cf-card ${abierto ? 'abierto' : ''}`}>
                <div className="cf-card-header" onClick={() => handleExpandir(centro)}>
                  <div className="cf-card-avatar">
                    <span>{getIniciales(centro.codigo)}</span>
                  </div>

                  <div className="cf-card-info">
                    <h3 className="cf-card-nombre">{centro.nombre}</h3>
                    <div className="cf-card-meta">
                      <span>
                        <i className="fas fa-tag"></i> {centro.codigo}
                      </span>
                      {centro.direccion && (
                        <span>
                          <i className="fas fa-map-marker-alt"></i> {centro.direccion}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="cf-card-stats">
                    <div className="cf-card-stat">
                      <span className="cf-card-stat-numero">{centro.total_programas}</span>
                      <span className="cf-card-stat-label">programas</span>
                    </div>
                    <div className="cf-card-stat">
                      <span className="cf-card-stat-numero">{centro.total_fichas}</span>
                      <span className="cf-card-stat-label">fichas</span>
                    </div>
                  </div>

                  <button className="cf-card-toggle">
                    {cargando ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className={`fas fa-chevron-${abierto ? 'up' : 'down'}`}></i>
                    )}
                  </button>
                </div>

                {abierto && (
                  <div className="cf-card-detalle">
                    {!detalle ? (
                      <div className="cf-detalle-loading">
                        <i className="fas fa-spinner fa-spin"></i> Cargando programas...
                      </div>
                    ) : detalle.programas.length === 0 ? (
                      <div className="cf-detalle-vacio">
                        <i className="fas fa-info-circle"></i> Este centro no tiene programas
                      </div>
                    ) : (
                      <>
                        <div className="cf-detalle-header">
                          <h4>
                            <i className="fas fa-graduation-cap"></i>
                            Programas del centro
                            <span className="cf-detalle-badge">{detalle.programas.length}</span>
                          </h4>
                        </div>

                        <div className="cf-tabla-wrapper">
                          <table className="cf-tabla">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Código</th>
                                <th>Programa</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detalle.programas.map((prog, i) => (
                                <tr key={prog.id}>
                                  <td>{i + 1}</td>
                                  <td className="cf-td-codigo">{prog.codigo}</td>
                                  <td className="cf-td-nombre">{prog.nombre}</td>
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

export default CentrosFormacion;