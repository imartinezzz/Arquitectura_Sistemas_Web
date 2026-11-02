/* ==========================================================
   gest_pedidos.js · gestión de pedidos (gest_pedidos.html)
   Lista todos los pedidos y permite cambiar su estado siguiendo
   un flujo válido. Necesita: datos-pedidos.js, comun.js y
   validacion.js cargados antes.
   ========================================================== */
(function () {
  const sinAcceso = document.getElementById("sin-acceso");
  const areaAdmin = document.getElementById("area-admin");

  /* ---------- Control de acceso ---------- */
  if (!Sesion.esAdmin()) {
    sinAcceso.hidden = false;
    return;
  }
  areaAdmin.hidden = false;

  document.getElementById("cerrar-sesion").addEventListener("click", function () {
    Sesion.cerrar();
    window.location.href = "login.html";
  });

  /* Cambios de estado permitidos desde cada estado */
  const SIGUIENTES = {
    recibido: ["preparacion", "cancelado"],
    preparacion: ["enviado", "cancelado"],
    enviado: ["entregado"],
    entregado: [],
    cancelado: []
  };

  const lista = document.getElementById("lista-admin-pedidos");
  const resumen = document.getElementById("resumen-pedidos");
  const estado = document.getElementById("estado-admin");
  const filtro = document.getElementById("filtro-estado");

  const abiertos = {};   /* nº de pedido -> true si su detalle está desplegado */

  function crearTexto(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) { el.className = clase; }
    el.textContent = texto;
    return el;
  }

  function crearTabla(p) {
    const contenedor = document.createElement("div");
    contenedor.className = "tabla-contenedor";
    const tabla = document.createElement("table");
    tabla.className = "tabla-carrito";
    tabla.appendChild(crearTexto("caption", "solo-lectores", "Líneas del pedido " + p.numero));

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
    return contenedor;
  }

  /* Formulario de cambio de estado de un pedido */
  function crearFormularioEstado(p) {
    const siguientes = SIGUIENTES[p.estado] || [];
    if (siguientes.length === 0) {
      return crearTexto("p", "ayuda", "Estado final (" + ESTADOS_PEDIDO[p.estado] + "): ya no se puede cambiar.");
    }

    const form = document.createElement("form");
    form.className = "form-estado";
    form.method = "post";
    form.noValidate = true;

    const campo = document.createElement("div");
    campo.className = "campo";

    const idSelect = "estado-" + p.numero;
    const etiqueta = crearTexto("label", "", "Nuevo estado del pedido " + p.numero);
    etiqueta.htmlFor = idSelect;
    campo.appendChild(etiqueta);

    const select = document.createElement("select");
    select.id = idSelect;
    select.name = "estado";
    select.setAttribute("aria-describedby", "error-" + idSelect);

    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = "Elige un estado";
    select.appendChild(inicial);
    siguientes.forEach(function (clave) {
      const opcion = document.createElement("option");
      opcion.value = clave;
      opcion.textContent = ESTADOS_PEDIDO[clave];
      select.appendChild(opcion);
    });
    campo.appendChild(select);

    const error = crearTexto("p", "error", "");
    error.id = "error-" + idSelect;
    error.setAttribute("role", "alert");
    error.hidden = true;
    campo.appendChild(error);
    form.appendChild(campo);

    const boton = crearTexto("button", "boton", "Cambiar estado");
    boton.type = "submit";
    boton.setAttribute("aria-label", "Cambiar estado del pedido " + p.numero);
    form.appendChild(boton);

    select.addEventListener("change", function () { Validacion.limpiarError(select); });

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      Validacion.limpiarError(select);

      if (select.value === "") {
        Validacion.mostrarError(select, "Elige el nuevo estado del pedido.");
        select.focus();
        return;
      }
      if (siguientes.indexOf(select.value) === -1) {
        Validacion.mostrarError(select, "Ese cambio de estado no es válido.");
        select.focus();
        return;
      }
      if (!Pedidos.cambiarEstado(p.numero, select.value)) {
        Validacion.mostrarError(select, "No se ha podido guardar el cambio en este navegador.");
        return;
      }
      abiertos[p.numero] = true;
      pintar();
      estado.textContent = "El pedido " + p.numero + " ha pasado a «" + ESTADOS_PEDIDO[select.value] + "».";
      const nuevo = document.querySelector('[data-pedido="' + p.numero + '"] summary');
      if (nuevo) { nuevo.focus(); }
    });

    return form;
  }

  function crearPedido(p) {
    const li = document.createElement("li");
    const detalles = document.createElement("details");
    detalles.className = "pedido";
    detalles.setAttribute("data-pedido", p.numero);
    if (abiertos[p.numero]) { detalles.open = true; }
    detalles.addEventListener("toggle", function () { abiertos[p.numero] = detalles.open; });

    const envio = p.envio || {};
    const resumenPedido = document.createElement("summary");
    resumenPedido.appendChild(crearTexto("strong", "", p.numero));
    resumenPedido.appendChild(document.createTextNode(
      " · " + new Date(p.fecha).toLocaleDateString("es-ES") + " · " + (envio.nombre || "Cliente") + " · "));
    resumenPedido.appendChild(crearTexto("span", "estado estado-" + p.estado, ESTADOS_PEDIDO[p.estado] || p.estado));
    resumenPedido.appendChild(document.createTextNode(" · " + formatearPrecio(p.total)));
    detalles.appendChild(resumenPedido);

    const cuerpo = document.createElement("div");
    cuerpo.className = "pedido-cuerpo";
    cuerpo.appendChild(crearTexto("p", "", "Cliente: " + (envio.nombre || "") + (p.email ? " (" + p.email + ")" : " (sin cuenta)")));
    cuerpo.appendChild(crearTexto("p", "", "Envío a: " + envio.direccion + ", " + envio.cp + " " + envio.ciudad +
      " · Tel. " + envio.telefono));
    cuerpo.appendChild(crearTexto("p", "", "Pago: " + p.pago));
    cuerpo.appendChild(crearTabla(p));
    cuerpo.appendChild(crearFormularioEstado(p));
    detalles.appendChild(cuerpo);

    li.appendChild(detalles);
    return li;
  }

  function pintar() {
    const todos = Pedidos.todos().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
    const elegido = filtro.value;
    const mostrados = elegido === "" ? todos : todos.filter(function (p) { return p.estado === elegido; });

    lista.textContent = "";
    mostrados.forEach(function (p) { lista.appendChild(crearPedido(p)); });

    if (mostrados.length === 0) {
      resumen.textContent = "No hay pedidos con ese estado.";
    } else {
      resumen.textContent = "Mostrando " + mostrados.length + " de " + todos.length +
        (todos.length === 1 ? " pedido." : " pedidos.");
    }
  }

  filtro.addEventListener("change", function () {
    estado.textContent = "";
    pintar();
  });

  pintar();
})();
