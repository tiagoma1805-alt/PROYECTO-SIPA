// src/modules/admin/pages/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/core/services/dashboardService';
import WidgetAlertas from '@/shared/components/WidgetAlertas';

// ============================================================
// Estilos inline (se inyectan solo una vez)
// ============================================================
const ADMIN_KPI_STYLES = `
  .kpis-grid-admin {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .kpi-card-admin {
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
  .kpi-card-admin::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: var(--kpi-color, #d1d5db);
    transition: height 0.3s ease;
  }
  .kpi-card-admin:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06);
    border-color: var(--kpi-color, #d1d5db);
  }
  .kpi-card-admin:hover::before { height: 6px; }
  .kpi-card-admin:hover .kpi-icono-admin {
    transform: scale(1.15) rotate(-5deg);
  }
  .kpi-card-admin:hover .kpi-valor-admin {
    transform: scale(1.08);
    color: var(--kpi-color, #1a1a1a);
  }
  .kpi-icono-admin {
    font-size: 32px;
    flex-shrink: 0;
    line-height: 1;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .kpi-info-admin {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .kpi-valor-admin {
    font-size: 30px;
    font-weight: 800;
    color: #1a1a1a;
    line-height: 1;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: left center;
  }
  .kpi-label-admin {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 2px;
  }
  .kpi-sublabel-admin {
    font-size: 11px;
    color: #8b95a1;
    font-weight: 500;
  }
  .kpi-skeleton-admin {
    pointer-events: none;
  }
  .kpi-skeleton-admin .kpi-icono-admin,
  .kpi-skeleton-admin .kpi-valor-admin,
  .kpi-skeleton-admin .kpi-label-admin {
    background: #eef0f3;
    color: transparent;
    border-radius: 6px;
    animation: pulse-admin 1.5s ease-in-out infinite;
  }
  .kpi-skeleton-admin .kpi-icono-admin { width: 32px; height: 32px; }
  .kpi-skeleton-admin .kpi-valor-admin { width: 60%; height: 20px; margin-bottom: 8px; }
  .kpi-skeleton-admin .kpi-label-admin { width: 80%; height: 12px; }
  @keyframes pulse-admin {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .kpis-error-admin {
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
    .kpis-grid-admin { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .kpis-grid-admin { grid-template-columns: 1fr; }
    .kpi-valor-admin { font-size: 26px; }
    .kpi-icono-admin { font-size: 28px; }
    .kpi-card-admin:hover { transform: translateY(-3px) scale(1.01); }
  }
`;

// ============================================================
// Componente KPIs (dentro del mismo archivo)
// ============================================================
const KPIsAdmin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAdmin();
        if (activo) setData(res);
      } catch (err) {
        console.error('[DashboardAdmin] Error KPIs:', err);
        if (activo) setError(err.message || 'Error al cargar métricas');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  if (loading) {
    return (
      <div className="kpis-grid-admin">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card-admin kpi-skeleton-admin">
            <div className="kpi-icono-admin"></div>
            <div className="kpi-info-admin">
              <div className="kpi-valor-admin">0</div>
              <div className="kpi-label-admin">Cargando...</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="kpis-error-admin">
        ⚠️ No se pudieron cargar las métricas: {error}
      </div>
    );
  }

  const {
    total_usuarios_activos = 0,
    total_aprendices_etapa_productiva = 0,
    total_instructores = 0,
    total_fichas = 0,
    total_procesos_activos = 0,
    total_procesos_finalizados = 0,
    documentos_pendientes = 0,
    total_novedades = 0,
  } = data || {};

  const kpis = [
    {
      id: 'usuarios',
      icono: '👥',
      valor: total_usuarios_activos,
      label: 'Usuarios activos',
      sublabel: 'en el sistema',
      color: '#4a90e2',
    },
    {
      id: 'aprendices',
      icono: '🎓',
      valor: total_aprendices_etapa_productiva,
      label: 'Aprendices',
      sublabel: 'en etapa productiva',
      color: '#3ca203',
    },
    {
      id: 'instructores',
      icono: '👨‍🏫',
      valor: total_instructores,
      label: 'Instructores',
      sublabel: 'activos',
      color: '#9b59b6',
    },
    {
      id: 'fichas',
      icono: '🏫',
      valor: total_fichas,
      label: 'Fichas',
      sublabel: 'registradas',
      color: '#f4a261',
    },
    {
      id: 'procesos_activos',
      icono: '📋',
      valor: total_procesos_activos,
      label: 'Procesos activos',
      sublabel: 'en curso',
      color: '#0ea5e9',
    },
    {
      id: 'procesos_finalizados',
      icono: '✅',
      valor: total_procesos_finalizados,
      label: 'Procesos finalizados',
      sublabel: 'completados',
      color: '#22c55e',
    },
    {
      id: 'documentos',
      icono: '📄',
      valor: documentos_pendientes,
      label: 'Documentos',
      sublabel: 'pendientes',
      color: '#f59e0b',
      destacado: documentos_pendientes > 0,
    },
    {
      id: 'novedades',
      icono: '📢',
      valor: total_novedades,
      label: 'Novedades',
      sublabel: 'registradas',
      color: '#ef4444',
    },
  ];

  return (
    <div className="kpis-grid-admin" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {kpis.slice(0, 8).map((kpi) => (
        <div
          key={kpi.id}
          className={`kpi-card-admin ${kpi.destacado ? 'kpi-card-destacado-admin' : ''}`}
          style={{ '--kpi-color': kpi.color }}
        >
          <div className="kpi-icono-admin">{kpi.icono}</div>
          <div className="kpi-info-admin">
            <div className="kpi-valor-admin">{kpi.valor}</div>
            <div className="kpi-label-admin">{kpi.label}</div>
            <div className="kpi-sublabel-admin">{kpi.sublabel}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Componente Principal
// ============================================================
const DashboardAdmin = () => {
  const navigate = useNavigate();

  const handleVerRecurso = (alerta, nav) => {
    const mapa = {
      usuario: '/admin/usuarios',
      ficha: '/admin/fichas',
      proceso: '/admin/fichas',
      bitacora: '/admin/fichas',
    };
    const ruta = mapa[alerta.entidad_relacionada];
    if (ruta) nav(ruta);
  };

  return (
    <div>
      <style>{ADMIN_KPI_STYLES}</style>

      {/* 🔔 ALERTAS */}
      <WidgetAlertas
        titulo="Alertas del Sistema"
        onVerRecurso={handleVerRecurso}
        onVerHistorial={() => navigate('/admin')}
      />

      {/* 📊 KPIs */}
      <KPIsAdmin />
    </div>
  );
};

export default DashboardAdmin;