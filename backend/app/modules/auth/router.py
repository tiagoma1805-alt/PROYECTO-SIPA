import os
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
    verify_password,
    get_password_hash,
)
from app.models import Usuario, Rol
from app.modules.auth import schemas, crud

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_usuario_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    rol_nombre = None
    if user.rol_id:
        rol = db.query(Rol).filter(Rol.id == user.rol_id).first()
        if rol:
            rol_nombre = rol.nombre

    tipo_doc = user.tipo_documento
    if hasattr(tipo_doc, "value"):
        tipo_doc = tipo_doc.value

    token = create_access_token(data={"sub": user.email, "rol_id": user.rol_id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "email": user.email,
            "rol_id": user.rol_id,
            "rol_nombre": rol_nombre,
            "tipo_documento": tipo_doc,
            "documento_identidad": user.documento_identidad,
            "telefono": user.telefono,
            "is_active": user.is_active,
            "avatar_url": getattr(user, "avatar_url", None),
        },
    }


@router.get("/me")
def obtener_usuario_actual(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    rol_nombre = None
    if current_user.rol_id:
        rol = db.query(Rol).filter(Rol.id == current_user.rol_id).first()
        if rol:
            rol_nombre = rol.nombre

    tipo_doc = current_user.tipo_documento
    if hasattr(tipo_doc, "value"):
        tipo_doc = tipo_doc.value

    return {
        "id": current_user.id,
        "nombre": current_user.nombre,
        "apellido": current_user.apellido,
        "email": current_user.email,
        "rol_id": current_user.rol_id,
        "rol_nombre": rol_nombre,
        "tipo_documento": tipo_doc,
        "documento_identidad": current_user.documento_identidad,
        "telefono": current_user.telefono,
        "is_active": current_user.is_active,
        "avatar_url": getattr(current_user, "avatar_url", None),
    }


@router.post("/me/avatar")
async def subir_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes")

    contenido = await file.read()
    if len(contenido) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Máximo 5 MB")

    carpeta = "uploads/avatars"
    os.makedirs(carpeta, exist_ok=True)

    extension = os.path.splitext(file.filename)[1] or ".jpg"
    nombre_archivo = f"{current_user.id}_{uuid.uuid4().hex[:8]}{extension}"
    ruta_completa = os.path.join(carpeta, nombre_archivo)

    with open(ruta_completa, "wb") as f:
        f.write(contenido)

    current_user.avatar_url = f"/uploads/avatars/{nombre_archivo}"
    db.commit()
    db.refresh(current_user)

    return {"avatar_url": current_user.avatar_url}


@router.post("/cambiar-password")
def cambiar_password(
    data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if not verify_password(data.password_actual, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    current_user.password_hash = get_password_hash(data.password_nueva)
    db.commit()
    return {"mensaje": "Contraseña actualizada"}


@router.post("/recuperar-password")
def recuperar_password(data: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    return crud.solicitar_reset_password(db, data.email)


@router.post("/verificar-codigo")
def verificar_codigo(data: schemas.VerifyCodeRequest, db: Session = Depends(get_db)):
    return crud.verificar_codigo_reset(db, data.email, data.codigo)


@router.post("/restablecer-password")
def restablecer_password(data: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    return crud.confirmar_reset_password(db, data.email, data.codigo, data.nueva_password)
