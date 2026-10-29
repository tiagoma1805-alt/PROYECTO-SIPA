from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import Optional, List
import os
from pathlib import Path
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, require_admin, require_role
from app.core.constants import Roles
from app.models import Usuario, Rol
from app.modules.usuarios import schemas, crud

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


# ============================================================
# DASHBOARD DEL APRENDIZ (va PRIMERO para no chocar con /{usuario_id})
# ============================================================
@router.get("/me/dashboard")
def get_my_dashboard(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Dashboard del aprendiz autenticado: proceso, fechas y stats."""
    proceso = db.execute(
        text("""
            SELECT 
                p.id AS proceso_id,
                p.fecha_inicio,
                p.fecha_fin,
                p.estado::text AS estado,
                f.id AS ficha_id,
                f.numero_ficha,
                pf.nombre AS programa,
                e.razon_social AS empresa
            FROM etapa_productiva.procesos_etapa_productiva p
            JOIN etapa_productiva.fichas f ON f.id = p.ficha_id
            LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
            LEFT JOIN etapa_productiva.empresas e ON e.id = p.empresa_id
            WHERE p.aprendiz_id = :aprendiz_id
              AND p.is_active = true
            LIMIT 1
        """),
        {"aprendiz_id": current_user.id},
    ).mappings().first()

    if not proceso:
        return {
            "tiene_proceso": False, "proceso_id": None, "fecha_inicio": None,
            "fecha_fin": None, "estado": None, "ficha": None, "programa": None,
            "empresa": None, "momentos_completados": 0, "bitacoras_subidas": 0,
            "certificado_obtenido": 0, "notificaciones": 0,
        }

    proceso_id = proceso["proceso_id"]

    momentos = db.execute(
        text("SELECT COUNT(*) AS total FROM etapa_productiva.reuniones_seguimiento WHERE proceso_id = :pid AND is_active = true"),
        {"pid": proceso_id},
    ).mappings().first()

    bitacoras = db.execute(
        text("SELECT COUNT(*) AS total FROM etapa_productiva.bitacoras WHERE proceso_id = :pid AND is_active = true"),
        {"pid": proceso_id},
    ).mappings().first()

    certificados = db.execute(
        text("SELECT COUNT(*) AS total FROM etapa_productiva.evidencias_archivos WHERE uploaded_by = :aid AND tipo_documento = 'CERTIFICADO' AND is_active = true"),
        {"aid": current_user.id},
    ).mappings().first()

    notificaciones = db.execute(
        text("SELECT COUNT(*) AS total FROM etapa_productiva.notificaciones_mensajes WHERE destinatario_usuario_id = :aid AND is_active = true"),
        {"aid": current_user.id},
    ).mappings().first()

    return {
        "tiene_proceso": True,
        "proceso_id": proceso_id,
        "fecha_inicio": str(proceso["fecha_inicio"]) if proceso["fecha_inicio"] else None,
        "fecha_fin": str(proceso["fecha_fin"]) if proceso["fecha_fin"] else None,
        "estado": proceso["estado"],
        "ficha": proceso["numero_ficha"],
        "programa": proceso["programa"],
        "empresa": proceso["empresa"],
        "momentos_completados": momentos["total"] if momentos else 0,
        "bitacoras_subidas": bitacoras["total"] if bitacoras else 0,
        "certificado_obtenido": certificados["total"] if certificados else 0,
        "notificaciones": notificaciones["total"] if notificaciones else 0,
    }


# ============================================================
# MIS MOMENTOS DEL APRENDIZ
# ============================================================
@router.get("/me/momentos")
def get_my_momentos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Devuelve los 3 momentos del aprendiz con estado y progreso calculado."""

    proceso = db.execute(
        text("""
            SELECT p.id AS proceso_id, p.fecha_inicio, p.fecha_fin
            FROM etapa_productiva.procesos_etapa_productiva p
            WHERE p.aprendiz_id = :aprendiz_id
              AND p.is_active = true
            LIMIT 1
        """),
        {"aprendiz_id": current_user.id},
    ).mappings().first()

    if not proceso:
        return {
            "momentos": [],
            "resumen": {
                "completos": 0,
                "en_proceso": 0,
                "pendientes": 3,
                "formatos_cargados": 0,
                "formatos_total": 3,
            },
        }

    proceso_id = proceso["proceso_id"]

    reuniones = db.execute(
        text("""
            SELECT 
                r.id,
                r.momento::text AS momento,
                r.fecha_programada,
                r.fecha_realizada,
                r.observaciones,
                r.archivo_f023_url,
                r.evidencia_archivo_id,
                u.nombre || ' ' || u.apellido AS instructor
            FROM etapa_productiva.reuniones_seguimiento r
            LEFT JOIN etapa_productiva.usuarios u ON u.id = r.instructor_id
            WHERE r.proceso_id = :proceso_id
              AND r.is_active = true
            ORDER BY r.momento
        """),
        {"proceso_id": proceso_id},
    ).mappings().all()

    MOMENTOS_INFO = {
        "MOMENTO_1_INICIAL": {
            "nombre": "Momento 1",
            "titulo": "Inducción y Diagnóstico Inicial",
            "descripcion": "Bienvenida al programa, inducción general y diagnóstico de competencias iniciales.",
        },
        "MOMENTO_2_PARCIAL": {
            "nombre": "Momento 2",
            "titulo": "Ejecución y Seguimiento",
            "descripcion": "Desarrollo de actividades formativas, seguimiento y acompañamiento personalizado.",
        },
        "MOMENTO_3_FINAL": {
            "nombre": "Momento 3",
            "titulo": "Evaluación y Cierre",
            "descripcion": "Evaluación final, retroalimentación y cierre del proceso formativo.",
        },
    }

    reuniones_por_momento = {}
    for r in reuniones:
        reuniones_por_momento[r["momento"]] = r

    momentos_out = []
    completos = 0
    en_proceso = 0
    pendientes = 0
    formatos_cargados = 0

    for key in ["MOMENTO_1_INICIAL", "MOMENTO_2_PARCIAL", "MOMENTO_3_FINAL"]:
        info = MOMENTOS_INFO[key]
        r = reuniones_por_momento.get(key)

        if r:
            fecha_prog = r["fecha_programada"]
            fecha_real = r["fecha_realizada"]
            tiene_f023 = bool(r["archivo_f023_url"] or r["evidencia_archivo_id"])

            if fecha_real:
                estado = "Completo"
                progreso = 100
                completos += 1
            elif fecha_prog:
                estado = "En proceso"
                progreso = 50
                en_proceso += 1
            else:
                estado = "Pendiente"
                progreso = 0
                pendientes += 1

            if tiene_f023:
                formatos_cargados += 1

            momentos_out.append({
                "id": r["id"],
                "clave": key,
                "nombre": info["nombre"],
                "titulo": info["titulo"],
                "descripcion": info["descripcion"],
                "estado": estado,
                "fechaInicio": str(fecha_prog) if fecha_prog else None,
                "fechaFin": str(fecha_real) if fecha_real else None,
                "progreso": progreso,
                "formatoCargado": tiene_f023,
                "archivoF023Url": r["archivo_f023_url"],
                "instructor": r["instructor"],
                "observaciones": r["observaciones"],
            })
        else:
            pendientes += 1
            momentos_out.append({
                "id": None,
                "clave": key,
                "nombre": info["nombre"],
                "titulo": info["titulo"],
                "descripcion": info["descripcion"],
                "estado": "Pendiente",
                "fechaInicio": None,
                "fechaFin": None,
                "progreso": 0,
                "formatoCargado": False,
                "archivoF023Url": None,
                "instructor": None,
                "observaciones": None,
            })

    return {
        "momentos": momentos_out,
        "resumen": {
            "completos": completos,
            "en_proceso": en_proceso,
            "pendientes": pendientes,
            "formatos_cargados": formatos_cargados,
            "formatos_total": 3,
        },
    }


# ============================================================
# NOVEDADES DEL APRENDIZ
# ============================================================
@router.get("/me/novedades")
def get_my_novedades(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Devuelve las novedades reportadas por el aprendiz autenticado."""

    proceso = db.execute(
        text("""
            SELECT p.id AS proceso_id
            FROM etapa_productiva.procesos_etapa_productiva p
            WHERE p.aprendiz_id = :aprendiz_id
              AND p.is_active = true
            LIMIT 1
        """),
        {"aprendiz_id": current_user.id},
    ).mappings().first()

    if not proceso:
        return {"novedades": [], "total": 0}

    proceso_id = proceso["proceso_id"]

    novedades = db.execute(
        text("""
            SELECT 
                n.id,
                n.tipo_novedad::text AS tipo_novedad,
                n.fecha_novedad,
                n.descripcion,
                n.documento_soporte_url,
                n.created_at,
                n.is_active
            FROM etapa_productiva.novedades_proceso n
            WHERE n.proceso_id = :proceso_id
              AND n.is_active = true
            ORDER BY n.fecha_novedad DESC, n.created_at DESC
        """),
        {"proceso_id": proceso_id},
    ).mappings().all()

    resultado = []
    for n in novedades:
        archivo_nombre = None
        if n["documento_soporte_url"]:
            archivo_nombre = n["documento_soporte_url"].split("/")[-1]

        resultado.append({
            "id": n["id"],
            "tipo": n["tipo_novedad"],
            "fecha": str(n["fecha_novedad"]) if n["fecha_novedad"] else None,
            "descripcion": n["descripcion"] or "",
            "documento_soporte_url": n["documento_soporte_url"],
            "archivo": archivo_nombre,
            "estado": "Pendiente",
            "created_at": n["created_at"].isoformat() if n["created_at"] else None,
        })

    return {
        "novedades": resultado,
        "total": len(resultado),
    }


# ============================================================
# ENDPOINTS DE ROLES (solo ADMIN)
# ============================================================

@router.get("/roles", response_model=List[schemas.RolOut])
def get_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Obtiene todos los roles del sistema"""
    roles = crud.list_roles(db, skip=skip, limit=limit, search=search)
    return roles


@router.post("/roles", response_model=schemas.RolOut, status_code=status.HTTP_201_CREATED)
def create_rol(
    data: schemas.RolCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo rol"""
    existing = crud.get_rol_by_nombre(db, data.nombre)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre del rol ya existe"
        )
    
    new_rol = crud.create_rol(db, data.model_dump())
    return new_rol


@router.put("/roles/{rol_id}", response_model=schemas.RolOut)
def update_rol(
    rol_id: int,
    data: schemas.RolUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Actualiza un rol"""
    rol = crud.get_rol(db, rol_id)
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado"
        )
    
    update_data = data.model_dump(exclude_unset=True)
    updated_rol = crud.update_rol(db, rol, update_data)
    return updated_rol


@router.delete("/roles/{rol_id}")
def delete_rol(
    rol_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Desactiva un rol"""
    rol = crud.get_rol(db, rol_id)
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado"
        )
    
    usuarios_con_rol = db.query(Usuario).filter(Usuario.rol_id == rol_id).first()
    if usuarios_con_rol:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede desactivar el rol porque tiene usuarios asociados"
        )
    
    crud.soft_delete_rol(db, rol)
    return {"message": "Rol desactivado exitosamente"}


# ============================================================
# 🔥 AVATAR DEL USUARIO (SUBIR FOTO DE PERFIL)
# ============================================================

AVATARS_DIR = Path("uploads/avatars")
AVATARS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_AVATAR_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/me/avatar")
def subir_avatar(
    file: UploadFile = File(..., description="Imagen de perfil"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Sube la foto de perfil del usuario autenticado.
    Guarda el archivo en uploads/avatars/ y actualiza avatar_url en la BD.
    """
    # Validar extensión
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_AVATAR_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Extensión no permitida. Usa: {', '.join(ALLOWED_AVATAR_EXTENSIONS)}"
        )

    # Leer y validar tamaño
    content = file.file.read()
    if len(content) > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La imagen no puede superar los 5 MB"
        )

    # Generar nombre único
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"user_{current_user.id}_{timestamp}{ext}"
    filepath = AVATARS_DIR / filename

    # Guardar archivo físico
    with open(filepath, "wb") as buffer:
        buffer.write(content)

    # Actualizar avatar_url en BD
    avatar_url = f"/uploads/avatars/{filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Avatar actualizado correctamente",
        "avatar_url": avatar_url,
        "usuario_id": current_user.id,
    }


# ============================================================
# ENDPOINTS DE USUARIOS
# ============================================================

@router.get("/me", response_model=schemas.UsuarioOut)
def get_current_user_info(
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene la información del usuario autenticado"""
    return current_user


@router.get("/", response_model=List[schemas.UsuarioOut])
def get_usuarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    rol_id: Optional[int] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR))
):
    """Obtiene lista de usuarios con filtros y paginación"""
    usuarios, total = crud.get_usuarios(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        rol_id=rol_id,
        is_active=is_active
    )
    return usuarios


@router.get("/{usuario_id}", response_model=schemas.UsuarioOut)
def get_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR))
):
    """Obtiene un usuario por su ID"""
    usuario = crud.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return usuario


@router.post("/", response_model=schemas.UsuarioOut, status_code=status.HTTP_201_CREATED)
def create_usuario(
    data: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Crea un nuevo usuario"""
    existing_email = crud.get_usuario_by_email(db, data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    if data.documento_identidad:
        existing_doc = crud.get_usuario_by_documento(db, data.documento_identidad)
        if existing_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El documento ya está registrado"
            )
    
    usuario_data = data.model_dump()
    new_usuario = crud.create_usuario(db, usuario_data)
    return new_usuario


@router.put("/{usuario_id}", response_model=schemas.UsuarioOut)
def update_usuario(
    usuario_id: int,
    data: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza un usuario. Un usuario puede actualizar su propio perfil."""
    # 🔥 Permitir que el usuario actualice su propio perfil
    es_admin = current_user.rol_id == Roles.ADMIN
    es_su_perfil = current_user.id == usuario_id

    if not (es_admin or es_su_perfil):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar este usuario"
        )

    usuario = crud.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    update_data = data.model_dump(exclude_unset=True)
    
    if "email" in update_data:
        existing_email = crud.get_usuario_by_email(db, update_data["email"])
        if existing_email and existing_email.id != usuario_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está en uso"
            )
    
    if "documento_identidad" in update_data and update_data["documento_identidad"]:
        existing_doc = crud.get_usuario_by_documento(db, update_data["documento_identidad"])
        if existing_doc and existing_doc.id != usuario_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El documento ya está en uso"
            )
    
    updated_usuario = crud.update_usuario(db, usuario, update_data)
    return updated_usuario


@router.patch("/{usuario_id}/preferencias")
def update_preferencias(
    usuario_id: int,
    data: schemas.PreferenciasUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza las preferencias de UI del usuario"""
    if usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes modificar las preferencias de otro usuario"
        )
    
    current_user.preferencias_ui = data.preferencias_ui
    db.commit()
    db.refresh(current_user)
    return {"message": "Preferencias actualizadas", "preferencias": current_user.preferencias_ui}


@router.delete("/{usuario_id}")
def delete_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Desactiva un usuario (soft delete)"""
    if usuario_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propio usuario"
        )
    
    usuario = crud.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    crud.delete_usuario(db, usuario)
    return {"message": "Usuario desactivado exitosamente"}


@router.post("/{usuario_id}/activate")
def activate_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Activa un usuario"""
    usuario = crud.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    crud.activate_usuario(db, usuario)
    return {"message": "Usuario activado exitosamente"}


# ============================================================
# ESTADÍSTICAS
# ============================================================

@router.get("/stats/total")
def get_usuarios_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Obtiene estadísticas de usuarios"""
    total = db.query(Usuario).filter(Usuario.is_active == True).count()
    
    por_rol = db.query(
        Usuario.rol_id,
        func.count(Usuario.id)
    ).filter(Usuario.is_active == True).group_by(Usuario.rol_id).all()
    
    roles = {}
    for rol_id, count in por_rol:
        rol = crud.get_rol(db, rol_id)
        roles[rol.nombre if rol else f"Rol {rol_id}"] = count
    
    return {
        "total": total,
        "por_rol": roles,
        "administradores_activos": crud.contar_administradores_activos(db)
    }


# ============================================================
# CARGA MASIVA DE USUARIOS
# ============================================================
import io
from fastapi.responses import StreamingResponse


@router.post("/bulk-upload", response_model=schemas.BulkUploadResponse)
def bulk_upload_usuarios(
    file: UploadFile = File(..., description="Excel (.xlsx) o CSV con usuarios"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Carga masiva de usuarios desde Excel/CSV."""
    if not file.filename.lower().endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no soportado. Use .xlsx, .xls o .csv"
        )

    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo excede el tamano maximo de 10 MB"
        )

    try:
        resultado = crud.bulk_create_usuarios(db, content, file.filename)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    return {
        "message": "Carga masiva completada",
        "filename": file.filename,
        "resultados": resultado,
    }


@router.get("/plantilla/download")
def descargar_plantilla(
    current_user: Usuario = Depends(require_admin)
):
    """Descarga una plantilla Excel con el formato correcto para carga masiva."""
    excel_bytes = crud.generar_plantilla_excel()
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=plantilla_usuarios.xlsx"},
    )