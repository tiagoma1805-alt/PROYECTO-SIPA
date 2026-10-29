import os
import configparser
from sqlalchemy import create_engine, text
from passlib.context import CryptContext

# 1. Asegurar el esquema etapa_productiva
base_url = 'postgresql+psycopg2://sipa_user:sipa_password@sipa_db:5432/sipa_db'
engine_base = create_engine(base_url)
with engine_base.connect() as conn:
    conn.execute(text('CREATE SCHEMA IF NOT EXISTS etapa_productiva;'))
    conn.commit()
print('--- Esquema etapa_productiva asegurado ---')

# 2. Corregir alembic.ini si existe
if os.path.exists('alembic.ini'):
    with open('alembic.ini', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('localhost:5432', 'sipa_db:5432')
    content = content.replace('-c%20search_path', '-c%%20search_path')
    with open('alembic.ini', 'w', encoding='utf-8') as f:
        f.write(content)
    print('--- alembic.ini corregido ---')

# 3. Crear las tablas directamente con los modelos de SQLAlchemy
db_url = 'postgresql+psycopg2://sipa_user:sipa_password@sipa_db:5432/sipa_db?options=-c%20search_path=etapa_productiva'
engine = create_engine(db_url)

try:
    from app.models import Base
    Base.metadata.create_all(bind=engine)
    print('--- ¡Tablas creadas exitosamente con SQLAlchemy! ---')
except Exception as e:
    print('Aviso al crear tablas:', e)

# 4. Crear o actualizar el usuario Coordinador
with engine.connect() as conn:
    tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'etapa_productiva'")).fetchall()
    table_names = [t[0] for t in tables if t[0] != 'alembic_version']
    print('Tablas detectadas:', table_names)

    target_table = None
    for name in ['usuarios', 'usuario', 'users', 'tbl_usuarios']:
        if name in table_names:
            target_table = name
            break
    if not target_table and table_names:
        target_table = table_names[0]

    if target_table:
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        hashed_password = pwd_context.hash('Admin1234*')

        result = conn.execute(text(f"SELECT COUNT(*) FROM {target_table} WHERE email = 'coordinador@sipa.com'"))
        exists = result.scalar()
        if exists == 0:
            conn.execute(text(f"INSERT INTO {target_table} (email, password, rol, nombre, apellido) VALUES (:email, :password, :rol, :nombre, :apellido)"), 
                         {'email': 'coordinador@sipa.com', 'password': hashed_password, 'rol': 'COORDINADOR', 'nombre': 'Coordinador', 'apellido': 'SIPA'})
            conn.commit()
            print('¡Usuario Coordinador creado con éxito!')
        else:
            conn.execute(text(f"UPDATE {target_table} SET password = :password, rol = 'COORDINADOR' WHERE email = 'coordinador@sipa.com'"),
                         {'password': hashed_password})
            conn.commit()
            print('¡Contraseña y rol actualizados con éxito!')
    else:
        print('Error: No se encontró ninguna tabla de usuarios.')
