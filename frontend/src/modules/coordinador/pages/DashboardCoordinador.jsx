// src/modules/coordinador/pages/DashboardCoordinador.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/core/services/dashboardService';
import WidgetAlertas from '@/shared/components/WidgetAlertas';

// ============================================================
// Estilos inline
// ============================================================
const COORD_KPI_STYLES = `
  .kpis-grid-coord {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .kpi-card-coord {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 22px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e8ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    cursor: pointer;
    transform: translateY(0) scale(1);
  }
  .kpi-card-coord::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: var(--kpi-color, #d1d5db);
    transition: height 0.3s ease;
  }
  .kpi-card-coord:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06);
    border-color: var(--kpi-color, #d1d5db);
  }
  .kpi-card-coord:hover::before { height: 6px; }
  .kpi-card-coord:hover .kpi-icono-coord {
    transform: scale(1.15) rotate(-5deg);
  }
  .kpi-card-coord:hover .kpi-valor-coord {
    transform: scale(1.08);
    color: var(--kpi-color, #1a1a1a);
  }
  .kpi-icono-coord {
    font-size: 32px;
    flex-shrink: 0;
    line-height: 1;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .kpi-info-coord {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .kpi-valor-coord {
    font-size: 30px;
    font-weight: 800;
    color: #1a1a1a;
    line-height: 1;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: left center;
  }
  .kpi-label-coord {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 2px;
  }
  .kpi-sublabel-coord {
    font-size: 11px;
    color: #8b95a1;
    font-weight: 500;
  }
  .kpi-skeleton-coord {
    pointer-events: none;
  }
  .kpi-skeleton-coord .kpi-icono-coord,
  .kpi-skeleton-coord .kpi-valor-coord,
  .kpi-skeleton-coord .kpi-label-coord {
    background: #eef0f3;
    color: transparent;
    border-radius: 6px;
    animation: pulse-coord 1.5s ease-in-out infinite;
  }
  .kpi-skeleton-coord .kpi-icono-coord { width: 32px; height: 32px; }
  .kpi-skeleton-coord .kpi-valor-coord { width: 60%; height: 20px; margin-bottom: 8px; }
  .kpi-skeleton-coord .kpi-label-coord { width: 80%; height: 12px; }
  @keyframes pulse-coord {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .kpis-error-coord {
    padding: 20px;
    background: #fef5f5;
    border: 1px solid #fecaca;
    border-radius: 12px;
    color: #dc2626;
    font-size: 14px;
    text-align: center;
    margin-bottom: 24px;
  }
  @media (max-width: 1100px) {
    .kpis-grid-coord { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .kpis-grid-coord { grid-template-columns: 1fr; }
    .kpi-valor-coord { font-size: 26px; }
    .kpi-icono-coord { font-size: 28px; }
    .kpi-card-coord:hover { transform: translateY(-3px) scale(1.01); }
  }
`;

// ============================================================
// Componente KPIs
// ============================================================
const KPIsCoordinador = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getCoordinador();
        if (activo) setData(res);
      } catch (err) {
        console.error('[DashboardCoordinador] Error KPIs:', err);
        if (activo) setError(err.message || 'Error al cargar métricas');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  if (loading) {
    return (
      <div className="kpis-grid-coord">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card-coord kpi-skeleton-coord">
            <div className="kpi-icono-coord"></div>
            <div className="kpi-info-coord">
              <div className="kpi-valor-coord">0</div>
              <div className="kpi-label-coord">Cargando...</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="kpis-error-coord">
        ⚠️ No se pudieron cargar las métricas: {error}
      </div>
    );
  }

  const {
    total_fichas_asignadas = 0,
    total_instructores_activos = 0,
    total_procesos_activos = 0,
    total_procesos_pendientes = 0,
    alertas_criticas = 0,
    aprendices_pendientes_iniciar = 0,
    aprendices_sin_alternativa = 0,
    seguimientos_pendientes = 0,
    documentos_pendientes = 0,
    medidas_formativas_pendientes = 0,
  } = data || {};

  const kpis = [
    {
      id: 'fichas',
      icono: '🏫',
      valor: total_fichas_asignadas,
      label: 'Fichas',
      sublabel: 'asignadas',
      color: '#4a90e2',
    },
    {
      id: 'instructores',
      icono: '👨‍🏫',
      valor: total_instructores_activos,
      label: 'Instructores',
      sublabel: 'activos',
      color: '#9b59b6',
    },
    {
      id: 'procesos',
      icono: '📋',
      valor: total_procesos_activos,
      label: 'Procesos activos',
      sublabel: 'en curso',
      color: '#3ca203',
    },
    {
      id: 'alertas',
      icono: '🚨',
      valor: alertas_criticas,
      label: 'Alertas críticas',
      sublabel: 'requieren atención',
      color: '#e63946',
      destacado: alertas_criticas > 0,
    },
    {
      id: 'pendientes',
      icono: '⏳',
      valor: total_procesos_pendientes,
      label: 'Procesos pendientes',
      sublabel: 'por evaluar',
      color: '#f4a261',
    },
    {
      id: 'seguimientos',
      icono: '📅',
      valor: seguimientos_pendientes,
      label: 'Seguimientos',
      sublabel: 'pendientes',
      color: '#0ea5e9',
    },
    {
      id: 'documentos',
      icono: '📄',
      valor: documentos_pendientes,
      label: 'Documentos',
      sublabel: 'pendientes',
      color: '#f59e0b',
    },
    {
      id: 'medidas',
      icono: '⚖️',
      valor: medidas_formativas_pendientes,
      label: 'Medidas formativas',
      sublabel: 'pendientes',
      color: '#8b5cf6',
      destacado: medidas_formativas_pendientes > 0,
    },
  ];

  return (
    <div className="kpis-grid-coord">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`kpi-card-coord ${kpi.destacado ? 'kpi-card-destacado-coord' : ''}`}
          style={{ '--kpi-color': kpi.color }}
        >
          <div className="kpi-icono-coord">{kpi.icono}</div>
          <div className="kpi-info-coord">
            <div className="kpi-valor-coord">{kpi.valor}</div>
            <div className="kpi-label-coord">{kpi.label}</div>
            <div className="kpi-sublabel-coord">{kpi.sublabel}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Componente Principal
// ============================================================
const DashboardCoordinador = () => {
  const navigate = useNavigate();

  const handleVerRecurso = (alerta, nav) => {
    const mapa = {
      bitacora: '/coordinador/reporte-bitacoras',
      proceso: '/coordinador/reporte-bitacoras',
      ficha: '/coordinador/fichas',
      aprendiz: '/coordinador/aprendices',
      instructor: '/coordinador/instructores',
    };
    const ruta = mapa[alerta.entidad_relacionada];
    if (ruta) nav(ruta);
  };

  return (
    <div>
      <style>{COORD_KPI_STYLES}</style>

      {/* 🔔 ALERTAS */}
      <WidgetAlertas
        titulo="Alertas de Seguimiento"
        onVerRecurso={handleVerRecurso}
        onVerHistorial={() => navigate('/coordinador/reporte-bitacoras')}
      />

      {/* 📊 KPIs */}
      <KPIsCoordinador />
    </div>
  );
};

export default DashboardCoordinador;