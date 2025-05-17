// static/estadisticas.js

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const respuesta = await fetch("/api/estadisticas");
    const datos = await respuesta.json();

    // Inicializar el objeto de recolección de datos para los 12 meses
    const actividadesPorMes = Array.from({ length: 12 }, () => ({ mañana: 0, mediodía: 0, tarde: 0 }));

    // Función para clasificar la actividad según la hora
    const clasificarActividad = (hora) => {
      if (hora >= 6 && hora < 12) return 'mañana';
      if (hora === 12) return 'mediodía';
      if (hora >= 13 && hora <= 20) return 'tarde';
      return null; // No se consideran actividades nocturnas
    };

    // Recolectar datos por mes y periodo
    datos.forEach((actividad) => {
      const fecha = new Date(actividad.inicio);
      const mes = fecha.getMonth();
      const hora = fecha.getHours();
      const periodo = clasificarActividad(hora);
      if (periodo) {
        actividadesPorMes[mes][periodo]++;
      }
    });

    // Gráfico 1: Actividades por día de abril
    const generarDiasDeAbril = () => {
      const diasAbril = [];
      const mesAbril = 3; // Abril (0-indexed)
      const año = 2025;
      for (let dia = 1; dia <= 30; dia++) {
        const fecha = new Date(año, mesAbril, dia);
        diasAbril.push(fecha.toISOString().split('T')[0]);
      }
      return diasAbril;
    };

    const diasDeAbril = generarDiasDeAbril();
    const actividadesPorDia = diasDeAbril.reduce((acum, dia) => {
      acum[dia] = 0;
      return acum;
    }, {});

    datos.forEach((actividad) => {
      const fecha = actividad.inicio.split("T")[0];
      if (actividadesPorDia[fecha] !== undefined) {
        actividadesPorDia[fecha]++;
      }
    });

    const ctx1 = document.getElementById("grafico-actividades-dia").getContext("2d");
    new Chart(ctx1, {
      type: "line",
      data: {
        labels: Object.keys(actividadesPorDia),
        datasets: [{
          label: 'Cantidad de actividades por día',
          data: Object.values(actividadesPorDia),
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

    // Gráfico 2: Actividades por tipo (Torta)
    const actividadesPorTipo = {};

    datos.forEach(actividad => {
      if (actividad.temas && Array.isArray(actividad.temas)) {
        actividad.temas.forEach(tema => {
          actividadesPorTipo[tema] = (actividadesPorTipo[tema] || 0) + 1;
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

    // Gráfico 3: Actividades por mes y franja horaria (Barras)
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

  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
});
