/* ==========================================================
   gest_prod.js · gestión de productos (gest_prod.html)
   Alta, edición, existencias y baja lógica (nunca se borra).
   Necesita: datos-productos.js, comun.js y validacion.js antes.
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

  const estado = document.getElementById("estado-admin");
  const errorAdmin = document.getElementById("error-admin");
  const cuerpo = document.getElementById("lista-admin-productos");
  const resumen = document.getElementById("resumen-productos");
  const botonNuevo = document.getElementById("boton-nuevo");

  const panel = document.getElementById("panel-formulario");
  const tituloFormulario = document.getElementById("titulo-formulario");
  const formulario = document.getElementById("form-producto");
  const campos = {
    nombre: document.getElementById("nombre"),
    categoria: document.getElementById("categoria"),
    productor: document.getElementById("productor"),
    origen: document.getElementById("origen"),
    variedad: document.getElementById("variedad"),
    formato: document.getElementById("formato"),
    precio: document.getElementById("precio"),
    stock: document.getElementById("stock"),
    descripcion: document.getElementById("descripcion")
  };

  let editando = null;        /* producto que se está editando; null = alta nueva */
  let ultimoBoton = null;     /* botón que abrió el formulario, para devolver el foco */

  function avisar(texto) {
    errorAdmin.hidden = true;
    errorAdmin.textContent = "";
    estado.textContent = texto;
  }

  function avisarError(texto) {
    estado.textContent = "";
    errorAdmin.textContent = texto;
    errorAdmin.hidden = false;
  }

  /* ---------- Listado ---------- */
  function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
  }

  function crearFila(p) {
    const tr = document.createElement("tr");
    tr.appendChild(celda(String(p.id)));

    const celdaNombre = celda(p.nombre);
    const detalle = document.createElement("span");
    detalle.className = "producto-detalle";
    detalle.textContent = p.productor + " · " + p.origen;
    celdaNombre.appendChild(detalle);
    tr.appendChild(celdaNombre);

    tr.appendChild(celda(CATEGORIAS[p.categoria] || p.categoria));
    tr.appendChild(celda(p.formato_ml + " ml"));
    tr.appendChild(celda(formatearPrecio(p.precio)));
    tr.appendChild(celda(String(p.stock)));

    const celdaEstado = document.createElement("td");
    const etiqueta = document.createElement("span");
    const activo = p.activo !== false;
    etiqueta.className = "estado " + (activo ? "estado-entregado" : "estado-cancelado");
    etiqueta.textContent = activo ? "Activo" : "De baja";
    celdaEstado.appendChild(etiqueta);
    tr.appendChild(celdaEstado);

    const celdaAcciones = document.createElement("td");
    const acciones = document.createElement("div");
    acciones.className = "acciones-linea";

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.className = "boton boton-secundario";
    botonEditar.textContent = "Editar";
    botonEditar.setAttribute("aria-label", "Editar " + p.nombre);
    botonEditar.addEventListener("click", function () { abrirFormulario(p, botonEditar); });
    acciones.appendChild(botonEditar);

    const botonBaja = document.createElement("button");
    botonBaja.type = "button";
    botonBaja.className = activo ? "boton boton-peligro" : "boton";
    botonBaja.textContent = activo ? "Dar de baja" : "Reactivar";
    botonBaja.setAttribute("aria-label", (activo ? "Dar de baja " : "Reactivar ") + p.nombre);
    botonBaja.addEventListener("click", function () { cambiarActivo(p, !activo); });
    acciones.appendChild(botonBaja);

    celdaAcciones.appendChild(acciones);
    tr.appendChild(celdaAcciones);
    return tr;
  }

  function pintar() {
    const lista = Catalogo.todos().sort(function (a, b) { return a.id - b.id; });
    cuerpo.textContent = "";
    lista.forEach(function (p) { cuerpo.appendChild(crearFila(p)); });
    const activos = lista.filter(function (p) { return p.activo !== false; }).length;
    resumen.textContent = lista.length + " productos (" + activos + " activos, " +
      (lista.length - activos) + " de baja).";
  }

  /* ---------- Baja lógica / reactivación ---------- */
  function cambiarActivo(p, activo) {
    const actualizado = Object.assign({}, p, { activo: activo });
    if (!Catalogo.guardar(actualizado)) {
      avisarError("No se han podido guardar los cambios en este navegador.");
      return;
    }
    pintar();
    avisar(activo
      ? p.nombre + " vuelve a estar disponible en el catálogo."
      : p.nombre + " se ha dado de baja: ya no aparece en el catálogo, pero los pedidos anteriores se conservan.");
  }

  /* ---------- Formulario ---------- */
  function limpiarCampos() {
    Validacion.limpiarFormulario(formulario);
    formulario.reset();
  }

  function abrirFormulario(producto, origen) {
    ultimoBoton = origen;
    limpiarCampos();
    editando = producto;
    if (producto) {
      tituloFormulario.textContent = "Editar producto (ID " + producto.id + ")";
      campos.nombre.value = producto.nombre;
      campos.categoria.value = producto.categoria;
      campos.productor.value = producto.productor;
      campos.origen.value = producto.origen;
      campos.variedad.value = producto.variedad;
      campos.formato.value = producto.formato_ml;
      campos.precio.value = producto.precio;
      campos.stock.value = producto.stock;
      campos.descripcion.value = producto.descripcion;
    } else {
      tituloFormulario.textContent = "Nuevo producto";
    }
    avisar("");
    panel.hidden = false;
    campos.nombre.focus();
  }

  function cerrarFormulario() {
    limpiarCampos();
    editando = null;
    panel.hidden = true;
    (ultimoBoton && document.body.contains(ultimoBoton) ? ultimoBoton : botonNuevo).focus();
  }

  botonNuevo.addEventListener("click", function () { abrirFormulario(null, botonNuevo); });
  document.getElementById("boton-cancelar").addEventListener("click", cerrarFormulario);

  Validacion.activarLimpieza(formulario);

  function esEntero(n) { return Number.isInteger(n); }
  function maximo2Decimales(n) { return Math.abs(n * 100 - Math.round(n * 100)) < 1e-6; }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    Validacion.limpiarFormulario(formulario);

    let hayErrores = false;
    function fallo(campo, texto) {
      Validacion.mostrarError(campo, texto);
      hayErrores = true;
    }

    const nombre = campos.nombre.value.trim();
    if (nombre.length < 3) {
      fallo(campos.nombre, "El nombre debe tener al menos 3 caracteres.");
    } else {
      const repetido = Catalogo.todos().some(function (p) {
        return p.nombre.toLowerCase() === nombre.toLowerCase() && (!editando || p.id !== editando.id);
      });
      if (repetido) { fallo(campos.nombre, "Ya existe un producto con ese nombre."); }
    }

    if (campos.categoria.value === "" || !CATEGORIAS[campos.categoria.value]) {
      fallo(campos.categoria, "Elige una categoría.");
    }
    if (campos.productor.value.trim().length < 2) { fallo(campos.productor, "Escribe el productor."); }
    if (campos.origen.value.trim().length < 2) { fallo(campos.origen, "Escribe el origen."); }
    if (campos.variedad.value.trim().length < 2) { fallo(campos.variedad, "Escribe la variedad."); }

    const formato = campos.formato.value.trim() === "" ? NaN : Number(campos.formato.value);
    if (!esEntero(formato) || formato < 1 || formato > 10000) {
      fallo(campos.formato, "El formato debe ser un número entero de ml entre 1 y 10000.");
    }

    const precio = campos.precio.value.trim() === "" ? NaN : Number(campos.precio.value);
    if (!isFinite(precio) || precio <= 0) {
      fallo(campos.precio, "El precio debe ser un número mayor que 0.");
    } else if (precio > 9999.99 || !maximo2Decimales(precio)) {
      fallo(campos.precio, "El precio no puede pasar de 9999,99 € ni tener más de 2 decimales.");
    }

    const stock = campos.stock.value.trim() === "" ? NaN : Number(campos.stock.value);
    if (!esEntero(stock) || stock < 0) {
      fallo(campos.stock, "Las existencias deben ser un número entero igual o mayor que 0.");
    }

    if (campos.descripcion.value.trim().length < 10) {
      fallo(campos.descripcion, "Escribe una descripción de al menos 10 caracteres.");
    }

    if (hayErrores) {
      Validacion.enfocarPrimerError(formulario);   /* lo escrito se conserva */
      return;
    }

    const producto = {
      id: editando ? editando.id : Catalogo.siguienteId(),
      categoria: campos.categoria.value,
      nombre: nombre,
      productor: campos.productor.value.trim(),
      origen: campos.origen.value.trim(),
      variedad: campos.variedad.value.trim(),
      formato_ml: formato,
      precio: Math.round(precio * 100) / 100,
      stock: stock,
      imagen: editando ? editando.imagen : "assets/img/aceite.svg",
      descripcion: campos.descripcion.value.trim(),
      activo: editando ? editando.activo !== false : true
    };

    if (!Catalogo.guardar(producto)) {
      Validacion.errorGeneral("No se han podido guardar los cambios en este navegador.");
      return;
    }

    const eraNuevo = !editando;
    cerrarFormulario();
    pintar();
    avisar(eraNuevo
      ? "Producto «" + producto.nombre + "» creado correctamente."
      : "Producto «" + producto.nombre + "» actualizado correctamente.");
  });

  pintar();
})();
