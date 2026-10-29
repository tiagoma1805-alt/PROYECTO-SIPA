# backend/app/modules/instructores_ep/router.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.core.constants import Roles
from app.models import Usuario
from app.modules.instructores_ep import crud
from app.modules.instructores_ep.schemas import (
    InstructorEPResumen, InstructorEPResponse, StatsInstructoresEP
)

router = APIRouter(prefix="/instructores-ep", tags=["Instructores EP"])


@router.get("/stats", response_model=StatsInstructoresEP)
def obtener_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    return crud.obtener_stats(db)


@router.get("/", response_model=List[InstructorEPResumen])
def listar_instructores(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    return crud.listar_instructores_ep(db, search=search)


@router.get("/{instructor_id}", response_model=InstructorEPResponse)
def obtener_detalle(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    detalle = crud.obtener_detalle_instructor(db, instructor_id)
    if not detalle:
        raise HTTPException(status_code=404, detail="Instructor no encontrado")
    return detalle
