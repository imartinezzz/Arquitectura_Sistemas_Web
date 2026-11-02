/* ==========================================================
   cart.js · página del carrito (cart.html)
   Necesita: datos-productos.js y comun.js cargados antes.
   ========================================================== */
(function () {
  const titulo = document.getElementById("titulo-carrito");
  const estado = document.getElementById("estado-carrito");
  const error = document.getElementById("error-carrito");
  const seccionVacio = document.getElementById("carrito-vacio");
  const seccionContenido = document.getElementById("carrito-contenido");
  const cuerpo = document.getElementById("lineas-carrito");
  const total = document.getElementById("total-carrito");

  /* Si en localStorage queda un producto que ya no existe, se descarta */
  Carrito.obtener().forEach(function (l) {
    if (!buscarProducto(l.id)) { Carrito.eliminar(l.id); }
  });

  function limpiarAvisos() {
    estado.textContent = "";
    error.textContent = "";
    error.hidden = true;
  }

  function mostrarError(texto, campo) {
    estado.textContent = "";
    error.textContent = texto;
    error.hidden = false;
    if (campo) {
      campo.setAttribute("aria-invalid", "true");
      campo.focus();
    }
  }

  function crearCelda(etiqueta) {
    const td = document.createElement("td");
    td.setAttribute("data-label", etiqueta);
    return td;
  }

  function crearFila(linea) {
    const p = buscarProducto(linea.id);
    const tr = document.createElement("tr");

    /* Producto */
    const celdaProducto = crearCelda("Producto");
    const enlace = document.createElement("a");
    enlace.href = "item.html?id=" + p.id;
    enlace.textContent = p.nombre;
    celdaProducto.appendChild(enlace);
    const detalle = document.createElement("span");
    detalle.className = "producto-detalle";
    detalle.textContent = p.formato_ml + " ml · " + formatearPrecio(p.precio) + " / ud";
    celdaProducto.appendChild(detalle);
    tr.appendChild(celdaProducto);

    /* Cantidad + acciones */
    const celdaCantidad = crearCelda("Cantidad");
    const etiqueta = document.createElement("label");
    etiqueta.className = "solo-lectores";
    etiqueta.htmlFor = "cantidad-" + p.id;
    etiqueta.textContent = "Cantidad de " + p.nombre;
    celdaCantidad.appendChild(etiqueta);

    const campo = document.createElement("input");
    campo.type = "number";
    campo.id = "cantidad-" + p.id;
    campo.min = 1;
    campo.max = p.stock;
    campo.step = 1;
    campo.value = linea.qty;
    celdaCantidad.appendChild(campo);

    const acciones = document.createElement("div");
    acciones.className = "acciones-linea";

    const botonActualizar = document.createElement("button");
    botonActualizar.type = "button";
    botonActualizar.className = "boton boton-secundario";
    botonActualizar.textContent = "Actualizar";
    botonActualizar.setAttribute("aria-label", "Actualizar cantidad de " + p.nombre);
    acciones.appendChild(botonActualizar);

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "boton boton-peligro";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.setAttribute("aria-label", "Eliminar " + p.nombre + " del carrito");
    acciones.appendChild(botonEliminar);

    celdaCantidad.appendChild(acciones);
    tr.appendChild(celdaCantidad);

    /* Subtotal de la línea */
    const celdaSubtotal = crearCelda("Subtotal");
    celdaSubtotal.textContent = formatearPrecio(p.precio * linea.qty);
    tr.appendChild(celdaSubtotal);

    /* Eventos de la fila */
    function actualizar() {
      const texto = campo.value.trim();
      limpiarAvisos();
      campo.removeAttribute("aria-invalid");
      if (texto === "") {
        mostrarError(p.nombre + ": indica la cantidad que quieres comprar.", campo);
        return;
      }
      const resultado = Carrito.modificar(p.id, Number(texto));
      if (!resultado.ok) {
        mostrarError(p.nombre + ": " + resultado.mensaje, campo);   /* el valor escrito se conserva */
        return;
      }
      pintar();
      estado.textContent = "Cantidad de " + p.nombre + " actualizada.";
      document.getElementById("cantidad-" + p.id).focus();
    }

    botonActualizar.addEventListener("click", actualizar);
    campo.addEventListener("keydown", function (evento) {
      if (evento.key === "Enter") { evento.preventDefault(); actualizar(); }
    });
    campo.addEventListener("input", function () {
      campo.removeAttribute("aria-invalid");
    });

    botonEliminar.addEventListener("click", function () {
      Carrito.eliminar(p.id);
      pintar();
      estado.textContent = p.nombre + " eliminado del carrito.";
      titulo.focus();
    });

    return tr;
  }

  function pintar() {
    limpiarAvisos();
    const lineas = Carrito.obtener();

    cuerpo.textContent = "";
    if (lineas.length === 0) {
      seccionContenido.hidden = true;
      seccionVacio.hidden = false;
      return;
    }

    seccionVacio.hidden = true;
    seccionContenido.hidden = false;
    lineas.forEach(function (l) { cuerpo.appendChild(crearFila(l)); });
    total.textContent = formatearPrecio(Carrito.total());
  }

  document.getElementById("boton-vaciar").addEventListener("click", function () {
    Carrito.vaciar();
    pintar();
    estado.textContent = "Has vaciado el carrito.";
    titulo.focus();
  });

  pintar();
})();
