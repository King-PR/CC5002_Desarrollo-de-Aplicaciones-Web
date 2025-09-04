# db.py


from flask_sqlalchemy import SQLAlchemy

# Crea una instancia de SQLAlchemy. Esta instancia no está aún ligada a la aplicación Flask.
# Permite definir modelos de base de datos antes de que la aplicación sea completamente inicializada.
db = SQLAlchemy()

def init_db(app):
    """
    Inicializa la instancia de SQLAlchemy, ligándola a la aplicación Flask.
    Este paso es crucial para que SQLAlchemy pueda acceder a la configuración de la aplicación
    y establecer la conexión con la base de datos.

    Args:
        app: La instancia de la aplicación Flask.
    """
    db.init_app(app)
