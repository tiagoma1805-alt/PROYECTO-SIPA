// src/modules/coordinador/pages/AprendicesFicha.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fichaService } from '@/core/services/fichaService';

const AprendicesFicha = () => {
  const { idFicha } = useParams();
  const navigate = useNavigate();

  const [aprendices, setAprendices] = useState([]);
  const [ficha, setFicha] = useState(null);
  const [programa, setPrograma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFicha]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const fichaData = await fichaService.getFichaById(idFicha);
      setFicha(fichaData);

      if (fichaData?.programa_id) {
        const programaData = await fichaService
          .getProgramaById(fichaData.programa_id)
          .catch(() => null);
        setPrograma(programaData);
      }

      const aprendicesData = await fichaService.getAprendicesByFicha(idFicha);
      console.log('✅ Aprendices recibidos:', aprendicesData);
      setAprendices(Array.isArray(aprendicesData) ? aprendicesData : []);
    } catch (err) {
      console.error('Error al cargar:', err);
      setError(err.message || 'Error al cargar los aprendices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando aprendices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={() => navigate('/coordinador/fichas-parametrizacion')}
          style={{
            background: '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '15px',
          }}
        >
          <i className="fas fa-arrow-left" /> Volver
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <button
        onClick={() => navigate('/coordinador/fichas-parametrizacion')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#3ca203',
          cursor: 'pointer',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
        }}
      >
        <i className="fas fa-arrow-left" /> Volver a Fichas
      </button>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
          <i className="fas fa-users" style={{ color: '#3ca203', marginRight: '10px' }} />
          Aprendices de la Ficha {ficha?.numero_ficha || idFicha}
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {programa?.nombre || 'Programa'} · {aprendices.length} aprendiz(ces) registrado(s)
        </p>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          border: '1px solid #e5e7eb',
        }}
      >
        {aprendices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <i className="fas fa-info-circle" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
            <h3 style={{ color: '#6b7280', margin: '10px 0 5px 0' }}>No hay aprendices registrados</h3>
            <p style={{ color: '#9ca3af', margin: 0 }}>
              Esta ficha no tiene aprendices asignados todavía.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #e5e7eb',
                    textAlign: 'left',
                    color: '#6b7280',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '12px 10px' }}>#</th>
                  <th style={{ padding: '12px 10px' }}>Aprendiz</th>
                  <th style={{ padding: '12px 10px' }}>Correo</th>
                  <th style={{ padding: '12px 10px' }}>Documento</th>
                  <th style={{ padding: '12px 10px' }}>Teléfono</th>
                  <th style={{ padding: '12px 10px' }}>Empresa</th>
                  <th style={{ padding: '12px 10px' }}>ARL</th>
                  <th style={{ padding: '12px 10px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {aprendices.map((ap, index) => (
                  <tr key={ap.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 10px', color: '#6b7280' }}>{index + 1}</td>
                    <td style={{ padding: '12px 10px', fontWeight: '500' }}>
                      {ap.nombre || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#6b7280' }}>
                      {ap.correo || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {ap.tipo_documento
                        ? `${ap.tipo_documento} ${ap.documento_identidad || ''}`.trim()
                        : ap.documento_identidad || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>{ap.telefono || 'N/A'}</td>
                    <td style={{ padding: '12px 10px' }}>{ap.empresa || 'N/A'}</td>
                    <td style={{ padding: '12px 10px' }}>{ap.arl || 'N/A'}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        style={{
                          background: ap.estado === 'ACTIVO' ? '#d1fae5' : '#fee2e2',
                          color: ap.estado === 'ACTIVO' ? '#047857' : '#dc2626',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        {ap.estado || 'ACTIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AprendicesFicha;