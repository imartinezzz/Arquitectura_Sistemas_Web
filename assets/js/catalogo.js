/* ==========================================================
   catalogo.js · listado, búsqueda, filtros y paginación (index.html)
   Necesita: datos-productos.js y comun.js cargados antes.
   ========================================================== */
(function () {
  const PRODUCTOS_POR_PAGINA = 6;

  const formulario = document.getElementById("filtros");
  const campoBusqueda = document.getElementById("busqueda");
  const campoCategoria = document.getElementById("categoria");
  const campoMin = document.getElementById("precio-min");
  const campoMax = document.getElementById("precio-max");
  const errorFiltros = document.getElementById("error-filtros");
  const textoResultados = document.getElementById("resultados");
  const lista = document.getElementById("lista-productos");
  const paginacion = document.getElementById("paginacion");

  const activos = Catalogo.visibles();
  let filtrados = activos.slice();
  let paginaActual = 1;

  /* "Árbol" y "arbol" cuentan como lo mismo; mayúsculas da igual */
  function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /* ---------- Filtrado ---------- */
  function leerPrecio(campo) {
    return campo.value.trim() === "" ? null : Number(campo.value);
  }

  function mostrarError(texto, campos) {
    errorFiltros.textContent = texto;
    errorFiltros.hidden = false;
    campos.forEach(function (c) { c.setAttribute("aria-invalid", "true"); });
  }

  function limpiarError() {
    errorFiltros.textContent = "";
    errorFiltros.hidden = true;
    [campoMin, campoMax].forEach(function (c) { c.removeAttribute("aria-invalid"); });
  }

  function aplicarFiltros() {
    limpiarError();

    const min = leerPrecio(campoMin);
    const max = leerPrecio(campoMax);

    if ((min !== null && (isNaN(min) || min < 0)) || (max !== null && (isNaN(max) || max < 0))) {
      mostrarError("Los precios deben ser números iguales o mayores que 0.", [campoMin, campoMax]);
      return;
    }
    if (min !== null && max !== null && min > max) {
      mostrarError("El precio mínimo no puede ser mayor que el máximo.", [campoMin, campoMax]);
      return;
    }

    const texto = normalizar(campoBusqueda.value.trim());
    const categoria = campoCategoria.value;

    filtrados = activos.filter(function (p) {
      const coincideTexto = texto === "" ||
        normalizar(p.nombre + " " + p.productor + " " + p.variedad + " " + p.origen).indexOf(texto) !== -1;
      const coincideCategoria = categoria === "" || p.categoria === categoria;
      const coincideMin = min === null || p.precio >= min;
      const coincideMax = max === null || p.precio <= max;
      return coincideTexto && coincideCategoria && coincideMin && coincideMax;
    });

    paginaActual = 1;
    pintar();
  }

  /* ---------- Pintado (siempre con textContent, nunca innerHTML) ---------- */
  function crearTarjeta(p) {
    const li = document.createElement("li");
    li.className = "tarjeta-producto";

    const img = document.createElement("img");
    img.src = p.imagen;
    img.alt = "Botella de aceite " + p.nombre + " de " + p.formato_ml + " ml";
    img.width = 400;
    img.height = 300;
    img.loading = "lazy";
    li.appendChild(img);

    const cuerpo = document.createElement("div");
    cuerpo.className = "tarjeta-cuerpo";

    const titulo = document.createElement("h3");
    const enlace = document.createElement("a");
    enlace.href = "item.html?id=" + p.id;
    enlace.textContent = p.nombre;
    titulo.appendChild(enlace);
    cuerpo.appendChild(titulo);

    const productor = document.createElement("p");
    productor.className = "producto-productor";
    productor.textContent = p.productor + " · " + p.origen;
    cuerpo.appendChild(productor);

    const formato = document.createElement("p");
    formato.className = "producto-formato";
    formato.textContent = p.variedad + " · " + p.formato_ml + " ml";
    cuerpo.appendChild(formato);

    const precio = document.createElement("p");
    precio.className = "producto-precio";
    precio.textContent = formatearPrecio(p.precio);
    cuerpo.appendChild(precio);

    const disp = document.createElement("p");
    disp.className = "disponibilidad";
    if (p.stock < 1) {
      disp.textContent = "Agotado";
      disp.classList.add("agotado");
    } else if (p.stock <= 5) {
      disp.textContent = "Últimas " + p.stock + " unidades";
    } else {
      disp.textContent = "Disponible";
    }
    cuerpo.appendChild(disp);

    const ver = document.createElement("a");
    ver.className = "boton";
    ver.href = "item.html?id=" + p.id;
    ver.textContent = "Ver detalle";
    ver.setAttribute("aria-label", "Ver detalle de " + p.nombre);
    cuerpo.appendChild(ver);

    li.appendChild(cuerpo);
    return li;
  }

  function crearBoton(texto, pagina, opciones) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = texto;
    if (opciones.etiqueta) { b.setAttribute("aria-label", opciones.etiqueta); }
    if (opciones.actual) { b.setAttribute("aria-current", "page"); }
    if (opciones.desactivado) { b.disabled = true; }
    b.addEventListener("click", function () {
      paginaActual = pagina;
      pintar();
      document.getElementById("catalogo").scrollIntoView();
    });
    return b;
  }

  function pintarPaginacion(totalPaginas) {
    paginacion.textContent = "";
    if (totalPaginas <= 1) { return; }

    paginacion.appendChild(crearBoton("Anterior", paginaActual - 1, { desactivado: paginaActual === 1 }));
    for (let i = 1; i <= totalPaginas; i++) {
      paginacion.appendChild(crearBoton(String(i), i, { actual: i === paginaActual, etiqueta: "Página " + i }));
    }
    paginacion.appendChild(crearBoton("Siguiente", paginaActual + 1, { desactivado: paginaActual === totalPaginas }));
  }

  function pintar() {
    const total = filtrados.length;
    const totalPaginas = Math.max(1, Math.ceil(total / PRODUCTOS_POR_PAGINA));
    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const pagina = filtrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

    lista.textContent = "";
    pagina.forEach(function (p) { lista.appendChild(crearTarjeta(p)); });

    if (total === 0) {
      textoResultados.textContent = "No se han encontrado productos con esos criterios. Prueba a quitar algún filtro.";
    } else {
      textoResultados.textContent = "Mostrando " + pagina.length + " de " + total +
        (total === 1 ? " producto." : " productos.");
    }
    pintarPaginacion(totalPaginas);
  }

  /* ---------- Eventos ---------- */
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    aplicarFiltros();
  });

  /* "Limpiar": el navegador vacía los campos después del evento, por eso el setTimeout */
  formulario.addEventListener("reset", function () {
    setTimeout(function () {
      limpiarError();
      filtrados = activos.slice();
      paginaActual = 1;
      pintar();
    }, 0);
  });

  pintar();
})();
