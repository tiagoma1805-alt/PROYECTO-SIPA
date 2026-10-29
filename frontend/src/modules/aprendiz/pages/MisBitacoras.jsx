// src/pages/aprendiz/MisBitacoras.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { apiClient } from '@/core/api/client';
import { validarPdf } from '@/core/utils/validarPdf';
import './MisBitacoras.css';

const MisBitacoras = () => {
  const navigate = useNavigate();

  // ==========================================================
  // 🔥 GENERAR PDF SIMULADO
  // ==========================================================
  const generarPDFSimulado = (titulo, contenido, fecha) => {
    const doc = new jsPDF();
    doc.setFillColor(60, 162, 3);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SISTEMA DE SEGUIMIENTO SENA', 105, 12, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Etapa Productiva - Bitácora', 105, 20, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, 20, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 20, 52);
    doc.setFontSize(12);
    doc.text('Actividades realizadas:', 20, 70);
    doc.setFontSize(10);
    const maxWidth = 170;
    const splitText = doc.splitTextToSize(contenido, maxWidth);
    doc.text(splitText, 20, 78);
    doc.setFontSize(10);
    doc.text('Firma del Aprendiz:', 20, 270);
    doc.line(60, 270, 130, 270);
    return doc;
  };

  const verPDFSimulado = (titulo, contenido, fecha) => {
    const doc = generarPDFSimulado(titulo, contenido, fecha);
    const url = doc.output('bloburl');
    window.open(url, '_blank');
  };

  const descargarPDFSimulado = (titulo, contenido, fecha, nombreArchivo) => {
    const doc = generarPDFSimulado(titulo, contenido, fecha);
    doc.save(nombreArchivo || `${titulo}.pdf`);
  };

  // ==========================================================
  // 📅 ESTADO
  // ==========================================================
  const [bimestres, setBimestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 Fecha "hoy" en tiempo real (se actualiza cada 60 seg)
  const [hoy, setHoy] = useState(new Date());

  // ==========================================================
  // 🔥 CARGAR BITÁCORAS DEL BACKEND
  // ==========================================================
  useEffect(() => {
    cargarBitacoras();
  }, []);

  // ==========================================================
  // 🔥 ACTUALIZAR "HOY" CADA 60 SEGUNDOS (tiempo real)
  // ==========================================================
  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoy(new Date());
    }, 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  // ==========================================================
  // 🔥 RECALCULAR ESTADOS DE BIMESTRES CUANDO CAMBIA "HOY"
  // ==========================================================
  useEffect(() => {
    if (bimestres.length > 0) {
      setBimestres(prev => prev.map(b => ({
        ...b,
        estado: calcularEstadoBimestre(b.id),
      })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoy]);

  const cargarBitacoras = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('Usuario no autenticado');
      const user = JSON.parse(userStr);

      const bitacoras = await apiClient.get(`/bitacoras/aprendiz/${user.id}`);
      console.log('📚 Bitácoras reales:', bitacoras);

      const bimestresAgrupados = agruparEnBimestres(bitacoras);
      setBimestres(bimestresAgrupados);
    } catch (err) {
      console.error('Error al cargar bitácoras:', err);
      setError(err.message || 'Error al cargar las bitácoras');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🔥 CALCULAR ESTADO DEL BIMESTRE POR FECHAS
  //   1er Bimestre: ene - abr
  //   2do Bimestre: may - sep
  //   3er Bimestre: oct - dic
  // Usa el estado "hoy" para recalcular en tiempo real
  // ==========================================================
  const calcularEstadoBimestre = (numBimestre) => {
    const fechaActual = hoy;
    const anio = fechaActual.getFullYear();

    const RANGOS = {
      1: { inicio: new Date(anio, 0, 1),  fin: new Date(anio, 3, 30, 23, 59, 59) }, // ene-abr
      2: { inicio: new Date(anio, 4, 1),  fin: new Date(anio, 8, 30, 23, 59, 59) }, // may-sep
      3: { inicio: new Date(anio, 9, 1),  fin: new Date(anio, 11, 31, 23, 59, 59) }, // oct-dic
    };

    const rango = RANGOS[numBimestre];
    if (!rango) return 'Próximo';

    if (fechaActual > rango.fin) return 'Completo';
    if (fechaActual >= rango.inicio && fechaActual <= rango.fin) return 'En proceso';
    return 'Próximo';
  };

  // ==========================================================
  // 🔥 AGRUPAR EN BIMESTRES
  // ==========================================================
  const agruparEnBimestres = (bitacoras) => {
    const NOMBRES = ['1er Bimestre', '2do Bimestre', '3er Bimestre'];
    const DESCRIPCIONES = [
      'Bitácoras correspondientes al primer bimestre del proceso formativo.',
      'Bitácoras correspondientes al segundo bimestre del proceso formativo.',
      'Bitácoras correspondientes al tercer bimestre del proceso formativo.',
    ];

    return [1, 2, 3].map((numBimestre, idx) => {
      const bitacorasDelBim = bitacoras.filter(b => b.bimestre === numBimestre);
      const semanas = bitacorasDelBim.map(b => transformarBitacoraASemana(b));

      const aprobadas = semanas.filter(s => s.estado === 'Aprobada').length;
      const progreso = semanas.length > 0
        ? Math.round((aprobadas / semanas.length) * 100)
        : 0;

      // 🔥 Fechas del bimestre según CALENDARIO SENA (no de las bitácoras)
      const anioActual = new Date().getFullYear();
      const RANGOS_FECHAS = {
        1: { inicio: new Date(anioActual, 0, 1),  fin: new Date(anioActual, 3, 30) },  // ene-abr
        2: { inicio: new Date(anioActual, 4, 1),  fin: new Date(anioActual, 8, 30) },  // may-sep
        3: { inicio: new Date(anioActual, 9, 1),  fin: new Date(anioActual, 11, 31) }, // oct-dic
      };

      const rangoFechas = RANGOS_FECHAS[numBimestre];
      const fechaInicio = rangoFechas ? formatearFecha(rangoFechas.inicio) : '—';
      const fechaFin = rangoFechas ? formatearFecha(rangoFechas.fin) : '—';

      return {
        id: numBimestre,
        nombre: NOMBRES[idx],
        estado: calcularEstadoBimestre(numBimestre),
        descripcion: DESCRIPCIONES[idx],
        fechaInicio,
        fechaFin,
        progreso,
        semanas,
      };
    });
  };

  const transformarBitacoraASemana = (b) => {
    const mapEstado = {
      BORRADOR: 'Borrador',
      ENVIADA: 'Pendiente de revisión',
      APROBADA: 'Aprobada',
      CON_OBSERVACION: 'Requiere corrección',
    };

    return {
      id: b.id,
      nombre: `Semana ${b.numero_bitacora}`,
      fecha: b.fecha_envio ? formatearFecha(new Date(b.fecha_envio)) : '—',
      estado: mapEstado[b.estado] || 'Pendiente de revisión',
      descripcion: b.titulo || b.contenido || 'Sin descripción',
      observacion: b.instructor_retroalimentacion || null,
      evidencias: (b.archivos || []).map(a => ({
        nombre: a.nombre,
        titulo: b.titulo,
        contenido: b.contenido || '',
        fecha: b.fecha_envio ? formatearFecha(new Date(b.fecha_envio)) : '',
        url: a.ruta_objeto,
      })),
    };
  };

  const formatearFecha = (date) => {
    if (!date) return '—';
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // ==========================================================
  // CARGAR BITÁCORA NUEVA
  // ==========================================================
  const handleCargarBitacora = () => {
    const bimestreOptions = bimestres.map(b =>
      `<option value="${b.id}">${b.nombre}</option>`
    ).join('');

    Swal.fire({
      title: '📤 Cargar Bitácora',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Bimestre *
            </label>
            <select id="bimestre-select" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
            >
              ${bimestreOptions}
            </select>
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Semana *
            </label>
            <input id="semana-input" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
              placeholder="Ej: Semana 7"
            />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Fecha *
            </label>
            <input id="fecha-input" type="date"
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
            />
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Descripción *
            </label>
            <textarea id="descripcion-input" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; min-height: 80px; resize: vertical;"
              placeholder="Describe las actividades realizadas en esta semana..."
            ></textarea>
          </div>
          <div style="margin: 12px 0; padding: 20px; border: 2px dashed #d1d5db; border-radius: 8px; text-align: center;">
            <i class="fas fa-paperclip" style="font-size: 24px; color: #3ca203;"></i>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
              Adjunta tus evidencias (PDF) *
            </p>
            <input type="file" id="evidencia-input" multiple accept="application/pdf"
              style="width: 100%; padding: 8px; border: none; font-size: 13px;"
            />
            <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">
              Solo se permiten archivos PDF
            </p>
            <p id="evidencia-input-error" style="font-size: 12px; color: #dc2626; margin: 4px 0 0 0; display: none; font-weight: 600;">
              ❌ Solo se permiten archivos PDF
            </p>
          </div>
          <p style="font-size: 11px; color: #9ca3af; margin: 6px 0 0 0; text-align: left;">
            * Campos obligatorios
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '📤 Cargar Bitácora',
      confirmButtonColor: '#3ca203',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '500px',
      padding: '1.5rem',

      didOpen: () => {
        const input = document.getElementById('evidencia-input');
        const errorMsg = document.getElementById('evidencia-input-error');
        if (input) {
          input.value = '';
          if (errorMsg) errorMsg.style.display = 'none';
          input.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            for (const f of files) {
              const r = await validarPdf(f, 5);
              if (!r.ok) {
                if (errorMsg) { errorMsg.textContent = r.msg; errorMsg.style.display = 'block'; }
                input.value = '';
                return;
              }
            }
            if (errorMsg) errorMsg.style.display = 'none';
          });
        }
      },

      preConfirm: async () => {
        const bimestre = document.getElementById('bimestre-select').value;
        const semana = document.getElementById('semana-input').value;
        const fecha = document.getElementById('fecha-input').value;
        const descripcion = document.getElementById('descripcion-input').value;
        const evidenciaInput = document.getElementById('evidencia-input');
        const evidenciaFiles = evidenciaInput.files;

        if (!bimestre) { Swal.showValidationMessage('⚠️ Por favor selecciona un bimestre'); return false; }
        if (!semana.trim()) { Swal.showValidationMessage('⚠️ Por favor ingresa el nombre de la semana'); return false; }
        if (!fecha) { Swal.showValidationMessage('⚠️ Por favor selecciona una fecha'); return false; }
        if (!descripcion.trim()) { Swal.showValidationMessage('⚠️ Por favor ingresa una descripción'); return false; }
        if (evidenciaFiles.length === 0) { Swal.showValidationMessage('⚠️ Por favor adjunta al menos un PDF'); return false; }

        for (const f of evidenciaFiles) {
          const r = await validarPdf(f, 5);
          if (!r.ok) { Swal.showValidationMessage(r.msg); return false; }
        }

        const evidencias = Array.from(evidenciaFiles).map(f => ({
          nombre: f.name,
          titulo: `Evidencia ${semana.trim()}`,
        }));

        return { bimestre, semana: semana.trim(), fecha, descripcion: descripcion.trim(), evidencias };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { bimestre, semana, fecha, descripcion, evidencias } = result.value;
        const fechaFormateada = formatearFecha(new Date(fecha));

        const nuevaSemana = {
          id: Date.now(),
          nombre: semana,
          fecha: fechaFormateada,
          estado: 'Pendiente de revisión',
          descripcion: descripcion,
          observacion: null,
          evidencias: evidencias,
        };

        setBimestres(prev => prev.map(b => {
          if (b.id === parseInt(bimestre)) {
            return { ...b, semanas: [...b.semanas, nuevaSemana] };
          }
          return b;
        }));

        Swal.fire({
          title: '✅ ¡Bitácora cargada exitosamente!',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Bimestre:</strong> ${bimestres.find(b => b.id === parseInt(bimestre))?.nombre}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Semana:</strong> ${semana}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Fecha:</strong> ${fechaFormateada}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Evidencias:</strong> ${evidencias.map(ev => ev.nombre).join(', ')}
                </p>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                Tu bitácora ha sido enviada para revisión.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: '✅ Aceptar',
          confirmButtonColor: '#3ca203',
          timer: 3000,
          timerProgressBar: true,
          width: '480px'
        });
      }
    });
  };

  // ==========================================================
  // REENVIAR BITÁCORA CON CORRECCIÓN
  // ==========================================================
  const handleReenviarBitacora = (semana, bimestreId) => {
    Swal.fire({
      title: '📤 Reenviar Bitácora con Correcciones',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <div style="margin: 12px 0; background: #fef3c7; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 13px; color: #6b7280;">
              <strong><i class="fas fa-comment"></i> Corrección solicitada:</strong>
            </p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #1f2937;">${semana.observacion || 'El instructor ha solicitado correcciones para esta bitácora.'}</p>
          </div>
          <div style="margin: 12px 0;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">
              Descripción corregida *
            </label>
            <textarea id="descripcion-corregida" 
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; min-height: 100px; resize: vertical;"
              placeholder="Describe las correcciones realizadas en la bitácora..."
            >${semana.descripcion}</textarea>
          </div>
          <div style="margin: 12px 0; padding: 20px; border: 2px dashed #d1d5db; border-radius: 8px; text-align: center;">
            <i class="fas fa-paperclip" style="font-size: 24px; color: #3ca203;"></i>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
              Adjunta nuevas evidencias (PDF) *
            </p>
            <input type="file" id="evidencia-corregida" multiple accept="application/pdf"
              style="width: 100%; padding: 8px; border: none; font-size: 13px;"
            />
            <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">
              Solo se permiten archivos PDF
            </p>
            <p id="evidencia-corregida-error" style="font-size: 12px; color: #dc2626; margin: 4px 0 0 0; display: none; font-weight: 600;">
              ❌ Solo se permiten archivos PDF
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: '📤 Reenviar con correcciones',
      confirmButtonColor: '#f59e0b',
      showCancelButton: true,
      cancelButtonText: '❌ Cancelar',
      cancelButtonColor: '#ef4444',
      width: '520px',
      padding: '1.5rem',

      didOpen: () => {
        const input = document.getElementById('evidencia-corregida');
        const errorMsg = document.getElementById('evidencia-corregida-error');
        if (input) {
          input.value = '';
          if (errorMsg) errorMsg.style.display = 'none';
          input.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            for (const f of files) {
              const r = await validarPdf(f, 5);
              if (!r.ok) {
                if (errorMsg) { errorMsg.textContent = r.msg; errorMsg.style.display = 'block'; }
                input.value = '';
                return;
              }
            }
            if (errorMsg) errorMsg.style.display = 'none';
          });
        }
      },

      preConfirm: async () => {
        const descripcion = document.getElementById('descripcion-corregida').value;
        const evidenciaInput = document.getElementById('evidencia-corregida');
        const evidenciaFiles = evidenciaInput.files;

        if (!descripcion.trim()) { Swal.showValidationMessage('⚠️ Por favor ingresa la descripción corregida'); return false; }
        if (evidenciaFiles.length === 0) { Swal.showValidationMessage('⚠️ Por favor adjunta al menos un PDF'); return false; }

        for (const f of evidenciaFiles) {
          const r = await validarPdf(f, 5);
          if (!r.ok) { Swal.showValidationMessage(r.msg); return false; }
        }

        const nuevasEvidencias = Array.from(evidenciaFiles).map(f => ({
          nombre: f.name,
          titulo: `Evidencia ${semana.nombre}`,
        }));

        return { descripcion: descripcion.trim(), nuevasEvidencias };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { descripcion, nuevasEvidencias } = result.value;

        setBimestres(prev => prev.map(b => {
          if (b.id === bimestreId) {
            return {
              ...b,
              semanas: b.semanas.map(s => {
                if (s.id === semana.id) {
                  return {
                    ...s,
                    descripcion: descripcion,
                    estado: 'Pendiente de revisión',
                    observacion: null,
                    evidencias: nuevasEvidencias,
                  };
                }
                return s;
              }),
            };
          }
          return b;
        }));

        Swal.fire({
          title: '✅ ¡Bitácora reenviada!',
          html: `
            <div style="text-align: left; padding: 10px 0;">
              <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Semana:</strong> ${semana.nombre}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Nuevo estado:</strong> Pendiente de revisión
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Evidencias:</strong> ${nuevasEvidencias.map(ev => ev.nombre).join(', ')}
                </p>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                Tu bitácora ha sido reenviada con las correcciones para revisión.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: '✅ Aceptar',
          confirmButtonColor: '#3ca203',
          timer: 3000,
          timerProgressBar: true,
          width: '480px'
        });
      }
    });
  };

  // ==========================================================
  // VER DETALLES
  // ==========================================================
  const handleVerDetalles = (bimestre) => {
    if (bimestre.estado !== 'En proceso') {
      Swal.fire({
        title: '🔒 Bimestre No Activo',
        text: `El ${bimestre.nombre} no está activo actualmente. Podrás ver las bitácoras cuando esté en su periodo.`,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3ca203'
      });
      return;
    }

    const semanasHtml = bimestre.semanas.length === 0
      ? `<div style="text-align: center; padding: 30px; color: #9ca3af;">
           <i class="fas fa-inbox" style="font-size: 40px; margin-bottom: 10px;"></i>
           <p style="margin: 0;">No hay bitácoras cargadas en este bimestre</p>
         </div>`
      : bimestre.semanas.map((semana) => `
      <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong style="font-size: 14px; color: #1f2937;">${semana.nombre}</strong>
            <span style="font-size: 12px; color: #6b7280; margin-left: 10px;">
              <i class="fas fa-calendar-alt"></i> ${semana.fecha}
            </span>
          </div>
          <span style="font-size: 12px; font-weight: 500; padding: 2px 10px; border-radius: 12px; background: ${getColorEstado(semana.estado)}15; color: ${getColorEstado(semana.estado)};">
            <i class="fas ${getIconoEstado(semana.estado)}"></i> ${semana.estado}
          </span>
        </div>
        <p style="font-size: 13px; color: #6b7280; margin: 6px 0 0 0;">${semana.descripcion}</p>
        ${semana.observacion ? `
          <div style="margin-top: 6px; padding: 8px 12px; background: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b; font-size: 12px; color: #92400e;">
            <i class="fas fa-comment"></i> ${semana.observacion}
          </div>
        ` : ''}
        ${semana.evidencias && semana.evidencias.length > 0 ? `
          <div style="margin-top: 8px;">
            <p style="font-size: 12px; font-weight: 600; color: #1f2937; margin: 0 0 5px 0;">
              <i class="fas fa-paperclip"></i> Evidencias (${semana.evidencias.length}):
            </p>
            ${semana.evidencias.map(ev => `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <i class="fas fa-file-pdf" style="color: #dc2626; font-size: 14px;"></i>
                <span style="font-size: 12px; color: #6b7280;">${ev.nombre}</span>
                <button 
                  onclick="window.verPDFSimulado('${ev.titulo}', '${(ev.contenido || '').replace(/'/g, "\\'")}', '${ev.fecha}')"
                  style="background: #3ca203; color: white; border: none; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;"
                >
                  <i class="fas fa-eye"></i> Ver
                </button>
                <button 
                  onclick="window.descargarPDFSimulado('${ev.titulo}', '${(ev.contenido || '').replace(/'/g, "\\'")}', '${ev.fecha}', '${ev.nombre}')"
                  style="background: #3ca203; color: white; border: none; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;"
                >
                  <i class="fas fa-download"></i> Descargar
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${semana.estado === 'Requiere corrección' ? `
          <button 
            onclick="window.reenviarBitacora(${semana.id}, ${bimestre.id})"
            style="margin-top: 8px; background: #f59e0b; color: white; border: none; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;"
          >
            <i class="fas fa-undo-alt"></i> Reenviar con corrección
          </button>
        ` : ''}
      </div>
    `).join('');

    window.reenviarBitacora = (semanaId, bimestreId) => {
      const b = bimestres.find(x => x.id === bimestreId);
      if (b) {
        const s = b.semanas.find(x => x.id === semanaId);
        if (s) handleReenviarBitacora(s, bimestreId);
      }
    };

    window.verPDFSimulado = (titulo, contenido, fecha) => {
      verPDFSimulado(titulo, contenido, fecha);
    };

    window.descargarPDFSimulado = (titulo, contenido, fecha, nombreArchivo) => {
      descargarPDFSimulado(titulo, contenido, fecha, nombreArchivo);
    };

    Swal.fire({
      title: `📊 ${bimestre.nombre}`,
      html: `
        <div style="text-align: left; padding: 5px 0; max-height: 500px; overflow-y: auto;">
          <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
            <span style="font-size: 13px; color: #6b7280;">
              <i class="fas fa-calendar-alt"></i> ${bimestre.fechaInicio} - ${bimestre.fechaFin}
            </span>
            <span style="font-size: 13px; color: #6b7280;">
              <i class="fas fa-book"></i> ${bimestre.semanas.length} semanas
            </span>
            <span style="font-size: 13px; color: ${getColorEstadoBimestre(bimestre.estado)};">
              <i class="fas ${bimestre.estado === 'Completo' ? 'fa-check-circle' : bimestre.estado === 'En proceso' ? 'fa-spinner' : 'fa-clock'}"></i>
              ${bimestre.estado}
            </span>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <p style="font-size: 13px; font-weight: 600; color: #1f2937; margin: 0 0 10px 0;">
              <i class="fas fa-list"></i> Semanas
            </p>
            ${semanasHtml}
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '✅ Cerrar',
      confirmButtonColor: '#3ca203',
      width: '550px',
      padding: '1.5rem'
    });
  };

  // ==========================================================
  // COLORES
  // ==========================================================
  const getColorEstadoBimestre = (estado) => {
    if (estado === 'Completo') return '#10b981';
    if (estado === 'En proceso') return '#f59e0b';
    return '#6b7280';
  };

  const getColorEstado = (estado) => {
    if (estado === 'Aprobada') return '#10b981';
    if (estado === 'Requiere corrección') return '#ef4444';
    if (estado === 'Pendiente de revisión') return '#f59e0b';
    return '#6b7280';
  };

  const getIconoEstado = (estado) => {
    if (estado === 'Aprobada') return 'fa-check-circle';
    if (estado === 'Requiere corrección') return 'fa-exclamation-circle';
    if (estado === 'Pendiente de revisión') return 'fa-clock';
    return 'fa-circle';
  };

  // ==========================================================
  // ESTADÍSTICAS
  // ==========================================================
  const totalSemanas = (semanas) => semanas.length;
  const aprobadas = (semanas) => semanas.filter(s => s.estado === 'Aprobada').length;
  const pendientes = (semanas) => semanas.filter(s => s.estado === 'Pendiente de revisión').length;
  const correcciones = (semanas) => semanas.filter(s => s.estado === 'Requiere corrección').length;

  // ==========================================================
  // RENDER: LOADING / ERROR
  // ==========================================================
  if (loading) {
    return (
      <div className="mis-bitacoras-container">
        <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3ca203' }}></i>
          <p style={{ marginTop: '15px' }}>Cargando bitácoras...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-bitacoras-container">
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '40px', color: '#dc2626' }}></i>
          <h3 style={{ color: '#dc2626' }}>Error</h3>
          <p style={{ color: '#6b7280' }}>{error}</p>
          <button
            onClick={cargarBitacoras}
            style={{ background: '#3ca203', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER PRINCIPAL
  // ==========================================================
  return (
    <div className="mis-bitacoras-container">
      <nav className="breadcrumb">
        <ol>
          <li>
            <button 
              onClick={() => window.location.href = '/aprendiz'}
              className="breadcrumb-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
            >
              <i className="fas fa-home"></i> Mi Proceso
            </button>
            <span className="separator"> &gt; </span>
          </li>
          <li className="active">
            <i className="fas fa-book"></i> Mis Bitácoras
          </li>
        </ol>
      </nav>

      <div className="bitacoras-header">
        <div>
          <h2>Mis Bitácoras</h2>
          <p className="subtitulo">
            Revisa el estado de tus bitácoras organizadas por bimestre.
          </p>
        </div>
        <button 
          className="btn-cargar-bitacora"
          onClick={handleCargarBitacora}
        >
          <i className="fas fa-upload"></i> Cargar Bitácora
        </button>
      </div>

      <div className="bimestres-grid">
        {bimestres.map((bimestre) => {
          const estadoCalculado = bimestre.estado;
          const total = totalSemanas(bimestre.semanas);
          const aprobadasCount = aprobadas(bimestre.semanas);
          const pendientesCount = pendientes(bimestre.semanas);
          const correccionesCount = correcciones(bimestre.semanas);
          const color = getColorEstadoBimestre(estadoCalculado);

          const esActivo = estadoCalculado === 'En proceso';

          return (
            <div 
              key={bimestre.id} 
              className={`bimestre-card ${esActivo ? 'activo' : 'inactivo'}`}
              style={{
                opacity: esActivo ? 1 : 0.6,
                filter: esActivo ? 'none' : 'grayscale(80%)',
                pointerEvents: esActivo ? 'auto' : 'none'
              }}
            >
              <div className="bimestre-header">
                <div className="bimestre-titulo">
                  <span className="bimestre-numero">{bimestre.nombre}</span>
                  <h3>{bimestre.nombre}</h3>
                </div>
                <span 
                  className={`bimestre-estado ${estadoCalculado.toLowerCase().replace(' ', '-')}`}
                  style={{ background: `${color}15`, color: color }}
                >
                  <i className={`fas ${
                    estadoCalculado === 'Completo' ? 'fa-check-circle' : 
                    estadoCalculado === 'En proceso' ? 'fa-spinner' : 
                    'fa-clock'
                  }`}></i>
                  {estadoCalculado}
                </span>
              </div>

              <div className="bimestre-body">
                {estadoCalculado === 'Próximo' ? (
                  <>
                    <p className="bimestre-descripcion">{bimestre.descripcion}</p>
                    <div className="bimestre-fechas">
                      <span><i className="fas fa-calendar-alt"></i> Inicio: {bimestre.fechaInicio}</span>
                      <span><i className="fas fa-calendar-check"></i> Fin: {bimestre.fechaFin}</span>
                    </div>
                    <button className="btn-ver-detalles-bimestre" style={{ background: '#9ca3af', cursor: 'not-allowed' }} disabled>
                      <i className="fas fa-eye"></i> Se activará el {bimestre.fechaInicio}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="bimestre-descripcion">{bimestre.descripcion}</p>
                    <div className="bimestre-fechas">
                      <span><i className="fas fa-calendar-alt"></i> Inicio: {bimestre.fechaInicio}</span>
                      <span><i className="fas fa-calendar-check"></i> Fin: {bimestre.fechaFin}</span>
                    </div>
                    <div className="bimestre-stats">
                      <span className="stat-item" style={{ color: '#10b981' }}>
                        <i className="fas fa-check-circle"></i> {aprobadasCount} aprobadas
                      </span>
                      <span className="stat-item" style={{ color: '#f59e0b' }}>
                        <i className="fas fa-clock"></i> {pendientesCount} pendientes
                      </span>
                      <span className="stat-item" style={{ color: '#ef4444' }}>
                        <i className="fas fa-exclamation-circle"></i> {correccionesCount} con corrección
                      </span>
                      <span className="stat-item" style={{ color: '#6b7280' }}>
                        <i className="fas fa-book"></i> {total} total
                      </span>
                    </div>
                    <div className="bimestre-progreso">
                      <div className="progreso-info">
                        <span className="progreso-label">Progreso de bitácoras</span>
                        <span className="progreso-porcentaje" style={{ color: color }}>
                          {bimestre.progreso}%
                        </span>
                      </div>
                      <div className="progreso-barra">
                        <div className="progreso-llenado" style={{ width: `${bimestre.progreso}%`, background: color }} />
                      </div>
                    </div>
                    <button 
                      className="btn-ver-detalles-bimestre"
                      onClick={() => esActivo && handleVerDetalles(bimestre)}
                      disabled={!esActivo}
                      style={{ 
                        background: esActivo ? '#3ca203' : '#9ca3af', 
                        cursor: esActivo ? 'pointer' : 'not-allowed',
                        opacity: esActivo ? 1 : 0.7
                      }}
                      title={esActivo ? 'Ver detalles' : 'Este bimestre no está activo'}
                    >
                      <i className="fas fa-eye"></i> 
                      {esActivo ? 'Ver detalles del bimestre' : `Se activará el ${bimestre.fechaInicio}`}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MisBitacoras;