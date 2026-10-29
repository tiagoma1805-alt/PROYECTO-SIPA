# backend/app/modules/instructores_ep/schemas.py
from typing import Optional, List
from pydantic import BaseModel


class AprendizACargo(BaseModel):
    proceso_id: int
    aprendiz_id: int
    aprendiz_nombre: str
    aprendiz_documento: Optional[str] = None
    aprendiz_email: Optional[str] = None
    ficha_numero: Optional[str] = None
    programa_nombre: Optional[str] = None
    modalidad_nombre: Optional[str] = None
    empresa_nombre: Optional[str] = None
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None

    class Config:
        from_attributes = True


class InstructorEPResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    nombre_completo: str
    email: str
    documento_identidad: Optional[str] = None
    telefono: Optional[str] = None
    avatar_url: Optional[str] = None
    total_aprendices: int
    total_fichas: int
    fichas: List[str] = []
    aprendices: List[AprendizACargo] = []


class InstructorEPResumen(BaseModel):
    id: int
    nombre: str
    apellido: str
    nombre_completo: str
    email: str
    documento_identidad: Optional[str] = None
    telefono: Optional[str] = None
    avatar_url: Optional[str] = None
    total_aprendices: int
    total_fichas: int
    fichas: List[str] = []


class StatsInstructoresEP(BaseModel):
    total_instructores: int
    total_aprendices: int
    total_fichas: int
