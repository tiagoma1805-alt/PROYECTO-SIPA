// src/modules/coordinador/pages/Parametrizacion.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';

const Parametrizacion = () => {
  const navigate = useNavigate();

  // Datos de las tarjetas de parametrización
  const cards = [
    { 
      id: 1, 
      titulo: 'Fichas', 
      descripcion: 'Gestiona las fichas de formación', 
      icono: 'fa-layer-group', 
      ruta: '/coordinador/fichas-parametrizacion'
    },
    { 
      id: 2, 
      titulo: 'Empresas', 
      descripcion: 'Administra las empresas del sistema', 
      icono: 'fa-building', 
      ruta: '/coordinador/empresas'
    },
    { 
      id: 3, 
      titulo: 'Aprendices', 
      descripcion: 'Visualiza los aprendices registrados', 
      icono: 'fa-users', 
      ruta: '/coordinador/aprendices'
    },
    { 
      id: 4, 
      titulo: 'Instructores', 
      descripcion: 'Gestiona los instructores del sistema', 
      icono: 'fa-user-tie', 
      ruta: '/coordinador/instructores'
    },
  ];

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      {/* MIGAS DE PAN */}
      <Breadcrumb />

      {/* ENCABEZADO */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>
          Parametrización General
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
          Gestiona los recursos globales del sistema.
        </p>
      </div>

      {/* TARJETAS DE PARAMETRIZACIÓN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(card.ruta)}
            style={{
              background: 'white',
              padding: '30px 20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
            }}
          >
            {/* ÍCONO EN COLOR VERDE */}
            <i className={`fas ${card.icono}`} style={{ fontSize: '40px', color: '#3ca203', marginBottom: '15px', display: 'block' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>{card.titulo}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>{card.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Parametrizacion;