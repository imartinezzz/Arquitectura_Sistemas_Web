/* ==========================================================
   comun.js · funciones compartidas por todas las páginas.
   Carrito simulado con localStorage (clave "oleum_cart"),
   formato: [{ id: 1, qty: 2 }, ...]
   ========================================================== */
const CLAVE_CARRITO = "oleum_cart";

/* Busca un producto por id (null si no existe). */
function buscarProducto(id) {
  return Catalogo.visibles().find(function (p) { return p.id === Number(id); }) || null;
}

/* 12,5 -> "12,50 €" */
function formatearPrecio(numero) {
  return Number(numero).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

const Carrito = {
  obtener: function () {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
      return Array.isArray(datos) ? datos : [];
    } catch (e) {
      return [];
    }
  },

  guardar: function (lineas) {
    try {
      localStorage.setItem(CLAVE_CARRITO, JSON.stringify(lineas));
    } catch (e) { /* sin almacenamiento: el carrito no se conserva */ }
    actualizarContador();
  },

  cantidadDe: function (id) {
    const linea = this.obtener().find(function (l) { return l.id === Number(id); });
    return linea ? linea.qty : 0;
  },

  /* Nº total de unidades (para el contador de la cabecera). */
  contar: function () {
    return this.obtener().reduce(function (suma, l) { return suma + l.qty; }, 0);
  },

  /* Suma de precio x cantidad de todas las líneas. */
  total: function () {
    return this.obtener().reduce(function (suma, l) {
      const p = buscarProducto(l.id);
      return suma + (p ? p.precio * l.qty : 0);
    }, 0);
  },

  /* Valida una cantidad para un producto. Devuelve un texto de error o "" si es válida. */
  validar: function (id, cantidad, sumarAlCarrito) {
    const p = buscarProducto(id);
    if (!p) { return "El producto no existe."; }
    if (!Number.isInteger(cantidad)) { return "Introduce una cantidad entera."; }
    if (cantidad < 1) { return "La cantidad mínima es 1."; }
    if (p.stock < 1) { return "Este producto está agotado."; }
    const yaEnCarrito = sumarAlCarrito ? this.cantidadDe(id) : 0;
    if (yaEnCarrito + cantidad > p.stock) {
      if (yaEnCarrito > 0) {
        return "Solo quedan " + p.stock + " unidades y ya tienes " + yaEnCarrito + " en el carrito.";
      }
      return "Solo quedan " + p.stock + " unidades disponibles.";
    }
    return "";
  },

  /* Añade unidades. Devuelve { ok: true } o { ok: false, mensaje: "..." } */
  anadir: function (id, cantidad) {
    const error = this.validar(id, cantidad, true);
    if (error) { return { ok: false, mensaje: error }; }
    const lineas = this.obtener();
    const linea = lineas.find(function (l) { return l.id === Number(id); });
    if (linea) { linea.qty += cantidad; } else { lineas.push({ id: Number(id), qty: cantidad }); }
    this.guardar(lineas);
    return { ok: true };
  },

  /* Cambia la cantidad de una línea (para cart.html). */
  modificar: function (id, cantidad) {
    const error = this.validar(id, cantidad, false);
    if (error) { return { ok: false, mensaje: error }; }
    const lineas = this.obtener();
    const linea = lineas.find(function (l) { return l.id === Number(id); });
    if (!linea) { return { ok: false, mensaje: "El producto no está en el carrito." }; }
    linea.qty = cantidad;
    this.guardar(lineas);
    return { ok: true };
  },

  eliminar: function (id) {
    this.guardar(this.obtener().filter(function (l) { return l.id !== Number(id); }));
  },

  vaciar: function () {
    this.guardar([]);
  }
};

/* Pone el nº de unidades en el "Carrito (n)" de la cabecera. */
function actualizarContador() {
  const contador = document.getElementById("contador-carrito");
  if (contador) { contador.textContent = Carrito.contar(); }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", actualizarContador);
} else {
  actualizarContador();
}

/* ==========================================================
   Pedidos confirmados (simulados) en localStorage ("oleum_pedidos").
   Cada pedido guarda el precio aplicado en cada línea (histórico).
   ========================================================== */
const CLAVE_PEDIDOS = "oleum_pedidos";

const Pedidos = {
  obtener: function () {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE_PEDIDOS));
      return Array.isArray(datos) ? datos : [];
    } catch (e) {
      return [];
    }
  },

  guardar: function (lista) {
    try {
      localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(lista));
    } catch (e) { /* sin almacenamiento: no se conserva */ }
  },

  siguienteNumero: function () {
    return "OL-" + (2001 + this.obtener().length);
  },

  anadir: function (pedido) {
    const lista = this.obtener();
    lista.push(pedido);
    this.guardar(lista);
  }
};

/* ==========================================================
   Usuarios y sesión simulada.
   "oleum_usuarios": usuarios registrados en el navegador.
   "oleum_session": { nombre, email, rol } del usuario conectado.
   ========================================================== */
const CLAVE_USUARIOS = "oleum_usuarios";
const CLAVE_SESION = "oleum_session";

/* Hash SIMULADO (no es seguro): solo evita guardar la contraseña en claro. */
function hashClave(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) { h = ((h << 5) + h + texto.charCodeAt(i)) | 0; }
  return "h" + (h >>> 0).toString(16);
}

const Usuarios = {
  registrados: function () {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE_USUARIOS));
      return Array.isArray(datos) ? datos : [];
    } catch (e) {
      return [];
    }
  },

  /* Usuarios de ejemplo + registrados */
  todos: function () {
    const base = (typeof USUARIOS !== "undefined") ? USUARIOS : [];
    return base.concat(this.registrados());
  },

  buscarPorEmail: function (email) {
    const buscado = String(email).trim().toLowerCase();
    return this.todos().find(function (u) { return u.email.toLowerCase() === buscado; }) || null;
  },

  anadir: function (usuario) {
    const lista = this.registrados();
    usuario.id = 100 + lista.length + 1;
    lista.push(usuario);
    try { localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista)); } catch (e) { /* sin almacenamiento */ }
    return usuario;
  }
};

const Sesion = {
  actual: function () {
    try { return JSON.parse(localStorage.getItem(CLAVE_SESION)); } catch (e) { return null; }
  },
  iniciar: function (usuario) {
    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }));
    } catch (e) { /* sin almacenamiento */ }
  },
  cerrar: function () {
    try { localStorage.removeItem(CLAVE_SESION); } catch (e) { /* sin almacenamiento */ }
  }
};

/* ==========================================================
   Pedidos: estados, listado completo y perfil editable.
   "oleum_estados": { "OL-1001": "enviado" } cambios de estado (admin).
   "oleum_perfiles": { "correo": { nombre, direccion } } ediciones de perfil.
   ========================================================== */
const ESTADOS_PEDIDO = {
  recibido: "Recibido",
  preparacion: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado"
};

function leerJSON(clave, porDefecto) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave));
    return (datos && typeof datos === "object") ? datos : porDefecto;
  } catch (e) {
    return porDefecto;
  }
}

/* Pedidos de ejemplo + confirmados en este navegador, con los estados cambiados por el admin */
Pedidos.todos = function () {
  const ejemplo = (typeof PEDIDOS_EJEMPLO !== "undefined") ? PEDIDOS_EJEMPLO : [];
  const estados = leerJSON("oleum_estados", {});
  return ejemplo.concat(this.obtener()).map(function (p) {
    return Object.assign({}, p, { estado: estados[p.numero] || p.estado });
  });
};

Pedidos.deUsuario = function (email) {
  const buscado = String(email).toLowerCase();
  return this.todos().filter(function (p) { return (p.email || "").toLowerCase() === buscado; })
    .sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
};

Pedidos.cambiarEstado = function (numero, estado) {
  if (!ESTADOS_PEDIDO[estado]) { return false; }
  const estados = leerJSON("oleum_estados", {});
  estados[numero] = estado;
  try { localStorage.setItem("oleum_estados", JSON.stringify(estados)); } catch (e) { return false; }
  return true;
};

/* Datos del usuario con las ediciones de perfil aplicadas */
Usuarios.perfilDe = function (email) {
  const base = this.buscarPorEmail(email);
  if (!base) { return null; }
  const ediciones = leerJSON("oleum_perfiles", {})[base.email.toLowerCase()] || {};
  return Object.assign({}, base, ediciones);
};

Usuarios.guardarPerfil = function (email, datos) {
  const perfiles = leerJSON("oleum_perfiles", {});
  perfiles[String(email).toLowerCase()] = { nombre: datos.nombre, direccion: datos.direccion };
  try { localStorage.setItem("oleum_perfiles", JSON.stringify(perfiles)); } catch (e) { return false; }
  return true;
};

Sesion.actualizarNombre = function (nombre) {
  const s = this.actual();
  if (!s) { return; }
  s.nombre = nombre;
  try { localStorage.setItem(CLAVE_SESION, JSON.stringify(s)); } catch (e) { /* sin almacenamiento */ }
};

/* ==========================================================
   Catálogo editable por el administrador.
   "oleum_productos": { "id": { ...producto completo... } }
   Se combina con PRODUCTOS (datos-productos.js). Un producto con
   activo:false está "dado de baja" (baja lógica): no se vende,
   pero sigue existiendo y los pedidos antiguos no se rompen.
   ========================================================== */
const CLAVE_PRODUCTOS = "oleum_productos";

const Catalogo = {
  cambios: function () {
    return leerJSON(CLAVE_PRODUCTOS, {});
  },

  /* Todos los productos, también los dados de baja (para administración) */
  todos: function () {
    const base = (typeof PRODUCTOS !== "undefined") ? PRODUCTOS : [];
    const cambios = this.cambios();
    const lista = base.map(function (p) {
      return Object.assign({ activo: true }, p, cambios[p.id] || {});
    });
    Object.keys(cambios).forEach(function (clave) {
      if (!base.some(function (p) { return String(p.id) === clave; })) {
        lista.push(Object.assign({ activo: true }, cambios[clave]));
      }
    });
    return lista;
  },

  /* Solo los que se pueden ver y comprar */
  visibles: function () {
    return this.todos().filter(function (p) { return p.activo !== false; });
  },

  siguienteId: function () {
    return this.todos().reduce(function (max, p) { return Math.max(max, p.id); }, 0) + 1;
  },

  guardar: function (producto) {
    const cambios = this.cambios();
    cambios[producto.id] = producto;
    try {
      localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(cambios));
    } catch (e) {
      return false;
    }
    return true;
  }
};

Sesion.esAdmin = function () {
  const s = this.actual();
  return !!s && s.rol === "admin";
};
