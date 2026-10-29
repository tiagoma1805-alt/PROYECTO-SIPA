from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# AUTENTICACIÓN
# ============================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserInfoResponse(BaseModel):
    """Información del usuario autenticado"""
    id: int
    nombre: str
    apellido: str
    email: str
    rol_id: int
    rol_nombre: Optional[str] = None
    tipo_documento: Optional[str] = None
    documento_identidad: Optional[str] = None
    telefono: Optional[str] = None
    is_active: bool
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    """Solicitud de registro de usuario"""
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    tipo_documento: Optional[str] = None
    documento_identidad: Optional[str] = None
    telefono: Optional[str] = None
    rol_id: int


class PasswordChange(BaseModel):
    password_actual: str
    password_nueva: str = Field(..., min_length=6)


# ============================================================
# USUARIO ACTUAL (/me)
# ============================================================

class UsuarioMe(BaseModel):
    """Información del usuario para el endpoint /me"""
    id: int
    nombre: str
    apellido: str
    email: str
    rol_id: int
    rol_nombre: Optional[str] = None
    tipo_documento: Optional[str] = None
    documento_identidad: Optional[str] = None
    telefono: Optional[str] = None
    is_active: bool
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================
# RECUPERACIÓN DE CONTRASEÑA
# ============================================================

class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetRequestResponse(BaseModel):
    mensaje: str
    codigo_debug: Optional[str] = None


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    codigo: str = Field(..., min_length=6, max_length=6)


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    codigo: str = Field(..., min_length=6, max_length=6)
    nueva_password: str = Field(..., min_length=6)


LoginResponse.model_rebuild()

