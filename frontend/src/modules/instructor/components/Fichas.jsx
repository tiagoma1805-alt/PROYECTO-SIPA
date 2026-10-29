// src/modules/instructor/components/Fichas.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '../../shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';
import './Fichas.css';

const Fichas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarFichas();
  }, []);

  const cargarFichas = async () => {
    try {
      setLoading(true);
      setError(null);

      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor?.id;

      if (!instructorId) throw new Error('No se encontró el instructor logueado');

      const asignaciones = await apiClient.get('/asignaciones', {
        params: { instructor_id: instructorId, solo_activas: true },
      });

      const fichasConDatos = await Promise.all(
        (Array.isArray(asignaciones) ? asignaciones : []).map(async (a) => {
          try {
            const ficha = await apiClient.get(`/fichas/${a.ficha_id}`);
            const aprendices = await apiClient.get(`/fichas/${a.ficha_id}/aprendices`).catch(() => []);
            const programa = await apiClient.get(`/programas/${ficha.programa_id}`).catch(() => null);

            const fechaInicioStr = ficha.fecha_inicio
              ? new Date(ficha.fecha_inicio).toLocaleDateString('es-ES')
              : '—';
            const fechaFinStr = ficha.fecha_fin
              ? new Date(ficha.fecha_fin).toLocaleDateString('es-ES')
              : '—';

            // 🔥 Calcular el estado con 4 posibilidades
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fi = ficha.fecha_inicio ? new Date(ficha.fecha_inicio) : null;
            const ff = ficha.fecha_fin ? new Date(ficha.fecha_fin) : null;

            let estado = 'activa';
            let mensaje = 'Activa';
            let color = '#10b981';

            if (fi && ff) {
              if (hoy < fi) {
                // Futura → NO activa
                estado = 'futura';
                mensaje = `Se activará el ${fechaInicioStr}`;
                color = '#6b7280';
              } else if (hoy > ff) {
                // Ya terminó
                estado = 'finalizada';
                mensaje = `Finalizada el ${fechaFinStr}`;
                color = '#ef4444';
              } else {
                // Activa - verificar si está próxima a terminar
                const diasRestantes = Math.ceil((ff - hoy) / (1000 * 60 * 60 * 24));
                console.log(`📅 Ficha ${ficha.numero_ficha}: ${diasRestantes} días restantes`);

                if (diasRestantes <= 60) {
                  // Menos de 2 meses → próxima a terminar
                  estado = 'proxima';
                  mensaje = `Próxima a terminar (${diasRestantes} días)`;
                  color = '#f59e0b';
                } else {
                  estado = 'activa';
                  mensaje = 'Activa';
                  color = '#10b981';
                }
              }
            }

            return {
              codigo: ficha.numero_ficha,
              programa: programa?.nombre || 'Sin programa',
              nivel: ficha.nivel || 'Tecnólogo',
              aprendices: Array.isArray(aprendices) ? aprendices.length : 0,
              fechaInicio: fechaInicioStr,
              fechaFin: fechaFinStr,
              esActiva: estado === 'activa' || estado === 'proxima',
              estado,
              mensaje,
              color,
            };
          } catch (err) {
            console.error(`Error al cargar ficha ${a.ficha_id}:`, err);
            return null;
          }
        })
      );

      const fichasValidas = fichasConDatos.filter((f) => f !== null);
      setFichas(fichasValidas);
    } catch (err) {
      console.error('Error al cargar fichas:', err);
      setError(err.message || 'Error al cargar las fichas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const filteredFichas = fichas.filter(
    (ficha) =>
      (ficha.codigo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ficha.programa || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerFicha = (ficha) => {
    if (ficha.estado === 'futura') {
      Swal.fire({
        title: '🔒 Ficha no activa',
        text: `Esta ficha se activará el ${ficha.fechaInicio}.`,
        icon: 'info',
        confirmButtonColor: '#3ca203',
      });
      return;
    }
    if (ficha.estado === 'finalizada') {
      Swal.fire({
        title: '⚠️ Ficha finalizada',
        text: `Esta ficha terminó el ${ficha.fechaFin}.`,
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }
    navigate(`/instructor/ficha/${ficha.codigo}`);
  };

  const getBadgeStyle = (ficha) => {
    const colores = {
      activa: { bg: '#d1fae5', text: '#047857' },
      proxima: { bg: '#fef3c7', text: '#d97706' },
      futura: { bg: '#f3f4f6', text: '#6b7280' },
      finalizada: { bg: '#fee2e2', text: '#dc2626' },
    };
    return colores[ficha.estado] || colores.futura;
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando fichas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={cargarFichas}
          style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}
        >
          <i className="fas fa-redo" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="fichas-container">
      <Breadcrumb />

      <div className="fichas-header">
        <h2>Mis Fichas de Formación</h2>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por código de ficha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-search" onClick={handleSearch}>Buscar</button>
        <button className="btn-clear" onClick={handleClear}>Limpiar</button>
      </div>

      {filteredFichas.length === 0 ? (
        <div className="not-found">
          <h2><i className="fas fa-exclamation-circle"></i> {searchQuery ? 'Dato no encontrado' : 'No tienes fichas asignadas'}</h2>
          <p>{searchQuery ? 'No existe ninguna ficha con el código ingresado.' : 'Contacta al coordinador para que te asigne fichas.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="fichas-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Programa</th>
                <th>Nivel</th>
                <th>Aprendices</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichas.map((ficha) => {
                const badge = getBadgeStyle(ficha);
                return (
                  <tr key={ficha.codigo}>
                    <td className="codigo">{ficha.codigo}</td>
                    <td>{ficha.programa}</td>
                    <td>{ficha.nivel}</td>
                    <td>{ficha.aprendices}</td>
                    <td>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.text,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ficha.mensaje}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {ficha.esActiva ? (
                        <button className="btn-ver-ficha" onClick={() => handleVerFicha(ficha)}>
                          <i className="fas fa-eye" /> Ver
                        </button>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fas fa-lock" style={{ fontSize: '11px' }} />
                          No disponible
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Fichas;
