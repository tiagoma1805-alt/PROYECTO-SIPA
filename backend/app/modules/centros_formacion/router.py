# backend/app/modules/centros_formacion/router.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.core.constants import Roles
from app.models import Usuario
from app.modules.centros_formacion import crud
from app.modules.centros_formacion.schemas import (
    CentroFormacionResponse, CentroConProgramas, CentroFormacionCreate
)

router = APIRouter(prefix="/centros-formacion", tags=["Centros de Formación"])


@router.get("/", response_model=List[CentroFormacionResponse])
def listar_centros(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    return crud.listar_centros(db)


@router.get("/{centro_id}", response_model=CentroConProgramas)
def obtener_centro(
    centro_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    detalle = crud.obtener_centro_detalle(db, centro_id)
    if not detalle:
        raise HTTPException(status_code=404, detail="Centro no encontrado")
    return detalle


@router.post("/", response_model=CentroFormacionResponse)
def crear_centro(
    data: CentroFormacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN)),
):
    try:
        return crud.crear_centro(db, data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
