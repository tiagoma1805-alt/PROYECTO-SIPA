# backend/app/modules/importacion/router.py
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.file_validation import validate_upload_file
from app.core.security import require_role
from app.core.constants import RolesPermisos
from app.models import Usuario
from app.modules.importacion import crud
from app.modules.importacion.schemas import ImportResult

router = APIRouter(prefix="/importacion", tags=["importacion"])


@router.post("/{tipo}", response_model=ImportResult, status_code=status.HTTP_200_OK)
async def importar_archivo(
    tipo: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(*RolesPermisos.ESCRITURA))
):
    """
    Importa datos masivos desde un archivo CSV o Excel.

    Tipos soportados:
    - usuarios
    - fichas
    - asignaciones
    - procesos
    - empresas
    - procesos-alternativas (valida estado)
    - estados-aprendices (valida estado)
    """
    if tipo not in crud.TIPOS_IMPORTACION:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de importación no soportado: {tipo}"
        )

    if not file.filename:
        raise HTTPException(status_code=400, detail="Nombre de archivo no proporcionado")

    validate_upload_file(
        file,
        max_size_mb=10,
        allowed_mime_types={
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        allowed_extensions={".csv", ".xls", ".xlsx"},
    )

    try:
        file_bytes = await file.read()
        filas = crud.leer_archivo(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al leer el archivo: {str(e)}")

    if not filas:
        raise HTTPException(status_code=400, detail="El archivo no contiene datos")

    # 🔥 CASO ESPECIAL: procesos-alternativas con validación de estado
    if tipo == "procesos-alternativas":
        (
            insertadas,
            con_error,
            errores,
            con_advertencia,
            detalle_adv,
            rechazadas,
            detalle_rech,
        ) = crud._importar_alternativas(db, filas)

        return ImportResult(
            total_filas=len(filas),
            filas_insertadas=insertadas,
            filas_con_error=con_error,
            errores=errores,
            filas_con_advertencia=con_advertencia,
            filas_rechazadas=rechazadas,
            detalle_advertencias=detalle_adv,
            detalle_rechazadas=detalle_rech,
        )

    # 🔥 CASO ESPECIAL: estados-aprendices con validación
    if tipo == "estados-aprendices":
        (
            actualizados,
            con_error,
            errores,
            con_advertencia,
            detalle_adv,
            rechazadas,
            detalle_rech,
        ) = crud._importar_estados_aprendices(db, filas)

        return ImportResult(
            total_filas=len(filas),
            filas_insertadas=actualizados,
            filas_con_error=con_error,
            errores=errores,
            filas_con_advertencia=con_advertencia,
            filas_rechazadas=rechazadas,
            detalle_advertencias=detalle_adv,
            detalle_rechazadas=detalle_rech,
        )

    # Caso normal (resto de tipos de importación)
    filas_insertadas, filas_con_error, errores = crud.importar_datos(db, tipo, filas)

    return ImportResult(
        total_filas=len(filas),
        filas_insertadas=filas_insertadas,
        filas_con_error=filas_con_error,
        errores=errores,
    )