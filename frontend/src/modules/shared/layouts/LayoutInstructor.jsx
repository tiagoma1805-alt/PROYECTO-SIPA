// src/modules/shared/layouts/LayoutInstructor.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/modules/shared/components/Header';
import SidebarInstructor from '@/modules/instructor/components/SidebarInstructor';
import '@/App.css';

// PÃ¡ginas
import DashboardInstructor from '@/modules/instructor/pages/DashboardInstructor';
import Calendario from '@/modules/instructor/pages/Calendario';
import MiPerfil from '@/modules/instructor/pages/MiPerfil';
import Seguimientos from '@/modules/instructor/pages/Seguimientos';
import DetalleEvento from '@/modules/instructor/pages/DetalleEvento';
import DetalleSeguimiento from '@/modules/instructor/pages/DetalleSeguimiento';
import DetalleFichaInstructor from '@/modules/instructor/pages/DetalleFichaInstructor';
import DetalleAprendizBitacoras from '@/modules/instructor/pages/DetalleAprendizBitacoras';
import BitacorasPorBimestre from '@/modules/instructor/pages/BitacorasPorBimestre';
import EditarCharla from '@/modules/instructor/pages/EditarCharla';
import DetalleCharla from '@/modules/instructor/pages/DetalleCharla';

// Componentes
import Fichas from '@/modules/instructor/components/Fichas';
import Empresas from '@/modules/instructor/components/Empresas';
import Aprendices from '@/modules/instructor/components/Aprendices';
import CharlasProgramadas from '@/modules/instructor/components/CharlasProgramadas';
import HistorialCharlas from '@/modules/instructor/components/HistorialCharlas';
import SeleccionAlternativa from '@/modules/instructor/components/SeleccionAlternativa';
import SeguimientoMomentos from '@/modules/instructor/components/SeguimientoMomentos';
import Bitacora from '@/modules/instructor/components/Bitacora';
import Certificaciones from '@/modules/instructor/components/Certificaciones';
import ReportesFinales from '@/modules/instructor/components/ReportesFinales';

const LayoutInstructor = () => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // ðŸ”¥ Leer usuario real del localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const nombreCompleto = `${parsed.nombre || ''} ${parsed.apellido || ''}`.trim() || 'Instructor';
        const avatarUrl = parsed.avatar_url
          ? (parsed.avatar_url.startsWith('http')
              ? parsed.avatar_url
              : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${parsed.avatar_url}`)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=3ca203&color=fff&bold=true&size=128`;

        setUser({
          id: parsed.id,
          nombre: nombreCompleto,
          email: parsed.email || '',
          role: parsed.rol_nombre || 'Instructor',
          avatar: avatarUrl,
        });
      }
    } catch (e) {
      console.error('Error al leer usuario:', e);
    }
  }, []);

  // Sincronizar activePage con la URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/instructor' || path === '/instructor/') setActivePage('dashboard');
    else if (path.includes('/fichas')) setActivePage('fichas');
    else if (path.includes('/charlas-programadas')) setActivePage('charlas-programadas');
    else if (path.includes('/historial-charlas')) setActivePage('historial-charlas');
    else if (path.includes('/seleccion-alternativa')) setActivePage('seleccion-alternativa');
    else if (path.includes('/momentos')) setActivePage('momentos');
    else if (path.includes('/bitacora')) setActivePage('bitacora');
    else if (path.includes('/certificaciones')) setActivePage('certificaciones');
    else if (path.includes('/reportes-finales')) setActivePage('reportes-finales');
    else if (path.includes('/empresas')) setActivePage('empresas');
    else if (path.includes('/aprendices')) setActivePage('aprendices');
  }, [location.pathname]);

  const handleSidebarClick = (pageId) => {
    setActivePage(pageId);
  };

  return (
    <div className="app-layout">
      <Header
        user={user || { nombre: 'Cargando...', role: 'Instructor', avatar: '' }}
        notifications={[]}
      />
      <div className="main-body">
        <SidebarInstructor setActivePage={handleSidebarClick} />
        <div className="content-area" style={{ padding: '30px', boxSizing: 'border-box', backgroundColor: '#f6f8fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<DashboardInstructor activePage={activePage} />} />
              <Route path="/dashboard" element={<DashboardInstructor activePage={activePage} />} />
              <Route path="/fichas" element={<Fichas />} />
              <Route path="/ficha/:idFicha" element={<DetalleFichaInstructor />} />
              <Route path="/charlas-programadas" element={<CharlasProgramadas />} />
              <Route path="/charla/:id" element={<DetalleCharla />} />
              <Route path="/historial-charlas" element={<HistorialCharlas />} />
              <Route path="/charla/:id/editar" element={<EditarCharla />} />
              <Route path="/seleccion-alternativa" element={<SeleccionAlternativa />} />
              <Route path="/momentos" element={<SeguimientoMomentos />} />
              <Route path="/bitacora" element={<Bitacora />} />
              <Route path="/certificaciones" element={<Certificaciones />} />
              <Route path="/reportes-finales" element={<ReportesFinales />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/aprendices" element={<Aprendices />} />
              <Route path="/bitacora/aprendiz/:aprendizId" element={<DetalleAprendizBitacoras />} />
              <Route path="/bitacora/aprendiz/:aprendizId/bimestre/:bimestre" element={<BitacorasPorBimestre />} />
              <Route path="/mi-perfil" element={<MiPerfil />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/seguimientos" element={<Seguimientos />} />
              <Route path="/evento/:id" element={<DetalleEvento />} />
              <Route path="/seguimiento/:id" element={<DetalleSeguimiento />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutInstructor;
