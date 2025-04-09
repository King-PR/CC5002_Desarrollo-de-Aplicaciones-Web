
# Tarea 1 - Plataforma de Actividades Recreativas

**Nombre:** Pablo Reyes Pomés  
**Curso:** [CC5002] Desarrollo de Aplicaciones Web  
**Profesor:** José Urzúa  
**Auxiliar:** Francisco Márquez  
**Ayudantes:** Bastián Corrales, Nicolás Arancibia, Valentina Montoya  
**Fecha Entrega:** 08-04-25  

Esta entrega corresponde al **prototipo de la aplicación web** para gestionar actividades recreativas. La plataforma permite **agregar actividades**, **ver un listado de actividades** y **consultar estadísticas** a través de gráficos interactivos.

---

## Objetivo de la entrega

El objetivo principal es desarrollar un prototipo que permita gestionar actividades recreativas, cumpliendo con los siguientes requisitos:

1. **Portada**: Con un mensaje de bienvenida y un menú con las siguientes opciones:
   - Agregar actividad
   - Ver listado de actividades
   - Estadísticas

2. **Formulario para agregar actividad**: Con campos de validación como región, comuna, organizador, hora, descripción, etc.

3. **Listado de actividades**: Mostrar las actividades con más detalles al hacer clic en cada una, incluyendo fotos ampliables.

4. **Estadísticas**: Mostrar gráficos con las siguientes métricas:
   - Cantidad de actividades por día
   - Cantidad de actividades por tipo
   - Actividades por hora (mañana, mediodía, tarde)

---

## Estructura de Archivos

```text
/'CC5002 (Webs); Tarea 1, Plataforma Actividades Recreativas - Pablo Reyes Pomés'
│
├── index.html                # Página principal con el mensaje de bienvenida y el listado de actividades.
├── agregar.html              # Formulario para agregar nuevas actividades.
├── actividades.html          # Página que muestra el listado de actividades con detalle.
├── estadisticas.html         # Página que contiene los gráficos de estadísticas.
│
├── style.css                 # Archivo CSS con los estilos generales del proyecto.
├── script.js                 # Lógica en JavaScript para validar formularios, manejar interactividad, y mostrar detalles.
├── estadisticas.js           # Archivo JavaScript que maneja la creación de los gráficos con Chart.js.
│
└── img/                      # Carpeta que contiene las imágenes de ejemplo utilizadas en el proyecto.
    ├── spinning.jpg
    ├── foto.jpg
    ├── musica.jpg
    ├── costura.jpg
    ├── juegos.jpg
    ├── ciencia1.jpg
    ├── ciencia2.jpg
    ├── baile1.jpg
    ├── baile2.jpg
    └── baile3.jpg
```

---

## Descripción del Proyecto

### 1. **Portada**
   - La **portada** muestra un mensaje de bienvenida y proporciona enlaces al resto de la aplicación.
   - Incluye un **listado de las últimas 5 actividades** agregadas con datos relevantes (inicio, término, comuna, sector, tema y foto).

### 2. **Formulario para agregar actividad**
   - El formulario de entrada permite agregar información sobre la actividad, organizador y lugar.
   - Se valida completamente en **JavaScript**, asegurando que todos los campos (como email, fecha, celular, etc.) tengan un formato correcto.
   - Permite agregar **hasta 5 fotos** y al hacer clic en "Agregar actividad", aparece una confirmación antes de enviar los datos.

### 3. **Listado de actividades**
   - Se muestra una **tabla** con las actividades registradas.
   - Al hacer clic en una fila, se muestra el **detalle completo** de la actividad seleccionada, incluidas las fotos de tamaño 320x240 px.
   - Las imágenes pueden ser **ampliadas** a 800x600 px al hacer clic sobre ellas.

### 4. **Estadísticas**
   - **Tres gráficos interactivos** generados con **Chart.js**:
     - Gráfico de **líneas**: Cantidad de actividades por día.
     - Gráfico de **torta**: Actividades por tipo (tema).
     - Gráfico de **barras**: Actividades por hora (mañana, mediodía, tarde) para cada mes.

---

## Detalles de Implementación

### 1. **Uso de Chart.js para gráficos**
   - Se utilizó **Chart.js** para crear los gráficos interactivos que muestran las estadísticas de las actividades. Los datos utilizados son generados a partir de las actividades ingresadas manualmente para simplificar el testing.
   - Los gráficos incluyen:
     1. **Gráfico de barras**: Muestra la cantidad de actividades por día (para el mes de abril).
     2. **Gráfico de torta**: Muestra la distribución de actividades por tipo (tema).
     3. **Gráfico de barras apiladas**: Muestra las actividades por hora (mañana, mediodía, tarde) de cada mes.

### 2. **Uso de imágenes**
   - Las **fotos de actividades** se almacenan en la carpeta `img/`, y se utilizan tanto en la vista de listado de actividades como en el detalle ampliado.
   - Se usaron **tamaño 320x240 px** para las miniaturas y **800x600 px** para la vista ampliada.

### 3. **Datos y muestra de regiones/comunas**
   - Se ha utilizado una muestra representativa de las **regiones y comunas más comunes** para simplificar las pruebas y el desarrollo. No se incluyeron todas las regiones del país para facilitar el testing.
   - Los datos de las actividades se distribuyen en **abril de 2025**, ya que se utilizaron datos de ejemplo limitados a este mes.
   - **Un solo tema por actividad** fue seleccionado para simplificar el proyecto y mantenerlo manejable.

---

## Consideraciones del Proyecto

1. **Validación en JavaScript**:
   - El formulario de agregar actividad valida que los campos cumplan con el formato adecuado (email, celular, fechas, etc.), utilizando **JavaScript puro**.

2. **Gráficos interactivos**:
   - Los gráficos se actualizan dinámicamente con los datos de las actividades y son interactivos gracias a **Chart.js**.

3. **Responsividad**:
   - La interfaz es **responsiva**, lo que significa que se adapta correctamente a diferentes tamaños de pantalla, incluyendo dispositivos móviles.

4. **Simplicidad de datos**:
   - Para fines prácticos, se ha utilizado un número reducido de datos (5 actividades) y un conjunto limitado de temas y regiones.

---

## Instrucciones de Uso

1. **Abrir el proyecto**: El proyecto puede ser abierto directamente en cualquier navegador web, ya que no requiere servidor backend.
2. **Navegar por el menú**: Desde la página principal (portada), se puede acceder al formulario de agregar actividad, al listado de actividades y a las estadísticas.
3. **Agregar actividades**: Completar el formulario con la información correspondiente y validar los datos antes de enviarlos.
4. **Ver estadísticas**: Consultar los gráficos interactivos que muestran estadísticas sobre las actividades ingresadas.

---

## Enlaces útiles

- [W3C HTML Validator](http://validator.w3.org/)
- [W3C CSS Validator](http://jigsaw.w3.org/css-validator/)
- [Chart.js Documentation](https://www.chartjs.org/)

---

## Créditos

- **Profesor:** José Urzúa
- **Auxiliar:** Francisco Márquez
- **Ayudantes:** Bastián Corrales C., Nicolás Arancibia A., Valentina Montoya O.
- **Estudiante:** Pablo Reyes Pomés

---
