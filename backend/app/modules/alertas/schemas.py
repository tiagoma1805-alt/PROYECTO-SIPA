from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class AlertaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    mensaje: str
    tipo: str
    categoria: str
    estado: str
    rol_destino: str
    usuario_id: Optional[int] = None
    aprendiz_id: Optional[int] = None
    proceso_id: Optional[int] = None
    entidad_relacionada: Optional[str] = None
    entidad_id: Optional[int] = None
    fecha_resolucion: Optional[datetime] = None
    nota_resolucion: Optional[str] = None
    created_at: datetime


class AlertasListOut(BaseModel):
    alertas: List[AlertaOut]
    pendientes: int
    total: int


class ContadorOut(BaseModel):
    pendientes: int


class ResolverAlertaIn(BaseModel):
    nota: Optional[str] = None