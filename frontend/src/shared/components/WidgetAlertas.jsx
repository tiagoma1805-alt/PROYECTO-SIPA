import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAlertas from '@/shared/hooks/useAlertas';
import './WidgetAlertas.css';

const ICONO_POR_TIPO = {
  URGENTE: '🔴',
  ADVERTENCIA: '🟡',
  INFO: '🔵',
  EXITO: '🟢',
};

const CLASE_POR_TIPO = {
  URGENTE: 'urgente',
  ADVERTENCIA: 'advertencia',
  INFO: 'info',
  EXITO: 'exito',
};

const formatearFecha = (isoString) => {
  if (!isoString) return '';
  const fecha = new Date(isoString);
  const ahora = new Date();
  const diffMs = ahora - fecha;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'hace unos segundos';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHoras < 24) return `hace ${diffHoras}h`;
  if (diffDias < 7) return `hace ${diffDias}d`;
  return fecha.toLocaleDateString('es-CO');
};

const WidgetAlertas = ({ titulo = 'Mis Alertas', onVerRecurso, onVerHistorial }) => {
  const navigate = useNavigate();
  const { alertas, pendientes, loading, error, resolviendo, resolver } = useAlertas();

  const handleVerRecurso = (alerta) => {
    if (onVerRecurso) {
      onVerRecurso(alerta, navigate);
    }
  };

  const handleResolver = async (alertaId) => {
    await resolver(alertaId);
  };

  if (loading && alertas.length === 0) {
    return (
      <div className="widget-alertas">
        <div className="widget-alertas-header">
          <h2>🚨 {titulo}</h2>
        </div>
        <div className="widget-alertas-loading">Cargando alertas...</div>
      </div>
    );
  }

  return (
    <div className="widget-alertas">
      <div className="widget-alertas-header">
        <h2>
          🚨 {titulo}
          <span className={`widget-alertas-badge ${pendientes === 0 ? 'vacio' : ''}`}>
            {pendientes}
          </span>
        </h2>
        {onVerHistorial && (
          <button className="widget-alertas-ver-todas" onClick={onVerHistorial}>
            Ver historial →
          </button>
        )}
      </div>

      {error && (
        <div className="widget-alertas-vacio" style={{ color: '#e63946' }}>
          ⚠️ {error}
        </div>
      )}

      {!error && alertas.length === 0 && (
        <div className="widget-alertas-vacio">
          <div className="widget-alertas-vacio-icono">✅</div>
          <div>¡Todo al día! No tienes alertas pendientes.</div>
        </div>
      )}

      {!error && alertas.length > 0 && (
        <div className="widget-alertas-lista">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className={`alerta-item ${CLASE_POR_TIPO[alerta.tipo] || 'info'}`}
            >
              <div className="alerta-icono">
                {ICONO_POR_TIPO[alerta.tipo] || 'ℹ️'}
              </div>

              <div className="alerta-contenido">
                <p className="alerta-titulo">{alerta.titulo}</p>
                <p className="alerta-mensaje">{alerta.mensaje}</p>
                <div className="alerta-meta">
                  <span>📅 {formatearFecha(alerta.created_at)}</span>
                  {alerta.categoria && <span>• {alerta.categoria.toLowerCase()}</span>}
                </div>

                <div className="alerta-acciones">
                  {onVerRecurso && (
                    <button
                      className="alerta-btn alerta-btn-ver"
                      onClick={() => handleVerRecurso(alerta)}
                    >
                      👁️ Ver
                    </button>
                  )}
                  <button
                    className="alerta-btn alerta-btn-resolver"
                    onClick={() => handleResolver(alerta.id)}
                    disabled={resolviendo === alerta.id}
                  >
                    {resolviendo === alerta.id ? '⏳...' : '✓ Resolver'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WidgetAlertas;