// src/modules/coordinador/pages/DetalleAprendiz.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';

const DetalleAprendiz = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Obtener el proceso que se pasó desde AprendicesGlobales
  const proceso = location.state?.proceso;

  console.log('🔍 Proceso recibido:', proceso);

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return fecha;
    }
  };

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return { color: '#10b981', icono: 'fa-check-circle', etiqueta: 'En formación' };
      case 'FINALIZADO':
        return { color: '#3b82f6', icono: 'fa-flag-checkered', etiqueta: 'Finalizado' };
      case 'APLAZADO':
        return { color: '#f59e0b', icono: 'fa-pause-circle', etiqueta: 'Condicionado' };
      case 'RETIRADO':
        return { color: '#ef4444', icono: 'fa-times-circle', etiqueta: 'Retirado' };
      default:
        return { color: '#6b7280', icono: 'fa-circle', etiqueta: estado || 'Sin estado' };
    }
  };

  const getIniciales = (nombre) => {
    if (!nombre) return '??';
    const partes = nombre.split(' ');
    if (partes.length >= 2) {
      return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  // Si no viene el proceso (acceso directo por URL), mostrar mensaje
  if (!proceso) {
    return (
      <div style={{ width: '100%', padding: '20px 0' }}>
        <Breadcrumb />
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <i className="fas fa-user-slash" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} />
          <h3 style={{ color: '#dc2626' }}>Aprendiz no encontrado</h3>
          <p style={{ color: '#6b7280' }}>
            Por favor, vuelve a la lista de aprendices y haz clic en "Ver".
          </p>
          <button
            onClick={() => navigate('/coordinador/aprendices')}
            style={{
              background: '#3ca203',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '16px',
              fontWeight: 'bold',
            }}
          >
            <i className="fas fa-arrow-left" /> Volver a aprendices
          </button>
        </div>
      </div>
    );
  }

  const config = getEstadoConfig(proceso.estado);

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <button
        onClick={() => navigate('/coordinador/aprendices')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#3ca203',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        <i className="fas fa-arrow-left" /> Volver a aprendices
      </button>

      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {/* ==================== ENCABEZADO ==================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            paddingBottom: '20px',
            borderBottom: '2px solid #e5e7eb',
            marginBottom: '25px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#e6f7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: '#3ca203',
              fontWeight: 'bold',
              border: '3px solid #3ca203',
            }}
          >
            {getIniciales(proceso.aprendiz_nombre)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
              {proceso.aprendiz_nombre || 'Sin nombre'}
            </h2>
            <p style={{ color: '#6b7280', margin: '0' }}>
              <i className="fas fa-envelope" style={{ marginRight: '8px', color: '#3ca203' }} />
              {proceso.aprendiz_email || 'Sin correo'}
            </p>
          </div>
          <div>
            <span
              style={{
                background: `${config.color}15`,
                color: config.color,
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className={`fas ${config.icono}`}></i>
              {config.etiqueta}
            </span>
          </div>
        </div>

        {/* ==================== DATOS PERSONALES ==================== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Documento
            </p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>
              {proceso.aprendiz_documento || 'No registrado'}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Teléfono
            </p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>
              {proceso.aprendiz_telefono || 'No registrado'}
            </p>
          </div>
        </div>

        {/* ==================== ETAPA PRODUCTIVA ==================== */}
        <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '20px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-briefcase" style={{ color: '#3ca203' }} />
            Información de Etapa Productiva
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Ficha
              </p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '16px', color: '#3ca203' }}>
                {proceso.ficha_numero || '—'}
              </p>
            </div>
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Empresa
              </p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>
                {proceso.empresa_nombre || 'Sin asignar'}
              </p>
            </div>
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
                ARL
              </p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>
                {proceso.arl || 'Sin asignar'}
              </p>
            </div>
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Estado
              </p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '16px', color: config.color }}>
                {config.etiqueta}
              </p>
            </div>
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Fecha Inicio
              </p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>
                {formatearFecha(proceso.fecha_inicio)}
              </p>
            </div>
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Fecha Fin
              </p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>
                {formatearFecha(proceso.fecha_fin)}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== BOTÓN CERRAR ==================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '2px solid #e5e7eb',
          }}
        >
          <button
            onClick={() => navigate('/coordinador/aprendices')}
            style={{
              background: '#e5e7eb',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            <i className="fas fa-arrow-left" /> Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleAprendiz;