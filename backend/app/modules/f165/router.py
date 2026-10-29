"""
Endpoints para generar el Formato F165.
"""
import io
import zipfile

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.core.constants import Roles
from app.models import Usuario, ProcesoEtapaProductiva, Ficha
from app.modules.f165 import service

router = APIRouter(prefix="/f165", tags=["Formato F165"])


# ============================================================
# F165 INDIVIDUAL
# ============================================================

@router.get("/generar/{proceso_id}")
def generar_f165_individual(
    proceso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR, Roles.INSTRUCTOR)),
):
    """Genera el PDF del F165 para un proceso (aprendiz) específico."""
    try:
        pdf_bytes = service.generar_f165_pdf(db, proceso_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"[F165] Error al generar: {e}")
        raise HTTPException(status_code=500, detail="Error al generar el F165")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=F165_{proceso_id}.pdf"},
    )


# ============================================================
# F165 MASIVO POR FICHA
# ============================================================

@router.get("/generar-ficha/{ficha_id}")
def generar_f165_masivo(
    ficha_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(Roles.ADMIN, Roles.COORDINADOR)),
):
    """Genera un ZIP con todos los F165 de los aprendices de una ficha."""
    ficha = db.query(Ficha).filter(Ficha.id == ficha_id).first()
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha no encontrada")

    procesos = db.query(ProcesoEtapaProductiva).filter(
        ProcesoEtapaProductiva.ficha_id == ficha_id,
        ProcesoEtapaProductiva.is_active == True,
    ).all()

    if not procesos:
        raise HTTPException(status_code=404, detail="La ficha no tiene aprendices activos")

    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in procesos:
            try:
                pdf_bytes = service.generar_f165_pdf(db, p.id)
                aprendiz = db.query(Usuario).filter(Usuario.id == p.aprendiz_id).first()
                nombre = f"{aprendiz.nombre}_{aprendiz.apellido}".replace(" ", "_") if aprendiz else f"proceso_{p.id}"
                zf.writestr(f"F165_{nombre}.pdf", pdf_bytes)
            except Exception as e:
                print(f"[F165] Error con proceso {p.id}: {e}")

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=F165_Ficha_{ficha.numero_ficha}.zip"},
    )