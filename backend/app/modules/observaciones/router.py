from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.core.database import get_db
from app.modules.observaciones.schemas import (
    ObservacionCreate,
    ObservacionOut,
    AprendizFichaOut,
)

router = APIRouter(prefix="/observaciones", tags=["Observaciones"])


@router.get("/aprendiz/{aprendiz_id}", response_model=List[ObservacionOut])
def listar_observaciones(aprendiz_id: int, db: Session = Depends(get_db)):
    """Lista todas las observaciones activas de un aprendiz."""
    query = text("""
        SELECT 
            o.id,
            o.aprendiz_id,
            o.instructor_id,
            o.texto,
            o.fecha_creacion,
            u.nombre || ' ' || u.apellido AS instructor_nombre
        FROM etapa_productiva.observaciones o
        LEFT JOIN etapa_productiva.usuarios u ON u.id = o.instructor_id
        WHERE o.aprendiz_id = :aprendiz_id
          AND o.is_active = true
        ORDER BY o.fecha_creacion DESC
    """)
    result = db.execute(query, {"aprendiz_id": aprendiz_id}).mappings().all()
    return [dict(r) for r in result]


@router.get("/ficha/{ficha_id}/aprendices-detalle", response_model=List[AprendizFichaOut])
def listar_aprendices_detalle(ficha_id: int, db: Session = Depends(get_db)):
    """
    Devuelve TODOS los aprendices de una ficha con:
    - Datos del aprendiz
    - Datos de la empresa
    - Sus observaciones
    """
    query = text("""
        SELECT 
            p.id AS proceso_id,
            p.aprendiz_id,
            u.nombre || ' ' || u.apellido AS nombre,
            u.documento_identidad AS documento,
            u.email,
            e.razon_social AS empresa,
            e.arl,
            p.fecha_inicio,
            p.fecha_fin,
            p.estado::text AS estado
        FROM etapa_productiva.procesos_etapa_productiva p
        JOIN etapa_productiva.usuarios u ON u.id = p.aprendiz_id
        LEFT JOIN etapa_productiva.empresas e ON e.id = p.empresa_id
        WHERE p.ficha_id = :ficha_id
          AND p.is_active = true
        ORDER BY u.nombre
    """)
    rows = db.execute(query, {"ficha_id": ficha_id}).mappings().all()

    resultado = []
    for row in rows:
        obs_query = text("""
            SELECT 
                o.id,
                o.aprendiz_id,
                o.instructor_id,
                o.texto,
                o.fecha_creacion,
                u.nombre || ' ' || u.apellido AS instructor_nombre
            FROM etapa_productiva.observaciones o
            LEFT JOIN etapa_productiva.usuarios u ON u.id = o.instructor_id
            WHERE o.aprendiz_id = :aprendiz_id
              AND o.is_active = true
            ORDER BY o.fecha_creacion DESC
        """)
        obs = db.execute(obs_query, {"aprendiz_id": row["aprendiz_id"]}).mappings().all()

        resultado.append({
            "proceso_id": row["proceso_id"],
            "aprendiz_id": row["aprendiz_id"],
            "nombre": row["nombre"],
            "documento": row["documento"],
            "email": row["email"],
            "empresa": row["empresa"],
            "arl": row["arl"],
            "fecha_inicio": row["fecha_inicio"],
            "fecha_fin": row["fecha_fin"],
            "estado": row["estado"],
            "observaciones": [dict(o) for o in obs],
        })

    return resultado


@router.post("/", response_model=ObservacionOut)
def crear_observacion(data: ObservacionCreate, db: Session = Depends(get_db)):
    """Crea una nueva observación para un aprendiz."""
    if not data.texto.strip():
        raise HTTPException(status_code=400, detail="El texto no puede estar vacío")

    query = text("""
        INSERT INTO etapa_productiva.observaciones 
            (aprendiz_id, instructor_id, texto, fecha_creacion, is_active)
        VALUES 
            (:aprendiz_id, :instructor_id, :texto, NOW(), true)
        RETURNING id, aprendiz_id, instructor_id, texto, fecha_creacion
    """)
    result = db.execute(query, {
        "aprendiz_id": data.aprendiz_id,
        "instructor_id": data.instructor_id,
        "texto": data.texto.strip(),
    }).mappings().first()
    db.commit()

    instructor = db.execute(
        text("SELECT nombre || ' ' || apellido AS nombre FROM etapa_productiva.usuarios WHERE id = :id"),
        {"id": data.instructor_id}
    ).mappings().first()

    return {
        **dict(result),
        "instructor_nombre": instructor["nombre"] if instructor else None,
    }


@router.delete("/{observacion_id}")
def eliminar_observacion(observacion_id: int, db: Session = Depends(get_db)):
    """Soft delete de una observación."""
    query = text("""
        UPDATE etapa_productiva.observaciones
        SET is_active = false
        WHERE id = :id
        RETURNING id
    """)
    result = db.execute(query, {"id": observacion_id}).mappings().first()
    db.commit()

    if not result:
        raise HTTPException(status_code=404, detail="Observación no encontrada")

    return {"message": "Observación eliminada", "id": observacion_id}
