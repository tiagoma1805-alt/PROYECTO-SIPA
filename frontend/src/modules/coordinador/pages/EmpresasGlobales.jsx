// src/modules/coordinador/pages/EmpresasGlobales.jsx
import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { empresaService } from '@/core/services/empresaService';

const EmpresasGlobales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await empresaService.getEmpresas();
      console.log('🏢 Empresas cargadas:', data);
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
      setError(err.message || 'Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const filteredEmpresas = empresas.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nombre = (e.razon_social || '').toLowerCase();
    const nit = (e.nit || '').toLowerCase();
    return nombre.includes(q) || nit.includes(q);
  });

  // ==========================================================
  // CARGA MASIVA DE EMPRESAS
  // ==========================================================
  const handleCargaMasiva = async () => {
    const { value: file } = await Swal.fire({
      title: '📥 Carga Masiva de Empresas',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="margin-bottom: 15px; padding: 20px; border: 2px dashed #3ca203; border-radius: 10px; text-align: center;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #3ca203;"></i>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              <strong>Selecciona un archivo Excel (.xlsx) o CSV</strong>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">
              Columnas: <strong>nit, razon_social, arl, direccion, telefono, correo_contacto</strong>
            </p>
          </div>
          <div style="margin: 15px 0;">
            <input type="file" id="archivoEmpresas" accept=".xlsx,.xls,.csv" 
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
        const fileInput = document.getElementById('archivoEmpresas');
        if (!fileInput.files.length) {
          Swal.showValidationMessage('⚠️ Selecciona un archivo');
          return false;
        }
        return { file: fileInput.files[0] };
      },
    });

    if (!file) return;

    try {
      // Mostrar spinner
      Swal.fire({
        title: 'Subiendo archivo...',
        html: 'Por favor espera mientras se procesan las empresas.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const resultado = await empresaService.bulkUploadEmpresas(file.file);
      console.log('✅ Resultado importación:', resultado);

      const { total_filas, filas_insertadas, filas_con_error, errores } = resultado;

      if (filas_con_error === 0) {
        await Swal.fire({
          title: '✅ ¡Carga completada!',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>Total procesadas:</strong> ${total_filas}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #047857;"><strong>✅ Creadas:</strong> ${filas_insertadas}</p>
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
          .map((e) => `• Fila ${e.fila || '?'}: ${e.mensaje || JSON.stringify(e)}`)
          .join('<br/>');

        await Swal.fire({
          title: '⚠️ Carga con advertencias',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>Total:</strong> ${total_filas}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #047857;"><strong>✅ Creadas:</strong> ${filas_insertadas}</p>
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

      await cargarEmpresas();
    } catch (err) {
      console.error('❌ Error en carga masiva:', err);
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudo procesar el archivo',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  // ==========================================================
  // NUEVA EMPRESA
  // ==========================================================
  const handleNuevaEmpresa = async () => {
    const { value: formValues } = await Swal.fire({
      title: '📋 Nueva Empresa',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">Razón Social *</label>
            <input id="razonSocial" placeholder="Ej. TechSoft S.A.S." style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">NIT *</label>
            <input id="nit" placeholder="Ej. 900123456-1" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">ARL *</label>
            <input id="arl" placeholder="Ej. SURA" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">Dirección</label>
            <input id="direccion" placeholder="Ej. Calle 123 #45-67" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">Teléfono</label>
            <input id="telefono" placeholder="Ej. 3001234567" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 5px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">Correo de contacto</label>
            <input id="correo" placeholder="Ej. contacto@empresa.com" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: 'Guardar Empresa',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '520px',
      preConfirm: () => {
        const razon_social = document.getElementById('razonSocial').value.trim();
        const nit = document.getElementById('nit').value.trim();
        const arl = document.getElementById('arl').value.trim();

        if (!razon_social) { Swal.showValidationMessage('⚠️ La razón social es obligatoria'); return false; }
        if (!nit) { Swal.showValidationMessage('⚠️ El NIT es obligatorio'); return false; }
        if (!arl) { Swal.showValidationMessage('⚠️ La ARL es obligatoria'); return false; }

        return {
          razon_social,
          nit,
          arl,
          direccion: document.getElementById('direccion').value.trim() || null,
          telefono: document.getElementById('telefono').value.trim() || null,
          correo_contacto: document.getElementById('correo').value.trim() || null,
        };
      },
    });

    if (formValues) {
      try {
        await empresaService.createEmpresa(formValues);
        await cargarEmpresas();
        Swal.fire({
          title: '✅ ¡Empresa creada!',
          text: `"${formValues.razon_social}" fue registrada correctamente.`,
          icon: 'success',
          confirmButtonColor: '#3ca203',
          timer: 2500,
        });
      } catch (err) {
        Swal.fire({
          title: '❌ Error al crear',
          text: err.message || 'No se pudo crear la empresa',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  // ==========================================================
  // EDITAR EMPRESA
  // ==========================================================
  const handleEditarEmpresa = async (empresa) => {
    const { value: formValues } = await Swal.fire({
      title: '✏️ Editar Empresa',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">Razón Social *</label>
            <input id="razonSocial" value="${empresa.razon_social || ''}" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">NIT *</label>
            <input id="nit" value="${empresa.nit || ''}" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">ARL *</label>
            <input id="arl" value="${empresa.arl || ''}" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">Dirección</label>
            <input id="direccion" value="${empresa.direccion || ''}" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">Teléfono</label>
            <input id="telefono" value="${empresa.telefono || ''}" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 5px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1f2937; font-size: 14px;">Correo de contacto</label>
            <input id="correo" value="${empresa.correo_contacto || ''}" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
          </div>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: 'Guardar Cambios',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '520px',
      preConfirm: () => {
        const razon_social = document.getElementById('razonSocial').value.trim();
        const nit = document.getElementById('nit').value.trim();
        const arl = document.getElementById('arl').value.trim();

        if (!razon_social || !nit || !arl) {
          Swal.showValidationMessage('⚠️ Razón social, NIT y ARL son obligatorios');
          return false;
        }

        return {
          razon_social,
          nit,
          arl,
          direccion: document.getElementById('direccion').value.trim() || null,
          telefono: document.getElementById('telefono').value.trim() || null,
          correo_contacto: document.getElementById('correo').value.trim() || null,
        };
      },
    });

    if (formValues) {
      try {
        await empresaService.updateEmpresa(empresa.id, formValues);
        await cargarEmpresas();
        Swal.fire({
          title: '✅ ¡Empresa actualizada!',
          icon: 'success',
          confirmButtonColor: '#3ca203',
          timer: 2000,
        });
      } catch (err) {
        Swal.fire({
          title: '❌ Error',
          text: err.message || 'No se pudo actualizar',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  // ==========================================================
  // ELIMINAR EMPRESA
  // ==========================================================
  const handleEliminarEmpresa = async (empresa) => {
    const result = await Swal.fire({
      title: '¿Eliminar empresa?',
      html: `¿Deseas eliminar <strong>"${empresa.razon_social}"</strong>?<br/><small style="color: #6b7280;">Esta acción desactivará la empresa del sistema.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await empresaService.deleteEmpresa(empresa.id);
        await cargarEmpresas();
        Swal.fire({
          title: '✅ Empresa eliminada',
          icon: 'success',
          confirmButtonColor: '#3ca203',
          timer: 1500,
        });
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

  // ==========================================================
  // LOADING & ERROR
  // ==========================================================
  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando empresas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar empresas</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarEmpresas} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          <i className="fas fa-redo" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Empresas Globales</h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Gestión de empresas del sistema ({empresas.length} empresas).</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleCargaMasiva} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-upload" /> Carga Masiva
          </button>
          <button onClick={handleNuevaEmpresa} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-plus" /> Nueva Empresa
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Buscar por razón social o NIT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Buscar</button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
      </div>

      {filteredEmpresas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-building" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
          <h3 style={{ color: '#6b7280', margin: '10px 0 5px 0' }}>No hay empresas registradas</h3>
          <p style={{ color: '#9ca3af' }}>Haz clic en "Nueva Empresa" para crear la primera.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Razón Social</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>NIT</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>ARL</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Teléfono</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpresas.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{e.razon_social}</td>
                  <td style={{ padding: '12px' }}>{e.nit}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {e.arl || 'Sin ARL'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{e.telefono || '—'}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <button onClick={() => handleEditarEmpresa(e)} style={{ background: '#e6f7ed', color: '#047857', border: 'none', padding: '4px 12px', borderRadius: '6px', marginRight: '5px', cursor: 'pointer' }}>
                      <i className="fas fa-edit" /> Editar
                    </button>
                    <button onClick={() => handleEliminarEmpresa(e)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                      <i className="fas fa-trash" /> Eliminar
                    </button>
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

export default EmpresasGlobales;