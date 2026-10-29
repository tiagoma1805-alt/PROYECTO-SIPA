// src/pages/coordinador/VerCertificados.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb'; // <--- CORREGIDO
import Swal from 'sweetalert2';
import { showSuccess, showError, showWarning, showConfirm } from '@/core/utils/sweetAlert'; // <--- CORREGIDO

const VerCertificados = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [certificados, setCertificados] = useState([
    { id: 1, aprendiz: 'Laura Sofia Martinez', ficha: '2875901', estado: 'Listo', fecha: '15/12/2025' },
    { id: 2, aprendiz: 'Juan Diego Ramirez', ficha: '2875901', estado: 'Pendiente', fecha: '-' },
    { id: 3, aprendiz: 'Maria Camila Torres', ficha: '2875902', estado: 'Listo', fecha: '10/01/2026' },
  ]);

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const filteredCertificados = certificados.filter(c =>
    c.aprendiz.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ficha.includes(searchQuery)
  );

  const handleDescargarCertificado = async (certificado) => {
    // Mostrar confirmación antes de descargar
    const result = await Swal.fire({
      title: '📄 Confirmar descarga',
      text: `¿Deseas descargar el certificado de ${certificado.aprendiz}?`,
      icon: 'question',
      iconColor: '#3ca203',
      showCancelButton: true,
      confirmButtonColor: '#3ca203',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, descargar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: true,
      width: '450px',
      padding: '25px 30px',
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'swal2-popup-sandbox',
        title: 'swal2-title-sandbox',
        confirmButton: 'swal2-confirm-sandbox',
        cancelButton: 'swal2-cancel-sandbox',
      }
    });

    if (result.isConfirmed) {
      // Mostrar alerta de éxito simple
      await Swal.fire({
        title: '✅ Descarga completada',
        text: `El certificado de ${certificado.aprendiz} se ha descargado exitosamente.`,
        icon: 'success',
        iconColor: '#3ca203',
        confirmButtonColor: '#3ca203',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: true,
        width: '450px',
        padding: '25px 30px',
        background: '#ffffff',
        color: '#1f2937',
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-popup-sandbox',
          title: 'swal2-title-sandbox',
          confirmButton: 'swal2-confirm-sandbox',
        }
      });
    }
  };

  const handleDescargarTodos = async () => {
    const certificadosListos = certificados.filter(c => c.estado === 'Listo');
    
    if (certificadosListos.length === 0) {
      await showWarning('No hay certificados listos para descargar.', '⚠️ Sin certificados');
      return;
    }

    const result = await Swal.fire({
      title: '📦 Descarga masiva',
      text: `¿Deseas descargar ${certificadosListos.length} certificados?`,
      icon: 'question',
      iconColor: '#3ca203',
      showCancelButton: true,
      confirmButtonColor: '#3ca203',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, descargar todos',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: true,
      width: '450px',
      padding: '25px 30px',
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'swal2-popup-sandbox',
        title: 'swal2-title-sandbox',
        confirmButton: 'swal2-confirm-sandbox',
        cancelButton: 'swal2-cancel-sandbox',
      }
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: '✅ Descarga masiva completada',
        text: `${certificadosListos.length} certificados se han descargado exitosamente.`,
        icon: 'success',
        iconColor: '#3ca203',
        confirmButtonColor: '#3ca203',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: true,
        width: '450px',
        padding: '25px 30px',
        background: '#ffffff',
        color: '#1f2937',
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-popup-sandbox',
          title: 'swal2-title-sandbox',
          confirmButton: 'swal2-confirm-sandbox',
        }
      });
    }
  };

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Certificados</h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Gestión de certificados de los aprendices.</p>
        </div>
        <button
          onClick={handleDescargarTodos}
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
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2d8a00'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#3ca203'}
        >
          <i className="fas fa-download" /> Descargar todos
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por aprendiz o ficha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <button onClick={handleSearch} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Buscar</button>
        <button onClick={handleClear} style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Limpiar</button>
      </div>

      {filteredCertificados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: '#dc2626' }}>Dato no encontrado</h3>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Aprendiz</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Ficha</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Fecha</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificados.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.aprendiz}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{c.ficha}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <span style={{
                      background: c.estado === 'Listo' ? '#d1fae5' : '#fef3c7',
                      color: c.estado === 'Listo' ? '#047857' : '#d97706',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {c.estado}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{c.fecha}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <button
                      onClick={() => handleDescargarCertificado(c)}
                      disabled={c.estado === 'Pendiente'}
                      style={{
                        background: c.estado === 'Listo' ? '#e6f7ed' : '#f3f4f6',
                        color: c.estado === 'Listo' ? '#047857' : '#9ca3af',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        cursor: c.estado === 'Listo' ? 'pointer' : 'default',
                        opacity: c.estado === 'Listo' ? 1 : 0.6
                      }}
                    >
                      <i className="fas fa-download" /> 
                      {c.estado === 'Listo' ? 'Descargar' : 'Pendiente'}
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

export default VerCertificados;
