// src/modules/auth/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-wrapper">
      
      {/* --- NAVBAR --- */}
      <nav className="navbar-landing">
        <div className="navbar-left">
          <div className="navbar-logo">
            <img src="/logo-sena.png" alt="Logo SENA" className="navbar-logo-img" />
          </div>
          <div className="navbar-brand">
            <h1>SIPA <span style={{ fontWeight: '400', fontSize: '0.75em', opacity: 0.9 }}>by Moxigua</span></h1>
            <span>Sistema de Seguimiento de Etapa Productiva</span>
          </div>
        </div>

        <ul className="navbar-links">
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Características</a></li>
          <li><a href="#">Beneficios</a></li>
          <li><a href="#">Roles</a></li>
          <li><a href="#">Soporte</a></li>
          <li><a href="#">Acerca de</a></li>
        </ul>

        <div className="navbar-actions">
          <Link to="/login" className="btn-login-landing">
            <i className="fas fa-user" style={{ marginRight: '8px' }}></i> Iniciar sesión
          </Link>
          <Link to="/register" className="btn-register-landing">
            <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i> Registrarse
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>SIPA <span style={{ fontWeight: '400', fontSize: '0.6em', opacity: 0.85 }}>by Moxigua</span></h1>
          <h2>Sistema de Seguimiento <br /> de Etapa Productiva</h2>
          <p>Herramienta institucional del SENA para gestionar, hacer seguimiento y evaluar la etapa productiva de aprendices de forma eficiente y centralizada.</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-hero-primary">
              <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i> Iniciar sesión
            </Link>
            <button className="btn-hero-secondary">
              <i className="fas fa-play-circle"></i> Ver video introductorio
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" alt="Dashboard Preview" />
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="features-section">
        <h2>¿Qué puedes hacer con SIPA?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-users"></i></div>
            <h4>Seguimiento</h4>
            <p>Realiza el seguimiento de los aprendices en cada momento de su etapa productiva.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-star"></i></div>
            <h4>Evaluación</h4>
            <p>Evalúa el desempeño de los aprendices de acuerdo con los criterios establecidos.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-folder-open"></i></div>
            <h4>Documentos</h4>
            <p>Gestiona y consulta los documentos y formatos requeridos en la etapa productiva.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-bell"></i></div>
            <h4>Alertas</h4>
            <p>Recibe notificaciones y alertas sobre pendientes y fechas importantes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-chart-bar"></i></div>
            <h4>Reportes</h4>
            <p>Genera reportes e indicadores para la toma de decisiones institucionales.</p>
          </div>
        </div>
      </section>

      {/* --- BANNER SECTION --- */}
      <section className="banner-section">
        <div className="banner-content">
          <div className="banner-image">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop" alt="Trabajando juntos" />
          </div>
          <div className="banner-text">
            <h2>Trabajamos juntos por la formación y el futuro de nuestros aprendices</h2>
            <p>SIPA conecta aprendices, instructores, coordinadores y empresas para asegurar una etapa productiva de calidad.</p>
            <button className="btn-banner-green">Conoce más sobre SIPA <i className="fas fa-chevron-right" style={{ marginLeft: '8px' }}></i></button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer-landing">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>SIPA <span style={{ fontWeight: '400', fontSize: '0.75em', opacity: 0.9 }}>by Moxigua</span></h3>
            <span>Sistema de Seguimiento de Etapa Productiva</span>
          </div>
          <div className="footer-links">
            <h4>Enlaces rápidos</h4>
            <ul>
              <li><a href="#">Inicio</a></li>
              <li><a href="#">Características</a></li>
              <li><a href="#">Beneficios</a></li>
              <li><a href="#">Soporte</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Soporte</h4>
            <ul>
              <li><a href="#">Centro de ayuda</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
              <li><a href="#">Contactarnos</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Políticas de privacidad</a></li>
              <li><a href="#">Términos de uso</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2025 SIPA by Moxigua. Todos los derechos reservados.
        </div>
      </footer>

    </div>
  );
};

export default Landing;