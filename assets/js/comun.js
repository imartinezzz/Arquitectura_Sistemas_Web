/* ==========================================================
   comun.js · funciones compartidas por todas las páginas.
   Carrito simulado con localStorage (clave "oleum_cart"),
   formato: [{ id: 1, qty: 2 }, ...]
   ========================================================== */
const CLAVE_CARRITO = "oleum_cart";

/* Busca un producto por id (null si no existe). */
function buscarProducto(id) {
  if (typeof PRODUCTOS === "undefined") { return null; }
  return PRODUCTOS.find(function (p) { return p.id === Number(id); }) || null;
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
