// src/modules/coordinador/pages/FichasParametrizacion.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { fichaService } from '@/core/services/fichaService';

const FichasParametrizacion = () => {
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
    const numero = (f.numero_ficha || '').toLowerCase();
    const programa = getNombrePrograma(f.programa_id).toLowerCase();
    return numero.includes(q) || programa.includes(q);
  });

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
        if (fichas.some((f) => f.numero_ficha === numero_ficha)) { Swal.showValidationMessage(`⚠️ La ficha ${numero_ficha} ya existe`); return false; }

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
  // CARGA MASIVA
  // ==========================================================
  const handleCargaMasiva = async () => {
    const { value: file } = await Swal.fire({
      title: '📥 Carga Masiva de Fichas',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="margin-bottom: 15px; padding: 20px; border: 2px dashed #3ca203; border-radius: 10px; text-align: center;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #3ca203;"></i>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              <strong>Selecciona un archivo Excel (.xlsx) o CSV</strong>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">
              Columnas: <strong>Código, Programa, Nivel, Aprendices, Estado</strong>
            </p>
          </div>
          <div style="margin: 15px 0;">
            <input type="file" id="archivoFichas" accept=".xlsx,.xls,.csv" 
              style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" />
          </div>
        </div>
      `,
      confirmButtonText: '📥 Procesar',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '600px',
      preConfirm: () => {
        const fileInput = document.getElementById('archivoFichas');
        if (!fileInput.files.length) {
          Swal.showValidationMessage('⚠️ Selecciona un archivo');
          return false;
        }
        return { file: fileInput.files[0] };
      },
    });

    if (!file) return;

    try {
      const data = await file.file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (rows.length > 0 && (rows[0][0] === 'Código' || rows[0][0] === 'CODIGO')) rows.shift();

      const nuevasFichas = [];
      const errores = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const codigo = (row[0] || '').trim();
        const programa = (row[1] || '').trim();
        const nivel = (row[2] || '').trim() || 'Tecnólogo';
        const aprendices = parseInt(row[3]) || 0;
        const estado = (row[4] || 'Activa').trim();

        if (!codigo || !programa) { errores.push(`Fila ${i + 1}: faltan datos`); continue; }
        if (fichas.some((f) => f.numero_ficha === codigo)) { errores.push(`Fila ${i + 1}: ficha ${codigo} ya existe`); continue; }

        const progEncontrado = programas.find((p) => p.nombre.toLowerCase() === programa.toLowerCase());
        if (!progEncontrado) { errores.push(`Fila ${i + 1}: programa "${programa}" no existe`); continue; }

        nuevasFichas.push({
          programa_id: progEncontrado.id,
          numero_ficha: codigo,
          nivel,
          jornada: 'Mañana',
          aprendices_esperados: aprendices,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          is_active: estado !== 'Inactiva',
        });
      }

      if (nuevasFichas.length === 0) {
        await Swal.fire({ title: '⚠️ Sin datos válidos', html: errores.slice(0, 5).join('<br/>'), icon: 'warning', confirmButtonColor: '#f59e0b' });
        return;
      }

      const { isConfirmed } = await Swal.fire({
        title: '¿Guardar fichas?',
        html: `Se cargarán <strong>${nuevasFichas.length}</strong> fichas nuevas.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3ca203',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
      });

      if (isConfirmed) {
        let creadas = 0;
        for (const f of nuevasFichas) {
          try { await fichaService.createFicha(f); creadas++; }
          catch (err) { errores.push(`${f.numero_ficha}: ${err.message}`); }
        }
        await cargarDatos();
        await Swal.fire({
          title: '✅ Carga completada',
          html: `${creadas} de ${nuevasFichas.length} fichas creadas.`,
          icon: 'success',
          confirmButtonColor: '#3ca203',
        });
      }
    } catch (error) {
      Swal.fire({ title: '❌ Error', text: error.message, icon: 'error', confirmButtonColor: '#dc2626' });
    }
  };

  // ==========================================================
  // ACTIVAR / DESACTIVAR
  // ==========================================================
  const handleDesactivar = async (ficha) => {
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

  const handleActivar = async (ficha) => {
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

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      {/* ENCABEZADO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            <i className="fas fa-cog" style={{ color: '#3ca203', marginRight: '10px' }} />
            Parametrización de Fichas
          </h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
            Gestiona las fichas de formación ({fichas.length} fichas).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleCargaMasiva} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-upload" /> Carga Masiva
          </button>
          <button onClick={handleNuevaFicha} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-plus" /> Nueva Ficha
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por código o programa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Buscar</button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
      </div>

      {/* TABLA */}
      {filteredFichas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
          <h3 style={{ color: '#6b7280', margin: '10px 0 5px 0' }}>No hay fichas registradas</h3>
          <p style={{ color: '#9ca3af' }}>Haz clic en "Nueva Ficha" para crear la primera.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Código</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Programa</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Nivel</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Aprendices</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Inicio Productiva</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Fin Productiva</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichas.map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#3ca203' }}>{f.numero_ficha}</td>
                  <td style={{ padding: '12px' }}>{getNombrePrograma(f.programa_id)}</td>
                  <td style={{ padding: '12px' }}>{f.nivel || 'N/A'}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{f.aprendices_esperados || 0}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{formatearFecha(f.fecha_inicio)}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{formatearFecha(f.fecha_fin)}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <span style={{ background: f.is_active ? '#d1fae5' : '#f3f4f6', color: f.is_active ? '#047857' : '#6b7280', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {f.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <button
                      onClick={() => navigate(`/coordinador/aprendices-ficha/${f.id}`)}
                      style={{ background: '#e6f7ed', color: '#047857', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' }}
                    >
                      <i className="fas fa-eye" /> Ver
                    </button>
                    {f.is_active ? (
                      <button onClick={() => handleDesactivar(f)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <i className="fas fa-pause-circle" /> Desactivar
                      </button>
                    ) : (
                      <button onClick={() => handleActivar(f)} style={{ background: '#d1fae5', color: '#047857', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
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

export default FichasParametrizacion;