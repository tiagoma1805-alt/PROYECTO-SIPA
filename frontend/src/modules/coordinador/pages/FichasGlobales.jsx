// src/pages/coordinador/FichasGlobales.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './FichasGlobales.css';

const FichasGlobales = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [fichas, setFichas] = useState([
    {
      id: '2875901',
      programa: 'Análisis y Desarrollo de Software',
      nivel: 'Tecnólogo',
      aprendices: 28,
      estado: 'Activa',
      jornada: 'Mañana'
    },
    {
      id: '2875902',
      programa: 'Gestión Empresarial',
      nivel: 'Tecnólogo',
      aprendices: 24,
      estado: 'Activa',
      jornada: 'Tarde'
    },
    {
      id: '2875903',
      programa: 'Contabilidad y Finanzas',
      nivel: 'Técnico',
      aprendices: 32,
      estado: 'Inactiva',
      jornada: 'Noche'
    }
  ]);

  const goToInicio = () => {
    navigate('/coordinador');
    window.location.reload();
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const filteredFichas = fichas.filter(f =>
    f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.programa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================================
  // FUNCIÓN PARA CREAR NUEVA FICHA CON SWEETALERT
  // ==========================================================
  const handleNuevaFicha = () => {
    Swal.fire({
      title: '📚 Crear Nueva Ficha',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 10px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; text-align: left;">
              Código de Ficha *
            </label>
            <input id="codigo-ficha" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              placeholder="Ej: 2875904"
            />
          </div>
          <div style="margin: 10px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; text-align: left;">
              Nombre del Programa *
            </label>
            <input id="programa-ficha" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              placeholder="Ej: Marketing Digital"
            />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; text-align: left;">
                Nivel *
              </label>
              <select id="nivel-ficha" 
                style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              >
                <option value="Tecnólogo">Tecnólogo</option>
                <option value="Técnico">Técnico</option>
                <option value="Profesional">Profesional</option>
                <option value="Especialización">Especialización</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; text-align: left;">
                Jornada *
              </label>
              <select id="jornada-ficha" 
                style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              >
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
                <option value="Fin de Semana">Fin de Semana</option>
              </select>
            </div>
          </div>
          <div style="margin: 10px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; text-align: left;">
              Cantidad de Aprendices *
            </label>
            <input id="aprendices-ficha" type="number" min="1"
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              placeholder="Ej: 28"
            />
          </div>
          <p style="font-size: 11px; color: #9ca3af; margin: 6px 0 0 0; text-align: left;">
            * Campos obligatorios
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '✅ Crear Ficha',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '520px',
      padding: '1.5rem',
      preConfirm: () => {
        const codigo = document.getElementById('codigo-ficha')?.value;
        const programa = document.getElementById('programa-ficha')?.value;
        const nivel = document.getElementById('nivel-ficha')?.value;
        const jornada = document.getElementById('jornada-ficha')?.value;
        const aprendices = document.getElementById('aprendices-ficha')?.value;

        if (!codigo?.trim()) {
          Swal.showValidationMessage('⚠️ Por favor ingresa el código de la ficha');
          return false;
        }
        if (!programa?.trim()) {
          Swal.showValidationMessage('⚠️ Por favor ingresa el nombre del programa');
          return false;
        }
        if (!aprendices || parseInt(aprendices) <= 0) {
          Swal.showValidationMessage('⚠️ Por favor ingresa la cantidad de aprendices');
          return false;
        }

        const existe = fichas.some(f => f.id === codigo.trim());
        if (existe) {
          Swal.showValidationMessage(`⚠️ La ficha ${codigo.trim()} ya existe`);
          return false;
        }

        return { 
          codigo: codigo.trim(), 
          programa: programa.trim(), 
          nivel, 
          jornada, 
          aprendices: parseInt(aprendices) 
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { codigo, programa, nivel, jornada, aprendices } = result.value;

        const nuevaFicha = {
          id: codigo,
          programa: programa,
          nivel: nivel,
          aprendices: aprendices,
          estado: 'Activa',
          jornada: jornada
        };

        setFichas([...fichas, nuevaFicha]);

        Swal.fire({
          title: '✅ ¡Ficha creada exitosamente!',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Código:</strong> ${codigo}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Programa:</strong> ${programa}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Nivel:</strong> ${nivel}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Jornada:</strong> ${jornada}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Aprendices:</strong> ${aprendices}
                </p>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                La ficha ha sido creada exitosamente.
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

  return (
    <div className="fichas-globales-container">
      <nav className="breadcrumb">
        <ol>
          <li>
            <span onClick={goToInicio}>Inicio</span>
            <span className="separator"> &gt; </span>
          </li>
          <li className="active">Mis Fichas</li>
        </ol>
      </nav>

      <div className="fichas-header">
        <div>
          <h2>Centro de Fichas</h2>
          <p className="subtitulo">Gestión de todas las fichas del sistema.</p>
        </div>
        <button 
          className="btn-nueva-ficha" 
          onClick={handleNuevaFicha}
          style={{
            background: '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2d8a00'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#3ca203'}
        >
          <i className="fas fa-plus"></i> Nueva Ficha
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por código o programa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-search" onClick={handleSearch}>
          <i className="fas fa-search"></i> Buscar
        </button>
        <button className="btn-clear" onClick={handleClear}>
          <i className="fas fa-times"></i> Limpiar
        </button>
      </div>

      <div className="table-wrapper">
        <table className="fichas-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Programa</th>
              <th>Nivel</th>
              <th>Jornada</th>
              <th style={{ textAlign: 'center' }}>Aprendices</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredFichas.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-exclamation-circle" style={{ color: '#dc2626', fontSize: '24px' }}></i>
                  <h3 style={{ color: '#dc2626', margin: '10px 0 5px 0' }}>Dato no encontrado</h3>
                  <p style={{ color: '#6b7280' }}>No existe ninguna ficha con el criterio de búsqueda seleccionado.</p>
                </td>
              </tr>
            ) : (
              filteredFichas.map((ficha) => (
                <tr key={ficha.id}>
                  <td className="ficha-codigo">{ficha.id}</td>
                  <td>{ficha.programa}</td>
                  <td>
                    <span className={`nivel-badge ${ficha.nivel.toLowerCase()}`}>
                      {ficha.nivel}
                    </span>
                  </td>
                  <td>
                    <span className={`jornada-badge ${ficha.jornada.toLowerCase().replace(' ', '-')}`}>
                      <i className={`fas ${ficha.jornada === 'Mañana' ? 'fa-sun' : ficha.jornada === 'Tarde' ? 'fa-cloud-sun' : ficha.jornada === 'Noche' ? 'fa-moon' : 'fa-calendar-week'}`}></i>
                      {ficha.jornada}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="aprendices-count">{ficha.aprendices}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`estado-badge ${ficha.estado === 'Activa' ? 'activa' : 'inactiva'}`}>
                      {ficha.estado}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn-ver-ficha"
                      onClick={() => navigate(`/coordinador/ficha/${ficha.id}?modo=parametrizacion`)}
                    >
                      <i className="fas fa-eye"></i> Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FichasGlobales;