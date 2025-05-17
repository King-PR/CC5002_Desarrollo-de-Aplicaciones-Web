// static/listado.js

window.addEventListener("DOMContentLoaded", () => {
  let paginaActual = 1;
  let totalPaginas = 1;

  async function cargarActividades(pagina = 1) {
    try {
      const res = await fetch(`/api/actividades?page=${pagina}`);
      const datos = await res.json();

      const cuerpo = document.getElementById("cuerpo-tabla");
      const detalle = document.getElementById("detalle-actividad");
      cuerpo.innerHTML = ""; // Limpiar tabla

      paginaActual = datos.pagina_actual;
      totalPaginas = datos.total_paginas;

      datos.actividades.forEach((act) => {
        // Concatenar temas (mostrando "glosa_otro" si tema es "otro")
        const temaTexto = act.temas.length > 0
          ? act.temas.map(t =>
              t.tema.toLowerCase() === "otro"
                ? (t.glosa_otro || "Otro")
                : (t.tema.charAt(0).toUpperCase() + t.tema.slice(1))
            ).join(", ")
          : "Otro";

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${act.dia_hora_inicio}</td>
          <td>${act.dia_hora_termino || '-'}</td>
          <td>${act.comuna.nombre}</td>
          <td>${act.sector}</td>
          <td>${temaTexto}</td>
          <td>${act.nombre}</td>
          <td>${act.fotos.length}</td>
        `;
        fila.addEventListener("click", () => mostrarDetalle(act));
        cuerpo.appendChild(fila);
      });

      actualizarPaginacion();
    } catch (err) {
      console.error("Error cargando actividades:", err);
    }
  }

  function mostrarDetalle(act) {
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

    // Concatenar todos los temas para mostrar en detalle
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
      <br>
      <button onclick="document.getElementById('detalle-actividad').style.display='none'">Volver al listado</button>
      <button onclick="window.location.href='/'">Volver a la portada</button>
    `;
    detalle.style.display = "block";
    detalle.scrollIntoView({ behavior: "smooth" });
  }

  window.verFoto = function (ruta) {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <img src="${ruta}">
      <button onclick="this.parentElement.remove()">Cerrar</button>
    `;
    document.body.appendChild(overlay);
  };

  function actualizarPaginacion() {
    const paginacionDiv = document.getElementById("paginacion");
    paginacionDiv.innerHTML = "";

    if (totalPaginas <= 1) return;

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

  // Crear contenedor de paginación
  const paginacionDiv = document.createElement("div");
  paginacionDiv.id = "paginacion";
  paginacionDiv.style.textAlign = "center";
  paginacionDiv.style.marginTop = "20px";

  const main = document.querySelector("main");
  main.appendChild(paginacionDiv);

  // Iniciar carga
  cargarActividades();
});
