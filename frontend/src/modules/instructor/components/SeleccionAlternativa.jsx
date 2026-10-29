// src/modules/instructor/components/SeleccionAlternativa.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '../../shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';
import { showSuccess, showError } from '@/core/utils/sweetAlert';
import { f165Service } from '@/core/services/f165Service';
import './SeleccionAlternativa.css';

const SeleccionAlternativa = () => {
  const navigate = useNavigate();
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [empresaVisible, setEmpresaVisible] = useState(null);
  const [searchAprendizTerm, setSearchAprendizTerm] = useState('');
  const [searchAprendizQuery, setSearchAprendizQuery] = useState('');
  const [filtroAlternativa, setFiltroAlternativa] = useState('');
  const [filtroDropdownVisible, setFiltroDropdownVisible] = useState(false);

  const [data, setData] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [aprendicesDisponibles, setAprendicesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarModalAsignacion, setMostrarModalAsignacion] = useState(false);
  const [aprendizSeleccionado, setAprendizSeleccionado] = useState(null);
  const [formAsignacion, setFormAsignacion] = useState({
    alternativa: '',
    empresa: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'Activo'
  });

  // Modal nuevo aprendiz
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [formNuevo, setFormNuevo] = useState({
    aprendiz_id: '',
    modalidad_id: '',
    empresa_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

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

      const [dataFichas, dataModalidades, dataEmpresas, dataDisponibles] = await Promise.all([
        apiClient.get('/instructor/seleccion-alternativa/' + instructorId),
        apiClient.get('/instructor/modalidades').catch(() => []),
        apiClient.get('/instructor/empresas/' + instructorId).catch(() => []),
        apiClient.get('/instructor/aprendices-disponibles/' + instructorId).catch(() => [])
      ]);

      setData(Array.isArray(dataFichas) ? dataFichas : []);
      setModalidades(Array.isArray(dataModalidades) ? dataModalidades : []);
      setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : []);
      setAprendicesDisponibles(Array.isArray(dataDisponibles) ? dataDisponibles : []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar seleccion de alternativa');
    } finally {
      setLoading(false);
    }
  };

  const alternativasDisponibles = modalidades.map((m) => m.nombre);
  const todasLasAlternativas = [...new Set(data.flatMap(ficha => ficha.aprendices.map(a => a.alternativa)))].filter(Boolean);

  const handleBack = () => {
    setSelectedFicha(null);
    setSearchTerm('');
    setSearchQuery('');
    setEmpresaVisible(null);
    setSearchAprendizTerm('');
    setSearchAprendizQuery('');
    setFiltroAlternativa('');
    setFiltroDropdownVisible(false);
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); setFiltroAlternativa(''); setFiltroDropdownVisible(false); };
  const handleSearchAprendiz = () => setSearchAprendizQuery(searchAprendizTerm);
  const handleClearAprendiz = () => { setSearchAprendizTerm(''); setSearchAprendizQuery(''); };
  const toggleEmpresa = (index) => setEmpresaVisible(empresaVisible === index ? null : index);

  const handleCargaMasiva = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        Swal.fire({
          title: 'Carga Masiva',
          text: 'Archivo "' + file.name + '" seleccionado. Procesando...',
          icon: 'info',
          confirmButtonColor: '#3ca203',
          timer: 2000
        });
      }
    };
    input.click();
  };

  const handleFiltroAlternativa = (alt) => {
    setFiltroAlternativa(alt);
    setFiltroDropdownVisible(false);
  };

  const handleAsignarAlternativa = (aprendiz) => {
    setAprendizSeleccionado(aprendiz);
    setFormAsignacion({ alternativa: '', empresa: '', fechaInicio: '', fechaFin: '', estado: 'Activo' });
    setMostrarModalAsignacion(true);
  };

  const handleGuardarAsignacion = async () => {
    if (!formAsignacion.alternativa) { showError('Selecciona una alternativa.'); return; }
    try {
      const modalidad = modalidades.find((m) => m.nombre === formAsignacion.alternativa);
      if (!modalidad) { showError('Modalidad no valida.'); return; }
      const empresa = empresas.find((e) => e.razon_social === formAsignacion.empresa);

      await apiClient.put('/instructor/seleccion-alternativa/asignar/' + aprendizSeleccionado.proceso_id, {
        proceso_id: aprendizSeleccionado.proceso_id,
        modalidad_id: modalidad.id,
        empresa_id: empresa ? empresa.id : null,
        fecha_inicio: formAsignacion.fechaInicio || null,
        fecha_fin: formAsignacion.fechaFin || null
      });

      setMostrarModalAsignacion(false);
      setAprendizSeleccionado(null);
      await showSuccess('Alternativa asignada correctamente.', 'Guardado');

      await cargarDatos();
      if (selectedFicha) {
        const stored = localStorage.getItem('user');
        const instructor = stored ? JSON.parse(stored) : null;
        const nuevasFichas = await apiClient.get('/instructor/seleccion-alternativa/' + instructor.id);
        const fichaActualizada = nuevasFichas.find((f) => f.ficha_id === selectedFicha.ficha_id);
        if (fichaActualizada) setSelectedFicha(fichaActualizada);
      }
    } catch (err) {
      console.error('Error al asignar:', err);
      const msg = (err && err.response && err.response.data && err.response.data.detail) || 'No se pudo asignar.';
      showError(msg);
    }
  };

  // ==========================================================
  // AGREGAR APRENDIZ NUEVO
  // ==========================================================
  const handleAbrirModalNuevo = () => {
    setFormNuevo({ aprendiz_id: '', modalidad_id: '', empresa_id: '', fecha_inicio: '', fecha_fin: '' });
    setMostrarModalNuevo(true);
  };

  const handleGuardarNuevo = async () => {
    if (!formNuevo.aprendiz_id) { showError('Selecciona un aprendiz.'); return; }
    if (!formNuevo.modalidad_id) { showError('Selecciona una alternativa.'); return; }
    if (!formNuevo.fecha_inicio || !formNuevo.fecha_fin) { showError('Las fechas son obligatorias.'); return; }

    try {
      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor && instructor.id;

      await apiClient.post('/instructor/seleccion-alternativa/crear-proceso', {
        aprendiz_id: parseInt(formNuevo.aprendiz_id),
        ficha_id: selectedFicha.ficha_id,
        modalidad_id: parseInt(formNuevo.modalidad_id),
        empresa_id: formNuevo.empresa_id ? parseInt(formNuevo.empresa_id) : null,
        fecha_inicio: formNuevo.fecha_inicio,
        fecha_fin: formNuevo.fecha_fin,
        instructor_id: instructorId
      });

      setMostrarModalNuevo(false);
      await showSuccess('Aprendiz asignado correctamente.', 'Guardado');

      await cargarDatos();
      // Refrescar ficha actual
      const nuevasFichas = await apiClient.get('/instructor/seleccion-alternativa/' + instructorId);
      const fichaActualizada = nuevasFichas.find((f) => f.ficha_id === selectedFicha.ficha_id);
      if (fichaActualizada) setSelectedFicha(fichaActualizada);
      else handleBack();
    } catch (err) {
      console.error('Error al crear:', err);
      const msg = (err && err.response && err.response.data && err.response.data.detail) || 'No se pudo crear el proceso.';
      showError(msg);
    }
  };

  // ==========================================================
  // F165 INDIVIDUAL (Instructor)
  // ==========================================================
  const handleGenerarF165Individual = async (aprendiz) => {
    if (!aprendiz?.proceso_id) {
      Swal.fire({
        title: '⚠️ Sin proceso',
        text: 'Este aprendiz no tiene un proceso asociado',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    try {
      Swal.fire({
        title: '📄 Generando F165...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await f165Service.descargarIndividual(aprendiz.proceso_id);

      Swal.fire({
        title: '✅ F165 descargado',
        text: `El formato de ${aprendiz.nombre} se descargó exitosamente.`,
        icon: 'success',
        confirmButtonColor: '#3ca203',
        timer: 2500,
      });
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudo generar el F165',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const getColorAlternativa = (alternativa) => {
    const colores = {
      'Contrato de aprendizaje': '#10b981', 'Contrato de Aprendizaje': '#10b981',
      'Vinculo formativo (pasantia)': '#0ea5e9', 'Vínculo Formativo (Pasantía)': '#0ea5e9',
      'Monitoria': '#8b5cf6',
      'Proyecto productivo': '#f59e0b', 'Proyecto Productivo': '#f59e0b',
      'Vinculo laboral': '#ef4444', 'Vínculo Laboral': '#ef4444'
    };
    return colores[alternativa] || '#6b7280';
  };

  const getIconoAlternativa = (alternativa) => {
    const iconos = {
      'Contrato de aprendizaje': 'fa-file-signature', 'Contrato de Aprendizaje': 'fa-file-signature',
      'Vinculo formativo (pasantia)': 'fa-handshake', 'Vínculo Formativo (Pasantía)': 'fa-handshake',
      'Monitoria': 'fa-chalkboard-teacher',
      'Proyecto productivo': 'fa-project-diagram', 'Proyecto Productivo': 'fa-project-diagram',
      'Vinculo laboral': 'fa-briefcase', 'Vínculo Laboral': 'fa-briefcase'
    };
    return iconos[alternativa] || 'fa-tag';
  };

  const contarAlternativas = (aprendices) => {
    const conteo = {};
    aprendices.forEach(a => {
      if (a.alternativa) conteo[a.alternativa] = (conteo[a.alternativa] || 0) + 1;
    });
    return conteo;
  };

  const filteredFichas = data
    .map(ficha => {
      const aprendicesFiltrados = ficha.aprendices.filter(a =>
        (filtroAlternativa === '' || a.alternativa === filtroAlternativa) &&
        (searchQuery === '' ||
          ficha.idFicha.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ficha.programa.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      return { ...ficha, aprendices: aprendicesFiltrados };
    })
    .filter(ficha => ficha.aprendices.length > 0);

  const goToInicio = () => { navigate('/instructor'); window.location.reload(); };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando...</p>
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

  // ==========================================================
  // RENDER: DETALLE DE FICHA
  // ==========================================================
  if (selectedFicha) {
    const filteredAprendices = selectedFicha.aprendices.filter(a =>
      a.nombre.toLowerCase().includes(searchAprendizQuery.toLowerCase())
    );

    const conAlternativa = selectedFicha.aprendices.filter(a => a.alternativa !== null).length;
    const sinAlternativa = selectedFicha.aprendices.filter(a => a.alternativa === null).length;

    return (
      <div className="seleccion-container">
        <Breadcrumb />

        <div className="seleccion-header">
          <div className="header-back">
            <button className="btn-back" onClick={handleBack}>
              <i className="fas fa-arrow-left"></i> Volver a fichas
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div>
                <h2>Ficha {selectedFicha.idFicha} - {selectedFicha.programa}</h2>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <span style={{ background: '#10b98120', color: '#10b981', padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    {conAlternativa} con alternativa
                  </span>
                  <span style={{ background: '#ef444420', color: '#ef4444', padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    {sinAlternativa} sin alternativa
                  </span>
                </div>
              </div>
              <button
                onClick={handleAbrirModalNuevo}
                style={{
                  background: '#3ca203', color: 'white', border: 'none',
                  padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <i className="fas fa-user-plus" /> Agregar aprendiz
              </button>
            </div>
          </div>
        </div>

        <div className="search-container" style={{ marginBottom: '15px' }}>
          <input type="text" className="search-input" placeholder="Buscar aprendiz por nombre..." value={searchAprendizTerm} onChange={(e) => setSearchAprendizTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchAprendiz()} />
          <button className="btn-search" onClick={handleSearchAprendiz}>Buscar</button>
          <button className="btn-clear" onClick={handleClearAprendiz}>Limpiar</button>
        </div>

        <div className="aprendices-list-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Aprendiz</th>
                  <th>Alternativa Seleccionada</th>
                  <th style={{ textAlign: 'center' }}>Accion</th>
                </tr>
              </thead>
              <tbody>
                {filteredAprendices.map((aprendiz, index) => (
                  <React.Fragment key={index}>
                    <tr style={!aprendiz.alternativa ? { background: '#fef2f2' } : {}}>
                      <td>{index + 1}</td>
                      <td className="nombre-aprendiz">
                        {aprendiz.nombre}
                        {!aprendiz.alternativa && (
                          <span style={{ marginLeft: '8px', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td>
                        {aprendiz.alternativa ? (
                          <span className="alternativa-badge" style={{
                            background: getColorAlternativa(aprendiz.alternativa) + '20',
                            color: getColorAlternativa(aprendiz.alternativa),
                            border: '1px solid ' + getColorAlternativa(aprendiz.alternativa)
                          }}>
                            <i className={'fas ' + getIconoAlternativa(aprendiz.alternativa)} style={{ marginRight: '6px' }} />
                            {aprendiz.alternativa}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                            <i className="fas fa-minus-circle" style={{ marginRight: '4px' }} />
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {aprendiz.alternativa && aprendiz.empresa ? (
                            <button className="btn-asociacion" onClick={() => toggleEmpresa(index)}>
                              <i className="fas fa-building"></i> Empresa
                            </button>
                          ) : (
                            <button className="btn-asignar" onClick={() => handleAsignarAlternativa(aprendiz)} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                              <i className="fas fa-plus"></i> Asignar
                            </button>
                          )}
                          <button
                            onClick={() => handleGenerarF165Individual(aprendiz)}
                            title="Generar F165"
                            style={{
                              background: '#fef3c7',
                              color: '#d97706',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className="fas fa-file-pdf"></i> F165
                          </button>
                        </div>
                      </td>
                    </tr>
                    {empresaVisible === index && aprendiz.empresa && (
                      <tr className="empresa-row">
                        <td colSpan="4">
                          <div className="empresa-panel">
                            <div className="empresa-info-grid">
                              <div className="empresa-item"><span className="empresa-label">Empresa</span><span className="empresa-value">{aprendiz.empresa.nombre}</span></div>
                              <div className="empresa-item"><span className="empresa-label">NIT</span><span className="empresa-value">{aprendiz.empresa.nit || '--'}</span></div>
                              <div className="empresa-item"><span className="empresa-label">ARL</span><span className="empresa-value">{aprendiz.empresa.arl || '--'}</span></div>
                              <div className="empresa-item"><span className="empresa-label">Fecha de inicio</span><span className="empresa-value">{aprendiz.empresa.fecha_inicio || '--'}</span></div>
                              <div className="empresa-item"><span className="empresa-label">Fecha fin</span><span className="empresa-value">{aprendiz.empresa.fecha_fin || '--'}</span></div>
                              <div className="empresa-item"><span className="empresa-label">Estado</span><span className={'empresa-status ' + (aprendiz.empresa.estado === 'ACTIVO' ? 'status-activo' : 'status-inactivo')}>{aprendiz.empresa.estado}</span></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: AGREGAR APRENDIZ */}
        {mostrarModalNuevo && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-content" style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  <i className="fas fa-user-plus" style={{ color: '#3ca203', marginRight: '8px' }} />
                  Agregar Aprendiz a Ficha
                </h3>
                <button onClick={() => setMostrarModalNuevo(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>
                  <i className="fas fa-times" />
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  <strong>Ficha:</strong> {selectedFicha.idFicha} - {selectedFicha.programa}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Aprendiz <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select value={formNuevo.aprendiz_id} onChange={(e) => setFormNuevo({ ...formNuevo, aprendiz_id: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                    <option value="">Seleccionar aprendiz</option>
                    {aprendicesDisponibles.map(ap => (
                      <option key={ap.id} value={ap.id}>{ap.nombre} - {ap.documento_identidad || 'Sin doc'}</option>
                    ))}
                  </select>
                  {aprendicesDisponibles.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                      No hay aprendices disponibles sin asignar
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Alternativa <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select value={formNuevo.modalidad_id} onChange={(e) => setFormNuevo({ ...formNuevo, modalidad_id: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                    <option value="">Seleccionar alternativa</option>
                    {modalidades.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Empresa
                  </label>
                  <select value={formNuevo.empresa_id} onChange={(e) => setFormNuevo({ ...formNuevo, empresa_id: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                    <option value="">Seleccionar empresa (opcional)</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.razon_social}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                      Fecha Inicio <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input type="date" value={formNuevo.fecha_inicio} onChange={(e) => setFormNuevo({ ...formNuevo, fecha_inicio: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                      Fecha Fin <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input type="date" value={formNuevo.fecha_fin} onChange={(e) => setFormNuevo({ ...formNuevo, fecha_fin: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', justifyContent: 'flex-end' }}>
                <button onClick={() => setMostrarModalNuevo(false)} style={{ background: '#e5e7eb', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>
                  Cancelar
                </button>
                <button onClick={handleGuardarNuevo} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                  <i className="fas fa-save" /> Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ASIGNAR (existente) */}
        {mostrarModalAsignacion && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-content" style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  <i className="fas fa-plus-circle" style={{ color: '#3ca203', marginRight: '8px' }} />
                  Asignar Alternativa
                </h3>
                <button onClick={() => setMostrarModalAsignacion(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>
                  <i className="fas fa-times" />
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  <strong>Aprendiz:</strong> {aprendizSeleccionado && aprendizSeleccionado.nombre}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                  <strong>Ficha:</strong> {selectedFicha.idFicha}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Alternativa <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select value={formAsignacion.alternativa} onChange={(e) => setFormAsignacion({ ...formAsignacion, alternativa: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                    <option value="">Seleccionar alternativa</option>
                    {alternativasDisponibles.map(alt => (
                      <option key={alt} value={alt}>{alt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>Empresa</label>
                  <select value={formAsignacion.empresa} onChange={(e) => setFormAsignacion({ ...formAsignacion, empresa: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                    <option value="">Seleccionar empresa</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.razon_social}>{emp.razon_social}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>Fecha Inicio</label>
                    <input type="date" value={formAsignacion.fechaInicio} onChange={(e) => setFormAsignacion({ ...formAsignacion, fechaInicio: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>Fecha Fin</label>
                    <input type="date" value={formAsignacion.fechaFin} onChange={(e) => setFormAsignacion({ ...formAsignacion, fechaFin: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', justifyContent: 'flex-end' }}>
                <button onClick={() => setMostrarModalAsignacion(false)} style={{ background: '#e5e7eb', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>
                  Cancelar
                </button>
                <button onClick={handleGuardarAsignacion} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                  <i className="fas fa-save" /> Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================
  // RENDER: VISTA PRINCIPAL
  // ==========================================================
  return (
    <div className="seleccion-container">
      <Breadcrumb />

      <div className="seleccion-header">
        <div className="header-top-row">
          <div>
            <h2>Seleccion de Alternativa</h2>
            <p className="subtitulo">Selecciona una ficha para ver que alternativa eligieron los aprendices.</p>
          </div>
          <button className="btn-carga-masiva" onClick={handleCargaMasiva} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-upload" /> Carga Masiva
          </button>
        </div>
      </div>

      <div className="search-container">
        <input type="text" className="search-input" placeholder="Buscar por codigo de ficha o programa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        <button className="btn-search" onClick={handleSearch}>Buscar</button>
        <button className="btn-clear" onClick={handleClear}>Limpiar</button>

        <div className="filtro-dropdown-wrapper">
          <button className="btn-filtro-verde" onClick={() => setFiltroDropdownVisible(!filtroDropdownVisible)}>
            <i className="fas fa-filter" />
            Filtrar
            <i className={'fas fa-chevron-down ' + (filtroDropdownVisible ? 'rotate' : '')} />
          </button>
          {filtroDropdownVisible && (
            <div className="filtro-dropdown-menu">
              <div className="filtro-dropdown-header"><span>Filtrar por alternativa</span></div>
              <div className="filtro-dropdown-options">
                <div className={'filtro-dropdown-option ' + (filtroAlternativa === '' ? 'active' : '')} onClick={() => handleFiltroAlternativa('')}>
                  <i className="fas fa-th-list" />
                  Todas las alternativas
                  {filtroAlternativa === '' && <i className="fas fa-check filtro-check" />}
                </div>
                {todasLasAlternativas.map(alt => (
                  <div key={alt} className={'filtro-dropdown-option ' + (filtroAlternativa === alt ? 'active' : '')} onClick={() => handleFiltroAlternativa(alt)}>
                    <span className="filtro-dropdown-dot" style={{ background: getColorAlternativa(alt) }} />
                    {alt}
                    {filtroAlternativa === alt && <i className="fas fa-check filtro-check" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fichas-grid">
        {filteredFichas.length === 0 ? (
          <div className="not-found" style={{ gridColumn: '1 / -1' }}>
            <h2><i className="fas fa-exclamation-circle"></i> Dato no encontrado</h2>
            <p>No existe ninguna ficha con el criterio de busqueda seleccionado.</p>
          </div>
        ) : (
          filteredFichas.map((ficha) => {
            const conteo = contarAlternativas(ficha.aprendices);
            const totalAprendices = ficha.aprendices.length;
            const sinAlternativa = ficha.aprendices.filter(a => a.alternativa === null).length;

            return (
              <div key={ficha.idFicha} className="ficha-card" onClick={() => setSelectedFicha(ficha)}>
                <div className="ficha-card-header">
                  <span className="ficha-numero">{ficha.idFicha}</span>
                  <span className="ficha-cantidad">{totalAprendices} aprendices</span>
                </div>
                <div className="ficha-card-body">
                  <span className="ficha-programa">{ficha.programa}</span>
                </div>
                <div className="ficha-alternativas-resumen">
                  {Object.entries(conteo).length > 0 || sinAlternativa > 0 ? (
                    <>
                      {Object.entries(conteo).map(([alt, cantidad]) => {
                        const porcentaje = totalAprendices > 0 ? Math.round((cantidad / totalAprendices) * 100) : 0;
                        return (
                          <div key={alt} className="alternativa-resumen-item">
                            <span className="alternativa-resumen-dot" style={{ background: getColorAlternativa(alt) }} />
                            <span className="alternativa-resumen-nombre">{alt}</span>
                            <span className="alternativa-resumen-cantidad" style={{ color: getColorAlternativa(alt) }}>
                              {cantidad} ({porcentaje}%)
                            </span>
                          </div>
                        );
                      })}
                      {sinAlternativa > 0 && (
                        <div className="alternativa-resumen-item" style={{ color: '#ef4444' }}>
                          <span className="alternativa-resumen-dot" style={{ background: '#ef4444' }} />
                          <span className="alternativa-resumen-nombre">Sin asignar</span>
                          <span className="alternativa-resumen-cantidad" style={{ color: '#ef4444' }}>
                            {sinAlternativa} ({Math.round((sinAlternativa / totalAprendices) * 100)}%)
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="alternativa-resumen-vacio">Sin alternativas asignadas</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SeleccionAlternativa;