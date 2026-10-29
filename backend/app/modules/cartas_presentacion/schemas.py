from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CartaPresentacionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    proceso_id: int
    coordinador_id: int

    archivo_url: str
    nombre_archivo: Optional[str] = None
    tamano_bytes: Optional[int] = None

    estado: str
    observaciones: Optional[str] = None

    fecha_carga: Optional[datetime] = None
    fecha_aprobacion: Optional[datetime] = None

    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Campos calculados
    aprendiz_id: Optional[int] = None
    aprendiz_nombre: Optional[str] = None
    aprendiz_documento: Optional[str] = None
    ficha_id: Optional[int] = None
    ficha_numero: Optional[str] = None
    programa_nombre: Optional[str] = None
    coordinador_nombre: Optional[str] = None


class CartasListOut(BaseModel):
    cartas: List[CartaPresentacionOut]
    total: int


class ActualizarEstadoCarta(BaseModel):
    estado: str
    observaciones: Optional[str] = None