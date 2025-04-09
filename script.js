// script.js

window.addEventListener("DOMContentLoaded", () => {
  const regiones = {
    "RM": ["Santiago", "Ñuñoa", "La Reina", "Providencia"],
    "V": ["Valparaíso", "Viña del Mar", "Quilpué"],
    "VIII": ["Concepción", "Talcahuano", "Chiguayante"]
  };

  const regionSelect = document.getElementById("region");
  const comunaSelect = document.getElementById("comuna");
  const contactoSelect = document.getElementById("contacto");
  const idContactoDiv = document.getElementById("id-contacto");
  const temaSelect = document.getElementById("tema");
  const temaOtroDiv = document.getElementById("tema-otro");
  const fotosDiv = document.getElementById("fotos");
  const botonAgregarFoto = document.getElementById("agregar-foto");
  const form = document.getElementById("form-actividad");

  let fotoCount = 1;

  // Cambiar comunas según región
  regionSelect.addEventListener("change", () => {
    const region = regionSelect.value;
    comunaSelect.innerHTML = "<option value=''>Seleccione</option>";
    if (region && regiones[region]) {
      regiones[region].forEach(comuna => {
        const option = document.createElement("option");
        option.value = comuna;
        option.textContent = comuna;
        comunaSelect.appendChild(option);
      });
    }
  });

  // Mostrar input para ID/contacto
  contactoSelect.addEventListener("change", () => {
    const valor = contactoSelect.value;
    idContactoDiv.innerHTML = "";
    if (valor) {
      const input = document.createElement("input");
      input.type = "text";
      input.name = "id_contacto";
      input.placeholder = "ID o URL del contacto";
      input.minLength = 4;
      input.maxLength = 50;
      idContactoDiv.appendChild(input);
    }
  });

  // Mostrar input para tema "otro"
  temaSelect.addEventListener("change", () => {
    temaOtroDiv.innerHTML = "";
    if (temaSelect.value === "otro") {
      const input = document.createElement("input");
      input.type = "text";
      input.name = "tema_otro";
      input.placeholder = "Describa el tema";
      input.minLength = 3;
      input.maxLength = 15;
      temaOtroDiv.appendChild(input);
    }
  });

  // Agregar input de foto (máximo 5)
  botonAgregarFoto.addEventListener("click", () => {
    if (fotoCount >= 5) {
      alert("Solo se pueden subir hasta 5 fotos.");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.name = "foto";
    fotosDiv.appendChild(input);
    fotoCount++;
  });

  // Validaciones del formulario
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const region = regionSelect.value;
    const comuna = comunaSelect.value;
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const celular = document.getElementById("celular").value.trim();
    const contacto = contactoSelect.value;
    const idContacto = idContactoDiv.querySelector("input")?.value.trim();
    const inicio = document.getElementById("inicio").value;
    const termino = document.getElementById("termino").value;
    const tema = temaSelect.value;
    const temaOtro = temaOtroDiv.querySelector("input")?.value.trim();
    const fotos = fotosDiv.querySelectorAll("input[type='file']");

    const errores = [];

    if (!region) errores.push("Debes seleccionar una región.");
    if (!comuna) errores.push("Debes seleccionar una comuna.");
    if (!nombre || nombre.length > 200) errores.push("Nombre inválido.");
    if (!email.match(/^\S+@\S+\.\S+$/)) errores.push("Email inválido.");
    if (celular && !celular.match(/^\+\d{3}\.\d{8}$/)) errores.push("Celular inválido.");
    if (contacto && (!idContacto || idContacto.length < 4 || idContacto.length > 50)) errores.push("ID de contacto inválido.");
    if (!inicio) errores.push("Debes indicar fecha/hora de inicio.");
    if (termino && new Date(termino) <= new Date(inicio)) errores.push("El término debe ser posterior al inicio.");
    if (!tema) errores.push("Debes seleccionar un tema.");
    if (tema === "otro" && (!temaOtro || temaOtro.length < 3 || temaOtro.length > 15)) errores.push("Tema 'otro' inválido.");
    if (fotos.length < 1 || fotos.length > 5) errores.push("Debes subir entre 1 y 5 fotos.");

    if (errores.length > 0) {
      alert("Errores:\n" + errores.join("\n"));
      return;
    }

    const confirmar = confirm("¿Estas seguro que deseas agregar esta actividad?");
    if (confirmar) {
      document.body.innerHTML = `
        <h2>Hemos recibido tu información, muchas gracias y suerte en tu actividad</h2>
        <button onclick="window.location.href='index.html'">Volver a la portada</button>
      `;
    } else {
      alert("Puedes seguir editando el formulario.");
    }
  });

  // Función para ver la imagen ampliada
  window.verFoto = function(foto) {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <img src="${foto}" style="max-width: 800px; max-height: 600px; width: auto; height: auto;">
      <button onclick="this.parentElement.remove()">Cerrar</button>
    `;
    document.body.appendChild(overlay);
  };
});
