// src/modules/instructor/services/bitacoraService.js

// Datos de ejemplo (mock) - Estos serán reemplazados por llamadas a la API
const fichasMock = [
  {
    id: '2875901',
    programa: 'Análisis y Desarrollo de Software',
    aprendices: [
      {
        id: 1,
        nombre: 'Laura Sofia Martinez',
        documento: '1001234567',
        alternativa: 'Contrato de Aprendizaje',
        empresa: 'TechSoft S.A.S.',
        bitacoras: {
          bimestre1: [
            {
              fecha: '15/03/2025',
              descripcion: 'Inicio de actividades en la empresa',
              observaciones: 'Buena adaptación al entorno laboral',
              instructor: 'Carlos Andrés López',
              tipo: 'seguimiento',
              aprendizObservacion: 'He comenzado mis labores en el área de desarrollo',
              archivos: [
                { id: 1, nombre: 'Induccion_SENA.pdf', tipo: 'application/pdf', tamaño: '1.2 MB' },
                { id: 2, nombre: 'Cronograma_Actividades.pdf', tipo: 'application/pdf', tamaño: '0.8 MB' }
              ]
            },
            {
              fecha: '22/03/2025',
              descripcion: 'Capacitación en herramientas internas',
              observaciones: 'Cumplió con el horario establecido',
              instructor: 'Carlos Andrés López',
              tipo: 'seguimiento',
              aprendizObservacion: 'La capacitación fue muy completa',
              archivos: [
                { id: 3, nombre: 'Capacitacion_Herramientas.pdf', tipo: 'application/pdf', tamaño: '1.5 MB' }
              ]
            }
          ],
          bimestre2: [
            {
              fecha: '10/05/2025',
              descripcion: 'Desarrollo de módulo de facturación',
              observaciones: 'Avance significativo en el proyecto',
              instructor: 'Carlos Andrés López',
              tipo: 'seguimiento',
              aprendizObservacion: 'Estoy trabajando en el módulo de facturación',
              archivos: [
                { id: 4, nombre: 'Modulo_Facturacion.pdf', tipo: 'application/pdf', tamaño: '2.3 MB' },
                { id: 5, nombre: 'Diagrama_BD.png', tipo: 'image/png', tamaño: '0.9 MB' }
              ]
            }
          ]
        }
      },
      {
        id: 2,
        nombre: 'Juan Diego Ramirez',
        documento: '1002345678',
        alternativa: 'Vínculo Formativo (Pasantía)',
        empresa: 'Innovar Solutions',
        bitacoras: {
          bimestre1: [
            {
              fecha: '20/04/2025',
              descripcion: 'Inducción general a la empresa',
              observaciones: 'Asistió puntualmente',
              instructor: 'Carlos Andrés López',
              tipo: 'seguimiento',
              aprendizObservacion: 'Recibí inducción sobre políticas de la empresa',
              archivos: [
                { id: 6, nombre: 'Induccion_Empresa.pdf', tipo: 'application/pdf', tamaño: '0.7 MB' }
              ]
            }
          ],
          bimestre2: [
            {
              fecha: '15/06/2025',
              descripcion: 'Proyecto de base de datos',
              observaciones: 'Buen desempeño técnico',
              instructor: 'Carlos Andrés López',
              tipo: 'seguimiento',
              aprendizObservacion: 'Estoy diseñando la base de datos del proyecto',
              archivos: [
                { id: 7, nombre: 'Diseno_BD.pdf', tipo: 'application/pdf', tamaño: '1.8 MB' }
              ]
            }
          ]
        }
      },
      {
        id: 3,
        nombre: 'Maria Camila Torres',
        documento: '1003456789',
        alternativa: 'Monitoria',
        empresa: null,
        bitacoras: {
          bimestre1: [
            {
              fecha: '01/03/2025',
              descripcion: 'Sesión de monitoreo académico',
              observaciones: 'Participación activa',
              instructor: 'Carlos Andrés López',
              tipo: 'seguimiento',
              aprendizObservacion: 'Realicé monitoreo a los estudiantes de primer semestre',
              archivos: []
            }
          ]
        }
      }
    ]
  },
  {
    id: '2875902',
    programa: 'Gestión Empresarial',
    aprendices: [
      {
        id: 4,
        nombre: 'Carlos Mendoza',
        documento: '1004567890',
        alternativa: 'Proyecto Productivo',
        empresa: 'Global Services LTDA',
        bitacoras: {
          bimestre1: [
            {
              fecha: '12/01/2025',
              descripcion: 'Planificación del proyecto',
              observaciones: 'Estructura clara y detallada',
              instructor: 'Carlos Andrés López',
              tipo: 'seguimiento',
              aprendizObservacion: 'Estoy planificando las etapas del proyecto',
              archivos: [
                { id: 8, nombre: 'Plan_Proyecto.pdf', tipo: 'application/pdf', tamaño: '1.1 MB' }
              ]
            }
          ]
        }
      },
      {
        id: 5,
        nombre: 'Valentina Rojas',
        documento: '1005678901',
        alternativa: 'Vínculo Laboral',
        empresa: 'DataTech Colombia',
        bitacoras: {}
      },
      {
        id: 6,
        nombre: 'Andrés Felipe Castro',
        documento: '1006789012',
        alternativa: 'Contrato de Aprendizaje',
        empresa: 'Soluciones Web SAS',
        bitacoras: {
          bimestre1: [
            {
              fecha: '10/05/2025',
              descripcion: 'Desarrollo de frontend',
              observaciones: 'Cumple con estándares de calidad',
              instructor: 'Carlos Andrés López',
              tipo: 'seguimiento',
              aprendizObservacion: 'Estoy desarrollando interfaces de usuario',
              archivos: [
                { id: 9, nombre: 'Frontend_Avance.pdf', tipo: 'application/pdf', tamaño: '2.5 MB' },
                { id: 10, nombre: 'Captura_Pantalla.png', tipo: 'image/png', tamaño: '1.2 MB' }
              ]
            }
          ]
        }
      }
    ]
  }
];

// ============================================================
// SERVICIOS
// ============================================================

// Obtener todas las fichas
export const getFichas = () => {
  // Aquí irá la llamada al backend:
  // return api.get('/instructor/fichas');
  return fichasMock;
};

// Obtener aprendices por ficha
export const getAprendicesByFicha = (fichaId) => {
  const ficha = fichasMock.find(f => f.id === fichaId);
  return ficha ? ficha.aprendices : [];
};

// Obtener bitácoras por aprendiz
export const getBitacorasByAprendiz = (fichaId, aprendizId) => {
  const ficha = fichasMock.find(f => f.id === fichaId);
  if (!ficha) return {};
  const aprendiz = ficha.aprendices.find(a => a.id === aprendizId);
  return aprendiz ? aprendiz.bitacoras : {};
};

// Obtener aprendiz por ID
export const getAprendizById = (fichaId, aprendizId) => {
  const ficha = fichasMock.find(f => f.id === fichaId);
  if (!ficha) return null;
  return ficha.aprendices.find(a => a.id === aprendizId) || null;
};

// Obtener ficha por ID
export const getFichaById = (fichaId) => {
  return fichasMock.find(f => f.id === fichaId) || null;
};