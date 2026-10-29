// src/pages/public/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();  // 🔥 Agregado 'login'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔥 REGISTRO CON AUTO-LOGIN Y REDIRECCIÓN POR ROL
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      // ✅ MAPEAR CAMPOS DEL FORMULARIO AL FORMATO DEL BACKEND
      const userData = {
        nombre: data.nombres || data.nombre || '',
        apellido: data.apellidos || data.apellido || '',
        email: data.email || '',
        password: data.password || 'Temporal123!',
        tipo_documento: data.tipoDocumento || data.tipo_documento || 'CC',
        documento_identidad: data.documento || data.documento_identidad || '',
        telefono: data.telefono || '',
        rol_id: 4, // Aprendiz por defecto
      };

      console.log('📤 Registrando usuario:', userData);

      // 1️⃣ REGISTRAR
      await register(userData);
      console.log('✅ Usuario registrado');

      // 2️⃣ LOGIN AUTOMÁTICO
      const loginResponse = await login(userData.email, userData.password);
      console.log('✅ Login automático exitoso');

      // 3️⃣ REDIRIGIR SEGÚN ROL
      const rolId = loginResponse.user?.rol_id;
      const roleRoutes = {
        1: '/admin',
        2: '/coordinador',
        3: '/instructor',
        4: '/aprendiz',
        5: '/apoyo',
        6: '/consulta',
      };
      const destino = roleRoutes[rolId] || '/login';
      console.log('🚀 Redirigiendo a:', destino);

      navigate(destino);

    } catch (error) {
      console.error('❌ Error en registro:', error);
      setError(error.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      
      {/* --- COLUMNA IZQUIERDA: IMAGEN Y BRANDING --- */}
      <div className="register-left">
        <div className="left-top">
          <div className="left-logo">
            <img src="/logo-sena.png" alt="Logo SENA" />
            <div className="left-brand">
              <h2>SIPA</h2>
              <span>Sistema de Seguimiento de Etapa Productiva</span>
            </div>
          </div>
        </div>

        <div className="left-hero">
          <h1>Únete a SIPA <br /> y haz parte de la <br /> <span className="highlight-green">formación que transforma</span></h1>
          <p>Regístrate para acceder al Sistema de Seguimiento de Etapa Productiva del SENA y gestionar tu proceso de forma fácil, segura y centralizada.</p>
        </div>

        <div className="left-image">
          <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop" alt="Laptop" />
        </div>

        <div className="left-footer">
          <div className="feature-badge">
            <i className="fas fa-shield-alt"></i> <span>Seguro</span>
          </div>
          <div className="feature-badge">
            <i className="fas fa-users"></i> <span>Inclusivo</span>
          </div>
          <div className="feature-badge">
            <i className="fas fa-chart-line"></i> <span>Eficiente</span>
          </div>
          <div className="feature-badge">
            <i className="fas fa-leaf"></i> <span>Sostenible</span>
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: FORMULARIO DE REGISTRO --- */}
      <div className="register-right">
        <div className="register-card">
          
          <div className="register-header">
            <div className="header-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h2>Crear cuenta en SIPA</h2>
            <p>Completa la información para registrarte en el sistema</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-title-row">
              <h3><i className="fas fa-id-card"></i> Información personal</h3>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Tipo de documento *</label>
                <div className="input-wrapper">
                  <i className="fas fa-id-card"></i>
                  <select name="tipoDocumento" required>
                    <option value="">Selecciona...</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PTE">Permiso Temporal Especial</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Número de documento *</label>
                <div className="input-wrapper">
                  <i className="fas fa-hashtag"></i>
                  <input type="text" name="documento" placeholder="Ej. 1234567890" required />
                </div>
              </div>

              <div className="form-group">
                <label>Nombres *</label>
                <div className="input-wrapper">
                  <i className="fas fa-user"></i>
                  <input type="text" name="nombres" placeholder="Ingresa tus nombres" required />
                </div>
              </div>

              <div className="form-group">
                <label>Apellidos *</label>
                <div className="input-wrapper">
                  <i className="fas fa-user"></i>
                  <input type="text" name="apellidos" placeholder="Ingresa tus apellidos" required />
                </div>
              </div>

              <div className="form-group">
                <label>Correo institucional *</label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope"></i>
                  <input type="email" name="email" placeholder="ejemplo@sena.edu.co" required />
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña *</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock"></i>
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Mínimo 8 caracteres" 
                    required 
                    minLength={8} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Teléfono celular *</label>
                <div className="input-wrapper">
                  <i className="fas fa-phone"></i>
                  <input type="tel" name="telefono" placeholder="Ej. 300 123 4567" required />
                </div>
              </div>

              <div className="form-group">
                <label>Ciudad de residencia *</label>
                <div className="input-wrapper">
                  <i className="fas fa-map-marker-alt"></i>
                  <select name="ciudad" required>
                    <option value="">Selecciona tu ciudad...</option>
                    <option value="Bogotá">Bogotá</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Dirección *</label>
                <div className="input-wrapper">
                  <i className="fas fa-home"></i>
                  <input type="text" name="direccion" placeholder="Ingresa tu dirección" required />
                </div>
              </div>

              <div className="form-group">
                <label>Fecha de nacimiento *</label>
                <div className="input-wrapper">
                  <i className="fas fa-calendar-alt"></i>
                  <input type="date" name="fechaNacimiento" required />
                </div>
              </div>

              <div className="form-group">
                <label>Género *</label>
                <div className="input-wrapper">
                  <i className="fas fa-venus-mars"></i>
                  <select name="genero" required>
                    <option value="">Selecciona...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mensaje de error si el backend falla */}
            {error && (
              <div style={{ 
                backgroundColor: '#fee2e2', 
                color: '#b91c1c', 
                padding: '10px', 
                borderRadius: '8px', 
                marginBottom: '15px', 
                fontSize: '14px' 
              }}>
                {error}
              </div>
            )}

            <div className="info-alert">
              <i className="fas fa-info-circle"></i>
              <span>La información registrada será utilizada únicamente para fines académicos e institucionales.</span>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
                <i className="fas fa-times"></i> Cancelar
              </button>
              <button type="submit" className="btn-next" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarme'} <i className="fas fa-arrow-right"></i>
              </button>
            </div>

            <div className="login-link">
              ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;