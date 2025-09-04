# config.py


import os
from dotenv import load_dotenv

# Carga las variables de entorno desde un archivo .env (si existe).
# Esto permite configurar la aplicación sin codificar información sensible directamente.
load_dotenv()

class Config:
    """
    Clase de configuración principal para la aplicación Flask.
    Define parámetros como la conexión a la base de datos.
    """

    # Configura la URI de la base de datos utilizando variables de entorno.
    # Esto asegura que las credenciales de la base de datos no estén directamente
    # en el código fuente, mejorando la seguridad.
    # El formato es "mysql+pymysql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_DB".
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

    # Deshabilita el seguimiento de modificaciones de objetos de SQLAlchemy.
    # Establecerlo en False ahorra memoria y recursos si no se necesitan las señales
    # de seguimiento de objetos de SQLAlchemy.
    SQLALCHEMY_TRACK_MODIFICATIONS = False
