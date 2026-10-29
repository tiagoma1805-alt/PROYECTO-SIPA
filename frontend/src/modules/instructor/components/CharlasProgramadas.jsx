// src/modules/instructor/components/CharlasProgramadas.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';
import { showSuccess, showError } from '@/core/utils/sweetAlert';
import './CharlasProgramadas.css';

const CharlasProgramadas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [charlas, setCharlas] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor && instructor.id;
      if (!instructorId) throw new Error('No se encontro el instructor logueado');

      const [dataCharlas, dataFichas] = await Promise.all([
        apiClient.get('/instructor/charlas/' + instructorId),
        apiClient.get('/instructor/fichas/' + instructorId)
      ]);
      setCharlas(Array.isArray(dataCharlas) ? dataCharlas : []);
      setFichas(Array.isArray(dataFichas) ? dataFichas : []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar charlas');
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

  const calcularPorcentaje = (confirmados, solicitadas) => {
    if (!solicitadas || solicitadas === 0) return 0;
    return Math.round((confirmados / solicitadas) * 100);
  };

  const getColorPorcentaje = (pct) => {
    if (pct >= 75) return '#3ca203';
    if (pct >= 50) return '#f59e0b';
    return '#dc2626';
  };

  const filteredCharlas = charlas.filter((c) =>
    (c.tema || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const handleVerDetalle = (charla) => {
    navigate('/instructor/charla/' + charla.id);
  };

  const getFechaHoy = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  };

  const handleEditarFecha = async (charla, e) => {
    if (e) e.stopPropagation();
    const fechaActual = charla.fecha_programada ? new Date(charla.fecha_programada) : null;
    const fechaStr = fechaActual ? fechaActual.toISOString().slice(0, 10) : '';
    const horaStr = fechaActual ? fechaActual.toISOString().slice(11, 16) : '';

    const { value: formValues } = await Swal.fire({
      title: 'Editar Fecha y Hora',
      html: '<div style="text-align:left;padding:10px 0;">' +
        '<p style="color:#6b7280;font-size:14px;margin-bottom:15px;">' + charla.tema + '</p>' +
        '<div style="margin-bottom:15px;">' +
        '<label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Nueva Fecha *</label>' +
        '<input id="editFecha" type="date" min="' + getFechaHoy() + '" value="' + fechaStr + '" class="swal2-input" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;"></div>' +
        '<div style="margin-bottom:15px;">' +
        '<label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Nueva Hora *</label>' +
        '<input id="editHora" type="time" value="' + horaStr + '" class="swal2-input" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;"></div></div>',
      focusConfirm: false,
      confirmButtonText: 'Guardar Cambios',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '500px',
      padding: '25px 30px',
      preConfirm: () => {
        const fecha = document.getElementById('editFecha').value;
        const hora = document.getElementById('editHora').value;
        const fechaSeleccionada = new Date(fecha + 'T' + hora);
        if (fechaSeleccionada < new Date()) { Swal.showValidationMessage('No se pueden seleccionar fechas anteriores a hoy'); return false; }
        if (!fecha || !hora) { Swal.showValidationMessage('Fecha y hora son obligatorias'); return false; }
        return { fecha_programada: new Date(fecha + 'T' + hora).toISOString() };
      }
    });

    if (!formValues) return;
    try {
      const actualizada = await apiClient.put('/instructor/charlas/' + charla.id, formValues);
      setCharlas((prev) => prev.map((c) => (c.id === charla.id ? actualizada : c)));
      await showSuccess('Fecha actualizada.', 'Actualizada');
    } catch (err) {
      console.error('Error al actualizar:', err);
      const msg = (err && err.response && err.response.data && err.response.data.detail) || 'No se pudo actualizar.';
      showError(msg);
    }
  };

  const handleEliminarCharla = async (charla, e) => {
    if (e) e.stopPropagation();
    const result = await Swal.fire({
      title: 'Estas seguro?',
      html: '<p style="font-size:16px;color:#374151;">Deseas eliminar la charla <strong>"' + charla.tema + '"</strong>?</p>',
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
      await apiClient.delete('/instructor/charlas/' + charla.id);
      setCharlas((prev) => prev.filter((c) => c.id !== charla.id));
      await showSuccess('Charla eliminada.', 'Eliminada');
    } catch (err) {
      console.error('Error al eliminar:', err);
      showError('No se pudo eliminar.');
    }
  };

  const handleNuevaCharla = async () => {
    const stored = localStorage.getItem('user');
    const instructor = stored ? JSON.parse(stored) : null;
    const instructorId = instructor && instructor.id;
      if (!instructorId) throw new Error('No se encontro el instructor logueado');

    const opcionesFichas = fichas.map((f) =>
      '<option value="' + f.id + '">' + f.numero_ficha + ' - ' + (f.programa || 'Sin programa') + '</option>'
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Crear Nueva Charla',
      html: '<div style="text-align:left;padding:10px 0;">' +
        '<div style="margin-bottom:15px;">' +
        '<label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Nombre *</label>' +
        '<input id="temaCharla" class="swal2-input" placeholder="Ej. Normatividad SENA" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;"></div>' +
        '<div style="margin-bottom:15px;">' +
        '<label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Tipo *</label>' +
        '<select id="tipoCharla" class="swal2-input" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;">' +
        '<option value="CHARLA_INICIAL">Charla Inicial</option>' +
        '<option value="CHARLA_PRE_PRODUCTIVA">Charla Pre-Productiva</option></select></div>' +
        '<div style="margin-bottom:15px;">' +
        '<label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Ficha *</label>' +
        '<select id="fichaCharla" class="swal2-input" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;">' +
        opcionesFichas + '</select></div>' +
        '<div style="display:flex;gap:10px;margin-bottom:15px;">' +
        '<div style="flex:1;"><label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Fecha *</label>' +
        '<input id="fechaCharla" type="date" min="' + getFechaHoy() + '" class="swal2-input" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;"></div>' +
        '<div style="flex:1;"><label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Hora *</label>' +
        '<input id="horaCharla" type="time" class="swal2-input" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;"></div></div>' +
        '<div style="display:flex;gap:10px;margin-bottom:15px;">' +
        '<div style="flex:1;"><label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Duracion (h)</label>' +
        '<input id="duracionCharla" type="number" step="0.5" min="0.5" value="2" class="swal2-input" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;"></div>' +
        '<div style="flex:1;"><label style="display:block;font-weight:600;margin-bottom:5px;color:#1f2937;font-size:14px;">Solicitadas</label>' +
        '<input id="personasCharla" type="number" min="0" value="0" class="swal2-input" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;"></div>' +
        '</div></div>',

      focusConfirm: false,
      confirmButtonText: 'Crear Charla',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '560px',
      padding: '25px 30px',
      preConfirm: () => {
        const tema = document.getElementById('temaCharla').value.trim();
        const tipo_charla = document.getElementById('tipoCharla').value;
        const ficha_id = parseInt(document.getElementById('fichaCharla').value);
        const fecha = document.getElementById('fechaCharla').value;
        const hora = document.getElementById('horaCharla').value;
        const duracion = parseFloat(document.getElementById('duracionCharla').value) || 2;
        const personas = parseInt(document.getElementById('personasCharla').value) || 0;

        if (!tema) { Swal.showValidationMessage('El tema es obligatorio'); return false; }
        const fechaSeleccionada = new Date(fecha + 'T' + hora);
        if (fechaSeleccionada < new Date()) { Swal.showValidationMessage('No se pueden seleccionar fechas anteriores a hoy'); return false; }
        if (!fecha || !hora) { Swal.showValidationMessage('Fecha y hora son obligatorias'); return false; }
        return {
          tema: tema,
          tipo_charla: tipo_charla,
          ficha_id: ficha_id,
          fecha_programada: new Date(fecha + 'T' + hora).toISOString(),
          instructor_id: instructorId,
          duracion_horas: duracion,
          personas_solicitadas: personas,

        };
      }
    });

    if (!formValues) return;
    try {
      const nueva = await apiClient.post('/instructor/charlas', formValues);
      setCharlas((prev) => [nueva, ...prev]);
      await showSuccess('Charla "' + nueva.tema + '" creada.', 'Creada');
    } catch (err) {
      console.error('Error al crear:', err);
      const msg = (err && err.response && err.response.data && err.response.data.detail) || 'No se pudo crear.';
      showError(msg);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando charlas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarDatos} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="charlas-container">
      <Breadcrumb />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Charlas Programadas</h2>
        <button onClick={handleNuevaCharla} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-plus" /> Nueva charla
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Buscar por nombre de la charla..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Buscar</button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
      </div>

      {filteredCharlas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ color: '#dc2626' }}>Sin charlas</h3>
          <p style={{ color: '#6b7280' }}>{searchQuery ? 'No existe ninguna charla con ese nombre.' : 'Aun no tienes charlas programadas.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredCharlas.map((charla) => {
            const pct = 0;
            return (
              <div key={charla.id}
                onClick={() => handleVerDetalle(charla)}
                style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: 0, marginBottom: '12px' }}>{charla.tema}</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    <i className="fas fa-calendar" style={{ color: '#3ca203', marginRight: '6px' }} />
                    {formatearFecha(charla.fecha_programada)} - {formatearHora(charla.fecha_programada)}
                  </div>
                  <button onClick={(e) => handleEditarFecha(charla, e)} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                    <i className="fas fa-edit" style={{ marginRight: '4px' }} /> Editar fecha
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                  <span><i className="fas fa-clock" style={{ color: '#3ca203', marginRight: '6px' }} />{charla.duracion_horas || 2} horas</span>
                  <span><i className="fas fa-users" style={{ color: '#3ca203', marginRight: '6px' }} />Ficha {charla.numero_ficha}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    {charla.personas_solicitadas || 0} personas solicitadas
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: getColorPorcentaje(pct) }}>
                    {pct}%
                  </span>
                </div>

                <button onClick={(e) => handleEliminarCharla(charla, e)} style={{ marginTop: '12px', width: '100%', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  <i className="fas fa-trash" style={{ marginRight: '4px' }} /> Eliminar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CharlasProgramadas;