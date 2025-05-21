import { enDict } from "../scripts/dict";
import { itDict } from "../scripts/dict";
import { esDict } from "../scripts/dict";

// Set language
const url = window.location.href;
let lang = "es";
lang = url.includes("en/") ? "en" : lang;
lang = url.includes("it/") ? "it" : lang;
document.documentElement.lang = lang;

// Set dictionary
let dict = {};
switch (lang) {
    case "en":
        dict = enDict;
        break;
    case "it":
        dict = itDict;
        break;
    case "es":
    default:
        dict = esDict;
        break;
}
        document.addEventListener("DOMContentLoaded", () => {

            // Add 'loaded' class to body to trigger its fade-in animation
            document.body.classList.add("loaded");

            const sections = document.querySelectorAll(".c-section");
            const observerOptions = {
                root: null,
                rootMargin: "0px",
                threshold: 0.01,
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const target = entry.target;
                    if (entry.isIntersecting) {
                        target.classList.add("is-visible");
                        target.classList.add("has-been-visible"); // Mark that it has been made visible
                        target.classList.remove("is-hidden-up");
                    } else {
                        // Not intersecting
                        target.classList.remove("is-visible");
                        // If not intersecting, it should fade out.
                        // Its transform is maintained by .has-been-visible unless it's hidden-up.
                        if (entry.boundingClientRect.bottom < 0) {
                            target.classList.add("is-hidden-up");
                        } else {
                            // Element is below, or partially visible but not enough for threshold. Not hidden-up.
                            target.classList.remove("is-hidden-up");
                        }
                    }
                });
            }, observerOptions);

            sections.forEach((section) => {
                observer.observe(section);
            });

            const nombreInput = document.getElementById(
                "nombre",
            );
            const emailInput = document.getElementById("email");
            const telefonoInput = document.getElementById(
                "telefono",
            );
            const mensajeInput = document.getElementById(
                "mensaje",
            );
            const charCount = document.querySelector(
                ".c-char__counter",
            );

            nombreInput?.addEventListener("input", (e) => {
                let target = e.target;
                let value = target.value;
                value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                target.value = value;
            });

            telefonoInput?.addEventListener("input", (e) => {
                let target = e.target;
                let value = target.value;
                value = value.replace(/[^0-9]/g, "");
                target.value = value;
            });

            mensajeInput?.addEventListener("input", () => {
                if (charCount) {
                    charCount.textContent = `${mensajeInput.value.length.toString()}/500`;
                }
            });

            // Validation
            const runValidations = () => {
                let isValid = true;

                const nombreHelper = document.getElementById("nombre")?.nextElementSibling;
                const emailHelper = document.getElementById("email")?.nextElementSibling;
                const telefonoHelper = document.getElementById("telefono")?.nextElementSibling;
                const mensajeHelper = document.getElementById("mensaje")?.nextElementSibling?.children[0];

                // Reset previous invalid states
                nombreInput?.classList.remove("is-invalid");
                emailInput?.classList.remove("is-invalid");
                telefonoInput?.classList.remove("is-invalid");
                mensajeInput?.classList.remove("is-invalid");
                if (nombreHelper) nombreHelper.innerHTML = "";
                if (emailHelper) emailHelper.innerHTML = "";
                if (telefonoHelper) telefonoHelper.innerHTML = "";
                if (mensajeHelper) mensajeHelper.innerHTML = "";

                const data = {
                    nombre: nombreInput?.value,
                    email: emailInput?.value,
                    telefono: telefonoInput?.value,
                    mensaje: mensajeInput?.value,
                };

                if (!data.nombre) {
                    nombreInput?.classList.add("is-invalid");
                    if (nombreHelper) nombreHelper.innerHTML = dict.campoObligatorio;
                    isValid = false;
                }

                if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                    emailInput?.classList.add("is-invalid");
                    if (emailHelper) emailHelper.innerHTML = dict.emailFormato;
                    isValid = false;
                }

                if (!data.telefono) {
                    telefonoInput?.classList.add("is-invalid");
                    if (telefonoHelper) telefonoHelper.innerHTML = dict.campoObligatorio;
                    isValid = false;
                }

                if (!data.mensaje) {
                    mensajeInput?.classList.add("is-invalid");
                    if (mensajeHelper) mensajeHelper.innerHTML = dict.campoObligatorio;
                    isValid = false;
                }

                if (!isValid) {
                    console.log("Form validation failed");
                    return false; // Indicate validation failure
                }
                return true; // Indicate validation success
            };

            // Debounce function
            let debounceTimer;
            const debouncedValidate = () => {
                clearTimeout(debounceTimer);
                debounceTimer = window.setTimeout(() => {
                    runValidations();
                }, 500);
            };

            const form = document.getElementById("contact-form");
            const formInputs = form?.querySelectorAll("input, textarea");

            formInputs?.forEach((input) => {
                input.addEventListener("keyup", debouncedValidate);
            });

            form?.addEventListener("submit", (event) => {
                event.preventDefault(); // Prevents page reload

                if (!runValidations()) {
                    return; // Stop submission if validation fails
                }

                const formData = new FormData(form);
                const data = {};
                for (const [key, value] of formData.entries()) {
                    data[key] = value;
                }

                let mensaje = null;

                fetch(
                    "https://formsubmit.co/ajax/a0e7f1761136a918757612b9a39ef47d",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(data),
                    },
                )
                    .then((response) => {
                        if (response.ok) {
                            mensaje =
                                dict.mensajeEnviadoExito;
                            form.reset();
                        } else {
                            mensaje =
                                dict.mensajeEnviadoError;
                        }
                        const mensajeRespuestaEl = document.getElementById("mensaje-respuesta");
                        if (mensajeRespuestaEl) {
                            mensajeRespuestaEl.removeAttribute("hidden");
                            mensajeRespuestaEl.innerHTML = mensaje;
                        }
                        return response.json();
                    })
                    .then((data) => console.log(data))
                    .catch((error) => console.log(error));
            });
        });