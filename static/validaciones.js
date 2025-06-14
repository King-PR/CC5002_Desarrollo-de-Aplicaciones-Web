// static/validaciones.js

window.addEventListener("DOMContentLoaded", async () => {
  const regionSelect = document.getElementById("region");
  const comunaSelect = document.getElementById("comuna");
  const contactosCheckboxesDiv = document.getElementById("contactos-checkboxes");
  const idContactosDiv = document.getElementById("id-contactos");
  const temasCheckboxesDiv = document.getElementById("temas-checkboxes");
  const temaOtrosDiv = document.getElementById("tema-otros");
  const fotosDiv = document.getElementById("fotos");
  const botonAgregarFoto = document.getElementById("agregar-foto");
  const form = document.getElementById("form-actividad");

  let fotoCount = 1;

  // Cargar regiones y comunas desde la base de datos
  try {
    const res = await fetch("/api/regiones_comunas");
    const regionesData = await res.json();

    // Llenar selector de regiones
    regionSelect.innerHTML = "<option value=''>Seleccione una región</option>";
    for (const region in regionesData) {
      const option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    }

    // Al cambiar la región, actualizar comunas
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

  // Mostrar inputs para ID/contacto según checkboxes marcados
  contactosCheckboxesDiv.addEventListener("change", () => {
    idContactosDiv.innerHTML = "";
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

  // Mostrar inputs para tema "otro" según checkboxes marcados
  temasCheckboxesDiv.addEventListener("change", () => {
    temaOtrosDiv.innerHTML = "";
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

  // Validaciones del formulario al enviar
  form.addEventListener("submit", (event) => {
    const region = regionSelect.value;
    const comuna = comunaSelect.value;
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const celular = document.getElementById("celular").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    // Obtener checkboxes marcados para contactos y temas
    const contactoCheckboxes = contactosCheckboxesDiv.querySelectorAll("input[type='checkbox']:checked");
    const temaCheckboxes = temasCheckboxesDiv.querySelectorAll("input[type='checkbox']:checked");

    const inicio = document.getElementById("inicio").value;
    const termino = document.getElementById("termino").value;
    const fotos = fotosDiv.querySelectorAll("input[type='file']");

    const errores = [];

    if (!region) errores.push("Debes seleccionar una región.");
    if (!comuna) errores.push("Debes seleccionar una comuna.");
    if (!nombre || nombre.length > 200) errores.push("Nombre inválido.");
    if (!email.match(/^\S+@\S+\.\S+$/)) errores.push("Email inválido.");
    if (!descripcion) errores.push("Debes ingresar una descripción.");
    if (celular && !celular.match(/^\+569\d{8}$/)) errores.push("Celular inválido. Debe tener el formato +569XXXXXXXX");

    if (contactoCheckboxes.length === 0) {
      errores.push("Debes seleccionar al menos un método de contacto.");
    } else {
      
      // Validar inputs de IDs para contactos seleccionados
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

    // Validar inputs "otro" para temas
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

    if (errores.length > 0) {
      event.preventDefault();
      alert("Errores:\n" + errores.join("\n"));
      return;
    }

    const confirmar = confirm("¿Estás seguro que deseas agregar esta actividad?");
    if (!confirmar) {
      event.preventDefault();
      alert("Puedes seguir editando el formulario.");
    }
  });
});
