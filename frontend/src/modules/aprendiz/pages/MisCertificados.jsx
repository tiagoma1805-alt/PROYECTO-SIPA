// src/pages/aprendiz/MisCertificados.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './MisCertificados.css';

const MisCertificados = () => {
  const navigate = useNavigate();

  const [certificado, setCertificado] = useState({
    id: 1,
    titulo: 'Análisis y Desarrollo de Software',
    fecha: '15/06/2025',
    estado: 'Pendiente',
    institucion: 'SENA - Centro de Tecnología y Diseño',
    duracion: '2200 horas',
    archivoCargado: false,
    nombreArchivo: '',
    url: '#'
  });

  // ==========================================================
  // FUNCIÓN PARA CARGAR (SUBIR) CERTIFICADO
  // ==========================================================
  const handleCargarCertificado = () => {
    Swal.fire({
      title: '📤 Cargar Certificado',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 15px 0; padding: 20px; border: 2px dashed #d1d5db; border-radius: 8px; text-align: center;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #3ca203;"></i>
            <p style="margin: 10px 0 0 0; color: #6b7280;">
              Arrastra o haz clic para seleccionar tu certificado
            </p>
            <p style="font-size: 12px; color: #9ca3af;">
              Formatos permitidos: .pdf, .jpg, .png (Máx. 5MB)
            </p>
          </div>
          <div style="margin: 15px 0;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 5px;">
              Selecciona tu archivo *
            </label>
            <input type="file" id="certificado-file" accept=".pdf,.jpg,.jpeg,.png"
              style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
            />
          </div>
          <p style="font-size: 11px; color: #9ca3af; margin: 6px 0 0 0; text-align: left;">
            * Campo obligatorio
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '📤 Subir Certificado',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '480px',
      padding: '1.5rem',
      preConfirm: () => {
        const fileInput = document.getElementById('certificado-file');
        const file = fileInput?.files[0];

        if (!file) {
          Swal.showValidationMessage('⚠️ Por favor selecciona un archivo');
          return false;
        }

        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!tiposPermitidos.includes(file.type)) {
          Swal.showValidationMessage('⚠️ Solo se permiten archivos PDF, JPG o PNG');
          return false;
        }

        if (file.size > 5 * 1024 * 1024) {
          Swal.showValidationMessage('⚠️ El archivo no debe superar los 5MB');
          return false;
        }

        return { file, fileName: file.name };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { file, fileName } = result.value;

        setCertificado({
          ...certificado,
          archivoCargado: true,
          nombreArchivo: fileName,
          estado: 'Cargado'
        });

        Swal.fire({
          title: '✅ ¡Certificado cargado exitosamente!',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Archivo:</strong> ${fileName}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Tamaño:</strong> ${(file.size / 1024).toFixed(2)} KB
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Estado:</strong> ✅ Certificado cargado correctamente
                </p>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                Tu certificado ha sido cargado exitosamente.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: '✅ Aceptar',
          confirmButtonColor: '#3ca203',
          timer: 3000,
          timerProgressBar: true,
          width: '480px'
        });
      }
    });
  };

  // ==========================================================
  // FUNCIÓN PARA DESCARGAR CERTIFICADO
  // ==========================================================
  const handleDescargarCertificado = () => {
    if (!certificado.archivoCargado) {
      Swal.fire({
        title: '⚠️ Sin certificado cargado',
        text: 'Aún no has cargado tu certificado. Por favor, cárgalo primero.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    Swal.fire({
      title: '📄 Confirmar descarga',
      text: `¿Deseas descargar tu certificado "${certificado.nombreArchivo}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3ca203',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '✅ Sí, descargar',
      cancelButtonText: '❌ Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '✅ ¡Descarga iniciada!',
          text: `Tu certificado "${certificado.nombreArchivo}" se está descargando...`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3ca203',
          timer: 2500,
          timerProgressBar: true
        });
        setTimeout(() => {
          console.log('Descargando certificado:', certificado.nombreArchivo);
        }, 1000);
      }
    });
  };

  // ==========================================================
  // FUNCIÓN PARA ELIMINAR CERTIFICADO
  // ==========================================================
  const handleEliminarCertificado = () => {
    if (!certificado.archivoCargado) {
      Swal.fire({
        title: '⚠️ Sin certificado',
        text: 'No tienes ningún certificado cargado para eliminar.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    Swal.fire({
      title: '⚠️ ¿Eliminar certificado?',
      text: '¿Estás seguro de que quieres eliminar tu certificado cargado? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '✅ Sí, eliminar',
      cancelButtonText: '❌ Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setCertificado({
          ...certificado,
          archivoCargado: false,
          nombreArchivo: '',
          estado: 'Pendiente'
        });

        Swal.fire({
          title: '✅ ¡Certificado eliminado!',
          text: 'El certificado ha sido eliminado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3ca203',
          timer: 2000,
          timerProgressBar: true
        });
      }
    });
  };

  return (
    <div className="mis-certificados-container">
      {/* ========================================================== */}
      {/* MIGA DE PAN */}
      {/* ========================================================== */}
      <nav className="breadcrumb">
        <ol>
          <li>
            <button 
              onClick={() => window.location.href = '/aprendiz'}
              className="breadcrumb-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
            >
              <i className="fas fa-home"></i> Mi Proceso
            </button>
            <span className="separator"> &gt; </span>
          </li>
          <li className="active">
            <i className="fas fa-certificate"></i> Mis Certificados
          </li>
        </ol>
      </nav>

      {/* ========================================================== */}
      {/* ENCABEZADO */}
      {/* ========================================================== */}
      <div className="certificados-header">
        <div>
          <h2>Mi Certificado</h2>
          <p className="subtitulo">
            Carga tu certificado de formación para tenerlo disponible cuando lo necesites.
          </p>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TARJETA DEL CERTIFICADO */}
      {/* ========================================================== */}
      <div className="certificado-card">
        <div className="certificado-icono">
          <i className="fas fa-certificate"></i>
        </div>

        <div className="certificado-contenido">
          <h3 className="certificado-titulo">{certificado.titulo}</h3>
          
          <div className="certificado-info">
            <div className="info-item">
              <span className="info-label">
                <i className="fas fa-calendar-alt"></i> Fecha
              </span>
              <span className="info-value">{certificado.fecha}</span>
            </div>
            <div className="info-item">
              <span className="info-label">
                <i className="fas fa-check-circle"></i> Estado
              </span>
              <span className={`info-value estado-${certificado.estado.toLowerCase()}`}>
                <i className={`fas ${certificado.estado === 'Cargado' ? 'fa-check-circle' : certificado.estado === 'Emitido' ? 'fa-check' : 'fa-clock'}`}></i>
                {certificado.estado}
              </span>
            </div>
            {certificado.archivoCargado && (
              <div className="info-item">
                <span className="info-label">
                  <i className="fas fa-file"></i> Archivo
                </span>
                <span className="info-value" style={{ color: '#3ca203' }}>
                  <i className="fas fa-file-pdf"></i> {certificado.nombreArchivo}
                </span>
              </div>
            )}
          </div>

          <div className="certificado-detalles">
            <div className="detalle-item">
              <span className="detalle-label">Institución</span>
              <span className="detalle-valor">{certificado.institucion}</span>
            </div>
            <div className="detalle-item">
              <span className="detalle-label">Duración</span>
              <span className="detalle-valor">{certificado.duracion}</span>
            </div>
          </div>

          <div className="certificado-acciones">
            <button 
              className="btn-cargar"
              onClick={handleCargarCertificado}
            >
              <i className="fas fa-upload"></i> Cargar Certificado
            </button>
            
            {certificado.archivoCargado && (
              <>
                <button 
                  className="btn-descargar"
                  onClick={handleDescargarCertificado}
                >
                  <i className="fas fa-download"></i> Descargar Certificado
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={handleEliminarCertificado}
                >
                  <i className="fas fa-trash-alt"></i> Eliminar
                </button>
              </>
            )}
          </div>

          <div className="certificado-footer">
            <span className="certificado-id">
              <i className="fas fa-hashtag"></i> Certificado SENA-2025-{String(certificado.id).padStart(4, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* INFORMACIÓN ADICIONAL */}
      {/* ========================================================== */}
      <div className="certificado-info-adicional">
        <div className="info-card">
          <i className="fas fa-shield-alt"></i>
          <h4>Certificado Auténtico</h4>
          <p>Este certificado es válido y cuenta con verificación en línea.</p>
        </div>
        <div className="info-card">
          <i className="fas fa-qrcode"></i>
          <h4>Código QR</h4>
          <p>Escanea el código QR para verificar la autenticidad del certificado.</p>
        </div>
        <div className="info-card">
          <i className="fas fa-envelope"></i>
          <h4>Envío por correo</h4>
          <p>Recibe una copia de tu certificado en tu correo electrónico.</p>
        </div>
      </div>
    </div>
  );
};

export default MisCertificados;
