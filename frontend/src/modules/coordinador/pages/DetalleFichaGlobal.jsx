// src/modules/coordinador/pages/DetalleFichaGlobal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fichaService } from '@/core/services/fichaService';
import { procesoService } from '@/core/services/procesoService';

const DetalleFichaGlobal = () => {
  const { idFicha } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modo = searchParams.get('modo');
  const mostrarTablaAprendices = modo === 'parametrizacion';

  const [ficha, setFicha] = useState(null);
  const [programa, setPrograma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la gestión de aprendices
  const [pestanaActiva, setPestanaActiva] = useState('activos');
  const [aprendicesActivos, setAprendicesActivos] = useState([]);
  const [aprendicesInactivos, setAprendicesInactivos] = useState([]);
  const [loadingAprendices, setLoadingAprendices] = useState(false);

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFicha]);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      setError(null);

      const fichaData = await fichaService.getFichaById(idFicha);
      setFicha(fichaData);

      if (fichaData?.programa_id) {
        const programaData = await fichaService.getProgramaById(fichaData.programa_id).catch(() => null);
        setPrograma(programaData);
      }

      if (modo === 'parametrizacion') {
        cargarAprendices();
      }
    } catch (err) {
      console.error('Error al cargar ficha:', err);
      setError(err.message || 'Error al cargar la ficha');
    } finally {
      setLoading(false);
    }
  };

  const cargarAprendices = async () => {
    try {
      setLoadingAprendices(true);
      
      const activosData = await procesoService.getProcesos({ ficha_id: idFicha, solo_activos: true });
      const inactivosData = await procesoService.getProcesos({ ficha_id: idFicha, solo_activos: false });

      const inactivosReales = (inactivosData || []).filter(p => p.is_active === false);

      const mapearAprendices = async (procesos) => {
        return await Promise.all(procesos.map(async (p) => {
          let aprendiz = null;
          try { aprendiz = await procesoService.getUsuarioById(p.aprendiz_id); } catch {}
          return {
            ...p,
            nombre: aprendiz ? `${aprendiz.nombre} ${aprendiz.apellido}` : `Aprendiz #${p.aprendiz_id}`,
            correo: aprendiz?.email || '-',
            empresa: p.empresa_nombre || (p.empresa_id ? `Empresa #${p.empresa_id}` : 'Sin asignar'),
          };
        }));
      };

      setAprendicesActivos(await mapearAprendices(activosData || []));
      setAprendicesInactivos(await mapearAprendices(inactivosReales));

    } catch (err) {
      console.error('❌ Error al cargar aprendices:', err);
      setAprendicesActivos([]);
      setAprendicesInactivos([]);
    } finally {
      setLoadingAprendices(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try { return new Date(fecha).toLocaleDateString('es-ES'); } catch { return fecha; }
  };

  // ==========================================
  // FUNCIONES DE ACCIÓN
  // ==========================================
  const handleVerDetalle = (aprendizId) => {
    navigate(`/coordinador/aprendices/${aprendizId}`); 
  };

  const handleAsignarEmpresa = (aprendizId) => {
    navigate(`/coordinador/ficha-completa/${idFicha}/aprendiz/${aprendizId}/asignar-empresa`); 
  };

  const handleInactivar = async (procesoId, nombreAprendiz) => {
    const result = await Swal.fire({
      title: '¿Inactivar aprendiz?',
      html: `¿Estás seguro de que deseas inactivar a <strong>${nombreAprendiz}</strong> de esta ficha?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, inactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await procesoService.inactivarProceso(procesoId);
        Swal.fire('Inactivado', 'El aprendiz ha sido retirado de la ficha.', 'success');
        cargarAprendices(); 
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo inactivar al aprendiz.', 'error');
      }
    }
  };

  const handleReactivar = async (procesoId, nombreAprendiz) => {
    const result = await Swal.fire({
      title: '¿Reactivar aprendiz?',
      html: `¿Deseas volver a vincular a <strong>${nombreAprendiz}</strong> a esta ficha?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3ca203',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await procesoService.reactivarProceso(procesoId);
        Swal.fire('Reactivado', 'El aprendiz ha vuelto a la ficha.', 'success');
        cargarAprendices(); 
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo reactivar al aprendiz.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando ficha...</p>
      </div>
    );
  }

  if (error || !ficha) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Ficha no encontrada</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={() => navigate('/coordinador/fichas')} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          <i className="fas fa-arrow-left" /> Volver a fichas
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <button onClick={() => navigate('/coordinador/fichas')} style={{ background: 'transparent', border: 'none', color: '#3ca203', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fas fa-arrow-left" /> Volver a fichas
      </button>

      {/* INFO DE LA FICHA */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '25px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Ficha {ficha.numero_ficha}</h2>
        <p style={{ color: '#6b7280', margin: '0 0 15px 0' }}>{programa?.nombre || `Programa #${ficha.programa_id}`}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Nivel</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{ficha.nivel || 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Jornada</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{ficha.jornada || 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Aprendices esperados</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{ficha.aprendices_esperados || 0}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Estado</p>
            <span style={{ background: ficha.is_active ? '#d1fae5' : '#f3f4f6', color: ficha.is_active ? '#047857' : '#6b7280', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginTop: '5px' }}>
              {ficha.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Fecha Inicio</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{formatearFecha(ficha.fecha_inicio)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Fecha Fin</p>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>{formatearFecha(ficha.fecha_fin)}</p>
          </div>
        </div>
      </div>

      {/* TABLA DE APRENDICES CON PESTAÑAS */}
      {mostrarTablaAprendices && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '25px', border: '1px solid #e5e7eb' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, color: '#1f2937' }}>
              <i className="fas fa-users" style={{ color: '#3ca203', marginRight: '8px' }}></i>
              Gestión de Aprendices
            </h3>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setPestanaActiva('activos')}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: pestanaActiva === 'activos' ? '#3ca203' : '#f3f4f6', color: pestanaActiva === 'activos' ? 'white' : '#6b7280' }}
              >
                Activos ({aprendicesActivos.length})
              </button>
              <button 
                onClick={() => setPestanaActiva('inactivos')}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: pestanaActiva === 'inactivos' ? '#dc2626' : '#f3f4f6', color: pestanaActiva === 'inactivos' ? 'white' : '#6b7280' }}
              >
                Historial / Retirados ({aprendicesInactivos.length})
              </button>
            </div>
          </div>

          {loadingAprendices ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#3ca203' }}></i>
              <p>Cargando aprendices...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 10px' }}>Aprendiz</th>
                    <th style={{ padding: '12px 10px' }}>Correo</th>
                    <th style={{ padding: '12px 10px' }}>Empresa</th>
                    <th style={{ padding: '12px 10px' }}>ARL</th>
                    <th style={{ padding: '12px 10px' }}>Estado</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(pestanaActiva === 'activos' ? aprendicesActivos : aprendicesInactivos).map((ap) => (
                    <tr key={ap.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '500' }}>{ap.nombre}</td>
                      <td style={{ padding: '12px 10px', color: '#6b7280' }}>{ap.correo}</td>
                      <td style={{ padding: '12px 10px' }}>{ap.empresa}</td>
                      <td style={{ padding: '12px 10px' }}>{ap.arl}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ background: ap.is_active ? '#d1fae5' : '#fee2e2', color: ap.is_active ? '#047857' : '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          {ap.is_active ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        
                        {pestanaActiva === 'activos' ? (
                          <>
                            <button onClick={() => handleVerDetalle(ap.aprendiz_id)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} title="Ver Perfil">
                              <i className="fas fa-eye" /> Ver
                            </button>
                            <button onClick={() => handleAsignarEmpresa(ap.aprendiz_id)} style={{ background: '#fef3c7', color: '#b45309', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} title="Asignar Empresa">
                              <i className="fas fa-building" /> Empresa
                            </button>
                            <button onClick={() => handleInactivar(ap.id, ap.nombre)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} title="Inactivar de la ficha">
                              <i className="fas fa-user-slash" /> Inactivar
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleReactivar(ap.id, ap.nombre)} style={{ background: '#d1fae5', color: '#047857', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }} title="Reactivar en la ficha">
                            <i className="fas fa-undo" /> Reactivar
                          </button>
                        )}
                        
                      </td>
                    </tr>
                  ))}
                  
                  {(pestanaActiva === 'activos' ? aprendicesActivos : aprendicesInactivos).length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                        <i className="fas fa-info-circle" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                        <p>{pestanaActiva === 'activos' ? 'No hay aprendices activos en esta ficha.' : 'No hay historial de aprendices retirados.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetalleFichaGlobal;