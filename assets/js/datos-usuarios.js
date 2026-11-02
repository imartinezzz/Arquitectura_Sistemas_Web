/* ==========================================================
   Usuarios de ejemplo (Parte 1, solo pruebas).
   Campos pensados para la tabla "usuario" de la Parte 2.
   La contraseña NO se guarda en claro: se guarda un hash
   simulado (en la Parte 2 será un hash adaptativo con sal).
   Credenciales de prueba:
     cliente@oleum.es / cliente123
     admin@oleum.es   / admin123
   ========================================================== */
const USUARIOS = [
  { id: 1, nombre: "Lucía Fernández Gil", email: "cliente@oleum.es", clave_hash: "h3900bcdf", rol: "cliente", activo: true, direccion: "Calle Mayor 12, 3A, 28013 Madrid" },
  { id: 2, nombre: "Administrador Oleum", email: "admin@oleum.es", clave_hash: "h185030e4", rol: "admin", activo: true, direccion: "" }
];
