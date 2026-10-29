# backend/app/modules/instructores_ep/crud.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

from app.models import (
    Usuario, ProcesoEtapaProductiva, Ficha,
    ProgramaFormacion, ModalidadEP, Empresa
)


def listar_instructores_ep(db: Session, search: Optional[str] = None) -> List[dict]:
    subq = db.query(
        ProcesoEtapaProductiva.instructor_id.label("instructor_id"),
        func.count(distinct(ProcesoEtapaProductiva.id)).label("total_aprendices"),
        func.count(distinct(ProcesoEtapaProductiva.ficha_id)).label("total_fichas"),
    ).filter(
        ProcesoEtapaProductiva.is_active == True
    ).group_by(
        ProcesoEtapaProductiva.instructor_id
    ).subquery()

    query = db.query(
        Usuario.id,
        Usuario.nombre,
        Usuario.apellido,
        Usuario.email,
        Usuario.documento_identidad,
        Usuario.telefono,
        Usuario.avatar_url,
        subq.c.total_aprendices,
        subq.c.total_fichas,
    ).join(
        subq, subq.c.instructor_id == Usuario.id
    ).filter(
        Usuario.is_active == True
    )

    if search:
        q = f"%{search.lower()}%"
        query = query.filter(
            func.lower(Usuario.nombre).like(q) |
            func.lower(Usuario.apellido).like(q) |
            func.lower(Usuario.email).like(q) |
            Usuario.documento_identidad.like(f"%{search}%")
        )

    query = query.order_by(Usuario.nombre, Usuario.apellido)
    resultados = query.all()

    instructores = []
    for row in resultados:
        fichas_ids = db.query(
            distinct(ProcesoEtapaProductiva.ficha_id)
        ).filter(
            ProcesoEtapaProductiva.instructor_id == row.id,
            ProcesoEtapaProductiva.is_active == True,
        ).all()

        fichas_numeros = []
        if fichas_ids:
            fichas_list = [f[0] for f in fichas_ids]
            fichas = db.query(Ficha).filter(Ficha.id.in_(fichas_list)).all()
            fichas_numeros = [f.numero_ficha for f in fichas if f.numero_ficha]

        instructores.append({
            "id": row.id,
            "nombre": row.nombre,
            "apellido": row.apellido,
            "nombre_completo": f"{row.nombre} {row.apellido}".strip(),
            "email": row.email,
            "documento_identidad": row.documento_identidad,
            "telefono": row.telefono,
            "avatar_url": row.avatar_url,
            "total_aprendices": row.total_aprendices or 0,
            "total_fichas": row.total_fichas or 0,
            "fichas": fichas_numeros,
        })

    return instructores


def obtener_detalle_instructor(db: Session, instructor_id: int) -> Optional[dict]:
    instructor = db.query(Usuario).filter(
        Usuario.id == instructor_id,
        Usuario.is_active == True,
    ).first()

    if not instructor:
        return None

    procesos = db.query(ProcesoEtapaProductiva).filter(
        ProcesoEtapaProductiva.instructor_id == instructor_id,
        ProcesoEtapaProductiva.is_active == True,
    ).order_by(ProcesoEtapaProductiva.fecha_inicio.desc()).all()

    aprendices = []
    fichas_set = set()

    for p in procesos:
        aprendiz = db.query(Usuario).filter(Usuario.id == p.aprendiz_id).first()
        if not aprendiz:
            continue

        ficha = db.query(Ficha).filter(Ficha.id == p.ficha_id).first()
        programa = None
        if ficha:
            programa = db.query(ProgramaFormacion).filter(
                ProgramaFormacion.id == ficha.programa_id
            ).first()
            if ficha.numero_ficha:
                fichas_set.add(ficha.numero_ficha)

        modalidad = db.query(ModalidadEP).filter(
            ModalidadEP.id == p.modalidad_id
        ).first() if p.modalidad_id else None

        empresa = db.query(Empresa).filter(
            Empresa.id == p.empresa_id
        ).first() if p.empresa_id else None

        doc = ""
        if aprendiz.documento_identidad:
            tipo = aprendiz.tipo_documento
            tipo_str = tipo.value if hasattr(tipo, 'value') else (tipo or '')
            doc = f"{tipo_str} {aprendiz.documento_identidad}".strip()

        aprendices.append({
            "proceso_id": p.id,
            "aprendiz_id": aprendiz.id,
            "aprendiz_nombre": f"{aprendiz.nombre} {aprendiz.apellido}".strip(),
            "aprendiz_documento": doc or None,
            "aprendiz_email": aprendiz.email,
            "ficha_numero": ficha.numero_ficha if ficha else None,
            "programa_nombre": programa.nombre if programa else None,
            "modalidad_nombre": modalidad.nombre if modalidad else None,
            "empresa_nombre": empresa.razon_social if empresa else None,
            "fecha_inicio": p.fecha_inicio.strftime("%d/%m/%Y") if p.fecha_inicio else None,
            "fecha_fin": p.fecha_fin.strftime("%d/%m/%Y") if p.fecha_fin else None,
        })

    return {
        "id": instructor.id,
        "nombre": instructor.nombre,
        "apellido": instructor.apellido,
        "nombre_completo": f"{instructor.nombre} {instructor.apellido}".strip(),
        "email": instructor.email,
        "documento_identidad": instructor.documento_identidad,
        "telefono": instructor.telefono,
        "avatar_url": instructor.avatar_url,
        "total_aprendices": len(aprendices),
        "total_fichas": len(fichas_set),
        "fichas": sorted(list(fichas_set)),
        "aprendices": aprendices,
    }


def obtener_stats(db: Session) -> dict:
    total_instructores = db.query(
        func.count(distinct(ProcesoEtapaProductiva.instructor_id))
    ).filter(
        ProcesoEtapaProductiva.is_active == True
    ).scalar() or 0

    total_aprendices = db.query(
        func.count(distinct(ProcesoEtapaProductiva.id))
    ).filter(
        ProcesoEtapaProductiva.is_active == True
    ).scalar() or 0

    total_fichas = db.query(
        func.count(distinct(ProcesoEtapaProductiva.ficha_id))
    ).filter(
        ProcesoEtapaProductiva.is_active == True
    ).scalar() or 0

    return {
        "total_instructores": total_instructores,
        "total_aprendices": total_aprendices,
        "total_fichas": total_fichas,
    }
