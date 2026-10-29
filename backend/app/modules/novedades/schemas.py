# backend/app/modules/novedades/schemas.py
from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel


class NovedadProcesoResponse(BaseModel):
    id: int
    proceso_id: int
    tipo_novedad: str
    fecha_novedad: Optional[date] = None
    descripcion: str
    documento_soporte_url: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    aprendiz_nombre: Optional[str] = None
    aprendiz_documento: Optional[str] = None
    aprendiz_email: Optional[str] = None
    ficha_numero: Optional[str] = None
    programa_nombre: Optional[str] = None
    instructor_nombre: Optional[str] = None
    centro_codigo: Optional[str] = None

    class Config:
        from_attributes = True


class NovedadDetalleResponse(NovedadProcesoResponse):
    pass


class StatsNovedades(BaseModel):
    total: int
    renuncias: int
    incapacidades: int
    cambio_empresa: int
    prorrogas: int
    otros: int
