import { useState, useEffect, useCallback, useRef } from 'react';
import alertaService from '@/core/services/alertaService';

const POLLING_INTERVAL = 60000;

export const useAlertas = (options = {}) => {
  const { autoFetch = true, polling = true } = options;

  const [alertas, setAlertas] = useState([]);
  const [pendientes, setPendientes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolviendo, setResolviendo] = useState(null);

  const intervalRef = useRef(null);

  const fetchAlertas = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const data = await alertaService.getPendientes();
      setAlertas(data.alertas || []);
      setPendientes(data.pendientes || 0);
    } catch (err) {
      console.error('[useAlertas] Error:', err);
      setError(err.message || 'Error al cargar alertas');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  const resolver = useCallback(async (alertaId, nota = null) => {
    setResolviendo(alertaId);
    try {
      await alertaService.resolver(alertaId, nota);
      setAlertas((prev) => prev.filter((a) => a.id !== alertaId));
      setPendientes((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('[useAlertas] Error al resolver:', err);
      setError(err.message || 'No se pudo resolver la alerta');
      return false;
    } finally {
      setResolviendo(null);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchAlertas();
  }, [autoFetch, fetchAlertas]);

  useEffect(() => {
    if (!polling) return;
    intervalRef.current = setInterval(() => fetchAlertas(false), POLLING_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [polling, fetchAlertas]);

  return {
    alertas,
    pendientes,
    loading,
    error,
    resolviendo,
    refetch: fetchAlertas,
    resolver,
  };
};

export default useAlertas;