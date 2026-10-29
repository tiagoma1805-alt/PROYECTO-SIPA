// src/modules/instructor/components/Empresas.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../../shared/components/Breadcrumb';
import { apiClient } from '@/core/api/client';
import { showSuccess, showError } from '@/core/utils/sweetAlert';
import './Empresas.css';

const Empresas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem('user');
      const instructor = stored ? JSON.parse(stored) : null;
      const instructorId = instructor && instructor.id;
      if (!instructorId) throw new Error('No se encontró el instructor logueado');
      const data = await apiClient.get('/instructor/empresas/' + instructorId);
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
      setError(err.message || 'Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpresas = empresas.filter((empresa) =>
    (empresa.razon_social || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (empresa.arl || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (empresa.nit || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => setSearchQuery(searchTerm);
  const handleClear = () => { setSearchTerm(''); setSearchQuery(''); };

  const handleNuevaEmpresa = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva Empresa',
      customClass: {
        popup: 'swal-form-popup'
      },
      html: `
        <div class="swal-form-container">
          <div class="swal-form-group">
            <label>Nombre de la empresa *</label>
            <input id="nombreEmpresa" class="swal2-input swal-custom-input" placeholder="Ej. TechSoft S.A.S.">
          </div>
          
          <div class="swal-form-group">
            <label>NIT *</label>
            <input id="nitEmpresa" class="swal2-input swal-custom-input" placeholder="Ej. 900.123.456-7">
          </div>
          
          <div class="swal-form-group">
            <label>ARL</label>
            <select id="arlEmpresa" class="swal2-input swal-custom-input">
              <option value="SURA">SURA</option>
              <option value="Positiva">Positiva</option>
              <option value="Colmena">Colmena</option>
              <option value="Seguros Bolívar">Seguros Bolívar</option>
              <option value="La Equidad">La Equidad</option>
            </select>
          </div>
          
          <div class="swal-form-group">
            <label>Teléfono</label>
            <input id="telefonoEmpresa" class="swal2-input swal-custom-input" placeholder="Ej. 3001234567">
          </div>
          
          <p class="swal-required-text">* Campos obligatorios</p>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: 'Guardar Empresa',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '520px',
      padding: '25px 30px',
      preConfirm: () => {
        const razon_social = document.getElementById('nombreEmpresa').value.trim();
        const nit = document.getElementById('nitEmpresa').value.trim();
        const arl = document.getElementById('arlEmpresa').value;
        const telefono = document.getElementById('telefonoEmpresa').value.trim();
        if (!razon_social) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
        if (!nit) { Swal.showValidationMessage('El NIT es obligatorio'); return false; }
        return { razon_social: razon_social, nit: nit, arl: arl, telefono: telefono || null };
      }
    });
    if (!formValues) return;
    try {
      const nueva = await apiClient.post('/instructor/empresas', formValues);
      setEmpresas((prev) => [...prev, nueva]);
      await showSuccess('Empresa "' + nueva.razon_social + '" creada.', 'Empresa creada');
    } catch (err) {
      console.error('Error al crear empresa:', err);
      const msg = (err && err.response && err.response.data && err.response.data.detail) || 'No se pudo crear la empresa.';
      showError(msg);
    }
  };

  const handleEditarEmpresa = async (empresa) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Empresa',
      customClass: {
        popup: 'swal-form-popup'
      },
      html: `
        <div class="swal-form-container">
          <div class="swal-form-group">
            <label>Nombre *</label>
            <input id="editNombreEmpresa" class="swal2-input swal-custom-input" value="${empresa.razon_social || ''}">
          </div>
          
          <div class="swal-form-group">
            <label>NIT *</label>
            <input id="editNitEmpresa" class="swal2-input swal-custom-input" value="${empresa.nit || ''}">
          </div>
          
          <div class="swal-form-group">
            <label>ARL</label>
            <select id="editArlEmpresa" class="swal2-input swal-custom-input">
              <option value="SURA" ${empresa.arl === 'SURA' ? 'selected' : ''}>SURA</option>
              <option value="Positiva" ${empresa.arl === 'Positiva' ? 'selected' : ''}>Positiva</option>
              <option value="Colmena" ${empresa.arl === 'Colmena' ? 'selected' : ''}>Colmena</option>
              <option value="Seguros Bolívar" ${empresa.arl === 'Seguros Bolívar' ? 'selected' : ''}>Seguros Bolívar</option>
              <option value="La Equidad" ${empresa.arl === 'La Equidad' ? 'selected' : ''}>La Equidad</option>
            </select>
          </div>
          
          <div class="swal-form-group">
            <label>Teléfono</label>
            <input id="editTelefonoEmpresa" class="swal2-input swal-custom-input" value="${empresa.telefono || ''}">
          </div>
          
          <p class="swal-required-text">* Campos obligatorios</p>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: 'Guardar Cambios',
      confirmButtonColor: '#3ca203',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      showCancelButton: true,
      width: '520px',
      padding: '25px 30px',
      preConfirm: () => {
        const razon_social = document.getElementById('editNombreEmpresa').value.trim();
        const nit = document.getElementById('editNitEmpresa').value.trim();
        const arl = document.getElementById('editArlEmpresa').value;
        const telefono = document.getElementById('editTelefonoEmpresa').value.trim();
        if (!razon_social) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
        if (!nit) { Swal.showValidationMessage('El NIT es obligatorio'); return false; }
        return { razon_social: razon_social, nit: nit, arl: arl, telefono: telefono || null };
      }
    });
    if (!formValues) return;
    try {
      const actualizada = await apiClient.put('/instructor/empresas/' + empresa.id, formValues);
      setEmpresas((prev) => prev.map((e) => (e.id === empresa.id ? { ...e, ...actualizada } : e)));
      await showSuccess('Empresa "' + actualizada.razon_social + '" actualizada.', 'Actualizada');
    } catch (err) {
      console.error('Error al actualizar:', err);
      const msg = (err && err.response && err.response.data && err.response.data.detail) || 'No se pudo actualizar la empresa.';
      showError(msg);
    }
  };

  const handleEliminarEmpresa = async (empresa) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: '<div style="text-align:center;"><p style="font-size:16px;color:#374151;margin-bottom:10px;">¿Deseas eliminar la empresa <strong>"' + empresa.razon_social + '"</strong>?</p><p style="font-size:14px;color:#6b7280;">Esta acción no se puede deshacer.</p></div>',
      icon: 'warning',
      iconColor: '#dc2626',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
      await apiClient.delete('/instructor/empresas/' + empresa.id);
      setEmpresas((prev) => prev.filter((e) => e.id !== empresa.id));
      await showSuccess('Empresa "' + empresa.razon_social + '" eliminada.', 'Eliminada');
    } catch (err) {
      console.error('Error al eliminar:', err);
      const msg = (err && err.response && err.response.data && err.response.data.detail) || 'No se pudo eliminar la empresa.';
      showError(msg);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
        <p style={{ marginTop: '15px' }}>Cargando empresas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
        <h3 style={{ color: '#dc2626', marginTop: '15px' }}>Error</h3>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={cargarEmpresas} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
          <i className="fas fa-redo" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="empresas-container">
      <Breadcrumb />
      <div className="empresas-header">
        <h2>Empresas Asociadas</h2>
        <button className="btn-nuevo" onClick={handleNuevaEmpresa} style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-plus" /> Nueva empresa
        </button>
      </div>
      <div className="search-container">
        <input type="text" className="search-input" placeholder="Buscar por nombre, NIT o ARL..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        <button className="btn-search" onClick={handleSearch}>Buscar</button>
        <button className="btn-clear" onClick={handleClear}>Limpiar</button>
      </div>
      {filteredEmpresas.length === 0 ? (
        <div className="not-found">
          <h2><i className="fas fa-exclamation-circle"></i> {searchQuery ? 'Dato no encontrado' : 'Sin empresas'}</h2>
          <p>{searchQuery ? 'No existe ninguna empresa con los datos ingresados.' : 'Aún no tienes empresas asociadas.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>NIT</th>
                <th>ARL</th>
                <th>Aprendices</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpresas.map((empresa) => (
                <tr key={empresa.id}>
                  <td className="nombre-empresa">{empresa.razon_social}</td>
                  <td>{empresa.nit || '—'}</td>
                  <td>{empresa.arl || '—'}</td>
                  <td>{empresa.aprendices_count == null ? 0 : empresa.aprendices_count}</td>
                  <td>
                    <button className="action-btn-ficha btn-edit" onClick={() => handleEditarEmpresa(empresa)} style={{ background: '#e6f7ed', color: '#047857', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px' }}>
                      <i className="fas fa-edit" /> Editar
                    </button>
                    <button className="action-btn-ficha btn-delete" onClick={() => handleEliminarEmpresa(empresa)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                      <i className="fas fa-trash" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Empresas;