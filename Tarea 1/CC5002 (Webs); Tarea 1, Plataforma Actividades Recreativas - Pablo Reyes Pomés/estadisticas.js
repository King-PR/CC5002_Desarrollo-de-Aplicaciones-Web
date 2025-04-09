// estadisticas.js

window.addEventListener("DOMContentLoaded", () => {
  // Datos de ejemplos de actividades
  const datos = [
    {
      inicio: "2025-04-05 11:00",
      termino: "2025-04-05 13:00",
      comuna: "Santiago",
      tema: "Ciencias",
      nombre: "Sofía Martínez",
      descripcion: "Actividad sobre ciencia divertida para niños."
    },
    {
      inicio: "2025-04-06 15:00",
      termino: "2025-04-06 18:00",
      comuna: "Ñuñoa",
      tema: "Baile",
      nombre: "Hugo Urrutia",
      descripcion: "Clase abierta de danza latina."
    },
    {
      inicio: "2025-04-10 09:00",
      termino: "2025-04-10 11:00",
      comuna: "Valparaíso",
      tema: "Teatro",
      nombre: "Roberto Pérez",
      descripcion: "Obra de teatro en la plaza central."
    },
    {
      inicio: "2025-04-12 16:00",
      termino: "2025-04-12 18:00",
      comuna: "Concepción",
      tema: "Deporte",
      nombre: "José Ramírez",
      descripcion: "Partido amistoso de fútbol."
    },
    {
      inicio: "2025-04-15 14:00",
      termino: "2025-04-15 16:00",
      comuna: "Viña del Mar",
      tema: "Música",
      nombre: "Andrea González",
      descripcion: "Concierto de música clásica al aire libre."
    }
  ];

  // Inicializar el objeto de recolección de datos para los 12 meses
  const actividadesPorMes = Array.from({ length: 12 }, () => ({ mañana: 0, mediodía: 0, tarde: 0 }));

  // Función para clasificar la actividad según la hora
  const clasificarActividad = (hora) => {
    if (hora >= 6 && hora < 12) return 'mañana';      // Mañana de 06:00 a 11:59
    if (hora === 12) return 'mediodía';               // Mediodía solo a las 12:00
    if (hora >= 13 && hora <= 20) return 'tarde';     // Tarde de 13:00 a 20:00
    return null;                                      // No mostrar las actividades nocturnas
  };

  // Recolectar los datos
  datos.forEach((actividad) => {
    const fecha = new Date(actividad.inicio);
    const mes = fecha.getMonth();  // Mes de 0 a 11
    const hora = fecha.getHours();
    const periodo = clasificarActividad(hora);

    // Solo incrementar si la actividad está dentro de los períodos interesan
    if (periodo) {
      actividadesPorMes[mes][periodo]++;
    }
  });

  // 1. Gráfico de actividades por día (Líneas)
  // Generar todos los días de abril (para un mes específico, por ejemplo abril)
  const generarDiasDeAbril = () => {
    const diasAbril = [];
    const mesAbril = 3; // 3 representa abril (enero es 0, febrero es 1, etc.)
    const año = 2025;
    // Generar fechas para abril de 2025
    for (let dia = 1; dia <= 30; dia++) {
      const fecha = new Date(año, mesAbril, dia);
      diasAbril.push(fecha.toISOString().split('T')[0]); // Formato 'yyyy-mm-dd'
    }
    return diasAbril;
  };

  const diasDeAbril = generarDiasDeAbril();

  // Inicializar el objeto de recolección de datos para los 30 días de abril
  const actividadesPorDia = diasDeAbril.reduce((acumulador, dia) => {
    acumulador[dia] = 0;
    return acumulador;
  }, {});

  // Recolectar los datos
  datos.forEach((actividad) => {
    const fecha = actividad.inicio.split(" ")[0]; // Tomar solo la fecha
    if (actividadesPorDia[fecha] !== undefined) {
      actividadesPorDia[fecha]++;
    }
  });

  const dias = Object.keys(actividadesPorDia);
  const cantidadPorDia = Object.values(actividadesPorDia);

  const ctx1 = document.getElementById("grafico-actividades-dia").getContext("2d");
  new Chart(ctx1, {
    type: "line",
    data: {
      labels: dias,  // Días completos de abril
      datasets: [{
        label: 'Cantidad de actividades por día',
        data: cantidadPorDia,
        fill: false,
        borderColor: '#ff6600',
        tension: 0.1
      }]
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

  // 2. Gráfico de actividades por tipo (Torta)
  const actividadesPorTipo = datos.reduce((acumulador, actividad) => {
    const valor = actividad.tema;
    acumulador[valor] = (acumulador[valor] || 0) + 1;
    return acumulador;
  }, {});

  const tipos = Object.keys(actividadesPorTipo);
  const cantidadPorTipo = Object.values(actividadesPorTipo);

  const ctx2 = document.getElementById("grafico-tipo-actividad").getContext("2d");
  new Chart(ctx2, {
    type: "pie",
    data: {
      labels: tipos,
      datasets: [{
        label: 'Actividades por tipo',
        data: cantidadPorTipo,
        backgroundColor: ['#ffcc00', '#ff6600', '#ff3333', '#66cc00', '#3399ff'],
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

  // 3. Gráfico de actividades por mes, con tres barras por mes (Barras)
  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const actividadesMañana = actividadesPorMes.map(mes => mes.mañana);
  const actividadesMediodia = actividadesPorMes.map(mes => mes.mediodía);
  const actividadesTarde = actividadesPorMes.map(mes => mes.tarde);

  const ctx3 = document.getElementById("grafico-actividades-mes").getContext("2d");
  new Chart(ctx3, {
    type: "bar",
    data: {
      labels: nombresMeses,  // Meses con nombre completo
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
});
