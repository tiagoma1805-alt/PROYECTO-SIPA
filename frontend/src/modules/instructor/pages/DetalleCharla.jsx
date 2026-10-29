// src/modules/instructor/pages/DetalleCharla.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import Swal from 'sweetalert2';
import { apiClient } from '@/core/api/client';
import { showSuccess, showError } from '@/core/utils/sweetAlert';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DetalleCharla = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [charla, setCharla] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor && instructor.id;
      if (!instructorId) throw new Error('No se encontro el instructor logueado');

      const charlas = await apiClient.get('/instructor/charlas/' + instructorId);
      const charlaData = (Array.isArray(charlas) ? charlas : []).find((c) => c.id === parseInt(id));
      if (!charlaData) throw new Error('Charla no encontrada');
      setCharla(charlaData);

      const evs = await apiClient.get('/instructor/charlas/' + id + '/evidencias');
      setEvidencias(Array.isArray(evs) ? evs : []);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      setError(err.message || 'Error al cargar la charla');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (iso) => {
    if (!iso) return '--';
    const d = new Date(iso);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return dia + '/' + mes + '/' + anio;
  };

  const formatearHora = (iso) => {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const evidenciasPorTipo = (tipo) => {
    return evidencias.filter((e) => e.tipo === tipo);
  };

  // Subir archivo
  const handleSubir = async (tipo) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,application/pdf';
    input.onchange = async (event) => {
      const archivo = event.target.files && event.target.files[0];
      if (!archivo) return;

      // Validar que sea PDF
      const esPDF = archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf');
      if (!esPDF) {
        showError('Solo se permiten archivos PDF.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('archivo', archivo);

        const token = localStorage.getItem('token');
        const res = await fetch(API_BASE + '/instructor/charlas/' + id + '/evidencias/' + tipo, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Error al subir archivo');
        }

        const nueva = await res.json();
        setEvidencias((prev) => [nueva, ...prev]);
        await showSuccess('Archivo subido correctamente.', 'Subida exitosa');
      } catch (err) {
        console.error('Error al subir:', err);
        showError(err.message || 'No se pudo subir el archivo.');
      }
    };
    input.click();
  };

  // Eliminar evidencia
  const handleEliminar = async (evidencia) => {
    const result = await Swal.fire({
      title: 'Eliminar archivo?',
      text: evidencia.nombre_archivo,
      icon: 'warning',
      iconColor: '#dc2626',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      await apiClient.delete('/instructor/evidencias/' + evidencia.id);
      setEvidencias((prev) => prev.filter((e) => e.id !== evidencia.id));
      await showSuccess('Archivo eliminado.', 'Eliminado');
    } catch (err) {
      console.error('Error:', err);
      showError('No se pudo eliminar.');
    }
  };

  const abrirArchivo = (evidencia) => {
    const url = API_BASE + evidencia.ruta_archivo;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando charla...</p>
      </div>
    );
  }

  if (error || !charla) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={() => navigate('/instructor/charlas-programadas')} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          <i className="fas fa-arrow-left" style={{ marginRight: '6px' }} /> Volver a charlas
        </button>
      </div>
    );
  }

  const secciones = [
    { tipo: 'SOPORTE', titulo: 'Soportes', icono: 'fa-paperclip', color: '#3ca203' },
    { tipo: 'LISTADO', titulo: 'Listados', icono: 'fa-list', color: '#3ca203' },
    { tipo: 'FOTO', titulo: 'Fotos', icono: 'fa-image', color: '#3ca203' },
  ];

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <button
        onClick={() => navigate('/instructor/charlas-programadas')}
        style={{ background: 'transparent', border: 'none', color: '#3ca203', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <i className="fas fa-arrow-left" /> Volver a charlas
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{charla.tema}</h2>
        <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>
          Fecha: {formatearFecha(charla.fecha_programada)} - Hora: {formatearHora(charla.fecha_programada)}
        </p>
        <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>Duracion: {charla.duracion_horas || 2} horas</p>
        <p style={{ color: '#6b7280', margin: 0 }}>Dirigida a: Ficha {charla.numero_ficha}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {secciones.map((sec) => {
          const items = evidenciasPorTipo(sec.tipo);
          return (
            <div key={sec.tipo} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className={'fas ' + sec.icono} style={{ color: sec.color }} />
                  {sec.titulo}
                </h3>
                <span style={{ background: '#e6f7ed', color: '#047857', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  {items.length}
                </span>
              </div>

              {items.length > 0 && (
                <div style={{ marginBottom: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                  {items.map((ev) => (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#f9fafb', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                      <i className="fas fa-file-pdf" style={{ color: '#dc2626' }} />
                      <span
                        onClick={() => abrirArchivo(ev)}
                        style={{ flex: 1, color: '#0369a1', cursor: 'pointer', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={ev.nombre_archivo}
                      >
                        {ev.nombre_archivo}
                      </span>
                      <button onClick={() => handleEliminar(ev)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px 6px' }}>
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleSubir(sec.tipo)}
                style={{ width: '100%', background: '#3ca203', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <i className="fas fa-upload" /> Subir PDF
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DetalleCharla;