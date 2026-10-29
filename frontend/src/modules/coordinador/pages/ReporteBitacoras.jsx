// src/modules/coordinador/pages/ReporteBitacoras.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { fichaService } from '@/core/services/fichaService';
import { bitacoraService } from '@/core/services/bitacoraService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ReporteBitacoras = () => {
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

      const fichasData = await fichaService.getFichas({ solo_activas: true });
      console.log('📋 Fichas:', fichasData);

      const fichasConDatos = await Promise.all(
        (Array.isArray(fichasData) ? fichasData : []).map(async (f) => {
          try {
            const detalle = await bitacoraService.getBitacorasByFicha(f.id);
            const aprendices = detalle?.aprendices || [];
            const totalBitacoras = aprendices.reduce(
              (acc, a) => acc + (a.bitacoras?.length || 0),
              0
            );

            let instructor = 'Sin asignar';
            try {
              const asignaciones = await fetch(
                `${API_BASE_URL}/asignaciones?ficha_id=${f.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                }
              ).then((r) => (r.ok ? r.json() : []));

              const activa = Array.isArray(asignaciones)
                ? asignaciones.find((a) => a.is_active)
                : null;

              if (activa) {
                const instr = await fetch(
                  `${API_BASE_URL}/usuarios/${activa.instructor_id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                  }
                ).then((r) => (r.ok ? r.json() : null));

                if (instr) {
                  instructor = `${instr.nombre || ''} ${instr.apellido || ''}`.trim();
                }
              }
            } catch (e) {
              console.warn('Error obteniendo instructor:', e);
            }

            return {
              id: f.numero_ficha,
              fichaId: f.id,
              programa: detalle?.programa || 'Sin programa',
              instructor,
              aprendices: aprendices.length,
              totalBitacoras,
            };
          } catch (err) {
            console.warn(`Error al cargar ficha ${f.id}:`, err);
            return {
              id: f.numero_ficha,
              fichaId: f.id,
              programa: '—',
              instructor: 'Sin asignar',
              aprendices: 0,
              totalBitacoras: 0,
            };
          }
        })
      );

      setFichas(fichasConDatos);
    } catch (err) {
      console.error('Error al cargar:', err);
      setError(err.message || 'Error al cargar fichas');
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
      (f.id || '').toLowerCase().includes(q) ||
      (f.programa || '').toLowerCase().includes(q) ||
      (f.instructor || '').toLowerCase().includes(q)
    );
  });

  const handleVerFicha = (fichaId) => {
    navigate(`/coordinador/reporte-bitacoras/ficha/${fichaId}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando bitácoras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={cargarFichas}
          style={{
            background: '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '15px',
          }}
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
          Reporte de Bitácoras
        </h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
          Visualización de bitácoras de los aprendices organizadas por ficha.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por ficha, programa o instructor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            background: '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>
        <button
          onClick={handleClear}
          style={{
            background: '#e5e7eb',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Limpiar
        </button>
      </div>

      {filteredFichas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: '#dc2626' }}>Dato no encontrado</h3>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {filteredFichas.map((f) => (
            <div
              key={f.fichaId}
              onClick={() => handleVerFicha(f.fichaId)}
              style={{
                background: 'white',
                padding: '25px 20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
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
              <h4
                style={{
                  fontWeight: 'bold',
                  margin: '5px 0',
                  color: '#1f2937',
                  fontSize: '18px',
                }}
              >
                Ficha {f.id}
              </h4>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>
                {f.programa}
              </p>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '5px 0' }}>
                <i className="fas fa-user-tie" style={{ marginRight: '6px' }} />
                {f.instructor}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginTop: '12px',
                }}
              >
                <span
                  style={{
                    background: '#e6f7ed',
                    color: '#047857',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                >
                  <i className="fas fa-users" /> {f.aprendices} aprendices
                </span>
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0ea5e9',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                >
                  <i className="fas fa-book" /> {f.totalBitacoras} bitácoras
                </span>
              </div>
              <div
                style={{
                  marginTop: '12px',
                  fontSize: '13px',
                  color: '#3ca203',
                }}
              >
                <i className="fas fa-eye" /> Ver bitácoras
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReporteBitacoras;