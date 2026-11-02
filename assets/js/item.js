/* ==========================================================
   item.js · detalle de producto (item.html?id=N)
   Necesita: datos-productos.js y comun.js cargados antes.
   ========================================================== */
(function () {
  const seccionDetalle = document.getElementById("detalle");
  const seccionNoEncontrado = document.getElementById("no-encontrado");

  const parametros = new URLSearchParams(window.location.search);
  const producto = buscarProducto(parametros.get("id"));

  /* Producto inexistente: mensaje claro y enlace al catálogo */
  if (!producto) {
    document.title = "Producto no encontrado · Oleum";
    document.getElementById("miga-producto").textContent = "No encontrado";
    seccionNoEncontrado.hidden = false;
    return;
  }

  /* Rellenar la ficha (textContent: nunca innerHTML con datos) */
  document.title = producto.nombre + " · Oleum";
  document.getElementById("miga-producto").textContent = producto.nombre;
  document.getElementById("producto-nombre").textContent = producto.nombre;
  document.getElementById("producto-productor").textContent = producto.productor;
  document.getElementById("producto-origen").textContent = producto.origen;
  document.getElementById("producto-variedad").textContent = producto.variedad;
  document.getElementById("producto-categoria").textContent = CATEGORIAS[producto.categoria] || producto.categoria;
  document.getElementById("producto-formato").textContent = producto.formato_ml + " ml";
  document.getElementById("producto-precio").textContent = formatearPrecio(producto.precio);
  document.getElementById("producto-descripcion").textContent = producto.descripcion;

  const imagen = document.getElementById("producto-imagen");
  imagen.src = producto.imagen;
  imagen.alt = "Botella de aceite " + producto.nombre + " de " + producto.formato_ml + " ml";

  const disponibilidad = document.getElementById("producto-disponibilidad");
  const campoCantidad = document.getElementById("cantidad");
  const boton = document.getElementById("boton-anadir");

  if (producto.stock > 0) {
    disponibilidad.textContent = "Disponible: " + producto.stock + " unidades en stock";
    campoCantidad.max = producto.stock;
  } else {
    disponibilidad.textContent = "Agotado";
    disponibilidad.classList.add("agotado");
    campoCantidad.disabled = true;
    boton.disabled = true;
  }

  seccionDetalle.hidden = false;

  /* Formulario: validar cantidad y añadir al carrito */
  const formulario = document.getElementById("form-cantidad");
  const error = document.getElementById("error-cantidad");
  const ok = document.getElementById("mensaje-ok");

  function mostrarError(texto) {
    error.textContent = texto;
    error.hidden = false;
    campoCantidad.setAttribute("aria-invalid", "true");
    ok.hidden = true;
  }

  function limpiarError() {
    error.hidden = true;
    error.textContent = "";
    campoCantidad.removeAttribute("aria-invalid");
  }

  campoCantidad.addEventListener("input", limpiarError);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();          /* nunca enviar el formulario al servidor */
    limpiarError();

    const texto = campoCantidad.value.trim();
    const cantidad = Number(texto);

    if (texto === "") {
      mostrarError("Indica la cantidad que quieres comprar.");
      campoCantidad.focus();
      return;
    }

    const resultado = Carrito.anadir(producto.id, cantidad);
    if (!resultado.ok) {
      mostrarError(resultado.mensaje);  /* el valor escrito se conserva */
      campoCantidad.focus();
      return;
    }

    document.getElementById("texto-ok").textContent =
      "Añadido al carrito: " + cantidad + (cantidad === 1 ? " unidad." : " unidades.");
    ok.hidden = false;
  });
})();
