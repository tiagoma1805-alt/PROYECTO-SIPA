// src/core/utils/sweetAlert.js
import Swal from 'sweetalert2';

// Configuración base con diseño moderno centrado
const baseConfig = {
  confirmButtonColor: '#3ca203',
  cancelButtonColor: '#6b7280',
  background: '#ffffff',
  color: '#1f2937',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  buttonsStyling: true,
  showClass: {
    popup: 'animate__animated animate__fadeIn animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOut animate__faster'
  },
  position: 'center',
  allowOutsideClick: false,
  allowEscapeKey: true,
};

// ✅ ÉXITO
export const showSuccess = (message, title = '¡Éxito!') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'success',
    title: title,
    text: message,
    iconColor: '#3ca203',
    confirmButtonColor: '#3ca203',
    confirmButtonText: '¡Entendido!',
    timer: 3000,
    timerProgressBar: true,
    position: 'center',
  });
};

// ❌ ERROR
export const showError = (message, title = '¡Error!') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'error',
    title: title,
    text: message,
    iconColor: '#dc2626',
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Entendido',
    position: 'center',
  });
};

// ⚠️ ADVERTENCIA
export const showWarning = (message, title = '¡Atención!') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title: title,
    text: message,
    iconColor: '#f59e0b',
    confirmButtonColor: '#f59e0b',
    confirmButtonText: 'Entendido',
    position: 'center',
  });
};

// ℹ️ INFORMACIÓN
export const showInfo = (message, title = 'Información') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'info',
    title: title,
    text: message,
    iconColor: '#0ea5e9',
    confirmButtonColor: '#0ea5e9',
    confirmButtonText: 'Entendido',
    position: 'center',
  });
};

// ❓ CONFIRMACIÓN (Sí/No)
export const showConfirm = (message, title = '¿Estás seguro?', confirmText = 'Sí, confirmar') => {
  return Swal.fire({
    ...baseConfig,
    title: title,
    text: message,
    icon: 'question',
    iconColor: '#3ca203',
    showCancelButton: true,
    confirmButtonColor: '#3ca203',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    position: 'center',
    reverseButtons: false,
  });
};

// 📋 CONFIRMACIÓN CON ESTILO DE ELIMINACIÓN
export const showDeleteConfirm = (message, itemName = 'este registro') => {
  return Swal.fire({
    ...baseConfig,
    title: '¿Estás seguro?',
    html: `
      <div style="text-align: center;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">
          ${message}
        </p>
        <p style="font-size: 14px; color: #6b7280;">
          Se eliminará de forma permanente el registro: <strong>${itemName}</strong>
        </p>
      </div>
    `,
    icon: 'warning',
    iconColor: '#dc2626',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, bórralo',
    cancelButtonText: 'Cancelar',
    position: 'center',
    reverseButtons: false,
  });
};

// 🎯 ASIGNACIÓN EXITOSA (para empresa/alternativa)
export const showAsignacionExitosa = (item, nombre, tipo = 'empresa') => {
  return Swal.fire({
    ...baseConfig,
    title: '✅ Asignación exitosa',
    html: `
      <div style="text-align: left; padding: 5px 0;">
        <p style="margin: 8px 0; font-size: 16px; color: #1f2937; display: flex; gap: 8px;">
          <span style="font-weight: 600; min-width: 85px;">${tipo === 'empresa' ? 'Empresa:' : 'Alternativa:'}</span>
          <span>${item}</span>
        </p>
        <p style="margin: 8px 0; font-size: 16px; color: #1f2937; display: flex; gap: 8px;">
          <span style="font-weight: 600; min-width: 85px;">Aprendiz:</span>
          <span>${nombre}</span>
        </p>
        <hr style="border: 1px solid #e5e7eb; margin: 15px 0;" />
        <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
          La ${tipo} ha sido asignada exitosamente.
        </p>
      </div>
    `,
    icon: 'success',
    iconColor: '#3ca203',
    confirmButtonColor: '#3ca203',
    confirmButtonText: '¡Entendido!',
    position: 'center',
    width: '480px',
    padding: '25px 30px',
    timer: 4000,
    timerProgressBar: true,
  });
};

// 🍞 TOAST (notificación flotante)
export const showToast = (message, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon: icon,
    title: message,
    iconColor: icon === 'success' ? '#3ca203' : '#dc2626',
    position: 'top-end',
  });
};
