// src/modules/shared/pages/Novedades.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { novedadesService } from '@/core/services/novedadesService';
import './Novedades.css';

const Novedades = () => {
  const location = useLocation();
  const [novedades, setNovedades] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    renuncias: 0,
    incapacidades: 0,
    cambio_empresa: 0,
    prorrogas: 0,
    otros: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    cargarStats();
  }, []);

  useEffect(() => {
    cargarNovedades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filtroTipo]);

  const cargarStats = async () => {
    try {
      const res = await novedadesService.getStats();
      setStats(res);
    } catch (err) {
      console.warn('No se pudieron cargar stats:', err);
    }
  };

  const cargarNovedades = async () => {
    try {
      setLoading(true);
      const res = await novedadesService.listar(searchQuery, filtroTipo);
      setNovedades(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error al cargar soportes:', err);
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudieron cargar los soportes',
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
    setFiltroTipo('');
  };

  const handleVerDetalle = async (soporte) => {
    try {
      Swal.fire({
        title: 'Cargando detalle...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const detalle = await novedadesService.obtenerDetalle(soporte.id);

      Swal.fire({
        title: '🎧 Detalle de Soporte',
        html: `
          <div style="text-align: left; font-size: 14px; line-height: 1.6;">
            <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
              <p style="margin: 4px 0;"><strong>👤 Aprendiz:</strong> ${detalle.aprendiz_nombre || 'Sin nombre'}</p>
              <p style="margin: 4px 0;"><strong>🆔 Documento:</strong> ${detalle.aprendiz_documento || '-'}</p>
              <p style="margin: 4px 0;"><strong>📧 Email:</strong> ${detalle.aprendiz_email || '-'}</p>
              <p style="margin: 4px 0;"><strong>📁 Ficha:</strong> ${detalle.ficha_numero || '-'}</p>
              <p style="margin: 4px 0;"><strong>📚 Programa:</strong> ${detalle.programa_nombre || '-'}</p>
              <p style="margin: 4px 0;"><strong>🏢 Centro:</strong> ${detalle.centro_codigo || '-'}</p>
              <p style="margin: 4px 0;"><strong>👨‍🏫 Instructor:</strong> ${detalle.instructor_nombre || '-'}</p>
            </div>
            <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
              <p style="margin: 4px 0;"><strong>📌 Tipo:</strong> ${detalle.tipo_novedad}</p>
              <p style="margin: 4px 0;"><strong>📅 Fecha:</strong> ${detalle.fecha_novedad || '-'}</p>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px;">
              <p style="margin: 4px 0;"><strong>📝 Descripción:</strong></p>
              <p style="margin: 8px 0; white-space: pre-wrap;">${detalle.descripcion}</p>
            </div>
            ${detalle.documento_soporte_url ? `
              <div style="margin-top: 12px;">
                <a href="${detalle.documento_soporte_url}" target="_blank" 
                   style="display: inline-block; background: #3ca203; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  <i class="fas fa-file-pdf"></i> Ver documento adjunto
                </a>
              </div>
            ` : ''}
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3ca203',
        width: '600px',
      });
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudo cargar el detalle',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const getColorTipo = (tipo) => {
    const colores = {
      RENUNCIA: '#dc2626',
      INCAPACIDAD: '#f59e0b',
      CAMBIO_EMPRESA: '#0ea5e9',
      PRORROGA: '#8b5cf6',
      OTRO: '#6b7280',
    };
    return colores[tipo] || '#6b7280';
  };

  const getIconoTipo = (tipo) => {
    const iconos = {
      RENUNCIA: 'fa-user-minus',
      INCAPACIDAD: 'fa-notes-medical',
      CAMBIO_EMPRESA: 'fa-exchange-alt',
      PRORROGA: 'fa-clock',
      OTRO: 'fa-info-circle',
    };
    return iconos[tipo] || 'fa-info-circle';
  };

  const formatearTipo = (tipo) => {
    const formatos = {
      RENUNCIA: 'Renuncia',
      INCAPACIDAD: 'Incapacidad',
      CAMBIO_EMPRESA: 'Cambio de Empresa',
      PRORROGA: 'Prórroga',
      OTRO: 'Otro',
    };
    return formatos[tipo] || tipo;
  };

  if (loading && novedades.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando soportes...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div className="nov-header">
        <div className="nov-header-titulo">
          <h2>
            <i className="fas fa-headset"></i>
            Gestión de Soportes
          </h2>
          <p>Soportes registrados en los procesos de etapa productiva.</p>
        </div>
      </div>

      <div className="nov-stats-grid">
        <div className="nov-stat-card">
          <div className="nov-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <i className="fas fa-list"></i>
          </div>
          <div className="nov-stat-info">
            <span className="nov-stat-numero">{stats.total}</span>
            <span className="nov-stat-label">Total soportes</span>
          </div>
        </div>

        <div className="nov-stat-card">
          <div className="nov-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <i className="fas fa-user-minus"></i>
          </div>
          <div className="nov-stat-info">
            <span className="nov-stat-numero">{stats.renuncias}</span>
            <span className="nov-stat-label">Renuncias</span>
          </div>
        </div>

        <div className="nov-stat-card">
          <div className="nov-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="fas fa-notes-medical"></i>
          </div>
          <div className="nov-stat-info">
            <span className="nov-stat-numero">{stats.incapacidades}</span>
            <span className="nov-stat-label">Incapacidades</span>
          </div>
        </div>

        <div className="nov-stat-card">
          <div className="nov-stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <i className="fas fa-exchange-alt"></i>
          </div>
          <div className="nov-stat-info">
            <span className="nov-stat-numero">{stats.cambio_empresa}</span>
            <span className="nov-stat-label">Cambio empresa</span>
          </div>
        </div>
      </div>

      <div className="nov-filtros">
        <input
          type="text"
          className="nov-search-input"
          placeholder="Buscar por aprendiz, ficha o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
        />

        <select
          className="nov-select"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="RENUNCIA">Renuncia</option>
          <option value="INCAPACIDAD">Incapacidad</option>
          <option value="CAMBIO_EMPRESA">Cambio de Empresa</option>
          <option value="PRORROGA">Prórroga</option>
          <option value="OTRO">Otro</option>
        </select>

        <button className="nov-btn nov-btn-primary" onClick={handleBuscar}>
          <i className="fas fa-search"></i> Buscar
        </button>
        <button className="nov-btn nov-btn-secondary" onClick={handleLimpiar}>
          Limpiar
        </button>
      </div>

      {novedades.length === 0 ? (
        <div className="nov-empty">
          <i className="fas fa-headset" style={{ fontSize: '56px', color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
            {searchQuery || filtroTipo ? 'Sin resultados' : 'No hay soportes registrados'}
          </h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Los soportes aparecerán aquí cuando se registren.
          </p>
        </div>
      ) : (
        <div className="nov-tabla-wrapper">
          <table className="nov-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Aprendiz</th>
                <th>Ficha</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Descripción</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {novedades.map((n, i) => (
                <tr key={n.id}>
                  <td>{i + 1}</td>
                  <td className="nov-td-nombre">{n.aprendiz_nombre || 'Sin nombre'}</td>
                  <td className="nov-td-ficha">{n.ficha_numero || '-'}</td>
                  <td>
                    <span
                      className="nov-badge-tipo"
                      style={{
                        background: getColorTipo(n.tipo_novedad) + '20',
                        color: getColorTipo(n.tipo_novedad),
                        border: `1px solid ${getColorTipo(n.tipo_novedad)}`,
                      }}
                    >
                      <i className={`fas ${getIconoTipo(n.tipo_novedad)}`}></i>
                      {formatearTipo(n.tipo_novedad)}
                    </span>
                  </td>
                  <td className="nov-td-fecha">{n.fecha_novedad || '-'}</td>
                  <td className="nov-td-desc">
                    {n.descripcion?.length > 60
                      ? n.descripcion.substring(0, 60) + '...'
                      : n.descripcion}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="nov-btn-ver"
                      onClick={() => handleVerDetalle(n)}
                      title="Ver detalle"
                    >
                      <i className="fas fa-eye"></i> Ver
                    </button>
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

export default Novedades;