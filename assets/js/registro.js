/* ==========================================================
   registro.js · alta de usuario simulada (register.html)
   Necesita: datos-usuarios.js, comun.js y validacion.js antes.
   ========================================================== */
(function () {
  const formulario = document.getElementById("form-registro");
  const nombre = document.getElementById("nombre");
  const email = document.getElementById("email");
  const clave = document.getElementById("clave");
  const clave2 = document.getElementById("clave2");

  Validacion.activarLimpieza(formulario);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    Validacion.limpiarFormulario(formulario);

    let hayErrores = false;
    function fallo(campo, texto) {
      Validacion.mostrarError(campo, texto);
      hayErrores = true;
    }

    if (nombre.value.trim().split(/\s+/).filter(Boolean).length < 2) {
      fallo(nombre, "Escribe tu nombre y apellidos.");
    }
    if (email.value.trim() === "") {
      fallo(email, "Escribe tu correo electrónico.");
    } else if (!Validacion.esEmail(email.value.trim())) {
      fallo(email, "El correo no tiene un formato válido (ejemplo: nombre@correo.es).");
    }
    if (clave.value.length < 6) {
      fallo(clave, "La contraseña debe tener al menos 6 caracteres.");
    }
    if (clave2.value === "") {
      fallo(clave2, "Repite la contraseña.");
    } else if (clave2.value !== clave.value) {
      fallo(clave2, "Las contraseñas no coinciden.");
    }

    if (hayErrores) {
      Validacion.enfocarPrimerError(formulario);   /* nombre y correo se conservan */
      return;
    }

    if (Usuarios.buscarPorEmail(email.value)) {
      Validacion.mostrarError(email, "Ya existe una cuenta con ese correo.");
      email.focus();
      return;
    }

    Usuarios.anadir({
      nombre: nombre.value.trim(),
      email: email.value.trim().toLowerCase(),
      clave_hash: hashClave(clave.value),
      rol: "cliente",
      activo: true,
      direccion: ""
    });
    window.location.href = "login.html";   /* alta válida -> login */
  });
})();
