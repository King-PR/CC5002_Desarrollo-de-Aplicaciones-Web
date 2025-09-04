// static/estadisticas.js


// Almacena los datos de actividades obtenidos del servidor para que estén disponibles globalmente.
let allActivitiesData = [];
// Guarda la instancia del gráfico de actividades diarias para poder destruirla y actualizarla.
let dailyActivitiesChartInstance = null; 

/**
 * Convierte la primera letra de una cadena a mayúscula.
 * @param {string} string - La cadena de texto a capitalizar.
 * @returns {string} La cadena con la primera letra en mayúscula o una cadena vacía si la entrada es nula o vacía.
 */
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Obtiene el número de días en un mes específico de un año dado.
 * @param {number} year - El año.
 * @param {number} month - El índice del mes (0 para enero, 11 para diciembre).
 * @returns {number} El número de días en el mes.
 */
function getDaysInMonth(year, month) {
  // Se usa el día 0 del siguiente mes para obtener el último día del mes actual.
  return new Date(year, month + 1, 0).getDate();
}

// Se ejecuta cuando el DOM ha sido completamente cargado.
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Realiza una solicitud a la API para obtener los datos de estadísticas.
    const respuesta = await fetch("/api/estadisticas");
    // Almacena los datos de actividades en la variable global.
    allActivitiesData = await respuesta.json(); 

    // Inicializa y renderiza los gráficos.
    initializeCharts();

    // Configura el event listener para el selector de mes del gráfico diario.
    const monthSelector = document.getElementById("selector-mes-dia");
    if (monthSelector) {
      monthSelector.addEventListener('change', () => {
        // Renderiza el gráfico de actividades diarias con el mes seleccionado.
        renderDailyActivitiesChart(parseInt(monthSelector.value), allActivitiesData);
      });
      // Asegura que el gráfico diario se renderice con el mes por defecto al cargar.
      renderDailyActivitiesChart(parseInt(monthSelector.value), allActivitiesData);
    } else {
      console.error("El selector de mes para el gráfico diario no fue encontrado.");
    }

  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
});

/**
 * Inicializa y renderiza los gráficos de actividades.
 */
function initializeCharts() {
  // Inicializa un arreglo para recolectar datos de actividades por mes y franja horaria.
  const actividadesPorMes = Array.from({ length: 12 }, () => ({ mañana: 0, mediodía: 0, tarde: 0 }));

  /**
   * Clasifica una actividad en 'mañana', 'mediodía' o 'tarde' según la hora.
   * @param {number} hora - La hora de la actividad (0-23).
   * @returns {string|null} El período del día o null si no aplica.
   */
  const clasificarActividad = (hora) => {
    if (hora >= 6 && hora < 12) return 'mañana';
    if (hora === 12) return 'mediodía';
    if (hora >= 13 && hora <= 20) return 'tarde';
    return null; // No se consideran actividades nocturnas.
  };

  // Recolecta datos por mes y período para el gráfico de barras.
  allActivitiesData.forEach((actividad) => {
    const fecha = new Date(actividad.inicio);
    const mes = fecha.getMonth();
    const hora = fecha.getHours();
    const periodo = clasificarActividad(hora);
    if (periodo) {
      actividadesPorMes[mes][periodo]++;
    }
  });

  // Gráfico 2: Actividades por tipo (Gráfico de Torta)
  const actividadesPorTipo = {};

  allActivitiesData.forEach(actividad => {
    if (actividad.temas && Array.isArray(actividad.temas)) {
      actividad.temas.forEach(temaString => {
        const capitalizedTema = capitalizeFirstLetter(temaString);
        actividadesPorTipo[capitalizedTema] = (actividadesPorTipo[capitalizedTema] || 0) + 1;
      });
    } else {
      actividadesPorTipo["Otro"] = (actividadesPorTipo["Otro"] || 0) + 1;
    }
  });

  const ctx2 = document.getElementById("grafico-tipo-actividad").getContext("2d");
  new Chart(ctx2, {
    type: "pie",
    data: {
      labels: Object.keys(actividadesPorTipo),
      datasets: [{
        label: 'Actividades por tipo',
        data: Object.values(actividadesPorTipo),
        backgroundColor: ['#ffcc00', '#ff6600', '#ff3333', '#66cc00', '#3399ff', '#9966cc', '#ff9966', '#66ffff', '#ccff66', '#ff66b2'],
        borderColor: '#fff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });

  // Gráfico 3: Actividades por mes y franja horaria (Gráfico de Barras)
  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const actividadesMañana = actividadesPorMes.map(mes => mes.mañana);
  const actividadesMediodia = actividadesPorMes.map(mes => mes.mediodía);
  const actividadesTarde = actividadesPorMes.map(mes => mes.tarde);

  const ctx3 = document.getElementById("grafico-actividades-mes").getContext("2d");
  new Chart(ctx3, {
    type: "bar",
    data: {
      labels: nombresMeses,
      datasets: [
        {
          label: 'Actividades Mañana',
          data: actividadesMañana,
          backgroundColor: '#66cc00',
          borderColor: '#4e9f34',
          borderWidth: 1
        },
        {
          label: 'Actividades Mediodía',
          data: actividadesMediodia,
          backgroundColor: '#ffcc00',
          borderColor: '#e68a00',
          borderWidth: 1
        },
        {
          label: 'Actividades Tarde',
          data: actividadesTarde,
          backgroundColor: '#ff6600',
          borderColor: '#e65c00',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Renderiza o actualiza el gráfico de línea de actividades diarias para un mes dado.
 * @param {number} monthIndex - El índice del mes (0 para enero, 11 para diciembre).
 * @param {Array} activitiesData - Todos los datos de actividad obtenidos de la API.
 */
function renderDailyActivitiesChart(monthIndex, activitiesData) {
  const currentYear = new Date().getFullYear(); 
  const daysInMonth = getDaysInMonth(currentYear, monthIndex);

  const activitiesPerDay = {};
  // Inicializa el conteo de actividades a cero para cada día del mes.
  for (let i = 1; i <= daysInMonth; i++) {
    const dayString = i < 10 ? `0${i}` : `${i}`;
    const monthString = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
    activitiesPerDay[`${currentYear}-${monthString}-${dayString}`] = 0;
  }

  // Cuenta las actividades para el mes y año seleccionados.
  activitiesData.forEach((actividad) => {
    const activityDate = new Date(actividad.inicio);
    if (activityDate.getFullYear() === currentYear && activityDate.getMonth() === monthIndex) {
      const day = activityDate.getDate();
      const dayString = day < 10 ? `0${day}` : `${day}`;
      const monthString = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
      const dateKey = `${currentYear}-${monthString}-${dayString}`;
      if (activitiesPerDay[dateKey] !== undefined) {
        activitiesPerDay[dateKey]++;
      }
    }
  });

  const ctx1 = document.getElementById("grafico-actividades-dia").getContext("2d");

  // Destruye la instancia anterior del gráfico si existe para evitar superposiciones.
  if (dailyActivitiesChartInstance) {
    dailyActivitiesChartInstance.destroy();
  }

  // Crea una nueva instancia del gráfico de línea de actividades diarias.
  dailyActivitiesChartInstance = new Chart(ctx1, {
    type: "line",
    data: {
      labels: Object.keys(activitiesPerDay),
      datasets: [{
        label: `Cantidad de actividades por día en ${capitalizeFirstLetter(new Date(currentYear, monthIndex).toLocaleString('es-ES', { month: 'long' }))} ${currentYear}`,
        data: Object.values(activitiesPerDay),
        fill: false,
        borderColor: '#ff6600',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}