"""
Schemas Pydantic v2 para el mÃ³dulo de Usuarios.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
import re


# ============================================================
# VALIDACIÃ“N DE CONTRASEÃ‘A
# ============================================================
def validar_fortaleza_password(password: str) -> str:
    """
    Valida que la contraseÃ±a cumpla con:
    - MÃ­nimo 8 caracteres
    - Al menos una mayÃºscula
    - Al menos una minÃºscula
    - Al menos un nÃºmero
    - Al menos un carÃ¡cter especial
    """
    if len(password) < 8:
        raise ValueError("La contraseÃ±a debe tener al menos 8 caracteres")
    if not re.search(r'[A-Z]', password):
        raise ValueError("La contraseÃ±a debe tener al menos una mayÃºscula")
    if not re.search(r'[a-z]', password):
        raise ValueError("La contraseÃ±a debe tener al menos una minÃºscula")
    if not re.search(r'\d', password):
        raise ValueError("La contraseÃ±a debe tener al menos un nÃºmero")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-]', password):
        raise ValueError("La contraseÃ±a debe tener al menos un carÃ¡cter especial")
    return password


# ============================================================
# ESQUEMAS DE ROLES
# ============================================================
class RolBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=50)
    descripcion: Optional[str] = Field(None, max_length=255)


class RolCreate(RolBase):
    pass


class RolUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=50)
    descripcion: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class RolOut(RolBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ============================================================
# ESQUEMAS DE USUARIOS
# ============================================================
class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    tipo_documento: Optional[str] = None
    documento_identidad: Optional[str] = Field(None, max_length=20)
    telefono: Optional[str] = Field(None, max_length=20)
    rol_id: int


class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        return validar_fortaleza_password(v)

    @field_validator('tipo_documento')
    @classmethod
    def validate_tipo_documento(cls, v):
        if v is None:
            return v
        permitidos = {'TI', 'CC', 'CE', 'PTE'}
        if v.upper() not in permitidos:
            raise ValueError(f"tipo_documento debe ser uno de: {', '.join(permitidos)}")
        return v.upper()

    @field_validator('email')
    @classmethod
    def email_lower(cls, v):
        return v.lower().strip() if isinstance(v, str) else v


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    apellido: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    tipo_documento: Optional[str] = None
    documento_identidad: Optional[str] = Field(None, max_length=20)
    telefono: Optional[str] = Field(None, max_length=20)
    rol_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)

    @field_validator('password')
    @classmethod
    def validate_password_optional(cls, v):
        if v is None:
            return v
        return validar_fortaleza_password(v)

    @field_validator('email')
    @classmethod
    def email_lower(cls, v):
        return v.lower().strip() if isinstance(v, str) else v


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    email: EmailStr
    tipo_documento: Optional[str] = None
    documento_identidad: Optional[str] = None
    telefono: Optional[str] = None
    avatar_url: Optional[str] = None  # 🔥 NUEVO
    rol_id: int
    is_active: bool
    preferencias_ui: dict = {}
    created_at: datetime
    updated_at: datetime


class UsuarioConRol(UsuarioOut):
    """Usuario con el nombre del rol incluido (para tablas del admin)."""
    rol_nombre: Optional[str] = None


class PreferenciasUpdate(BaseModel):
    preferencias_ui: dict


class UsuarioFilter(BaseModel):
    search: Optional[str] = None
    rol_id: Optional[int] = None
    is_active: Optional[bool] = True
    skip: int = 0
    limit: int = 100


class UsuarioListResponse(BaseModel):
    total: int
    items: List[UsuarioOut]


# ============================================================
# ESQUEMAS DE CARGA MASIVA
# ============================================================
class ErrorFilaBulk(BaseModel):
    fila: int
    error: str
    data: dict


class ResultadoBulkUpload(BaseModel):
    total: int
    exitosos: int
    fallidos: int
    errores: List[ErrorFilaBulk] = []


class BulkUploadResponse(BaseModel):
    message: str
    filename: str
    resultados: ResultadoBulkUpload
