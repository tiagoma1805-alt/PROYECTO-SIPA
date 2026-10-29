// src/components/ReportesSeguimiento.jsx
import React, { useState } from 'react';
import './ReportesSeguimiento.css';

const ReportesSeguimiento = () => {
  // Lista de reportes ya subidos
  const [reportes, setReportes] = useState([
    { id: 1, tipo: 'Charlas', nombre: 'Reporte_Charlas_Junio.pdf', fecha: '12/06/2025', estado: 'Aprobado' },
    { id: 2, tipo: 'Momentos', nombre: 'Reporte_Momento_2.pdf', fecha: '10/06/2025', estado: 'Pendiente' },
    { id: 3, tipo: 'Bitácoras', nombre: 'Bitacoras_Semana_3.pdf', fecha: '05/06/2025', estado: 'Aprobado' },
  ]);

  // Función para simular la subida de un reporte
  const handleUpload = (tipo) => {
    // Simula un input file oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.xlsx';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`✅ Reporte de ${tipo} "${file.name}" subido correctamente.`);
        // Agregamos el reporte a la lista simulada
        const nuevoReporte = {
          id: reportes.length + 1,
          tipo: tipo,
          nombre: file.name,
          fecha: new Date().toLocaleDateString('es-CO'),
          estado: 'Pendiente'
        };
        setReportes([nuevoReporte, ...reportes]);
      }
    };
    input.click();
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h2>Reportes de Seguimiento</h2>
        <p className="subtitulo">Sube y administra los reportes de Charlas, Momentos y Bitácoras.</p>
      </div>

      {/* Tarjetas de subida de reportes */}
      <div className="upload-grid">
        <div className="upload-card">
          <div className="upload-icon">
            <i className="fas fa-comments"></i>
          </div>
          <h3>Reportes de Charlas</h3>
          <p>Sube reportes detallados de las charlas programadas e historial.</p>
          <button className="btn-upload" onClick={() => handleUpload('Charlas')}>
            <i className="fas fa-cloud-upload-alt"></i> Subir reporte
          </button>
        </div>

        <div className="upload-card">
          <div className="upload-icon">
            <i className="fas fa-clock"></i>
          </div>
          <h3>Reportes de Momentos</h3>
          <p>Sube reportes de avance y seguimiento por momentos (1, 2, 3).</p>
          <button className="btn-upload" onClick={() => handleUpload('Momentos')}>
            <i className="fas fa-cloud-upload-alt"></i> Subir reporte
          </button>
        </div>

        <div className="upload-card">
          <div className="upload-icon">
            <i className="fas fa-book"></i>
          </div>
          <h3>Reportes de Bitácoras</h3>
          <p>Sube reportes consolidados del seguimiento de bitácoras por aprendiz.</p>
          <button className="btn-upload" onClick={() => handleUpload('Bitácoras')}>
            <i className="fas fa-cloud-upload-alt"></i> Subir reporte
          </button>
        </div>
      </div>

      {/* Lista de reportes ya subidos */}
      <div className="reports-list-section">
        <div className="reports-list-header">
          <h3>Historial de reportes subidos</h3>
        </div>
        <div className="reports-list">
          {reportes.map((reporte) => (
            <div key={reporte.id} className="report-item">
              <div className="report-info">
                <div className="report-icon">
                  <i className={`fas ${reporte.tipo === 'Charlas' ? 'fa-comments' : reporte.tipo === 'Momentos' ? 'fa-clock' : 'fa-book'}`}></i>
                </div>
                <div>
                  <div className="report-name">{reporte.nombre}</div>
                  <div className="report-meta">{reporte.tipo} • {reporte.fecha}</div>
                </div>
              </div>
              <div className="report-status">
                <span className={`status-pill ${reporte.estado === 'Aprobado' ? 'status-aprobado' : 'status-pendiente'}`}>
                  {reporte.estado}
                </span>
                <button className="btn-view-report">
                  <i className="fas fa-eye"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportesSeguimiento;
