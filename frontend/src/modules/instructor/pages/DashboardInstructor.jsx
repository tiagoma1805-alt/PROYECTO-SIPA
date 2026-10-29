// src/modules/instructor/pages/DashboardInstructor.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes existentes del instructor
import Fichas from '@/modules/instructor/components/Fichas';
import Empresas from '@/modules/instructor/components/Empresas';
import Aprendices from '@/modules/instructor/components/Aprendices';
import CharlasProgramadas from '@/modules/instructor/components/CharlasProgramadas';
import HistorialCharlas from '@/modules/instructor/components/HistorialCharlas';
import SeleccionAlternativa from '@/modules/instructor/components/SeleccionAlternativa';
import SeguimientoMomentos from '@/modules/instructor/components/SeguimientoMomentos';
import Bitacora from '@/modules/instructor/components/Bitacora';
import Certificaciones from '@/modules/instructor/components/Certificaciones';

// Servicios
import { dashboardService } from '@/core/services/dashboardService';
import WidgetAlertas from '@/shared/components/WidgetAlertas';

// ============================================================
// Estilos inline (se inyectan solo una vez)
// ============================================================
const KPI_STYLES = `
  .kpis-grid-instructor {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .kpi-card-instructor {
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

  .kpi-card-instructor::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--kpi-color, #d1d5db);
    transition: height 0.3s ease;
  }

  .kpi-card-instructor:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06);
    border-color: var(--kpi-color, #d1d5db);
  }

  .kpi-card-instructor:hover::before {
    height: 6px;
  }

  .kpi-card-instructor:hover .kpi-icono-instructor {
    transform: scale(1.15) rotate(-5deg);
  }

  .kpi-card-instructor:hover .kpi-valor-instructor {
    transform: scale(1.08);
    color: var(--kpi-color, #1a1a1a);
  }

  .kpi-card-destacado-instructor {
    border-color: #f4a261;
    background: linear-gradient(135deg, #fffaf3 0%, #ffffff 60%);
  }

  .kpi-icono-instructor {
    font-size: 32px;
    flex-shrink: 0;
    line-height: 1;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kpi-info-instructor {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .kpi-valor-instructor {
    font-size: 30px;
    font-weight: 800;
    color: #1a1a1a;
    line-height: 1;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: left center;
  }

  .kpi-label-instructor {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 2px;
  }

  .kpi-sublabel-instructor {
    font-size: 11px;
    color: #8b95a1;
    font-weight: 500;
  }

  .kpi-skeleton-instructor {
    pointer-events: none;
  }

  .kpi-skeleton-icono-instructor {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #eef0f3;
    animation: pulse-kpi 1.5s ease-in-out infinite;
  }

  .kpi-skeleton-info-instructor {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .kpi-skeleton-valor-instructor {
    width: 60%;
    height: 20px;
    border-radius: 4px;
    background: #eef0f3;
    animation: pulse-kpi 1.5s ease-in-out infinite;
  }

  .kpi-skeleton-label-instructor {
    width: 80%;
    height: 12px;
    border-radius: 4px;
    background: #f0f2f5;
    animation: pulse-kpi 1.5s ease-in-out infinite;
  }

  @keyframes pulse-kpi {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .kpis-error-instructor {
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
    .kpis-grid-instructor {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .kpis-grid-instructor {
      grid-template-columns: 1fr;
    }
    .kpi-valor-instructor { font-size: 26px; }
    .kpi-icono-instructor { font-size: 28px; }
    .kpi-card-instructor:hover {
      transform: translateY(-3px) scale(1.01);
    }
  }
`;

// ============================================================
// Componente KPIs (dentro del mismo archivo)
// ============================================================
const KPIsInstructor = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getInstructor();
        if (activo) setData(res);
      } catch (err) {
        console.error('[DashboardInstructor] Error KPIs:', err);
        if (activo) setError(err.message || 'Error al cargar métricas');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  if (loading) {
    return (
      <div className="kpis-grid-instructor">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card-instructor kpi-skeleton-instructor">
            <div className="kpi-skeleton-icono-instructor"></div>
            <div className="kpi-skeleton-info-instructor">
              <div className="kpi-skeleton-valor-instructor"></div>
              <div className="kpi-skeleton-label-instructor"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="kpis-error-instructor">
        ⚠️ No se pudieron cargar las métricas: {error}
      </div>
    );
  }

  const {
    total_fichas_asignadas = 0,
    total_aprendices_cargo = 0,
    total_bitacoras_pendientes = 0,
    proximas_reuniones = 0,
  } = data || {};

  const kpis = [
    {
      id: 'fichas',
      icono: '🏫',
      valor: total_fichas_asignadas,
      label: 'Fichas activas',
      sublabel: 'asignadas a ti',
      color: '#4a90e2',
    },
    {
      id: 'aprendices',
      icono: '👥',
      valor: total_aprendices_cargo,
      label: 'Aprendices',
      sublabel: 'a tu cargo',
      color: '#3ca203',
    },
    {
      id: 'bitacoras',
      icono: '📝',
      valor: total_bitacoras_pendientes,
      label: 'Bitácoras',
      sublabel: 'por revisar',
      color: '#f4a261',
      destacado: total_bitacoras_pendientes > 0,
    },
    {
      id: 'reuniones',
      icono: '📅',
      valor: proximas_reuniones,
      label: 'Reuniones',
      sublabel: 'próximas (30 días)',
      color: '#9b59b6',
    },
  ];

  return (
    <div className="kpis-grid-instructor">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`kpi-card-instructor ${kpi.destacado ? 'kpi-card-destacado-instructor' : ''}`}
          style={{ '--kpi-color': kpi.color }}
        >
          <div className="kpi-icono-instructor">{kpi.icono}</div>
          <div className="kpi-info-instructor">
            <div className="kpi-valor-instructor">{kpi.valor}</div>
            <div className="kpi-label-instructor">{kpi.label}</div>
            <div className="kpi-sublabel-instructor">{kpi.sublabel}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Componente Principal
// ============================================================
const DashboardInstructor = ({ activePage }) => {
  const navigate = useNavigate();

  const handleVerRecurso = (alerta, nav) => {
    const mapa = {
      bitacora: '/instructor/bitacora',
      proceso: '/instructor/seguimientos',
      reunion: '/instructor/momentos',
    };
    const ruta = mapa[alerta.entidad_relacionada];
    if (ruta) nav(ruta);
  };

  const renderDashboard = () => (
    <>
      {/* Estilos de KPIs (solo se inyectan una vez) */}
      <style>{KPI_STYLES}</style>

      {/* KPIs */}
      <KPIsInstructor />

      {/* Alertas */}
      <WidgetAlertas
        titulo="Mis Alertas"
        onVerRecurso={handleVerRecurso}
        onVerHistorial={() => navigate('/instructor/bitacora')}
      />
    </>
  );

  const renderContent = () => {
    switch (activePage) {
      case 'fichas': return <Fichas />;
      case 'empresas': return <Empresas />;
      case 'aprendices': return <Aprendices />;
      case 'charlas-programadas': return <CharlasProgramadas />;
      case 'historial-charlas': return <HistorialCharlas />;
      case 'seleccion-alternativa': return <SeleccionAlternativa />;
      case 'momentos': return <SeguimientoMomentos />;
      case 'bitacora': return <Bitacora />;
      case 'certificaciones': return <Certificaciones />;

      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-instructor-container">
      {renderContent()}
    </div>
  );
};

export default DashboardInstructor;