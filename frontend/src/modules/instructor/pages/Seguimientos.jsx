// src/pages/instructor/Seguimientos.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../shared/components/Breadcrumb';

const Seguimientos = () => {
  const navigate = useNavigate();

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

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Seguimientos</h2>
      <p style={{ color: '#6b7280' }}>Aquí se mostrarán todos los seguimientos realizados.</p>

      <div style={{ marginTop: '20px', background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
        <i className="fas fa-clipboard-list" style={{ fontSize: '48px', color: '#3ca203', marginBottom: '15px' }} />
        <h3 style={{ color: '#1f2937' }}>Lista de Seguimientos</h3>
        <p style={{ color: '#6b7280' }}>Aquí podrás ver y gestionar todos tus seguimientos.</p>
      </div>
    </div>
  );
};

export default Seguimientos;
