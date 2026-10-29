// src/modules/shared/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Header.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 🔥 Helper para generar la URL del avatar (igual que en MiPerfil)
const getAvatarUrl = (user) => {
  if (!user) return '';

  // Si tiene avatar subido en el backend
  if (user.avatar_url) {
    return user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `${API_BASE_URL}${user.avatar_url}`;
  }

  // Generar con iniciales (nombre completo + apellido)
  const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=3ca203&color=fff&bold=true&size=256`;
};

const Header = ({ notifications = [] }) => {
  const navigate = useNavigate();
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState(null);

  // 🔥 Leer SIEMPRE del localStorage
  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('👤 [Header] Usuario del localStorage:', parsed);
          setUserData(parsed);
        }
      } catch (err) {
        console.error('[Header] Error leyendo usuario:', err);
      }
    };

    cargarUsuario();

    // Escuchar cambios en localStorage (por si cambia el usuario)
    const handleStorageChange = () => cargarUsuario();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleHelpMenu = () => setShowHelpMenu(!showHelpMenu);
  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro de que quieres cerrar sesión?',
      text: 'Se cerrará tu sesión actual y serás redirigido a la página principal.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('/');
      }
    });
  };

  const handleViewProfile = () => {
    setShowProfileMenu(false);

    const rolNombre = userData?.rol_nombre || userData?.role || '';
    const rawRole = rolNombre.toLowerCase();
    const role = rawRole
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (role === 'admin' || role === 'administrador') {
      navigate('/admin/mi-perfil');
    } else if (role === 'coordinador') {
      navigate('/coordinador/mi-perfil');
    } else if (role === 'instructor') {
      navigate('/instructor/mi-perfil');
    } else if (role === 'aprendiz') {
      navigate('/aprendiz/mi-perfil');
    } else if (role === 'apoyo' || role === 'apoyo administrativo') {
      navigate('/apoyo/mi-perfil');
    } else {
      navigate('/admin/mi-perfil');
    }
  };

  const notifList = notifications.length > 0 ? notifications : [];

  const avatarUrl = getAvatarUrl(userData);
  const nombreMostrar = userData
    ? `${userData.nombre || ''} ${userData.apellido || ''}`.trim() || 'Usuario'
    : 'Cargando...';
  const rolMostrar = userData?.rol_nombre || userData?.role || 'Usuario';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="sena-logo-wrapper">
          <img src="/logo-sena.png" alt="Logo SENA" className="sena-logo-img" />
        </div>
        <div>
          <h3>SIPA by Moxigua</h3>
          <span>Sistema de Seguimiento de Etapa Productiva</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* CAMPANA */}
        <div className="notification-wrapper" onClick={toggleNotifications}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'white' }}>
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
          </svg>
          <span className="notification-badge">3</span>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <span>Alertas recientes</span>
                <small>Marcar todas como leídas</small>
              </div>
              <div className="dropdown-list">
                {notifList.map((notif) => (
                  <div key={notif.id} className="dropdown-item">
                    <div className="notif-content">
                      <div className="notif-title">{notif.mensaje}</div>
                      <div className="notif-desc">{notif.tiempo}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <a href="#">Ver todas las alertas</a>
              </div>
            </div>
          )}
        </div>

        {/* INTERROGACIÓN */}
        <div className="help-wrapper" onClick={toggleHelpMenu}>
          <div className="help-circle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" fill="#3ca203"/>
            </svg>
          </div>

          {showHelpMenu && (
            <div className="help-dropdown">
              <div className="help-item">Ver manual de usuario</div>
              <div className="help-item">Contactar soporte</div>
              <div className="help-item">Acerca de SIPA</div>
            </div>
          )}
        </div>

        {/* PERFIL */}
        <div className="profile-wrapper">
          <div className="profile-section" onClick={toggleProfileMenu}>
            <img src={avatarUrl} alt="Profile" />
            <div>
              <strong>{nombreMostrar}</strong>
              <small>{rolMostrar}</small>
            </div>
            <i className="fas fa-chevron-down profile-arrow"></i>
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-item" onClick={handleViewProfile}>
                <i className="fas fa-user-circle"></i>
                <span>Ver mi perfil</span>
              </div>
              <div className="profile-item logout-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Cerrar sesión</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;