// src/modules/coordinador/pages/ReporteAprendizBitacoras.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bitacoraService } from '@/core/services/bitacoraService';

const ReporteAprendizBitacoras = () => {
  const { aprendizId } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bitacoraSeleccionada, setBitacoraSeleccionada] = useState(null);
  const [aprendiz, setAprendiz] = useState(null);
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarBitacoras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aprendizId]);

  const cargarBitacoras = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bitacoraService.getBitacorasByAprendiz(aprendizId);
      console.log('📖 Bitácoras del aprendiz:', data);

      const lista = Array.isArray(data) ? data : [];

      // Extraer info del aprendiz desde el primer registro
      if (lista.length > 0) {
        setAprendiz({
          id: lista[0].aprendiz_id,
          nombre: lista[0].aprendiz_nombre || 'Sin nombre',
        });
      } else {
        setAprendiz({ id: aprendizId, nombre: 'Aprendiz' });
      }

      // Mapear bitácoras al formato que usa el diseño
      const bitacorasMapeadas = lista.map((b) => ({
        id: b.id,
        titulo: b.titulo,
        fecha: b.fecha_envio
          ? new Date(b.fecha_envio).toLocaleDateString('es-ES')
          : '—',
        bimestre: b.bimestre || 1,
        contenido: b.contenido,
        archivos: b.archivos || [],
        estado: b.estado,
      }));

      setBitacoras(bitacorasMapeadas);
    } catch (err) {
      console.error('Error al cargar bitácoras:', err);
      setError(err.message || 'Error al cargar bitácoras');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const handleVerBitacora = (bitacora) => {
    setBitacoraSeleccionada(bitacora);
  };

  const handleCerrarDetalle = () => {
    setBitacoraSeleccionada(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando bitácoras...</p>
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
          onClick={() => navigate(-1)}
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

  // Si hay una bitácora seleccionada, mostrar su contenido
  if (bitacoraSeleccionada) {
    const archivos = bitacoraSeleccionada.archivos || [];
    return (
      <div style={{ width: '100%', padding: '20px 0' }}>
        <button
          onClick={handleCerrarDetalle}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#3ca203',
            cursor: 'pointer',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <i className="fas fa-arrow-left" /> Volver a la lista
        </button>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '10px',
            }}
          >
            {bitacoraSeleccionada.titulo}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            <i
              className="fas fa-calendar-alt"
              style={{ marginRight: '8px', color: '#3ca203' }}
            />
            {bitacoraSeleccionada.fecha} • Bimestre {bitacoraSeleccionada.bimestre}
          </p>
          <div style={{ lineHeight: '1.8', fontSize: '16px', color: '#374151' }}>
            {bitacoraSeleccionada.contenido}
          </div>

          {archivos.length > 0 && (
            <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#1f2937',
                  marginBottom: '10px',
                }}
              >
                <i className="fas fa-paperclip" style={{ color: '#dc2626', marginRight: '6px' }} />
                Archivos adjuntos ({archivos.length})
              </p>
              {archivos.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-file-pdf" style={{ color: '#dc2626' }}></i>
                    <span style={{ fontSize: '14px' }}>{a.nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredBitacoras = bitacoras.filter((b) =>
    (b.titulo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#3ca203',
          cursor: 'pointer',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <i className="fas fa-arrow-left" /> Volver
      </button>

      <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
        Bitácoras de {aprendiz?.nombre || 'Aprendiz'}
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>Organizadas por bimestre.</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por título de bitácora..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            background: '#3ca203',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Buscar
        </button>
        <button
          onClick={handleClear}
          style={{
            background: '#e5e7eb',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Limpiar
        </button>
      </div>

      {filteredBitacoras.length === 0 && searchQuery !== '' && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ color: '#dc2626' }}>Dato no encontrado</h3>
          <p style={{ color: '#6b7280' }}>No se encontraron bitácoras con ese título.</p>
        </div>
      )}

      {filteredBitacoras.length === 0 && searchQuery === '' && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }}
        >
          <i
            className="fas fa-book-open"
            style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }}
          ></i>
          <h3 style={{ color: '#6b7280' }}>Sin bitácoras registradas</h3>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Este aprendiz aún no tiene bitácoras en el sistema.
          </p>
        </div>
      )}

      {filteredBitacoras.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {[1, 2, 3].map((bim) => {
            const bimFiltradas = filteredBitacoras.filter((b) => b.bimestre === bim);
            return (
              <div
                key={bim}
                style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <h4 style={{ color: '#3ca203', fontWeight: 'bold' }}>Bimestre {bim}</h4>
                {bimFiltradas.length > 0 ? (
                  bimFiltradas.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleVerBitacora(b)}
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        transition: '0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#f8fafc')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <p style={{ margin: 0, fontWeight: '500' }}>{b.titulo}</p>
                        <span
                          style={{
                            background: '#e6f7ed',
                            color: '#047857',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          Ver
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        {b.fecha}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '13px' }}>Sin bitácoras</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReporteAprendizBitacoras;