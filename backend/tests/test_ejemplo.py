def validar_password(password: str) -> bool:
    if len(password) < 8:
        return False
    return True

def test_password_corta_es_invalida():
    # Arrange
    password_corta = "123"
    # Act
    resultado = validar_password(password_corta)
    # Assert
    assert resultado is False

def test_password_valida_es_aceptada():
    # Arrange
    password_buena = "segura123"
    # Act
    resultado = validar_password(password_buena)
    # Assert
    assert resultado is True
