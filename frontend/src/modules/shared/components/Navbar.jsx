// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar-public">
      <div className="navbar-left">
        <div className="sena-logo-wrapper">
          {/* --- AQUÍ ESTÁ EL CAMBIO: Usamos la ruta directa /logo-sena.png --- */}
          <img 
            src="/logo-sena.png" 
            alt="Logo SENA" 
            className="sena-logo-img"
          />
        </div>
        <div>
          <h3>SIPA by Moxigua</h3>
          <span>Sistema de Seguimiento de Etapa Productiva</span>
        </div>
      </div>
      
      <div className="navbar-right">
        <Link to="/login" className="btn-navbar-login">Iniciar sesión</Link>
        <Link to="/registro" className="btn-navbar-register">Registrarse</Link>
      </div>
    </header>
  );
};

export default Navbar;
