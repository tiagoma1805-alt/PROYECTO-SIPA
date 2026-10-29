// src/modules/auth/pages/VerificacionCodigo.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/core/services/authService';
import './RecuperarContrasena.css';

const VerificacionCodigo = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutos
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/recuperar');
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.verifyResetCode(email, code);
      setSuccess('Código verificado correctamente');
      setTimeout(() => {
        navigate('/cambiar-contrasena', { state: { email, code } });
      }, 1500);
    } catch (error) {
      setError(error.message || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.resendVerificationCode(email);
      setSuccess('Código reenviado a tu correo');
      setTimer(300);
    } catch (error) {
      setError(error.message || 'Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <h1>Código de verificación</h1>
          <p>Hemos enviado un código de verificación a tu correo electrónico registrado.</p>
        </div>

        <div className="left-image">
          <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop" alt="Código de verificación" />
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
            <h2>Código de verificación</h2>
            <p>Hemos enviado un código de 6 dígitos a <strong>{email}</strong></p>
          </div>

          <form onSubmit={handleVerify}>
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

            <div className="code-section">
              <div className="code-label">Ingresa el código de 6 dígitos</div>
              <div className="code-input-wrapper">
                <input
                  type="text"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="code-input"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <div className="info-box warning-box">
              <i className="fas fa-clock"></i>
              <span>Tiempo restante: <strong>{formatTime(timer)}</strong></span>
            </div>

            <div className="info-box resend-box">
              <i className="fas fa-envelope"></i>
              <div>
                <strong>¿No recibiste el código?</strong>
                <span>Revisa tu bandeja de entrada, carpeta de spam o correo no deseado.</span>
                {timer === 0 && (
                  <button 
                    type="button" 
                    className="btn-resend" 
                    onClick={handleResendCode}
                    disabled={loading}
                  >
                    <i className="fas fa-sync-alt"></i> Reenviar código
                  </button>
                )}
              </div>
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading || code.length !== 6}>
              <i className="fas fa-check"></i> {loading ? 'Verificando...' : 'Verificar código'}
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

export default VerificacionCodigo;