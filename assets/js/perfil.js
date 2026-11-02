/* ==========================================================
   perfil.js · área del cliente (perfil.html)
   Necesita: datos-*.js, comun.js y validacion.js cargados antes.
   ========================================================== */
(function () {
  const sinSesion = document.getElementById("sin-sesion");
  const esAdmin = document.getElementById("es-admin");
  const areaCliente = document.getElementById("area-cliente");

  /* Botones "Cerrar sesión" (hay uno en cada bloque) */
  document.querySelectorAll("[data-cerrar-sesion]").forEach(function (b) {
    b.addEventListener("click", function () {
      Sesion.cerrar();
      window.location.href = "login.html";
    });
  });

  /* ---------- Control de acceso ---------- */
  const sesion = Sesion.actual();
  if (!sesion) {
    sinSesion.hidden = false;
    return;
  }
  if (sesion.rol === "admin") {
    esAdmin.hidden = false;
    return;
  }
  const perfil = Usuarios.perfilDe(sesion.email);
  if (!perfil) {                       /* sesión de un usuario que ya no existe */
    Sesion.cerrar();
    sinSesion.hidden = false;
    return;
  }
  areaCliente.hidden = false;

  /* ---------- Datos personales ---------- */
  const formulario = document.getElementById("form-perfil");
  const campoNombre = document.getElementById("nombre");
  const campoDireccion = document.getElementById("direccion");
  const mensajeOk = document.getElementById("mensaje-ok");
  const bienvenida = document.getElementById("bienvenida");

  function rellenar(p) {
    campoNombre.value = p.nombre;
    document.getElementById("email").value = p.email;
    campoDireccion.value = p.direccion || "";
    bienvenida.textContent = "Hola, " + p.nombre + ".";
  }
  rellenar(perfil);

  Validacion.activarLimpieza(formulario);
  formulario.addEventListener("input", function () { mensajeOk.hidden = true; });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    Validacion.limpiarFormulario(formulario);
    mensajeOk.hidden = true;

    let hayErrores = false;
    if (campoNombre.value.trim().split(/\s+/).filter(Boolean).length < 2) {
      Validacion.mostrarError(campoNombre, "Escribe tu nombre y apellidos.");
      hayErrores = true;
    }
    const direccion = campoDireccion.value.trim();
    if (direccion !== "" && direccion.length < 5) {
      Validacion.mostrarError(campoDireccion, "La dirección es demasiado corta (calle, número y piso).");
      hayErrores = true;
    }
    if (hayErrores) {
      Validacion.enfocarPrimerError(formulario);   /* lo escrito se conserva */
      return;
    }

    const nombre = campoNombre.value.trim();
    if (!Usuarios.guardarPerfil(perfil.email, { nombre: nombre, direccion: direccion })) {
      Validacion.errorGeneral("No se han podido guardar los cambios en este navegador.");
      return;
    }
    Sesion.actualizarNombre(nombre);
    rellenar({ nombre: nombre, email: perfil.email, direccion: direccion });
    mensajeOk.textContent = "Datos guardados correctamente.";
    mensajeOk.hidden = false;
  });

  /* ---------- Historial de pedidos (solo los del usuario de la sesión) ---------- */
  const lista = document.getElementById("lista-pedidos");
  const sinPedidos = document.getElementById("sin-pedidos");

  function crearTexto(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) { el.className = clase; }
    el.textContent = texto;
    return el;
  }

  function crearPedido(p) {
    const li = document.createElement("li");
    const detalles = document.createElement("details");
    detalles.className = "pedido";

    const resumen = document.createElement("summary");
    resumen.appendChild(crearTexto("strong", "", p.numero));
    resumen.appendChild(document.createTextNode(
      " · " + new Date(p.fecha).toLocaleDateString("es-ES") + " · "));
    resumen.appendChild(crearTexto("span", "estado estado-" + p.estado, ESTADOS_PEDIDO[p.estado] || p.estado));
    resumen.appendChild(document.createTextNode(" · " + formatearPrecio(p.total)));
    detalles.appendChild(resumen);

    const cuerpo = document.createElement("div");
    cuerpo.className = "pedido-cuerpo";

    const envio = p.envio || {};
    cuerpo.appendChild(crearTexto("p", "", "Envío a: " + envio.nombre + ", " + envio.direccion + ", " +
      envio.cp + " " + envio.ciudad));
    cuerpo.appendChild(crearTexto("p", "", "Pago: " + p.pago));

    const contenedor = document.createElement("div");
    contenedor.className = "tabla-contenedor";
    const tabla = document.createElement("table");
    tabla.className = "tabla-carrito";

    const caption = crearTexto("caption", "solo-lectores", "Líneas del pedido " + p.numero);
    tabla.appendChild(caption);

    const cabecera = document.createElement("thead");
    const filaCab = document.createElement("tr");
    ["Producto", "Cantidad", "Precio ud.", "Subtotal"].forEach(function (t) {
      const th = crearTexto("th", "", t);
      th.scope = "col";
      filaCab.appendChild(th);
    });
    cabecera.appendChild(filaCab);
    tabla.appendChild(cabecera);

    const tbody = document.createElement("tbody");
    p.lineas.forEach(function (l) {
      const tr = document.createElement("tr");
      tr.appendChild(crearTexto("td", "", l.nombre));
      tr.appendChild(crearTexto("td", "", String(l.cantidad)));
      tr.appendChild(crearTexto("td", "", formatearPrecio(l.precio_unitario)));
      tr.appendChild(crearTexto("td", "", formatearPrecio(l.precio_unitario * l.cantidad)));
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);

    const pie = document.createElement("tfoot");
    const filaPie = document.createElement("tr");
    const thTotal = crearTexto("th", "", "Total");
    thTotal.scope = "row";
    thTotal.colSpan = 3;
    filaPie.appendChild(thTotal);
    filaPie.appendChild(crearTexto("td", "", formatearPrecio(p.total)));
    pie.appendChild(filaPie);
    tabla.appendChild(pie);

    contenedor.appendChild(tabla);
    cuerpo.appendChild(contenedor);
    detalles.appendChild(cuerpo);
    li.appendChild(detalles);
    return li;
  }

  const pedidos = Pedidos.deUsuario(perfil.email);
  if (pedidos.length === 0) {
    sinPedidos.hidden = false;
  } else {
    pedidos.forEach(function (p) { lista.appendChild(crearPedido(p)); });
  }
})();
