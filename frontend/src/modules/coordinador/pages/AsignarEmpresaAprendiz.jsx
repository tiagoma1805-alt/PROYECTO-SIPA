// src/pages/coordinador/AsignarEmpresaAprendiz.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showSuccess, showError, showWarning, showConfirm, showToast } from '@/core/utils/sweetAlert';

const AsignarEmpresaAprendiz = () => {
  const navigate = useNavigate();
  const { idFicha, aprendizId } = useParams();

  const aprendiz = {
    id: parseInt(aprendizId),
    nombre: 'Maria Camila Torres',
    ficha: idFicha,
    programa: 'Análisis y Desarrollo de Software'
  };

  const [empresas] = useState([
    { id: 1, nombre: 'TechSoft S.A.S.', arl: 'SURA' },
    { id: 2, nombre: 'Innovar Solutions', arl: 'Positiva' },
    { id: 3, nombre: 'Global Services LTDA', arl: 'Colmena' },
    { id: 4, nombre: 'DataTech Colombia', arl: 'Positiva' },
  ]);

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');

  const handleAsignar = async () => {
    if (!empresaSeleccionada) {
      await showWarning('Por favor, selecciona una empresa.', '⚠️ Campo requerido');
      return;
    }

    const result = await showConfirm(
      `¿Deseas asignar "${empresaSeleccionada}" a ${aprendiz.nombre}?`,
      'Confirmar asignación',
      'Sí, asignar'
    );

    if (result.isConfirmed) {
      const empresaData = empresas.find(e => e.id.toString() === empresaSeleccionada);
      
      await showSuccess(
        `Empresa "${empresaData.nombre}" (ARL: ${empresaData.arl}) asignada a ${aprendiz.nombre}.`,
        '✅ Asignación exitosa'
      );

      navigate(`/coordinador/ficha-completa/${idFicha}`);
    }
  };

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <button 
        onClick={() => navigate(`/coordinador/ficha-completa/${idFicha}`)}
        style={{ background: 'transparent', border: 'none', color: '#3ca203', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <i className="fas fa-arrow-left" /> Volver a la ficha
      </button>

      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Asignar Empresa</h2>
        <p style={{ color: '#6b7280' }}>
          Asignando empresa a <strong>{aprendiz.nombre}</strong> de la ficha <strong>{aprendiz.ficha}</strong>
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Programa: {aprendiz.programa}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Selecciona una empresa:</label>
        <select
          value={empresaSeleccionada}
          onChange={(e) => setEmpresaSeleccionada(e.target.value)}
          style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
        >
          <option value="">-- Selecciona una empresa --</option>
          {empresas.map(e => (
            <option key={e.id} value={e.id}>{e.nombre} (ARL: {e.arl})</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate(`/coordinador/ficha-completa/${idFicha}`)}
          style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleAsignar}
          style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Asignar
        </button>
      </div>
    </div>
  );
};

export default AsignarEmpresaAprendiz;
