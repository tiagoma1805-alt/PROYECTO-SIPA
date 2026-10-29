// src/modules/admin/pages/ReportesGlobales.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reporteService } from '@/core/services/reporteService';

const ReportesGlobales = () => {
  const location = useLocation();
  const esApoyo = location.pathname.startsWith('/apoyo');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reporteService.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando reportes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar reportes</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
      </div>
    );
  }

  const rolesFiltrados = (data?.distribucion_roles || []).filter((r) =>
    r.rol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
          Reportes Globales {esApoyo ? '- Consulta' : '- Gestión'}
        </h2>
        <p style={{ color: '#6b7280' }}>
          {esApoyo
            ? 'Visualización de métricas del sistema.'
            : 'Métricas clave del crecimiento y estado del sistema.'}
        </p>
      </div>

      {/* ===== TARJETAS DE RESUMEN ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h4 style={{ color: '#3ca203', marginBottom: '5px' }}>Nuevos Usuarios</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{data?.nuevos_usuarios_mes ?? 0}</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>en el último mes</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h4 style={{ color: '#3ca203', marginBottom: '5px' }}>Nuevas Fichas</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{data?.nuevas_fichas_mes ?? 0}</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>en el último mes</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h4 style={{ color: '#3ca203', marginBottom: '5px' }}>Instructores Activos</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{data?.instructores_activos ?? 0}</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>gestionando fichas</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h4 style={{ color: '#3ca203', marginBottom: '5px' }}>Total Aprendices</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{data?.total_aprendices ?? 0}</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>matriculados en el sistema</p>
        </div>
      </div>

      {/* ===== EVOLUCIÓN DE USUARIOS ===== */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '15px' }}>
          Evolución de Usuarios (últimos 6 meses)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
          {(data?.evolucion_usuarios || []).map((item, idx) => (
            <div key={idx} style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', color: '#1f2937' }}>{item.mes}</p>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#3ca203', margin: 0 }}>{item.usuarios}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DISTRIBUCIÓN DE ROLES ===== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            Distribución de Roles
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Buscar rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
            />
            <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
              Buscar
            </button>
            <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
              Limpiar
            </button>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
          {rolesFiltrados.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
              No se encontraron roles con ese nombre.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Rol</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {rolesFiltrados.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{item.rol}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#e6f7ed', color: '#047857', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                        {item.cantidad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportesGlobales;