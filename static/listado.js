// static/listado.js


/**
 * Carga y muestra los comentarios de una actividad específica.
 * Los comentarios se ordenan por fecha en orden descendente.
 * @param {number} idActividad - El ID de la actividad para la que se cargarán los comentarios.
 */
async function cargarComentarios(idActividad) {
  try {
    const res = await fetch(`/api/comentarios/${idActividad}`);
    const comentarios = await res.json();
    const contenedor = document.getElementById("comentarios-lista");
    contenedor.innerHTML = ""; // Limpia el contenedor de comentarios.

    if (comentarios.length === 0) {
      contenedor.innerHTML = "<p><em>No hay comentarios aún.</em></p>";
      return;
    }

    // Ordena los comentarios por fecha, mostrando los más recientes primero.
    comentarios.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    comentarios.forEach(c => {
      const item = document.createElement("div");
      item.className = "comentario-item"; // Añade una clase para aplicar estilos.
      item.dataset.comentarioId = c.id; // Almacena el ID del comentario para fácil acceso.

      item.innerHTML = `
        <p><strong>${c.nombre}</strong> (${c.fecha}):</p>
        <p class="comentario-texto">${c.texto}</p>
        <div class="comentario-acciones">
          <button onclick="abrirModalEditarComentario(${idActividad}, ${c.id}, '${c.nombre}', '${c.texto.replace(/'/g, "\\'")}')">Editar</button>
          <button onclick="confirmarEliminarComentario(${idActividad}, ${c.id})">Eliminar</button>
        </div>
      `;
      contenedor.appendChild(item);
    });
  } catch (error) {
    console.error("Error al cargar comentarios:", error);
    const contenedor = document.getElementById("comentarios-lista");
    contenedor.innerHTML = "<p style='color:red'>Error al cargar comentarios.</p>";
  }
}

/**
 * Envía un nuevo comentario para una actividad.
 * Valida la longitud del nombre y el texto antes de enviar.
 * @param {number} idActividad - El ID de la actividad a la que se añadirá el comentario.
 */
window.enviarComentario = async function (idActividad) {
  const nombre = document.getElementById("comentario-nombre").value.trim();
  const texto = document.getElementById("comentario-texto").value.trim();
  const erroresDiv = document.getElementById("comentario-errores");
  erroresDiv.innerHTML = ""; // Limpia los mensajes de error previos.

  const errores = [];
  if (nombre.length < 3 || nombre.length > 80) errores.push("Nombre inválido (entre 3 y 80 caracteres).");
  if (texto.length < 5 || texto.length > 300) errores.push("Texto del comentario inválido (entre 5 y 300 caracteres).");

  if (errores.length > 0) {
    erroresDiv.innerHTML = errores.map(e => `<p style="color:red">${e}</p>`).join("");
    return;
  }

  try {
    const res = await fetch(`/api/comentarios/${idActividad}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, texto })
    });

    if (!res.ok) {
      const data = await res.json();
      erroresDiv.innerHTML = data.errores.map(e => `<p style="color:red">${e}</p>`).join("");
      return;
    }

    // Limpia los campos del formulario después de un envío exitoso.
    document.getElementById("comentario-nombre").value = "";
    document.getElementById("comentario-texto").value = "";

    await cargarComentarios(idActividad); // Recarga la lista de comentarios.
  } catch (error) {
    console.error("Error al enviar comentario:", error);
    erroresDiv.innerHTML = "<p style='color:red'>Error al enviar comentario.</p>";
  }
};

// Variables para almacenar los IDs de la actividad y el comentario actuales para el modal de edición.
let currentActividadId = null; 
let currentComentarioId = null; 

/**
 * Abre el modal de edición de comentarios y precarga los datos.
 * @param {number} actividadId - El ID de la actividad a la que pertenece el comentario.
 * @param {number} comentarioId - El ID del comentario a editar.
 * @param {string} nombre - El nombre actual del autor del comentario.
 * @param {string} texto - El texto actual del comentario.
 */
window.abrirModalEditarComentario = function (actividadId, comentarioId, nombre, texto) {
  currentActividadId = actividadId;
  currentComentarioId = comentarioId;

  document.getElementById('editar-comentario-nombre').value = nombre;
  document.getElementById('editar-comentario-texto').value = texto;
  document.getElementById('modal-editar-comentario').style.display = 'block';
  document.getElementById('modal-backdrop').style.display = 'block';
};

/**
 * Cierra el modal de edición de comentarios y limpia los mensajes de error.
 */
window.cerrarModalEditarComentario = function () {
  document.getElementById('modal-editar-comentario').style.display = 'none';
  document.getElementById('modal-backdrop').style.display = 'none';
  document.getElementById('editar-comentario-errores').innerHTML = ''; 
};

/**
 * Envía los cambios de un comentario editado al servidor.
 * Valida la entrada antes de enviar.
 */
window.submitEditarComentario = async function () {
  const nombre = document.getElementById('editar-comentario-nombre').value.trim();
  const texto = document.getElementById('editar-comentario-texto').value.trim();
  const erroresDiv = document.getElementById('editar-comentario-errores');
  erroresDiv.innerHTML = '';

  const errores = [];
  if (nombre.length < 3 || nombre.length > 80) errores.push("Nombre inválido (entre 3 y 80 caracteres).");
  if (texto.length < 5 || texto.length > 300) errores.push("Texto del comentario inválido (entre 5 y 300 caracteres).");

  if (errores.length > 0) {
    erroresDiv.innerHTML = errores.map(e => `<p style="color:red">${e}</p>`).join("");
    return;
  }

  try {
    const response = await fetch(`/api/comentarios/${currentActividadId}/${currentComentarioId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre: nombre, texto: texto })
    });
    const data = await response.json();

    if (data.success) {
      alert("Comentario editado con éxito."); 
      cerrarModalEditarComentario();
      cargarComentarios(currentActividadId); // Recarga los comentarios para mostrar los cambios.
    } else {
      erroresDiv.innerHTML = data.errores.map(e => `<p style="color:red">${e}</p>`).join("");
    }
  } catch (error) {
    console.error("Error al editar comentario:", error);
    erroresDiv.innerHTML = "<p style='color:red'>Error al editar comentario.</p>";
  }
};

/**
 * Muestra una confirmación antes de eliminar un comentario.
 * @param {number} actividadId - El ID de la actividad.
 * @param {number} comentarioId - El ID del comentario a eliminar.
 */
window.confirmarEliminarComentario = function (actividadId, comentarioId) {
  if (confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
    eliminarComentario(actividadId, comentarioId);
  }
};

/**
 * Elimina un comentario específico de una actividad.
 * @param {number} idActividad - El ID de la actividad a la que pertenece el comentario.
 * @param {number} comentarioId - El ID del comentario a eliminar.
 */
async function eliminarComentario(idActividad, comentarioId) {
  try {
    const response = await fetch(`/api/comentarios/${idActividad}/${comentarioId}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (data.success) {
      alert("Comentario eliminado con éxito."); 
      cargarComentarios(idActividad); // Recarga los comentarios.
    } else {
      alert("Error al eliminar comentario: " + data.message);
    }
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    alert("Error al eliminar comentario.");
  }
}

// Lógica de paginación y vista de detalles.
window.addEventListener("DOMContentLoaded", async () => {
  let paginaActual = 1;
  let totalPaginas = 1;

  // Obtiene el ID de la actividad a destacar de los parámetros de la URL.
  const urlParams = new URLSearchParams(window.location.search);
  const highlightActividadId = urlParams.get('highlight_id');

  /**
   * Carga y muestra una lista paginada de actividades.
   * @param {number} pagina - La página de actividades a cargar.
   */
  async function cargarActividades(pagina = 1) {
    try {
      const res = await fetch(`/api/actividades?page=${pagina}`);
      const datos = await res.json();

      const cuerpo = document.getElementById("cuerpo-tabla");
      cuerpo.innerHTML = ""; // Limpia la tabla.

      paginaActual = datos.pagina_actual;
      totalPaginas = datos.total_paginas;

      datos.actividades.forEach((act) => {
        // Formatea la visualización de los temas de la actividad.
        const temaTexto = act.temas.length > 0
          ? act.temas.map(t =>
              t.tema.toLowerCase() === "otro"
                ? (t.glosa_otro || "Otro")
                : (t.tema.charAt(0).toUpperCase() + t.tema.slice(1))
            ).join(", ")
          : "Otro";

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td data-label="Inicio">${act.dia_hora_inicio}</td>
          <td data-label="Término">${act.dia_hora_termino || '-'}</td>
          <td data-label="Comuna">${act.comuna.nombre}</td>
          <td data-label="Sector">${act.sector}</td>
          <td data-label="Tema">${temaTexto}</td>
          <td data-label="Organizador">${act.nombre}</td>
          <td data-label="Fotos">${act.fotos.length}</td>
        `;
        fila.addEventListener("click", () => mostrarDetalle(act));
        cuerpo.appendChild(fila);
      });

      actualizarPaginacion(); // Actualiza los controles de paginación.

    } catch (err) {
      console.error("Error cargando actividades:", err);
      const cuerpo = document.getElementById("cuerpo-tabla");
      cuerpo.innerHTML = "<tr><td colspan='7'>Error al cargar las actividades.</td></tr>";
    }
  }

  /**
   * Carga y muestra los detalles de una actividad específica, y desplaza la vista hasta ella.
   * @param {number} id - El ID de la actividad a mostrar.
   */
  async function mostrarActividadDestacada(id) {
    try {
      const res = await fetch(`/api/actividades/${id}`);
      if (!res.ok) {
        console.error(`Error al obtener actividad con ID ${id}:`, res.statusText);
        return;
      }
      const actividad = await res.json();
      mostrarDetalle(actividad);

      const detalleElement = document.getElementById("detalle-actividad");
      if (detalleElement) {
        detalleElement.style.display = "block";
        detalleElement.scrollIntoView({ behavior: "smooth" }); // Desplaza suavemente hasta el detalle.
      }
    } catch (error) {
      console.error("Error al mostrar actividad destacada:", error);
    }
  }

  /**
   * Muestra los detalles completos de una actividad en la sección de detalle.
   * @param {object} act - El objeto de actividad con todos sus detalles.
   */
  window.mostrarDetalle = function(act) {
    const detalle = document.getElementById("detalle-actividad");

    let fotosHTML = "";
    if (act.fotos && act.fotos.length > 0) {
      act.fotos.forEach(f => {
        const ruta = "/static/uploads/" + f.nombre_archivo;
        fotosHTML += `<img class="foto-mini" src="${ruta}" onclick="verFoto('${ruta}')"> `;
      });
    } else {
      fotosHTML = "<p>No hay fotos disponibles.</p>";
    }

    let contactosHTML = "—";
    if (act.contactos && act.contactos.length > 0) {
      contactosHTML = act.contactos
        .map(c => `${c.medio.charAt(0).toUpperCase() + c.medio.slice(1)}: ${c.identificador}`)
        .join("<br>");
    }

    const temasDetalle = act.temas.length > 0
      ? act.temas.map(t =>
          t.tema.toLowerCase() === "otro"
            ? (t.glosa_otro || "Otro")
            : (t.tema.charAt(0).toUpperCase() + t.tema.slice(1))
        ).join(", ")
      : "Otro";

    detalle.innerHTML = `
      <h2>Detalle de la Actividad</h2>
      <p><strong>Región:</strong> ${act.comuna.region}</p>
      <p><strong>Comuna:</strong> ${act.comuna.nombre}</p>
      <p><strong>Sector:</strong> ${act.sector}</p>
      <p><strong>Nombre:</strong> ${act.nombre}</p>
      <p><strong>Email:</strong> ${act.email}</p>
      <p><strong>Celular:</strong> ${act.celular || '—'}</p>
      <p><strong>Contactar por:</strong><br> ${contactosHTML}</p>
      <p><strong>Inicio:</strong> ${act.dia_hora_inicio}</p>
      <p><strong>Término:</strong> ${act.dia_hora_termino || '-'}</p>
      <p><strong>Descripción:</strong> ${act.descripcion}</p>
      <p><strong>Tema:</strong> ${temasDetalle}</p>
      <div>${fotosHTML}</div>

      <hr>
      <h3>Comentarios</h3>
      <div id="comentarios-lista">Cargando comentarios...</div>
      <hr>
      <h4>Agregar nuevo comentario</h4>
      <div id="comentario-errores"></div>
      <input type="text" id="comentario-nombre" placeholder="Tu nombre (3-80 caracteres)" maxlength="80"><br>
      <textarea id="comentario-texto" rows="4" cols="50" placeholder="Tu comentario (mínimo 5 caracteres)"></textarea><br>
      <button onclick="enviarComentario(${act.id})">Agregar comentario</button>

      <br><br>
      <button onclick="document.getElementById('detalle-actividad').style.display='none';" class="btn-unificado">Volver al listado</button>
      <button onclick="window.location.href='/'" class="btn-unificado">Volver a la portada</button>
    `;
    detalle.style.display = "block";
    cargarComentarios(act.id); // Carga los comentarios asociados a la actividad.
  }

  /**
   * Abre un overlay para ver una foto en tamaño grande.
   * @param {string} ruta - La ruta de la imagen a mostrar.
   */
  window.verFoto = function (ruta) {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <img src="${ruta}">
      <button onclick="this.parentElement.remove()">Cerrar</button>
    `;
    document.body.appendChild(overlay);
  };

  /**
   * Actualiza los controles de paginación basados en la página actual y el total de páginas.
   */
  function actualizarPaginacion() {
    const paginacionDiv = document.getElementById("paginacion");
    paginacionDiv.innerHTML = "";

    if (totalPaginas <= 1) return; // No muestra paginación si solo hay una página.

    if (paginaActual > 1) {
      const btnAnterior = document.createElement("button");
      btnAnterior.textContent = "Anterior";
      btnAnterior.onclick = () => cargarActividades(paginaActual - 1);
      paginacionDiv.appendChild(btnAnterior);
    }

    const span = document.createElement("span");
    span.textContent = ` Página ${paginaActual} de ${totalPaginas} `;
    paginacionDiv.appendChild(span);

    if (paginaActual < totalPaginas) {
      const btnSiguiente = document.createElement("button");
      btnSiguiente.textContent = "Siguiente";
      btnSiguiente.onclick = () => cargarActividades(paginaActual + 1);
      paginacionDiv.appendChild(btnSiguiente);
    }
  }

  // Carga inicial de actividades al cargar la página.
  await cargarActividades(paginaActual); 

  // Si se proporciona un ID de actividad en la URL, muestra sus detalles.
  if (highlightActividadId) {
    await mostrarActividadDestacada(parseInt(highlightActividadId));
    // Limpia el parámetro 'highlight_id' de la URL después de usarlo.
    urlParams.delete('highlight_id');
    history.replaceState(null, '', window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : ''));
  }
});