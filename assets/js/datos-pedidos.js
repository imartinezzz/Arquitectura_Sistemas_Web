/* ==========================================================
   Pedidos de ejemplo (Parte 1, datos simulados).
   Cada línea guarda el precio aplicado en su día (precio_unitario),
   que puede ser distinto del precio actual del catálogo.
   Campos pensados para las tablas "pedido" y "linea_pedido".
   ========================================================== */
const PEDIDOS_EJEMPLO = [
  {
    numero: "OL-1001", email: "cliente@oleum.es", fecha: "2026-09-14T10:32:00", estado: "entregado",
    envio: { nombre: "Lucía Fernández Gil", direccion: "Calle Mayor 12, 3A", cp: "28013", ciudad: "Madrid", telefono: "612345678" },
    pago: "Tarjeta (simulado)",
    lineas: [
      { id: 1, nombre: "Picual Sierra Sur", cantidad: 2, precio_unitario: 8.50 },
      { id: 2, nombre: "Arbequina Dulce", cantidad: 1, precio_unitario: 9.50 }
    ],
    total: 26.50
  },
  {
    numero: "OL-1002", email: "cliente@oleum.es", fecha: "2026-10-12T18:05:00", estado: "enviado",
    envio: { nombre: "Lucía Fernández Gil", direccion: "Calle Mayor 12, 3A", cp: "28013", ciudad: "Madrid", telefono: "612345678" },
    pago: "Transferencia (simulado)",
    lineas: [
      { id: 3, nombre: "Hojiblanca Reserva", cantidad: 1, precio_unitario: 12.90 },
      { id: 5, nombre: "Picual Ecológico", cantidad: 2, precio_unitario: 11.50 }
    ],
    total: 35.90
  },
  {
    numero: "OL-1003", email: "cliente@oleum.es", fecha: "2026-10-30T09:14:00", estado: "preparacion",
    envio: { nombre: "Lucía Fernández Gil", direccion: "Calle Mayor 12, 3A", cp: "28013", ciudad: "Madrid", telefono: "612345678" },
    pago: "Tarjeta (simulado)",
    lineas: [
      { id: 10, nombre: "Arbequina Temprano", cantidad: 1, precio_unitario: 8.50 },
      { id: 12, nombre: "Royal Temprano", cantidad: 1, precio_unitario: 18.50 }
    ],
    total: 27.00
  },
  {
    numero: "OL-1004", email: "maria@correo.es", fecha: "2026-11-01T20:41:00", estado: "recibido",
    envio: { nombre: "María Sánchez Ruiz", direccion: "Avenida del Olivar 45", cp: "23001", ciudad: "Jaén", telefono: "698112233" },
    pago: "Tarjeta (simulado)",
    lineas: [
      { id: 8, nombre: "Hojiblanca Ecológico (garrafa)", cantidad: 1, precio_unitario: 49.90 }
    ],
    total: 49.90
  },
  {
    numero: "OL-1005", email: "javier@correo.es", fecha: "2026-10-20T12:00:00", estado: "cancelado",
    envio: { nombre: "Javier Torres Peña", direccion: "Calle Real 8", cp: "45001", ciudad: "Toledo", telefono: "655443322" },
    pago: "Transferencia (simulado)",
    lineas: [
      { id: 6, nombre: "Arbequina Ecológico", cantidad: 3, precio_unitario: 6.80 }
    ],
    total: 20.40
  }
];
