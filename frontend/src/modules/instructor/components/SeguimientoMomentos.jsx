// src/modules/instructor/components/SeguimientoMomentos.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/core/api/client';
import './SeguimientoMomentos.css';

const SeguimientoMomentos = () => {
  const navigate = useNavigate();
  const [momentoSeleccionado, setMomentoSeleccionado] = useState(null);
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [aprendizModal, setAprendizModal] = useState(null);

  const [momentos, setMomentos] = useState([]);
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
      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor && instructor.id;
      if (!instructorId) throw new Error('No se encontro el instructor logueado');

      const data = await apiClient.get('/instructor/momentos/' + instructorId);
      setMomentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar momentos:', err);
      setError(err.message || 'Error al cargar seguimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerMomento = (id) => {
    const momento = momentos.find(m => m.id === id);
    setMomentoSeleccionado(momento);
    setFichaSeleccionada(null);
    setSearchTermFichas('');
    setSearchQueryFichas('');
  };

  const handleVolverMomentos = () => {
    setMomentoSeleccionado(null);
    setFichaSeleccionada(null);
    setAprendizModal(null);
  };

  const handleVerFicha = (idFicha) => {
    const ficha = momentoSeleccionado.fichas.find(f => f.idFicha === idFicha);
    setFichaSeleccionada(ficha);
    setSearchTermAprendices('');
    setSearchQueryAprendices('');
    setAprendizModal(null);
  };

  const handleVolverFichas = () => {
    setFichaSeleccionada(null);
    setAprendizModal(null);
  };

  const handleVerDetalle = (aprendiz) => {
    setAprendizModal(aprendiz);
  };

  const handleCerrarModal = () => {
    setAprendizModal(null);
  };

  const handleSearchFichas = () => setSearchQueryFichas(searchTermFichas);
  const handleClearFichas = () => { setSearchTermFichas(''); setSearchQueryFichas(''); };

  const handleSearchAprendices = () => setSearchQueryAprendices(searchTermAprendices);
  const handleClearAprendices = () => { setSearchTermAprendices(''); setSearchQueryAprendices(''); };

  const goToInicio = () => {
    navigate('/instructor');
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando seguimientos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarMomentos} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          Reintentar
        </button>
      </div>
    );
  }

  // --- Renderizado NIVEL 3: Aprendices de una ficha ---
  if (fichaSeleccionada) {
    const filteredAprendices = fichaSeleccionada.aprendices.filter(a =>
      a.nombre.toLowerCase().includes(searchQueryAprendices.toLowerCase())
    );

    return (
      <div className="momento-detalle-pantalla">
        <nav style={{ padding: '10px 0', marginBottom: '10px', fontSize: '14px', background: 'transparent', borderBottom: '1px solid #e5e7eb' }}>
          <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0, gap: '4px' }}>
            <li style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px' }}>
              <span onClick={goToInicio} style={{ color: '#3ca203', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>Inicio</span>
              <span style={{ margin: '0 4px', color: '#9ca3af' }}> &gt; </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px' }}>
              <span onClick={handleVolverMomentos} style={{ color: '#3ca203', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>Seguimiento por Momentos</span>
              <span style={{ margin: '0 4px', color: '#9ca3af' }}> &gt; </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>
              Ficha {fichaSeleccionada.idFicha}
            </li>
          </ol>
        </nav>

        <div className="detalle-header">
          <button className="btn-volver-lista" onClick={handleVolverFichas}>
            <i className="fas fa-arrow-left" /> Volver a fichas
          </button>
          <h2 className="detalle-titulo">Ficha {fichaSeleccionada.idFicha}</h2>
          <p className="detalle-subtitulo">{fichaSeleccionada.programa}</p>
        </div>

        <div className="search-container">
          <input type="text" className="search-input" placeholder="Buscar aprendiz..." value={searchTermAprendices} onChange={(e) => setSearchTermAprendices(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchAprendices()} />
          <button className="btn-search" onClick={handleSearchAprendices}>Buscar</button>
          <button className="btn-clear" onClick={handleClearAprendices}>Limpiar</button>
        </div>

        <div className="aprendices-list-container">
          {filteredAprendices.length === 0 ? (
            <p className="sin-registros">No se encontraron aprendices con ese nombre.</p>
          ) : (
            <div className="aprendices-grid">
              {filteredAprendices.map((ap) => (
                <div key={ap.id} className="aprendiz-card">
                  <div className="aprendiz-card-header">
                    <span className="aprendiz-nombre">
                      <i className="fas fa-user" /> {ap.nombre}
                    </span>
                    <button className="btn-ver-detalle-aprendiz" onClick={() => handleVerDetalle(ap)}>
                      <i className="fas fa-eye" /> Ver
                    </button>
                  </div>
                  <div className="aprendiz-card-body">
                    <p><strong>Seguimiento:</strong> {ap.seguimiento}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {aprendizModal && (
          <div className="modal-overlay" onClick={handleCerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={handleCerrarModal}>&times;</button>
              <h3 className="modal-title">Detalle de Seguimiento</h3>
              <div className="modal-aprendiz-info">
                <p><strong>Aprendiz:</strong> {aprendizModal.nombre}</p>
                <p><strong>Ficha:</strong> {fichaSeleccionada.idFicha}</p>
                <p><strong>Momento:</strong> {momentoSeleccionado.titulo}</p>
              </div>
              <div className="modal-seguimiento-body">
                <p>{aprendizModal.seguimiento}</p>
              </div>
              <div className="modal-actions">
                <button className="btn-cerrar-modal" onClick={handleCerrarModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Renderizado NIVEL 2: Fichas de un momento ---
  if (momentoSeleccionado) {
    const filteredFichas = momentoSeleccionado.fichas.filter(f =>
      f.idFicha.toLowerCase().includes(searchQueryFichas.toLowerCase()) ||
      f.programa.toLowerCase().includes(searchQueryFichas.toLowerCase())
    );

    return (
      <div className="momento-detalle-pantalla">
        <nav style={{ padding: '10px 0', marginBottom: '10px', fontSize: '14px', background: 'transparent', borderBottom: '1px solid #e5e7eb' }}>
          <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0, gap: '4px' }}>
            <li style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px' }}>
              <span onClick={goToInicio} style={{ color: '#3ca203', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>Inicio</span>
              <span style={{ margin: '0 4px', color: '#9ca3af' }}> &gt; </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>
              {momentoSeleccionado.titulo}
            </li>
          </ol>
        </nav>

        <div className="detalle-header">
          <button className="btn-volver-lista" onClick={handleVolverMomentos}>
            <i className="fas fa-arrow-left" /> Volver a momentos
          </button>
          <h2 className="detalle-titulo">{momentoSeleccionado.titulo}</h2>
          <p className="detalle-subtitulo">{momentoSeleccionado.descripcion}</p>
        </div>

        <div className="search-container">
          <input type="text" className="search-input" placeholder="Buscar ficha..." value={searchTermFichas} onChange={(e) => setSearchTermFichas(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchFichas()} />
          <button className="btn-search" onClick={handleSearchFichas}>Buscar</button>
          <button className="btn-clear" onClick={handleClearFichas}>Limpiar</button>
        </div>

        <div className="fichas-grid">
          {filteredFichas.length === 0 ? (
            <p className="sin-registros">No se encontraron fichas con esos datos.</p>
          ) : (
            filteredFichas.map((f) => (
              <div key={f.idFicha} className="ficha-card-click" onClick={() => handleVerFicha(f.idFicha)}>
                <div className="ficha-card-header">
                  <span className="ficha-numero">{f.idFicha}</span>
                  <span className="ficha-cantidad">{f.aprendices.length} aprendices</span>
                </div>
                <div className="ficha-card-body">
                  <span className="ficha-programa">{f.programa}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- Renderizado NIVEL 1: Tarjetas de los momentos ---
  return (
    <div className="momentos-container">
      <nav style={{ padding: '10px 0', marginBottom: '15px', fontSize: '14px', background: 'transparent', borderBottom: '1px solid #e5e7eb' }}>
        <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0, gap: '4px' }}>
          <li style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px' }}>
            <span onClick={goToInicio} style={{ color: '#3ca203', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>Inicio</span>
            <span style={{ margin: '0 4px', color: '#9ca3af' }}> &gt; </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>
            Seguimiento por Momentos
          </li>
        </ol>
      </nav>

      <div className="momentos-header">
        <h2>Seguimiento por Momentos</h2>
        <p className="subtitulo">Selecciona un momento para ver las fichas y sus aprendices.</p>
      </div>

      <div className="momentos-grid">
        {momentos.map((momento) => (
          <div key={momento.id} className="momento-card-link" onClick={() => handleVerMomento(momento.id)}>
            <div className="momento-card-header">
              <h3>{momento.titulo}</h3>
              <span className="momento-cantidad">{momento.fichas.length} fichas</span>
            </div>
            <p className="momento-descripcion-corta">{momento.descripcion}</p>
            <div className="momento-flecha">
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeguimientoMomentos;