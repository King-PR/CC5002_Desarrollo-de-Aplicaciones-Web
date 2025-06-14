# app.py

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from config import Config
from datetime import datetime
from models import db, Actividad, Foto, Comuna, Region, ActividadTema, ContactarPor
from sqlalchemy.orm import joinedload
import os
import re
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'supersecreto123'
app.config.from_object(Config)

db.init_app(app)


@app.route("/")
def index():
    actividades = Actividad.query.order_by(Actividad.dia_hora_inicio.desc()).limit(5).all()
    return render_template("index.html", actividades=actividades)


@app.route("/api/actividades")
def api_actividades():
    page = request.args.get("page", 1, type=int)
    per_page = 5

    paginacion = Actividad.query.options(
        joinedload(Actividad.comuna).joinedload(Comuna.region),
        joinedload(Actividad.temas),
        joinedload(Actividad.contactos),
        joinedload(Actividad.fotos)
    ).order_by(Actividad.dia_hora_inicio.desc()).paginate(page=page, per_page=per_page)

    resultado = []
    for a in paginacion.items:
        resultado.append({
            "dia_hora_inicio": a.dia_hora_inicio.strftime("%Y-%m-%d %H:%M"),
            "dia_hora_termino": a.dia_hora_termino.strftime("%Y-%m-%d %H:%M") if a.dia_hora_termino else None,
            "comuna": {
                "nombre": a.comuna.nombre,
                "region": a.comuna.region.nombre if a.comuna.region else "Desconocida"
            },
            "sector": a.sector,
            "temas": [{"tema": t.tema, "glosa_otro": t.glosa_otro} for t in a.temas],
            "nombre": a.nombre,
            "descripcion": a.descripcion or "",
            "email": a.email,
            "celular": a.celular,
            "contactos": [{"medio": c.nombre, "identificador": c.identificador} for c in a.contactos],
            "fotos": [{"nombre_archivo": f.nombre_archivo} for f in a.fotos],
        })

    return jsonify({
        "actividades": resultado,
        "pagina_actual": paginacion.page,
        "total_paginas": paginacion.pages
    })


@app.route("/actividades")
def ver_actividades():
    return render_template("actividades.html")


@app.route("/agregar", methods=["GET", "POST"])
def agregar_actividad():
    if request.method == "GET":
        return render_template("agregar.html")

    if request.method == "POST":
        try:
            region = request.form.get("region", "").strip()
            comuna_nombre = request.form.get("comuna", "").strip()
            sector = request.form.get("sector", "").strip()
            nombre = request.form.get("nombre", "").strip()
            email = request.form.get("email", "").strip()
            celular = request.form.get("celular", "").strip()
            inicio_str = request.form.get("inicio", "").strip()
            termino_str = request.form.get("termino", "").strip()
            descripcion = request.form.get("descripcion", "").strip()

            temas_seleccionados = request.form.getlist("tema")
            contactos_seleccionados = request.form.getlist("contacto")
            fotos = request.files.getlist("foto")

            # Validar región y comuna
            if not region:
                flash("Debe seleccionar una región.")
                return render_template("agregar.html")
            if not comuna_nombre:
                flash("Debe seleccionar una comuna.")
                return render_template("agregar.html")
            comuna = Comuna.query.filter_by(nombre=comuna_nombre).first()
            if not comuna:
                flash("Comuna no válida.")
                return render_template("agregar.html")

            # Validar sector
            if not sector or len(sector) > 100:
                flash("Sector inválido.")
                return render_template("agregar.html")

            # Validar nombre organizador
            if not nombre or len(nombre) > 200:
                flash("Nombre inválido.")
                return render_template("agregar.html")

            # Validar email con regex simple
            email_regex = r"^\S+@\S+\.\S+$"
            if not re.match(email_regex, email):
                flash("Email inválido.")
                return render_template("agregar.html")

            # Validar celular (opcional)
            if celular and not re.match(r"^\+569\d{8}$", celular):
                flash("Celular inválido. Debe tener formato +569XXXXXXXX")
                return render_template("agregar.html")

            # Validar fechas
            if not inicio_str:
                flash("Debe indicar fecha y hora de inicio.")
                return render_template("agregar.html")
            try:
                inicio = datetime.strptime(inicio_str, "%Y-%m-%dT%H:%M")
            except:
                flash("Formato fecha/hora inicio inválido.")
                return render_template("agregar.html")

            termino = None
            if termino_str:
                try:
                    termino = datetime.strptime(termino_str, "%Y-%m-%dT%H:%M")
                except:
                    flash("Formato fecha/hora término inválido.")
                    return render_template("agregar.html")
                if termino <= inicio:
                    flash("El término debe ser posterior al inicio.")
                    return render_template("agregar.html")

            # Validar descripción
            if not descripcion:
                flash("Debe ingresar descripción.")
                return render_template("agregar.html")

            # Validar temas
            if not temas_seleccionados:
                flash("Debe seleccionar al menos un tema.")
                return render_template("agregar.html")

            count_otro = 0
            for t in temas_seleccionados:
                if t == "otro":
                    count_otro += 1
                    glosa_otro = request.form.get(f"tema_otro_{count_otro}", "").strip()
                    if not glosa_otro or len(glosa_otro) < 3 or len(glosa_otro) > 15:
                        flash(f"Tema 'otro' #{count_otro} inválido.")
                        return render_template("agregar.html")

            # Validar contactos
            if not contactos_seleccionados:
                flash("Debe seleccionar al menos un método de contacto.")
                return render_template("agregar.html")

            contactos_validos = ['whatsapp', 'telegram', 'x', 'instagram', 'tiktok', 'otra']
            for medio in contactos_seleccionados:
                if medio not in contactos_validos:
                    flash(f"Método de contacto inválido: {medio}")
                    return render_template("agregar.html")

                identificador = request.form.get(f"id_contacto_{medio}", "").strip()
                if not identificador or len(identificador) < 4 or len(identificador) > 50:
                    flash(f"ID de contacto para {medio} inválido.")
                    return render_template("agregar.html")

            # Validar cantidad de fotos
            if not fotos or len(fotos) < 1 or len(fotos) > 5:
                flash("Debe subir entre 1 y 5 fotos.")
                return render_template("agregar.html")

            # Guardar actividad
            nueva_actividad = Actividad(
                comuna_id=comuna.id,
                sector=sector,
                nombre=nombre,
                email=email,
                celular=celular,
                dia_hora_inicio=inicio,
                dia_hora_termino=termino,
                descripcion=descripcion
            )
            db.session.add(nueva_actividad)
            db.session.flush()

            # Insertar temas
            count_otro = 0
            for t in temas_seleccionados:
                glosa_otro = None
                if t == "otro":
                    count_otro += 1
                    glosa_otro = request.form.get(f"tema_otro_{count_otro}", "").strip()
                tema_registro = ActividadTema(
                    actividad_id=nueva_actividad.id,
                    tema=t,
                    glosa_otro=glosa_otro
                )
                db.session.add(tema_registro)

            # Insertar contactos
            for medio in contactos_seleccionados:
                identificador = request.form.get(f"id_contacto_{medio}", "").strip()
                contacto = ContactarPor(
                    actividad_id=nueva_actividad.id,
                    nombre=medio,
                    identificador=identificador
                )
                db.session.add(contacto)

            # Insertar fotos con renombrado para evitar colisiones
            for foto in fotos:
                if foto and foto.filename != "":
                    nombre_original = secure_filename(foto.filename)
                    extension = os.path.splitext(nombre_original)[1]
                    nombre_unico = f"{uuid.uuid4().hex}{extension}"

                    ruta = os.path.join("static", "uploads", nombre_unico)
                    foto.save(ruta)

                    nueva_foto = Foto(
                        actividad_id=nueva_actividad.id,
                        ruta_archivo=ruta,
                        nombre_archivo=nombre_unico
                    )
                    db.session.add(nueva_foto)

            db.session.commit()
            flash("Actividad agregada exitosamente.")
            return redirect(url_for("ver_actividades"))

        except Exception as e:
            print("Error al agregar actividad:", e)
            db.session.rollback()
            flash("Error interno al agregar la actividad.")
            return render_template("agregar.html")


@app.route("/estadisticas")
def ver_estadisticas():
    return render_template("estadisticas.html")


@app.route("/api/estadisticas")
def api_estadisticas():
    actividades = Actividad.query.all()
    datos = []
    for actividad in actividades:
        temas_lista = []
        if actividad.temas:
            for t in actividad.temas:
                tema_real = t.glosa_otro if t.tema == 'otro' else t.tema
                temas_lista.append(tema_real)
        else:
            temas_lista.append("Otro")

        datos.append({
            'inicio': actividad.dia_hora_inicio.isoformat(),
            'termino': actividad.dia_hora_termino.isoformat() if actividad.dia_hora_termino else None,
            'comuna': actividad.comuna.nombre if actividad.comuna else "Desconocida",
            'temas': temas_lista,  # <-- enviar lista de temas
            'nombre': actividad.nombre,
            'descripcion': actividad.descripcion or ""
        })
    return jsonify(datos)


@app.route("/api/regiones_comunas")
def api_regiones_comunas():
    regiones = Region.query.options(db.joinedload(Region.comunas)).all()
    data = {region.nombre: [comuna.nombre for comuna in region.comunas] for region in regiones}
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
