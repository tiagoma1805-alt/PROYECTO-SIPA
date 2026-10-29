from datetime import datetime
from typing import Optional, List

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import Alerta, Usuario, ProcesoEtapaProductiva
from app.core.constants import Roles


def _rol_a_nombre(rol_id: int) -> Optional[str]:
    """Convierte rol_id numérico a nombre de rol_destino."""
    return {
        Roles.ADMIN: "ADMIN",
        Roles.COORDINADOR: "COORDINADOR",
        Roles.INSTRUCTOR: "INSTRUCTOR",
        Roles.APRENDIZ: "APRENDIZ",
        Roles.APOYO_ADMINISTRATIVO: "APOYO_ADMINISTRATIVO",
    }.get(rol_id)


def get_alerta(db: Session, alerta_id: int) -> Optional[Alerta]:
    return db.query(Alerta).filter(
        Alerta.id == alerta_id,
        Alerta.is_active == True,
    ).first()


def listar_pendientes(db: Session, usuario: Usuario, limit: int = 100) -> List[Alerta]:
    """Alertas PENDIENTES dirigidas al usuario según su rol."""
    rol_nombre = _rol_a_nombre(usuario.rol_id)
    if not rol_nombre:
        return []

    query = db.query(Alerta).filter(
        Alerta.is_active == True,
        Alerta.estado == "PENDIENTE",
        Alerta.rol_destino == rol_nombre,
    )

    # Filtro por pertenencia según rol
    if rol_nombre == "APRENDIZ":
        query = query.filter(
            or_(Alerta.usuario_id == usuario.id, Alerta.aprendiz_id == usuario.id)
        )
    elif rol_nombre == "INSTRUCTOR":
        procesos = db.query(ProcesoEtapaProductiva.id).filter(
            ProcesoEtapaProductiva.instructor_id == usuario.id,
            ProcesoEtapaProductiva.is_active == True,
        ).all()
        proc_ids = [p[0] for p in procesos]
        query = query.filter(
            or_(
                Alerta.usuario_id == usuario.id,
                Alerta.usuario_id.is_(None),
                Alerta.proceso_id.in_(proc_ids) if proc_ids else False,
            )
        )
    elif rol_nombre == "COORDINADOR":
        query = query.filter(
            or_(Alerta.usuario_id == usuario.id, Alerta.usuario_id.is_(None))
        )
    else:
        # ADMIN y APOYO
        query = query.filter(
            or_(Alerta.usuario_id == usuario.id, Alerta.usuario_id.is_(None))
        )

    # No mostrar expiradas
    query = query.filter(
        or_(
            Alerta.fecha_expiracion.is_(None),
            Alerta.fecha_expiracion > datetime.utcnow(),
        )
    )

    return query.order_by(Alerta.created_at.desc()).limit(limit).all()


def listar_resueltas(db: Session, usuario: Usuario, limit: int = 100) -> List[Alerta]:
    """Historial: alertas RESUELTAS del usuario según su rol."""
    rol_nombre = _rol_a_nombre(usuario.rol_id)
    if not rol_nombre:
        return []

    query = db.query(Alerta).filter(
        Alerta.is_active == True,
        Alerta.estado == "RESUELTA",
        Alerta.rol_destino == rol_nombre,
    )

    if rol_nombre == "APRENDIZ":
        query = query.filter(
            or_(Alerta.usuario_id == usuario.id, Alerta.aprendiz_id == usuario.id)
        )
    elif rol_nombre == "INSTRUCTOR":
        procesos = db.query(ProcesoEtapaProductiva.id).filter(
            ProcesoEtapaProductiva.instructor_id == usuario.id,
            ProcesoEtapaProductiva.is_active == True,
        ).all()
        proc_ids = [p[0] for p in procesos]
        query = query.filter(
            or_(
                Alerta.usuario_id == usuario.id,
                Alerta.usuario_id.is_(None),
                Alerta.proceso_id.in_(proc_ids) if proc_ids else False,
            )
        )
    else:
        query = query.filter(
            or_(Alerta.usuario_id == usuario.id, Alerta.usuario_id.is_(None))
        )

    return query.order_by(Alerta.fecha_resolucion.desc()).limit(limit).all()


def contar_pendientes(db: Session, usuario: Usuario) -> int:
    return len(listar_pendientes(db, usuario, limit=9999))


def resolver_alerta(
    db: Session, alerta: Alerta, usuario_id: int, nota: Optional[str] = None
) -> Alerta:
    alerta.estado = "RESUELTA"
    alerta.fecha_resolucion = datetime.utcnow()
    alerta.resuelta_por_id = usuario_id
    alerta.nota_resolucion = nota
    db.commit()
    db.refresh(alerta)
    return alerta


def crear_alerta(
    db: Session,
    *,
    titulo: str,
    mensaje: str,
    tipo: str,
    categoria: str,
    rol_destino: str,
    usuario_id: Optional[int] = None,
    aprendiz_id: Optional[int] = None,
    proceso_id: Optional[int] = None,
    entidad_relacionada: Optional[str] = None,
    entidad_id: Optional[int] = None,
    clave_unica: Optional[str] = None,
) -> Optional[Alerta]:
    """Crea alerta. Si clave_unica ya existe, no la duplica."""
    if clave_unica:
        existente = db.query(Alerta).filter(
            Alerta.clave_unica == clave_unica,
            Alerta.is_active == True,
        ).first()
        if existente:
            return None

    alerta = Alerta(
        titulo=titulo,
        mensaje=mensaje,
        tipo=tipo,
        categoria=categoria,
        rol_destino=rol_destino,
        usuario_id=usuario_id,
        aprendiz_id=aprendiz_id,
        proceso_id=proceso_id,
        entidad_relacionada=entidad_relacionada,
        entidad_id=entidad_id,
        clave_unica=clave_unica,
        estado="PENDIENTE",
    )
    db.add(alerta)
    db.commit()
    db.refresh(alerta)
    return alerta