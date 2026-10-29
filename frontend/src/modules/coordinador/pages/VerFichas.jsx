// src/modules/coordinador/pages/VerFichas.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '../../shared/components/Breadcrumb';
import * as XLSX from 'xlsx';
import { fichaService } from '@/core/services/fichaService';
import { importacionService } from '@/core/services/importacionService';

const VerFichas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [fichas, setFichas] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      return new Date(fecha).toLocaleDateString('es-ES');
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
    const numero = (f.numero_ficha || f.grupo_ficha || '').toLowerCase();
    const programa = (getNombrePrograma(f.programa_id) || f.programa_formacion || '').toLowerCase();
    const nombreAprendiz = (f.nombre_completo || f.aprendiz_nombre || '').toLowerCase();
    const documento = (f.documento || '').toLowerCase();
    return numero.includes(q) || programa.includes(q) || nombreAprendiz.includes(q) || documento.includes(q);
  });

  // ==========================================================
  // CARGA MASIVA DE ESTADOS DE APRENDICES
  // ==========================================================
  const handleCargaMasiva = () => {
    Swal.fire({
      title: '📤 Carga Masiva de Estados de Aprendices',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 15px 0; padding: 20px; border: 2px dashed #d1d5db; border-radius: 8px; text-align: center; background: #f9fafb;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #3ca203;"></i>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
              Selecciona un archivo Excel (.xlsx) o CSV
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">
              Columnas: <strong>documento</strong> y <strong>estado</strong>
            </p>
          </div>

          <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border: 1px solid #fcd34d; font-size: 12px; color: #92400e;">
            <i class="fas fa-info-circle"></i>
            <strong>Reglas de carga:</strong>
            <ul style="margin: 6px 0 0 0; padding-left: 18px;">
              <li>✅ Estado <b>ACTIVO</b>: se carga normalmente</li>
              <li>⚠️ Estado <b>CONDICIONADO</b>: se carga con advertencia</li>
              <li>❌ Estados <b>APLAZADO, RETIRADO, FINALIZADO</b>: se rechazan</li>
            </ul>
          </div>

          <div style="margin: 15px 0;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 5px;">
              Archivo *
            </label>
            <input type="file" id="archivo-carga-masiva" accept=".xlsx,.xls,.csv"
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
            />
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '📤 Subir y Procesar',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '600px',
      preConfirm: () => {
        const archivo = document.getElementById('archivo-carga-masiva').files[0];
        if (!archivo) {
          Swal.showValidationMessage('⚠️ Por favor selecciona un archivo');
          return false;
        }
        return { archivo };
      },
    }).then(async (result) => {
      if (!result.isConfirmed || !result.value) return;

      const { archivo } = result.value;

      try {
        Swal.fire({
          title: 'Procesando archivo...',
          html: 'Esto puede tomar unos segundos.',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const respuesta = await importacionService.importar('estados-aprendices', archivo);

        await cargarDatos();

        Swal.fire({
          title: '📊 Resultado de la carga',
          html: `
            <div style="text-align:left;">
              <div style="display:flex; gap:10px; margin-bottom:15px;">
                <div style="flex:1; background:#f0fdf4; padding:12px; border-radius:8px; text-align:center; border:1px solid #bbf7d0;">
                  <div style="font-size:22px; font-weight:bold; color:#047857;">${respuesta.filas_insertadas || 0}</div>
                  <div style="font-size:11px; color:#065f46; text-transform:uppercase;">✅ Cargados</div>
                </div>
                <div style="flex:1; background:#fef3c7; padding:12px; border-radius:8px; text-align:center; border:1px solid #fcd34d;">
                  <div style="font-size:22px; font-weight:bold; color:#d97706;">${respuesta.filas_con_advertencia || 0}</div>
                  <div style="font-size:11px; color:#92400e; text-transform:uppercase;">⚠️ Advertencia</div>
                </div>
                <div style="flex:1; background:#fee2e2; padding:12px; border-radius:8px; text-align:center; border:1px solid #fecaca;">
                  <div style="font-size:22px; font-weight:bold; color:#dc2626;">${respuesta.filas_rechazadas || 0}</div>
                  <div style="font-size:11px; color:#991b1b; text-transform:uppercase;">❌ Rechazados</div>
                </div>
              </div>
              <p style="text-align:center; font-size:12px; color:#6b7280; margin:0 0 4px 0;">
                Total filas procesadas: <b>${respuesta.total_filas || 0}</b>
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#3ca203',
          confirmButtonText: 'Aceptar',
          width: '620px',
        });
      } catch (err) {
        console.error('❌ Error en carga masiva:', err);
        Swal.fire({
          title: '❌ Error',
          text: err.message || 'No se pudo procesar el archivo',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      }
    });
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

    const programaOptions = programas.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('');

    Swal.fire({
      title: '📚 Nueva Ficha',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Programa *</label>
            <select id="new-programa" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">${programaOptions}</select>
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Número de ficha *</label>
            <input id="new-numero" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="Ej: 2875901" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Nivel *</label>
              <select id="new-nivel" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                <option value="Tecnólogo">Tecnólogo</option>
                <option value="Técnico">Técnico</option>
                <option value="Profesional">Profesional</option>
                <option value="Especialización">Especialización</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Jornada *</label>
              <select id="new-jornada" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
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
              <input id="new-fecha-inicio" type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Fecha Fin Productiva *</label>
              <input id="new-fecha-fin" type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
            </div>
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Aprendices esperados</label>
            <input id="new-aprendices" type="number" min="0" value="0" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
          </div>
        </div>
      `,
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

        if (!numero_ficha) { Swal.showValidationMessage('⚠️ Número obligatorio'); return false; }
        if (!fecha_inicio || !fecha_fin) { Swal.showValidationMessage('⚠️ Fechas obligatorias'); return false; }
        if (new Date(fecha_fin) < new Date(fecha_inicio)) { Swal.showValidationMessage('⚠️ Fecha fin no puede ser anterior a fecha inicio'); return false; }

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
          Swal.fire({
            title: '❌ Error',
            text: err.message || 'No se pudo crear',
            icon: 'error',
            confirmButtonColor: '#dc2626',
          });
        }
      }
    });
  };

  // ==========================================================
  // ACTIVAR / DESACTIVAR
  // ==========================================================
  const handleDesactivarManual = async (ficha) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Desactivar ficha?',
      text: `La ficha ${ficha.numero_ficha} se marcará como inactiva.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    });
    if (isConfirmed) {
      try {
        await fichaService.updateFicha(ficha.id, { is_active: false });
        await cargarDatos();
        Swal.fire({ title: '✅ Ficha desactivada', icon: 'success', confirmButtonColor: '#3ca203', timer: 1500 });
      } catch (err) {
        Swal.fire({ title: '❌ Error', text: err.message, icon: 'error', confirmButtonColor: '#dc2626' });
      }
    }
  };

  const handleActivarManual = async (ficha) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Activar ficha?',
      text: `La ficha ${ficha.numero_ficha} se marcará como activa.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3ca203',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
    });
    if (isConfirmed) {
      try {
        await fichaService.updateFicha(ficha.id, { is_active: true });
        await cargarDatos();
        Swal.fire({ title: '✅ Ficha activada', icon: 'success', confirmButtonColor: '#3ca203', timer: 1500 });
      } catch (err) {
        Swal.fire({ title: '❌ Error', text: err.message, icon: 'error', confirmButtonColor: '#dc2626' });
      }
    }
  };

  // ==========================================================
  // LOADING & ERROR
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
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Centro de Fichas</h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
            Gestión de todas las fichas del sistema ({fichas.length} registros).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCargaMasiva}
            style={{
              background: '#3ca203',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-upload" /> Carga Masiva
          </button>
          <button
            onClick={handleNuevaFicha}
            style={{
              background: '#3ca203',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-plus" /> Nueva Ficha
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por código, programa, nombre o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          Buscar
        </button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          Limpiar
        </button>
      </div>

      {filteredFichas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
          <h3 style={{ color: '#6b7280', margin: '10px 0 5px 0' }}>No hay fichas registradas</h3>
          <p style={{ color: '#9ca3af' }}>Haz clic en "Nueva Ficha" para crear la primera.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#fef08a', color: '#1f2937', fontWeight: 'bold', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Programa Formación</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Grupo - Ficha</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Fecha Ini Grupo</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Fecha Ini EP Grupo</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Duración</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Fecha Fin Grupo</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Nivel Formación</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Modalidad</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Tipo Documento</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Documento</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Nombre Completo</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Correo</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>RAPs Lectiva Pendientes</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>% RAPs</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Estado Registro</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Alternativa Etapa Productiva</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Estado Alternativa</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Fecha Ini Alternativa</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Fecha Fin Alternativa</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Fecha Inicio Contrato</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Fecha Fin Contrato</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichas.map((f, index) => (
                <tr key={f.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px' }}>{f.programa_formacion || getNombrePrograma(f.programa_id)}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#3ca203' }}>{f.grupo_ficha || f.numero_ficha || '-'}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{formatearFecha(f.fecha_ini || f.fecha_inicio)}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{formatearFecha(f.fecha_ini_ep_grupo)}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{f.duracion || '-'}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{formatearFecha(f.fecha_fin_grupo || f.fecha_fin)}</td>
                  <td style={{ padding: '10px' }}>{f.nivel_formacion || f.nivel || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>{f.modalidad || 'Presencial'}</td>
                  <td style={{ padding: '10px' }}>{f.tipo_documento || 'CC'}</td>
                  <td style={{ padding: '10px' }}>{f.documento || f.aprendiz_documento || '-'}</td>
                  <td style={{ padding: '10px', fontWeight: '500' }}>{f.nombre_completo || f.aprendiz_nombre || 'Sin aprendiz'}</td>
                  <td style={{ padding: '10px' }}>{f.correo || f.aprendiz_email || '-'}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{f.raps_pendientes ?? 0}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{f.porcentaje_raps ?? 100}%</td>
                  <td style={{ padding: '10px' }}>{f.estado_registro || 'Registrado'}</td>
                  <td style={{ padding: '10px' }}>{f.alternativa_ep || f.alternativa || 'Sin definir'}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>
                    <span
                      style={{
                        background: (f.estado === 'ACTIVO' || f.is_active) ? '#d1fae5' : '#f3f4f6',
                        color: (f.estado === 'ACTIVO' || f.is_active) ? '#047857' : '#6b7280',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {f.estado || (f.is_active ? 'Activa' : 'Inactiva')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{formatearFecha(f.fecha_inicio_alternativa)}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{formatearFecha(f.fecha_fin_alternativa)}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{formatearFecha(f.fecha_inicio_contrato)}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{formatearFecha(f.fecha_fin_contrato)}</td>
                  <td style={{ textAlign: 'center', padding: '10px', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => navigate(`/coordinador/ficha-completa/${f.id || f.ficha_id}?modo=parametrizacion`)}
                      style={{ background: '#e6f7ed', color: '#047857', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' }}
                    >
                      <i className="fas fa-eye" /> Ver
                    </button>
                    {f.is_active !== false ? (
                      <button
                        onClick={() => handleDesactivarManual(f)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        <i className="fas fa-pause-circle" /> Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivarManual(f)}
                        style={{ background: '#d1fae5', color: '#047857', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        <i className="fas fa-play-circle" /> Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerFichas;