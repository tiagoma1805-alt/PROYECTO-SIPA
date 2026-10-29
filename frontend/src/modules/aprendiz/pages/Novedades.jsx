// src/modules/aprendiz/pages/Novedades.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../../shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';
import { validarPdf } from '@/core/utils/validarPdf';

const Novedades = () => {
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CARGAR NOVEDADES DEL BACKEND
  // ==========================================================
  useEffect(() => {
    cargarNovedades();
  }, []);

  const cargarNovedades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/usuarios/me/novedades');
      console.log('📢 Novedades reales:', data);

      const novedadesFormateadas = (data.novedades || []).map(n => ({
        id: n.id,
        titulo: tituloDesdeTipo(n.tipo),
        descripcion: n.descripcion,
        fecha: formatearFecha(n.fecha),
        tipo: tipoBonito(n.tipo),
        estado: n.estado || 'Pendiente',
        archivo: n.archivo,
        documento_soporte_url: n.documento_soporte_url,
      }));

      setNovedades(novedadesFormateadas);
    } catch (err) {
      console.error('Error al cargar novedades:', err);
      setError(err.message || 'Error al cargar las novedades');
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const tituloDesdeTipo = (tipo) => {
    const map = {
      RENUNCIA: 'Renuncia',
      INCAPACIDAD: 'Incapacidad médica',
      CAMBIO_EMPRESA: 'Cambio de empresa',
      PRORROGA: 'Prórroga',
      OTRO: 'Otra novedad',
    };
    return map[tipo] || tipo;
  };

  const tipoBonito = (tipo) => {
    const map = {
      RENUNCIA: 'Renuncia',
      INCAPACIDAD: 'Incapacidad médica',
      CAMBIO_EMPRESA: 'Cambio de empresa',
      PRORROGA: 'Prórroga',
      OTRO: 'Otro',
    };
    return map[tipo] || tipo;
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    try {
      const d = new Date(fechaStr);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      return `${dia}/${mes}/${anio}`;
    } catch {
      return fechaStr;
    }
  };

  // ==========================================================
  // REPORTAR NUEVA NOVEDAD
  // ==========================================================
  const handleNuevaNovedad = () => {
    Swal.fire({
      title: '📢 Reportar Novedad',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">
              <i class="fas fa-tags" style="color: #3ca203; margin-right: 8px;"></i> Tipo de Novedad *
            </label>
            <select id="tipoNovedad" class="swal2-select" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
              <option value="INCAPACIDAD">Incapacidad médica</option>
              <option value="RENUNCIA">Renuncia</option>
              <option value="CAMBIO_EMPRESA">Cambio de empresa</option>
              <option value="PRORROGA">Prórroga</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">
              <i class="fas fa-align-left" style="color: #3ca203; margin-right: 8px;"></i> Justificación / Descripción *
            </label>
            <textarea id="descripcionNovedad" class="swal2-textarea" placeholder="Describe el motivo de tu novedad..." style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; min-height: 100px;"></textarea>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">
              <i class="fas fa-paperclip" style="color: #3ca203; margin-right: 8px;"></i> Adjuntar evidencia (PDF - opcional)
            </label>
            <input type="file" id="archivoNovedad" class="swal2-file" accept="application/pdf" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px;">
            <p id="archivoNovedad-error" style="font-size: 12px; color: #dc2626; margin: 4px 0 0 0; display: none; font-weight: 600;">
              ❌ Solo se permiten archivos PDF
            </p>
          </div>
        </div>
      `,
      confirmButtonText: '📢 Reportar',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '520px',

      didOpen: () => {
        const input = document.getElementById('archivoNovedad');
        const errorMsg = document.getElementById('archivoNovedad-error');
        if (input) {
          input.value = '';
          if (errorMsg) errorMsg.style.display = 'none';
          input.addEventListener('change', async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = await validarPdf(f, 5);
            if (!r.ok) {
              if (errorMsg) { errorMsg.textContent = r.msg; errorMsg.style.display = 'block'; }
              input.value = '';
            } else {
              if (errorMsg) errorMsg.style.display = 'none';
            }
          });
        }
      },

      preConfirm: async () => {
        const tipo = document.getElementById('tipoNovedad').value;
        const descripcion = document.getElementById('descripcionNovedad').value.trim();
        const archivoInput = document.getElementById('archivoNovedad');
        const archivo = archivoInput.files[0];

        if (!tipo) {
          Swal.showValidationMessage('⚠️ Por favor selecciona el tipo de novedad');
          return false;
        }
        if (!descripcion) {
          Swal.showValidationMessage('⚠️ Por favor ingresa la justificación');
          return false;
        }
        if (archivo) {
          const r = await validarPdf(archivo, 5);
          if (!r.ok) { Swal.showValidationMessage(r.msg); return false; }
        }

        return { tipo, descripcion, archivo: archivo ? archivo.name : null };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const nuevaNovedad = {
          id: Date.now(),
          titulo: tituloDesdeTipo(result.value.tipo),
          descripcion: result.value.descripcion,
          tipo: tipoBonito(result.value.tipo),
          fecha: formatearFecha(new Date()),
          estado: 'Pendiente',
          archivo: result.value.archivo,
        };

        setNovedades([nuevaNovedad, ...novedades]);
        Swal.fire({
          title: '✅ Novedad reportada',
          text: 'Tu novedad ha sido enviada al coordinador.',
          icon: 'success',
          confirmButtonColor: '#3ca203',
          timer: 2000,
          timerProgressBar: true
        });
      }
    });
  };

  // ==========================================================
  // VER ARCHIVO
  // ==========================================================
  const handleVerArchivo = (novedad) => {
    if (!novedad.archivo) {
      Swal.fire({
        title: '⚠️ Sin archivo adjunto',
        text: 'Esta novedad no tiene archivo adjunto.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // Si hay URL real, abrirla
    if (novedad.documento_soporte_url) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = novedad.documento_soporte_url.startsWith('http')
        ? novedad.documento_soporte_url
        : `${baseUrl}${novedad.documento_soporte_url}`;
      window.open(url, '_blank');
      return;
    }

    Swal.fire({
      title: `📄 ${novedad.archivo}`,
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding: 12px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <i class="fas fa-file-pdf" style="font-size: 40px; color: #dc2626;"></i>
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937;">${novedad.archivo}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">
                <i class="fas fa-check-circle" style="color: #10b981;"></i> Cargado correctamente
              </p>
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <p style="margin: 0; font-size: 13px; color: #6b7280;"><strong>Tipo:</strong> ${novedad.tipo}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;"><strong>Novedad:</strong> ${novedad.titulo}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;"><strong>Fecha:</strong> ${novedad.fecha}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;"><strong>Estado:</strong> ${novedad.estado}</p>
          </div>
          <div style="margin-top: 15px; padding-top: 12px; border-top: 1px dashed #e5e7eb; text-align: center; font-size: 13px; color: #9ca3af;">
            <i class="fas fa-info-circle"></i> El archivo aún no está disponible en el servidor
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '📥 Descargar archivo',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cerrar',
      cancelButtonColor: '#6b7280',
      width: '500px'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '✅ Descarga iniciada',
          text: `El archivo "${novedad.archivo}" se está descargando.`,
          icon: 'success',
          confirmButtonColor: '#3ca203',
          timer: 2000,
          timerProgressBar: true
        });
      }
    });
  };

  const getColorEstado = (estado) => {
    if (estado === 'Aprobada') return '#10b981';
    if (estado === 'Rechazada') return '#ef4444';
    return '#f59e0b';
  };

  const getIconoEstado = (estado) => {
    if (estado === 'Aprobada') return 'fa-check-circle';
    if (estado === 'Rechazada') return 'fa-times-circle';
    return 'fa-clock';
  };

  // ==========================================================
  // RENDER: LOADING / ERROR
  // ==========================================================
  if (loading) {
    return (
      <div className="novedades-container" style={{ width: '100%', padding: '20px 0' }}>
        <Breadcrumb />
        <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
          <p style={{ marginTop: '15px' }}>Cargando novedades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="novedades-container" style={{ width: '100%', padding: '20px 0' }}>
        <Breadcrumb />
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
          <h3 style={{ color: '#dc2626' }}>Error</h3>
          <p style={{ color: '#6b7280' }}>{error}</p>
          <button
            onClick={cargarNovedades}
            style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER PRINCIPAL
  // ==========================================================
  return (
    <div className="novedades-container" style={{ width: '100%', padding: '20px 0' }}>
      
      {/* ========== MIGA DE PAN ========== */}
      <Breadcrumb />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '10px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Novedades</h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Reporta y visualiza las novedades de tu proceso.</p>
        </div>
        <button
          onClick={handleNuevaNovedad}
          style={{
            background: '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fas fa-plus" /> Reportar Novedad
        </button>
      </div>

      <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          <i className="fas fa-info-circle" style={{ color: '#3ca203', marginRight: '8px' }} />
          Las novedades reportadas serán revisadas por el Coordinador de Etapa Productiva.
        </p>
      </div>

      {novedades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '48px', color: '#9ca3af' }}></i>
          <h3 style={{ color: '#6b7280' }}>No tienes novedades reportadas</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {novedades.map((novedad) => (
            <div key={novedad.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: '#1f2937' }}>{novedad.titulo}</h4>
                <span style={{
                  background: `${getColorEstado(novedad.estado)}15`,
                  color: getColorEstado(novedad.estado),
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  <i className={`fas ${getIconoEstado(novedad.estado)}`}></i> {novedad.estado}
                </span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{
                  background: '#e6f7ed',
                  color: '#047857',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  <i className="fas fa-tags"></i> {novedad.tipo}
                </span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 10px 0' }}>{novedad.descripcion}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  <i className="fas fa-calendar-alt" style={{ marginRight: '4px' }}></i>
                  {novedad.fecha}
                </span>
                {novedad.archivo && (
                  <button
                    onClick={() => handleVerArchivo(novedad)}
                    style={{ fontSize: '12px', color: '#3ca203', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <i className="fas fa-paperclip" style={{ marginRight: '4px' }}></i>
                    {novedad.archivo}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Novedades;