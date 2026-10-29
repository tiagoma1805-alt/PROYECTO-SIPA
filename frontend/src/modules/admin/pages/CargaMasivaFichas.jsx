// src/pages/admin/CargaMasivaFichas.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { importacionService } from '@/core/services/importacionService';

const CargaMasivaFichas = ({ onClose, onFichasCargadas }) => {
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState([]);
  const [cargando, setCargando] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    procesarArchivo(file);
  };

  const procesarArchivo = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          Swal.fire({
            title: '⚠️ Archivo vacío',
            text: 'El archivo no contiene datos.',
            icon: 'warning',
            confirmButtonColor: '#f59e0b',
          });
          return;
        }

        const fichasMapeadas = jsonData.map((row, index) => ({
          id: index + 1,
          numero_ficha: row['numero_ficha'] || row['Código'] || row['codigo'] || row['Codigo'] || '',
          programa_id: row['programa_id'] || row['Programa'] || row['programa'] || '',
          nivel: row['nivel'] || row['Nivel'] || 'Tecnólogo',
          jornada: row['jornada'] || row['Jornada'] || 'Mañana',
          aprendices_esperados: parseInt(row['aprendices_esperados'] || row['Aprendices'] || 0),
          fecha_inicio: row['fecha_inicio'] || row['Fecha_Inicio'] || '',
          fecha_fin: row['fecha_fin'] || row['Fecha_Fin'] || '',
          is_active: (row['estado'] || row['Estado'] || 'Activa') === 'Activa',
        }));

        setVistaPrevia(fichasMapeadas);
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: '❌ Error al leer el archivo',
          text: 'Asegúrate de que sea un archivo Excel (.xlsx, .xls) o CSV válido.',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmarCarga = async () => {
    if (!archivo) {
      Swal.fire({
        title: '⚠️ Sin archivo',
        text: 'Selecciona un archivo primero.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    setCargando(true);

    try {
      const resultado = await importacionService.importar('fichas', archivo);
      console.log('✅ Resultado de importación:', resultado);

      const { total_filas, filas_insertadas, filas_con_error, errores } = resultado;

      if (filas_con_error === 0) {
        await Swal.fire({
          title: '✅ ¡Carga completada!',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>Total de filas:</strong> ${total_filas}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #047857;"><strong>✅ Fichas creadas:</strong> ${filas_insertadas}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #dc2626;"><strong>❌ Con error:</strong> ${filas_con_error}</p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#3ca203',
        });
      } else {
        const erroresTexto = errores
          .slice(0, 10)
          .map((e) => `• Fila ${e.fila || '?'}: ${e.error || JSON.stringify(e)}`)
          .join('<br/>');

        await Swal.fire({
          title: '⚠️ Carga con advertencias',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>Total:</strong> ${total_filas}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #047857;"><strong>✅ Creados:</strong> ${filas_insertadas}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #dc2626;"><strong>❌ Errores:</strong> ${filas_con_error}</p>
              </div>
              <div style="background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fecaca;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold;">Errores:</p>
                <div style="font-size: 12px; max-height: 150px; overflow-y: auto;">${erroresTexto}</div>
              </div>
            </div>
          `,
          icon: 'warning',
          confirmButtonColor: '#f59e0b',
          width: '600px',
        });
      }

      if (onFichasCargadas && filas_insertadas > 0) {
        onFichasCargadas();
      }
      onClose();
    } catch (error) {
      console.error('❌ Error en la carga masiva:', error);
      Swal.fire({
        title: '❌ Error al subir',
        text: error.message || 'No se pudo procesar el archivo.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>
        <i className="fas fa-file-upload" style={{ color: '#3ca203', marginRight: '8px' }} />
        Carga Masiva de Fichas
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Selecciona un archivo Excel (.xlsx, .xls) o CSV con las columnas:{' '}
        <strong>numero_ficha, programa_id, nivel, jornada, aprendices_esperados, fecha_inicio, fecha_fin, estado</strong>.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        {archivo && (
          <span style={{ fontSize: '14px', color: '#3ca203' }}>
            <i className="fas fa-check-circle" /> Archivo seleccionado: <strong>{archivo.name}</strong>
          </span>
        )}
      </div>

      {vistaPrevia.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontWeight: '600', marginBottom: '10px' }}>
            <i className="fas fa-eye" /> Vista previa ({vistaPrevia.length} fichas)
          </h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Código</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Programa ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Nivel</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Jornada</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Aprendices</th>
                </tr>
              </thead>
              <tbody>
                {vistaPrevia.map((f, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px' }}>{idx + 1}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{f.numero_ficha}</td>
                    <td style={{ padding: '8px' }}>{f.programa_id}</td>
                    <td style={{ padding: '8px' }}>{f.nivel}</td>
                    <td style={{ padding: '8px' }}>{f.jornada}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{f.aprendices_esperados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          disabled={cargando}
          style={{
            background: '#e5e7eb',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: cargando ? 'not-allowed' : 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmarCarga}
          disabled={vistaPrevia.length === 0 || cargando}
          style={{
            background: '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: vistaPrevia.length === 0 || cargando ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: vistaPrevia.length === 0 || cargando ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className={`fas ${cargando ? 'fa-spinner fa-spin' : 'fa-upload'}`} />
          {cargando ? 'Subiendo...' : 'Confirmar Carga'}
        </button>
      </div>
    </div>
  );
};

export default CargaMasivaFichas;