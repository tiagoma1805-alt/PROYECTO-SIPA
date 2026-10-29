from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class ObservacionCreate(BaseModel):
    aprendiz_id: int
    instructor_id: int
    texto: str


class ObservacionOut(BaseModel):
    id: int
    aprendiz_id: int
    instructor_id: int
    texto: str
    fecha_creacion: datetime
    instructor_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class AprendizFichaOut(BaseModel):
    proceso_id: int
    aprendiz_id: int
    nombre: str
    documento: Optional[str] = None
    email: Optional[str] = None
    empresa: Optional[str] = None
    arl: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    estado: Optional[str] = None
    observaciones: list[ObservacionOut] = []
