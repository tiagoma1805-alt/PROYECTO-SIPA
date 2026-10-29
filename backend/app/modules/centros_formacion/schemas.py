# backend/app/modules/centros_formacion/schemas.py
from typing import Optional, List
from pydantic import BaseModel


class CentroFormacionBase(BaseModel):
    codigo: str
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo_contacto: Optional[str] = None


class CentroFormacionCreate(CentroFormacionBase):
    pass


class CentroFormacionResponse(CentroFormacionBase):
    id: int
    is_active: bool
    total_programas: int = 0
    total_fichas: int = 0

    class Config:
        from_attributes = True


class ProgramaDeCentro(BaseModel):
    id: int
    codigo: str
    nombre: str

    class Config:
        from_attributes = True


class CentroConProgramas(CentroFormacionResponse):
    programas: List[ProgramaDeCentro] = []
