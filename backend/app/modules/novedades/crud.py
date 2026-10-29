# backend/app/modules/novedades/crud.py
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import (
    NovedadProceso, ProcesoEtapaProductiva, Usuario, Ficha,
    ProgramaFormacion, CentroFormacion
)


def _serializar_novedad(db: Session, novedad: NovedadProceso) -> dict:
    proceso = db.query(ProcesoEtapaProductiva).filter(
        ProcesoEtapaProductiva.id == novedad.proceso_id
    ).first()

    aprendiz_nombre = None
    aprendiz_documento = None
    aprendiz_email = None
    ficha_numero = None
    programa_nombre = None
    instructor_nombre = None
    centro_codigo = None

    if proceso:
        aprendiz = db.query(Usuario).filter(Usuario.id == proceso.aprendiz_id).first()
        if aprendiz:
            aprendiz_nombre = f"{aprendiz.nombre} {aprendiz.apellido}".strip()
            aprendiz_email = aprendiz.email
            if aprendiz.documento_identidad:
                tipo = aprendiz.tipo_documento
                tipo_str = tipo.value if hasattr(tipo, 'value') else (tipo or '')
                aprendiz_documento = f"{tipo_str} {aprendiz.documento_identidad}".strip()

        ficha = db.query(Ficha).filter(Ficha.id == proceso.ficha_id).first()
        if ficha:
            ficha_numero = ficha.numero_ficha
            programa = db.query(ProgramaFormacion).filter(
                ProgramaFormacion.id == ficha.programa_id
            ).first()
            if programa:
                programa_nombre = programa.nombre
                if programa.centro_formacion_id:
                    centro = db.query(CentroFormacion).filter(
                        CentroFormacion.id == programa.centro_formacion_id
                    ).first()
                    if centro:
                        centro_codigo = centro.codigo

        if proceso.instructor_id:
            instructor = db.query(Usuario).filter(Usuario.id == proceso.instructor_id).first()
            if instructor:
                instructor_nombre = f"{instructor.nombre} {instructor.apellido}".strip()

    tipo_novedad = novedad.tipo_novedad
    tipo_str = tipo_novedad.value if hasattr(tipo_novedad, 'value') else str(tipo_novedad)

    return {
        "id": novedad.id,
        "proceso_id": novedad.proceso_id,
        "tipo_novedad": tipo_str,
        "fecha_novedad": novedad.fecha_novedad,
        "descripcion": novedad.descripcion,
        "documento_soporte_url": novedad.documento_soporte_url,
        "is_active": novedad.is_active,
        "created_at": novedad.created_at,
        "aprendiz_nombre": aprendiz_nombre,
        "aprendiz_documento": aprendiz_documento,
        "aprendiz_email": aprendiz_email,
        "ficha_numero": ficha_numero,
        "programa_nombre": programa_nombre,
        "instructor_nombre": instructor_nombre,
        "centro_codigo": centro_codigo,
    }


def listar_novedades(
    db: Session,
    search: Optional[str] = None,
    tipo: Optional[str] = None,
) -> List[dict]:
    query = db.query(NovedadProceso).filter(NovedadProceso.is_active == True)

    if tipo:
        query = query.filter(NovedadProceso.tipo_novedad == tipo)

    novedades = query.order_by(NovedadProceso.fecha_novedad.desc()).all()

    resultado = [_serializar_novedad(db, n) for n in novedades]

    if search:
        q = search.lower()
        resultado = [
            r for r in resultado
            if (r.get("aprendiz_nombre") and q in r["aprendiz_nombre"].lower())
            or (r.get("ficha_numero") and q in str(r["ficha_numero"]).lower())
            or (r.get("descripcion") and q in r["descripcion"].lower())
        ]

    return resultado


def obtener_novedad(db: Session, novedad_id: int) -> Optional[dict]:
    novedad = db.query(NovedadProceso).filter(
        NovedadProceso.id == novedad_id
    ).first()
    if not novedad:
        return None
    return _serializar_novedad(db, novedad)


def obtener_stats(db: Session) -> dict:
    base = db.query(NovedadProceso).filter(NovedadProceso.is_active == True)

    return {
        "total": base.count(),
        "renuncias": base.filter(NovedadProceso.tipo_novedad == 'RENUNCIA').count(),
        "incapacidades": base.filter(NovedadProceso.tipo_novedad == 'INCAPACIDAD').count(),
        "cambio_empresa": base.filter(NovedadProceso.tipo_novedad == 'CAMBIO_EMPRESA').count(),
        "prorrogas": base.filter(NovedadProceso.tipo_novedad == 'PRORROGA').count(),
        "otros": base.filter(NovedadProceso.tipo_novedad == 'OTRO').count(),
    }
