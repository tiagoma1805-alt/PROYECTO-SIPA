// src/modules/instructor/components/ReportesFinales.jsx
import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../../shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ReportesFinales = () => {
  const fileInputRef = useRef(null);
  const [aprendizActivo, setAprendizActivo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor && instructor.id;
      if (!instructorId) throw new Error('No se encontró el instructor logueado');

      const data = await apiClient.get('/instructor/reportes-finales/' + instructorId);
      setAprendices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError(err.message || 'Error al cargar reportes finales');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const getIniciales = (nombre) => {
    return nombre
      .split(' ')
      .map(palabra => palabra[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClickSubir = (aprendiz) => {
    setAprendizActivo(aprendiz);
    fileInputRef.current.click();
  };

  const handleArchivoSeleccionado = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar PDF
    if (file.type !== 'application/pdf') {
      Swal.fire({
        title: '⚠️ Archivo inválido',
        text: 'Solo se permiten archivos PDF.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      fileInputRef.current.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('archivo', file);

      const token = localStorage.getItem('token');
      const res = await fetch(
        API_BASE + '/instructor/reportes-finales/subir/' + aprendizActivo.aprendiz_id,
        {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al subir reporte');
      }

      await Swal.fire({
        title: '✅ Reporte subido',
        text: 'El reporte final se ha guardado correctamente.',
        icon: 'success',
        confirmButtonColor: '#3ca203',
      });

      await cargarReportes();
    } catch (err) {
      console.error('Error al subir:', err);
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudo subir el reporte.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      fileInputRef.current.value = '';
      setAprendizActivo(null);
    }
  };

  const handleVerReporte = (aprendiz) => {
    if (!aprendiz.reporteFinal) {
      Swal.fire({
        title: '📋 Sin reporte',
        text: 'Este aprendiz aún no tiene reporte final subido.',
        icon: 'info',
        confirmButtonColor: '#3ca203',
      });
      return;
    }
    const url = API_BASE + aprendiz.reporteFinal.ruta;
    window.open(url, '_blank');
  };

  const filteredAprendices = aprendices.filter(a =>
    searchQuery === '' ||
    a.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ficha.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h3 style={{ color: '#dc2626' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarReportes} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleArchivoSeleccionado}
      />

      <div style={{
        background: 'white', borderRadius: '16px', padding: '24px 30px',
        marginBottom: '25px', border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          <i className="fas fa-file-signature" style={{ color: '#3ca203', marginRight: '10px' }} />
          Reportes Finales
        </h2>
        <p style={{ color: '#6b7280', margin: '6px 0 0 0' }}>
          Aprendices que finalizaron su etapa productiva. Sube o consulta el reporte final de cada uno.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Buscar aprendiz por nombre o ficha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
        />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <i className="fas fa-search" style={{ marginRight: '6px' }} /> Buscar
        </button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', color: '#374151', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
          <i className="fas fa-times" style={{ marginRight: '6px' }} /> Limpiar
        </button>
      </div>

      {filteredAprendices.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-file-signature" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '15px' }}></i>
          <h3 style={{ color: '#6b7280' }}>Sin aprendices</h3>
          <p style={{ color: '#9ca3af' }}>{searchQuery ? 'No se encontraron aprendices con ese criterio.' : 'Aún no tienes aprendices asignados.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAprendices.map((ap) => (
            <div key={ap.id} style={{
              background: 'white', borderRadius: '12px', padding: '20px 24px',
              border: '1px solid #e5e7eb', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: '#3ca20320', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#3ca203',
                  fontWeight: 'bold', fontSize: '16px'
                }}>
                  {getIniciales(ap.nombre)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                    {ap.nombre}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                    Ficha {ap.ficha} • {ap.programa}
                  </p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                    <i className="fas fa-flag-checkered"></i> Finalizó etapa productiva: {ap.fechaFinalizacion}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {ap.reporteFinal ? (
                  <>
                    <span style={{
                      background: '#d1fae5', color: '#047857', padding: '6px 14px',
                      borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                      display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                      <i className="fas fa-check-circle"></i> Reporte subido
                    </span>
                    <button
                      onClick={() => handleVerReporte(ap)}
                      style={{
                        background: '#e0f2fe', color: '#0369a1', border: 'none',
                        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: '500', fontSize: '13px'
                      }}
                    >
                      <i className="fas fa-eye" style={{ marginRight: '4px' }} /> Ver reporte
                    </button>
                    <button
                      onClick={() => handleClickSubir(ap)}
                      style={{
                        background: '#fef3c7', color: '#d97706', border: 'none',
                        padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: '500', fontSize: '13px'
                      }}
                      title="Reemplazar reporte"
                    >
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{
                      background: '#fef3c7', color: '#b45309', padding: '6px 14px',
                      borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                      display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                      <i className="fas fa-hourglass-half"></i> Reporte pendiente
                    </span>
                    <button
                      onClick={() => handleClickSubir(ap)}
                      style={{
                        background: '#3ca203', color: 'white', border: 'none',
                        padding: '8px 18px', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: '600', fontSize: '13px',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <i className="fas fa-upload"></i> Subir reporte
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportesFinales;