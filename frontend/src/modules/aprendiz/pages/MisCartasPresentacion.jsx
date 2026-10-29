// src/modules/aprendiz/pages/MisCartasPresentacion.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cartaPresentacionService } from '@/core/services/cartaPresentacionService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MisCartasPresentacion = () => {
  const [cartas, setCartas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCartas();
  }, []);

  const cargarCartas = async () => {
    try {
      setLoading(true);
      const res = await cartaPresentacionService.listar();
      console.log('📄 Cartas del aprendiz:', res);
      setCartas(res.cartas || []);
    } catch (err) {
      console.error('Error al cargar cartas:', err);
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudieron cargar tus cartas',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = (carta) => {
    const url = carta.archivo_url.startsWith('http')
      ? carta.archivo_url
      : `${API_BASE_URL}${carta.archivo_url}`;
    window.open(url, '_blank');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando tus cartas...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      {/* ENCABEZADO */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>
          <i className="fas fa-envelope-open-text" style={{ color: '#3ca203', marginRight: '10px' }} />
          Mis Cartas de Presentación
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
          Aquí puedes ver y descargar la carta de presentación que tu coordinador subió para avalar el inicio de tu etapa productiva.
        </p>
      </div>

      {/* CONTENIDO */}
      {cartas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}>
          <i className="fas fa-hourglass-half" style={{ fontSize: '64px', color: '#f59e0b', marginBottom: '20px' }} />
          <h3 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>Aún no tienes cartas de presentación</h3>
          <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto' }}>
            Cuando tu coordinador suba tu carta de presentación, aparecerá aquí y podrás descargarla.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {cartas.map((carta) => (
            <div
              key={carta.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '24px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              {/* ICONO PDF */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className="fas fa-file-pdf" style={{ fontSize: '32px', color: '#dc2626' }} />
              </div>

              {/* INFO */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '600', color: '#1f2937' }}>
                  Carta de presentación
                </h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#6b7280' }}>
                  <span>
                    <i className="fas fa-calendar" style={{ marginRight: '5px', color: '#3ca203' }} />
                    {formatearFecha(carta.fecha_carga)}
                  </span>
                  {carta.coordinador_nombre && (
                    <span>
                      <i className="fas fa-user-tie" style={{ marginRight: '5px', color: '#3ca203' }} />
                      {carta.coordinador_nombre}
                    </span>
                  )}
                </div>
              </div>

              {/* ESTADO */}
              <div>
                <span style={{
                  background: carta.estado === 'APROBADA' ? '#d1fae5' : carta.estado === 'RECHAZADA' ? '#fee2e2' : '#fef3c7',
                  color: carta.estado === 'APROBADA' ? '#047857' : carta.estado === 'RECHAZADA' ? '#dc2626' : '#d97706',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}>
                  {carta.estado}
                </span>
              </div>

              {/* ACCIONES */}
              <div>
                <button
                  onClick={() => handleDescargar(carta)}
                  style={{
                    background: '#3ca203',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fas fa-download" /> Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCartasPresentacion;