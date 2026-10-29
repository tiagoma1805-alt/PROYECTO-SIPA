// src/modules/coordinador/pages/ReporteFichaDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import Swal from 'sweetalert2';
import { reporteService } from '@/core/services/reporteService';

const ReporteFichaDetalle = () => {
  const navigate = useNavigate();
  const { idFicha } = useParams();

  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFicha]);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reporteService.getFichaDetalleReporte(idFicha);
      console.log('📊 Detalle ficha:', data);
      setFicha(data);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      setError(err.message || 'Error al cargar el detalle');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return fecha;
    }
  };

  const getEstadoColor = (estado) => {
    if (estado === 'Completado' || estado === 'Subida' || estado === 'APROBADA' || estado === 'ENVIADA') return '#10b981';
    if (estado === 'En proceso' || estado === 'En revisión' || estado === 'BORRADOR' || estado === 'CON_OBSERVACIONES') return '#f59e0b';
    return '#ef4444';
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      'Completado': { bg: '#d1fae5', text: '#047857' },
      'Subida': { bg: '#d1fae5', text: '#047857' },
      'APROBADA': { bg: '#d1fae5', text: '#047857' },
      'ENVIADA': { bg: '#d1fae5', text: '#047857' },
      'En proceso': { bg: '#fef3c7', text: '#d97706' },
      'En revisión': { bg: '#fef3c7', text: '#d97706' },
      'BORRADOR': { bg: '#fef3c7', text: '#d97706' },
      'CON_OBSERVACIONES': { bg: '#fef3c7', text: '#d97706' },
      'Pendiente': { bg: '#f3f4f6', text: '#6b7280' },
    };
    return colors[estado] || { bg: '#f3f4f6', text: '#6b7280' };
  };

  // 🔥 Badge para el estado del aprendiz (ACTIVO → En formación, APLAZADO → Condicionado)
  const getEstadoAprendizBadge = (estado) => {
    const normalized = (estado || '').toUpperCase();
    const configs = {
      'ACTIVO': { bg: '#d1fae5', text: '#047857', label: '🟢 En formación' },
      'FINALIZADO': { bg: '#dbeafe', text: '#1e40af', label: '🔵 Finalizado' },
      'APLAZADO': { bg: '#fef3c7', text: '#d97706', label: '🟡 Condicionado' },
      'RETIRADO': { bg: '#fee2e2', text: '#dc2626', label: '🔴 Retirado' },
    };
    return configs[normalized] || { bg: '#f3f4f6', text: '#6b7280', label: estado || 'Sin estado' };
  };

  // 🔥 Texto del estado para el modal (con los mismos textos)
  const getEstadoTexto = (estado) => {
    const normalized = (estado || '').toUpperCase();
    const textos = {
      'ACTIVO': 'En formación',
      'FINALIZADO': 'Finalizado',
      'APLAZADO': 'Condicionado',
      'RETIRADO': 'Retirado',
    };
    return textos[normalized] || estado || 'Sin estado';
  };

  const handleVerDetalle = (aprendiz) => {
    const badge = (label, estado) => {
      const color = getEstadoColor(estado);
      return `<span style="background:${color}18;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid ${color};color:${color};white-space:nowrap;">${label}: ${estado || 'Pendiente'}</span>`;
    };

    Swal.fire({
      title: `📋 ${aprendiz.nombre}`,
      html: `
        <div style="text-align:left;font-size:13px;line-height:1.35;color:#1f2937;">
          <div style="display:grid;grid-template-columns:auto 1fr;column-gap:12px;row-gap:4px;align-items:baseline;">
            <strong style="color:#6b7280;">Documento:</strong><span>${aprendiz.documento || '—'}</span>
            <strong style="color:#6b7280;">Email:</strong><span style="word-break:break-all;">${aprendiz.email || '—'}</span>
            <strong style="color:#6b7280;">Teléfono:</strong><span>${aprendiz.telefono || '—'}</span>
            <strong style="color:#6b7280;">Empresa:</strong><span>${aprendiz.empresa || '—'}</span>
            <strong style="color:#6b7280;">ARL:</strong><span>${aprendiz.arl || '—'}</span>
            <strong style="color:#6b7280;">Estado:</strong>
            <span style="color:${aprendiz.estado === 'ACTIVO' || aprendiz.estado === 'Activo' ? '#10b981' : '#ef4444'};font-weight:700;">
              ${getEstadoTexto(aprendiz.estado)}
            </span>
            <strong style="color:#6b7280;">Fechas:</strong>
            <span>${formatearFecha(aprendiz.fechaInicio)} – ${formatearFecha(aprendiz.fechaFin)}</span>
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:10px 0;" />

          <div style="margin-bottom:8px;">
            <strong style="font-size:12px;color:#374151;">📌 Momentos</strong>
            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
              ${badge('M1', aprendiz.momentos?.momento1)}
              ${badge('M2', aprendiz.momentos?.momento2)}
              ${badge('M3', aprendiz.momentos?.momento3)}
            </div>
          </div>

          <div style="margin-bottom:8px;">
            <strong style="font-size:12px;color:#374151;">📖 Bitácoras</strong>
            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
              ${badge('B1', aprendiz.bitacoras?.bimestre1)}
              ${badge('B2', aprendiz.bitacoras?.bimestre2)}
              ${badge('B3', aprendiz.bitacoras?.bimestre3)}
            </div>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <strong style="font-size:12px;color:#374151;">Avance General</strong>
              <span style="font-weight:700;font-size:13px;color:${getEstadoColor(aprendiz.avance >= 80 ? 'Completado' : aprendiz.avance >= 50 ? 'En proceso' : 'Pendiente')};">
                ${aprendiz.avance ?? 0}%
              </span>
            </div>
            <div style="width:100%;height:6px;background:#f3f4f6;border-radius:999px;overflow:hidden;">
              <div style="width:${aprendiz.avance ?? 0}%;height:100%;background:${getEstadoColor(aprendiz.avance >= 80 ? 'Completado' : aprendiz.avance >= 50 ? 'En proceso' : 'Pendiente')};border-radius:999px;"></div>
            </div>
          </div>
        </div>
      `,
      icon: 'info',
      iconColor: '#3ca203',
      confirmButtonColor: '#3ca203',
      confirmButtonText: 'Cerrar',
      width: '480px',
      padding: '1.1em 1.4em 1.2em',
      heightAuto: true,
      scrollbarPadding: false,
      customClass: {
        popup: 'swal2-compact-modal',
        title: 'swal2-compact-title',
        htmlContainer: 'swal2-compact-html',
        icon: 'swal2-compact-icon',
        actions: 'swal2-compact-actions',
      },
      didOpen: () => {
        // Estilos compactos para que el modal quepa completo sin scroll
        const styleId = 'swal2-compact-styles';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            .swal2-compact-modal {
              max-height: 90vh !important;
              overflow: hidden !important;
            }
            .swal2-compact-title {
              font-size: 1.15rem !important;
              padding: 0 0 0.35em !important;
              margin: 0 !important;
            }
            .swal2-compact-html {
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
            }
            .swal2-compact-icon {
              width: 2.6em !important;
              height: 2.6em !important;
              margin: 0.4em auto 0.5em !important;
              border-width: 0.2em !important;
            }
            .swal2-compact-icon .swal2-icon-content {
              font-size: 1.6em !important;
            }
            .swal2-compact-actions {
              margin: 0.9em 0 0 !important;
              padding: 0 !important;
            }
            .swal2-compact-actions .swal2-confirm {
              padding: 0.5em 1.6em !important;
              font-size: 0.9rem !important;
            }
          `;
          document.head.appendChild(style);
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando detalle...</p>
      </div>
    );
  }

  if (error || !ficha) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar detalle</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={() => navigate('/coordinador/reportes')} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          <i className="fas fa-arrow-left" /> Volver
        </button>
      </div>
    );
  }

  const filteredAprendices = (ficha.aprendices || []).filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.nombre || '').toLowerCase().includes(q) ||
      (a.documento || '').toLowerCase().includes(q) ||
      (a.empresa || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <button
        onClick={() => navigate('/coordinador/reportes')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#3ca203',
          cursor: 'pointer',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        <i className="fas fa-arrow-left" /> Volver a reportes
      </button>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          Ficha {ficha.numero_ficha} - {ficha.programa}
        </h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
          Instructor: {ficha.instructor} • {(ficha.aprendices || []).length} aprendices
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, documento o empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Buscar</button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
      </div>

      {filteredAprendices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-user-slash" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280' }}>No hay aprendices registrados</h3>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Aprendiz</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Documento</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Empresa</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Momentos</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Bitácoras</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Avance</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredAprendices.map((a) => {
                const m1 = getEstadoBadge(a.momentos?.momento1);
                const m2 = getEstadoBadge(a.momentos?.momento2);
                const m3 = getEstadoBadge(a.momentos?.momento3);
                const b1 = getEstadoBadge(a.bitacoras?.bimestre1);
                const b2 = getEstadoBadge(a.bitacoras?.bimestre2);
                const b3 = getEstadoBadge(a.bitacoras?.bimestre3);
                const estadoAprendiz = getEstadoAprendizBadge(a.estado);

                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{a.nombre}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      {a.documento && a.documento !== '—' ? a.documento : 'Sin asignar'}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span
                        style={{
                          background: estadoAprendiz.bg,
                          color: estadoAprendiz.text,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {estadoAprendiz.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>{a.empresa}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <span style={{ background: m1.bg, color: m1.text, padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>M1</span>
                        <span style={{ background: m2.bg, color: m2.text, padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>M2</span>
                        <span style={{ background: m3.bg, color: m3.text, padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>M3</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <span style={{ background: b1.bg, color: b1.text, padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>B1</span>
                        <span style={{ background: b2.bg, color: b2.text, padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>B2</span>
                        <span style={{ background: b3.bg, color: b3.text, padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>B3</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: a.avance >= 80 ? '#10b981' : a.avance >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {a.avance}%
                        </span>
                        <div style={{ width: '50px', height: '6px', background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${a.avance}%`,
                              height: '100%',
                              background: a.avance >= 80 ? '#10b981' : a.avance >= 50 ? '#f59e0b' : '#ef4444',
                              borderRadius: '10px',
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <button
                        onClick={() => handleVerDetalle(a)}
                        style={{
                          background: '#e6f7ed',
                          color: '#047857',
                          border: 'none',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <i className="fas fa-eye" /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReporteFichaDetalle;