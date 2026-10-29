// src/data/bitacorasData.jsx

// ============================================================
// DATOS DE BITÁCORAS CON ARCHIVOS ADJUNTOS
// ============================================================
export const bitacorasData = {
  // ============================================================
  // FICHA 2875901 - Análisis y Desarrollo de Software
  // ============================================================
  '2875901': {
    id: '2875901',
    programa: 'Análisis y Desarrollo de Software',
    instructor: 'Carlos Andrés López',
    aprendices: [
      {
        id: 1,
        nombre: 'Laura Sofia Martinez',
        documento: '1001234567',
        bitacoras: [
          {
            id: 1,
            titulo: 'Semana 1 - Inducción',
            fecha: '10/03/2025',
            bimestre: 1,
            contenido: 'Inducción completada. Se presentaron las normas de seguridad y el cronograma de actividades. El aprendiz mostró una actitud positiva y participativa.',
            archivos: [
              { id: 1, nombre: 'Induccion_SENA.pdf', tipo: 'application/pdf', tamaño: '1.2 MB' },
              { id: 2, nombre: 'Cronograma_Actividades.pdf', tipo: 'application/pdf', tamaño: '0.8 MB' },
              { id: 3, nombre: 'Foto_Induccion.jpg', tipo: 'image/jpeg', tamaño: '2.1 MB' }
            ]
          },
          {
            id: 2,
            titulo: 'Semana 2 - Diagnóstico',
            fecha: '17/03/2025',
            bimestre: 1,
            contenido: 'Diagnóstico exitoso. El aprendiz demostró un nivel intermedio en herramientas ofimáticas. Se recomienda refuerzo en Excel y trabajo en equipo.',
            archivos: [
              { id: 4, nombre: 'Diagnostico_Resultados.pdf', tipo: 'application/pdf', tamaño: '0.5 MB' }
            ]
          },
          {
            id: 3,
            titulo: 'Semana 3 - Proyecto',
            fecha: '24/03/2025',
            bimestre: 1,
            contenido: 'El aprendiz inició el proyecto asignado con un enfoque metódico. Cumplió con los primeros entregables dentro del plazo establecido.',
            archivos: [
              { id: 5, nombre: 'Plan_Proyecto.pdf', tipo: 'application/pdf', tamaño: '1.5 MB' },
              { id: 6, nombre: 'Diagrama_Flujo.png', tipo: 'image/png', tamaño: '0.9 MB' }
            ]
          },
          {
            id: 4,
            titulo: 'Semana 4 - Evaluación',
            fecha: '31/03/2025',
            bimestre: 1,
            contenido: 'Se realizó la primera evaluación parcial. El aprendiz obtuvo un puntaje sobresaliente en la parte teórica y práctica. Se recomienda seguir así.',
            archivos: [
              { id: 7, nombre: 'Evaluacion_Parcial.pdf', tipo: 'application/pdf', tamaño: '0.3 MB' }
            ]
          },
          {
            id: 5,
            titulo: 'Semana 5 - Implementación',
            fecha: '07/04/2025',
            bimestre: 2,
            contenido: 'Se dio inicio a la fase de implementación del proyecto. El aprendiz trabaja de forma autónoma y consulta dudas oportunamente.',
            archivos: [
              { id: 8, nombre: 'Implementacion_Avance.pdf', tipo: 'application/pdf', tamaño: '2.2 MB' },
              { id: 9, nombre: 'Captura_Implementacion.png', tipo: 'image/png', tamaño: '3.1 MB' }
            ]
          }
        ]
      },
      {
        id: 2,
        nombre: 'Juan Diego Ramirez',
        documento: '1002345678',
        bitacoras: [
          {
            id: 6,
            titulo: 'Semana 3 - Avance',
            fecha: '24/03/2025',
            bimestre: 1,
            contenido: 'Avance parcial. Se realizó la primera entrega del módulo. El aprendiz mostró compromiso y responsabilidad.',
            archivos: [
              { id: 10, nombre: 'Entrega_Modulo1.pdf', tipo: 'application/pdf', tamaño: '2.3 MB' }
            ]
          },
          {
            id: 7,
            titulo: 'Semana 4 - Entrega',
            fecha: '31/03/2025',
            bimestre: 1,
            contenido: 'Entrega 1 completada. Pendiente de revisión. El aprendiz cumplió con los plazos establecidos.',
            archivos: []
          },
          {
            id: 8,
            titulo: 'Semana 6 - Desarrollo',
            fecha: '14/04/2025',
            bimestre: 2,
            contenido: 'El aprendiz ha mostrado un avance significativo en el desarrollo de sus competencias. Se destaca por su iniciativa y creatividad.',
            archivos: [
              { id: 11, nombre: 'Informe_Desarrollo.pdf', tipo: 'application/pdf', tamaño: '1.7 MB' },
              { id: 12, nombre: 'Evidencias_Desarrollo.pptx', tipo: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', tamaño: '4.5 MB' }
            ]
          }
        ]
      },
      {
        id: 3,
        nombre: 'Maria Camila Torres',
        documento: '1003456789',
        bitacoras: [
          {
            id: 9,
            titulo: 'Semana 2 - Inicio',
            fecha: '17/03/2025',
            bimestre: 1,
            contenido: 'Inicio de actividades en el área de desarrollo. La aprendiz mostró interés y disposición para aprender.',
            archivos: [
              { id: 13, nombre: 'Guia_Inicio.pdf', tipo: 'application/pdf', tamaño: '0.6 MB' }
            ]
          },
          {
            id: 10,
            titulo: 'Semana 5 - Capacitación',
            fecha: '07/04/2025',
            bimestre: 2,
            contenido: 'Capacitación en herramientas internas. La aprendiz demostró habilidades para el manejo de nuevas herramientas.',
            archivos: [
              { id: 14, nombre: 'Capacitacion_Herramientas.pdf', tipo: 'application/pdf', tamaño: '1.1 MB' },
              { id: 15, nombre: 'Certificado_Capacitacion.pdf', tipo: 'application/pdf', tamaño: '0.4 MB' }
            ]
          }
        ]
      }
    ]
  },

  // ============================================================
  // FICHA 2875902 - Gestión Empresarial
  // ============================================================
  '2875902': {
    id: '2875902',
    programa: 'Gestión Empresarial',
    instructor: 'Ana María Pérez',
    aprendices: [
      {
        id: 4,
        nombre: 'Carlos Mendoza',
        documento: '1004567890',
        bitacoras: [
          {
            id: 11,
            titulo: 'Semana 1 - Inducción',
            fecha: '10/03/2025',
            bimestre: 1,
            contenido: 'Inducción general. Se presentaron los objetivos de la etapa productiva y las normas de la empresa.',
            archivos: [
              { id: 16, nombre: 'Induccion_Empresa.pdf', tipo: 'application/pdf', tamaño: '0.9 MB' },
              { id: 17, nombre: 'Normas_Internas.pdf', tipo: 'application/pdf', tamaño: '0.7 MB' }
            ]
          },
          {
            id: 12,
            titulo: 'Semana 4 - Gestión',
            fecha: '31/03/2025',
            bimestre: 1,
            contenido: 'Avance del 50% en el proyecto. Se recomienda refuerzo en herramientas de gestión.',
            archivos: [
              { id: 18, nombre: 'Informe_Gestion.pdf', tipo: 'application/pdf', tamaño: '1.8 MB' },
              { id: 19, nombre: 'Excel_Avance.xlsx', tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', tamaño: '0.4 MB' }
            ]
          }
        ]
      },
      {
        id: 5,
        nombre: 'Valentina Rojas',
        documento: '1005678901',
        bitacoras: [
          {
            id: 13,
            titulo: 'Semana 2 - Análisis',
            fecha: '17/03/2025',
            bimestre: 1,
            contenido: 'Análisis de procesos. La aprendiz mostró habilidades para identificar áreas de mejora.',
            archivos: [
              { id: 20, nombre: 'Analisis_Procesos.pdf', tipo: 'application/pdf', tamaño: '1.3 MB' }
            ]
          },
          {
            id: 14,
            titulo: 'Semana 6 - Implementación',
            fecha: '14/04/2025',
            bimestre: 2,
            contenido: 'Implementación de mejoras. La aprendiz lideró el equipo de trabajo con éxito.',
            archivos: [
              { id: 21, nombre: 'Implementacion_Mejoras.pdf', tipo: 'application/pdf', tamaño: '2.5 MB' },
              { id: 22, nombre: 'Fotos_Implementacion.jpg', tipo: 'image/jpeg', tamaño: '5.2 MB' }
            ]
          }
        ]
      },
      {
        id: 6,
        nombre: 'Andrés Felipe Castro',
        documento: '1006789012',
        bitacoras: [
          {
            id: 15,
            titulo: 'Semana 3 - Proyecto',
            fecha: '24/03/2025',
            bimestre: 1,
            contenido: 'Inicio del proyecto. El aprendiz presentó su propuesta y recibió retroalimentación positiva.',
            archivos: [
              { id: 23, nombre: 'Propuesta_Proyecto.pdf', tipo: 'application/pdf', tamaño: '0.8 MB' }
            ]
          }
        ]
      }
    ]
  },

  // ============================================================
  // FICHA 2875903 - Contabilidad y Finanzas
  // ============================================================
  '2875903': {
    id: '2875903',
    programa: 'Contabilidad y Finanzas',
    instructor: 'Pedro Gómez',
    aprendices: [
      {
        id: 7,
        nombre: 'Luisa Fernanda Gomez',
        documento: '1007890123',
        bitacoras: [
          {
            id: 16,
            titulo: 'Semana 1 - Inducción',
            fecha: '10/03/2025',
            bimestre: 1,
            contenido: 'Inducción al área de contabilidad. La aprendiz mostró interés en los procesos contables.',
            archivos: [
              { id: 24, nombre: 'Induccion_Contabilidad.pdf', tipo: 'application/pdf', tamaño: '0.5 MB' }
            ]
          },
          {
            id: 17,
            titulo: 'Semana 5 - Finanzas',
            fecha: '07/04/2025',
            bimestre: 2,
            contenido: 'Análisis financiero completado. La aprendiz demostró habilidades para el manejo de datos financieros.',
            archivos: [
              { id: 25, nombre: 'Analisis_Financiero.pdf', tipo: 'application/pdf', tamaño: '2.1 MB' },
              { id: 26, nombre: 'Excel_Financiero.xlsx', tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', tamaño: '0.6 MB' },
              { id: 27, nombre: 'Grafico_Resultados.png', tipo: 'image/png', tamaño: '0.3 MB' }
            ]
          }
        ]
      },
      {
        id: 8,
        nombre: 'Santiago Pérez',
        documento: '1008901234',
        bitacoras: [
          {
            id: 18,
            titulo: 'Semana 2 - Inicio',
            fecha: '17/03/2025',
            bimestre: 1,
            contenido: 'Inicio de actividades. El aprendiz se integró rápidamente al equipo de trabajo.',
            archivos: []
          },
          {
            id: 19,
            titulo: 'Semana 6 - Evaluación',
            fecha: '14/04/2025',
            bimestre: 2,
            contenido: 'Evaluación de desempeño. El aprendiz obtuvo una calificación sobresaliente.',
            archivos: [
              { id: 28, nombre: 'Evaluacion_Desempeno.pdf', tipo: 'application/pdf', tamaño: '0.4 MB' }
            ]
          }
        ]
      }
    ]
  }
};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

// Obtener todas las bitácoras de un aprendiz
export const getBitacorasByAprendiz = (idFicha, aprendizId) => {
  const ficha = bitacorasData[idFicha];
  if (!ficha) return [];
  const aprendiz = ficha.aprendices.find(a => a.id === parseInt(aprendizId));
  return aprendiz ? aprendiz.bitacoras : [];
};

// Obtener todas las bitácoras de una ficha
export const getBitacorasByFicha = (idFicha) => {
  const ficha = bitacorasData[idFicha];
  if (!ficha) return [];
  return ficha.aprendices.flatMap(a => 
    a.bitacoras.map(b => ({
      ...b,
      aprendiz: a.nombre,
      aprendizId: a.id,
      documento: a.documento
    }))
  );
};

// Obtener archivos de una bitácora específica
export const getArchivosByBitacora = (idFicha, aprendizId, bitacoraId) => {
  const ficha = bitacorasData[idFicha];
  if (!ficha) return [];
  const aprendiz = ficha.aprendices.find(a => a.id === parseInt(aprendizId));
  if (!aprendiz) return [];
  const bitacora = aprendiz.bitacoras.find(b => b.id === parseInt(bitacoraId));
  return bitacora ? bitacora.archivos : [];
};

// Obtener todas las fichas con bitácoras
export const getFichasWithBitacoras = () => {
  return Object.keys(bitacorasData).map(key => ({
    id: key,
    ...bitacorasData[key]
  }));
};

// Obtener resumen de bitácoras por ficha
export const getResumenBitacoras = () => {
  const resumen = {};
  Object.keys(bitacorasData).forEach(key => {
    const ficha = bitacorasData[key];
    const totalBitacoras = ficha.aprendices.reduce((acc, a) => acc + a.bitacoras.length, 0);
    const totalAprendices = ficha.aprendices.length;
    const totalArchivos = ficha.aprendices.reduce((acc, a) => 
      acc + a.bitacoras.reduce((acc2, b) => acc2 + (b.archivos ? b.archivos.length : 0), 0), 0
    );
    resumen[key] = {
      id: key,
      programa: ficha.programa,
      instructor: ficha.instructor,
      totalAprendices,
      totalBitacoras,
      totalArchivos
    };
  });
  return resumen;
};
