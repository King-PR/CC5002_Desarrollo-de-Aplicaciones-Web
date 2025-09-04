# app.py


from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from config import Config
from datetime import datetime
from models import db, Actividad, Foto, Comuna, Region, ActividadTema, ContactarPor, Comentario
from sqlalchemy.orm import joinedload
import os
import re
import uuid
from werkzeug.utils import secure_filename

# Crea una instancia de la aplicación Flask.
app = Flask(__name__)
# Configura una clave secreta para la aplicación, necesaria para sesiones y mensajes flash.
# Se recomienda usar una variable de entorno en entornos de producción por seguridad.
app.secret_key = 'supersecreto123'
# Carga la configuración de la aplicación desde el objeto Config definido en config.py.
app.config.from_object(Config)

# Inicializa la base de datos con la aplicación Flask.
db.init_app(app)

@app.route("/")
def index():
    """
    Ruta para la página de inicio de la aplicación.
    Muestra las últimas 5 actividades agregadas.
    """
    # Consulta las últimas 5 actividades, ordenadas por el ID para mostrar las actividades más recientes primero.
    actividades = Actividad.query.order_by(Actividad.id.desc()).limit(5).all()

    # Renderiza la plantilla 'index.html' pasando las actividades obtenidas.
    return render_template("index.html", actividades=actividades)


@app.route("/api/actividades")
def api_actividades():
    """
    Endpoint de API para obtener un listado paginado de actividades.
    Permite a los clientes solicitar actividades por número de página.
    """
    # Obtiene el número de página de los argumentos de la URL, por defecto es 1.
    page = request.args.get("page", 1, type=int)
    # Define la cantidad de actividades por página.
    per_page = 5

    # Consulta las actividades con paginación, cargando las relaciones necesarias
    # para Comuna (con su Región), Temas, Contactos y Fotos.
    paginacion = Actividad.query.options(
        joinedload(Actividad.comuna).joinedload(Comuna.region),
        joinedload(Actividad.temas),
        joinedload(Actividad.contactos),
        joinedload(Actividad.fotos)
    ).order_by(Actividad.dia_hora_inicio.desc()).paginate(page=page, per_page=per_page)

    resultado = []
    # Itera sobre los elementos de la página actual y formatea los datos para la respuesta JSON.
    for actividad in paginacion.items:
        resultado.append({
            "id": actividad.id,
            "dia_hora_inicio": actividad.dia_hora_inicio.strftime("%Y-%m-%d %H:%M"),
            "dia_hora_termino": actividad.dia_hora_termino.strftime("%Y-%m-%d %H:%M") if actividad.dia_hora_termino else None,
            "comuna": {
                "nombre": actividad.comuna.nombre,
                "region": actividad.comuna.region.nombre if actividad.comuna.region else "Desconocida"
            },
            "sector": actividad.sector,
            # Lista los temas asociados a la actividad, incluyendo la glosa si el tema es 'otro'.
            "temas": [{"tema": t.tema, "glosa_otro": t.glosa_otro} for t in actividad.temas],
            "nombre": actividad.nombre,
            "descripcion": actividad.descripcion or "",
            "email": actividad.email,
            "celular": actividad.celular,
            # Lista los contactos asociados a la actividad.
            "contactos": [{"medio": c.nombre, "identificador": c.identificador} for c in actividad.contactos],
            # Lista las fotos asociadas a la actividad, solo con el nombre del archivo.
            "fotos": [{"nombre_archivo": f.nombre_archivo} for f in actividad.fotos],
        })

    # Devuelve los datos en formato JSON, incluyendo las actividades y la información de paginación.
    return jsonify({
        "actividades": resultado,
        "pagina_actual": paginacion.page,
        "total_paginas": paginacion.pages
    })

@app.route("/api/actividades/<int:actividad_id>")
def api_get_actividad_by_id(actividad_id):
    """
    Endpoint de API para obtener los detalles de una sola actividad por su ID.
    """
    # Consulta una actividad específica por su ID, cargando sus relaciones.
    act = Actividad.query.options(
        joinedload(Actividad.comuna).joinedload(Comuna.region),
        joinedload(Actividad.temas),
        joinedload(Actividad.contactos),
        joinedload(Actividad.fotos)
    ).filter_by(id=actividad_id).first()

    # Si la actividad no se encuentra, devuelve un error 404.
    if not act:
        return jsonify({"message": "Actividad no encontrada"}), 404

    # Formatea los datos de la actividad para la respuesta JSON.
    resultado = {
        "id": act.id,
        "dia_hora_inicio": act.dia_hora_inicio.strftime("%Y-%m-%d %H:%M"),
        "dia_hora_termino": act.dia_hora_termino.strftime("%Y-%m-%d %H:%M") if act.dia_hora_termino else None,
        "comuna": {
            "nombre": act.comuna.nombre,
            "region": act.comuna.region.nombre if act.comuna.region else "Desconocida"
        },
        "sector": act.sector,
        "temas": [{"tema": t.tema, "glosa_otro": t.glosa_otro} for t in act.temas],
        "nombre": act.nombre,
        "descripcion": act.descripcion or "",
        "email": act.email,
        "celular": act.celular,
        "contactos": [{"medio": c.nombre, "identificador": c.identificador} for c in act.contactos],
        "fotos": [{"nombre_archivo": f.nombre_archivo} for f in act.fotos],
    }
    # Devuelve los detalles de la actividad en formato JSON.
    return jsonify(resultado)

@app.route("/actividades")
def ver_actividades():
    """
    Ruta para la página de listado completo de actividades.
    Permite resaltar una actividad específica si se pasa su ID en la URL.
    """
    # Obtiene el ID de la actividad a resaltar de los argumentos de la URL.
    highlight_id = request.args.get('highlight_id', type=int)
    # Renderiza la plantilla 'actividades.html' pasando el ID para que JavaScript lo utilice.
    return render_template("actividades.html", highlight_id=highlight_id)

@app.route("/agregar", methods=["GET", "POST"])
def agregar_actividad():
    """
    Ruta para agregar una nueva actividad.
    Maneja la visualización del formulario (GET) y el procesamiento del envío (POST).
    """
    if request.method == "GET":
        # Si la solicitud es GET, simplemente renderiza el formulario para agregar actividades.
        return render_template("agregar.html")

    if request.method == "POST":
        try:
            # Recupera los datos del formulario.
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

            # --- Validaciones de campos ---
            # Valida que se haya seleccionado una región.
            if not region:
                flash("Debe seleccionar una región.")
                return render_template("agregar.html")
            # Valida que se haya seleccionado una comuna y que sea válida.
            if not comuna_nombre:
                flash("Debe seleccionar una comuna.")
                return render_template("agregar.html")
            comuna = Comuna.query.filter_by(nombre=comuna_nombre).first()
            if not comuna:
                flash("Comuna no válida.")
                return render_template("agregar.html")

            # Valida el campo sector.
            if not sector or len(sector) > 100:
                flash("Sector inválido.")
                return render_template("agregar.html")

            # Valida el campo nombre del organizador.
            if not nombre or len(nombre) > 200:
                flash("Nombre inválido.")
                return render_template("agregar.html")

            # Valida el formato del email usando una expresión regular simple.
            email_regex = r"^\S+@\S+\.\S+$"
            if not re.match(email_regex, email):
                flash("Email inválido.")
                return render_template("agregar.html")

            # Valida el formato del celular si se proporciona.
            if celular and not re.match(r"^\+569\d{8}$", celular):
                flash("Celular inválido. Debe tener formato +569XXXXXXXX")
                return render_template("agregar.html")

            # Valida la fecha y hora de inicio.
            if not inicio_str:
                flash("Debe indicar fecha y hora de inicio.")
                return render_template("agregar.html")
            try:
                inicio = datetime.strptime(inicio_str, "%Y-%m-%dT%H:%M")
            except ValueError:
                flash("Formato fecha/hora inicio inválido.")
                return render_template("agregar.html")

            # Valida la fecha y hora de término si se proporciona.
            termino = None
            if termino_str:
                try:
                    termino = datetime.strptime(termino_str, "%Y-%m-%dT%H:%M")
                except ValueError:
                    flash("Formato fecha/hora término inválido.")
                    return render_template("agregar.html")
                # Asegura que la fecha de término sea posterior a la de inicio.
                if termino <= inicio:
                    flash("El término debe ser posterior al inicio.")
                    return render_template("agregar.html")

            # Valida la descripción de la actividad.
            if not descripcion:
                flash("Debe ingresar descripción.")
                return render_template("agregar.html")

            # Valida que se haya seleccionado al menos un tema.
            if not temas_seleccionados:
                flash("Debe seleccionar al menos un tema.")
                return render_template("agregar.html")

            # Valida el campo 'glosa_otro' si el tema 'otro' fue seleccionado.
            count_otro = 0
            for t in temas_seleccionados:
                if t == "otro":
                    count_otro += 1
                    glosa_otro = request.form.get(f"tema_otro_{count_otro}", "").strip()
                    if not glosa_otro or len(glosa_otro) < 3 or len(glosa_otro) > 15:
                        flash(f"Tema 'otro' #{count_otro} inválido.")
                        return render_template("agregar.html")

            # Valida que se haya seleccionado al menos un método de contacto.
            if not contactos_seleccionados:
                flash("Debe seleccionar al menos un método de contacto.")
                return render_template("agregar.html")

            # Define los métodos de contacto válidos y valida los identificadores.
            contactos_validos = ['whatsapp', 'telegram', 'x', 'instagram', 'tiktok', 'otra']
            for medio in contactos_seleccionados:
                if medio not in contactos_validos:
                    flash(f"Método de contacto inválido: {medio}")
                    return render_template("agregar.html")

                identificador = request.form.get(f"id_contacto_{medio}", "").strip()
                if not identificador or len(identificador) < 4 or len(identificador) > 50:
                    flash(f"ID de contacto para {medio} inválido.")
                    return render_template("agregar.html")

            # Valida la cantidad de fotos subidas.
            if not fotos or len(fotos) < 1 or len(fotos) > 5:
                flash("Debe subir entre 1 y 5 fotos.")
                return render_template("agregar.html")

            # --- Guardado de datos en la base de datos ---
            # Crea una nueva instancia de Actividad con los datos validados.
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
            # Agrega la nueva actividad a la sesión de la base de datos.
            db.session.add(nueva_actividad)
            # Guarda los cambios pendientes en la base de datos y obtiene el ID de la nueva actividad.
            db.session.flush()

            # Inserta los temas asociados a la actividad.
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

            # Inserta los métodos de contacto asociados a la actividad.
            for medio in contactos_seleccionados:
                identificador = request.form.get(f"id_contacto_{medio}", "").strip()
                contacto = ContactarPor(
                    actividad_id=nueva_actividad.id,
                    nombre=medio,
                    identificador=identificador
                )
                db.session.add(contacto)

            # Procesa y guarda las fotos subidas.
            for foto in fotos:
                if foto and foto.filename != "":
                    # Limpia el nombre del archivo para seguridad.
                    nombre_original = secure_filename(foto.filename)
                    # Obtiene la extensión del archivo.
                    extension = os.path.splitext(nombre_original)[1]
                    # Genera un nombre único para el archivo para evitar colisiones.
                    nombre_unico = f"{uuid.uuid4().hex}{extension}"

                    # Crea el directorio de carga si no existe.
                    upload_folder = os.path.join("static", "uploads")
                    os.makedirs(upload_folder, exist_ok=True)
                    # Define la ruta completa donde se guardará la foto.
                    ruta = os.path.join(upload_folder, nombre_unico)
                    # Guarda el archivo en el sistema de archivos.
                    foto.save(ruta)

                    # Crea una nueva instancia de Foto y la agrega a la sesión de la base de datos.
                    nueva_foto = Foto(
                        actividad_id=nueva_actividad.id,
                        ruta_archivo=ruta,
                        nombre_archivo=nombre_unico
                    )
                    db.session.add(nueva_foto)

            # Confirma todas las transacciones en la base de datos.
            db.session.commit()
            # Muestra un mensaje de éxito al usuario.
            flash("Actividad agregada exitosamente.")
            # Redirige a la página de listado de actividades.
            return redirect(url_for("ver_actividades"))

        except Exception as e:
            # Captura cualquier error durante el proceso.
            print("Error al agregar actividad:", e)
            # Revierte cualquier cambio pendiente en la base de datos.
            db.session.rollback()
            # Muestra un mensaje de error al usuario, incluyendo el error para depuración.
            flash(f"Error interno al agregar la actividad: {e}")
            # Vuelve a renderizar el formulario para que el usuario pueda corregir.
            return render_template("agregar.html")

@app.route("/estadisticas")
def ver_estadisticas():
    """
    Ruta para la página de estadísticas de actividades.
    Simplemente renderiza la plantilla HTML correspondiente.
    """
    return render_template("estadisticas.html")

@app.route("/api/estadisticas")
def api_estadisticas():
    """
    Endpoint de API para obtener los datos brutos de las actividades para generar estadísticas.
    """
    # Recupera todas las actividades de la base de datos.
    actividades = Actividad.query.all()
    datos = []
    # Itera sobre cada actividad y formatea los datos relevantes.
    for actividad in actividades:
        temas_lista = []
        if actividad.temas:
            for t in actividad.temas:
                # Obtiene el tema real, usando 'glosa_otro' si el tema principal es 'otro'.
                tema_real = t.glosa_otro if t.tema == 'otro' else t.tema
                temas_lista.append(tema_real)
        else:
            temas_lista.append("Otro")

        datos.append({
            'inicio': actividad.dia_hora_inicio.isoformat(),
            'termino': actividad.dia_hora_termino.isoformat() if actividad.dia_hora_termino else None,
            'comuna': actividad.comuna.nombre if actividad.comuna else "Desconocida",
            'temas': temas_lista,
            'nombre': actividad.nombre,
            'descripcion': actividad.descripcion or ""
        })
    # Devuelve los datos en formato JSON.
    return jsonify(datos)

@app.route("/api/regiones_comunas")
def api_regiones_comunas():
    """
    Endpoint de API para obtener una lista de regiones y sus comunas asociadas.
    Útil para poblar selectores en formularios.
    """
    # Consulta todas las regiones, cargando sus comunas de forma optimizada.
    regiones = Region.query.options(db.joinedload(Region.comunas)).all()
    # Crea un diccionario donde la clave es el nombre de la región y el valor es una lista de nombres de comunas.
    data = {region.nombre: [comuna.nombre for comuna in region.comunas] for region in regiones}
    # Devuelve los datos en formato JSON.
    return jsonify(data)

@app.route("/api/comentarios/<int:actividad_id>")
def obtener_comentarios(actividad_id):
    """
    Endpoint de API para obtener todos los comentarios de una actividad específica.
    """
    # Consulta los comentarios asociados a una actividad, ordenados por fecha.
    comentarios = Comentario.query.filter_by(actividad_id=actividad_id).order_by(Comentario.fecha.desc()).all()
    # Formatea los comentarios para la respuesta JSON.
    return jsonify([{
        "id": c.id,
        "nombre": c.nombre,
        "texto": c.texto,
        "fecha": c.fecha.strftime("%Y-%m-%d %H:%M")
    } for c in comentarios])

@app.route("/api/comentarios/<int:actividad_id>", methods=["POST"])
def agregar_comentario(actividad_id):
    """
    Endpoint de API para agregar un nuevo comentario a una actividad.
    Maneja la recepción de datos JSON y la validación de los mismos.
    """
    data = request.get_json()
    nombre = data.get("nombre", "").strip()
    texto = data.get("texto", "").strip()

    errores = []
    # Valida la longitud y existencia del nombre del comentarista.
    if not nombre or len(nombre) < 3 or len(nombre) > 80:
        errores.append("Nombre inválido.")
    # Valida la longitud y existencia del texto del comentario.
    if not texto or len(texto) < 5 or len(texto) > 300:
        errores.append("Texto del comentario inválido.")

    # Si hay errores de validación, devuelve una respuesta JSON con los errores y código 400.
    if errores:
        return jsonify({"success": False, "errores": errores}), 400

    # Crea una nueva instancia de Comentario.
    comentario = Comentario(
        nombre=nombre,
        texto=texto,
        fecha=datetime.now(),
        actividad_id=actividad_id
    )
    try:
        # Agrega el comentario a la sesión y lo guarda en la base de datos.
        db.session.add(comentario)
        db.session.commit()
        # Devuelve una respuesta de éxito.
        return jsonify({"success": True})
    except Exception as e:
        # Si ocurre un error, revierte la transacción y devuelve un mensaje de error.
        db.session.rollback()
        print(f"Error al agregar comentario: {e}")
        return jsonify({"success": False, "errores": ["Error al guardar el comentario."]}), 500

@app.route("/api/comentarios/<int:actividad_id>/<int:comentario_id>", methods=["DELETE"])
def eliminar_comentario(actividad_id, comentario_id):
    """
    Endpoint de API para eliminar un comentario específico.
    Verifica que el comentario pertenezca a la actividad correcta.
    """
    try:
        # Intenta obtener el comentario por su ID.
        comentario = db.session.get(Comentario, comentario_id)
        # Verifica si el comentario existe y si pertenece a la actividad especificada.
        if not comentario or comentario.actividad_id != actividad_id:
            return jsonify({"success": False, "message": "Comentario no encontrado o no pertenece a esta actividad"}), 404

        # Elimina el comentario de la sesión y de la base de datos.
        db.session.delete(comentario)
        db.session.commit()
        # Devuelve un mensaje de éxito.
        return jsonify({"success": True, "message": "Comentario eliminado"})
    except Exception as e:
        # Si ocurre un error, revierte la transacción y devuelve un mensaje de error.
        db.session.rollback()
        print(f"Error al eliminar comentario (backend): {e}")
        return jsonify({"success": False, "message": "Error al eliminar comentario"}), 500

@app.route("/api/comentarios/<int:actividad_id>/<int:comentario_id>", methods=["PUT"])
def editar_comentario(actividad_id, comentario_id):
    """
    Endpoint de API para editar un comentario existente.
    Recibe los datos actualizados en formato JSON y realiza validaciones.
    """
    data = request.get_json()
    nombre = data.get("nombre", "").strip()
    texto = data.get("texto", "").strip()

    errores = []
    # Valida el nombre y texto actualizados.
    if not nombre or len(nombre) < 3 or len(nombre) > 80:
        errores.append("Nombre inválido.")
    if not texto or len(texto) < 5 or len(texto) > 300:
        errores.append("Texto inválido.")

    # Si hay errores, devuelve una respuesta con los errores y código 400.
    if errores:
        return jsonify({"success": False, "errores": errores}), 400

    try:
        # Intenta obtener el comentario a editar.
        comentario = db.session.get(Comentario, comentario_id)
        # Verifica si el comentario existe y si pertenece a la actividad especificada.
        if not comentario or comentario.actividad_id != actividad_id:
            return jsonify({"success": False, "message": "Comentario no encontrado o no pertenece a esta actividad"}), 404

        # Actualiza el nombre y el texto del comentario.
        comentario.nombre = nombre
        comentario.texto = texto
        # Guarda los cambios en la base de datos.
        db.session.commit()

        # Devuelve un mensaje de éxito.
        return jsonify({"success": True, "message": "Comentario editado"})
    except Exception as e:
        # Si ocurre un error, revierte la transacción y devuelve un mensaje de error.
        db.session.rollback()
        print(f"Error al editar comentario (backend): {e}")
        return jsonify({"success": False, "message": "Error al editar comentario"}), 500

if __name__ == "__main__":
    # Ejecuta la aplicación Flask en modo depuración.
    # El modo depuración es útil para desarrollo ya que recarga el servidor automáticamente
    # y muestra información de errores detallada.
    app.run(debug=True)
