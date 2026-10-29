// src/components/ReportesAsistencia.jsx
import React, { useState } from 'react';
import './ReportesAsistencia.css';

const ReportesAsistencia = () => {
  // Lista de archivos ya subidos
  const [archivos, setArchivos] = useState([
    {
      id: 1,
      nombre: 'Asistencia_Charla_Seguridad.pdf',
      tipo: 'pdf',
      fecha: '12/06/2025',
      tamaño: '1.2 MB'
    },
    {
      id: 2,
      nombre: 'Foto_Reunion_Momento_2.jpg',
      tipo: 'imagen',
      fecha: '10/06/2025',
      tamaño: '3.4 MB',
      preview: 'https://via.placeholder.com/100x80?text=Asistencia'
    },
    {
      id: 3,
      nombre: 'Asistencia_Bitacora_Semana_3.pdf',
      tipo: 'pdf',
      fecha: '05/06/2025',
      tamaño: '0.8 MB'
    },
    {
      id: 4,
      nombre: 'Lista_Asistencia_Reunion_Junio.jpg',
      tipo: 'imagen',
      fecha: '01/06/2025',
      tamaño: '2.1 MB',
      preview: 'https://via.placeholder.com/100x80?text=Asistencia'
    },
  ]);

  // Función para simular la subida de archivos
  const handleUpload = () => {
    // Simula un input file oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.webp'; // Soporte PDF e Imágenes
    input.multiple = true; // Permite subir varios archivos a la vez
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        // Simulamos la subida de cada archivo
        files.forEach((file, index) => {
          const extension = file.name.split('.').pop().toLowerCase();
          const tipo = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? 'imagen' : 'pdf';
          
          const nuevoArchivo = {
            id: archivos.length + index + 1,
            nombre: file.name,
            tipo: tipo,
            fecha: new Date().toLocaleDateString('es-CO'),
            tamaño: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            preview: tipo === 'imagen' ? URL.createObjectURL(file) : null
          };
          
          // Agregamos a la lista
          setArchivos(prev => [nuevoArchivo, ...prev]);
        });
        alert(`✅ ${files.length} archivo(s) de asistencia subidos correctamente.`);
      }
    };
    input.click();
  };

  // Función para eliminar un archivo
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este archivo?')) {
      setArchivos(archivos.filter(a => a.id !== id));
    }
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h2>Reportes de Asistencia</h2>
        <p className="subtitulo">
          Sube listados de asistencia en PDF o imágenes (JPG, PNG, WebP).
        </p>
      </div>

      {/* Tarjeta de subida */}
      <div className="upload-wrapper">
        <div className="upload-card-large">
          <div className="upload-icon-large">
            <i className="fas fa-cloud-upload-alt"></i>
          </div>
          <h3>Subir nueva asistencia</h3>
          <p>Formatos permitidos: PDF, JPG, JPEG, PNG, WebP. Puedes subir múltiples archivos.</p>
          <button className="btn-upload-large" onClick={handleUpload}>
            <i className="fas fa-upload"></i> Seleccionar archivos
          </button>
        </div>
      </div>

      {/* Galería/Lista de archivos subidos */}
      <div className="files-section">
        <div className="files-header">
          <h3>Lista de archivos subidos ({archivos.length})</h3>
        </div>
        
        <div className="files-grid">
          {archivos.map((archivo) => (
            <div key={archivo.id} className="file-card">
              
              {/* Vista previa (si es imagen) o icono (si es PDF) */}
              <div className="file-preview">
                {archivo.tipo === 'imagen' ? (
                  <img src={archivo.preview || 'https://via.placeholder.com/150'} alt={archivo.nombre} />
                ) : (
                  <div className="file-icon-pdf">
                    <i className="fas fa-file-pdf"></i>
                    <span className="file-ext-pdf">PDF</span>
                  </div>
                )}
              </div>

              {/* Información del archivo */}
              <div className="file-info">
                <div className="file-name">{archivo.nombre}</div>
                <div className="file-meta">
                  <span><i className="fas fa-calendar-alt"></i> {archivo.fecha}</span>
                  <span><i className="fas fa-weight"></i> {archivo.tamaño}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="file-actions">
                <button className="btn-view-file" title="Ver archivo">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="btn-delete-file" title="Eliminar archivo" onClick={() => handleDelete(archivo.id)}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportesAsistencia;
