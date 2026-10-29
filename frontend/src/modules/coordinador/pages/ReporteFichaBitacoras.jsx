// src/modules/coordinador/pages/ReporteFichaBitacoras.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import Swal from 'sweetalert2';
import { bitacoraService } from '@/core/services/bitacoraService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ReporteFichaBitacoras = () => {
  const navigate = useNavigate();
  const { idFicha } = useParams();

  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bimestreSeleccionado, setBimestreSeleccionado] = useState(1);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFicha]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bitacoraService.getBitacorasByFicha(idFicha);
      console.log('📖 Bitácoras ficha:', data);

      let instructor = 'Sin asignar';
      try {
        const asignaciones = await fetch(
          `${API_BASE_URL}/asignaciones?ficha_id=${idFicha}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        ).then((r) => (r.ok ? r.json() : []));

        const activa = Array.isArray(asignaciones)
          ? asignaciones.find((a) => a.is_active)
          : null;

        if (activa) {
          const instr = await fetch(
            `${API_BASE_URL}/usuarios/${activa.instructor_id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          ).then((r) => (r.ok ? r.json() : null));
          if (instr) {
            instructor = `${instr.nombre || ''} ${instr.apellido || ''}`.trim();
          }
        }
      } catch (e) {
        console.warn('Instructor no disponible:', e);
      }

      setFicha({
        id: data.numero_ficha || idFicha,
        fichaId: data.ficha_id,
        programa: data.programa || '—',
        instructor,
        aprendices: data.aprendices || [],
      });
    } catch (err) {
      console.error('Error al cargar:', err);
      setError(err.message || 'Error al cargar bitácoras');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const formatearTamano = (bytes) => {
    if (!bytes || bytes === 0) return '—';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleVerPDF = (archivo) => {
    const url = archivo.ruta_objeto?.startsWith('http')
      ? archivo.ruta_objeto
      : `${API_BASE_URL}${archivo.ruta_objeto}`;

    window.open(url, '_blank');
  };

  const handleDescargarArchivo = (archivo) => {
    const url = archivo.ruta_objeto?.startsWith('http')
      ? archivo.ruta_objeto
      : `${API_BASE_URL}${archivo.ruta_objeto}`;

    const link = document.createElement('a');
    link.href = url;
    link.download = archivo.nombre || 'archivo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      title: '📥 Descargando archivo',
      text: `El archivo "${archivo.nombre}" se está descargando.`,
      icon: 'info',
      iconColor: '#3ca203',
      confirmButtonColor: '#3ca203',
      confirmButtonText: 'Aceptar',
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const handleVerDetalleBitacora = (bitacora, aprendiz) => {
    const archivos = bitacora.archivos || [];
    const archivosPDF = archivos.filter((a) =>
      (a.mime_type || '').includes('pdf')
    );

    const archivosHtml =
      archivosPDF.length > 0
        ? archivosPDF
            .map(
              (a) => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 12px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-file-pdf" style="color: #dc2626; font-size: 18px;"></i>
            <div>
              <div style="font-size: 14px; font-weight: 500; color: #1f2937;">${a.nombre}</div>
              <div style="font-size: 11px; color: #9ca3af;">${formatearTamano(a.tamano_bytes)}</div>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button onclick="window.verPDFBitacora(${a.id})" style="background: #e0f2fe; color: #0ea5e9; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
              <i class="fas fa-eye"></i> Ver
            </button>
            <button onclick="window.descargarBitacora(${a.id})" style="background: #3ca203; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
              <i class="fas fa-download"></i> Descargar
            </button>
          </div>
        </div>
      `
            )
            .join('')
        : '<p style="color: #9ca3af; font-style: italic; font-size: 13px;"><i class="fas fa-paperclip" style="margin-right: 6px;"></i>Sin archivos PDF adjuntos</p>';

    Swal.fire({
      title: `📖 ${bitacora.titulo}`,
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
            <div><strong>Aprendiz:</strong></div>
            <div>${aprendiz.nombre}</div>
            <div><strong>Fecha:</strong></div>
            <div>${bitacora.fecha_envio ? new Date(bitacora.fecha_envio).toLocaleDateString('es-ES') : '—'}</div>
            <div><strong>Bimestre:</strong></div>
            <div>${bitacora.bimestre}</div>
          </div>
          <hr style="border: 1px solid #e5e7eb; margin: 10px 0;" />
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
            <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.6;">
              ${bitacora.contenido}
            </p>
          </div>
          <div>
            <p style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 8px;">
              <i class="fas fa-paperclip" style="color: #dc2626; margin-right: 6px;"></i>
              Archivos PDF adjuntos (${archivosPDF.length})
            </p>
            ${archivosHtml}
          </div>
        </div>
      `,
      icon: 'info',
      iconColor: '#dc2626',
      confirmButtonColor: '#3ca203',
      confirmButtonText: 'Cerrar',
      width: '600px',
      didOpen: () => {
        window.descargarBitacora = (id) => {
          const archivo = archivosPDF.find((a) => a.id === id);
          if (archivo) handleDescargarArchivo(archivo);
        };
        window.verPDFBitacora = (id) => {
          const archivo = archivosPDF.find((a) => a.id === id);
          if (archivo) handleVerPDF(archivo);
        };
      },
    });
  };

  const handleVerBitacorasAprendiz = (aprendiz) => {
    const bitacorasBimestre = (aprendiz.bitacoras || []).filter(
      (b) => b.bimestre === bimestreSeleccionado
    );

    if (bitacorasBimestre.length === 0) {
      Swal.fire({
        title: '📖 Sin bitácoras',
        text: `${aprendiz.nombre} no tiene bitácoras en el Bimestre ${bimestreSeleccionado}.`,
        icon: 'info',
        iconColor: '#3ca203',
        confirmButtonColor: '#3ca203',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const bitacorasHtml = bitacorasBimestre
      .map((b) => {
        const archivos = (b.archivos || []).filter((a) =>
          (a.mime_type || '').includes('pdf')
        );
        const tieneArchivos = archivos.length > 0;
        const fecha = b.fecha_envio
          ? new Date(b.fecha_envio).toLocaleDateString('es-ES')
          : '—';

        return `
        <div onclick="window.verDetalleBitacora(${b.id})" style="background: #f8fafc; padding: 12px 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 10px; cursor: pointer; transition: all 0.2s;"
          onmouseenter="this.style.borderColor='#3ca203'"
          onmouseleave="this.style.borderColor='#e5e7eb'"
        >
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0; font-weight: 500; font-size: 14px; color: #1f2937;">
                ${b.titulo}
              </p>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: #6b7280;">
                <i class="fas fa-calendar-alt" style="margin-right: 4px;"></i>
                ${fecha}
              </p>
              ${tieneArchivos ? `
                <div style="margin-top: 4px; display: flex; gap: 4px; flex-wrap: wrap;">
                  ${archivos.map((a) => `
                    <span style="background: #fecaca; padding: 1px 8px; border-radius: 10px; font-size: 10px; color: #dc2626; display: inline-flex; align-items: center; gap: 3px;">
                      <i class="fas fa-file-pdf" style="font-size: 8px;"></i>
                      ${a.nombre}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div style="color: #3ca203; font-size: 12px;">
              <i class="fas fa-eye"></i> Ver
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    window.bitacorasGlobales = bitacorasBimestre;
    window.aprendizGlobal = aprendiz;

    Swal.fire({
      title: `📖 ${aprendiz.nombre} - Bimestre ${bimestreSeleccionado}`,
      html: `
        <div style="text-align: left; padding: 5px 0; max-height: 400px; overflow-y: auto;">
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 12px;">
            ${bitacorasBimestre.length} bitácoras encontradas
          </p>
          ${bitacorasHtml}
        </div>
      `,
      icon: 'info',
      iconColor: '#3ca203',
      confirmButtonColor: '#3ca203',
      confirmButtonText: 'Cerrar',
      width: '550px',
      didOpen: () => {
        window.verDetalleBitacora = (id) => {
          const bitacora = window.bitacorasGlobales.find((b) => b.id === id);
          if (bitacora) {
            handleVerDetalleBitacora(bitacora, window.aprendizGlobal);
          }
        };
      },
    });
  };

  const filteredAprendices = (ficha?.aprendices || []).filter((a) =>
    (a.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando bitácoras...</p>
      </div>
    );
  }

  if (error || !ficha) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar</h3>
        <p style={{ color: '#6b7280' }}>{error || 'Ficha no encontrada'}</p>
        <button
          onClick={() => navigate('/coordinador/reporte-bitacoras')}
          style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}
        >
          <i className="fas fa-arrow-left" /> Volver a bitácoras
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <button
        onClick={() => navigate('/coordinador/reporte-bitacoras')}
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
        <i className="fas fa-arrow-left" /> Volver a fichas
      </button>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          Ficha {ficha.id} - {ficha.programa}
        </h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
          Instructor: {ficha.instructor} • {ficha.aprendices.length} aprendices
        </p>
      </div>

      {/* 🔥 BIMESTRES: todos desbloqueados para el coordinador */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[1, 2, 3].map((bim) => {
          const total = ficha.aprendices.reduce(
            (acc, a) =>
              acc + (a.bitacoras || []).filter((b) => b.bimestre === bim).length,
            0
          );

          return (
            <button
              key={bim}
              onClick={() => setBimestreSeleccionado(bim)}
              style={{
                padding: '8px 20px',
                background: bimestreSeleccionado === bim ? '#3ca203' : '#f8fafc',
                color: bimestreSeleccionado === bim ? 'white' : '#1f2937',
                border: `1px solid ${bimestreSeleccionado === bim ? '#3ca203' : '#e5e7eb'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                opacity: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Bimestre {bim}</span>
              {total > 0 ? (
                <span
                  style={{
                    background: bimestreSeleccionado === bim ? 'rgba(255,255,255,0.2)' : '#e6f7ed',
                    color: bimestreSeleccionado === bim ? 'white' : '#047857',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {total}
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>(sin bitácoras)</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por aprendiz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Buscar</button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
      </div>

      {filteredAprendices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: '#dc2626' }}>No hay aprendices</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {filteredAprendices.map((a) => {
            const bitacorasBimestre = (a.bitacoras || []).filter(
              (b) => b.bimestre === bimestreSeleccionado
            );
            const totalBitacoras = bitacorasBimestre.length;

            return (
              <div
                key={a.aprendiz_id}
                onClick={() => handleVerBitacorasAprendiz(a)}
                style={{
                  background: 'white',
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: 1,
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', color: '#1f2937' }}>
                    {a.nombre}
                  </p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    {totalBitacoras > 0
                      ? `${totalBitacoras} bitácoras en Bimestre ${bimestreSeleccionado}`
                      : `Sin bitácoras en Bimestre ${bimestreSeleccionado}`}
                  </p>
                </div>
                <div>
                  {totalBitacoras > 0 ? (
                    <span
                      style={{
                        background: '#e6f7ed',
                        color: '#047857',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fas fa-eye" /> Ver
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '11px', fontStyle: 'italic' }}>
                      Sin bitácoras
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReporteFichaBitacoras;