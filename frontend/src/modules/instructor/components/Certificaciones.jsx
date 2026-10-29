// src/components/Certificaciones.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Certificaciones.css';

const Certificaciones = () => {
  const navigate = useNavigate();
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [fichas] = useState([
    {
      idFicha: '2875901',
      programa: 'Análisis y Desarrollo de Software',
      aprendices: [
        { nombre: 'Laura Sofia Martinez', completado: true },
        { nombre: 'Juan Diego Ramirez', completado: true },
        { nombre: 'Maria Camila Torres', completado: false },
      ]
    },
    {
      idFicha: '2875902',
      programa: 'Gestión Empresarial',
      aprendices: [
        { nombre: 'Carlos Mendoza', completado: true },
        { nombre: 'Valentina Rojas', completado: true },
        { nombre: 'Andrés Felipe Castro', completado: true },
      ]
    },
    {
      idFicha: '2875903',
      programa: 'Contabilidad y Finanzas',
      aprendices: [
        { nombre: 'Luisa Fernanda Gomez', completado: false },
        { nombre: 'Santiago Pérez', completado: false },
      ]
    }
  ]);

  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
    setFichaSeleccionada(null);
  };

  const handleIngresarFicha = (idFicha) => {
    const ficha = fichas.find(f => f.idFicha === idFicha);
    setFichaSeleccionada(ficha);
  };

  const handleVolverFichas = () => {
    setFichaSeleccionada(null);
  };

  const handleDescargarIndividual = (nombre, fichaId) => {
    Swal.fire({
      title: '📥 Descargando certificado',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <p style="margin: 8px 0; font-size: 15px;">
            <strong>Aprendiz:</strong> ${nombre}
          </p>
          <p style="margin: 8px 0; font-size: 15px;">
            <strong>Ficha:</strong> ${fichaId}
          </p>
          <p style="margin: 8px 0; font-size: 14px; color: #6b7280;">
            <i class="fas fa-spinner fa-pulse" style="color: #3ca203;"></i>
            Procesando descarga del certificado...
          </p>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #9ca3af; font-style: italic; border-top: 1px dashed #e5e7eb; padding-top: 10px;">
            En un sistema real, aquí se descargaría el PDF
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '✅ Aceptar',
      confirmButtonColor: '#3ca203',
      allowOutsideClick: false,
      timer: 2500,
      timerProgressBar: true,
      willClose: () => {
        // Simulación de descarga después del timer
        setTimeout(() => {
          Swal.fire({
            title: '✅ ¡Descarga completada!',
            html: `
              <div style="text-align: left; padding: 10px 0;">
                <p style="margin: 8px 0; font-size: 15px;">
                  <strong>Certificado de:</strong> ${nombre}
                </p>
                <p style="margin: 8px 0; font-size: 14px; color: #6b7280;">
                  El certificado se ha descargado correctamente.
                </p>
              </div>
            `,
            icon: 'success',
            confirmButtonText: '✅ Aceptar',
            confirmButtonColor: '#3ca203',
            timer: 3000,
            timerProgressBar: true
          });
        }, 3000);
      }
    });
  };

  // Navegar al inicio (Dashboard)
  const goToInicio = () => {
    navigate('/instructor');
    window.location.reload();
  };

  // --- PANTALLA DE DETALLE DE FICHA ---
  if (fichaSeleccionada) {
    return (
      <div className="certificaciones-ficha-pantalla">
        {/* MIGA DE PAN - Inicio > Certificaciones > Ficha */}
        <nav style={{ 
          padding: '10px 0', 
          marginBottom: '10px', 
          fontSize: '14px',
          background: 'transparent',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <ol style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            listStyle: 'none', 
            margin: 0, 
            padding: 0, 
            gap: '4px' 
          }}>
            <li style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px' }}>
              <span 
                onClick={goToInicio}
                style={{ color: '#3ca203', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}
              >
                Inicio
              </span>
              <span style={{ margin: '0 4px', color: '#9ca3af' }}> &gt; </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px' }}>
              <span 
                onClick={handleVolverFichas}
                style={{ color: '#3ca203', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}
              >
                Certificaciones
              </span>
              <span style={{ margin: '0 4px', color: '#9ca3af' }}> &gt; </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>
              Ficha {fichaSeleccionada.idFicha}
            </li>
          </ol>
        </nav>

        <div className="ficha-header">
          <button className="btn-volver-lista" onClick={handleVolverFichas}>
            <i className="fas fa-arrow-left"></i> Volver a fichas
          </button>
          <h2 className="ficha-titulo">Ficha {fichaSeleccionada.idFicha}</h2>
          <p className="ficha-subtitulo">{fichaSeleccionada.programa}</p>
        </div>

        <div className="certificaciones-table-wrapper">
          <table className="certificaciones-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Aprendiz</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {fichaSeleccionada.aprendices.map((aprendiz, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="nombre-aprendiz">{aprendiz.nombre}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`estado-cert ${aprendiz.completado ? 'completado' : 'pendiente'}`}>
                      {aprendiz.completado ? '✅ Listo' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className={`btn-descargar-individual ${aprendiz.completado ? 'active' : 'disabled'}`}
                      onClick={() => aprendiz.completado && handleDescargarIndividual(aprendiz.nombre, fichaSeleccionada.idFicha)}
                      disabled={!aprendiz.completado}
                    >
                      <i className="fas fa-download"></i> Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE LISTA DE FICHAS ---
  const filteredFichas = fichas.filter((ficha) =>
    ficha.idFicha.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="certificaciones-container">
      {/* MIGA DE PAN - Inicio > Certificaciones */}
      <nav style={{ 
        padding: '10px 0', 
        marginBottom: '15px', 
        fontSize: '14px',
        background: 'transparent',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <ol style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          listStyle: 'none', 
          margin: 0, 
          padding: 0, 
          gap: '4px' 
        }}>
          <li style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px' }}>
            <span 
              onClick={goToInicio}
              style={{ color: '#3ca203', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}
            >
              Inicio
            </span>
            <span style={{ margin: '0 4px', color: '#9ca3af' }}> &gt; </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>
            Certificaciones
          </li>
        </ol>
      </nav>

      <div className="certificaciones-header">
        <h2>Certificaciones</h2>
        <p className="subtitulo">Selecciona una ficha para gestionar los certificados de tus aprendices.</p>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Buscar por número de ficha..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-search" onClick={handleSearch}>Buscar</button>
        <button className="btn-clear" onClick={handleClear}>Limpiar</button>
      </div>

      {filteredFichas.length === 0 ? (
        <div className="not-found">
          <h2><i className="fas fa-exclamation-circle"></i> Dato no encontrado</h2>
          <p>No existe ninguna ficha con el número ingresado.</p>
        </div>
      ) : (
        <div className="fichas-grid">
          {filteredFichas.map((ficha) => (
            <div 
              key={ficha.idFicha} 
              className="ficha-card-certificacion"
              onClick={() => handleIngresarFicha(ficha.idFicha)}
            >
              <div className="ficha-card-header">
                <span className="ficha-numero">{ficha.idFicha}</span>
                <span className="ficha-cantidad">{ficha.aprendices.length} aprendices</span>
              </div>
              <div className="ficha-card-body">
                <span className="ficha-programa">{ficha.programa}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificaciones;
