// src/modules/coordinador/pages/CartasPresentacion.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import { cartaPresentacionService } from '@/core/services/cartaPresentacionService';
import { apiClient } from '@/core/api/client';
import './CartasPresentacion.css';

const CartasPresentacion = () => {
  const [cartas, setCartas] = useState([]);
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModalIndividual, setShowModalIndividual] = useState(false);
  const [busquedaAprendiz, setBusquedaAprendiz] = useState('');
  const [aprendizSeleccionado, setAprendizSeleccionado] = useState(null);
  const [archivoIndividual, setArchivoIndividual] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const [showModalMasivo, setShowModalMasivo] = useState(false);
  const [archivosMasivos, setArchivosMasivos] = useState([]);
  const [subiendoMasivo, setSubiendoMasivo] = useState(false);
  const [dragActivo, setDragActivo] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const resCartas = await cartaPresentacionService.listar();
      setCartas(resCartas.cartas || []);
      try {
        const resProcesos = await apiClient.get('/procesos/?solo_activos=true');
        setAprendices(Array.isArray(resProcesos) ? resProcesos : resProcesos.procesos || []);
      } catch (err) {
        console.warn('No se pudieron cargar los procesos:', err);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPlantilla = async () => {
    try {
      Swal.fire({
        title: '📊 Generando plantilla...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await cartaPresentacionService.descargarPlantilla();
      Swal.close();
      Swal.fire({
        title: '✅ Plantilla descargada',
        html: 'Renombra tus PDFs usando la columna<br><b>"Nombre sugerido del PDF"</b>.',
        icon: 'success',
        confirmButtonColor: '#3ca203',
        timer: 3500,
      });
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudo descargar la plantilla',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const handleSubirIndividual = async () => {
    if (!aprendizSeleccionado || !archivoIndividual) return;
    try {
      setSubiendo(true);
      Swal.fire({
        title: '📤 Subiendo carta...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const procesoId = aprendizSeleccionado.proceso_id || aprendizSeleccionado.id;
      await cartaPresentacionService.subir(procesoId, archivoIndividual);
      Swal.fire({
        title: '✅ ¡Carta subida!',
        text: `${aprendizSeleccionado.aprendiz_nombre || 'El aprendiz'} recibió una notificación.`,
        icon: 'success',
        confirmButtonColor: '#3ca203',
        timer: 2500,
      });
      setShowModalIndividual(false);
      setAprendizSeleccionado(null);
      setArchivoIndividual(null);
      setBusquedaAprendiz('');
      cargarDatos();
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudo subir la carta',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setSubiendo(false);
    }
  };

  const handleArchivosMasivos = (files) => {
    const pdfs = Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    setArchivosMasivos(pdfs);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActivo(false);
    handleArchivosMasivos(e.dataTransfer.files);
  };

  const validarNombre = (nombre) => {
    const base = nombre.replace(/\.pdf$/i, '');
    const partes = base.split('_');
    return partes.length >= 2 && partes[0].trim() && partes[1].trim();
  };

  const handleSubirMasivo = async () => {
    if (archivosMasivos.length === 0) return;
    try {
      setSubiendoMasivo(true);
      Swal.fire({
        title: '📤 Subiendo cartas...',
        html: `Subiendo <b>${archivosMasivos.length}</b> PDFs.`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const resultado = await cartaPresentacionService.subirMasivo(archivosMasivos);

      let htmlExito = '';
      if (resultado.detalles_exitosos?.length > 0) {
        htmlExito = `
          <div style="text-align:left;margin-top:14px">
            <p style="color:#047857;font-weight:bold;margin:0 0 6px 0">✅ ${resultado.exitosos} exitosos:</p>
            <ul style="font-size:12px;max-height:150px;overflow-y:auto;margin:0;padding-left:20px">
              ${resultado.detalles_exitosos.map((d) => `<li>${d.aprendiz} (ficha ${d.ficha})</li>`).join('')}
            </ul>
          </div>`;
      }
      let htmlError = '';
      if (resultado.detalles_errores?.length > 0) {
        htmlError = `
          <div style="text-align:left;margin-top:14px">
            <p style="color:#dc2626;font-weight:bold;margin:0 0 6px 0">❌ ${resultado.errores} con error:</p>
            <ul style="font-size:12px;max-height:150px;overflow-y:auto;margin:0;padding-left:20px">
              ${resultado.detalles_errores.map((d) => `<li><b>${d.archivo}</b>: ${d.error}</li>`).join('')}
            </ul>
          </div>`;
      }

      Swal.fire({
        title: '📊 Resultado de la carga',
        html: `
          <p style="margin:0 0 6px 0"><b>Total:</b> ${resultado.total} archivos</p>
          ${htmlExito}
          ${htmlError}
        `,
        icon: resultado.errores === 0 ? 'success' : 'info',
        confirmButtonColor: '#3ca203',
        width: '620px',
      });

      setShowModalMasivo(false);
      setArchivosMasivos([]);
      cargarDatos();
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudieron subir las cartas',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setSubiendoMasivo(false);
    }
  };

  const handleEliminar = async (carta) => {
    const result = await Swal.fire({
      title: '🗑️ ¿Eliminar carta?',
      text: `Se eliminará la carta de ${carta.aprendiz_nombre || 'este aprendiz'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await cartaPresentacionService.eliminar(carta.id);
        Swal.fire({ title: '✅ Eliminada', icon: 'success', confirmButtonColor: '#3ca203', timer: 1500 });
        cargarDatos();
      } catch (err) {
        Swal.fire({
          title: '❌ Error',
          text: err.message || 'No se pudo eliminar',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  // Abre el PDF en una pestaña nueva (Ver)
  const handleVer = (carta) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = carta.archivo_url.startsWith('http')
      ? carta.archivo_url
      : `${API_BASE}${carta.archivo_url}`;
    window.open(url, '_blank');
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const cerrarModalIndividual = () => {
    if (subiendo) return;
    setShowModalIndividual(false);
    setAprendizSeleccionado(null);
    setArchivoIndividual(null);
    setBusquedaAprendiz('');
  };

  const filteredCartas = cartas.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.aprendiz_nombre || '').toLowerCase().includes(q) ||
      (c.ficha_numero || '').toLowerCase().includes(q) ||
      (c.programa_nombre || '').toLowerCase().includes(q)
    );
  });

  const terminoBusqueda = busquedaAprendiz.trim();
  const buscarActivo = terminoBusqueda.length >= 3;

  const coincidencias = buscarActivo
    ? aprendices.filter((a) => {
        const q = terminoBusqueda.toLowerCase();
        const nombre = (a.aprendiz_nombre || a.nombre || '').toLowerCase();
        const ficha = String(a.ficha_numero || a.numero_ficha || '').toLowerCase();
        const documento = String(a.aprendiz_documento || a.documento_identidad || '').toLowerCase();

        const docExacto = documento && documento === q;
        const fichaExacta = ficha && ficha === q;
        const nombreEspecifico =
          nombre &&
          (nombre === q ||
            nombre.startsWith(q) ||
            q.split(/\s+/).filter(Boolean).every((parte) => nombre.includes(parte)));

        return docExacto || fichaExacta || nombreEspecifico;
      })
    : [];

  const aprendizUnico = coincidencias.length === 1 ? coincidencias[0] : null;
  const hayVarios = coincidencias.length > 1;
  const sinResultados = buscarActivo && coincidencias.length === 0;

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-CO');
    } catch {
      return fecha;
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando cartas de presentación...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div className="cartas-header">
        <div className="cartas-header-titulo">
          <h2>
            <i className="fas fa-envelope-open-text"></i>
            Cartas de Presentación
          </h2>
          <p>Sube el PDF firmado para avalar el inicio de la etapa productiva del aprendiz.</p>
        </div>

        <div className="cartas-header-botones">
          <button className="cartas-btn cartas-btn-primary" onClick={() => setShowModalIndividual(true)}>
            <i className="fas fa-plus-circle"></i> Subir Individual
          </button>
          <button className="cartas-btn cartas-btn-masivo" onClick={() => setShowModalMasivo(true)}>
            <i className="fas fa-boxes"></i> Carga Masiva
          </button>
          <button className="cartas-btn cartas-btn-excel" onClick={handleDescargarPlantilla}>
            <i className="fas fa-file-excel"></i> Plantilla Excel
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por aprendiz, ficha o programa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="cartas-input"
          style={{ marginBottom: 0, flex: 1 }}
        />
        <button className="cartas-btn cartas-btn-primary" onClick={handleSearch}>
          <i className="fas fa-search"></i> Buscar
        </button>
        <button className="cartas-btn cartas-btn-secondary" onClick={handleClear}>
          Limpiar
        </button>
      </div>

      {filteredCartas.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }}
        >
          <i
            className="fas fa-envelope-open-text"
            style={{ fontSize: '56px', color: '#d1d5db', marginBottom: '16px' }}
          />
          <h3 style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
            {searchQuery ? 'Sin resultados' : 'No hay cartas de presentación'}
          </h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Usa los botones de arriba para subir la primera carta.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                  Aprendiz
                </th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                  Ficha
                </th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                  Programa
                </th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                  Archivo
                </th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                  Fecha
                </th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCartas.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>
                    {c.aprendiz_nombre || 'Sin nombre'}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '12px',
                      color: '#3ca203',
                      fontWeight: 'bold',
                    }}
                  >
                    {c.ficha_numero || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>
                    {c.programa_nombre || '-'}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                    <i className="fas fa-file-pdf" style={{ color: '#dc2626', marginRight: '4px' }} />
                    {formatBytes(c.tamano_bytes)}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {formatearFecha(c.fecha_carga)}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleVer(c)}
                        title="Ver"
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        <i className="fas fa-eye" />
                      </button>
                      <button
                        onClick={() => handleEliminar(c)}
                        title="Eliminar"
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL INDIVIDUAL */}
      {showModalIndividual && (
        <div className="cartas-modal-overlay" onClick={cerrarModalIndividual}>
          <div className="cartas-modal cartas-modal-individual" onClick={(e) => e.stopPropagation()}>
            <div className="cartas-modal-header">
              <h3>
                <i className="fas fa-plus-circle" style={{ color: '#3ca203', marginRight: '8px' }} />
                Subir Carta Individual
              </h3>
              <button className="cartas-modal-close" onClick={cerrarModalIndividual}>
                ×
              </button>
            </div>

            <label className="cartas-label">Buscar aprendiz</label>
            <input
              type="text"
              className="cartas-input"
              placeholder="Documento, ficha o nombre completo (mín. 3 caracteres)..."
              value={busquedaAprendiz}
              onChange={(e) => {
                setBusquedaAprendiz(e.target.value);
                setAprendizSeleccionado(null);
              }}
              autoFocus
            />

            {!buscarActivo && (
              <div className="cartas-vacio" style={{ marginTop: '8px' }}>
                Escribe el <strong>documento</strong>, la <strong>ficha</strong> o el{' '}
                <strong>nombre completo</strong> del aprendiz. No se muestra la lista de usuarios.
              </div>
            )}

            {sinResultados && (
              <div className="cartas-vacio" style={{ marginTop: '8px' }}>
                No se encontró ningún aprendiz con esa búsqueda.
              </div>
            )}

            {hayVarios && (
              <div className="cartas-vacio" style={{ marginTop: '8px' }}>
                Hay varios resultados. Sé más específico (usa el <strong>número de documento</strong>).
              </div>
            )}

            {aprendizUnico && (
              <div
                className={`cartas-item-aprendiz ${
                  (aprendizSeleccionado?.proceso_id || aprendizSeleccionado?.id) ===
                  (aprendizUnico.proceso_id || aprendizUnico.id)
                    ? 'seleccionado'
                    : ''
                }`}
                style={{ marginTop: '8px', cursor: 'pointer' }}
                onClick={() => setAprendizSeleccionado(aprendizUnico)}
              >
                <strong>{aprendizUnico.aprendiz_nombre || aprendizUnico.nombre || 'Sin nombre'}</strong>
                <span>
                  Ficha: {aprendizUnico.ficha_numero || aprendizUnico.numero_ficha || '-'}
                  {(aprendizUnico.aprendiz_documento || aprendizUnico.documento_identidad) &&
                    ` · Doc: ${aprendizUnico.aprendiz_documento || aprendizUnico.documento_identidad}`}
                </span>
              </div>
            )}

            {aprendizSeleccionado && (
              <div className="cartas-seleccionado-info">
                <i className="fas fa-check-circle"></i>
                Seleccionado:{' '}
                <strong>{aprendizSeleccionado.aprendiz_nombre || aprendizSeleccionado.nombre}</strong>
              </div>
            )}

            <label className="cartas-label">Archivo PDF</label>
            <input
              type="file"
              accept="application/pdf"
              className="cartas-file-input"
              onChange={(e) => setArchivoIndividual(e.target.files[0])}
            />

            <div className="cartas-modal-actions">
              <button
                className="cartas-btn cartas-btn-secondary"
                onClick={cerrarModalIndividual}
                disabled={subiendo}
              >
                Cancelar
              </button>
              <button
                className="cartas-btn cartas-btn-primary"
                onClick={handleSubirIndividual}
                disabled={subiendo || !aprendizSeleccionado || !archivoIndividual}
              >
                {subiendo ? 'Subiendo...' : 'Subir Carta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MASIVO */}
      {showModalMasivo && (
        <div
          className="cartas-modal-overlay"
          onClick={() => !subiendoMasivo && setShowModalMasivo(false)}
        >
          <div className="cartas-modal cartas-modal-masivo" onClick={(e) => e.stopPropagation()}>
            <div className="cartas-modal-header">
              <h3>
                <i className="fas fa-boxes" style={{ color: '#0ea5e9', marginRight: '8px' }} />
                Carga Masiva
              </h3>
              <button className="cartas-modal-close" onClick={() => setShowModalMasivo(false)}>
                ×
              </button>
            </div>

            <div className="cartas-info-formato">
              <strong>
                <i className="fas fa-info-circle"></i> Formato del nombre:
              </strong>
              <br />
              <code>FICHA_DOCUMENTO.pdf</code>
              <br />
              <small>
                Ejemplo: <code>2875901_1234567890.pdf</code>
              </small>
              <br />
              <br />
              <button
                className="cartas-btn cartas-btn-primary"
                onClick={handleDescargarPlantilla}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <i className="fas fa-file-excel"></i> Descargar plantilla Excel
              </button>
            </div>

            <div
              className={`cartas-dropzone ${dragActivo ? 'activo' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActivo(true);
              }}
              onDragLeave={() => setDragActivo(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('input-masivo-file').click()}
            >
              <i className="fas fa-cloud-upload-alt cartas-dropzone-icono"></i>
              <p className="cartas-dropzone-titulo">Arrastra los PDFs aquí</p>
              <p className="cartas-dropzone-desc">o haz click para seleccionar</p>
              <input
                id="input-masivo-file"
                type="file"
                multiple
                accept="application/pdf"
                onChange={(e) => handleArchivosMasivos(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>

            {archivosMasivos.length > 0 && (
              <>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  {archivosMasivos.length} archivo(s) seleccionado(s):
                </p>
                <div className="cartas-lista-archivos">
                  {archivosMasivos.map((f, i) => {
                    const valido = validarNombre(f.name);
                    return (
                      <div key={i} className={`cartas-archivo ${valido ? 'ok' : 'error'}`}>
                        <span>
                          {valido ? '✅' : '❌'} {f.name}
                        </span>
                        <span className="cartas-archivo-tamano">{formatBytes(f.size)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="cartas-modal-actions">
              <button
                className="cartas-btn cartas-btn-secondary"
                onClick={() => setShowModalMasivo(false)}
                disabled={subiendoMasivo}
              >
                Cancelar
              </button>
              <button
                className="cartas-btn cartas-btn-primary"
                onClick={handleSubirMasivo}
                disabled={subiendoMasivo || archivosMasivos.length === 0}
              >
                {subiendoMasivo ? 'Subiendo...' : `Subir ${archivosMasivos.length} Carta(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartasPresentacion;