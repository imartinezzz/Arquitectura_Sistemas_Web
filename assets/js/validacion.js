/* ==========================================================
   validacion.js · utilidades de validación de formularios.
   Convención: el mensaje de error de un campo con id="email"
   está en un elemento con id="error-email". En grupos de radio
   se usa el name: name="pago" -> id="error-pago".
   El error general del formulario está en id="error-formulario".
   ========================================================== */
const Validacion = (function () {

  function idError(campo) {
    return "error-" + (campo.type === "radio" ? campo.name : campo.id);
  }

  function controles(campo) {
    return campo.type === "radio" ? Array.from(document.getElementsByName(campo.name)) : [campo];
  }

  function mostrarError(campo, texto) {
    controles(campo).forEach(function (c) { c.setAttribute("aria-invalid", "true"); });
    const error = document.getElementById(idError(campo));
    if (error) {
      error.textContent = texto;
      error.hidden = false;
    }
  }

  function limpiarError(campo) {
    controles(campo).forEach(function (c) { c.removeAttribute("aria-invalid"); });
    const error = document.getElementById(idError(campo));
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  }

  function errorGeneral(texto) {
    const error = document.getElementById("error-formulario");
    if (error) {
      error.textContent = texto;
      error.hidden = false;
    }
  }

  function limpiarFormulario(formulario) {
    formulario.querySelectorAll("input, select, textarea").forEach(limpiarError);
    const general = document.getElementById("error-formulario");
    if (general) {
      general.textContent = "";
      general.hidden = true;
    }
  }

  /* Al escribir o cambiar un campo, se borra su error */
  function activarLimpieza(formulario) {
    function alCambiar(evento) {
      if (evento.target.matches("input, select, textarea")) { limpiarError(evento.target); }
    }
    formulario.addEventListener("input", alCambiar);
    formulario.addEventListener("change", alCambiar);
  }

  /* Lleva el foco al primer campo con error */
  function enfocarPrimerError(formulario) {
    const primero = formulario.querySelector('[aria-invalid="true"]');
    if (primero) { primero.focus(); }
  }

  return {
    mostrarError: mostrarError,
    limpiarError: limpiarError,
    errorGeneral: errorGeneral,
    limpiarFormulario: limpiarFormulario,
    activarLimpieza: activarLimpieza,
    enfocarPrimerError: enfocarPrimerError,

    esEmail: function (texto) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto); },
    esCodigoPostal: function (texto) { return /^\d{5}$/.test(texto); },
    esTelefono: function (texto) { return /^\d{9}$/.test(texto.replace(/\s/g, "")); }
  };
})();
