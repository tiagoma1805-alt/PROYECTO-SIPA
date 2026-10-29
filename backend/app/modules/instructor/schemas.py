from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime
from typing import Optional, List


# ==================== EMPRESAS ====================
class InstructorEmpresaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    razon_social: str
    nit: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo_contacto: Optional[str] = None
    arl: Optional[str] = None
    aprendices_count: int = 0
    is_active: bool = True


class InstructorEmpresaCreate(BaseModel):
    razon_social: str = Field(..., min_length=3, max_length=200)
    nit: str = Field(..., min_length=5, max_length=20)
    direccion: Optional[str] = Field(None, max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    correo_contacto: Optional[EmailStr] = None
    arl: Optional[str] = Field(None, max_length=100)


class InstructorEmpresaUpdate(BaseModel):
    razon_social: Optional[str] = Field(None, min_length=3, max_length=200)
    nit: Optional[str] = Field(None, min_length=5, max_length=20)
    direccion: Optional[str] = Field(None, max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    correo_contacto: Optional[EmailStr] = None
    arl: Optional[str] = Field(None, max_length=100)


# ==================== CHARLAS ====================
class InstructorCharlaOut(BaseModel):
    id: int
    ficha_id: int
    numero_ficha: Optional[str] = None
    programa: Optional[str] = None
    tipo_charla: Optional[str] = None
    tema: Optional[str] = None
    fecha_programada: Optional[datetime] = None
    duracion_horas: Optional[float] = 2.0
    personas_solicitadas: Optional[int] = 0
    instructor_id: int
    is_active: bool = True


class InstructorCharlaCreate(BaseModel):
    ficha_id: int
    tipo_charla: str = "CHARLA_INICIAL"
    tema: str = Field(..., min_length=3, max_length=200)
    fecha_programada: datetime
    instructor_id: int
    duracion_horas: Optional[float] = 2.0
    personas_solicitadas: Optional[int] = 0


class InstructorCharlaUpdate(BaseModel):
    tema: Optional[str] = Field(None, min_length=3, max_length=200)
    fecha_programada: Optional[datetime] = None
    tipo_charla: Optional[str] = None
    duracion_horas: Optional[float] = None
    personas_solicitadas: Optional[int] = None


# ==================== EVIDENCIAS ====================
class InstructorEvidenciaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    charla_id: int
    tipo: str
    nombre_archivo: str
    ruta_archivo: str
    subido_por: Optional[int] = None
    fecha_subida: Optional[datetime] = None
    is_active: bool = True


    

# ==================== HISTORIAL ====================
class InstructorHistorialOut(BaseModel):
    id: int
    tema: Optional[str] = None
    fecha_programada: Optional[datetime] = None
    tipo_charla: Optional[str] = None
    numero_ficha: Optional[str] = None
    programa: Optional[str] = None
    instructor_id: int
    instructor_nombre: Optional[str] = None
    asistencias_count: int = 0
    evidencias_count: int = 0


    

# ==================== SELECCIÓN DE ALTERNATIVA ====================
class InstructorEmpresaDetalle(BaseModel):
    nombre: Optional[str] = None
    nit: Optional[str] = None
    arl: Optional[str] = None
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    estado: Optional[str] = None


class InstructorAprendizAlternativa(BaseModel):
    proceso_id: int
    aprendiz_id: int
    nombre: str
    alternativa: Optional[str] = None
    empresa: Optional[InstructorEmpresaDetalle] = None


class InstructorFichaAlternativa(BaseModel):
    ficha_id: int
    idFicha: str
    programa: str
    total_aprendices: int
    aprendices: List[InstructorAprendizAlternativa] = []


class InstructorAsignarAlternativaIn(BaseModel):
    proceso_id: int
    modalidad_id: int
    empresa_id: Optional[int] = None
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None