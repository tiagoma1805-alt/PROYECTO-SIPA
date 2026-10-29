# backend/app/modules/centros_formacion/crud.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

from app.models import CentroFormacion, ProgramaFormacion, Ficha


def listar_centros(db: Session, solo_activos: bool = True) -> List[dict]:
    query = db.query(CentroFormacion)
    if solo_activos:
        query = query.filter(CentroFormacion.is_active == True)
    centros = query.order_by(CentroFormacion.nombre).all()

    resultado = []
    for c in centros:
        total_programas = db.query(func.count(ProgramaFormacion.id)).filter(
            ProgramaFormacion.centro_formacion_id == c.id,
            ProgramaFormacion.is_active == True,
        ).scalar() or 0

        total_fichas = db.query(func.count(distinct(Ficha.id))).join(
            ProgramaFormacion, ProgramaFormacion.id == Ficha.programa_id
        ).filter(
            ProgramaFormacion.centro_formacion_id == c.id,
            Ficha.is_active == True,
        ).scalar() or 0

        resultado.append({
            "id": c.id,
            "codigo": c.codigo,
            "nombre": c.nombre,
            "direccion": c.direccion,
            "telefono": c.telefono,
            "correo_contacto": c.correo_contacto,
            "is_active": c.is_active,
            "total_programas": total_programas,
            "total_fichas": total_fichas,
        })

    return resultado


def obtener_centro_detalle(db: Session, centro_id: int) -> Optional[dict]:
    centro = db.query(CentroFormacion).filter(CentroFormacion.id == centro_id).first()
    if not centro:
        return None

    programas = db.query(ProgramaFormacion).filter(
        ProgramaFormacion.centro_formacion_id == centro_id,
        ProgramaFormacion.is_active == True,
    ).order_by(ProgramaFormacion.nombre).all()

    total_fichas = db.query(func.count(distinct(Ficha.id))).join(
        ProgramaFormacion, ProgramaFormacion.id == Ficha.programa_id
    ).filter(
        ProgramaFormacion.centro_formacion_id == centro_id,
        Ficha.is_active == True,
    ).scalar() or 0

    return {
        "id": centro.id,
        "codigo": centro.codigo,
        "nombre": centro.nombre,
        "direccion": centro.direccion,
        "telefono": centro.telefono,
        "correo_contacto": centro.correo_contacto,
        "is_active": centro.is_active,
        "total_programas": len(programas),
        "total_fichas": total_fichas,
        "programas": [
            {"id": p.id, "codigo": p.codigo, "nombre": p.nombre}
            for p in programas
        ],
    }


def crear_centro(db: Session, data: dict) -> CentroFormacion:
    nuevo = CentroFormacion(
        codigo=data["codigo"].upper().strip(),
        nombre=data["nombre"].strip(),
        direccion=data.get("direccion"),
        telefono=data.get("telefono"),
        correo_contacto=data.get("correo_contacto"),
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo
