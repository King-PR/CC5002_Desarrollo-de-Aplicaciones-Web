# models.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Region(db.Model):
    __tablename__ = 'region'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)

    comunas = db.relationship('Comuna', backref='region', lazy=True)

class Comuna(db.Model):
    __tablename__ = 'comuna'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)

    actividades = db.relationship('Actividad', backref='comuna', lazy=True)

class Actividad(db.Model):
    __tablename__ = 'actividad'
    id = db.Column(db.Integer, primary_key=True)
    comuna_id = db.Column(db.Integer, db.ForeignKey('comuna.id'), nullable=False)
    sector = db.Column(db.String(100))
    nombre = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    celular = db.Column(db.String(15))
    dia_hora_inicio = db.Column(db.DateTime, nullable=False)
    dia_hora_termino = db.Column(db.DateTime)
    descripcion = db.Column(db.String(500))

    temas = db.relationship('ActividadTema', backref='actividad', lazy=True)
    fotos = db.relationship('Foto', backref='actividad', lazy=True)
    contactos = db.relationship('ContactarPor', backref='actividad', lazy=True)

class ActividadTema(db.Model):
    __tablename__ = 'actividad_tema'
    id = db.Column(db.Integer, primary_key=True)
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
    tema = db.Column(db.String(50), nullable=False)
    glosa_otro = db.Column(db.String(15))  # solo se usa si tema == 'otro'

class Foto(db.Model):
    __tablename__ = 'foto'
    id = db.Column(db.Integer, primary_key=True)
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
    ruta_archivo = db.Column(db.String(300), nullable=False)
    nombre_archivo = db.Column(db.String(300), nullable=False)

class ContactarPor(db.Model):
    __tablename__ = 'contactar_por'
    id = db.Column(db.Integer, primary_key=True)
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
    nombre = db.Column(db.String(50), nullable=False)  # Enum equivalente
    identificador = db.Column(db.String(150), nullable=False)
