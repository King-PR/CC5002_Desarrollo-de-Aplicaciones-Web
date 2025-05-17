# Tarea 2 - Plataforma de Actividades Recreativas (Versión Flask + MySQL)

**Nombre:** Pablo Reyes Pomés  
**Curso:** [CC5002] Desarrollo de Aplicaciones Web  
**Profesor:** José Urzúa  
**Auxiliar:** Francisco Márquez  
**Ayudantes:** Bastián Corrales, Nicolás Arancibia, Valentina Montoya  
**Fecha Entrega:** 16-05-25  

Esta entrega corresponde al desarrollo completo de una plataforma web para gestionar actividades recreativas. A diferencia de la Tarea 1 (prototipo estático), esta nueva versión implementa funcionalidades reales usando **Flask** como framework backend y **MySQL** como sistema gestor de base de datos.

---

## Objetivos

- Crear una aplicación web funcional y validada que permita **registrar**, **visualizar** y **analizar actividades recreativas**.
- Implementar **formulario real de ingreso de actividades**, **paginación**, y **gráficos estadísticos** basados en los datos ingresados dinámicamente.
- Corregir limitaciones de la Tarea 1, permitiendo **múltiples medios de contacto** y **múltiples temas por actividad**.

---

## Estructura del Proyecto

```text
📁 capturas/            # Capturas que muestran a plataforma en acción
📁 templates/
│   ├── index.html
│   ├── agregar.html
│   ├── actividades.html
│   └── estadisticas.html
📁 static/
│   ├── style.css
│   ├── validaciones.js
│   ├── listado.js
│   ├── estadisticas.js
│   ├── 📁 uploads/     # Imágenes que serán subidas por usuarios
│   └── 📁 exampleImgs  # Imágenes que pueden ser subidas para usar como ej.

📄 app.py               # Lógica principal de rutas y operaciones
📄 config.py            # Configuración de conexión a base de datos (.env)
📄 db.py                # Inicialización de la base de datos
📄 models.py            # Modelos SQLAlchemy
📄 tarea2.sql           # Script de creación de base de datos
📄 region-comuna.sql    # Inserción de regiones y comunas
📄 .env                 # Variables de entorno para conexión DB
```

---

## Validación de HTML y CSS

- El archivo CSS ha sido **validado exitosamente** mediante [jigsaw.w3.org/css-validator/](http://jigsaw.w3.org/css-validator/) (By direct input).
- Para los HTML que contienen sintaxis de Flask (`{{ url_for(...) }}`), se debe **copiar el código fuente desde el navegador (View Page Source)** y validar ese contenido en [validator.w3.org](http://validator.w3.org/) usando la opción "Direct Input".  
  ⚠️ **No subir directamente los archivos .html** ya que serán malinterpretados por los validadores debido a la sintaxis de Jinja2.

---

## Funcionalidades Implementadas

### 1. **Portada (`index.html`)**
- Muestra bienvenida y enlaces al resto de las secciones.
- Presenta las últimas 5 actividades agregadas con fecha, comuna, sector, tema y foto representativa.

### 2. **Formulario para Agregar Actividad (`agregar.html`)**
- Se ingresan datos como ubicación, organizador, contacto, fechas, descripción, fotos y temas.
- Validaciones **cliente (JavaScript)** y **servidor (Flask)** aseguran integridad de datos.
- Se corrige una limitación de la Tarea 1, permitiendo:
  - **Seleccionar múltiples temas** por actividad.
  - **Seleccionar múltiples formas de contacto**, cada una con su identificador.
  - Subir entre **1 y 5 fotos**.
- Se evita pérdida de información si hay errores al completar el formulario (gracias a validaciones previas a `POST`).

### 3. **Listado de Actividades (`actividades.html`)**
- Vista paginada (5 actividades por página).
- Las actividades se muestran en una tabla. Al hacer clic, se despliega el detalle (dinámico) incluyendo fotos ampliables y medios de contacto.

### 4. **Estadísticas (`estadisticas.html`)**
Gráficos generados con Chart.js, extraídos desde `/api/estadisticas`:
- **Gráfico de línea**: Actividades por día del mes de abril.
- **Gráfico de torta**: Distribución por tema.
- **Gráfico de barras**: Actividades por franja horaria (mañana, mediodía, tarde) y por mes.

---

## Validaciones JavaScript

Las validaciones previas a enviar el formulario incluyen:

- Región y comuna obligatorias.
- Email con expresión regular.
- Número celular opcional pero validado si existe.
- Mínimo 1 contacto (con ID o URL válido).
- Mínimo 1 tema (si incluye “otro”, debe especificarse el tema).
- Fechas válidas y coherentes (el término debe ser posterior al inicio).
- Descripción obligatoria.
- Entre 1 y 5 fotos adjuntas.

Además, se despliega un `confirm()` antes de enviar.

---

## Lógica Backend (`app.py`)

- Se definen rutas principales:
  - `/` → portada.
  - `/agregar` (GET/POST) → formulario.
  - `/actividades` → listado dinámico.
  - `/estadisticas` → gráficos.
  - `/api/actividades`, `/api/estadisticas`, `/api/regiones_comunas` → APIs en JSON.
- Uso de SQLAlchemy y modelos para manejar relaciones entre actividades, temas, fotos y medios de contacto.
- Las fotos se renombran con UUID para evitar colisiones y se almacenan en `static/uploads/`.

---

## Mejoras respecto a la Tarea 1

- **Validaciones completas** en cliente y servidor.
- **Persistencia real** de actividades mediante base de datos MySQL.
- **Vinculación entre regiones y comunas** a través de archivos SQL (`region-comuna.sql`).
- Corrección de problema de “solo un tema/contacto” en el prototipo.
- No se pierde el formulario si hay errores (validación previa).
- HTML y CSS **validados correctamente** según estándares W3C.

---

## Cómo ejecutar localmente

1. Crear entorno virtual (opcional):
```bash
python -m venv venv
source venv/bin/activate
```

2. Instalar dependencias necesarias (asegúrate de tener `Flask`, `Flask_SQLAlchemy`, `python-dotenv`, `pymysql`, `Werkzeug`):

```bash
pip install -r requirements.txt
```

3. Crear base de datos:
```bash
mysql -u cc5002 -p < tarea2.sql
mysql -u cc5002 -p < region-comuna.sql
```

4. Crear archivo `.env` con:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=cc5002
DB_PASSWORD=programacionweb
DB_NAME=tarea2
```

5. Ejecutar la app:

```bash
flask run
```

---

## Créditos

- **Profesor:** José Urzúa
- **Auxiliar:** Francisco Márquez  
- **Ayudantes:** Bastián Corrales, Nicolás Arancibia, Valentina Montoya  
- **Estudiante:** Pablo Reyes Pomés

---

## Enlaces útiles

- [W3C HTML Validator](http://validator.w3.org/)
- [W3C CSS Validator](http://jigsaw.w3.org/css-validator/)
- [Chart.js](https://www.chartjs.org/)
- [Flask](https://flask.palletsprojects.com/)
