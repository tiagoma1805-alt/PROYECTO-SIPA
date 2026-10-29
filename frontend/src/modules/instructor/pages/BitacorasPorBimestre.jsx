// src/modules/instructor/pages/BitacorasPorBimestre.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '../../shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';

const BitacorasPorBimestre = () => {
  const navigate = useNavigate();
  const { aprendizId, bimestre } = useParams();
  const location = useLocation();

  const aprendizReal = location.state?.aprendiz;
  const fichaReal = location.state?.ficha;

  const [aprendiz, setAprendiz] = useState(aprendizReal || null);
  const [ficha, setFicha] = useState(fichaReal || null);
  const [loading, setLoading] = useState(!aprendizReal);

  // Si no vino por state, cargar del backend
  useEffect(() => {
    if (aprendizReal) return;

    const cargar = async () => {
      try {
        const stored = localStorage.getItem('user');
        const instructor = stored ? JSON.parse(stored) : null;
        const data = await apiClient.get('/instructor/bitacoras/' + instructor.id);

        let encontrado = null;
        let fichaEncontrada = null;
        for (const f of data) {
          const ap = f.aprendices.find(a => a.id === parseInt(aprendizId));
          if (ap) {
            encontrado = ap;
            fichaEncontrada = f;
            break;
          }
        }
        setAprendiz(encontrado);
        setFicha(fichaEncontrada);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [aprendizId, aprendizReal]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!aprendiz) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h3>Aprendiz no encontrado</h3>
        <button onClick={() => navigate('/instructor/bitacora')} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          Volver
        </button>
      </div>
    );
  }

  const bitacorasData = aprendiz.bitacoras || {};
  const bitacoras = bitacorasData[bimestre] || [];

  const getBimestreNombre = (bim) => {
    const nombres = { bimestre1: '1er Bimestre', bimestre2: '2do Bimestre', bimestre3: '3er Bimestre', bimestre4: '4to Bimestre' };
    return nombres[bim] || bim;
  };

  const bimestreNombre = getBimestreNombre(bimestre);

  const goBack = () => {
    navigate('/instructor/bitacora', {
      state: { restoreFicha: ficha, restoreAprendiz: aprendiz }
    });
  };

  const getObservacion = (b) => b.observaciones || b.observacion || null;

  const handleVer = async (bitacora) => {
    const observacion = getObservacion(bitacora);

    let archivos = [];
    try {
      const resultado = await apiClient.get('/instructor/bitacora/' + bitacora.id + '/archivos');
      archivos = Array.isArray(resultado) ? resultado : [];
    } catch (e) {
      console.warn('Error cargando archivos:', e);
      archivos = [];
    }

    const archivosHtml = archivos.length > 0
      ? `
        <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <p style="font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 6px;">
            <i class="fas fa-paperclip" style="color: #3ca203; margin-right: 6px;"></i>
            Archivos adjuntos (${archivos.length})
          </p>
          ${archivos.map((a) => `
            <div style="background: #f8fafc; padding: 6px 10px; border-radius: 4px; border: 1px solid #e5e7eb; margin-bottom: 4px; font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
              <span><i class="fas fa-file-pdf" style="color: #dc2626; margin-right: 6px;"></i>${a.nombre}</span>
              <a href="http://localhost:8000${a.ruta}" target="_blank" style="color: #0ea5e9; font-size: 11px; text-decoration: none;">
                <i class="fas fa-eye"></i> Ver
              </a>
            </div>
          `).join('')}
        </div>
      `
      : '<p style="color:#9ca3af; font-style: italic; font-size: 12px; margin-top: 12px;"><i class="fas fa-paperclip"></i> Sin archivos adjuntos</p>';

    Swal.fire({
      title: '📋 ' + (bitacora.descripcion || bitacora.titulo || 'Bitácora'),
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              <i class="fas fa-user" style="color: #3ca203; margin-right: 6px;"></i>
              <strong>Aprendiz:</strong> ${aprendiz.nombre}
            </p>
            <span style="background: #e6f7ed; color: #047857; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 500;">
              <i class="fas fa-check-circle"></i> Seguimiento
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div>
              <p style="margin: 0; font-size: 13px; color: #6b7280;"><strong>Fecha:</strong></p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #1f2937;">${bitacora.fecha || bitacora.periodo_reportado || '--'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 13px; color: #6b7280;"><strong>Instructor:</strong></p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #1f2937;">${bitacora.instructor || 'Carlos Ramirez'}</p>
            </div>
          </div>
          ${bitacora.aprendizObservacion ? `
            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;"><strong>Bitácora del Aprendiz:</strong></p>
              <div style="background: #e8f5e9; padding: 10px 14px; border-radius: 8px; margin-top: 4px; border-left: 3px solid #43a047;">
                <p style="margin: 0; font-size: 14px; color: #1f2937;">${bitacora.aprendizObservacion}</p>
              </div>
            </div>
          ` : ''}
          ${observacion ? `
            <div style="margin-bottom: 12px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;"><strong>Observación del Instructor:</strong></p>
              <div style="background: #fefce8; padding: 10px 14px; border-radius: 8px; margin-top: 4px; border-left: 3px solid #f59e0b;">
                <p style="margin: 0; font-size: 14px; color: #1f2937;">${observacion}</p>
              </div>
            </div>
          ` : ''}
          ${archivosHtml}
        </div>
      `,
      icon: 'info',
      confirmButtonText: '✅ Aceptar',
      confirmButtonColor: '#3ca203',
      width: '550px'
    });
  };

  const handleObservacion = (bitacora) => {
    Swal.fire({
      title: '📝 Observación de la Bitácora',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
            <strong>Aprendiz:</strong> ${aprendiz.nombre}<br>
            <strong>Fecha:</strong> ${bitacora.fecha || '--'}
          </p>
          <textarea id="obsText" class="swal2-textarea" placeholder="Escribe aquí tu observación..." style="width:100%; min-height: 120px; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px; font-family: inherit;">${bitacora.observaciones || ''}</textarea>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: '✅ Guardar Observación',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '550px',
      preConfirm: () => {
        const texto = document.getElementById('obsText').value.trim();
        if (!texto) {
          Swal.showValidationMessage('Por favor escribe una observación');
          return false;
        }
        return texto;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Observación guardada',
          text: 'La observación se ha registrado localmente.',
          icon: 'success',
          confirmButtonColor: '#3ca203'
        });
      }
    });
  };

  return (
    <div className="bitacora-container">
      <Breadcrumb />
      <div className="bitacora-header">
        <div className="header-left">
          <button className="btn-back" onClick={goBack}>
            <i className="fas fa-arrow-left"></i> Volver a bitácoras
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#3ca20320', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3ca203', fontSize: '20px', fontWeight: 'bold' }}>
            {aprendiz.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>{bimestreNombre} - {aprendiz.nombre}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              <i className="fas fa-layer-group"></i> Ficha {ficha?.id || '--'} • {ficha?.programa || '--'}
            </p>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
              <i className="fas fa-book"></i> {bitacoras.length} bitácora{bitacoras.length !== 1 ? 's' : ''} en este bimestre
            </p>
          </div>
        </div>
      </div>

      {bitacoras.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-book-open" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '15px' }}></i>
          <h3 style={{ color: '#6b7280' }}>Sin bitácoras en este bimestre</h3>
        </div>
      ) : (
        bitacoras.map((b, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '15px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: '#e6f7ed', color: '#047857', padding: '4px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '500' }}>
                  <i className="fas fa-calendar"></i> {b.fecha || b.periodo_reportado}
                </span>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '500' }}>
                  <i className="fas fa-user"></i> {b.instructor || 'Carlos Ramirez'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleVer(b)} style={{ background: '#e6f7ed', color: '#047857', border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
                  <i className="fas fa-eye"></i> Ver
                </button>
                <button onClick={() => handleObservacion(b)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
                  <i className="fas fa-pen"></i> Observación
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>{b.descripcion || b.titulo}</h3>

            {b.aprendizObservacion && (
              <div style={{ background: '#e8f5e9', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #43a047', marginBottom: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                  <strong><i className="fas fa-graduation-cap"></i> Bitácora:</strong>
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#1f2937' }}>{b.aprendizObservacion}</p>
              </div>
            )}

            {getObservacion(b) && (
              <div style={{ background: '#fefce8', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                  <strong><i className="fas fa-comment"></i> Observación:</strong>
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#1f2937' }}>{getObservacion(b)}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default BitacorasPorBimestre;