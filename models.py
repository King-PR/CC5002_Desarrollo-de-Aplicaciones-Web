# models.py


# Importa la instancia de la base de datos desde el módulo 'db'.
from db import db

class Region(db.Model):
    """
    Define el modelo para la tabla 'region' en la base de datos.
    Representa una región geográfica.
    """
    __tablename__ = 'region'
    # Columna para el identificador único de la región, es la clave primaria.
    id = db.Column(db.Integer, primary_key=True)
    # Columna para el nombre de la región, no puede ser nulo.
    nombre = db.Column(db.String(200), nullable=False)

    # Define la relación uno a muchos con el modelo Comuna.
    # Una región puede tener múltiples comunas.
    comunas = db.relationship('Comuna', backref='region', lazy=True)

class Comuna(db.Model):
    """
    Define el modelo para la tabla 'comuna' en la base de datos.
    Representa una comuna geográfica, asociada a una región.
    """
    __tablename__ = 'comuna'
    # Columna para el identificador único de la comuna, es la clave primaria.
    id = db.Column(db.Integer, primary_key=True)
    # Columna para el nombre de la comuna, no puede ser nulo.
    nombre = db.Column(db.String(200), nullable=False)
    # Clave foránea que enlaza la comuna a una región específica.
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)

    # Define la relación uno a muchos con el modelo Actividad.
    # Una comuna puede tener múltiples actividades.
    actividades = db.relationship('Actividad', backref='comuna', lazy=True)

class Actividad(db.Model):
    """
    Define el modelo para la tabla 'actividad' en la base de datos.
    Representa una actividad recreativa.
    """
    __tablename__ = 'actividad'
    # Columna para el identificador único de la actividad, es la clave primaria.
    id = db.Column(db.Integer, primary_key=True)
    # Clave foránea que enlaza la actividad a una comuna específica.
    comuna_id = db.Column(db.Integer, db.ForeignKey('comuna.id'), nullable=False)
    # Columna para el sector donde se realiza la actividad.
    sector = db.Column(db.String(100))
    # Columna para el nombre del organizador de la actividad, no puede ser nulo.
    nombre = db.Column(db.String(200), nullable=False)
    # Columna para el correo electrónico del organizador, no puede ser nulo.
    email = db.Column(db.String(100), nullable=False)
    # Columna para el número de celular del organizador.
    celular = db.Column(db.String(15))
    # Columna para la fecha y hora de inicio de la actividad, no puede ser nulo.
    dia_hora_inicio = db.Column(db.DateTime, nullable=False)
    # Columna para la fecha y hora de término de la actividad.
    dia_hora_termino = db.Column(db.DateTime)
    # Columna para la descripción detallada de la actividad.
    descripcion = db.Column(db.String(500))

    # Define relaciones uno a muchos con otros modelos relacionados con la actividad.
    # Una actividad puede tener múltiples temas, fotos y contactos.
    temas = db.relationship('ActividadTema', backref='actividad', lazy=True)
    fotos = db.relationship('Foto', backref='actividad', lazy=True)
    contactos = db.relationship('ContactarPor', backref='actividad', lazy=True)

class ActividadTema(db.Model):
    """
    Define el modelo para la tabla 'actividad_tema' en la base de datos.
    Representa un tema asociado a una actividad.
    """
    __tablename__ = 'actividad_tema'
    # Columna para el identificador único, es la clave primaria.
    id = db.Column(db.Integer, primary_key=True)
    # Clave foránea que enlaza el tema a una actividad específica.
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
    # Columna para el tema de la actividad, no puede ser nulo.
    tema = db.Column(db.String(50), nullable=False)
    # Columna para una glosa adicional, utilizada solo si el tema es 'otro'.
    glosa_otro = db.Column(db.String(15))

class Foto(db.Model):
    """
    Define el modelo para la tabla 'foto' en la base de datos.
    Representa una fotografía asociada a una actividad.
    """
    __tablename__ = 'foto'
    # Columna para el identificador único de la foto, es la clave primaria.
    id = db.Column(db.Integer, primary_key=True)
    # Clave foránea que enlaza la foto a una actividad específica.
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
    # Columna para la ruta completa del archivo de la foto.
    ruta_archivo = db.Column(db.String(300), nullable=False)
    # Columna para el nombre del archivo de la foto.
    nombre_archivo = db.Column(db.String(300), nullable=False)

class ContactarPor(db.Model):
    """
    Define el modelo para la tabla 'contactar_por' en la base de datos.
    Representa un método de contacto para una actividad (ej. Facebook, Instagram).
    """
    __tablename__ = 'contactar_por'
    # Columna para el identificador único, es la clave primaria.
    id = db.Column(db.Integer, primary_key=True)
    # Clave foránea que enlaza el método de contacto a una actividad específica.
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
    # Columna para el nombre del método de contacto (ej. "Facebook").
    nombre = db.Column(db.String(50), nullable=False)
    # Columna para el identificador del contacto (ej. un URL de perfil o nombre de usuario).
    identificador = db.Column(db.String(150), nullable=False)

class Comentario(db.Model):
    """
    Define el modelo para la tabla 'comentario' en la base de datos.
    Representa un comentario sobre una actividad.
    """
    __tablename__ = 'comentario'
    # Columna para el identificador único del comentario, es la clave primaria.
    id = db.Column(db.Integer, primary_key=True)
    # Columna para el nombre del autor del comentario, no puede ser nulo.
    nombre = db.Column(db.String(80), nullable=False)
    # Columna para el texto del comentario, no puede ser nulo.
    texto = db.Column(db.String(300), nullable=False)
    # Columna para la fecha y hora en que se hizo el comentario, no puede ser nulo.
    fecha = db.Column(db.DateTime, nullable=False)
    # Clave foránea que enlaza el comentario a una actividad específica.
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)

    # Define la relación uno a muchos con el modelo Actividad.
    # Una actividad puede tener múltiples comentarios.
    actividad = db.relationship('Actividad', backref='comentarios', lazy=True)
