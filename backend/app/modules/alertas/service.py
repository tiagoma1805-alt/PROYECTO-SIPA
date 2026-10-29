"""
Servicio de generación automática de alertas por rol.
Se ejecuta al vuelo cuando el usuario pide GET /alertas/pendientes.
"""
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import (
    ProcesoEtapaProductiva, Bitacora, ReunionSeguimiento,
    ChecklistDocumentoProceso, EstadoBitacora, EstadoProceso,
)
from app.modules.alertas import crud as alerta_crud


def generar_alertas_instructor(db: Session, instructor_id: int) -> int:
    """Genera alertas para un instructor específico."""
    count = 0
    hoy = datetime.utcnow().date()

    # 1. Bitácoras ENVIADAS sin revisar +7 días
    hace_7 = datetime.utcnow() - timedelta(days=7)
    bitacoras_pendientes = (
        db.query(Bitacora, ProcesoEtapaProductiva)
        .join(ProcesoEtapaProductiva, Bitacora.proceso_id == ProcesoEtapaProductiva.id)
        .filter(
            Bitacora.is_active == True,
            Bitacora.estado == EstadoBitacora.ENVIADA,
            Bitacora.fecha_envio < hace_7,
            ProcesoEtapaProductiva.instructor_id == instructor_id,
            ProcesoEtapaProductiva.is_active == True,
        ).all()
    )

    for b, p in bitacoras_pendientes:
        clave = f"inst_bitacora_pend_{b.id}_{hoy}"
        if alerta_crud.crear_alerta(
            db,
            titulo=f"Bitácora #{b.numero_bitacora} sin revisar",
            mensaje=f"{p.aprendiz_nombre or 'Aprendiz'} envió su bitácora hace +7 días. Pendiente de revisión.",
            tipo="ADVERTENCIA",
            categoria="EVALUACION",
            rol_destino="INSTRUCTOR",
            usuario_id=instructor_id,
            aprendiz_id=p.aprendiz_id,
            proceso_id=p.id,
            entidad_relacionada="bitacora",
            entidad_id=b.id,
            clave_unica=clave,
        ):
            count += 1

    # 2. Reuniones de seguimiento próximas (7 días)
    en_7 = datetime.utcnow() + timedelta(days=7)
    reuniones_proximas = (
        db.query(ReunionSeguimiento, ProcesoEtapaProductiva)
        .join(ProcesoEtapaProductiva, ReunionSeguimiento.proceso_id == ProcesoEtapaProductiva.id)
        .filter(
            ReunionSeguimiento.is_active == True,
            ReunionSeguimiento.fecha_realizada.is_(None),
            ReunionSeguimiento.fecha_programada.between(datetime.utcnow(), en_7),
            ProcesoEtapaProductiva.instructor_id == instructor_id,
            ProcesoEtapaProductiva.is_active == True,
        ).all()
    )

    for r, p in reuniones_proximas:
        clave = f"inst_reunion_prox_{r.id}_{hoy}"
        momento_txt = r.momento.replace("_", " ") if r.momento else "Reunión"
        if alerta_crud.crear_alerta(
            db,
            titulo="Reunión de seguimiento próxima",
            mensaje=f"{momento_txt} con {p.aprendiz_nombre or 'aprendiz'} el {r.fecha_programada.date()}.",
            tipo="INFO",
            categoria="REUNIONES",
            rol_destino="INSTRUCTOR",
            usuario_id=instructor_id,
            aprendiz_id=p.aprendiz_id,
            proceso_id=p.id,
            entidad_relacionada="reunion",
            entidad_id=r.id,
            clave_unica=clave,
        ):
            count += 1

    # 3. Procesos por finalizar (15 días)
    en_15 = hoy + timedelta(days=15)
    procesos_prox = db.query(ProcesoEtapaProductiva).filter(
        ProcesoEtapaProductiva.is_active == True,
        ProcesoEtapaProductiva.estado == EstadoProceso.ACTIVO,
        ProcesoEtapaProductiva.instructor_id == instructor_id,
        ProcesoEtapaProductiva.fecha_fin.between(hoy, en_15),
    ).all()

    for p in procesos_prox:
        clave = f"inst_prox_fin_{p.id}_{hoy}"
        if alerta_crud.crear_alerta(
            db,
            titulo="Aprendiz próximo a finalizar",
            mensaje=f"{p.aprendiz_nombre or 'Aprendiz'} finaliza etapa productiva el {p.fecha_fin}.",
            tipo="ADVERTENCIA",
            categoria="PLAZOS",
            rol_destino="INSTRUCTOR",
            usuario_id=instructor_id,
            aprendiz_id=p.aprendiz_id,
            proceso_id=p.id,
            entidad_relacionada="proceso",
            entidad_id=p.id,
            clave_unica=clave,
        ):
            count += 1

    # 4. Aprendices sin bitácora +30 días
    hace_30 = datetime.utcnow() - timedelta(days=30)
    procesos_activos = db.query(ProcesoEtapaProductiva).filter(
        ProcesoEtapaProductiva.is_active == True,
        ProcesoEtapaProductiva.estado == EstadoProceso.ACTIVO,
        ProcesoEtapaProductiva.instructor_id == instructor_id,
    ).all()

    for p in procesos_activos:
        ultima = db.query(func.max(Bitacora.created_at)).filter(
            Bitacora.proceso_id == p.id,
            Bitacora.is_active == True,
        ).scalar()

        if ultima is None or ultima < hace_30:
            clave = f"inst_sin_bitacora_{p.id}_{hoy.strftime('%Y-%W')}"
            if alerta_crud.crear_alerta(
                db,
                titulo="Aprendiz sin bitácora reciente",
                mensaje=f"{p.aprendiz_nombre or 'Aprendiz'} lleva +30 días sin registrar bitácora.",
                tipo="URGENTE",
                categoria="BITACORAS",
                rol_destino="INSTRUCTOR",
                usuario_id=instructor_id,
                aprendiz_id=p.aprendiz_id,
                proceso_id=p.id,
                entidad_relacionada="proceso",
                entidad_id=p.id,
                clave_unica=clave,
            ):
                count += 1

    return count


def generar_alertas_aprendiz(db: Session, aprendiz_id: int) -> int:
    """Genera alertas para un aprendiz específico."""
    count = 0
    hoy = datetime.utcnow().date()
    mes_actual = hoy.strftime("%Y-%m")

    procesos = db.query(ProcesoEtapaProductiva).filter(
        ProcesoEtapaProductiva.is_active == True,
        ProcesoEtapaProductiva.estado == EstadoProceso.ACTIVO,
        ProcesoEtapaProductiva.aprendiz_id == aprendiz_id,
    ).all()

    for p in procesos:
        # Sin bitácora del mes (a partir del día 25)
        if hoy.day >= 25:
            bitacora_mes = db.query(Bitacora).filter(
                Bitacora.proceso_id == p.id,
                Bitacora.periodo_reportado == mes_actual,
                Bitacora.is_active == True,
            ).first()
            if not bitacora_mes:
                clave = f"apz_bitacora_mes_{p.id}_{mes_actual}"
                if alerta_crud.crear_alerta(
                    db,
                    titulo="Bitácora del mes pendiente",
                    mensaje=f"Aún no has subido la bitácora de {mes_actual}.",
                    tipo="URGENTE",
                    categoria="BITACORAS",
                    rol_destino="APRENDIZ",
                    usuario_id=aprendiz_id,
                    aprendiz_id=aprendiz_id,
                    proceso_id=p.id,
                    entidad_relacionada="proceso",
                    entidad_id=p.id,
                    clave_unica=clave,
                ):
                    count += 1

        # Bitácoras con observaciones sin corregir
        con_obs = db.query(Bitacora).filter(
            Bitacora.proceso_id == p.id,
            Bitacora.estado == EstadoBitacora.CON_OBSERVACIONES,
            Bitacora.is_active == True,
        ).all()

        for b in con_obs:
            clave = f"apz_bitacora_obs_{b.id}"
            if alerta_crud.crear_alerta(
                db,
                titulo=f"Bitácora #{b.numero_bitacora} con observaciones",
                mensaje="Revisa las observaciones del instructor y corrige.",
                tipo="ADVERTENCIA",
                categoria="BITACORAS",
                rol_destino="APRENDIZ",
                usuario_id=aprendiz_id,
                aprendiz_id=aprendiz_id,
                proceso_id=p.id,
                entidad_relacionada="bitacora",
                entidad_id=b.id,
                clave_unica=clave,
            ):
                count += 1

        # Documentos pendientes
        pendientes = db.query(ChecklistDocumentoProceso).filter(
            ChecklistDocumentoProceso.proceso_id == p.id,
            ChecklistDocumentoProceso.estado == "PENDIENTE",
            ChecklistDocumentoProceso.is_active == True,
        ).count()
        if pendientes > 0:
            clave = f"apz_checklist_{p.id}_{hoy.strftime('%Y-%W')}"
            if alerta_crud.crear_alerta(
                db,
                titulo="Documentos pendientes",
                mensaje=f"Tienes {pendientes} documentos pendientes por subir.",
                tipo="ADVERTENCIA",
                categoria="DOCUMENTOS",
                rol_destino="APRENDIZ",
                usuario_id=aprendiz_id,
                aprendiz_id=aprendiz_id,
                proceso_id=p.id,
                entidad_relacionada="proceso",
                entidad_id=p.id,
                clave_unica=clave,
            ):
                count += 1

    return count


def generar_alertas_por_usuario(db: Session, usuario) -> int:
    """Punto de entrada: genera alertas según el rol del usuario."""
    from app.core.constants import Roles

    if usuario.rol_id == Roles.INSTRUCTOR:
        return generar_alertas_instructor(db, usuario.id)
    elif usuario.rol_id == Roles.APRENDIZ:
        return generar_alertas_aprendiz(db, usuario.id)
    # ADMIN, COORDINADOR, APOYO: agregar reglas después
    return 0