// src/modules/instructor/pages/DetalleFichaInstructor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import Swal from 'sweetalert2';
import { apiClient } from '@/core/api/client';
import { showSuccess, showError } from '@/core/utils/sweetAlert';

const DetalleFichaInstructor = () => {
  const { idFicha } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ficha, setFicha] = useState(null);
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFicha]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar la ficha por número
      const todasFichas = await apiClient.get('/fichas', {
        params: { numero_ficha: idFicha },
      });
      const fichaData = Array.isArray(todasFichas)
        ? todasFichas.find((f) => f.numero_ficha === idFicha)
        : null;

      if (!fichaData) throw new Error(`No se encontró la ficha ${idFicha}`);

      // 2. Obtener programa
      const programa = await apiClient
        .get(`/programas/${fichaData.programa_id}`)
        .catch(() => null);

      // 3. 🔥 UN SOLO endpoint trae aprendices + empresa + observaciones
      const aprendicesDetalle = await apiClient.get(
        `/observaciones/ficha/${fichaData.id}/aprendices-detalle`
      );

      const listaAprendices = (Array.isArray(aprendicesDetalle) ? aprendicesDetalle : []).map((p) => ({
        proceso_id: p.proceso_id,
        aprendiz_id: p.aprendiz_id,
        nombre: p.nombre || 'Sin nombre',
        documento: p.documento || '—',
        empresa: p.empresa || 'Sin empresa',
        arl: p.arl || '—',
        fechaInicio: p.fecha_inicio
          ? new Date(p.fecha_inicio).toLocaleDateString('es-CO')
          : '—',
        fechaFin: p.fecha_fin
          ? new Date(p.fecha_fin).toLocaleDateString('es-CO')
          : '—',
        estado: p.estado || 'ACTIVO',
        observaciones: Array.isArray(p.observaciones) ? p.observaciones : [],
      }));

      setFicha({
        codigo: fichaData.numero_ficha,
        programa: programa?.nombre || 'Sin programa',
        estado: 'Activa',
        id: fichaData.id,
      });
      setAprendices(listaAprendices);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      setError(err.message || 'Error al cargar la ficha');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoConfig = (estado) => {
    const e = (estado || '').toUpperCase();
    if (e.includes('FORMACION') || e === 'ACTIVO' || e.includes('FORMACI')) {
      return { color: '#10b981', icono: 'fa-check-circle', label: 'En formación' };
    }
    if (e.includes('CONDICION')) {
      return { color: '#f59e0b', icono: 'fa-exclamation-circle', label: 'Condicionado' };
    }
    if (e.includes('FINAL') || e.includes('CERTIFIC')) {
      return { color: '#3b82f6', icono: 'fa-flag-checkered', label: 'Finalizado' };
    }
    if (e.includes('RETIR') || e.includes('DESERT') || e.includes('CANCEL')) {
      return { color: '#ef4444', icono: 'fa-times-circle', label: 'Retirado' };
    }
    return { color: '#6b7280', icono: 'fa-circle', label: estado || 'Sin estado' };
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const filteredAprendices = aprendices.filter((ap) =>
    ap.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNuevaObservacion = async (aprendiz) => {
    const stored = localStorage.getItem('user');
    const instructor = stored ? JSON.parse(stored) : null;
    const instructorId = instructor?.id;

    if (!instructorId) {
      showError('No se encontró el instructor logueado.');
      return;
    }

    const { value: observacion } = await Swal.fire({
      title: '📝 Nueva Observación',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
            Aprendiz: <strong>${aprendiz.nombre}</strong>
          </p>
          <textarea id="observacionText"
            class="swal2-textarea"
            placeholder="Escribe aquí tu observación..."
            style="width: 100%; min-height: 150px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit;"
          ></textarea>
          <div style="margin-top: 10px; padding: 8px 12px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-size: 12px; color: #166534;">
              <i class="fas fa-info-circle" style="color: #3ca203; margin-right: 6px;"></i>
              La observación quedará registrada con fecha y hora actual.
            </p>
          </div>
        </div>
      `,
      icon: 'info',
      iconColor: '#3ca203',
      showCancelButton: true,
      confirmButtonColor: '#3ca203',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Guardar Observación',
      cancelButtonText: 'Cancelar',
      width: '500px',
      padding: '25px 30px',
      focusConfirm: false,
      preConfirm: () => {
        const textarea = document.getElementById('observacionText');
        const texto = textarea?.value?.trim();
        if (!texto) {
          Swal.showValidationMessage('⚠️ Por favor, escribe una observación.');
          return false;
        }
        return texto;
      },
      didOpen: () => {
        const textarea = document.getElementById('observacionText');
        if (textarea) setTimeout(() => textarea.focus(), 100);
      },
    });

    if (!observacion) return;

    try {
      await apiClient.post('/observaciones/', {
        aprendiz_id: aprendiz.aprendiz_id,
        instructor_id: instructorId,
        texto: observacion,
      });

      await showSuccess(
        `Observación guardada para ${aprendiz.nombre}.`,
        '✅ Observación registrada'
      );

      const nuevas = await apiClient.get(`/observaciones/aprendiz/${aprendiz.aprendiz_id}`);
      setAprendices((prev) =>
        prev.map((a) =>
          a.aprendiz_id === aprendiz.aprendiz_id
            ? { ...a, observaciones: Array.isArray(nuevas) ? nuevas : [] }
            : a
        )
      );
    } catch (err) {
      console.error('Error al guardar observación:', err);
      showError('No se pudo guardar la observación.');
    }
  };

  const handleVerObservaciones = (aprendiz) => {
    if (!aprendiz.observaciones || aprendiz.observaciones.length === 0) {
      Swal.fire({
        title: '📋 Sin observaciones',
        text: `${aprendiz.nombre} no tiene observaciones registradas.`,
        icon: 'info',
        iconColor: '#3ca203',
        confirmButtonColor: '#3ca203',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const observacionesHtml = aprendiz.observaciones
      .map((obs) => {
        const fecha = obs.fecha_creacion
          ? new Date(obs.fecha_creacion).toLocaleDateString('es-CO')
          : '—';
        const hora = obs.fecha_creacion
          ? new Date(obs.fecha_creacion).toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';
        return `
          <div style="background: #f8fafc; padding: 12px 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #3ca203; text-align: left;">
            <p style="margin: 0; font-size: 14px; color: #1f2937; line-height: 1.5;">${obs.texto}</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #6b7280;">
              <i class="fas fa-calendar-alt" style="margin-right: 4px;"></i>
              ${fecha} - ${hora}
              ${obs.instructor_nombre ? '· <strong>' + obs.instructor_nombre + '</strong>' : ''}
            </p>
          </div>
        `;
      })
      .join('');

    Swal.fire({
      title: '📋 Observaciones de ' + aprendiz.nombre,
      html: `
        <div style="max-height: 350px; overflow-y: auto; padding: 5px 0;">
          ${observacionesHtml}
        </div>
        <div style="margin-top: 15px; padding: 10px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #166534;">
            <i class="fas fa-info-circle" style="color: #3ca203; margin-right: 6px;"></i>
            Total: ${aprendiz.observaciones.length} observaciones
          </p>
        </div>
      `,
      icon: 'info',
      iconColor: '#3ca203',
      confirmButtonColor: '#3ca203',
      confirmButtonText: 'Cerrar',
      width: '550px',
      padding: '25px 30px',
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando ficha...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={() => navigate('/instructor/fichas')}
          style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}
        >
          <i className="fas fa-arrow-left" /> Volver a Fichas
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <button
        onClick={() => navigate('/instructor/fichas')}
        style={{ background: 'transparent', border: 'none', color: '#3ca203', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <i className="fas fa-arrow-left" /> Volver a fichas
      </button>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Ficha {ficha.codigo}</h2>
        <p style={{ color: '#6b7280' }}>{ficha.programa}</p>
        <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          <i className="fas fa-check-circle" style={{ marginRight: '6px' }} />
          Activa
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar aprendiz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Buscar
        </button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          Limpiar
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        {filteredAprendices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#dc2626' }}>Sin aprendices</h3>
            <p style={{ color: '#6b7280' }}>No se encontraron aprendices en esta ficha.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Aprendiz</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Empresa</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>ARL</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Fecha Inicio</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Fecha Fin</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAprendices.map((ap) => {
                const cfg = getEstadoConfig(ap.estado);
                return (
                  <tr key={ap.proceso_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{ap.nombre}</td>
                    <td style={{ padding: '12px' }}>{ap.empresa}</td>
                    <td style={{ padding: '12px' }}>{ap.arl}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>{ap.fechaInicio}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>{ap.fechaFin}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ background: cfg.color + '15', color: cfg.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        <i className={'fas ' + cfg.icono} style={{ marginRight: '6px' }} />
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <button
                        onClick={() => handleNuevaObservacion(ap)}
                        style={{ background: '#3ca203', color: 'white', border: 'none', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', marginRight: '5px' }}
                      >
                        <i className="fas fa-plus" style={{ marginRight: '6px' }} /> Nueva
                      </button>
                      <button
                        onClick={() => handleVerObservaciones(ap)}
                        style={{ background: '#e0f2fe', color: '#0ea5e9', border: 'none', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                      >
                        <i className="fas fa-eye" style={{ marginRight: '6px' }} /> Ver ({ap.observaciones.length})
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DetalleFichaInstructor;
