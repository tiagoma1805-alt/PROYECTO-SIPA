// src/modules/coordinador/pages/AsignarFichasInstructor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Breadcrumb from '@/modules/shared/components/Breadcrumb';
import Swal from 'sweetalert2';
import { fichaService } from '@/core/services/fichaService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AsignarFichasInstructor = () => {
  const navigate = useNavigate();
  const { instructorId } = useParams();
  const location = useLocation();

  const instructorDelState = location.state?.instructor;
  const [instructor, setInstructor] = useState(instructorDelState || null);
  const [fichasDisponibles, setFichasDisponibles] = useState([]);
  const [asignacionesOriginales, setAsignacionesOriginales] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      // 1. Cargar instructor
      if (!instructor) {
        const usuarios = await fetch(`${API_BASE_URL}/usuarios/${instructorId}`, { headers })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        if (usuarios) {
          setInstructor({
            id: usuarios.id,
            nombre: `${usuarios.nombre || ''} ${usuarios.apellido || ''}`.trim(),
            email: usuarios.email,
          });
        }
      }

      // 2. Cargar todas las fichas
      const fichas = await fichaService.getFichas({ solo_activas: true });
      console.log('📋 Fichas:', fichas);

      // 3. Cargar asignaciones existentes de este instructor
      const asignaciones = await fetch(
        `${API_BASE_URL}/asignaciones?instructor_id=${instructorId}`,
        { headers }
      )
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []);

      console.log('📋 Asignaciones del instructor:', asignaciones);

      // Mapa de asignaciones: { ficha_id: { asignacion_id, asignada } }
      const mapaAsignaciones = {};
      (Array.isArray(asignaciones) ? asignaciones : []).forEach((a) => {
        mapaAsignaciones[a.ficha_id] = {
          asignacion_id: a.id,
          asignada: a.is_active && a.estado_asignacion === 'ACTIVA',
        };
      });

      setAsignacionesOriginales(mapaAsignaciones);

      // 4. Mapear fichas
      const fichasMapeadas = (Array.isArray(fichas) ? fichas : []).map((f) => ({
        id: f.id,
        numero_ficha: f.numero_ficha,
        programa_id: f.programa_id,
        asignada: mapaAsignaciones[f.id]?.asignada || false,
      }));

      setFichasDisponibles(fichasMapeadas);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudieron cargar los datos',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAsignacion = (id) => {
    setFichasDisponibles(
      fichasDisponibles.map((f) =>
        f.id === id ? { ...f, asignada: !f.asignada } : f
      )
    );
  };

  const handleGuardar = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      setSaving(true);

      // Detectar cambios
      const paraAsignar = fichasDisponibles.filter(
        (f) => f.asignada && !asignacionesOriginales[f.id]?.asignada
      );
      const paraDesasignar = fichasDisponibles.filter(
        (f) => !f.asignada && asignacionesOriginales[f.id]?.asignada
      );

      console.log('➕ Asignar:', paraAsignar);
      console.log('➖ Desasignar:', paraDesasignar);

      // Procesar asignaciones
      for (const ficha of paraAsignar) {
        await fetch(`${API_BASE_URL}/asignaciones`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ficha_id: ficha.id,
            instructor_id: parseInt(instructorId),
          }),
        });
      }

      // Procesar desasignaciones
      for (const ficha of paraDesasignar) {
        const asignacionId = asignacionesOriginales[ficha.id]?.asignacion_id;
        if (asignacionId) {
          await fetch(`${API_BASE_URL}/asignaciones/${asignacionId}`, {
            method: 'DELETE',
            headers,
          });
        }
      }

      Swal.fire({
        title: '✅ ¡Cambios guardados!',
        text: `Asignaciones actualizadas correctamente.`,
        icon: 'success',
        confirmButtonColor: '#3ca203',
      });

      setTimeout(() => {
        navigate('/coordinador/instructores');
      }, 1500);
    } catch (err) {
      console.error('Error al guardar:', err);
      Swal.fire({
        title: '❌ Error',
        text: err.message || 'No se pudieron guardar los cambios',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setSaving(false);
    }
  };

  const fichasAsignadas = fichasDisponibles.filter((f) => f.asignada);
  const fichasNoAsignadas = fichasDisponibles.filter((f) => !f.asignada);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <Breadcrumb />

      <button
        onClick={() => navigate('/coordinador/instructores')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#3ca203',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        <i className="fas fa-arrow-left" /> Volver a instructores
      </button>

      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
          Asignar Fichas a {instructor?.nombre || 'Instructor'}
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Email: {instructor?.email || '—'} • Fichas actuales: {fichasAsignadas.length}
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
          Fichas disponibles
        </h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
          Selecciona o deselecciona las fichas que deseas asignar a este instructor.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {fichasDisponibles.map((f) => (
            <div
              key={f.id}
              onClick={() => toggleAsignacion(f.id)}
              style={{
                background: f.asignada ? '#d1fae5' : 'white',
                border: f.asignada ? '2px solid #3ca203' : '2px solid #e5e7eb',
                borderRadius: '10px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ color: '#1f2937', fontSize: '16px' }}>{f.numero_ficha}</strong>
              </div>
              <div>
                {f.asignada ? (
                  <span style={{ color: '#047857', fontWeight: 'bold' }}>
                    <i className="fas fa-check-circle" /> Asignada
                  </span>
                ) : (
                  <span style={{ color: '#6b7280', fontWeight: 'bold' }}>
                    <i className="fas fa-plus-circle" /> Disponible
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '15px', border: '1px solid #d1fae5' }}>
          <h4 style={{ color: '#047857', margin: '0 0 5px 0' }}>
            <i className="fas fa-check-circle" /> Asignadas ({fichasAsignadas.length})
          </h4>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            {fichasAsignadas.map((f) => f.numero_ficha).join(', ') || 'Ninguna'}
          </p>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '15px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ color: '#6b7280', margin: '0 0 5px 0' }}>
            <i className="fas fa-times-circle" /> No asignadas ({fichasNoAsignadas.length})
          </h4>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            {fichasNoAsignadas.map((f) => f.numero_ficha).join(', ') || 'Ninguna'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate('/coordinador/instructores')}
          style={{
            background: '#e5e7eb',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={saving}
          style={{
            background: saving ? '#9ca3af' : '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default AsignarFichasInstructor;