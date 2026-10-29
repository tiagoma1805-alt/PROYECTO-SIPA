// src/core/constants/index.js
// Constantes globales de la aplicación

export * from './roles';

export const ESTADO_FICHA = {
  ACTIVA: 'activa',
  INACTIVA: 'inactiva',
  FINALIZADA: 'finalizada'
};

export const ESTADO_APRENDIZ = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  RETIRADO: 'retirado',
  GRADUADO: 'graduado'
};

export const TIPO_ALTERNATIVA = {
  CONTRATO_APRENDIZAJE: 'Contrato de Aprendizaje',
  VINCULO_FORMATIVO: 'Vínculo Formativo (Pasantía)',
  VINCULO_LABORAL: 'Vínculo Laboral',
  PROYECTO_PRODUCTIVO: 'Proyecto Productivo',
  MONITORIA: 'Monitoria'
};

export const BIMESTRES = {
  BIMESTRE1: 'bimestre1',
  BIMESTRE2: 'bimestre2',
  BIMESTRE3: 'bimestre3',
  BIMESTRE4: 'bimestre4'
};

export const BIMESTRE_LABELS = {
  [BIMESTRES.BIMESTRE1]: '1er Bimestre',
  [BIMESTRES.BIMESTRE2]: '2do Bimestre',
  [BIMESTRES.BIMESTRE3]: '3er Bimestre',
  [BIMESTRES.BIMESTRE4]: '4to Bimestre'
};
