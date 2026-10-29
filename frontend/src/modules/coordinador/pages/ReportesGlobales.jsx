// src/modules/coordinador/pages/ReportesGlobales.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { reporteService } from '@/core/services/reporteService';

const ReportesGlobales = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarFichas();
  }, []);

  const cargarFichas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reporteService.getFichasReporte();
      console.log('📊 Fichas reporte:', data);
      setFichas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      setError(err.message || 'Error al cargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const filteredFichas = fichas.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (f.numero_ficha || '').toLowerCase().includes(q) ||
      (f.programa || '').toLowerCase().includes(q) ||
      (f.instructor || '').toLowerCase().includes(q)
    );
  });

  const getColorPorcentaje = (p) => {
    if (p >= 80) return '#10b981';
    if (p >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return fecha;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando reporte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar reporte</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarFichas} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          <i className="fas fa-redo" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Reporte de Fichas</h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
          Listado detallado de fichas con instructor, fechas y avance.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por ficha, programa o instructor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          <i className="fas fa-search" /> Buscar
        </button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          <i className="fas fa-times" /> Limpiar
        </button>
      </div>

      {filteredFichas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280' }}>{searchQuery ? 'Dato no encontrado' : 'No hay fichas registradas'}</h3>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Ficha</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Programa</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Instructor</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Aprendices</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Fecha Inicio</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Fecha Fin</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichas.map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#3ca203' }}>{f.numero_ficha}</td>
                  <td style={{ padding: '12px' }}>{f.programa || '—'}</td>
                  <td style={{ padding: '12px' }}>{f.instructor || 'Sin asignar'}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{f.aprendices || 0}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{formatearFecha(f.fecha_inicio)}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{formatearFecha(f.fecha_fin)}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <button
                      onClick={() => navigate(`/coordinador/reportes/ficha/${f.id}`)}
                      style={{
                        background: '#e6f7ed',
                        color: '#047857',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <i className="fas fa-eye" /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportesGlobales;