// src/data/coordinadorData.jsx

// ==========================================================
// 1. FICHAS CON APRENDICES (CON ESTADOS Y EMPRESAS)
// ==========================================================
export const fichasData = [
  {
    idFicha: '2875901',
    programa: 'Análisis y Desarrollo de Software',
    totalAprendices: 28,
    aprendices: [
      { 
        nombre: 'Laura Sofia Martinez', 
        id: 'AP-001', 
        documento: '1001234567', // ✅ Número de cédula
        estado: 'En formación', 
        empresa: 'TechSoft S.A.S.', 
        arl: 'SURA' 
      },
      { 
        nombre: 'Juan Diego Ramirez', 
        id: 'AP-002', 
        documento: '1002345678', // ✅ Número de cédula
        estado: 'Condicionado', 
        empresa: 'Innovar Solutions', 
        arl: 'Positiva' 
      },
      { 
        nombre: 'Maria Camila Torres', 
        id: 'AP-003', 
        documento: '1003456789', // ✅ Número de cédula
        estado: 'Finalizado', 
        empresa: 'Global Services LTDA', 
        arl: 'Colmena' 
      },
    ]
  },
  {
    idFicha: '2875902',
    programa: 'Gestión Empresarial',
    totalAprendices: 24,
    aprendices: [
      { 
        nombre: 'Carlos Mendoza', 
        id: 'AP-004', 
        documento: '1004567890', // ✅ Número de cédula
        estado: 'En formación', 
        empresa: 'TechSoft S.A.S.', 
        arl: 'SURA' 
      },
      { 
        nombre: 'Valentina Rojas', 
        id: 'AP-005', 
        documento: '1005678901', // ✅ Número de cédula
        estado: 'Condicionado', 
        empresa: 'Innovar Solutions', 
        arl: 'Positiva' 
      },
      { 
        nombre: 'Andrés Felipe Castro', 
        id: 'AP-006', 
        documento: '1006789012', // ✅ Número de cédula
        estado: 'Retirado', 
        empresa: 'Sin asignar', 
        arl: 'Sin asignar' 
      },
    ]
  },
  {
    idFicha: '2875903',
    programa: 'Contabilidad y Finanzas',
    totalAprendices: 32,
    aprendices: [
      { 
        nombre: 'Luisa Fernanda Gomez', 
        id: 'AP-007', 
        documento: '1007890123', // ✅ Número de cédula
        estado: 'En formación', 
        empresa: 'Global Services LTDA', 
        arl: 'Colmena' 
      },
      { 
        nombre: 'Santiago Pérez', 
        id: 'AP-008', 
        documento: '1008901234', // ✅ Número de cédula
        estado: 'Finalizado', 
        empresa: 'TechSoft S.A.S.', 
        arl: 'SURA' 
      },
    ]
  },
];

// ==========================================================
// 2. INSTRUCTORES
// ==========================================================
export const instructoresData = [
  { id: 1, nombre: 'Carlos Andrés López', email: 'carlos@sena.edu.co' },
  { id: 2, nombre: 'Ana María Pérez', email: 'ana@sena.edu.co' },
  { id: 3, nombre: 'Pedro Gómez', email: 'pedro@sena.edu.co' },
];

// ==========================================================
// 3. FICHAS ASIGNADAS A CADA INSTRUCTOR
// ==========================================================
export const fichasAsignadas = {
  '1': ['2875901', '2875902'],
  '2': ['2875901'],
  '3': ['2875903'],
};

// ==========================================================
// 4. EMPRESAS
// ==========================================================
export const empresasData = [
  { id: 1, nombre: 'TechSoft S.A.S.', arl: 'SURA', contactos: '5' },
  { id: 2, nombre: 'Innovar Solutions', arl: 'Positiva', contactos: '3' },
  { id: 3, nombre: 'Global Services LTDA', arl: 'Colmena', contactos: '4' },
];

// ==========================================================
// 5. DATOS COMPARTIDOS
// ==========================================================
export const db = {
  fichas: fichasData,
  fichasAsignadas,
  instructores: instructoresData,
  empresas: empresasData,
};
