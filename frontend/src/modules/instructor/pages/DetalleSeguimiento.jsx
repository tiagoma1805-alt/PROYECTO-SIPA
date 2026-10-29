// src/pages/instructor/DetalleSeguimiento.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../shared/components/Breadcrumb';

const DetalleSeguimiento = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />
      <button
        onClick={() => navigate('/instructor')}
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
          fontWeight: '500'
        }}
      >
        <i className="fas fa-arrow-left" /> Volver al Dashboard
      </button>

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Detalle del Seguimiento</h2>
      <p style={{ color: '#6b7280' }}>Seguimiento ID: {id}</p>

      <div style={{ marginTop: '20px', background: 'white', borderRadius: '12px', padding: '30px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ color: '#1f2937' }}>Información del Seguimiento</h3>
        <p style={{ color: '#6b7280' }}>Aquí se mostrará la información completa del seguimiento.</p>
      </div>
    </div>
  );
};

export default DetalleSeguimiento;
