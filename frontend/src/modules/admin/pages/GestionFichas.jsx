// src/modules/admin/pages/GestionFichas.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fichaService } from '@/core/services/fichaService';
import CargaMasivaFichas from './CargaMasivaFichas';
import './GestionFichas.css';

const GestionFichas = () => {
  const [fichas, setFichas] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalCargaMasiva, setModalCargaMasiva] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fichasData, programasData] = await Promise.all([
        fichaService.getFichas().catch(() => []),
        fichaService.getProgramas().catch(() => []),
      ]);
      console.log('🔍 Fichas cargadas:', fichasData);
      console.log('🔍 Programas cargados:', programasData);
      setFichas(Array.isArray(fichasData) ? fichasData : []);
      setProgramas(Array.isArray(programasData) ? programasData : []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar fichas');
    } finally {
      setLoading(false);
    }
  };

  const getNombrePrograma = (programaId) => {
    const p = programas.find((x) => x.id === programaId);
    return p ? p.nombre : `Programa #${programaId}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      const d = new Date(fecha);
      return d.toLocaleDateString('es-ES');
    } catch {
      return fecha;
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
    const nombre = getNombrePrograma(f.programa_id).toLowerCase();
    const numero = (f.numero_ficha || '').toLowerCase();
    return nombre.includes(q) || numero.includes(q);
  });

  // ==========================================================
  // CARGA MASIVA
  // ==========================================================
  const handleCargaMasiva = () => {
    if (programas.length === 0) {
      Swal.fire({
        title: '⚠️ Sin programas',
        text: 'Primero debes crear al menos un programa de formación.',
        icon: 'warning',
        confirmButtonColor: '#3ca203',
      });
      return;
    }
    setModalCargaMasiva(true);
  };

  const handleFichasCargadas = () => {
    cargarDatos();
  };

  // ==========================================================
  // NUEVA FICHA
  // ==========================================================
  const handleNuevaFicha = () => {
    if (programas.length === 0) {
      Swal.fire({
        title: '⚠️ Sin programas',
        text: 'Primero debes crear al menos un programa de formación.',
        icon: 'warning',
        confirmButtonColor: '#3ca203',
      });
      return;
    }

    const programaOptions = programas
      .map((p) => `<option value="${p.id}">${p.nombre}</option>`)
      .join('');

    Swal.fire({
      title: '📚 Nueva Ficha',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Programa *</label>
            <select id="new-programa" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
              ${programaOptions}
            </select>
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Número de ficha *</label>
            <input id="new-numero" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="Ej: 2875901" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Nivel *</label>
              <select id="new-nivel" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                <option value="Tecnólogo">Tecnólogo</option>
                <option value="Técnico">Técnico</option>
                <option value="Profesional">Profesional</option>
                <option value="Especialización">Especialización</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Jornada *</label>
              <select id="new-jornada" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
                <option value="Fin de Semana">Fin de Semana</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Fecha Inicio Productiva *</label>
              <input id="new-fecha-inicio" type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Fecha Fin Productiva *</label>
              <input id="new-fecha-fin" type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
            </div>
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Aprendices esperados</label>
            <input id="new-aprendices" type="number" min="0" value="0" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '✅ Crear Ficha',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '520px',
      preConfirm: () => {
        const programa_id = parseInt(document.getElementById('new-programa').value);
        const numero_ficha = document.getElementById('new-numero').value.trim();
        const nivel = document.getElementById('new-nivel').value;
        const jornada = document.getElementById('new-jornada').value;
        const fecha_inicio = document.getElementById('new-fecha-inicio').value;
        const fecha_fin = document.getElementById('new-fecha-fin').value;
        const aprendices_esperados = parseInt(document.getElementById('new-aprendices').value) || 0;

        if (!numero_ficha) { Swal.showValidationMessage('⚠️ El número de ficha es obligatorio'); return false; }
        if (!fecha_inicio || !fecha_fin) { Swal.showValidationMessage('⚠️ Las fechas son obligatorias'); return false; }
        if (new Date(fecha_fin) < new Date(fecha_inicio)) { Swal.showValidationMessage('⚠️ La fecha fin no puede ser anterior a la fecha inicio'); return false; }

        return { programa_id, numero_ficha, nivel, jornada, fecha_inicio, fecha_fin, aprendices_esperados };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await fichaService.createFicha(result.value);
          await cargarDatos();
          Swal.fire({
            title: '✅ ¡Ficha creada!',
            text: `La ficha ${result.value.numero_ficha} se creó correctamente.`,
            icon: 'success',
            confirmButtonColor: '#3ca203',
            timer: 2000,
          });
        } catch (err) {
          let mensaje = 'No se pudo crear la ficha';
          if (err?.data?.detail) {
            mensaje = typeof err.data.detail === 'string' ? err.data.detail : JSON.stringify(err.data.detail);
          } else if (err?.message) {
            mensaje = err.message;
          }
          Swal.fire({ title: '❌ Error al crear', text: mensaje, icon: 'error', confirmButtonColor: '#dc2626' });
        }
      }
    });
  };

  // ==========================================================
  // EDITAR FICHA
  // ==========================================================
  const handleEditarFicha = (ficha) => {
    const programaOptions = programas
      .map((p) => `<option value="${p.id}" ${p.id === ficha.programa_id ? 'selected' : ''}>${p.nombre}</option>`)
      .join('');

    Swal.fire({
      title: '✏️ Editar Ficha',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Programa *</label>
            <select id="edit-programa" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
              ${programaOptions}
            </select>
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Número de ficha *</label>
            <input id="edit-numero" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" value="${ficha.numero_ficha || ''}" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Nivel</label>
              <select id="edit-nivel" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                <option value="Tecnólogo" ${ficha.nivel === 'Tecnólogo' ? 'selected' : ''}>Tecnólogo</option>
                <option value="Técnico" ${ficha.nivel === 'Técnico' ? 'selected' : ''}>Técnico</option>
                <option value="Profesional" ${ficha.nivel === 'Profesional' ? 'selected' : ''}>Profesional</option>
                <option value="Especialización" ${ficha.nivel === 'Especialización' ? 'selected' : ''}>Especialización</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Jornada</label>
              <select id="edit-jornada" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                <option value="Mañana" ${ficha.jornada === 'Mañana' ? 'selected' : ''}>Mañana</option>
                <option value="Tarde" ${ficha.jornada === 'Tarde' ? 'selected' : ''}>Tarde</option>
                <option value="Noche" ${ficha.jornada === 'Noche' ? 'selected' : ''}>Noche</option>
                <option value="Fin de Semana" ${ficha.jornada === 'Fin de Semana' ? 'selected' : ''}>Fin de Semana</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Fecha Inicio Productiva *</label>
              <input id="edit-fecha-inicio" type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" value="${ficha.fecha_inicio || ''}" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Fecha Fin Productiva *</label>
              <input id="edit-fecha-fin" type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" value="${ficha.fecha_fin || ''}" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Aprendices esperados</label>
              <input id="edit-aprendices" type="number" min="0" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" value="${ficha.aprendices_esperados || 0}" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Estado</label>
              <select id="edit-estado" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                <option value="true" ${ficha.is_active ? 'selected' : ''}>Activa</option>
                <option value="false" ${!ficha.is_active ? 'selected' : ''}>Inactiva</option>
              </select>
            </div>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '💾 Guardar',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '520px',
      preConfirm: () => {
        const programa_id = parseInt(document.getElementById('edit-programa').value);
        const numero_ficha = document.getElementById('edit-numero').value.trim();
        const nivel = document.getElementById('edit-nivel').value;
        const jornada = document.getElementById('edit-jornada').value;
        const fecha_inicio = document.getElementById('edit-fecha-inicio').value;
        const fecha_fin = document.getElementById('edit-fecha-fin').value;
        const aprendices_esperados = parseInt(document.getElementById('edit-aprendices').value) || 0;
        const is_active = document.getElementById('edit-estado').value === 'true';

        if (!numero_ficha || !fecha_inicio || !fecha_fin) {
          Swal.showValidationMessage('⚠️ Número y fechas son obligatorios');
          return false;
        }
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
          Swal.showValidationMessage('⚠️ Fecha fin no puede ser anterior a fecha inicio');
          return false;
        }

        return { programa_id, numero_ficha, nivel, jornada, fecha_inicio, fecha_fin, aprendices_esperados, is_active };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await fichaService.updateFicha(ficha.id, result.value);
          await cargarDatos();
          Swal.fire({ title: '✅ ¡Ficha actualizada!', icon: 'success', confirmButtonColor: '#3ca203', timer: 2000 });
        } catch (err) {
          let mensaje = 'No se pudo actualizar la ficha';
          if (err?.data?.detail) {
            mensaje = typeof err.data.detail === 'string' ? err.data.detail : JSON.stringify(err.data.detail);
          } else if (err?.message) {
            mensaje = err.message;
          }
          Swal.fire({ title: '❌ Error', text: mensaje, icon: 'error', confirmButtonColor: '#dc2626' });
        }
      }
    });
  };

  // ==========================================================
  // ELIMINAR FICHA
  // ==========================================================
  const handleEliminarFicha = (ficha) => {
    Swal.fire({
      title: '⚠️ ¿Eliminar ficha?',
      text: `¿Estás seguro de eliminar la ficha ${ficha.numero_ficha}? Se desactivará.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '✅ Sí, eliminar',
      cancelButtonText: '❌ Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fichaService.deleteFicha(ficha.id);
          await cargarDatos();
          Swal.fire({ title: '✅ Ficha eliminada', icon: 'success', confirmButtonColor: '#3ca203', timer: 1500 });
        } catch (err) {
          Swal.fire({ title: '❌ Error', text: err?.message || 'No se pudo eliminar', icon: 'error', confirmButtonColor: '#dc2626' });
        }
      }
    });
  };

  // ==========================================================
  // RENDER
  // ==========================================================

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
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar fichas</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="gestion-fichas-container">
      <nav className="breadcrumb">
        <ol>
          <li>
            <Link to="/admin" className="breadcrumb-link">
              <i className="fas fa-home"></i> Inicio
            </Link>
            <span className="separator"> &gt; </span>
          </li>
          <li className="active">
            <i className="fas fa-folder-open"></i> Gestión de Fichas
          </li>
        </ol>
      </nav>

      <div className="fichas-header">
        <div>
          <h2>Gestión de Fichas</h2>
          <p className="subtitulo">Administra todas las fichas de formación ({fichas.length} fichas).</p>
        </div>
        <div className="header-buttons">
          <button className="btn-carga-masiva" onClick={handleCargaMasiva}>
            <i className="fas fa-upload"></i> Carga Masiva
          </button>
          <button className="btn-nueva-ficha" onClick={handleNuevaFicha}>
            <i className="fas fa-plus"></i> Nueva Ficha
          </button>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por código o programa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-search" onClick={handleSearch}>
          <i className="fas fa-search"></i> Buscar
        </button>
        <button className="btn-clear" onClick={handleClear}>
          <i className="fas fa-times"></i> Limpiar
        </button>
      </div>

      <div className="table-wrapper">
        <table className="fichas-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Programa</th>
              <th>Nivel</th>
              <th style={{ textAlign: 'center' }}>Aprendices</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Inicio Productiva</th>
              <th style={{ textAlign: 'center' }}>Fin Productiva</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredFichas.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-folder-open" style={{ color: '#9ca3af', fontSize: '32px' }}></i>
                  <h3 style={{ color: '#6b7280', margin: '10px 0 5px 0' }}>No hay fichas registradas</h3>
                  <p style={{ color: '#9ca3af' }}>Haz clic en "Nueva Ficha" para crear la primera.</p>
                </td>
              </tr>
            ) : (
              filteredFichas.map((ficha) => (
                <tr key={ficha.id}>
                  <td className="ficha-codigo">{ficha.numero_ficha}</td>
                  <td>{getNombrePrograma(ficha.programa_id)}</td>
                  <td>
                    <span className="nivel-badge">{ficha.nivel || 'N/A'}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="aprendices-count">{ficha.aprendices_esperados || 0}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="estado-badge"
                      style={{
                        background: ficha.is_active ? '#d1fae5' : '#fef2f2',
                        color: ficha.is_active ? '#065f46' : '#dc2626',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      <i className={`fas ${ficha.is_active ? 'fa-check-circle' : 'fa-times-circle'}`}></i>{' '}
                      {ficha.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{formatearFecha(ficha.fecha_inicio)}</td>
                  <td style={{ textAlign: 'center' }}>{formatearFecha(ficha.fecha_fin)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-editar" onClick={() => handleEditarFicha(ficha)}>
                      <i className="fas fa-pen"></i> Editar
                    </button>
                    <button className="btn-eliminar" onClick={() => handleEliminarFicha(ficha)}>
                      <i className="fas fa-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CARGA MASIVA DE FICHAS */}
      {modalCargaMasiva && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalCargaMasiva(false);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <CargaMasivaFichas
              onClose={() => setModalCargaMasiva(false)}
              onFichasCargadas={handleFichasCargadas}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionFichas;