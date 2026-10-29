// src/components/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const instructor = {
    nombre: 'Carlos Andrés López',
    fichasAsignadas: 3,
    totalAprendices: 84,
    seguimientos: {
      completados: 18,
      enProceso: 7,
      pendientes: 5
    }
  };

  const fichas = [
    { id: '2875901', programa: 'Análisis y Desarrollo de Software', aprendices: 28, progreso: 78 },
    { id: '2875902', programa: 'Gestión Empresarial', aprendices: 24, progreso: 65 },
    { id: '2875903', programa: 'Contabilidad y Finanzas', aprendices: 32, progreso: 45 },
  ];

  const eventos = [
    { id: 1, fecha: '23', mes: 'MAY', titulo: 'Seguimiento Momento 2', aprendiz: 'Laura Sofia Martinez', hora: '09:00 a.m.' },
    { id: 2, fecha: '26', mes: 'MAY', titulo: 'Evaluación Final', aprendiz: 'Juan Diego Ramirez', hora: '10:30 a.m.' },
    { id: 3, fecha: '28', mes: 'MAY', titulo: 'Seguimiento Momento 3', aprendiz: 'Maria Camila Torres', hora: '02:00 p.m.' },
  ];

  const ultimosSeguimientos = [
    { id: 1, aprendiz: 'Laura Sofia Martinez', fecha: '20/05/2025', momento: 'Momento 2', estado: 'Completado' },
    { id: 2, aprendiz: 'Juan Diego Ramirez', fecha: '19/05/2025', momento: 'Momento 1', estado: 'Completado' },
    { id: 3, aprendiz: 'Maria Camila Torres', fecha: '18/05/2025', momento: 'Momento 2', estado: 'En proceso' },
  ];

  // --- FUNCIONES DE NAVEGACIÓN ---
  const irACalendario = () => navigate('/instructor/calendario');
  const irASeguimientos = () => navigate('/instructor/seguimientos');
  const irAFichas = () => navigate('/instructor/fichas');
  const irADetalleFicha = (id) => navigate(`/instructor/ficha/${id}`);
  const irADetalleEvento = (id) => navigate(`/instructor/evento/${id}`);
  const irADetalleSeguimiento = (id) => navigate(`/instructor/seguimiento/${id}`);
  const irAAprendices = () => navigate('/instructor/aprendices');

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      {/* ENCABEZADO */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 5px 0' }}>
          ¡Bienvenido, {instructor.nombre}!
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
          Este es tu esquema general de seguimiento a aprendices.
        </p>
      </div>

      {/* TARJETAS DE RESUMEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {/* Tarjeta 1: Fichas Asignadas */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
          }}
          onClick={irAFichas}
        >
          <div style={{ fontSize: '36px', color: '#3ca203', marginBottom: '10px' }}>
            <i className="fas fa-layer-group" />
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
            {instructor.fichasAsignadas}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            <i className="fas fa-folder-open" style={{ marginRight: '6px' }} />
            Fichas Asignadas
          </p>
        </div>

        {/* Tarjeta 2: Total Aprendices */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
          }}
          onClick={irAAprendices}
        >
          <div style={{ fontSize: '36px', color: '#0ea5e9', marginBottom: '10px' }}>
            <i className="fas fa-users" />
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
            {instructor.totalAprendices}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            <i className="fas fa-user-graduate" style={{ marginRight: '6px' }} />
            Total Aprendices
          </p>
        </div>

        {/* Tarjeta 3: Seguimientos En Proceso */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
          }}
          onClick={irASeguimientos}
        >
          <div style={{ fontSize: '36px', color: '#f59e0b', marginBottom: '10px' }}>
            <i className="fas fa-spinner" />
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
            {instructor.seguimientos.enProceso}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            <i className="fas fa-clock" style={{ marginRight: '6px' }} />
            Seguimientos En Proceso
          </p>
        </div>

        {/* Tarjeta 4: Seguimientos Pendientes */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
          }}
          onClick={irASeguimientos}
        >
          <div style={{ fontSize: '36px', color: '#ef4444', marginBottom: '10px' }}>
            <i className="fas fa-exclamation-triangle" />
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
            {instructor.seguimientos.pendientes}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            <i className="fas fa-hourglass-half" style={{ marginRight: '6px' }} />
            Seguimientos Pendientes
          </p>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '30px' }}>
        {/* CALENDARIO */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              <i className="fas fa-calendar-alt" style={{ color: '#3ca203', marginRight: '8px' }} />
              Próximos Eventos
            </h3>
            <button
              onClick={irACalendario}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3ca203',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Ver calendario completo →
            </button>
          </div>

          {eventos.map(evento => (
            <div
              key={evento.id}
              onClick={() => irADetalleEvento(evento.id)}
              style={{
                display: 'flex',
                gap: '15px',
                padding: '12px 0',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderRadius = '8px';
                e.currentTarget.style.paddingLeft = '10px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.paddingLeft = '0';
              }}
            >
              <div style={{
                background: '#f3f4f6',
                padding: '5px 12px',
                borderRadius: '8px',
                textAlign: 'center',
                minWidth: '55px'
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#0ea5e9' }}>{evento.mes}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', lineHeight: 1.2 }}>{evento.fecha}</div>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 3px 0', color: '#1f2937' }}>{evento.titulo}</h4>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                  <i className="fas fa-user" style={{ marginRight: '4px' }} />
                  {evento.aprendiz}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                  <i className="fas fa-clock" style={{ marginRight: '4px' }} />
                  {evento.hora}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ÚLTIMOS SEGUIMIENTOS */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              <i className="fas fa-clipboard-list" style={{ color: '#3ca203', marginRight: '8px' }} />
              Últimos Seguimientos Realizados
            </h3>
            <button
              onClick={irASeguimientos}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3ca203',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Ver todos los seguimientos →
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#6b7280' }}>Aprendiz</th>
                <th style={{ textAlign: 'center', padding: '8px', color: '#6b7280' }}>Fecha</th>
                <th style={{ textAlign: 'center', padding: '8px', color: '#6b7280' }}>Momento</th>
                <th style={{ textAlign: 'center', padding: '8px', color: '#6b7280' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ultimosSeguimientos.map(s => (
                <tr
                  key={s.id}
                  onClick={() => irADetalleSeguimiento(s.id)}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '8px', fontWeight: '500' }}>{s.aprendiz}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{s.fecha}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{s.momento}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <span style={{
                      background: s.estado === 'Completado' ? '#d1fae5' : '#fef3c7',
                      color: s.estado === 'Completado' ? '#047857' : '#d97706',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {s.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLA DE FICHAS ASIGNADAS */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            <i className="fas fa-layer-group" style={{ color: '#3ca203', marginRight: '8px' }} />
            Mis Fichas Asignadas
          </h3>
          <button
            onClick={irAFichas}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#3ca203',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Ver todas →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Ficha</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Programa</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Aprendices</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Progreso</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {fichas.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#3ca203' }}>{f.id}</td>
                  <td style={{ padding: '12px' }}>{f.programa}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>{f.aprendices}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: f.progreso >= 70 ? '#10b981' : f.progreso >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {f.progreso}%
                      </span>
                      <div style={{ width: '60px', height: '6px', background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${f.progreso}%`,
                          height: '100%',
                          background: f.progreso >= 70 ? '#10b981' : f.progreso >= 40 ? '#f59e0b' : '#ef4444',
                          borderRadius: '10px'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <button
                      onClick={() => irADetalleFicha(f.id)}
                      style={{
                        background: '#e6f7ed',
                        color: '#047857',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fas fa-eye" /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
