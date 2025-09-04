// static/validaciones.js


// Se ejecuta cuando el DOM ha sido completamente cargado.
window.addEventListener("DOMContentLoaded", async () => {
  // Obtiene referencias a los elementos del DOM.
  const regionSelect = document.getElementById("region");
  const comunaSelect = document.getElementById("comuna");
  const contactosCheckboxesDiv = document.getElementById("contactos-checkboxes");
  const idContactosDiv = document.getElementById("id-contactos");
  const temasCheckboxesDiv = document.getElementById("temas-checkboxes");
  const temaOtrosDiv = document.getElementById("tema-otros");
  const fotosDiv = document.getElementById("fotos");
  const botonAgregarFoto = document.getElementById("agregar-foto");
  const form = document.getElementById("form-actividad");

  // Contador para el número de fotos agregadas.
  let fotoCount = 1;

  // Carga las regiones y comunas desde la API al iniciar la página.
  try {
    const res = await fetch("/api/regiones_comunas");
    const regionesData = await res.json();

    // Rellena el selector de regiones con los datos obtenidos.
    regionSelect.innerHTML = "<option value=''>Seleccione una región</option>";
    for (const region in regionesData) {
      const option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    }

    // Actualiza el selector de comunas cada vez que se cambia la región seleccionada.
    regionSelect.addEventListener("change", () => {
      const region = regionSelect.value;
      comunaSelect.innerHTML = "<option value=''>Seleccione una comuna</option>";

      if (regionesData[region]) {
        regionesData[region].forEach(comuna => {
          const option = document.createElement("option");
          option.value = comuna;
          option.textContent = comuna;
          comunaSelect.appendChild(option);
        });
      }
    });
  } catch (error) {
    console.error("Error cargando regiones y comunas:", error);
  }

  // Muestra campos de entrada para IDs de contacto basados en los checkboxes de contacto marcados.
  contactosCheckboxesDiv.addEventListener("change", () => {
    idContactosDiv.innerHTML = ""; // Limpia los campos de ID existentes.
    const checkboxes = contactosCheckboxesDiv.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        const label = document.createElement("label");
        label.textContent = `ID o URL para ${checkbox.value}: `;
        const input = document.createElement("input");
        input.type = "text";
        input.name = `id_contacto_${checkbox.value}`;
        input.minLength = 4;
        input.maxLength = 50;
        label.appendChild(input);
        idContactosDiv.appendChild(label);
        idContactosDiv.appendChild(document.createElement("br"));
      }
    });
  });

  // Muestra campos de entrada para describir "otros" temas si el checkbox "otro" está marcado.
  temasCheckboxesDiv.addEventListener("change", () => {
    temaOtrosDiv.innerHTML = ""; // Limpia los campos de "otro" existentes.
    const checkboxes = temasCheckboxesDiv.querySelectorAll("input[type='checkbox']");
    let countOtro = 0;
    checkboxes.forEach(checkbox => {
      if (checkbox.checked && checkbox.value === "otro") {
        countOtro++;
        const input = document.createElement("input");
        input.type = "text";
        input.name = `tema_otro_${countOtro}`;
        input.placeholder = `Describa el tema otro #${countOtro}`;
        input.minLength = 3;
        input.maxLength = 15;
        temaOtrosDiv.appendChild(input);
        temaOtrosDiv.appendChild(document.createElement("br"));
      }
    });
  });

  // Agrega un nuevo campo de entrada para subir fotos, con un máximo de 5 fotos.
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

  // Realiza validaciones del formulario antes de enviarlo.
  form.addEventListener("submit", (event) => {
    // Obtiene los valores de los campos del formulario.
    const region = regionSelect.value;
    const comuna = comunaSelect.value;
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const celular = document.getElementById("celular").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    // Obtiene los checkboxes marcados para contactos y temas.
    const contactoCheckboxes = contactosCheckboxesDiv.querySelectorAll("input[type='checkbox']:checked");
    const temaCheckboxes = temasCheckboxesDiv.querySelectorAll("input[type='checkbox']:checked");

    const inicio = document.getElementById("inicio").value;
    const termino = document.getElementById("termino").value;
    const fotos = fotosDiv.querySelectorAll("input[type='file']");

    const errores = []; // Almacena los mensajes de error de validación.

    // Realiza las validaciones de los campos.
    if (!region) errores.push("Debes seleccionar una región.");
    if (!comuna) errores.push("Debes seleccionar una comuna.");
    if (!nombre || nombre.length > 200) errores.push("Nombre inválido.");
    if (!email.match(/^\S+@\S+\.\S+$/)) errores.push("Email inválido.");
    if (!descripcion) errores.push("Debes ingresar una descripción.");
    if (celular && !celular.match(/^\+569\d{8}$/)) errores.push("Celular inválido. Debe tener el formato +569XXXXXXXX");

    if (contactoCheckboxes.length === 0) {
      errores.push("Debes seleccionar al menos un método de contacto.");
    } else {
      // Valida los campos de ID para los métodos de contacto seleccionados.
      contactoCheckboxes.forEach(cbox => {
        const input = idContactosDiv.querySelector(`input[name="id_contacto_${cbox.value}"]`);
        if (!input || input.value.trim().length < 4 || input.value.trim().length > 50) {
          errores.push(`ID de contacto para ${cbox.value} inválido.`);
        }
      });
    }

    if (!inicio) errores.push("Debes indicar fecha/hora de inicio.");
    if (termino && new Date(termino) <= new Date(inicio)) errores.push("El término debe ser posterior al inicio.");

    if (temaCheckboxes.length === 0) errores.push("Debes seleccionar al menos un tema.");

    // Valida los campos de texto para temas "otro".
    let countOtro = 0;
    temaCheckboxes.forEach(cbox => {
      if (cbox.value === "otro") {
        countOtro++;
        const inputOtro = temaOtrosDiv.querySelector(`input[name="tema_otro_${countOtro}"]`);
        if (!inputOtro || inputOtro.value.trim().length < 3 || inputOtro.value.trim().length > 15) {
          errores.push(`Tema 'otro' #${countOtro} inválido.`);
        }
      }
    });

    if (fotos.length < 1 || fotos.length > 5) errores.push("Debes subir entre 1 y 5 fotos.");

    // Si hay errores, previene el envío del formulario y muestra los errores.
    if (errores.length > 0) {
      event.preventDefault();
      alert("Errores:\n" + errores.join("\n"));
      return;
    }

    // Pide confirmación al usuario antes de enviar el formulario.
    const confirmar = confirm("¿Estás seguro que deseas agregar esta actividad?");
    if (!confirmar) {
      event.preventDefault(); // Previene el envío si el usuario cancela.
      alert("Puedes seguir editando el formulario.");
    }
  });
});