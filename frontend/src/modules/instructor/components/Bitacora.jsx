// src/modules/instructor/components/Bitacora.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';
import './Bitacora.css';

const FichaCard = ({ ficha, onClick }) => (
  <div onClick={onClick} style={{ background: 'white', padding: '25px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', textAlign: 'center' }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#3ca203'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
    <div style={{ fontSize: '36px', color: '#3ca203', marginBottom: '10px' }}><i className="fas fa-layer-group" /></div>
    <h4 style={{ fontWeight: 'bold', margin: '5px 0', color: '#1f2937', fontSize: '18px' }}>{ficha.id}</h4>
    <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>{ficha.programa}</p>
    <div style={{ marginTop: '12px' }}>
      <span style={{ background: '#e6f7ed', color: '#047857', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
        <i className="fas fa-users" /> {ficha.aprendices?.length || 0} aprendices
      </span>
    </div>
    <div style={{ marginTop: '12px', fontSize: '13px', color: '#3ca203' }}><i className="fas fa-eye" /> Ver aprendices</div>
  </div>
);

const AprendizCard = ({ aprendiz, onClick }) => (
  <div onClick={onClick} style={{ background: 'white', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3ca203'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
    <div>
      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', color: '#1f2937' }}>{aprendiz.nombre}</p>
      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
        <i className="fas fa-id-card" style={{ marginRight: '4px' }} />
        {aprendiz.documento || 'Sin documento'}
      </p>
    </div>
    <div style={{ background: '#e6f7ed', color: '#047857', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <i className="fas fa-book" /> Ver bitacoras
    </div>
  </div>
);

const BimestreCard = ({ keyBimestre, bitacoras, onClick }) => {
  const nombres = { bimestre1: '1er Bimestre', bimestre2: '2do Bimestre', bimestre3: '3er Bimestre', bimestre4: '4to Bimestre' };
  const iconos = { bimestre1: 'fa-calendar-alt', bimestre2: 'fa-calendar-check', bimestre3: 'fa-calendar-day', bimestre4: 'fa-calendar-week' };
  const colores = { bimestre1: '#3ca203', bimestre2: '#0ea5e9', bimestre3: '#f59e0b', bimestre4: '#8b5cf6' };
  const color = colores[keyBimestre] || '#6b7280';
  const totalBitacoras = bitacoras?.length || 0;

  return (
    <div onClick={onClick} style={{ background: 'white', borderRadius: '12px', border: '2px solid ' + color, padding: '20px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          <i className={'fas ' + (iconos[keyBimestre] || 'fa-calendar')} style={{ fontSize: '20px' }} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>{nombres[keyBimestre] || keyBimestre}</div>
          <span style={{ color, fontSize: '13px', fontWeight: '500' }}>
            {totalBitacoras} registro{totalBitacoras !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div style={{ marginTop: '12px', fontSize: '13px', color: '#3ca203', textAlign: 'center' }}>
        <i className="fas fa-arrow-right" /> Ver bitacoras
      </div>
    </div>
  );
};

const Bitacora = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fichas, setFichas] = useState([]);
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [selectedAprendiz, setSelectedAprendiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAprendizTerm, setSearchAprendizTerm] = useState('');
  const [searchAprendizQuery, setSearchAprendizQuery] = useState('');

  useEffect(() => { cargarBitacoras(); }, []);

  useEffect(() => {
    if (location.state?.restoreFicha) setSelectedFicha(location.state.restoreFicha);
    if (location.state?.restoreAprendiz) setSelectedAprendiz(location.state.restoreAprendiz);
    if (location.state?.restoreFicha || location.state?.restoreAprendiz) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const cargarBitacoras = async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor && instructor.id;
      if (!instructorId) throw new Error('No se encontro el instructor logueado');

      const data = await apiClient.get('/instructor/bitacoras/' + instructorId);
      setFichas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar bitacoras:', err);
      setError(err.message || 'Error al cargar bitacoras');
    } finally {
      setLoading(false);
    }
  };

  const goToInicio = () => { navigate('/instructor'); window.location.reload(); };
  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };
  const handleSearchAprendiz = () => setSearchAprendizQuery(searchAprendizTerm);
  const handleClearAprendiz = () => { setSearchAprendizTerm(''); setSearchAprendizQuery(''); };

  const handleBackToFichas = () => {
    setSelectedFicha(null); setSelectedAprendiz(null);
    setSearchTerm(''); setSearchQuery('');
    setSearchAprendizTerm(''); setSearchAprendizQuery('');
  };

  const handleBackToAprendices = () => {
    setSelectedAprendiz(null);
    setSearchAprendizTerm(''); setSearchAprendizQuery('');
  };

  const handleSelectFicha = (ficha) => { setSelectedFicha(ficha); setSelectedAprendiz(null); };
  const handleSelectAprendiz = (aprendiz) => setSelectedAprendiz(aprendiz);

  const toggleBimestre = (key) => {
    navigate('/instructor/bitacora/aprendiz/' + selectedAprendiz.id + '/bimestre/' + key,
      { state: { aprendiz: selectedAprendiz, ficha: selectedFicha } });
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando bitacoras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarBitacoras} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>Reintentar</button>
      </div>
    );
  }

  // VISTA 3: Bimestres de un aprendiz
  if (selectedAprendiz) {
    const bitacorasKeys = Object.keys(selectedAprendiz.bitacoras || {});
    const hasBitacoras = bitacorasKeys.length > 0 && bitacorasKeys.some(key => selectedAprendiz.bitacoras[key]?.length > 0);

    return (
      <div className="bitacora-container">
        <Breadcrumb />
        <div className="bitacora-header">
          <div className="header-left">
            <button className="btn-back" onClick={handleBackToAprendices}>
              <i className="fas fa-arrow-left"></i> Volver a aprendices
            </button>
            <div className="header-title-row">
              <h2>Bitacora de {selectedAprendiz.nombre}</h2>
            </div>
          </div>
        </div>

        {!hasBitacoras ? (
          <div className="no-bitacoras">
            <i className="fas fa-book-open"></i>
            <h3>Sin bitacoras registradas</h3>
            <p>Este aprendiz aun no tiene bitacoras asociadas.</p>
          </div>
        ) : (
          <div className="bimestres-grid">
            {bitacorasKeys.filter(key => selectedAprendiz.bitacoras[key]?.length > 0).map((key) => (
              <BimestreCard key={key} keyBimestre={key} bitacoras={selectedAprendiz.bitacoras[key]} onClick={() => toggleBimestre(key)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // VISTA 2: Aprendices de una ficha
  if (selectedFicha) {
    const filteredAprendices = selectedFicha.aprendices.filter(a =>
      a.nombre.toLowerCase().includes(searchAprendizQuery.toLowerCase())
    );

    return (
      <div className="bitacora-container">
        <Breadcrumb />
        <div className="bitacora-header">
          <div className="header-left">
            <button className="btn-back" onClick={handleBackToFichas}>
              <i className="fas fa-arrow-left"></i> Volver a fichas
            </button>
            <h2>Ficha {selectedFicha.id}</h2>
            <p className="subtitulo">{selectedFicha.programa} - {selectedFicha.aprendices.length} aprendices</p>
          </div>
        </div>

        <div className="search-container">
          <input type="text" className="search-input" placeholder="Buscar aprendiz por nombre..." value={searchAprendizTerm} onChange={(e) => setSearchAprendizTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchAprendiz()} />
          <button className="btn-search" onClick={handleSearchAprendiz}><i className="fas fa-search"></i> Buscar</button>
          <button className="btn-clear" onClick={handleClearAprendiz}><i className="fas fa-times"></i> Limpiar</button>
        </div>

        <div className="aprendices-grid">
          {filteredAprendices.length === 0 ? (
            <div className="not-found">
              <i className="fas fa-exclamation-circle"></i>
              <h3>Dato no encontrado</h3>
              <p>No se encontraron aprendices con ese nombre.</p>
            </div>
          ) : (
            filteredAprendices.map((ap) => (<AprendizCard key={ap.id} aprendiz={ap} onClick={() => handleSelectAprendiz(ap)} />))
          )}
        </div>
      </div>
    );
  }

  // VISTA 1: Fichas
  const filteredFichas = fichas.filter(f =>
    searchQuery === '' ||
    f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.programa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bitacora-container">
      <Breadcrumb />
      <div className="bitacora-header">
        <div className="header-left">
          <h2>Bitacora de Seguimiento</h2>
          <p className="subtitulo">Selecciona una ficha para ver los aprendices y sus bitacoras organizadas por bimestre.</p>
        </div>
      </div>

      <div className="search-container">
        <input type="text" className="search-input" placeholder="Buscar por codigo de ficha o programa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        <button className="btn-search" onClick={handleSearch}><i className="fas fa-search"></i> Buscar</button>
        <button className="btn-clear" onClick={handleClear}><i className="fas fa-times"></i> Limpiar</button>
      </div>

      <div className="fichas-grid">
        {filteredFichas.length === 0 ? (
          <div className="not-found">
            <i className="fas fa-exclamation-circle"></i>
            <h3>Dato no encontrado</h3>
            <p>No existe ninguna ficha con el criterio de busqueda seleccionado.</p>
          </div>
        ) : (
          filteredFichas.map((ficha) => (<FichaCard key={ficha.id} ficha={ficha} onClick={() => handleSelectFicha(ficha)} />))
        )}
      </div>
    </div>
  );
};

export default Bitacora;