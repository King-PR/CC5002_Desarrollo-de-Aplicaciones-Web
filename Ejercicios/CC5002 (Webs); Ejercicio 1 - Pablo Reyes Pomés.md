# Ejercicio 1

**Nombre**: Pablo Reyes Pomés

---

## Pregunta 1 (6 puntos)

# 1.1 (3 puntos)
Explique por que el realizar validaciones del input del usuario en el front-end es una facilidad pero no una medida de seguridad. 

**Respuesta**:

Las validaciones en el front-end son una herramienta útil para mejorar la experiencia del usuario, pero no deben considerarse una
medida de seguridad efectiva. Esto se debe a que pueden ser fácilmente manipuladas por cualquier usuario con conocimientos técnicos.
Por ejemplo, es posible deshabilitar JavaScript en el navegador, modificar el código mediante herramientas de desarrollo o incluso
enviar solicitudes directamente al servidor utilizando herramientas como Postman.

Desde el punto de vista de la seguridad, las validaciones en el lado del cliente no son confiables, ya que un atacante puede
alterarlas antes de enviar la solicitud al servidor. Por esto, las validaciones verdaderamente seguras deben implementarse siempre
en el back-end, donde el usuario no tiene control directo sobre ellas.

El propósito principal de las validaciones en el front-end es mejorar la experiencia del usuario proporcionando retroalimentación
inmediata y reduciendo la carga de solicitudes innecesarias al servidor. Sin embargo, estas validaciones no deben reemplazar las
medidas de seguridad que deben realizarse en el servidor.

# 1.2 (3 puntos)
Explique en detalle el rol de **HTML, CSS y JavaScript** en la creación del front-end de una aplicación web. Especifique la función
de cada tecnología y cómo se combinan para construir una interfaz interactiva y visualmente atractiva.

**Respuesta:**:

HTML, CSS y JavaScript cumplen roles fundamentales en la construcción de páginas web, cada uno con una función específica pero
complementaria.

HTML se encarga de la estructura y el contenido de la página web, actuando como el "esqueleto" de la interfaz. Define elementos
esenciales como títulos, párrafos, formularios y contenedores, organizando jerárquicamente el contenido mediante etiquetas.

CSS se encarga del diseño y la presentación visual. Permite aplicar estilos a los elementos HTML, definiendo colores, tipografías,
márgenes y espaciados. Además, facilita la creación de diseños responsivos y el control de la apariencia general de la interfaz.

Por otro lado, JavaScript introduce interactividad y dinamismo. Permite modificar el contenido sin necesidad de recargar la página,
responder a eventos del usuario, manipular elementos del DOM, realizar validaciones y gestionar datos de forma asíncrona. Gracias a
esto, es posible crear experiencias web dinámicas e interactivas.

En conjunto, HTML proporciona la estructura, CSS define el estilo y JavaScript añade interactividad, trabajando en armonía para
desarrollar interfaces web completas y atractivas.

## Pregunta 2 (6 puntos)
A continuación, se presentan dos tareas prácticas:  

1. **(3 puntos)** Implementar un código que reciba un nombre ingresado por el usuario y muestre un mensaje de bienvenida.  
   - Si el usuario se llama **Pablo Reyes**, debe mostrarse un mensaje especial en negrita y en color azul.  
   - El contenido debe actualizarse sin recargar la página.  

2. **(3 puntos)** Implementar un contador de calificación con dos botones para aumentar y disminuir la nota actual.  
   - La calificación debe tener valores apropiados.  
   - La calificación debe actualizarse sin recargar la página.  

### Código HTML:
```html
<div>
    <h3>Parte 1: Mensaje de Bienvenida</h3>
    <label for="nombre">Ingrese su nombre:</label>
    <input type="text" id="nombre">
    <button type="button" id="btn-enviar">Enviar</button>
    <p id="mensaje"></p>
</div>

<hr>

<div>
    <h3>Parte 2: Contador de Calificación</h3>
    <p>Nota actual: <span id="calificacion">1</span></p>
    <button type="button" id="btn-disminuir">Disminuir</button>
    <button type="button" id="btn-aumentar">Aumentar</button>
</div>
```

Implemente un sistema para modificar la nota actual, utilizando la plantilla disponible más abajo, y programe únicamente
donde se le indica. Se espera que tras apretar un botón, la nota se actualice sin la necesidad de recargar la página. No
está permitido modificar el HTML.

**Respuesta**:
```js
// Obtener elementos para el mensaje de bienvenida
const nombreInput = document.getElementById('nombre');
const btnEnviar = document.getElementById('btn-enviar');
const mensajeElemento = document.getElementById('mensaje');

// Obtener elementos para el contador
const calificacionElemento = document.getElementById('calificacion');
const btnDisminuir = document.getElementById('btn-disminuir');
const btnAumentar = document.getElementById('btn-aumentar');

// Calificación inicial
let calificacion = 1;

// Función para mostrar mensaje de bienvenida
const mostrarMensaje = () => {
    const nombre = nombreInput.value.trim();
    
    if (nombre === '') {
        mensajeElemento.textContent = 'Por favor, ingrese un nombre';
        return;
    }

    if (nombre.toLowerCase() === 'pablo reyes') {
        mensajeElemento.innerHTML = `<span class="mensaje-especial" style="color: blue; font-weight: bold;">¡Bienvenido, ${nombre}!</span>`;
    } else {
        mensajeElemento.textContent = `¡Hola, ${nombre}!`;
    }
};

// Función para aumentar la calificación
const aumentarCalificacion = () => {
    if (calificacion < 7) {
        calificacion++;
        calificacionElemento.textContent = calificacion;
    }
};

// Función para disminuir la calificación
const disminuirCalificacion = () => {
    if (calificacion > 1) {
        calificacion--;
        calificacionElemento.textContent = calificacion;
    }
};

// Asignar eventos
btnEnviar.addEventListener('click', mostrarMensaje);
btnAumentar.addEventListener('click', aumentarCalificacion);
btnDisminuir.addEventListener('click', disminuirCalificacion);

```
