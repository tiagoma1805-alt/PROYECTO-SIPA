"""
Servicio para generar el Formato F165 — Alternativa de Etapa Productiva.
"""
import io
from datetime import datetime
from pathlib import Path

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
)
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

from sqlalchemy.orm import Session

from app.models import ProcesoEtapaProductiva, Usuario, Ficha, ProgramaFormacion


# ============================================================
# Buscar el logo SENA
# ============================================================

def _get_logo_path():
    """Busca el logo SENA en rutas comunes."""
    posibles = [
        Path("logo-sena.png"),
        Path("public/logo-sena.png"),
        Path("../dashboard-sipa/public/logo-sena.png"),
        Path("../../dashboard-sipa/public/logo-sena.png"),
        Path("static/logo-sena.png"),
        Path("evidencias/logo-sena.png"),
    ]
    for p in posibles:
        if p.exists():
            print(f"[F165] Logo encontrado en: {p}")
            return p
    print("[F165] No se encontró logo, generando sin logo")
    return None


# ============================================================
# Generar F165 individual
# ============================================================

def generar_f165_pdf(db: Session, proceso_id: int) -> bytes:
    """Genera el PDF del F165 para un proceso (aprendiz) específico."""
    proceso = db.query(ProcesoEtapaProductiva).filter(
        ProcesoEtapaProductiva.id == proceso_id,
        ProcesoEtapaProductiva.is_active == True,
    ).first()

    if not proceso:
        raise ValueError(f"No existe el proceso {proceso_id}")

    aprendiz = db.query(Usuario).filter(Usuario.id == proceso.aprendiz_id).first()
    if not aprendiz:
        raise ValueError(f"No existe el aprendiz del proceso {proceso_id}")

    ficha = db.query(Ficha).filter(Ficha.id == proceso.ficha_id).first()
    programa = None
    if ficha:
        programa = db.query(ProgramaFormacion).filter(
            ProgramaFormacion.id == ficha.programa_id
        ).first()

    tipo_doc = ""
    if aprendiz.tipo_documento:
        tipo_doc = aprendiz.tipo_documento.value if hasattr(aprendiz.tipo_documento, "value") else str(aprendiz.tipo_documento)

    instructor = proceso.instructor
    instructor_nombre = f"{instructor.nombre} {instructor.apellido}".strip() if instructor else "Sin asignar"

    datos = {
        "fecha": datetime.now().strftime("%d/%m/%Y"),
        "aprendiz_nombre": f"{aprendiz.nombre} {aprendiz.apellido}".strip(),
        "aprendiz_tipo_doc": tipo_doc,
        "aprendiz_documento": aprendiz.documento_identidad or "",
        "ficha_numero": ficha.numero_ficha if ficha else "",
        "programa_nombre": programa.nombre if programa else "",
        "modalidad_nombre": proceso.modalidad.nombre if proceso.modalidad else "Sin asignar",
        "empresa_nombre": proceso.empresa.razon_social if proceso.empresa else "Sin asignar",
        "fecha_inicio": proceso.fecha_inicio.strftime("%d/%m/%Y") if proceso.fecha_inicio else "",
        "fecha_fin": proceso.fecha_fin.strftime("%d/%m/%Y") if proceso.fecha_fin else "",
        "instructor": instructor_nombre,
    }

    return _construir_pdf(datos)


# ============================================================
# Construcción del PDF
# ============================================================

def _construir_pdf(datos: dict) -> bytes:
    """Construye el PDF del F165."""
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=1.5 * cm,
        bottomMargin=2 * cm,
        title="Formato F165 - Alternativa de Etapa Productiva",
        author="SENA",
    )

    styles = getSampleStyleSheet()

    titulo_style = ParagraphStyle(
        "Titulo", parent=styles["Title"],
        fontSize=16, textColor=colors.HexColor("#000000"),
        alignment=TA_CENTER, spaceAfter=4,
    )
    subtitulo_style = ParagraphStyle(
        "Subtitulo", parent=styles["Normal"],
        fontSize=11, textColor=colors.HexColor("#333333"),
        alignment=TA_CENTER, spaceAfter=12,
    )
    seccion_style = ParagraphStyle(
        "Seccion", parent=styles["Heading2"],
        fontSize=12, textColor=colors.HexColor("#3ca203"),
        spaceBefore=12, spaceAfter=8,
    )
    texto_style = ParagraphStyle(
        "Texto", parent=styles["Normal"],
        fontSize=10, alignment=TA_JUSTIFY, leading=14,
    )
    firma_style = ParagraphStyle(
        "Firma", parent=styles["Normal"],
        fontSize=9, alignment=TA_CENTER,
    )

    story = []

    # -------- LOGO + ENCABEZADO --------
    logo_path = _get_logo_path()
    if logo_path:
        try:
            logo = RLImage(str(logo_path), width=3 * cm, height=3 * cm)
            header_data = [[
                logo,
                Paragraph(
                    "<b>Servicio Nacional de Aprendizaje - SENA</b><br/>"
                    "Sistema de Seguimiento de Etapa Productiva",
                    ParagraphStyle(
                        "HeaderText", parent=styles["Normal"],
                        fontSize=11, alignment=TA_CENTER, leading=16,
                    ),
                ),
            ]]
            header_table = Table(header_data, colWidths=[4 * cm, 12 * cm])
            header_table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (0, 0), "LEFT"),
                ("ALIGN", (1, 0), (1, 0), "CENTER"),
            ]))
            story.append(header_table)
        except Exception as e:
            print(f"[F165] Error al cargar logo: {e}")
            story.append(Paragraph("<b>Servicio Nacional de Aprendizaje - SENA</b>", subtitulo_style))
    else:
        story.append(Paragraph("<b>Servicio Nacional de Aprendizaje - SENA</b>", subtitulo_style))

    story.append(Spacer(1, 0.5 * cm))

    # -------- TÍTULO --------
    story.append(Paragraph("FORMATO F165", titulo_style))
    story.append(Paragraph("Alternativa de Etapa Productiva", subtitulo_style))

    story.append(Paragraph(f"<b>Fecha:</b> {datos['fecha']}", texto_style))
    story.append(Spacer(1, 0.3 * cm))

    # -------- TEXTO INTRO --------
    texto_intro = (
        "El Servicio Nacional de Aprendizaje - SENA certifica que el aprendiz "
        "relacionado a continuación ha sido asignado a la siguiente alternativa "
        "de etapa productiva, conforme a los lineamientos establecidos en el "
        "reglamento del aprendiz y la normatividad vigente."
    )
    story.append(Paragraph(texto_intro, texto_style))
    story.append(Spacer(1, 0.5 * cm))

    # -------- DATOS DEL APRENDIZ --------
    story.append(Paragraph("DATOS DEL APRENDIZ", seccion_style))
    tabla_aprendiz = Table(
        [
            ["Nombre completo:", datos["aprendiz_nombre"]],
            ["Documento:", f"{datos['aprendiz_tipo_doc']} {datos['aprendiz_documento']}".strip()],
            ["Ficha:", datos["ficha_numero"]],
            ["Programa:", datos["programa_nombre"]],
        ],
        colWidths=[5 * cm, 11 * cm],
    )
    tabla_aprendiz.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0fdf4")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#e5e7eb")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(tabla_aprendiz)

    story.append(Spacer(1, 0.5 * cm))

    # -------- DATOS DE LA ALTERNATIVA --------
    story.append(Paragraph("DATOS DE LA ALTERNATIVA", seccion_style))
    tabla_alt = Table(
        [
            ["Modalidad:", datos["modalidad_nombre"]],
            ["Empresa:", datos["empresa_nombre"]],
            ["Fecha de inicio:", datos["fecha_inicio"]],
            ["Fecha de finalización:", datos["fecha_fin"]],
        ],
        colWidths=[5 * cm, 11 * cm],
    )
    tabla_alt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0fdf4")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#e5e7eb")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(tabla_alt)

    story.append(Spacer(1, 1.5 * cm))

    # -------- FIRMAS --------
    story.append(Paragraph("FIRMAS", seccion_style))
    story.append(Spacer(1, 1.5 * cm))

    firma_data = [[
        Paragraph("_____________________________<br/><br/><b>Aprendiz</b><br/>" + datos["aprendiz_nombre"], firma_style),
        Paragraph("_____________________________<br/><br/><b>Instructor</b><br/>" + datos["instructor"], firma_style),
    ]]
    firma_table = Table(firma_data, colWidths=[8 * cm, 8 * cm])
    firma_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    story.append(firma_table)

    story.append(Spacer(1, 1.5 * cm))

    firma_coord_data = [[
        Paragraph("_____________________________<br/><br/><b>Coordinador de Etapa Productiva</b>", firma_style),
    ]]
    firma_coord_table = Table(firma_coord_data, colWidths=[16 * cm])
    firma_coord_table.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]))
    story.append(firma_coord_table)

    # -------- PIE --------
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(
        f"<font size=8 color='#6b7280'>Documento generado automáticamente por SIPA — "
        f"{datetime.now().strftime('%d/%m/%Y %H:%M')}</font>",
        firma_style,
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()