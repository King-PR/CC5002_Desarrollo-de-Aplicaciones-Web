
# Tarea 3 - Plataforma de Actividades Recreativas (Estadísticas y Comentarios)

**Nombre:** Pablo Reyes Pomés  
**Curso:** [CC5002] Desarrollo de Aplicaciones Web  
**Profesor:** José Urzúa  
**Auxiliar:** Francisco Márquez  
**Ayudantes:** Bastián Corrales, Nicolás Arancibia, Valentina Montoya  
**Fecha Entrega:** 13-06-25  

Esta entrega corresponde a la mejora de la plataforma web para gestionar actividades recreativas. A diferencia de la Tarea 2, esta nueva versión se enfoca en mejorar la **gestión de comentarios** sobre actividades, y **optimizar la funcionalidad de la interfaz**, manteniendo la base de datos en **MySQL**.

---

## Objetivos

- Mejorar la funcionalidad de los **comentarios** permitiendo agregar, editar y eliminar comentarios.
- **Refinar la validación de formularios**, incluyendo mejor control sobre fotos y contactos.
- **Optimizar el sistema de listado de actividades**, permitiendo ver detalles ampliados de cada actividad con comentarios interactivos.
- Implementar **estadísticas** detalladas con gráficos adicionales, utilizando **Chart.js**.

---

## Estructura del Proyecto

```text
📁 capturas/            # Capturas que muestran la plataforma en acción
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
│   └── 📁 exampleImgs  # Imágenes que pueden ser subidas para usar como ejemplo
📄 app.py               # Lógica principal de rutas y operaciones
📄 config.py            # Configuración de conexión a base de datos (.env)
📄 db.py                # Inicialización de la base de datos
📄 models.py            # Modelos SQLAlchemy
📄 tarea3.sql           # Script de creación de base de datos
📄 region-comuna.sql    # Inserción de regiones y comunas
📄 .env                 # Variables de entorno para conexión DB
```

---

## Funcionalidades Implementadas

### 1. **Portada (`index.html`)**
- Muestra una bienvenida y enlaces al resto de las secciones.
- Presenta las últimas 5 actividades agregadas con fecha, comuna, sector, tema y foto representativa.

### 2. **Formulario para Agregar Actividad (`agregar.html`)**
- Los usuarios pueden ingresar datos como ubicación, organizador, contacto, fechas, descripción, fotos y temas.
- Validaciones en el cliente con **JavaScript** y en el servidor con **Flask** aseguran integridad de los datos.
- Nuevas funcionalidades:
  - Subir entre **1 y 5 fotos**.
  - Selección de **múltiples medios de contacto** por actividad.
  - **Vinculación de temas múltiples** por actividad, incluyendo un campo adicional para temas "otros".

### 3. **Listado de Actividades (`actividades.html`)**
- Vista paginada (5 actividades por página).
- Los detalles de las actividades incluyen fotos ampliables y medios de contacto.
- Los comentarios sobre cada actividad se cargan y se pueden gestionar (editar/eliminar).

### 4. **Estadísticas (`estadisticas.html`)**
Gráficos generados con **Chart.js**, extraídos desde `/api/estadisticas`:
- **Gráfico de línea**: Actividades por día del mes.
- **Gráfico de torta**: Distribución por tema.
- **Gráfico de barras**: Actividades por franja horaria (mañana, mediodía, tarde) y por mes.

---

## Validaciones JavaScript

Las validaciones previas a enviar el formulario incluyen:

- **Región y comuna** obligatorias.
- **Email** con expresión regular.
- **Número celular** opcional pero validado si existe.
- Mínimo 1 **contacto** (con ID o URL válido).
- Mínimo 1 **tema** (si incluye “otro”, debe especificarse el tema).
- **Fechas válidas** y coherentes (el término debe ser posterior al inicio).
- **Descripción** obligatoria.
- Entre **1 y 5 fotos** adjuntas.

Además, se despliega un `confirm()` antes de enviar el formulario.

---

## Lógica Backend (`app.py`)

- **Rutas principales**:
  - `/` → Portada.
  - `/agregar` (GET/POST) → Formulario.
  - `/actividades` → Listado dinámico.
  - `/estadisticas` → Gráficos.
  - `/api/actividades`, `/api/estadisticas`, `/api/regiones_comunas` → APIs en JSON.
- Uso de **SQLAlchemy** y modelos para manejar relaciones entre actividades, temas, fotos, comentarios y medios de contacto.
- **Comentarios**: Se pueden agregar, editar y eliminar desde la API.
- Las fotos se renombran con **UUID** para evitar colisiones y se almacenan en `static/uploads/`.

---

## Mejoras respecto a la Tarea 2

- **Gestión avanzada de comentarios**: ahora se puede editar y eliminar comentarios.
- **Optimización del sistema de listado** de actividades, con detalles más completos y gestionables.
- **Nuevo sistema de estadísticas**: gráficos avanzados de distribución y franjas horarias.
- **Persistencia de datos**: se mantienen los comentarios, fotos y demás datos asociados a cada actividad.
- **Validación completa** de datos tanto en cliente como en servidor.

---

## Cómo ejecutar localmente

1. Crear entorno virtual (opcional):
```bash
python -m venv venv
source venv/bin/activate
```

2. Instalar dependencias necesarias:
```bash
pip install -r requirements.txt
```

3. Crear base de datos:
```bash
mysql -u cc5002 -p < tarea3.sql
mysql -u cc5002 -p < region-comuna.sql
```

4. Crear archivo `.env` con:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=cc5002
DB_PASSWORD=programacionweb
DB_NAME=tarea3
```

5. Ejecutar la app:
```bash
flask run
```

---

## Enlaces útiles

- [W3C HTML Validator](http://validator.w3.org/)
- [W3C CSS Validator](http://jigsaw.w3.org/css-validator/)
- [Chart.js](https://www.chartjs.org/)
- [Flask](https://flask.palletsprojects.com/)

--- 

## Créditos

- **Profesor:** José Urzúa  
- **Auxiliar:** Francisco Márquez  
- **Ayudantes:** Bastián Corrales, Nicolás Arancibia, Valentina Montoya  
- **Estudiante:** Pablo Reyes Pomés

---

