// src/modules/*/pages/MiPerfil.jsx  (idéntico en los 5 roles)
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { userService } from '@/core/services/userService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MiPerfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      const localUser = (() => {
        try {
          const stored = localStorage.getItem('user');
          return stored ? JSON.parse(stored) : null;
        } catch { return null; }
      })();

      let data;
      try {
        data = await userService.getMe();
      } catch {
        data = localUser;
      }

      const combined = { ...localUser, ...data };
      if (!combined) throw new Error('No se pudo obtener el perfil');

      // Generar avatar si no tiene
      if (!combined.avatar_url) {
        const nombreCompleto = `${combined.nombre || ''} ${combined.apellido || ''}`.trim();
        combined.avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=3ca203&color=fff&bold=true&size=256`;
      } else if (!combined.avatar_url.startsWith('http')) {
        combined.avatar_url = `${API_BASE_URL}${combined.avatar_url}`;
      }

      combined.nombre_completo = `${combined.nombre || ''} ${combined.apellido || ''}`.trim() || 'Usuario';
      setPerfil(combined);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🔥 CAMBIAR FOTO DE PERFIL
  // ==========================================================
  const handleCambiarFoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: '❌ Imagen muy grande',
          text: 'La imagen no puede superar los 5 MB',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      try {
        setSubiendo(true);
        Swal.fire({
          title: '📤 Subiendo foto...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const resultado = await userService.uploadAvatar(file);

        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.avatar_url = resultado.avatar_url;
          localStorage.setItem('user', JSON.stringify(userData));
        }

        Swal.fire({
          title: '✅ ¡Foto actualizada!',
          text: 'Tu foto se guardó correctamente.',
          icon: 'success',
          confirmButtonColor: '#3ca203',
          timer: 2000,
        });

        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error('Error al subir:', err);
        Swal.fire({
          title: '❌ Error',
          text: err.message || 'No se pudo subir la foto',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      } finally {
        setSubiendo(false);
      }
    };

    input.click();
  };

  // ==========================================================
  // ✏️ EDITAR DATOS PERSONALES
  // ==========================================================
  const handleEditarPerfil = () => {
    if (!perfil) return;

    Swal.fire({
      title: '✏️ Editar Mi Perfil',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Nombre *</label>
            <input id="edit-nombre" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" value="${perfil.nombre || ''}" />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Apellido *</label>
            <input id="edit-apellido" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" value="${perfil.apellido || ''}" />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Teléfono</label>
            <input id="edit-telefono" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" value="${perfil.telefono || ''}" placeholder="Ej: 3001234567" />
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
          await userService.updateMiPerfil(perfil.id, result.value);

          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            Object.assign(userData, result.value);
            localStorage.setItem('user', JSON.stringify(userData));
          }

          Swal.fire({
            title: '✅ ¡Actualizado!',
            icon: 'success',
            confirmButtonColor: '#3ca203',
            timer: 1500,
          });

          setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
          Swal.fire({
            title: '❌ Error',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#dc2626',
          });
        }
      }
    });
  };

  // ==========================================================
  // 🔒 CAMBIAR CONTRASEÑA
  // ==========================================================
  const handleCambiarPassword = () => {
    Swal.fire({
      title: '🔒 Cambiar Contraseña',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Contraseña actual *</label>
            <input id="pwd-actual" type="password" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="••••••••" />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Nueva contraseña * (mínimo 6 caracteres)</label>
            <input id="pwd-nueva" type="password" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="••••••••" />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Confirmar nueva contraseña *</label>
            <input id="pwd-confirmar" type="password" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="••••••••" />
          </div>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: '🔒 Cambiar',
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
          Swal.showValidationMessage('⚠️ Mínimo 6 caracteres');
          return false;
        }
        if (nueva !== confirmar) {
          Swal.showValidationMessage('⚠️ Las contraseñas no coinciden');
          return false;
        }
        if (actual === nueva) {
          Swal.showValidationMessage('⚠️ Debe ser diferente a la actual');
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
            text: 'Vuelve a iniciar sesión con tu nueva contraseña.',
            icon: 'success',
            confirmButtonColor: '#3ca203',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('/login');
          });
        } catch (err) {
          Swal.fire({
            title: '❌ Error',
            text: err.message || 'No se pudo cambiar. Verifica tu contraseña actual.',
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
        <button onClick={cargarPerfil} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          <i className="fas fa-redo" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>
          <i className="fas fa-user-circle" style={{ color: '#3ca203', marginRight: '10px' }} />
          Mi Perfil
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
          Gestiona tu información personal, tu foto y tu contraseña.
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '30px', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        {/* AVATAR + DATOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={perfil.avatar_url}
              alt="Avatar"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #3ca203',
              }}
            />
            <button
              onClick={handleCambiarFoto}
              disabled={subiendo}
              title="Cambiar foto"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#3ca203',
                color: 'white',
                border: '3px solid white',
                cursor: subiendo ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
              }}
            >
              <i className={`fas ${subiendo ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
            </button>
          </div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
              {perfil.nombre_completo}
            </h3>
            <p style={{ color: '#6b7280', margin: '0 0 5px 0' }}>{perfil.email}</p>
            <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' }}>
              {perfil.rol_nombre || 'Usuario'}
            </span>
          </div>
        </div>

        {/* DATOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Nombre</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{perfil.nombre || 'No registrado'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Apellido</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{perfil.apellido || 'No registrado'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Correo</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{perfil.email || 'No registrado'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Teléfono</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{perfil.telefono || 'No registrado'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Documento</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{perfil.documento_identidad || 'No registrado'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Tipo de documento</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{perfil.tipo_documento || 'No registrado'}</p>
          </div>
        </div>

        {/* BOTONES */}
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
            <i className="fas fa-pen" /> Editar mis datos
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
            <i className="fas fa-lock" /> Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;