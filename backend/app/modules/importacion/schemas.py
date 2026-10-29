# backend/app/modules/importacion/schemas.py
from typing import List, Optional
from pydantic import BaseModel, Field


class RowError(BaseModel):
    """Detalle de error para una fila específica."""
    fila: int = Field(..., description="Número de fila en el archivo")
    mensaje: str = Field(..., description="Descripción del error")
    datos: Optional[dict] = Field(None, description="Datos de la fila con error")


class FilaConAdvertencia(BaseModel):
    """Detalle de una fila cargada con advertencia (ej: CONDICIONADO)."""
    fila: int = Field(..., description="Número de fila en el archivo")
    documento: Optional[str] = Field(None, description="Documento del aprendiz")
    email: Optional[str] = Field(None, description="Email del aprendiz")
    nombre: Optional[str] = Field(None, description="Nombre del aprendiz")
    estado: str = Field(..., description="Estado del aprendiz")
    mensaje: str = Field(..., description="Mensaje de advertencia")


class FilaRechazada(BaseModel):
    """Detalle de una fila rechazada por estado no válido."""
    fila: int = Field(..., description="Número de fila en el archivo")
    documento: Optional[str] = Field(None, description="Documento del aprendiz")
    email: Optional[str] = Field(None, description="Email del aprendiz")
    nombre: Optional[str] = Field(None, description="Nombre del aprendiz")
    estado: Optional[str] = Field(None, description="Estado del aprendiz")
    motivo: str = Field(..., description="Motivo del rechazo")


class ImportResult(BaseModel):
    """Resultado de una operación de importación masiva."""
    total_filas: int = Field(..., description="Total de filas procesadas")
    filas_insertadas: int = Field(..., description="Filas insertadas correctamente")
    filas_con_error: int = Field(..., description="Filas con error")
    errores: List[RowError] = Field(default_factory=list, description="Lista detallada de errores")

    # 🔥 NUEVOS campos para validación de estado
    filas_con_advertencia: int = Field(0, description="Filas cargadas con advertencia (CONDICIONADO)")
    filas_rechazadas: int = Field(0, description="Filas rechazadas por estado no válido")
    detalle_advertencias: List[FilaConAdvertencia] = Field(
        default_factory=list,
        description="Detalle de las filas con advertencia"
    )
    detalle_rechazadas: List[FilaRechazada] = Field(
        default_factory=list,
        description="Detalle de las filas rechazadas"
    )