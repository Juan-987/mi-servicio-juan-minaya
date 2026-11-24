/* ==========================================================================
   APP NEW WORLD - Lógica Principal Frontend
   Prevención de Riesgos Laborales en Construcción y Beneficios IESS (Ecuador)
   ========================================================================== */

(function () {
  "use strict";

  // --------------------------------------------------------------------------
  // Utilidades compartidas
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    REGISTROS: "anw_registros_v1",
    EPP: "anw_checklist_epp_v1",
    RELATOS: "anw_relatos_v1",
    CARRITO: "anw_carrito_servicios_v1"
  };

  function escapeHtml(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function leerStorage(clave, valorPorDefecto) {
    try {
      const raw = localStorage.getItem(clave);
      return raw ? JSON.parse(raw) : valorPorDefecto;
    } catch (error) {
      return valorPorDefecto;
    }
  }

  function guardarStorage(clave, datos) {
    try {
      localStorage.setItem(clave, JSON.stringify(datos));
    } catch (error) {
      // Si el navegador bloquea almacenamiento local, el sitio sigue operativo en memoria.
    }
  }

  function mostrarAlerta(elemento, tipo, mensaje) {
    if (!elemento) return;
    elemento.className = "alert alert-" + tipo;
    elemento.textContent = mensaje;
  }

  function formatoMoneda(valor) {
    return "$" + Number(valor).toFixed(2);
  }

  // --------------------------------------------------------------------------
  // 1. Navegación móvil (todas las páginas)
  // --------------------------------------------------------------------------
  function initNavegacion() {
    const toggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (!toggle || !navLinks) return;

    toggle.addEventListener("click", function () {
      const abierto = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(abierto));
    });

    navLinks.querySelectorAll("a").forEach(function (enlace) {
      enlace.addEventListener("click", function () {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. Registro unificado de trabajadores y constructoras (index.html)
  // --------------------------------------------------------------------------
  function initRegistro() {
    const form = document.getElementById("formRegistro");
    const feedback = document.getElementById("registroFeedback");
    const tablaBody = document.getElementById("tablaRegistrosBody");
    const contador = document.getElementById("contadorRegistros");
    const btnLimpiar = document.getElementById("btnLimpiarRegistros");
    if (!form || !tablaBody) return;

    let registros = leerStorage(STORAGE_KEYS.REGISTROS, []);

    function renderRegistros() {
      if (contador) contador.textContent = String(registros.length);

      if (registros.length === 0) {
        tablaBody.innerHTML =
          '<tr><td colspan="4" style="text-align:center;color:#64748b;">Aún no hay registros guardados.</td></tr>';
        return;
      }

      tablaBody.innerHTML = registros
        .map(function (reg) {
          return (
            "<tr>" +
            "<td><strong>" + escapeHtml(reg.nombre) + "</strong><br>" +
            '<small style="color:#64748b;">' + escapeHtml(reg.correo) + " · " + escapeHtml(reg.edad) + " años</small></td>" +
            "<td>" + escapeHtml(reg.perfil) + "</td>" +
            "<td>" + escapeHtml(reg.interes) + "</td>" +
            '<td><button type="button" class="btn btn-danger-ghost" data-eliminar-id="' + escapeHtml(reg.id) + '">Eliminar</button></td>' +
            "</tr>"
          );
        })
        .join("");
    }

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const nombre = document.getElementById("regNombre").value.trim();
      const edadTexto = document.getElementById("regEdad").value.trim();
      const correo = document.getElementById("regCorreo").value.trim();
      const celular = document.getElementById("regCelular").value.trim();
      const perfil = document.getElementById("regPerfil").value;
      const interes = document.getElementById("regInteres").value;
      const comentario = document.getElementById("regComentario").value.trim();

      const edad = Number(edadTexto);
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const regexCelular = /^09\d{8}$/;

      if (nombre.length < 3) {
        mostrarAlerta(feedback, "error", "Ingresa tu nombre completo (mínimo 3 caracteres).");
        return;
      }

      if (edadTexto === "" || Number.isNaN(edad) || !Number.isInteger(edad) || edad < 1 || edad > 99) {
        mostrarAlerta(feedback, "error", "Ingresa una edad válida en números enteros.");
        return;
      }

      if (edad < 18) {
        mostrarAlerta(
          feedback,
          "warning",
          "Eres menor de edad (" + edad + " años). Por normativa laboral ecuatoriana no se permite el trabajo de menores en obras de construcción; puedes consultar el contenido educativo con supervisión."
        );
        return;
      }

      if (!regexCorreo.test(correo)) {
        mostrarAlerta(feedback, "error", "Ingresa un correo electrónico válido (ejemplo@dominio.com).");
        return;
      }

      if (celular !== "" && !regexCelular.test(celular)) {
        mostrarAlerta(feedback, "error", "Si ingresas celular, debe tener 10 dígitos y comenzar con 09 (Ej: 0991234567).");
        return;
      }

      if (!perfil || !interes) {
        mostrarAlerta(feedback, "error", "Selecciona tu perfil en obra y el tema de interés.");
        return;
      }

      const nuevoRegistro = {
        id: String(Date.now()),
        nombre: nombre,
        edad: edad,
        correo: correo,
        celular: celular,
        perfil: perfil,
        interes: interes,
        comentario: comentario,
        fecha: new Date().toLocaleDateString("es-EC")
      };

      registros.unshift(nuevoRegistro);
      guardarStorage(STORAGE_KEYS.REGISTROS, registros);
      renderRegistros();
      form.reset();

      mostrarAlerta(
        feedback,
        "success",
        "Registro aprobado para " + nombre + ". Tu solicitud sobre \"" + interes + "\" fue guardada correctamente."
      );
    });

    tablaBody.addEventListener("click", function (evento) {
      const boton = evento.target.closest("[data-eliminar-id]");
      if (!boton) return;
      const id = boton.getAttribute("data-eliminar-id");
      registros = registros.filter(function (item) {
        return item.id !== id;
      });
      guardarStorage(STORAGE_KEYS.REGISTROS, registros);
      renderRegistros();
    });

    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", function () {
        if (registros.length === 0) return;
        registros = [];
        guardarStorage(STORAGE_KEYS.REGISTROS, registros);
        renderRegistros();
        mostrarAlerta(feedback, "info", "Se limpió la lista de registros guardados.");
      });
    }

    renderRegistros();
  }

  // --------------------------------------------------------------------------
  // 3. Catálogo de riesgos laborales y checklist de EPP (riesgos.html)
  // --------------------------------------------------------------------------
  const CATALOGO_RIESGOS = [
    {
      titulo: "Caídas en trabajos de altura",
      categoria: "altura",
      nivel: "Crítico",
      claseBadge: "badge-critico",
      descripcion: "Riesgo principal de mortalidad en construcción al trabajar en andamios, cubiertas, losas sin barandas o escaleras por encima de 1.80 m.",
      prevencion: "Instalar barandas perimetrales, líneas de vida certificadas, andamios nivelados con rodapiés y permiso de trabajo en altura.",
      epp: "Arnés de cuerpo completo con doble eslinga y amortiguador, casco con barboquejo y botas antideslizantes."
    },
    {
      titulo: "Contacto eléctrico directo o indirecto",
      categoria: "electrico",
      nivel: "Crítico",
      claseBadge: "badge-critico",
      descripcion: "Electrocución o quemaduras por cables provisionales dañados, humedad en obra o cercanía a líneas aéreas de media tensión.",
      prevencion: "Usar tableros con disyuntor diferencial, puesta a tierra, cables protegidos en altura y bloqueo/etiquetado (LOTO) antes de intervenir.",
      epp: "Guantes dieléctricos certificados, calzado dieléctrico sin partes metálicas expuestas y casco clase E."
    },
    {
      titulo: "Derrumbes en excavaciones y zanjas",
      categoria: "estructural",
      nivel: "Crítico",
      claseBadge: "badge-critico",
      descripcion: "Atrapamiento o asfixia por colapso de taludes en zanjas profundas o suelos húmedos sin entibación.",
      prevencion: "Entibar o escalonar paredes en zanjas desde 1.20 m, mantener material excavado a más de 1 m del borde e inspeccionar tras lluvias.",
      epp: "Casco de seguridad, botas punta de acero impermeables y chaleco reflectivo."
    },
    {
      titulo: "Caída de objetos y golpes en obra",
      categoria: "estructural",
      nivel: "Alto",
      claseBadge: "badge-alto",
      descripcion: "Lesiones graves por herramientas, ladrillos, varillas o materiales que caen desde pisos superiores o maniobras de izaje.",
      prevencion: "Delimitar zonas bajo izaje, instalar mallas de contención, asegurar herramientas en altura y prohibir el paso bajo cargas suspendidas.",
      epp: "Casco de seguridad normado, botas con puntera reforzada y gafas de impacto."
    },
    {
      titulo: "Exposición a polvo de sílice, cemento y químicos",
      categoria: "salud",
      nivel: "Alto",
      claseBadge: "badge-alto",
      descripcion: "Daño respiratorio crónico (silicosis), irritación ocular y dermatitis por corte de hormigón, lijado, pintura o mezcla de cemento.",
      prevencion: "Aplicar corte húmedo para reducir polvo, ventilar áreas cerradas y consultar hojas de seguridad (HDS) de químicos.",
      epp: "Respirador con filtros P100/N95 según agente, gafas selladas y guantes resistentes a químicos."
    },
    {
      titulo: "Ruido elevado y vibraciones",
      categoria: "salud",
      nivel: "Alto",
      claseBadge: "badge-alto",
      descripcion: "Pérdida auditiva progresiva e irreversible causada por rotomartillos, amoladoras, sierras circulares y maquinaria pesada.",
      prevencion: "Rotar turnos de exposición, mantener equipos lubricados y señalizar zonas que superen los 85 decibeles.",
      epp: "Orejeras tipo copa o tapones auditivos certificados y guantes antivibración."
    },
    {
      titulo: "Atrapamientos con maquinaria y herramientas eléctricas",
      categoria: "estructural",
      nivel: "Alto",
      claseBadge: "badge-alto",
      descripcion: "Cortes profundos, amputaciones o atropellos por amoladoras sin guarda, mezcladoras o tránsito de volquetas y excavadoras.",
      prevencion: "Nunca retirar guardas de seguridad, asignar señalero (paletero) para maquinaria pesada y respetar rutas peatonales en obra.",
      epp: "Chaleco de alta visibilidad, guantes anticorte (no holgados cerca de piezas giratorias) y careta facial."
    },
    {
      titulo: "Sobreesfuerzos y manejo manual de cargas",
      categoria: "salud",
      nivel: "Medio",
      claseBadge: "badge-medio",
      descripcion: "Lesiones lumbares y musculoesqueléticas por levantar sacos de cemento, bloques o vigas con postura inadecuada.",
      prevencion: "Flexionar rodillas manteniendo espalda recta, usar carretillas o poleas y dividir cargas pesadas entre dos personas.",
      epp: "Guantes de agarre mecánico, calzado con buen soporte y pausas activas en jornada."
    }
  ];

  function initCatalogoRiesgos() {
    const grid = document.getElementById("gridRiesgos");
    const filtros = document.getElementById("filtrosRiesgos");
    const buscador = document.getElementById("buscadorRiesgos");
    const resumen = document.getElementById("resumenCatalogo");
    if (!grid) return;

    let categoriaActiva = "todos";
    let textoBusqueda = "";

    function renderCatalogo() {
      const filtrados = CATALOGO_RIESGOS.filter(function (item) {
        const coincideCategoria = categoriaActiva === "todos" || item.categoria === categoriaActiva;
        const bloqueTexto = (item.titulo + " " + item.descripcion + " " + item.prevencion + " " + item.epp).toLowerCase();
        const coincideBusqueda = textoBusqueda === "" || bloqueTexto.indexOf(textoBusqueda) !== -1;
        return coincideCategoria && coincideBusqueda;
      });

      if (resumen) {
        resumen.textContent = "Mostrando " + filtrados.length + " de " + CATALOGO_RIESGOS.length + " riesgos laborales.";
      }

      if (filtrados.length === 0) {
        grid.innerHTML =
          '<div class="card" style="grid-column:1/-1;text-align:center;"><p>No se encontraron riesgos con ese criterio de búsqueda.</p></div>';
        return;
      }

      grid.innerHTML = filtrados
        .map(function (item) {
          return (
            '<article class="card risk-card">' +
            '<div class="risk-meta">' +
            "<h3>" + escapeHtml(item.titulo) + "</h3>" +
            '<span class="badge ' + item.claseBadge + '">Riesgo ' + escapeHtml(item.nivel) + "</span>" +
            "</div>" +
            "<p>" + escapeHtml(item.descripcion) + "</p>" +
            "<p><strong>Prevención clave:</strong> " + escapeHtml(item.prevencion) + "</p>" +
            '<div class="risk-epp"><strong>EPP obligatorio:</strong> ' + escapeHtml(item.epp) + "</div>" +
            "</article>"
          );
        })
        .join("");
    }

    if (filtros) {
      filtros.addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-categoria]");
        if (!boton) return;
        categoriaActiva = boton.getAttribute("data-categoria");
        filtros.querySelectorAll(".filter-btn").forEach(function (btn) {
          btn.classList.toggle("active", btn === boton);
        });
        renderCatalogo();
      });
    }

    if (buscador) {
      buscador.addEventListener("input", function () {
        textoBusqueda = buscador.value.trim().toLowerCase();
        renderCatalogo();
      });
    }

    renderCatalogo();
  }

  function initChecklistEpp() {
    const contenedor = document.getElementById("checklistEpp");
    const barra = document.getElementById("eppBarra");
    const porcentajeEl = document.getElementById("eppPorcentaje");
    const completadosEl = document.getElementById("eppCompletados");
    const estadoEl = document.getElementById("eppEstado");
    const btnReiniciar = document.getElementById("btnReiniciarEpp");
    if (!contenedor) return;

    const checkboxes = Array.from(contenedor.querySelectorAll('input[type="checkbox"]'));
    const guardados = leerStorage(STORAGE_KEYS.EPP, []);

    checkboxes.forEach(function (cb) {
      if (guardados.indexOf(cb.value) !== -1) {
        cb.checked = true;
      }
    });

    function actualizarChecklist() {
      const marcados = checkboxes.filter(function (cb) {
        return cb.checked;
      });
      const total = checkboxes.length;
      const porcentaje = Math.round((marcados.length / total) * 100);

      guardarStorage(
        STORAGE_KEYS.EPP,
        marcados.map(function (cb) {
          return cb.value;
        })
      );

      if (barra) barra.style.width = porcentaje + "%";
      if (porcentajeEl) porcentajeEl.textContent = porcentaje + "%";
      if (completadosEl) completadosEl.textContent = String(marcados.length);

      if (marcados.length === total) {
        mostrarAlerta(estadoEl, "success", "Verificación completa (100%): cuentas con el EPP obligatorio para ingresar con seguridad a obra.");
      } else if (marcados.length >= 4) {
        mostrarAlerta(estadoEl, "warning", "Verificación incompleta (" + marcados.length + "/" + total + "): solicita a tu supervisor el EPP faltante antes de iniciar la tarea.");
      } else {
        mostrarAlerta(estadoEl, "error", "Alto riesgo: te falta equipo básico de protección (" + marcados.length + "/" + total + "). No inicies labores sin tu EPP completo.");
      }
    }

    checkboxes.forEach(function (cb) {
      cb.addEventListener("change", actualizarChecklist);
    });

    if (btnReiniciar) {
      btnReiniciar.addEventListener("click", function () {
        checkboxes.forEach(function (cb) {
          cb.checked = false;
        });
        actualizarChecklist();
      });
    }

    actualizarChecklist();
  }

  // --------------------------------------------------------------------------
  // 4. Calculadora de Beneficios IESS Ecuador (beneficios-iess.html)
  // --------------------------------------------------------------------------
  function initCalculadoraIess() {
    const form = document.getElementById("formCalculadoraIess");
    const errorEl = document.getElementById("calcError");
    if (!form) return;

    function calcular() {
      const sueldo = Number(document.getElementById("calcSueldo").value);
      const sbu = Number(document.getElementById("calcSbu").value);
      const tieneAntiguedad = document.getElementById("calcAntiguedad").value === "si";

      if (Number.isNaN(sueldo) || sueldo <= 0 || Number.isNaN(sbu) || sbu <= 0) {
        mostrarAlerta(errorEl, "error", "Ingresa valores numéricos mayores a 0 para el sueldo mensual y el SBU.");
        return;
      }

      if (errorEl) {
        errorEl.textContent = "";
        errorEl.className = "alert";
      }

      const aportePersonal = sueldo * 0.0945;
      const aportePatronal = sueldo * 0.1115;
      const sueldoNeto = sueldo - aportePersonal;
      const decimoTercero = sueldo / 12;
      const decimoCuarto = sbu / 12;
      const fondosReserva = tieneAntiguedad ? sueldo * 0.0833 : 0;
      const totalEquivalente = sueldoNeto + decimoTercero + decimoCuarto + fondosReserva;

      document.getElementById("resAportePersonal").textContent = formatoMoneda(aportePersonal);
      document.getElementById("resAportePatronal").textContent = formatoMoneda(aportePatronal);
      document.getElementById("resSueldoNeto").textContent = formatoMoneda(sueldoNeto);
      document.getElementById("resDecimoTercero").textContent = formatoMoneda(decimoTercero);
      document.getElementById("resDecimoCuarto").textContent = formatoMoneda(decimoCuarto);
      document.getElementById("resFondosReserva").textContent = formatoMoneda(fondosReserva);
      document.getElementById("resTotalMensual").textContent = formatoMoneda(totalEquivalente);
    }

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      calcular();
    });

    // Cálculo inicial al abrir la página
    calcular();
  }

  // --------------------------------------------------------------------------
  // 5. Testimonios de trabajadores antiguos y Quiz de Seguridad (capacitacion.html)
  // --------------------------------------------------------------------------
  const RELATOS_BASE = [
    {
      autor: "Segundo Quilumba",
      oficio: "Maestro mayor · 18 años en obra (Quito)",
      texto: "En mis primeros años muchos subíamos a los andamios sin arnés por ahorrar cinco minutos. Un compañero cayó de un segundo piso y sobrevivió solo porque ese día sí llevaba casco con barboquejo. Desde entonces no dejo subir a nadie sin línea de vida."
    },
    {
      autor: "Luis Tipán",
      oficio: "Fierrero estructural · 14 años de experiencia",
      texto: "Antes aceptaba trabajos sin afiliación al IESS porque pagaban unos dólares más en mano. Cuando tuve un corte grave con amoladora, aprendí que sin seguro todo se pierde. Hoy lo primero que exijo es contrato, IESS activo y EPP completo."
    },
    {
      autor: "Marco Villalba",
      oficio: "Electricista de obra · 11 años de experiencia",
      texto: "La electricidad en construcción no avisa, sobre todo cuando llueve. Revisar tableros, usar guantes dieléctricos y cortar la energía antes de tocar un cable te garantiza regresar sano con tu familia cada tarde."
    }
  ];

  function initRelatos() {
    const lista = document.getElementById("listaRelatos");
    const form = document.getElementById("formRelato");
    const feedback = document.getElementById("relatoFeedback");
    if (!lista) return;

    const personalizados = leerStorage(STORAGE_KEYS.RELATOS, []);
    let relatos = personalizados.concat(RELATOS_BASE);

    function renderRelatos() {
      lista.innerHTML = relatos
        .map(function (r) {
          return (
            '<article class="card quote-card">' +
            '<p class="quote-text">"' + escapeHtml(r.texto) + '"</p>' +
            '<div class="quote-author">' + escapeHtml(r.autor) + "</div>" +
            '<div class="quote-role">' + escapeHtml(r.oficio) + "</div>" +
            "</article>"
          );
        })
        .join("");
    }

    if (form) {
      form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const autor = document.getElementById("relatoAutor").value.trim();
        const oficio = document.getElementById("relatoOficio").value.trim();
        const texto = document.getElementById("relatoTexto").value.trim();

        if (autor.length < 3 || oficio.length < 3 || texto.length < 15) {
          mostrarAlerta(feedback, "error", "Completa tu nombre, oficio y escribe un consejo de al menos 15 caracteres.");
          return;
        }

        const nuevo = { autor: autor, oficio: oficio, texto: texto };
        personalizados.unshift(nuevo);
        guardarStorage(STORAGE_KEYS.RELATOS, personalizados);
        relatos = personalizados.concat(RELATOS_BASE);
        renderRelatos();
        form.reset();
        mostrarAlerta(feedback, "success", "¡Gracias por compartir tu experiencia! Tu relato ya está visible para otros trabajadores.");
      });
    }

    renderRelatos();
  }

  const PREGUNTAS_QUIZ = [
    {
      id: "p1",
      pregunta: "1. ¿A partir de qué altura es obligatorio usar arnés de seguridad y línea de vida en obra?",
      opciones: [
        "A partir de 5 metros únicamente",
        "Desde 1.80 metros sobre el nivel del suelo o piso inferior",
        "Solo cuando llueve o hay viento fuerte"
      ],
      correcta: 1,
      explicacion: "Todo trabajo a partir de 1.80 m se considera trabajo en altura y exige protección contra caídas."
    },
    {
      id: "p2",
      pregunta: "2. ¿Desde cuándo tiene obligación la constructora de afiliar al trabajador al IESS?",
      opciones: [
        "Después de pasar 3 meses de prueba",
        "Desde el primer día de labores bajo relación de dependencia",
        "Solo si el trabajador lo pide por escrito"
      ],
      correcta: 1,
      explicacion: "En Ecuador la afiliación al IESS es obligatoria desde el primer día de trabajo."
    },
    {
      id: "p3",
      pregunta: "3. ¿Cuál es el plazo máximo que tiene el empleador para presentar el Aviso de Accidente de Trabajo ante el IESS?",
      opciones: [
        "Dentro de los primeros 10 días laborables",
        "Al finalizar el año fiscal",
        "Dentro de 6 meses después del alta médica"
      ],
      correcta: 0,
      explicacion: "El Aviso de Accidente de Trabajo debe reportarse en el IESS dentro de los primeros 10 días laborables."
    },
    {
      id: "p4",
      pregunta: "4. ¿Cuál es la primera medida antes de cortar hormigón o manipular polvo de cemento?",
      opciones: [
        "Usar únicamente casco y trabajar más rápido",
        "Usar respirador/mascarilla adecuada y gafas de protección",
        "No requiere equipo porque es un trabajo rutinario"
      ],
      correcta: 1,
      explicacion: "El polvo de sílice y cemento causa lesiones respiratorias y oculares graves si no se usa protección adecuada."
    },
    {
      id: "p5",
      pregunta: "5. Si encuentras una amoladora sin guarda de protección o un cable eléctrico pelado en obra, ¿qué debes hacer?",
      opciones: [
        "Usarlo con cuidado para no retrasar la obra",
        "Retirarlo de uso y reportarlo de inmediato al supervisor",
        "Envolverlo con papel y continuar trabajando"
      ],
      correcta: 1,
      explicacion: "Las herramientas defectuosas deben etiquetarse, retirarse de servicio y reportarse inmediatamente."
    },
    {
      id: "p6",
      pregunta: "6. ¿Cuál es el porcentaje aproximado del aporte personal del trabajador privado al IESS en Ecuador?",
      opciones: [
        "9.45% de la remuneración mensual",
        "25% de la remuneración mensual",
        "0%, el trabajador nunca aporta"
      ],
      correcta: 0,
      explicacion: "El aporte personal general en el sector privado es del 9.45%, mientras que el patronal es del 11.15%."
    }
  ];

  function initQuiz() {
    const form = document.getElementById("formQuiz");
    const contenedor = document.getElementById("quizContenedor");
    const resultadoEl = document.getElementById("quizResultado");
    const btnReiniciar = document.getElementById("btnReiniciarQuiz");
    const certBox = document.getElementById("certificadoBox");
    const btnImprimir = document.getElementById("btnImprimirCert");
    if (!form || !contenedor) return;

    function renderPreguntas() {
      contenedor.innerHTML = PREGUNTAS_QUIZ.map(function (q) {
        const opcionesHtml = q.opciones
          .map(function (opcion, idx) {
            return (
              '<label class="quiz-option">' +
              '<input type="radio" name="' + q.id + '" value="' + idx + '">' +
              "<span>" + escapeHtml(opcion) + "</span>" +
              "</label>"
            );
          })
          .join("");

        return (
          '<fieldset class="quiz-question" id="fieldset-' + q.id + '">' +
          "<legend>" + escapeHtml(q.pregunta) + "</legend>" +
          '<div class="quiz-options">' + opcionesHtml + "</div>" +
          '<div class="quiz-feedback" id="fb-' + q.id + '"></div>' +
          "</fieldset>"
        );
      }).join("");
    }

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const nombre = document.getElementById("quizNombre").value.trim();
      if (nombre.length < 3) {
        mostrarAlerta(resultadoEl, "error", "Escribe tu nombre completo antes de calificar la evaluación.");
        return;
      }

      let respondidas = 0;
      let aciertos = 0;

      PREGUNTAS_QUIZ.forEach(function (q) {
        const seleccionada = form.querySelector('input[name="' + q.id + '"]:checked');
        const fb = document.getElementById("fb-" + q.id);

        if (!seleccionada) {
          if (fb) {
            fb.style.color = "#b45309";
            fb.textContent = "Sin responder.";
          }
          return;
        }

        respondidas += 1;
        const valor = Number(seleccionada.value);
        if (valor === q.correcta) {
          aciertos += 1;
          if (fb) {
            fb.style.color = "#15803d";
            fb.textContent = "Correcto: " + q.explicacion;
          }
        } else {
          if (fb) {
            fb.style.color = "#b91c1c";
            fb.textContent = "Incorrecto. " + q.explicacion;
          }
        }
      });

      if (respondidas < PREGUNTAS_QUIZ.length) {
        mostrarAlerta(
          resultadoEl,
          "warning",
          "Por favor responde las " + PREGUNTAS_QUIZ.length + " preguntas para obtener tu calificación final."
        );
        if (certBox) certBox.classList.add("hidden");
        return;
      }

      const porcentaje = Math.round((aciertos / PREGUNTAS_QUIZ.length) * 100);

      if (porcentaje >= 70) {
        mostrarAlerta(
          resultadoEl,
          "success",
          "¡Felicidades, " + nombre + "! Aprobaste con " + aciertos + "/" + PREGUNTAS_QUIZ.length + " (" + porcentaje + "%). Tu constancia está lista debajo."
        );
        if (certBox) {
          document.getElementById("certNombre").textContent = nombre;
          document.getElementById("certPuntaje").textContent = aciertos + "/" + PREGUNTAS_QUIZ.length + " (" + porcentaje + "%)";
          document.getElementById("certFecha").textContent = "Emitida el " + new Date().toLocaleDateString("es-EC", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) + " · Quito, Ecuador";
          certBox.classList.remove("hidden");
          certBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        mostrarAlerta(
          resultadoEl,
          "error",
          "Obtuviste " + aciertos + "/" + PREGUNTAS_QUIZ.length + " (" + porcentaje + "%). Revisa las explicaciones marcadas en rojo e inténtalo nuevamente (mínimo 70% para aprobar)."
        );
        if (certBox) certBox.classList.add("hidden");
      }
    });

    if (btnReiniciar) {
      btnReiniciar.addEventListener("click", function () {
        form.reset();
        PREGUNTAS_QUIZ.forEach(function (q) {
          const fb = document.getElementById("fb-" + q.id);
          if (fb) fb.textContent = "";
        });
        if (resultadoEl) {
          resultadoEl.textContent = "";
          resultadoEl.className = "alert";
        }
        if (certBox) certBox.classList.add("hidden");
      });
    }

    if (btnImprimir) {
      btnImprimir.addEventListener("click", function () {
        window.print();
      });
    }

    renderPreguntas();
  }

  // --------------------------------------------------------------------------
  // 6. Catálogo de Servicios (BD), Buscador, Carrito y Cotizador (servicios.html)
  //    Implementación de funciones con parámetros/return, arreglo de objetos,
  //    filtros y carrito con total (Clase 12).
  // --------------------------------------------------------------------------
  const servicios = [
    {
      id: 1,
      nombre: "Seguridad en el trabajo",
      precio: 0.0,
      categoria: "Seguridad General",
      foto: "imagenes/imagen4.jpg",
      descripcion: "Guía integral de prevención de riesgos laborales, señalización obligatoria, botiquín y plan PRL para toda obra."
    },
    {
      id: 2,
      nombre: "Caídas al mismo nivel",
      precio: 0.0,
      categoria: "Riesgos en Obra",
      foto: "imagenes/imagen1.jpg",
      descripcion: "Medidas prácticas de orden, limpieza, superficies antideslizantes y rutas despejadas para evitar tropiezos y resbalones."
    },
    {
      id: 3,
      nombre: "Golpes y cortes",
      precio: 0.0,
      categoria: "Riesgos en Obra",
      foto: "imagenes/imagen3.jpg",
      descripcion: "Prevención de lesiones con herramientas manuales y materiales usando guantes anticorte, casco, gafas y guardas de protección."
    },
    {
      id: 4,
      nombre: "Riesgos eléctricos",
      precio: 0.0,
      categoria: "Riesgos Técnicos",
      foto: "imagenes/imagen2.jpg",
      descripcion: "Protocolos de seguridad en tableros provisionales, bloqueo y etiquetado (LOTO) y uso de EPP dieléctrico en obra."
    },
    {
      id: 5,
      nombre: "Riesgos ergonómicos y físicos",
      precio: 0.0,
      categoria: "Salud Laboral",
      foto: "imagenes/imagen5.jpg",
      descripcion: "Técnicas de levantamiento seguro de cargas, control de ruido, polvo de sílice, vibraciones y pausas activas."
    },
    {
      id: 6,
      nombre: "Capacitaciones para la constructora",
      precio: 35.0,
      categoria: "Empresas",
      foto: "imagenes/imagen2.jpg",
      descripcion: "Jornada presencial o virtual de inducción en PRL, uso obligatorio de EPP y cumplimiento IESS dirigida a cuadrillas y empresas constructoras."
    }
  ];

  // Funciones con parámetros y return (requerimiento Clase 12)
  function calcularTotal(precio, cantidad) {
    return precio * cantidad;
  }

  function aplicarDescuento(subtotal, porcentaje) {
    return subtotal - (subtotal * porcentaje) / 100;
  }

  let carrito = [];
  let ultimoAgregado = "";

  function initTiendaServicios() {
    const listaProductos = document.getElementById("listaProductos");
    const campoBuscar = document.getElementById("campoBuscar");
    const selCategoria = document.getElementById("selCategoria");
    const botonFiltrar = document.getElementById("btnFiltrar");
    const resumenServicios = document.getElementById("resumenServicios");
    const textoCarrito = document.getElementById("textoCarrito");
    const detalleCarrito = document.getElementById("detalleCarrito");
    const botonVaciar = document.getElementById("btnVaciar");
    const botonConfirmar = document.getElementById("btnConfirmarCarrito");
    const carritoFeedback = document.getElementById("carritoFeedback");

    if (!listaProductos) return;

    carrito = leerStorage(STORAGE_KEYS.CARRITO, []);

    function mostrarServicios(lista) {
      let html = "";

      for (let i = 0; i < lista.length; i++) {
        const s = lista[i];
        const esGratis = s.precio === 0;
        const etiquetaPrecio = esGratis ? "Gratis · $0.00" : "$" + s.precio.toFixed(2);
        const clasePrecio = esGratis ? "price-tag price-free" : "price-tag price-paid";
        const claseBadge = esGratis ? "badge badge-ok" : "badge badge-alto";

        html =
          html +
          '<li class="card service-card">' +
          '<img src="' + escapeHtml(s.foto) + '" alt="' + escapeHtml(s.nombre) + '" class="foto-producto">' +
          '<div class="service-body">' +
          '<div class="service-top-meta">' +
          '<span class="service-id">ID #' + s.id + "</span>" +
          '<span class="' + claseBadge + '">' + escapeHtml(s.categoria) + "</span>" +
          "</div>" +
          "<h3>" + escapeHtml(s.nombre) + "</h3>" +
          '<p class="service-desc">' + escapeHtml(s.descripcion) + "</p>" +
          '<div class="service-footer">' +
          '<span class="' + clasePrecio + '">' + etiquetaPrecio + "</span>" +
          '<button type="button" class="btn btn-secondary" data-agregar-id="' + s.id + '">Agregar</button>' +
          "</div>" +
          "</div>" +
          "</li>";
      }

      if (lista.length === 0) {
        html =
          '<li class="card" style="grid-column:1/-1;text-align:center;">No se encontraron servicios con ese criterio.</li>';
      }

      listaProductos.innerHTML = html;

      if (resumenServicios) {
        resumenServicios.textContent = "Mostrando " + lista.length + " de " + servicios.length + " servicios disponibles.";
      }
    }

    function filtrarServicios() {
      const texto = campoBuscar ? campoBuscar.value.trim().toLowerCase() : "";
      const categoria = selCategoria ? selCategoria.value : "todas";
      const resultado = [];

      for (let i = 0; i < servicios.length; i++) {
        const s = servicios[i];
        const textoCompleto = (s.nombre + " " + s.descripcion).toLowerCase();
        const coincideNombre = textoCompleto.includes(texto);
        const coincideCategoria = categoria === "todas" || s.categoria === categoria;

        if (coincideNombre && coincideCategoria) {
          resultado.push(s);
        }
      }

      mostrarServicios(resultado);
    }

    function mostrarCarrito() {
      if (!textoCarrito) return;

      if (carrito.length === 0) {
        textoCarrito.textContent = "El carrito está vacío.";
        if (detalleCarrito) detalleCarrito.innerHTML = "";
        return;
      }

      let total = 0;
      for (let i = 0; i < carrito.length; i++) {
        total = total + carrito[i].precio;
      }

      let resumen = "Servicios: " + carrito.length + " | Total: $" + total.toFixed(2);
      if (ultimoAgregado !== "") {
        resumen = resumen + " | Último agregado: " + ultimoAgregado;
      }
      textoCarrito.textContent = resumen;

      if (detalleCarrito) {
        let itemsHtml = "";
        for (let i = 0; i < carrito.length; i++) {
          const item = carrito[i];
          itemsHtml =
            itemsHtml +
            '<li class="cart-item-row">' +
            "<span><strong>" + escapeHtml(item.nombre) + "</strong><br>" +
            '<small style="color:#64748b;">$' + item.precio.toFixed(2) + "</small></span>" +
            '<button type="button" class="btn btn-danger-ghost" data-quitar-indice="' + i + '">Quitar</button>' +
            "</li>";
        }
        detalleCarrito.innerHTML = itemsHtml;
      }
    }

    function agregarAlCarrito(id) {
      for (let i = 0; i < servicios.length; i++) {
        if (servicios[i].id === id) {
          carrito.push(servicios[i]);
          ultimoAgregado = servicios[i].nombre;
        }
      }
      guardarStorage(STORAGE_KEYS.CARRITO, carrito);
      mostrarCarrito();
      if (carritoFeedback) {
        mostrarAlerta(carritoFeedback, "info", "Se agregó \"" + ultimoAgregado + "\" a tu carrito.");
      }
    }

    function quitarDelCarrito(indice) {
      if (indice < 0 || indice >= carrito.length) return;
      carrito.splice(indice, 1);
      if (carrito.length === 0) ultimoAgregado = "";
      guardarStorage(STORAGE_KEYS.CARRITO, carrito);
      mostrarCarrito();
    }

    function vaciarCarrito() {
      // Vaciamos el arreglo del carrito en memoria dejándolo en cero elementos
      carrito = [];
      // Limpiamos el nombre del último servicio añadido
      ultimoAgregado = "";
      // Guardamos el arreglo vacío en localStorage para que persista
      guardarStorage(STORAGE_KEYS.CARRITO, carrito);
      // Actualizamos la presentación visual del carrito
      mostrarCarrito();
      // Si existe el contenedor de avisos del carrito, informamos al usuario
      if (carritoFeedback) {
        mostrarAlerta(carritoFeedback, "info", "El carrito se vació correctamente.");
      }
    }

    listaProductos.addEventListener("click", function (evento) {
      const boton = evento.target.closest("[data-agregar-id]");
      if (!boton) return;
      const id = Number(boton.getAttribute("data-agregar-id"));
      agregarAlCarrito(id);
    });

    if (detalleCarrito) {
      detalleCarrito.addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-quitar-indice]");
        if (!boton) return;
        const indice = Number(boton.getAttribute("data-quitar-indice"));
        quitarDelCarrito(indice);
      });
    }

    if (botonFiltrar) {
      botonFiltrar.addEventListener("click", filtrarServicios);
    }

    if (campoBuscar) {
      campoBuscar.addEventListener("input", filtrarServicios);
    }

    if (selCategoria) {
      selCategoria.addEventListener("change", filtrarServicios);
    }

    if (botonVaciar) {
      botonVaciar.addEventListener("click", vaciarCarrito);
    }

    // Inicialización del catálogo y carrito en servicios.html
    mostrarServicios(servicios);
    mostrarCarrito();

    // Exportamos la función vaciarCarrito al ámbito accesible para finalizarCompra
    window.vaciarCarritoApp = vaciarCarrito;
    window.mostrarCarritoApp = mostrarCarrito;
  }

  // --------------------------------------------------------------------------
  // 7. Requerimientos de la Clase 13: Cuentas, Login, Compra y Pedidos
  //    (Simulación en el navegador con LocalStorage - Fundamentos de Programación I)
  // --------------------------------------------------------------------------

  // ===== PIEZA 2: Conectar JavaScript con el HTML (Referencias del DOM) =====
  // Obtenemos los campos de texto donde el visitante escribe su usuario y contraseña
  const cuUsuario = document.getElementById("cuUsuario");
  const cuClave = document.getElementById("cuClave");

  // Obtenemos los párrafos donde mostraremos avisos y el estado actual de la sesión
  const mensajeCuenta = document.getElementById("mensajeCuenta");
  const estadoSesion = document.getElementById("estadoSesion");

  // Obtenemos la lista <ul> donde mostraremos los pedidos registrados del usuario
  const listaPedidos = document.getElementById("listaPedidos");

  // Obtenemos los tres botones de control de cuenta
  const botonRegistro = document.getElementById("btnRegistro");
  const botonEntrar = document.getElementById("btnEntrar");
  const botonSalir = document.getElementById("btnSalir");

  // Obtenemos el elemento de compra y su párrafo de mensajes (Práctica 2)
  const botonComprar = document.getElementById("btnComprar");
  const mensajeCompra = document.getElementById("mensajeCompra");

  // Obtenemos el indicador de sesión de la barra de navegación superior (Reto Clase 13)
  const headerUserSession = document.getElementById("headerUserSession");

  // ===== PIEZA 3: La memoria: usuarios y sesión activa =====
  // Leemos el texto guardado con la clave "usuarios" en localStorage y lo convertimos en arreglo.
  // Si nunca se ha guardado nada (es null), el operador || asigna un arreglo vacío []
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Leemos quién tiene la sesión activa (la pulsera). Vale null si nadie ha iniciado sesión.
  let usuarioActivo = localStorage.getItem("usuarioActivo");

  // ===== PIEZA 4: Función avisar (mensajes en pantalla) =====
  // Función reutilizable para mostrar avisos con un texto y un color específico
  function avisar(texto, color) {
    // Verificamos que el párrafo exista en esta página para no causar errores
    if (mensajeCuenta !== null) {
      // Asignamos el texto recibido como mensaje
      mensajeCuenta.textContent = texto;
      // Asignamos el color: "red" para errores y "green" para confirmaciones de éxito
      mensajeCuenta.style.color = color;
    }
  }

  // ===== PIEZA 5: Función buscarUsuario (buscar en la lista) =====
  // Recorre el arreglo de usuarios para verificar si ya existe alguien con ese nombre
  function buscarUsuario(nombre) {
    // Ciclo for que recorre cada posición del arreglo usuarios de principio a fin
    for (let i = 0; i < usuarios.length; i++) {
      // Compara de forma exacta (===) el nombre guardado con el buscado
      if (usuarios[i].usuario === nombre) {
        // Si lo encuentra, devuelve el objeto completo del usuario encontrado
        return usuarios[i];
      }
    }
    // Si el ciclo termina sin encontrar coincidencias, devuelve null (no existe)
    return null;
  }

  // ===== PIEZA 6: Función registrar (crear una cuenta) =====
  // Valida los datos y agrega un nuevo usuario al arreglo y a localStorage
  function registrar() {
    // Si los campos de texto no están en la página actual, salimos
    if (cuUsuario === null || cuClave === null) return;

    // Leemos el texto del usuario y eliminamos espacios al inicio y final con trim()
    const nombre = cuUsuario.value.trim();
    // Leemos la contraseña exactamente como fue escrita
    const clave = cuClave.value;

    // Primera revisión: ¿el usuario está vacío O la clave tiene menos de 6 caracteres?
    if (nombre === "" || clave.length < 6) {
      // Mostramos el mensaje de error en color rojo
      avisar("Escribe un usuario y una contraseña de al menos 6 caracteres.", "red");
      // Detenemos la función con return para que no continúe guardando
      return;
    }

    // Segunda revisión: ¿el usuario ya existe en la lista de usuarios?
    if (buscarUsuario(nombre) !== null) {
      // Si buscarUsuario devolvió algo diferente de null, ya existe
      avisar("Ese usuario ya existe.", "red");
      // Detenemos la función para no permitir duplicados
      return;
    }

    // Si pasó todas las revisiones, agregamos el nuevo objeto al arreglo de usuarios
    usuarios.push({ usuario: nombre, clave: clave });

    // Guardamos el arreglo completo convertido a texto JSON en localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Limpiamos los campos de entrada
    cuUsuario.value = "";
    cuClave.value = "";

    // Confirmamos al usuario en color verde que la cuenta fue creada
    avisar("Cuenta creada. Ahora inicia sesión.", "green");
  }

  // ===== PIEZA 7: Función iniciarSesion (comprobar y recordar) =====
  // Valida que el usuario exista y que la clave coincida; luego guarda la sesión activa
  function iniciarSesion() {
    // Si los campos no existen en la página, no hacemos nada
    if (cuUsuario === null || cuClave === null) return;

    // Buscamos al usuario en el arreglo mediante el nombre ingresado
    const u = buscarUsuario(cuUsuario.value.trim());

    // ¿El usuario no existe (null) O la contraseña guardada no es igual a la escrita?
    if (u === null || u.clave !== cuClave.value) {
      // Mostramos un único mensaje de error para proteger la seguridad
      avisar("Usuario o contraseña incorrectos.", "red");
      // Detenemos la ejecución
      return;
    }

    // Si las credenciales son correctas, guardamos el nombre del usuario activo (la pulsera)
    usuarioActivo = u.usuario;

    // Guardamos la sesión activa en localStorage para que sobreviva si recargamos la página
    localStorage.setItem("usuarioActivo", usuarioActivo);

    // Damos la bienvenida personalizada en color verde
    avisar("Bienvenido, " + usuarioActivo + ".", "green");

    // Limpiamos los campos
    cuUsuario.value = "";
    cuClave.value = "";

    // Actualizamos la pantalla para mostrar el nuevo estado
    actualizarSesion();
  }

  // ===== PIEZA 8: Función cerrarSesion (quitar la pulsera) =====
  // Elimina la sesión activa y refresca la interfaz
  function cerrarSesion() {
    // Borramos la variable en memoria dejándola en null
    usuarioActivo = null;

    // Eliminamos el dato guardado en localStorage
    localStorage.removeItem("usuarioActivo");

    // Avisamos en verde que la sesión fue cerrada
    avisar("Sesión cerrada.", "green");

    // Actualizamos la pantalla (mostrará "Sin sesión" y reiniciará los pedidos)
    actualizarSesion();
  }

  // ===== PIEZA 8 (Continuación): Función mostrarPedidos =====
  // Lee los pedidos guardados y genera el HTML únicamente de los pedidos del usuario activo
  function mostrarPedidos() {
    // Si la lista no existe en la página actual, salimos
    if (listaPedidos === null) {
      return;
    }

    // Leemos la lista de pedidos guardada en localStorage o un arreglo vacío si no hay
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    // Variable acumuladora de texto que contendrá las etiquetas <li>
    let html = "";

    // Recorremos todos los pedidos guardados en el sistema
    for (let i = 0; i < pedidos.length; i++) {
      // Filtro de seguridad: solo sumamos los pedidos que pertenezcan al usuario con sesión activa
      if (pedidos[i].usuario === usuarioActivo) {
        // Concatenamos una fila de lista con la fecha, cantidad de productos y el total formateado
        html = html + "<li>" + pedidos[i].fecha + " - " + pedidos[i].cantidad + " producto(s) - $" + Number(pedidos[i].total).toFixed(2) + "</li>";
      }
    }

    // Si el acumulador sigue vacío, significa que el usuario no tiene compras registradas
    if (html === "") {
      html = "<li>Aún no tienes pedidos.</li>";
    }

    // Asignamos el HTML generado dentro de la etiqueta <ul>
    listaPedidos.innerHTML = html;
  }

  // ===== PIEZA 8 (Continuación): Función actualizarSesion =====
  // Refresca los textos en pantalla según si hay alguien conectado o no
  function actualizarSesion() {
    // Si existe el elemento estadoSesion en la página de cuenta
    if (estadoSesion !== null) {
      // Verificamos si no hay nadie conectado
      if (usuarioActivo === null) {
        estadoSesion.textContent = "Sin sesión.";
        estadoSesion.className = "session-status";
      } else {
        // Si hay alguien conectado, mostramos su nombre
        estadoSesion.textContent = "Sesión activa: " + usuarioActivo;
        estadoSesion.className = "session-status activa";
      }
    }

    // Actualizamos el distintivo del encabezado de todas las páginas (Reto Clase 13)
    if (headerUserSession !== null) {
      if (usuarioActivo === null) {
        headerUserSession.textContent = "Sin sesión";
        headerUserSession.className = "nav-session-badge";
      } else {
        headerUserSession.textContent = "👤 Sesión: " + usuarioActivo;
        headerUserSession.className = "nav-session-badge activa";
      }
    }

    // Refrescamos los pedidos en pantalla
    mostrarPedidos();
  }

  // ===== PRÁCTICA 2 (Clase 13): Compra que exige sesión activa =====

  // Función requerida para calcular el precio acumulado de todos los servicios en el carrito
  function calcularTotalCarrito() {
    // Variable acumuladora iniciada en cero
    let total = 0;

    // Recorremos cada servicio guardado en el carrito
    for (let i = 0; i < carrito.length; i++) {
      // Sumamos el precio del servicio actual al acumulador
      total = total + carrito[i].precio;
    }

    // Retornamos el número final acumulado
    return total;
  }

  // Función que procesa la compra respetando el principio "revisar primero, actuar después"
  function finalizarCompra() {
    // Revisión 1: ¿hay alguien con sesión activa?
    if (usuarioActivo === null) {
      if (mensajeCompra !== null) {
        mensajeCompra.textContent = "Inicia sesión para comprar.";
        mensajeCompra.style.color = "red";
        mensajeCompra.style.display = "block";
      }
      return; // Detenemos la compra
    }

    // Revisión 2: ¿el carrito tiene servicios seleccionados?
    if (carrito.length === 0) {
      if (mensajeCompra !== null) {
        mensajeCompra.textContent = "Tu carrito está vacío.";
        mensajeCompra.style.color = "red";
        mensajeCompra.style.display = "block";
      }
      return; // Detenemos la compra
    }

    // Leemos los pedidos previos de localStorage o iniciamos con arreglo vacío
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    // Creamos el nuevo objeto pedido con los datos de la compra
    const pedido = {
      usuario: usuarioActivo,
      cantidad: carrito.length,
      total: calcularTotalCarrito(),
      fecha: new Date().toLocaleDateString()
    };

    // Guardamos el nuevo pedido en el arreglo
    pedidos.push(pedido);

    // Guardamos el arreglo completo en localStorage con la clave "pedidos"
    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    // Mostramos mensaje de agradecimiento con el total formateado a 2 decimales
    if (mensajeCompra !== null) {
      mensajeCompra.textContent = "Gracias, " + usuarioActivo + ". Pedido registrado por $" + pedido.total.toFixed(2) + ".";
      mensajeCompra.style.color = "green";
      mensajeCompra.style.display = "block";
    }

    // Vaciamos el carrito tras la compra exitosa
    if (typeof window.vaciarCarritoApp === "function") {
      window.vaciarCarritoApp();
    } else {
      carrito = [];
      guardarStorage(STORAGE_KEYS.CARRITO, carrito);
    }

    // Actualizamos la lista de pedidos en pantalla
    mostrarPedidos();
  }

  // ===== PIEZA 9: Conectar los botones con sus funciones (Eventos) =====
  // Verificamos que los botones de cuenta existan antes de conectar los listeners
  if (botonRegistro !== null && botonEntrar !== null && botonSalir !== null) {
    botonRegistro.addEventListener("click", registrar);
    botonEntrar.addEventListener("click", iniciarSesion);
    botonSalir.addEventListener("click", cerrarSesion);
  }

  // Conectamos el botón de finalizar compra con su función
  if (botonComprar !== null) {
    botonComprar.addEventListener("click", finalizarCompra);
  }

  // Llamada inicial para reflejar el estado actual al cargar la página
  actualizarSesion();

  function initCotizadorTotal() {
    const campoPrecio = document.getElementById("campoPrecio");
    const campoCantidad = document.getElementById("campoCantidad");
    const campoDescuento = document.getElementById("campoDescuento");
    const botonTotal = document.getElementById("btnTotal");
    const resultadoTotal = document.getElementById("resultadoTotal");

    if (!campoPrecio || !campoCantidad || !botonTotal || !resultadoTotal) return;

    botonTotal.addEventListener("click", function () {
      const precioTexto = campoPrecio.value.trim();
      const cantidadTexto = campoCantidad.value.trim();
      const descuentoTexto = campoDescuento ? campoDescuento.value.trim() : "0";

      if (precioTexto === "" || cantidadTexto === "") {
        mostrarAlerta(resultadoTotal, "error", "Completa precio y cantidad para calcular el total.");
        return;
      }

      const precio = Number(precioTexto);
      const cantidad = Number(cantidadTexto);
      const descuento = descuentoTexto === "" ? 0 : Number(descuentoTexto);

      if (Number.isNaN(precio) || precio < 0 || Number.isNaN(cantidad) || cantidad < 1) {
        mostrarAlerta(resultadoTotal, "error", "Ingresa un precio válido (0 o mayor) y una cantidad mínima de 1.");
        return;
      }

      if (Number.isNaN(descuento) || descuento < 0 || descuento > 50) {
        mostrarAlerta(resultadoTotal, "error", "El descuento corporativo debe estar entre 0% y 50%.");
        return;
      }

      const subtotal = calcularTotal(precio, cantidad);
      const totalFinal = aplicarDescuento(subtotal, descuento);

      if (descuento > 0) {
        mostrarAlerta(
          resultadoTotal,
          "success",
          "Subtotal: $" + subtotal.toFixed(2) + " | Descuento (" + descuento + "%): -$" + (subtotal - totalFinal).toFixed(2) + " | Total final: $" + totalFinal.toFixed(2)
        );
      } else {
        mostrarAlerta(resultadoTotal, "success", "Total: $" + totalFinal.toFixed(2));
      }
    });
  }

  // --------------------------------------------------------------------------
  // Inicialización global
  // --------------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    initNavegacion();
    initRegistro();
    initCatalogoRiesgos();
    initChecklistEpp();
    initCalculadoraIess();
    initRelatos();
    initQuiz();
    initTiendaServicios();
    initCotizadorTotal();
    actualizarSesion();
  });
})();
