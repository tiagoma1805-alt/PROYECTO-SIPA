// src/modules/coordinador/pages/MomentosCoordinador.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import Swal from 'sweetalert2';
import { seguimientoService } from '@/core/services/seguimientoService';

const MomentosCoordinador = () => {
  const navigate = useNavigate();
  const [momentoSeleccionado, setMomentoSeleccionado] = useState(null);
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);

  const [momentosData, setMomentosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTermFichas, setSearchTermFichas] = useState('');
  const [searchQueryFichas, setSearchQueryFichas] = useState('');
  const [searchTermAprendices, setSearchTermAprendices] = useState('');
  const [searchQueryAprendices, setSearchQueryAprendices] = useState('');

  useEffect(() => {
    cargarMomentos();
  }, []);

  const cargarMomentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await seguimientoService.getMomentos();
      console.log('📊 Momentos:', data);
      setMomentosData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar momentos:', err);
      setError(err.message || 'Error al cargar momentos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerMomento = (id) => {
    const momento = momentosData.find((m) => m.id === id);
    setMomentoSeleccionado(momento);
    setFichaSeleccionada(null);
    setSearchTermFichas('');
    setSearchQueryFichas('');
  };

  const handleVolverMomentos = () => {
    setMomentoSeleccionado(null);
    setFichaSeleccionada(null);
  };

  const handleVerFicha = (idFicha) => {
    const ficha = momentoSeleccionado.fichas.find((f) => f.idFicha === idFicha);
    setFichaSeleccionada(ficha);
    setSearchTermAprendices('');
    setSearchQueryAprendices('');
  };

  const handleVolverFichas = () => {
    setFichaSeleccionada(null);
  };

  const handleSearchFichas = () => setSearchQueryFichas(searchTermFichas);
  const handleClearFichas = () => {
    setSearchTermFichas('');
    setSearchQueryFichas('');
  };

  const handleSearchAprendices = () => setSearchQueryAprendices(searchTermAprendices);
  const handleClearAprendices = () => {
    setSearchTermAprendices('');
    setSearchQueryAprendices('');
  };

  const handleVerDetalleAprendiz = (aprendiz) => {
    Swal.fire({
      title: `📋 ${aprendiz.nombre}`,
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Estado:</strong></div>
            <div><span style="color: ${aprendiz.estado === 'Completado' ? '#10b981' : aprendiz.estado === 'En proceso' ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${aprendiz.estado}</span></div>
            <div><strong>Fecha:</strong></div>
            <div>${aprendiz.fecha}</div>
          </div>
          <hr style="border: 1px solid #e5e7eb; margin: 15px 0;" />
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.6;">
              <strong>Observación:</strong> ${aprendiz.observacion}
            </p>
          </div>
        </div>
      `,
      icon: 'info',
      iconColor: '#3ca203',
      confirmButtonColor: '#3ca203',
      confirmButtonText: 'Cerrar',
      width: '500px',
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando momentos...</p>
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
          onClick={cargarMomentos}
          style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}
        >
          <i className="fas fa-redo" /> Reintentar
        </button>
      </div>
    );
  }

  if (fichaSeleccionada) {
    const filteredAprendices = fichaSeleccionada.aprendices.filter(
      (a) =>
        a.nombre.toLowerCase().includes(searchQueryAprendices.toLowerCase()) ||
        a.estado.toLowerCase().includes(searchQueryAprendices.toLowerCase())
    );

    return (
      <div style={{ width: '100%', padding: '20px 0' }}>
        <Breadcrumb />
        <button
          onClick={handleVolverFichas}
          style={{ background: 'transparent', border: 'none', color: '#3ca203', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}
        >
          <i className="fas fa-arrow-left" /> Volver a fichas
        </button>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            Ficha {fichaSeleccionada.idFicha} - {fichaSeleccionada.programa}
          </h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
            Instructor: {fichaSeleccionada.instructor} • {fichaSeleccionada.aprendices.length} aprendices
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar por aprendiz o estado..."
            value={searchTermAprendices}
            onChange={(e) => setSearchTermAprendices(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
          <button onClick={handleSearchAprendices} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Buscar</button>
          <button onClick={handleClearAprendices} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
        </div>

        {filteredAprendices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#dc2626' }}>Dato no encontrado</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {filteredAprendices.map((a) => (
              <div
                key={a.id}
                onClick={() => handleVerDetalleAprendiz(a)}
                style={{
                  background: 'white',
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: `2px solid ${a.estado === 'Completado' ? '#10b981' : a.estado === 'En proceso' ? '#f59e0b' : '#ef4444'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', color: '#1f2937' }}>{a.nombre}</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    <i className="fas fa-calendar-alt" style={{ marginRight: '4px' }} />
                    {a.fecha}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      background: a.estado === 'Completado' ? '#d1fae5' : a.estado === 'En proceso' ? '#fef3c7' : '#f3f4f6',
                      color: a.estado === 'Completado' ? '#047857' : a.estado === 'En proceso' ? '#d97706' : '#6b7280',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    {a.estado}
                  </span>
                  <i className="fas fa-chevron-right" style={{ marginLeft: '10px', color: '#9ca3af', fontSize: '12px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (momentoSeleccionado) {
    const filteredFichas = momentoSeleccionado.fichas.filter(
      (f) =>
        f.idFicha.toLowerCase().includes(searchQueryFichas.toLowerCase()) ||
        f.programa.toLowerCase().includes(searchQueryFichas.toLowerCase()) ||
        f.instructor.toLowerCase().includes(searchQueryFichas.toLowerCase())
    );

    return (
      <div style={{ width: '100%', padding: '20px 0' }}>
        <Breadcrumb />
        <button
          onClick={handleVolverMomentos}
          style={{ background: 'transparent', border: 'none', color: '#3ca203', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}
        >
          <i className="fas fa-arrow-left" /> Volver a momentos
        </button>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {momentoSeleccionado.titulo}
          </h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
            {momentoSeleccionado.descripcion} • {momentoSeleccionado.fichas.length} fichas
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar por ficha, programa o instructor..."
            value={searchTermFichas}
            onChange={(e) => setSearchTermFichas(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
          <button onClick={handleSearchFichas} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Buscar</button>
          <button onClick={handleClearFichas} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
        </div>

        {filteredFichas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#dc2626' }}>Dato no encontrado</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {filteredFichas.map((f) => {
              const completados = f.aprendices.filter((a) => a.estado === 'Completado').length;
              const total = f.aprendices.length;

              return (
                <div
                  key={f.idFicha}
                  onClick={() => handleVerFicha(f.idFicha)}
                  style={{
                    background: 'white',
                    padding: '25px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: '#3ca203', fontSize: '16px' }}>
                      Ficha {f.idFicha}
                    </h4>
                    <span style={{ background: '#e6f7ed', color: '#047857', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                      {completados}/{total}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 5px 0', fontSize: '14px', color: '#1f2937' }}>{f.programa}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    <i className="fas fa-user-tie" style={{ marginRight: '6px' }} />
                    {f.instructor}
                  </p>
                  <div style={{ marginTop: '12px', width: '100%', height: '6px', background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${total > 0 ? (completados / total) * 100 : 0}%`,
                        height: '100%',
                        background: (completados / total) >= 0.8 ? '#10b981' : (completados / total) >= 0.5 ? '#f59e0b' : '#ef4444',
                        borderRadius: '10px',
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '13px', color: '#3ca203', textAlign: 'center' }}>
                    <i className="fas fa-eye" /> Ver aprendices
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>
          Seguimiento por Momentos
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
          Selecciona un momento para ver el avance de las fichas.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
        {momentosData.map((momento) => (
          <div
            key={momento.id}
            onClick={() => handleVerMomento(momento.id)}
            style={{
              background: 'white',
              padding: '35px 25px',
              borderRadius: '16px',
              border: `2px solid ${momento.color}20`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: `${momento.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px auto',
                border: `2px solid ${momento.color}30`,
              }}
            >
              <i className={`fas ${momento.icono}`} style={{ fontSize: '28px', color: momento.color }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>
              {momento.titulo}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 15px 0' }}>
              {momento.descripcion}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <span style={{ background: '#e6f7ed', color: '#047857', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                <i className="fas fa-layer-group" style={{ marginRight: '6px' }} />
                {momento.fichas.length} fichas
              </span>
              <span style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                <i className="fas fa-users" style={{ marginRight: '6px' }} />
                {momento.fichas.reduce((acc, f) => acc + f.aprendices.length, 0)} aprendices
              </span>
            </div>
            <div style={{ marginTop: '15px', fontSize: '14px', color: momento.color, fontWeight: '500' }}>
              Ver detalle <i className="fas fa-arrow-right" style={{ marginLeft: '6px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MomentosCoordinador;