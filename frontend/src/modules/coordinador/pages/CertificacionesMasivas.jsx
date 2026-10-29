// src/pages/coordinador/CertificacionesMasivas.jsx
import React from 'react';

const CertificacionesMasivas = () => {
  return (
    <div style={{ 
      width: '100%', 
      padding: '20px 0', 
      boxSizing: 'border-box' 
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>Certificaciones Masivas</h2>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
          Gestiona la descarga masiva de certificados por ficha.
        </p>
      </div>

      {/* Botón de descarga masiva */}
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '0 0 15px 0', color: '#6b7280' }}>
          Haz clic en el botón para descargar los certificados de todos los aprendices de una ficha.
        </p>
        <button style={{ 
          backgroundColor: '#39A900', 
          color: 'white', 
          border: 'none', 
          padding: '12px 30px', 
          borderRadius: '8px', 
          fontSize: '16px', 
          fontWeight: 'bold', 
          cursor: 'pointer',
          transition: '0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8a00'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#39A900'}
        onClick={() => alert('📦 Descarga masiva iniciada.')}
        >
          <i className="fas fa-download" style={{ marginRight: '8px' }}></i>
          Descargar certificados masivos
        </button>
      </div>

      {/* Tabla de ejemplo */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px' }}>Vista previa de fichas listas</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '12px 15px', color: '#6b7280' }}>Ficha</th>
              <th style={{ textAlign: 'left', padding: '12px 15px', color: '#6b7280' }}>Programa</th>
              <th style={{ textAlign: 'center', padding: '12px 15px', color: '#6b7280' }}>Aprendices listos</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>2875901</td>
              <td style={{ padding: '15px' }}>Análisis y Desarrollo de Software</td>
              <td style={{ textAlign: 'center', padding: '15px' }}>
                <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: '20px' }}>18</span>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>2875902</td>
              <td style={{ padding: '15px' }}>Gestión Empresarial</td>
              <td style={{ textAlign: 'center', padding: '15px' }}>
                <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: '20px' }}>20</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificacionesMasivas;
