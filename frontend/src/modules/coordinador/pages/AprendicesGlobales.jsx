// src/modules/coordinador/pages/AprendicesGlobales.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { procesoService } from '@/core/services/procesoService';

const AprendicesGlobales = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procesoService.getProcesos({ solo_activos: true });
      console.log('👥 Procesos recibidos:', data);
      setProcesos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar procesos:', err);
      setError(err.message || 'Error al cargar aprendices');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  // Filtro
  const filteredProcesos = procesos.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nombre = (p.aprendiz_nombre || '').toLowerCase();
    const email = (p.aprendiz_email || '').toLowerCase();
    const documento = (p.aprendiz_documento || '').toLowerCase();
    return nombre.includes(q) || email.includes(q) || documento.includes(q);
  });

  const getIniciales = (nombre) => {
    if (!nombre) return '??';
    const partes = nombre.split(' ');
    if (partes.length >= 2) {
      return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
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

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando aprendices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar aprendices</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={cargarDatos}
          style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}
        >
          <i className="fas fa-redo" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          Aprendices Globales
        </h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
          Visualización de aprendices del sistema.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: '5px 0 0 0' }}>
          Total: {procesos.length} aprendices
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none' }}
        />
        <button
          onClick={handleSearch}
          style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <i className="fas fa-search" /> Buscar
        </button>
        <button
          onClick={handleClear}
          style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <i className="fas fa-times" /> Limpiar
        </button>
      </div>

      {filteredProcesos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-user-slash" style={{ fontSize: '48px', color: '#dc2626', marginBottom: '16px' }} />
          <h3 style={{ color: '#dc2626' }}>{searchQuery ? 'Dato no encontrado' : 'No hay aprendices en etapa'}</h3>
          <p style={{ color: '#6b7280' }}>
            {searchQuery ? `No se encontraron aprendices que coincidan con "${searchQuery}"` : 'No hay procesos activos.'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontWeight: '600' }}>Aprendiz</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontWeight: '600' }}>Correo</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontWeight: '600' }}>Documento</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontWeight: '600' }}>Ficha</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontWeight: '600' }}>Empresa</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontWeight: '600' }}>ARL</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontWeight: '600' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesos.map((p) => {
                const config = getEstadoConfig(p.estado);
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#3ca203',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px',
                          }}
                        >
                          {getIniciales(p.aprendiz_nombre)}
                        </div>
                        <span>{p.aprendiz_nombre || 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>{p.aprendiz_email || 'Sin correo'}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ background: '#f3f4f6', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                        {p.aprendiz_documento || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ background: '#f3f4f6', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                        {p.ficha_numero || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {p.empresa_nombre || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sin asignar</span>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      {p.arl ? (
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          {p.arl}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span
                        style={{
                          background: `${config.color}15`,
                          color: config.color,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <i className={`fas ${config.icono}`}></i>
                        {config.etiqueta}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <button
                        onClick={() => navigate(`/coordinador/aprendices/${p.aprendiz_id}`, { state: { proceso: p } })}
                        style={{
                          background: '#e6f7ed',
                          color: '#047857',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <i className="fas fa-eye" /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '14px' }}>
            <span>Mostrando {filteredProcesos.length} de {procesos.length} aprendices</span>
            <span>{searchQuery && `Filtrado por: "${searchQuery}"`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AprendicesGlobales;