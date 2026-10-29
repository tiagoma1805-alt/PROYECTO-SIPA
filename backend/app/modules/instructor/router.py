import os
import shutil
from datetime import datetime as dt
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Usuario, Empresa
from app.modules.instructor.schemas import (
    InstructorEmpresaOut,
    InstructorEmpresaCreate,
    InstructorEmpresaUpdate,
    InstructorCharlaOut,
    InstructorCharlaCreate,
    InstructorCharlaUpdate,
    InstructorEvidenciaOut,
    InstructorHistorialOut,
    InstructorEmpresaDetalle,
    InstructorAprendizAlternativa,
    InstructorFichaAlternativa,
    InstructorAsignarAlternativaIn,
)

router = APIRouter(prefix="/instructor", tags=["Instructor"])


# ============================================================
# EMPRESAS
# ============================================================
@router.get("/empresas/{instructor_id}", response_model=List[InstructorEmpresaOut])
def empresas_del_instructor(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = text("""
        SELECT 
            e.id, e.razon_social, e.nit, e.direccion, e.telefono,
            e.correo_contacto, e.arl, e.is_active,
            COUNT(DISTINCT p.aprendiz_id) AS aprendices_count
        FROM etapa_productiva.procesos_etapa_productiva p
        JOIN etapa_productiva.empresas e ON e.id = p.empresa_id
        WHERE p.instructor_id = :instructor_id
          AND p.is_active = true
          AND e.is_active = true
        GROUP BY e.id, e.razon_social, e.nit, e.direccion, e.telefono,
                 e.correo_contacto, e.arl, e.is_active
        ORDER BY e.razon_social
    """)
    return [dict(r) for r in db.execute(query, {"instructor_id": instructor_id}).mappings().all()]


@router.post("/empresas", response_model=InstructorEmpresaOut, status_code=201)
def crear_empresa_instructor(
    data: InstructorEmpresaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    existe = db.query(Empresa).filter(Empresa.nit == data.nit).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe una empresa con ese NIT")
    nueva = Empresa(
        razon_social=data.razon_social, nit=data.nit,
        direccion=data.direccion, telefono=data.telefono,
        correo_contacto=data.correo_contacto, arl=data.arl, is_active=True,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return {
        "id": nueva.id, "razon_social": nueva.razon_social, "nit": nueva.nit,
        "direccion": nueva.direccion, "telefono": nueva.telefono,
        "correo_contacto": nueva.correo_contacto, "arl": nueva.arl,
        "is_active": nueva.is_active, "aprendices_count": 0,
    }


@router.put("/empresas/{empresa_id}", response_model=InstructorEmpresaOut)
def actualizar_empresa_instructor(
    empresa_id: int,
    data: InstructorEmpresaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    if data.nit and data.nit != empresa.nit:
        existe = db.query(Empresa).filter(Empresa.nit == data.nit).first()
        if existe:
            raise HTTPException(status_code=400, detail="Ya existe otra empresa con ese NIT")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(empresa, key, value)
    db.commit()
    db.refresh(empresa)
    count = db.execute(
        text("""SELECT COUNT(DISTINCT aprendiz_id) AS total
                FROM etapa_productiva.procesos_etapa_productiva
                WHERE empresa_id = :empresa_id AND is_active = true"""),
        {"empresa_id": empresa_id},
    ).mappings().first()
    return {
        "id": empresa.id, "razon_social": empresa.razon_social, "nit": empresa.nit,
        "direccion": empresa.direccion, "telefono": empresa.telefono,
        "correo_contacto": empresa.correo_contacto, "arl": empresa.arl,
        "is_active": empresa.is_active,
        "aprendices_count": count["total"] if count else 0,
    }


@router.delete("/empresas/{empresa_id}", status_code=204)
def eliminar_empresa_instructor(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    activos = db.execute(
        text("""SELECT COUNT(*) AS total FROM etapa_productiva.procesos_etapa_productiva
                WHERE empresa_id = :empresa_id AND is_active = true"""),
        {"empresa_id": empresa_id},
    ).mappings().first()
    if activos and activos["total"] > 0:
        raise HTTPException(status_code=400, detail=f"No se puede eliminar: tiene {activos['total']} aprendiz(es) activo(s)")
    empresa.is_active = False
    db.commit()
    return None


# ============================================================
# CHARLAS
# ============================================================
@router.get("/charlas/{instructor_id}", response_model=List[InstructorCharlaOut])
def charlas_del_instructor(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = text("""
        SELECT 
            c.id, c.ficha_id, f.numero_ficha,
            pf.nombre AS programa,
            c.tipo_charla::text AS tipo_charla,
            c.tema, c.fecha_programada, c.duracion_horas, c.personas_solicitadas, c.instructor_id, c.is_active
        FROM etapa_productiva.charlas c
        JOIN etapa_productiva.fichas f ON f.id = c.ficha_id
        LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
        WHERE c.instructor_id = :instructor_id
          AND c.is_active = true
        ORDER BY c.fecha_programada DESC
    """)
    return [dict(r) for r in db.execute(query, {"instructor_id": instructor_id}).mappings().all()]


@router.post("/charlas", response_model=InstructorCharlaOut, status_code=201)
def crear_charla_instructor(
    data: InstructorCharlaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    try:
        result = db.execute(
            text("""
                INSERT INTO etapa_productiva.charlas
                    (ficha_id, tipo_charla, fecha_programada, instructor_id, tema,
                     duracion_horas, personas_solicitadas, created_by, is_active)
                VALUES 
                    (:ficha_id, CAST(:tipo_charla AS etapa_productiva.tipo_charla_t),
                     :fecha_programada, :instructor_id, :tema,
                     :duracion_horas, :personas_solicitadas,
                     :created_by, true)
                RETURNING id, ficha_id, tipo_charla::text AS tipo_charla,
                          tema, fecha_programada, duracion_horas, personas_solicitadas, instructor_id, is_active
            """),
            {
                "ficha_id": data.ficha_id,
                "tipo_charla": data.tipo_charla,
                "fecha_programada": data.fecha_programada,
                "instructor_id": data.instructor_id,
                "tema": data.tema,
                "duracion_horas": data.duracion_horas or 2.0,
                "personas_solicitadas": data.personas_solicitadas or 0,
                "created_by": current_user.id,
            },
        ).mappings().first()
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear charla: {str(e)}")

    info = db.execute(
        text("""SELECT f.numero_ficha, pf.nombre AS programa
                FROM etapa_productiva.fichas f
                LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
                WHERE f.id = :ficha_id"""),
        {"ficha_id": data.ficha_id},
    ).mappings().first()

    return {
        **dict(result),
        "numero_ficha": info["numero_ficha"] if info else None,
        "programa": info["programa"] if info else None,
    }


@router.put("/charlas/{charla_id}", response_model=InstructorCharlaOut)
def actualizar_charla_instructor(
    charla_id: int,
    data: InstructorCharlaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    charla = db.execute(
        text("SELECT id FROM etapa_productiva.charlas WHERE id = :id AND is_active = true"),
        {"id": charla_id},
    ).mappings().first()
    if not charla:
        raise HTTPException(status_code=404, detail="Charla no encontrada")

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Nada para actualizar")

    set_parts = []
    params = {"id": charla_id}
    for key, value in updates.items():
        if key == "tipo_charla":
            set_parts.append(f"tipo_charla = CAST(:{key} AS etapa_productiva.tipo_charla_t)")
        else:
            set_parts.append(f"{key} = :{key}")
        params[key] = value

    db.execute(
        text(f"UPDATE etapa_productiva.charlas SET {', '.join(set_parts)} WHERE id = :id"),
        params,
    )
    db.commit()

    result = db.execute(
        text("""
            SELECT c.id, c.ficha_id, f.numero_ficha, pf.nombre AS programa,
                   c.tipo_charla::text AS tipo_charla, c.tema, c.fecha_programada,
                   c.duracion_horas, c.personas_solicitadas,
                   c.instructor_id, c.is_active
            FROM etapa_productiva.charlas c
            JOIN etapa_productiva.fichas f ON f.id = c.ficha_id
            LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
            WHERE c.id = :id
        """),
        {"id": charla_id},
    ).mappings().first()
    return dict(result)


@router.delete("/charlas/{charla_id}", status_code=204)
def eliminar_charla_instructor(
    charla_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = db.execute(
        text("""UPDATE etapa_productiva.charlas SET is_active = false
                WHERE id = :id RETURNING id"""),
        {"id": charla_id},
    ).mappings().first()
    db.commit()
    if not result:
        raise HTTPException(status_code=404, detail="Charla no encontrada")
    return None


# ============================================================
# FICHAS DEL INSTRUCTOR
# ============================================================
@router.get("/fichas/{instructor_id}")
def fichas_del_instructor(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = text("""
        SELECT f.id, f.numero_ficha, pf.nombre AS programa
        FROM etapa_productiva.asignaciones_instructor_ficha a
        JOIN etapa_productiva.fichas f ON f.id = a.ficha_id
        LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
        WHERE a.instructor_id = :instructor_id
          AND a.is_active = true
          AND f.is_active = true
        ORDER BY f.numero_ficha
    """)
    return [dict(r) for r in db.execute(query, {"instructor_id": instructor_id}).mappings().all()]


# ============================================================
# EVIDENCIAS DE CHARLAS
# ============================================================
UPLOAD_BASE = "uploads/charlas"


@router.get("/charlas/{charla_id}/evidencias", response_model=List[InstructorEvidenciaOut])
def listar_evidencias_charla(
    charla_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = text("""
        SELECT id, charla_id, tipo, nombre_archivo, ruta_archivo,
               subido_por, fecha_subida, is_active
        FROM etapa_productiva.evidencias_charlas
        WHERE charla_id = :charla_id AND is_active = true
        ORDER BY fecha_subida DESC
    """)
    return [dict(r) for r in db.execute(query, {"charla_id": charla_id}).mappings().all()]


@router.post("/charlas/{charla_id}/evidencias/{tipo}", response_model=InstructorEvidenciaOut, status_code=201)
async def subir_evidencia_charla(
    charla_id: int,
    tipo: str,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    tipo_upper = tipo.upper()
    if tipo_upper not in ("SOPORTE", "LISTADO", "FOTO"):
        raise HTTPException(status_code=400, detail="Tipo invalido")

    charla = db.execute(
        text("SELECT id FROM etapa_productiva.charlas WHERE id = :id AND is_active = true"),
        {"id": charla_id},
    ).mappings().first()
    if not charla:
        raise HTTPException(status_code=404, detail="Charla no encontrada")

    carpeta = os.path.join(UPLOAD_BASE, str(charla_id), tipo_upper.lower() + "s")
    os.makedirs(carpeta, exist_ok=True)

    timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
    nombre_seguro = archivo.filename.replace(" ", "_")
    nombre_final = f"{timestamp}_{nombre_seguro}"
    ruta_completa = os.path.join(carpeta, nombre_final)

    with open(ruta_completa, "wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)

    ruta_publica = "/" + ruta_completa.replace(os.sep, "/")

    result = db.execute(
        text("""
            INSERT INTO etapa_productiva.evidencias_charlas
                (charla_id, tipo, nombre_archivo, ruta_archivo, subido_por, is_active)
            VALUES 
                (:charla_id, :tipo, :nombre_archivo, :ruta_archivo, :subido_por, true)
            RETURNING id, charla_id, tipo, nombre_archivo, ruta_archivo,
                      subido_por, fecha_subida, is_active
        """),
        {
            "charla_id": charla_id,
            "tipo": tipo_upper,
            "nombre_archivo": archivo.filename,
            "ruta_archivo": ruta_publica,
            "subido_por": current_user.id,
        },
    ).mappings().first()
    db.commit()
    return dict(result)


@router.delete("/evidencias/{evidencia_id}", status_code=204)
def eliminar_evidencia(
    evidencia_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = db.execute(
        text("""UPDATE etapa_productiva.evidencias_charlas SET is_active = false
                WHERE id = :id RETURNING id"""),
        {"id": evidencia_id},
    ).mappings().first()
    db.commit()
    if not result:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada")
    return None


# ============================================================
# HISTORIAL DE CHARLAS (pasadas)
# ============================================================
@router.get("/historial-charlas/{instructor_id}", response_model=List[InstructorHistorialOut])
def historial_charlas_instructor(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Charlas pasadas del instructor con asistencias y evidencias."""
    query = text("""
        SELECT 
            c.id,
            c.tema,
            c.fecha_programada,
            c.tipo_charla::text AS tipo_charla,
            f.numero_ficha,
            pf.nombre AS programa,
            c.instructor_id,
            u.nombre || ' ' || u.apellido AS instructor_nombre,
            (SELECT COUNT(*) FROM etapa_productiva.asistencias_charlas ac
             WHERE ac.charla_id = c.id AND ac.is_active = true) AS asistencias_count,
            (SELECT COUNT(*) FROM etapa_productiva.evidencias_charlas ec
             WHERE ec.charla_id = c.id AND ec.is_active = true) AS evidencias_count
        FROM etapa_productiva.charlas c
        JOIN etapa_productiva.fichas f ON f.id = c.ficha_id
        LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
        LEFT JOIN etapa_productiva.usuarios u ON u.id = c.instructor_id
        WHERE c.instructor_id = :instructor_id
          AND c.is_active = true
          AND c.fecha_programada < NOW()
        ORDER BY c.fecha_programada DESC
    """)
    return [dict(r) for r in db.execute(query, {"instructor_id": instructor_id}).mappings().all()]


# ============================================================
# SELECCION DE ALTERNATIVA
# ============================================================
@router.get("/seleccion-alternativa/{instructor_id}", response_model=List[InstructorFichaAlternativa])
def seleccion_alternativa_instructor(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Fichas del instructor con los aprendices y su alternativa asignada."""
    query = text("""
        SELECT 
            p.ficha_id,
            f.numero_ficha AS id_ficha,
            pf.nombre AS programa,
            p.id AS proceso_id,
            p.aprendiz_id,
            u.nombre || ' ' || u.apellido AS nombre,
            m.nombre AS alternativa,
            p.empresa_id,
            e.razon_social AS empresa,
            e.nit,
            e.arl,
            p.fecha_inicio,
            p.fecha_fin,
            p.estado::text AS estado
        FROM etapa_productiva.procesos_etapa_productiva p
        JOIN etapa_productiva.usuarios u ON u.id = p.aprendiz_id
        JOIN etapa_productiva.fichas f ON f.id = p.ficha_id
        LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
        LEFT JOIN etapa_productiva.modalidades_ep m ON m.id = p.modalidad_id
        LEFT JOIN etapa_productiva.empresas e ON e.id = p.empresa_id
        WHERE p.instructor_id = :instructor_id
          AND p.is_active = true
          AND f.is_active = true
        ORDER BY f.numero_ficha, u.nombre
    """)
    rows = db.execute(query, {"instructor_id": instructor_id}).mappings().all()

    fichas = {}
    for r in rows:
        fid = r["ficha_id"]
        if fid not in fichas:
            fichas[fid] = {
                "ficha_id": fid,
                "idFicha": r["id_ficha"],
                "programa": r["programa"] or "Sin programa",
                "total_aprendices": 0,
                "aprendices": [],
            }

        empresa = None
        if r["empresa"]:
            empresa = {
                "nombre": r["empresa"],
                "nit": r["nit"],
                "arl": r["arl"],
                "fecha_inicio": str(r["fecha_inicio"]) if r["fecha_inicio"] else None,
                "fecha_fin": str(r["fecha_fin"]) if r["fecha_fin"] else None,
                "estado": r["estado"],
            }

        fichas[fid]["aprendices"].append({
            "proceso_id": r["proceso_id"],
            "aprendiz_id": r["aprendiz_id"],
            "nombre": r["nombre"],
            "alternativa": r["alternativa"],
            "empresa": empresa,
        })
        fichas[fid]["total_aprendices"] += 1

    return list(fichas.values())


@router.get("/modalidades")
def listar_modalidades(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista de modalidades disponibles."""
    query = text("""
        SELECT id, nombre FROM etapa_productiva.modalidades_ep
        WHERE is_active = true ORDER BY nombre
    """)
    return [dict(r) for r in db.execute(query).mappings().all()]


@router.put("/seleccion-alternativa/asignar/{proceso_id}")
def asignar_alternativa(
    proceso_id: int,
    data: InstructorAsignarAlternativaIn,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Asigna modalidad, empresa y fechas a un proceso."""
    existe = db.execute(
        text("SELECT id FROM etapa_productiva.procesos_etapa_productiva WHERE id = :id"),
        {"id": proceso_id},
    ).mappings().first()
    if not existe:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")

    updates = ["modalidad_id = :modalidad_id"]
    params = {"id": proceso_id, "modalidad_id": data.modalidad_id}

    if data.empresa_id:
        updates.append("empresa_id = :empresa_id")
        params["empresa_id"] = data.empresa_id
    if data.fecha_inicio:
        updates.append("fecha_inicio = :fecha_inicio")
        params["fecha_inicio"] = data.fecha_inicio
    if data.fecha_fin:
        updates.append("fecha_fin = :fecha_fin")
        params["fecha_fin"] = data.fecha_fin

    db.execute(
        text(f"UPDATE etapa_productiva.procesos_etapa_productiva SET {', '.join(updates)} WHERE id = :id"),
        params,
    )
    db.commit()
    return {"message": "Alternativa asignada", "proceso_id": proceso_id}


# ============================================================
# APRENDICES DISPONIBLES (sin proceso activo)
# ============================================================
@router.get("/aprendices-disponibles/{instructor_id}")
def aprendices_disponibles(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Aprendices activos que NO estan en ningun proceso activo."""
    query = text("""
        SELECT u.id, u.nombre || ' ' || u.apellido AS nombre, u.documento_identidad, u.email
        FROM etapa_productiva.usuarios u
        WHERE u.rol_id = 4
          AND u.is_active = true
          AND u.id NOT IN (
              SELECT aprendiz_id FROM etapa_productiva.procesos_etapa_productiva
              WHERE is_active = true
          )
        ORDER BY u.nombre
    """)
    return [dict(r) for r in db.execute(query).mappings().all()]


# ============================================================
# CREAR NUEVO PROCESO
# ============================================================
class InstructorCrearProcesoIn(BaseModel):
    aprendiz_id: int
    ficha_id: int
    modalidad_id: int
    empresa_id: Optional[int] = None
    fecha_inicio: str
    fecha_fin: str
    instructor_id: int


@router.post("/seleccion-alternativa/crear-proceso")
def crear_proceso_instructor(
    data: InstructorCrearProcesoIn,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    aprendiz = db.execute(
        text("SELECT id FROM etapa_productiva.usuarios WHERE id = :id AND rol_id = 4 AND is_active = true"),
        {"id": data.aprendiz_id},
    ).mappings().first()
    if not aprendiz:
        raise HTTPException(status_code=400, detail="Aprendiz no valido")

    ficha = db.execute(
        text("SELECT id FROM etapa_productiva.fichas WHERE id = :id AND is_active = true"),
        {"id": data.ficha_id},
    ).mappings().first()
    if not ficha:
        raise HTTPException(status_code=400, detail="Ficha no valida")

    existe = db.execute(
        text("""SELECT id FROM etapa_productiva.procesos_etapa_productiva 
                WHERE aprendiz_id = :aprendiz_id AND is_active = true"""),
        {"aprendiz_id": data.aprendiz_id},
    ).mappings().first()
    if existe:
        raise HTTPException(status_code=400, detail="Este aprendiz ya tiene un proceso activo")

    try:
        result = db.execute(
            text("""
                INSERT INTO etapa_productiva.procesos_etapa_productiva
                    (aprendiz_id, ficha_id, modalidad_id, empresa_id,
                     instructor_id, fecha_inicio, fecha_fin, estado, is_active)
                VALUES 
                    (:aprendiz_id, :ficha_id, :modalidad_id, :empresa_id,
                     :instructor_id, :fecha_inicio, :fecha_fin,
                     CAST('ACTIVO' AS etapa_productiva.estado_proceso_t), true)
                RETURNING id
            """),
            {
                "aprendiz_id": data.aprendiz_id,
                "ficha_id": data.ficha_id,
                "modalidad_id": data.modalidad_id,
                "empresa_id": data.empresa_id,
                "instructor_id": data.instructor_id,
                "fecha_inicio": data.fecha_inicio,
                "fecha_fin": data.fecha_fin,
            },
        ).mappings().first()
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear proceso: {str(e)}")

    return {"message": "Proceso creado", "proceso_id": result["id"]}


# ============================================================
# MOMENTOS DE SEGUIMIENTO
# ============================================================
@router.get("/momentos/{instructor_id}")
def momentos_del_instructor(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Reuniones de seguimiento agrupadas por momento."""
    query = text("""
        SELECT 
            r.id AS reunion_id,
            r.momento::text AS momento,
            r.observaciones,
            r.fecha_programada,
            r.fecha_realizada,
            p.id AS proceso_id,
            p.aprendiz_id,
            u.nombre || ' ' || u.apellido AS aprendiz_nombre,
            f.id AS ficha_id,
            f.numero_ficha,
            pf.nombre AS programa
        FROM etapa_productiva.reuniones_seguimiento r
        JOIN etapa_productiva.procesos_etapa_productiva p ON p.id = r.proceso_id
        JOIN etapa_productiva.usuarios u ON u.id = p.aprendiz_id
        JOIN etapa_productiva.fichas f ON f.id = p.ficha_id
        LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
        WHERE r.instructor_id = :instructor_id
          AND r.is_active = true
          AND p.is_active = true
        ORDER BY r.momento, f.numero_ficha, u.nombre
    """)
    rows = db.execute(query, {"instructor_id": instructor_id}).mappings().all()

    momentos_map = {
        "MOMENTO_1_INICIAL": {"id": 1, "titulo": "Momento 1", "descripcion": "Induccion y Diagnostico Inicial", "fichas": {}},
        "MOMENTO_2_PARCIAL": {"id": 2, "titulo": "Momento 2", "descripcion": "Ejecucion y Seguimiento", "fichas": {}},
        "MOMENTO_3_FINAL": {"id": 3, "titulo": "Momento 3", "descripcion": "Evaluacion y Cierre", "fichas": {}},
    }

    for r in rows:
        mom = momentos_map.get(r["momento"])
        if not mom:
            continue
        fid = r["ficha_id"]
        if fid not in mom["fichas"]:
            mom["fichas"][fid] = {
                "idFicha": r["numero_ficha"],
                "programa": r["programa"] or "Sin programa",
                "aprendices": [],
            }
        mom["fichas"][fid]["aprendices"].append({
            "id": r["reunion_id"],
            "nombre": r["aprendiz_nombre"],
            "seguimiento": r["observaciones"] or "Sin observaciones",
            "fecha_programada": str(r["fecha_programada"]) if r["fecha_programada"] else None,
        })

    resultado = []
    for key, mom in momentos_map.items():
        resultado.append({
            "id": mom["id"],
            "titulo": mom["titulo"],
            "descripcion": mom["descripcion"],
            "fichas": list(mom["fichas"].values()),
        })

    return resultado


# ============================================================
# BITACORAS DEL INSTRUCTOR
# ============================================================
@router.get("/bitacoras/{instructor_id}")
def bitacoras_del_instructor(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = text("""
        SELECT 
            b.id AS bitacora_id,
            b.numero_bitacora,
            b.periodo_reportado,
            b.titulo,
            b.contenido,
            b.estado::text AS estado,
            b.instructor_retroalimentacion,
            b.fecha_envio,
            p.id AS proceso_id,
            p.aprendiz_id,
            u.nombre || ' ' || u.apellido AS aprendiz_nombre,
            u.documento_identidad AS aprendiz_documento,
            f.id AS ficha_id,
            f.numero_ficha,
            pf.nombre AS programa
        FROM etapa_productiva.bitacoras b
        JOIN etapa_productiva.procesos_etapa_productiva p ON p.id = b.proceso_id
        JOIN etapa_productiva.usuarios u ON u.id = p.aprendiz_id
        JOIN etapa_productiva.fichas f ON f.id = p.ficha_id
        LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
        WHERE p.instructor_id = :instructor_id
          AND p.is_active = true
          AND b.is_active = true
        ORDER BY f.numero_ficha, u.nombre, b.periodo_reportado
    """)
    rows = db.execute(query, {"instructor_id": instructor_id}).mappings().all()

    fichas = {}
    for r in rows:
        fid = r["ficha_id"]
        if fid not in fichas:
            fichas[fid] = {
                "id": r["numero_ficha"],
                "ficha_id": fid,
                "programa": r["programa"] or "Sin programa",
                "aprendices": {},
            }

        aid = r["aprendiz_id"]
        if aid not in fichas[fid]["aprendices"]:
            fichas[fid]["aprendices"][aid] = {
                "id": aid,
                "proceso_id": r["proceso_id"],
                "nombre": r["aprendiz_nombre"],
                "documento": r["aprendiz_documento"] or "--",
                "bitacoras": {},
            }

        periodo = r["periodo_reportado"]
        try:
            mes = int(periodo.split("-")[1])
            if mes <= 4:
                bimestre_key = "bimestre1"
            elif mes <= 8:
                bimestre_key = "bimestre2"
            elif mes <= 10:
                bimestre_key = "bimestre3"
            else:
                bimestre_key = "bimestre4"
        except Exception:
            bimestre_key = "bimestre1"

        if bimestre_key not in fichas[fid]["aprendices"][aid]["bitacoras"]:
            fichas[fid]["aprendices"][aid]["bitacoras"][bimestre_key] = []

        evidencias_rows = db.execute(
            text("""
                SELECT ea.id, ea.nombre_archivo, ea.mime_type, ea.tamano_bytes
                FROM etapa_productiva.bitacora_evidencias be
                JOIN etapa_productiva.evidencias_archivos ea ON ea.id = be.evidencia_archivo_id
                WHERE be.bitacora_id = :bitacora_id AND be.is_active = true
                ORDER BY ea.id
            """),
            {"bitacora_id": r["bitacora_id"]},
        ).mappings().all()

        archivos_list = []
        for ev in evidencias_rows:
            tamano_kb = round((ev["tamano_bytes"] or 0) / 1024, 1)
            archivos_list.append({
                "id": ev["id"],
                "nombre": ev["nombre_archivo"],
                "tipo": ev["mime_type"],
                "tamaño": str(tamano_kb) + " KB",
                "ruta": "/uploads/" + ev["nombre_archivo"],
            })

        fichas[fid]["aprendices"][aid]["bitacoras"][bimestre_key].append({
            "id": r["bitacora_id"],
            "numero_bitacora": r["numero_bitacora"],
            "periodo_reportado": r["periodo_reportado"],
            "fecha": periodo,
            "titulo": r["titulo"],
            "descripcion": r["titulo"],
            "contenido": r["contenido"],
            "observaciones": r["instructor_retroalimentacion"],
            "instructor": "Carlos Ramirez",
            "tipo": "seguimiento",
            "aprendizObservacion": r["contenido"],
            "estado": r["estado"],
            "archivos": archivos_list,
        })

    resultado = []
    for fid, ficha in fichas.items():
        aprendices_list = list(ficha["aprendices"].values())
        resultado.append({
            "id": ficha["id"],
            "programa": ficha["programa"],
            "ficha_id": fid,
            "aprendices": aprendices_list,
        })

    return resultado


# ============================================================
# ARCHIVOS DE UNA BITACORA
# ============================================================
@router.get("/bitacora/{bitacora_id}/archivos")
def archivos_de_bitacora(
    bitacora_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    rows = db.execute(
        text("""
            SELECT ea.id, ea.nombre_archivo, ea.mime_type, ea.tamano_bytes
            FROM etapa_productiva.bitacora_evidencias be
            JOIN etapa_productiva.evidencias_archivos ea ON ea.id = be.evidencia_archivo_id
            WHERE be.bitacora_id = :bitacora_id AND be.is_active = true
            ORDER BY ea.id
        """),
        {"bitacora_id": bitacora_id},
    ).mappings().all()

    resultado = []
    for r in rows:
        tamano_kb = round((r["tamano_bytes"] or 0) / 1024, 1)
        resultado.append({
            "id": r["id"],
            "nombre": r["nombre_archivo"],
            "tipo": r["mime_type"],
            "tamaño": str(tamano_kb) + " KB",
            "ruta": "/uploads/" + r["nombre_archivo"],
        })

    return resultado


# ============================================================
# REPORTES FINALES DE APRENDICES
# ============================================================
@router.get("/reportes-finales/{instructor_id}")
def reportes_finales_instructor(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = text("""
        SELECT 
            p.id AS proceso_id,
            p.aprendiz_id,
            u.nombre || ' ' || u.apellido AS nombre,
            u.documento_identidad AS documento,
            f.id AS ficha_id,
            f.numero_ficha,
            pf.nombre AS programa,
            p.fecha_fin,
            p.estado::text AS estado,
            (SELECT COUNT(*) FROM etapa_productiva.evidencias_archivos ea
             WHERE ea.uploaded_by = p.aprendiz_id
               AND ea.tipo_documento = 'REPORTE_FINAL'
               AND ea.is_active = true) AS tiene_reporte
        FROM etapa_productiva.procesos_etapa_productiva p
        JOIN etapa_productiva.usuarios u ON u.id = p.aprendiz_id
        JOIN etapa_productiva.fichas f ON f.id = p.ficha_id
        LEFT JOIN etapa_productiva.programas_formacion pf ON pf.id = f.programa_id
        WHERE p.instructor_id = :instructor_id
          AND p.is_active = true
        ORDER BY u.nombre
    """)
    rows = db.execute(query, {"instructor_id": instructor_id}).mappings().all()

    resultado = []
    for r in rows:
        reporte = None
        if r["tiene_reporte"] > 0:
            rep = db.execute(
                text("""
                    SELECT id, nombre_archivo, ruta_objeto, mime_type, tamano_bytes, created_at
                    FROM etapa_productiva.evidencias_archivos
                    WHERE uploaded_by = :aprendiz_id
                      AND tipo_documento = 'REPORTE_FINAL'
                      AND is_active = true
                    ORDER BY created_at DESC
                    LIMIT 1
                """),
                {"aprendiz_id": r["aprendiz_id"]},
            ).mappings().first()

            if rep:
                tamano_kb = round((rep["tamano_bytes"] or 0) / 1024, 1)
                reporte = {
                    "id": rep["id"],
                    "nombre": rep["nombre_archivo"],
                    "tipo": rep["mime_type"],
                    "tamaño": str(tamano_kb) + " KB",
                    "ruta": rep["ruta_objeto"],
                }

        resultado.append({
            "id": r["proceso_id"],
            "aprendiz_id": r["aprendiz_id"],
            "nombre": r["nombre"],
            "documento": r["documento"] or "--",
            "ficha": r["numero_ficha"],
            "ficha_id": r["ficha_id"],
            "programa": r["programa"] or "Sin programa",
            "fechaFinalizacion": str(r["fecha_fin"]) if r["fecha_fin"] else "--",
            "estado": r["estado"],
            "reporteFinal": reporte,
        })

    return resultado


@router.post("/reportes-finales/subir/{aprendiz_id}", status_code=201)
async def subir_reporte_final(
    aprendiz_id: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if archivo.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")

    carpeta = os.path.join("uploads", "reportes_finales", str(aprendiz_id))
    os.makedirs(carpeta, exist_ok=True)

    timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
    nombre_seguro = archivo.filename.replace(" ", "_")
    nombre_final = f"{timestamp}_{nombre_seguro}"
    ruta_completa = os.path.join(carpeta, nombre_final)

    contenido = await archivo.read()
    with open(ruta_completa, "wb") as buffer:
        buffer.write(contenido)

    ruta_publica = "/" + ruta_completa.replace(os.sep, "/")

    result = db.execute(
        text("""
            INSERT INTO etapa_productiva.evidencias_archivos
                (nombre_archivo, ruta_objeto, tipo_documento, mime_type, tamano_bytes, uploaded_by, is_active)
            VALUES 
                (:nombre, :ruta, 'REPORTE_FINAL', :mime, :tamano, :uploaded_by, true)
            RETURNING id, nombre_archivo, ruta_objeto, mime_type, tamano_bytes
        """),
        {
            "nombre": archivo.filename,
            "ruta": ruta_publica,
            "mime": archivo.content_type,
            "tamano": len(contenido),
            "uploaded_by": aprendiz_id,
        },
    ).mappings().first()
    db.commit()

    return {
        "id": result["id"],
        "nombre": result["nombre_archivo"],
        "ruta": result["ruta_objeto"],
        "tipo": result["mime_type"],
    }