/* ==========================================================
   login.js · inicio de sesión simulado (login.html)
   Necesita: datos-usuarios.js, comun.js y validacion.js antes.
   ========================================================== */
(function () {
  const formulario = document.getElementById("form-login");
  const email = document.getElementById("email");
  const clave = document.getElementById("clave");

  Validacion.activarLimpieza(formulario);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    Validacion.limpiarFormulario(formulario);

    let hayErrores = false;
    if (email.value.trim() === "") {
      Validacion.mostrarError(email, "Escribe tu correo electrónico.");
      hayErrores = true;
    } else if (!Validacion.esEmail(email.value.trim())) {
      Validacion.mostrarError(email, "El correo no tiene un formato válido (ejemplo: nombre@correo.es).");
      hayErrores = true;
    }
    if (clave.value === "") {
      Validacion.mostrarError(clave, "Escribe tu contraseña.");
      hayErrores = true;
    }
    if (hayErrores) {
      Validacion.enfocarPrimerError(formulario);
      return;
    }

    const usuario = Usuarios.buscarPorEmail(email.value);
    if (!usuario || !usuario.activo || usuario.clave_hash !== hashClave(clave.value)) {
      /* Mensaje genérico: no revela si el correo existe */
      Validacion.errorGeneral("Correo o contraseña incorrectos.");
      clave.value = "";
      clave.focus();
      return;
    }

    Sesion.iniciar(usuario);
    window.location.href = usuario.rol === "admin" ? "gest_prod.html" : "perfil.html";
  });
})();
