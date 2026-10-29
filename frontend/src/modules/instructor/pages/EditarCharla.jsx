// src/pages/instructor/EditarCharla.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../shared/components/Breadcrumb';
import Swal from 'sweetalert2';

const EditarCharla = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Datos de la charla (simulados)
  const charla = {
    id: parseInt(id),
    nombre: 'Normatividad SENA',
    fecha: '2025-06-22',
    hora: '08:00',
    fichasAsignadas: ['2875901', '2875902']
  };

  // Lista de fichas disponibles
  const fichasDisponibles = [
    { id: '2875901', programa: 'Análisis y Desarrollo de Software' },
    { id: '2875902', programa: 'Gestión Empresarial' },
    { id: '2875903', programa: 'Contabilidad y Finanzas' },
    { id: '2875904', programa: 'Mecatrónica' },
    { id: '2875905', programa: 'Diseño Gráfico' }
  ];

  const [fecha, setFecha] = useState(charla.fecha);
  const [hora, setHora] = useState(charla.hora);
  const [fichasSeleccionadas, setFichasSeleccionadas] = useState(charla.fichasAsignadas);

  // Obtener fecha actual para restringir fechas anteriores
  const today = new Date().toISOString().split('T')[0];

  // Manejar cambio de fecha (validar que no sea anterior a hoy)
  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    if (nuevaFecha < today) {
      Swal.fire({
        title: '⚠️ Fecha no válida',
        text: 'No se puede seleccionar una fecha anterior a hoy.',
        icon: 'warning',
        iconColor: '#f59e0b',
        confirmButtonColor: '#3ca203',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-popup-sandbox',
          title: 'swal2-title-sandbox',
          confirmButton: 'swal2-confirm-sandbox',
        }
      });
      return;
    }
    setFecha(nuevaFecha);
  };

  // Alternar selección de ficha
  const toggleFicha = (fichaId) => {
    setFichasSeleccionadas(prev => {
      if (prev.includes(fichaId)) {
        return prev.filter(id => id !== fichaId);
      } else {
        return [...prev, fichaId];
      }
    });
  };

  // Seleccionar/Deseleccionar todas las fichas
  const toggleAllFichas = () => {
    if (fichasSeleccionadas.length === fichasDisponibles.length) {
      setFichasSeleccionadas([]);
    } else {
      setFichasSeleccionadas(fichasDisponibles.map(f => f.id));
    }
  };

  const handleGuardar = async () => {
    if (!fecha || !hora) {
      await Swal.fire({
        title: '⚠️ Campos incompletos',
        text: 'Por favor, completa la fecha y la hora.',
        icon: 'warning',
        iconColor: '#f59e0b',
        confirmButtonColor: '#3ca203',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-popup-sandbox',
          title: 'swal2-title-sandbox',
          confirmButton: 'swal2-confirm-sandbox',
        }
      });
      return;
    }

    if (fichasSeleccionadas.length === 0) {
      await Swal.fire({
        title: '⚠️ Sin fichas seleccionadas',
        text: 'Por favor, selecciona al menos una ficha.',
        icon: 'warning',
        iconColor: '#f59e0b',
        confirmButtonColor: '#3ca203',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-popup-sandbox',
          title: 'swal2-title-sandbox',
          confirmButton: 'swal2-confirm-sandbox',
        }
      });
      return;
    }

    // Obtener nombres de las fichas seleccionadas
    const fichasNombres = fichasSeleccionadas.map(id => {
      const ficha = fichasDisponibles.find(f => f.id === id);
      return ficha ? `${ficha.id} - ${ficha.programa}` : id;
    });

    // Formatear fecha para mostrar
    const fechaFormateada = fecha.split('-').reverse().join('/');

    // Mostrar SweetAlert de confirmación
    await Swal.fire({
      title: '✅ Cambios guardados',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="margin-bottom: 10px;">
            <strong style="color: #1f2937; font-size: 16px;">${charla.nombre}</strong>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
            <div><strong>📅 Fecha:</strong></div>
            <div>${fechaFormateada}</div>
            <div><strong>🕐 Hora:</strong></div>
            <div>${hora}</div>
          </div>
          <hr style="border: 1px solid #e5e7eb; margin: 10px 0;" />
          <div>
            <strong>📚 Fichas asignadas (${fichasSeleccionadas.length})</strong>
            <div style="max-height: 150px; overflow-y: auto; margin-top: 8px;">
              ${fichasNombres.map(nombre => `
                <div style="padding: 4px 8px; background: #f8fafc; border-radius: 4px; margin-bottom: 4px; font-size: 13px; border-left: 3px solid #3ca203;">
                  ${nombre}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,
      icon: 'success',
      iconColor: '#3ca203',
      confirmButtonColor: '#3ca203',
      confirmButtonText: 'Aceptar',
      timer: 5000,
      timerProgressBar: true,
      width: '500px',
      padding: '25px 30px',
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'swal2-popup-sandbox',
        title: 'swal2-title-sandbox',
        confirmButton: 'swal2-confirm-sandbox',
      }
    });

    navigate('/instructor/charlas-programadas');
  };

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <button 
        onClick={() => navigate('/instructor/charlas-programadas')}
        style={{ background: 'transparent', border: 'none', color: '#3ca203', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
      >
        <i className="fas fa-arrow-left" /> Volver a charlas
      </button>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Editar</h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>{charla.nombre}</p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '30px', border: '1px solid #e5e7eb', maxWidth: '550px' }}>
        {/* FECHA */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={handleFechaChange}
            min={today}
            style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px' }}>
            <i className="fas fa-info-circle" style={{ color: '#3ca203', marginRight: '4px' }} />
            No se pueden seleccionar fechas anteriores a hoy.
          </p>
        </div>

        {/* HORA */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Hora</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
        </div>

        {/* SELECCIÓN MÚLTIPLE DE FICHAS */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
              <i className="fas fa-layer-group" style={{ color: '#3ca203', marginRight: '6px' }} />
              Fichas asignadas ({fichasSeleccionadas.length} seleccionadas)
            </label>
            <button
              type="button"
              onClick={toggleAllFichas}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3ca203',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {fichasSeleccionadas.length === fichasDisponibles.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {fichasDisponibles.map((ficha) => {
              const isSelected = fichasSeleccionadas.includes(ficha.id);
              return (
                <div
                  key={ficha.id}
                  onClick={() => toggleFicha(ficha.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? '#e6f7ed' : 'transparent',
                    border: isSelected ? '1px solid #3ca203' : '1px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: isSelected ? '2px solid #3ca203' : '2px solid #d1d5db',
                    background: isSelected ? '#3ca203' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    flexShrink: 0
                  }}>
                    {isSelected && <i className="fas fa-check" style={{ fontSize: '10px' }} />}
                  </span>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#1f2937' }}>Ficha {ficha.id}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{ficha.programa}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
            <i className="fas fa-info-circle" style={{ color: '#3ca203', marginRight: '4px' }} />
            Haz clic en una ficha para seleccionarla o deseleccionarla.
          </p>
        </div>

        {/* BOTONES */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate('/instructor/charlas-programadas')}
            style={{ background: '#e5e7eb', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            style={{
              background: '#3ca203',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: '0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8a00'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3ca203'}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarCharla;
