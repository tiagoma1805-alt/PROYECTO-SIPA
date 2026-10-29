# backend/app/modules/novedades/router.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.core.constants import Roles
from app.models import Usuario
from app.modules.novedades import crud
from app.modules.novedades.schemas import (
    NovedadProcesoResponse, NovedadDetalleResponse, StatsNovedades
)

router = APIRouter(prefix="/novedades", tags=["Novedades"])


@router.get("/stats", response_model=StatsNovedades)
def obtener_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    return crud.obtener_stats(db)


@router.get("/", response_model=List[NovedadProcesoResponse])
def listar_novedades(
    search: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    return crud.listar_novedades(db, search=search, tipo=tipo)


@router.get("/{novedad_id}", response_model=NovedadDetalleResponse)
def obtener_novedad(
    novedad_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    detalle = crud.obtener_novedad(db, novedad_id)
    if not detalle:
        raise HTTPException(status_code=404, detail="Novedad no encontrada")
    return detalle