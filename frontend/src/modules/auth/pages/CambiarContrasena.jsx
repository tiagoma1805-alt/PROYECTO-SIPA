// src/modules/auth/pages/CambiarContrasena.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/core/services/authService';
import './RecuperarContrasena.css';

const CambiarContrasena = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const code = location.state?.code || '';

  useEffect(() => {
    if (!email || !code) {
      navigate('/recuperar');
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(email, code, password);
      setSuccess('Contraseña actualizada exitosamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="left-header">
          <div className="left-logo">
            <img src="/logo-sena.png" alt="Logo SENA" />
            <div className="left-brand">
              <h2>SIPA</h2>
              <span>Sistema de Seguimiento de Etapa Productiva</span>
            </div>
          </div>
        </div>

        <div className="left-hero">
          <h1>Cambiar contraseña</h1>
          <p>Ingresa tu nueva contraseña en los campos siguientes para actualizarla correctamente.</p>
        </div>

        <div className="left-image">
          <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=600&auto=format&fit=crop" alt="Cambiar contraseña" />
        </div>

        <div className="left-footer">
          <div className="feature-badge">
            <i className="fas fa-shield-alt"></i>
            <div><strong>Seguro</strong><small>Tu información está protegida</small></div>
          </div>
          <div className="feature-badge">
            <i className="fas fa-envelope"></i>
            <div><strong>Confiable</strong><small>Te enviamos instrucciones de forma segura</small></div>
          </div>
          <div className="feature-badge">
            <i className="fas fa-clock"></i>
            <div><strong>Rápido</strong><small>Recupera el acceso a tu cuenta en pocos minutos</small></div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <div className="header-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h2>Cambiar contraseña</h2>
            <p>Ingresa tu nueva contraseña para <strong>{email}</strong></p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>
                {success}
              </div>
            )}

            <div className="form-group">
              <label>Nueva contraseña</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input 
                  type={showPass ? 'text' : 'password'}
                  placeholder="Ingresa tu nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength="6"
                />
                <i 
                  className={`fas fa-eye${showPass ? '' : '-slash'}`} 
                  onClick={() => setShowPass(!showPass)}
                  style={{ cursor: 'pointer', right: '12px', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                ></i>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar nueva contraseña</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input 
                  type={showPass ? 'text' : 'password'}
                  placeholder="Vuelve a ingresar tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="info-box requirements-box">
              <i className="fas fa-info-circle"></i>
              <div className="req-grid">
                <span>✔️ Mínimo 6 caracteres</span>
                <span>✔️ Una letra mayúscula</span>
                <span>✔️ Una letra minúscula</span>
                <span>✔️ Un número</span>
                <span>✔️ Un carácter especial (!@#$%)</span>
              </div>
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              <i className="fas fa-save"></i> {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>

            <div className="divider"><span>o regresa al inicio de sesión</span></div>

            <Link to="/login" className="btn-auth-outline">
              <i className="fas fa-arrow-left"></i> Volver al inicio de sesión
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CambiarContrasena;