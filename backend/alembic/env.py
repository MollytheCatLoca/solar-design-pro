import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# --- INICIO DE MODIFICACIONES ---

# Añade el directorio raíz de tu aplicación (backend/) al sys.path
# para que Alembic pueda encontrar el módulo 'app'.
# __file__ es alembic/env.py, dirname(__file__) es alembic/,
# dirname(dirname(__file__)) es backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Ahora importa tu Base y la URL de la base de datos desde tu aplicación
from app.core.config import settings
from app.database import Base
import app.models  # Asegúrate de que tus modelos están importados para que Alembic los reconozca

# --- FIN DE MODIFICACIONES ---

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

# --- INICIO DE MODIFICACIÓN ---
# Debug: Imprimir las tablas conocidas por Base.metadata
print("--- Alembic env.py Debug ---")
print(f"Base.metadata.tables.keys(): {Base.metadata.tables.keys()}")
print("-----------------------------")
target_metadata = Base.metadata  # Usa la Base importada de tus modelos
# --- FIN DE MODIFICACIÓN ---

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = settings.DATABASE_URL # Usar la URL de settings
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,             # Añadido para mejor comparación de tipos
        compare_server_default=True    # Añadido para mejor comparación de server_default
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    ini_config_section = config.get_section(config.config_ini_section)
    ini_config_section["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = engine_from_config(
        ini_config_section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,             # Añadido
            compare_server_default=True    # Añadido
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()