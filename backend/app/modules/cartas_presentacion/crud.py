from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Session

from app.models import (
    CartaPresentacion,
    ProcesoEtapaProductiva,
    Ficha,
    ProgramaFormacion,
    Usuario,
)


def get_carta(db: Session, carta_id: int) -> Optional[CartaPresentacion]:
    return db.query(CartaPresentacion).filter(
        CartaPresentacion.id == carta_id,
        CartaPresentacion.is_active == True,
    ).first()


def listar_cartas(
    db: Session,
    coordinador_id: Optional[int] = None,
    proceso_id: Optional[int] = None,
    aprendiz_id: Optional[int] = None,
    limit: int = 100,
) -> List[CartaPresentacion]:
    query = db.query(CartaPresentacion).filter(
        CartaPresentacion.is_active == True,
    )

    if coordinador_id:
        query = query.filter(CartaPresentacion.coordinador_id == coordinador_id)

    if proceso_id:
        query = query.filter(CartaPresentacion.proceso_id == proceso_id)

    if aprendiz_id:
        query = query.join(
            ProcesoEtapaProductiva,
            CartaPresentacion.proceso_id == ProcesoEtapaProductiva.id,
        ).filter(ProcesoEtapaProductiva.aprendiz_id == aprendiz_id)

    return query.order_by(CartaPresentacion.fecha_carga.desc()).limit(limit).all()


def crear_carta(
    db: Session,
    proceso_id: int,
    coordinador_id: int,
    archivo_url: str,
    nombre_archivo: str,
    tamano_bytes: int,
) -> CartaPresentacion:
    carta = CartaPresentacion(
        proceso_id=proceso_id,
        coordinador_id=coordinador_id,
        archivo_url=archivo_url,
        nombre_archivo=nombre_archivo,
        tamano_bytes=tamano_bytes,
        estado="CARGADA",
    )
    db.add(carta)
    db.commit()
    db.refresh(carta)
    return carta


def actualizar_estado(
    db: Session,
    carta: CartaPresentacion,
    estado: str,
    observaciones: Optional[str] = None,
) -> CartaPresentacion:
    carta.estado = estado
    carta.observaciones = observaciones
    if estado == "APROBADA":
        carta.fecha_aprobacion = datetime.utcnow()
    db.commit()
    db.refresh(carta)
    return carta


def eliminar_carta(db: Session, carta: CartaPresentacion) -> None:
    carta.is_active = False
    carta.deleted_at = datetime.utcnow()
    db.commit()


def serializar_carta(db: Session, carta: CartaPresentacion) -> dict:
    """Enriquece la carta con datos del proceso, aprendiz, ficha, programa."""
    proceso = db.query(ProcesoEtapaProductiva).filter(
        ProcesoEtapaProductiva.id == carta.proceso_id
    ).first()

    aprendiz_nombre = None
    aprendiz_documento = None
    ficha_numero = None
    programa_nombre = None

    if proceso:
        aprendiz = db.query(Usuario).filter(Usuario.id == proceso.aprendiz_id).first()
        if aprendiz:
            aprendiz_nombre = f"{aprendiz.nombre} {aprendiz.apellido}".strip()
            aprendiz_documento = aprendiz.documento_identidad

        ficha = db.query(Ficha).filter(Ficha.id == proceso.ficha_id).first()
        if ficha:
            ficha_numero = ficha.numero_ficha
            programa = db.query(ProgramaFormacion).filter(
                ProgramaFormacion.id == ficha.programa_id
            ).first()
            if programa:
                programa_nombre = programa.nombre

    coordinador = db.query(Usuario).filter(Usuario.id == carta.coordinador_id).first()
    coordinador_nombre = f"{coordinador.nombre} {coordinador.apellido}".strip() if coordinador else None

    return {
        "id": carta.id,
        "proceso_id": carta.proceso_id,
        "coordinador_id": carta.coordinador_id,
        "archivo_url": carta.archivo_url,
        "nombre_archivo": carta.nombre_archivo,
        "tamano_bytes": carta.tamano_bytes,
        "estado": carta.estado.value if hasattr(carta.estado, "value") else str(carta.estado),
        "observaciones": carta.observaciones,
        "fecha_carga": carta.fecha_carga,
        "fecha_aprobacion": carta.fecha_aprobacion,
        "is_active": carta.is_active,
        "created_at": carta.created_at,
        "updated_at": carta.updated_at,
        "aprendiz_id": proceso.aprendiz_id if proceso else None,
        "aprendiz_nombre": aprendiz_nombre,
        "aprendiz_documento": aprendiz_documento,
        "ficha_id": proceso.ficha_id if proceso else None,
        "ficha_numero": ficha_numero,
        "programa_nombre": programa_nombre,
        "coordinador_nombre": coordinador_nombre,
    }