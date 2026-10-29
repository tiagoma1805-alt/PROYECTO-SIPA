// src/modules/coordinador/pages/InstructoresGlobales.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import Swal from 'sweetalert2';
import { userService } from '@/core/services/userService';
import { API_ENDPOINTS } from '@/core/api/endpoints';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const InstructoresGlobales = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarInstructores();
  }, []);

  const cargarInstructores = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Traer instructores (rol_id = 3)
      const usuarios = await userService.getInstructors();
      console.log('👨‍🏫 Instructores recibidos:', usuarios);

      // 2. Traer asignaciones (para contar fichas por instructor)
      const token = localStorage.getItem('token');
      const asignaciones = await fetch(`${API_BASE_URL}/asignaciones`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []);

      console.log('📋 Asignaciones:', asignaciones);

      // 3. Contar fichas asignadas por instructor
      const conteoFichas = {};
      (Array.isArray(asignaciones) ? asignaciones : []).forEach((a) => {
        if (a.is_active && a.estado_asignacion === 'ACTIVA') {
          conteoFichas[a.instructor_id] = (conteoFichas[a.instructor_id] || 0) + 1;
        }
      });

      // 4. Mapear instructores
      const mapeados = (Array.isArray(usuarios) ? usuarios : []).map((i) => ({
        id: i.id,
        nombre: `${i.nombre || ''} ${i.apellido || ''}`.trim() || 'Sin nombre',
        email: i.email || 'Sin correo',
        fichasAsignadas: conteoFichas[i.id] || 0,
      }));

      setInstructores(mapeados);
    } catch (err) {
      console.error('Error al cargar instructores:', err);
      setError(err.message || 'Error al cargar instructores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const filteredInstructores = instructores.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (i.nombre || '').toLowerCase().includes(q) ||
      (i.email || '').toLowerCase().includes(q)
    );
  });

  // ==========================================================
  // CARGA MASIVA
  // ==========================================================
  const handleCargaMasiva = async () => {
    const { value: file } = await Swal.fire({
      title: '📥 Carga Masiva de Instructores',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="margin-bottom: 15px; padding: 20px; border: 2px dashed #3ca203; border-radius: 10px; text-align: center;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #3ca203;"></i>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              <strong>Selecciona un archivo Excel (.xlsx) o CSV</strong>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">
              Columnas: <strong>nombre, apellido, email, contraseña</strong>
            </p>
          </div>
          <div style="margin: 15px 0;">
            <input type="file" id="archivoInstructores" accept=".xlsx,.xls,.csv"
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
        const fileInput = document.getElementById('archivoInstructores');
        if (!fileInput.files.length) {
          Swal.showValidationMessage('⚠️ Selecciona un archivo');
          return false;
        }
        return { file: fileInput.files[0] };
      },
    });

    if (!file) return;

    try {
      Swal.fire({
        title: 'Subiendo archivo...',
        html: 'Por favor espera mientras se procesan los instructores.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const resultado = await userService.bulkUploadUsers(file.file);
      console.log('✅ Resultado:', resultado);

      const { total_filas, filas_insertadas, filas_con_error, errores } = resultado;

      if (filas_con_error === 0) {
        await Swal.fire({
          title: '✅ ¡Carga completada!',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <p style="margin: 5px 0; font-size: 14px;"><strong>Total:</strong> ${total_filas}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #047857;"><strong>✅ Creados:</strong> ${filas_insertadas}</p>
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

      await cargarInstructores();
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
  // LOADING / ERROR
  // ==========================================================
  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando instructores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar instructores</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={cargarInstructores}
          style={{
            background: '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '15px',
          }}
        >
          <i className="fas fa-redo" /> Reintentar
        </button>
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
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Instructores Globales</h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
            Gestión de instructores del sistema ({instructores.length} instructores).
          </p>
        </div>
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
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button
          onClick={handleSearch}
          style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <i className="fas fa-search" /> Buscar
        </button>
        <button
          onClick={handleClear}
          style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <i className="fas fa-times" /> Limpiar
        </button>
      </div>

      {filteredInstructores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <i className="fas fa-user-tie" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280' }}>{searchQuery ? 'Dato no encontrado' : 'No hay instructores registrados'}</h3>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Instructor</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Email</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Fichas Asignadas</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructores.map((i) => (
                <tr key={i.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{i.nombre}</td>
                  <td style={{ padding: '12px' }}>{i.email}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <span
                      style={{
                        background: i.fichasAsignadas > 0 ? '#e6f7ed' : '#f3f4f6',
                        color: i.fichasAsignadas > 0 ? '#047857' : '#6b7280',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {i.fichasAsignadas}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <button
                      onClick={() =>
                        navigate(`/coordinador/instructores/${i.id}/asignar`, {
                          state: { instructor: i },
                        })
                      }
                      style={{
                        background: '#e0f2fe',
                        color: '#0ea5e9',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <i className="fas fa-plus-circle" /> Asignar
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

export default InstructoresGlobales;