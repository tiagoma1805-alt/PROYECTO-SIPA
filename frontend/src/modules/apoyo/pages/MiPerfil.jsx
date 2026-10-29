// src/modules/admin/pages/MiPerfil.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { userService } from '@/core/services/userService';

const MiPerfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar primero con getMe
      let data;
      try {
        data = await userService.getMe();
      } catch (err) {
        // Si falla, usar el localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          data = JSON.parse(userStr);
        } else {
          throw err;
        }
      }
      
      console.log('👤 Perfil cargado:', data);
      setPerfil(data);
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      setError(err.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // EDITAR DATOS PERSONALES
  // ==========================================================
  const handleEditarPerfil = () => {
    if (!perfil) return;

    Swal.fire({
      title: '✏️ Editar Mi Perfil',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Nombre *
            </label>
            <input id="edit-nombre" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              value="${perfil.nombre || ''}"
            />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Apellido *
            </label>
            <input id="edit-apellido" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              value="${perfil.apellido || ''}"
            />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Correo electrónico
            </label>
            <input id="edit-email" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; background: #f3f4f6;"
              value="${perfil.email || ''}"
              disabled
            />
            <small style="color: #9ca3af; font-size: 11px;">El correo no se puede modificar</small>
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Teléfono
            </label>
            <input id="edit-telefono" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              value="${perfil.telefono || ''}"
              placeholder="Ej: 3001234567"
            />
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '💾 Guardar Cambios',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '520px',
      preConfirm: () => {
        const nombre = document.getElementById('edit-nombre').value.trim();
        const apellido = document.getElementById('edit-apellido').value.trim();
        const telefono = document.getElementById('edit-telefono').value.trim();

        if (!nombre || !apellido) {
          Swal.showValidationMessage('⚠️ Nombre y apellido son obligatorios');
          return false;
        }

        return { nombre, apellido, telefono };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          // Actualizar en el backend
          const actualizado = await userService.updateMiPerfil(perfil.id, result.value);
          console.log('✅ Perfil actualizado:', actualizado);
          
          // Actualizar localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            const updated = { ...userData, ...result.value };
            localStorage.setItem('user', JSON.stringify(updated));
          }

          // Actualizar estado
          setPerfil({ ...perfil, ...result.value });

          Swal.fire({
            title: '✅ ¡Perfil actualizado!',
            text: 'Tus datos se guardaron correctamente.',
            icon: 'success',
            confirmButtonColor: '#3ca203',
            timer: 2000,
          });

          // Recargar la página para actualizar el header
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          console.error('Error al actualizar:', err);
          Swal.fire({
            title: '❌ Error',
            text: err.message || 'No se pudo actualizar el perfil',
            icon: 'error',
            confirmButtonColor: '#dc2626',
          });
        }
      }
    });
  };

  // ==========================================================
  // CAMBIAR CONTRASEÑA
  // ==========================================================
  const handleCambiarPassword = () => {
    Swal.fire({
      title: '🔒 Cambiar Contraseña',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Contraseña actual *
            </label>
            <input id="pwd-actual" type="password"
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              placeholder="••••••••"
            />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Nueva contraseña * (mínimo 6 caracteres)
            </label>
            <input id="pwd-nueva" type="password"
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              placeholder="••••••••"
            />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Confirmar nueva contraseña *
            </label>
            <input id="pwd-confirmar" type="password"
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              placeholder="••••••••"
            />
          </div>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: '🔒 Cambiar Contraseña',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '520px',
      preConfirm: () => {
        const actual = document.getElementById('pwd-actual').value;
        const nueva = document.getElementById('pwd-nueva').value;
        const confirmar = document.getElementById('pwd-confirmar').value;

        if (!actual || !nueva || !confirmar) {
          Swal.showValidationMessage('⚠️ Todos los campos son obligatorios');
          return false;
        }
        if (nueva.length < 6) {
          Swal.showValidationMessage('⚠️ La nueva contraseña debe tener al menos 6 caracteres');
          return false;
        }
        if (nueva !== confirmar) {
          Swal.showValidationMessage('⚠️ Las contraseñas no coinciden');
          return false;
        }
        if (actual === nueva) {
          Swal.showValidationMessage('⚠️ La nueva contraseña debe ser diferente a la actual');
          return false;
        }

        return { password_actual: actual, password_nueva: nueva };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await userService.changePassword(result.value);
          Swal.fire({
            title: '✅ ¡Contraseña cambiada!',
            text: 'Tu contraseña se actualizó correctamente. Vuelve a iniciar sesión.',
            icon: 'success',
            confirmButtonColor: '#3ca203',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('/login');
          });
        } catch (err) {
          console.error('Error al cambiar contraseña:', err);
          Swal.fire({
            title: '❌ Error',
            text: err.message || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.',
            icon: 'error',
            confirmButtonColor: '#dc2626',
          });
        }
      }
    });
  };

  // ==========================================================
  // LOADING & ERROR
  // ==========================================================
  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando perfil...</p>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error al cargar perfil</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={cargarPerfil}
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
      {/* ENCABEZADO */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>
          <i className="fas fa-user-circle" style={{ color: '#3ca203', marginRight: '10px' }} />
          Mi Perfil
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
          Gestiona tu información personal y tu contraseña.
        </p>
      </div>

      {/* CARD DE PERFIL */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}
      >
        {/* Avatar y datos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <img
            src={perfil.avatar || 'https://i.pravatar.cc/150?img=12'}
            alt="Avatar"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #3ca203',
            }}
          />
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
              {perfil.nombre} {perfil.apellido}
            </h3>
            <p style={{ color: '#6b7280', margin: '0 0 5px 0' }}>
              {perfil.email}
            </p>
            <span
              style={{
                background: '#d1fae5',
                color: '#047857',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              {perfil.rol_nombre || perfil.role || 'Usuario'}
            </span>
          </div>
        </div>

        {/* Datos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Nombre
            </p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
              {perfil.nombre || 'No registrado'}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Apellido
            </p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
              {perfil.apellido || 'No registrado'}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Correo
            </p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
              {perfil.email || 'No registrado'}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Teléfono
            </p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
              {perfil.telefono || 'No registrado'}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Documento
            </p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
              {perfil.documento_identidad || 'No registrado'}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Tipo de documento
            </p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
              {perfil.tipo_documento || 'No registrado'}
            </p>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleEditarPerfil}
            style={{
              background: '#3ca203',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-pen" />
            Editar mis datos
          </button>
          <button
            onClick={handleCambiarPassword}
            style={{
              background: 'white',
              color: '#3ca203',
              border: '2px solid #3ca203',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-lock" />
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;