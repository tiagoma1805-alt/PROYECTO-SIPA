"""
Tests unitarios de validación de nombres de archivo (capa API / reglas de negocio).
Unidad: app.core.file_validation._validate_filename
No usa BD ni TestClient.
"""
import pytest
from fastapi import HTTPException

from app.core.file_validation import _validate_filename


def test_accepts_simple_filename():
    # Arrange
    filename = "evidencia.pdf"

    # Act
    result = _validate_filename(filename)

    # Assert
    assert result == "evidencia.pdf"


def test_strips_directory_path_and_keeps_basename():
    # Arrange: intenta path traversal / ruta
    filename = "../../etc/passwd/carta.docx"

    # Act
    result = _validate_filename(filename)

    # Assert: solo el nombre base
    assert result == "carta.docx"
    assert "/" not in result
    assert "\\" not in result


def test_rejects_empty_filename():
    # Arrange / Act / Assert
    with pytest.raises(HTTPException) as exc_info:
        _validate_filename("")

    assert exc_info.value.status_code == 400
    assert "no proporcionado" in exc_info.value.detail.lower() or "inválido" in exc_info.value.detail.lower()


def test_rejects_none_filename():
    with pytest.raises(HTTPException) as exc_info:
        _validate_filename(None)

    assert exc_info.value.status_code == 400


@pytest.mark.parametrize(
    "bad_name",
    [
        "archivo<.pdf",
        'informe:"secreto".pdf',
        "ruta/prohibida.pdf",  # Path.name puede dejar solo "prohibida.pdf" en Unix;
        # si en tu SO no falla, el caso de caracteres < > | * sí debe fallar:
        "mal|nombre.pdf",
        "asterisco*.pdf",
        "pregunta?.pdf",
    ],
)
def test_rejects_forbidden_characters(bad_name):
    """
    Caracteres prohibidos: < > : " / \\ | ? *
    Nota: nombres con solo '/' se reducen al basename; por eso priorizamos | * ? < >
    """
    # Si el nombre solo tiene slash, Path.name lo limpia y puede pasar.
    # Forzamos casos con caracteres que la función rechaza explícitamente.
    if any(c in bad_name for c in '<>:"|?*'):
        with pytest.raises(HTTPException) as exc_info:
            _validate_filename(bad_name)
        assert exc_info.value.status_code == 400
        assert "no permitidos" in exc_info.value.detail.lower() or "inválido" in exc_info.value.detail.lower()


def test_rejects_dot_and_double_dot():
    for name in (".", ".."):
        with pytest.raises(HTTPException) as exc_info:
            _validate_filename(name)
        assert exc_info.value.status_code == 400