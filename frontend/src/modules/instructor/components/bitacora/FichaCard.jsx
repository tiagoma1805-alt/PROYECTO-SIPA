// src/modules/instructor/components/bitacora/FichaCard.jsx
import React from 'react';

const FichaCard = ({ ficha, onClick }) => {
  return (
    <div
      className="ficha-card"
      onClick={onClick}
      style={{
        background: 'white',
        padding: '25px 20px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        textAlign: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#3ca203';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <div style={{ fontSize: '36px', color: '#3ca203', marginBottom: '10px' }}>
        <i className="fas fa-layer-group" />
      </div>
      <h4 style={{ fontWeight: 'bold', margin: '5px 0', color: '#1f2937', fontSize: '18px' }}>
        {ficha.id}
      </h4>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>{ficha.programa}</p>
      <div style={{ marginTop: '12px' }}>
        <span style={{
          background: '#e6f7ed',
          color: '#047857',
          padding: '2px 10px',
          borderRadius: '12px',
          fontSize: '12px'
        }}>
          <i className="fas fa-users" /> {ficha.aprendices.length} aprendices
        </span>
      </div>
      <div style={{ marginTop: '12px', fontSize: '13px', color: '#3ca203' }}>
        <i className="fas fa-eye" /> Ver aprendices
      </div>
    </div>
  );
};

export default FichaCard;