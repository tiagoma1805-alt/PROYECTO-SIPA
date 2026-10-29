// src/modules/instructor/pages/DetalleAprendizBitacoras.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../shared/components/Breadcrumb';

const DetalleAprendizBitacoras = () => {
  const { aprendizId } = useParams();
  const navigate = useNavigate();

  // Datos del aprendiz
  const aprendiz = {
    id: parseInt(aprendizId),
    nombre: 'Laura Sofia Martinez',
    documento: '1001234567',
    ficha: '2875901',
    programa: 'Análisis y Desarrollo de Software',
    instructor: 'Carlos Andrés López'
  };

  // ✅ SOLO CONTAR BITÁCORAS POR BIMESTRE
  const bitacorasData = {
    bimestre1: [
      { id: 1, titulo: 'Semana 1', fecha: '10/03/2025' },
      { id: 2, titulo: 'Semana 2', fecha: '17/03/2025' }
    ],
    bimestre2: [
      { id: 3, titulo: 'Semana 5', fecha: '07/04/2025' }
    ],
    bimestre3: []
  };

  const getCantidadBitacoras = (bimestre) => {
    return bitacorasData[bimestre]?.length || 0;
  };

  // ✅ Navegar a la página de bitácoras por bimestre
  const handleIrABimestre = (bimestre) => {
    navigate(`/instructor/bitacora/aprendiz/${aprendizId}/bimestre/${bimestre}`);
  };

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      {/* MIGAS DE PAN */}
      <Breadcrumb />

      <button
        onClick={() => navigate('/instructor/bitacora')}
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
          fontWeight: '500'
        }}
      >
        <i className="fas fa-arrow-left" /> Volver a bitácoras
      </button>

      {/* ENCABEZADO */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px 30px',
        marginBottom: '25px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#e6f7ed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: '#3ca203',
          fontWeight: 'bold',
          border: '3px solid #3ca203'
        }}>
          {aprendiz.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            Bitácora de {aprendiz.nombre}
          </h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
            <i className="fas fa-layer-group" style={{ marginRight: '6px' }} />
            Ficha {aprendiz.ficha} • {aprendiz.programa}
          </p>
          <p style={{ color: '#6b7280', margin: '2px 0 0 0' }}>
            <i className="fas fa-book" style={{ marginRight: '6px' }} />
            {Object.values(bitacorasData).reduce((acc, arr) => acc + arr.length, 0)} bitácoras registradas
          </p>
        </div>
      </div>

      {/* ✅ SOLO TARJETAS DE BIMESTRES - SIN DESPLEGAR NADA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { key: 'bimestre1', label: '1er Bimestre', icon: 'fa-calendar-alt', color: '#3ca203' },
          { key: 'bimestre2', label: '2do Bimestre', icon: 'fa-calendar-check', color: '#0ea5e9' },
          { key: 'bimestre3', label: '3er Bimestre', icon: 'fa-calendar-day', color: '#f59e0b' }
        ].map((bim) => {
          const cantidad = getCantidadBitacoras(bim.key);

          return (
            <div
              key={bim.key}
              onClick={() => handleIrABimestre(bim.key)}
              style={{
                background: 'white',
                padding: '30px 20px',
                borderRadius: '12px',
                border: `2px solid ${bim.color}`,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `${bim.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                color: bim.color
              }}>
                <i className={`fas ${bim.icon}`} style={{ fontSize: '24px' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                {bim.label}
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: bim.color, fontWeight: '600' }}>
                {cantidad} registro{cantidad !== 1 ? 's' : ''}
              </p>
              <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#3ca203' }}>
                <i className="fas fa-arrow-right" /> Ver bitácoras
              </p>
            </div>
          );
        })}
      </div>

      {/* ❌ ELIMINADO: No hay más contenido, no se despliega nada */}
    </div>
  );
};

export default DetalleAprendizBitacoras;
