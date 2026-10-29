// src/pages/coordinador/VerAprendices.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { fichasData } from '@/data/coordinadorData'; // <--- CORREGIDO con @

const VerAprendices = () => {
  const { idFicha } = useParams();
  const ficha = fichasData.find(f => f.idFicha === idFicha);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!ficha) return <div style={{ padding: '40px', textAlign: 'center' }}>Ficha no encontrada</div>;

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const filteredAprendices = ficha.aprendices.filter(a =>
    a.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.includes(searchQuery)
  );

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Ficha {ficha.idFicha}</h2>
      <p style={{ color: '#6b7280' }}>{ficha.programa}</p>

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o identificación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button onClick={handleSearch} style={{ background: '#39A900', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px' }}>Buscar</button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px' }}>Limpiar</button>
      </div>

      {filteredAprendices.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: '#dc2626' }}>Dato no encontrado</h3>
          <p style={{ color: '#6b7280' }}>No hay aprendices con ese criterio de búsqueda.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {filteredAprendices.map(a => (
            <div key={a.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <p><strong>{a.nombre}</strong></p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Identificación: {a.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerAprendices;
