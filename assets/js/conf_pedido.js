/* ==========================================================
   conf_pedido.js · confirmación de pedido (conf_pedido.html)
   Necesita: datos-productos.js, comun.js y validacion.js antes.
   ========================================================== */
(function () {
  const seccionVacio = document.getElementById("pedido-vacio");
  const bloqueFormulario = document.getElementById("pedido-formulario");
  const seccionConfirmado = document.getElementById("pedido-confirmado");
  const formulario = document.getElementById("form-pedido");

  /* Líneas del carrito con los datos del catálogo: { id, nombre, cantidad, precio } */
  function lineasDelCarrito() {
    return Carrito.obtener().map(function (l) {
      const p = buscarProducto(l.id);
      return p ? { id: p.id, nombre: p.nombre, cantidad: l.qty, precio: p.precio } : null;
    }).filter(function (l) { return l !== null; });
  }

  function redondear(numero) {
    return Math.round(numero * 100) / 100;
  }

  /* Rellena un <tbody> con filas "Producto × n" y subtotal */
  function pintarLineas(cuerpo, lineas) {
    cuerpo.textContent = "";
    lineas.forEach(function (l) {
      const tr = document.createElement("tr");

      const celdaProducto = document.createElement("td");
      celdaProducto.textContent = l.nombre + " × " + l.cantidad;
      const detalle = document.createElement("span");
      detalle.className = "producto-detalle";
      detalle.textContent = formatearPrecio(l.precio) + " / ud";
      celdaProducto.appendChild(detalle);
      tr.appendChild(celdaProducto);

      const celdaSubtotal = document.createElement("td");
      celdaSubtotal.textContent = formatearPrecio(l.precio * l.cantidad);
      tr.appendChild(celdaSubtotal);

      cuerpo.appendChild(tr);
    });
  }

  function totalDe(lineas) {
    return redondear(lineas.reduce(function (suma, l) { return suma + l.precio * l.cantidad; }, 0));
  }

  /* ---------- Estado inicial: carrito vacío o formulario ---------- */
  const lineas = lineasDelCarrito();
  if (lineas.length === 0) {
    seccionVacio.hidden = false;
    return;
  }
  bloqueFormulario.hidden = false;
  pintarLineas(document.getElementById("resumen-lineas"), lineas);
  document.getElementById("resumen-total").textContent = formatearPrecio(totalDe(lineas));

  Validacion.activarLimpieza(formulario);

  /* ---------- Envío del formulario ---------- */
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();                 /* nunca enviar al servidor */
    Validacion.limpiarFormulario(formulario);

    const nombre = document.getElementById("nombre");
    const direccion = document.getElementById("direccion");
    const cp = document.getElementById("cp");
    const ciudad = document.getElementById("ciudad");
    const telefono = document.getElementById("telefono");
    const pago = formulario.querySelector('input[name="pago"]:checked');

    let hayErrores = false;
    function fallo(campo, texto) {
      Validacion.mostrarError(campo, texto);
      hayErrores = true;
    }

    const palabras = nombre.value.trim().split(/\s+/).filter(Boolean);
    if (palabras.length < 2) { fallo(nombre, "Escribe tu nombre y apellidos."); }
    if (direccion.value.trim().length < 5) { fallo(direccion, "Escribe una dirección completa (calle y número)."); }
    if (!Validacion.esCodigoPostal(cp.value.trim())) { fallo(cp, "El código postal debe tener 5 dígitos."); }
    if (ciudad.value.trim().length < 2) { fallo(ciudad, "Escribe la ciudad."); }
    if (!Validacion.esTelefono(telefono.value.trim())) { fallo(telefono, "El teléfono debe tener 9 dígitos."); }
    if (!pago) { fallo(document.getElementById("pago-tarjeta"), "Elige un método de pago."); }

    if (hayErrores) {
      Validacion.enfocarPrimerError(formulario);   /* los datos escritos se conservan */
      return;
    }

    /* Comprobar otra vez el stock antes de cerrar el pedido */
    const actuales = lineasDelCarrito();
    for (let i = 0; i < actuales.length; i++) {
      const error = Carrito.validar(actuales[i].id, actuales[i].cantidad, false);
      if (error) {
        Validacion.errorGeneral(actuales[i].nombre + ": " + error + " Revisa tu carrito.");
        return;
      }
    }

    /* Crear el pedido guardando el precio aplicado en cada línea */
    const pedido = {
      numero: Pedidos.siguienteNumero(),
      fecha: new Date().toISOString(),
      estado: "recibido",
      envio: {
        nombre: nombre.value.trim(),
        direccion: direccion.value.trim(),
        cp: cp.value.trim(),
        ciudad: ciudad.value.trim(),
        telefono: telefono.value.trim()
      },
      pago: pago.value,
      lineas: actuales.map(function (l) {
        return { id: l.id, nombre: l.nombre, cantidad: l.cantidad, precio_unitario: l.precio };
      }),
      total: totalDe(actuales)
    };
    Pedidos.anadir(pedido);
    Carrito.vaciar();

    /* Mostrar la confirmación */
    bloqueFormulario.hidden = true;
    document.getElementById("conf-numero").textContent = pedido.numero;
    document.getElementById("conf-fecha").textContent = new Date(pedido.fecha).toLocaleString("es-ES");
    document.getElementById("conf-envio").textContent =
      pedido.envio.nombre + ", " + pedido.envio.direccion + ", " + pedido.envio.cp + " " + pedido.envio.ciudad;
    document.getElementById("conf-pago").textContent = pedido.pago;
    pintarLineas(document.getElementById("conf-lineas"), actuales);
    document.getElementById("conf-total").textContent = formatearPrecio(pedido.total);
    seccionConfirmado.hidden = false;
    document.getElementById("titulo-confirmado").focus();
  });
})();
