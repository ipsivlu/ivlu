/**
 * canales.js — medición de todos los canales de contacto, igual en todos los sitios
 * Versión 3.0 (evolución de lead-whatsapp.js 2.2; lo reemplaza, no conviven)
 *
 * QUÉ HACE
 *   1. WhatsApp: lo mismo que 2.2. Mensaje prellenado, evento de siempre
 *      (data-wa-event, por defecto "whatsapp_click") y recuperación del lead si
 *      el usuario vuelve enseguida sin haber escrito. Los tags de GTM que ya
 *      existen siguen funcionando sin tocarlos.
 *   2. Teléfono, SMS, correo y agenda: un evento "contact_click" con
 *      contact_method = phone | sms | email | booking. Antes no se medían.
 *   3. Guarda la atribución del primer toque de la sesión (utm_*, gclid, gbraid,
 *      wbraid, referrer, landing) para que el formulario la mande a la hoja.
 *   4. Oculta el botón flotante [data-flotante] mientras el hero [data-hero]
 *      está en pantalla (data-oculto + inert, para que tampoco reciba foco).
 *
 * Engancha por el DESTINO del enlace, no por una clase: un enlace escrito a mano
 * mañana también se mide. Empuja SOLO al dataLayer cuando hay GTM; gtag() solo
 * se usa en sitios sin contenedor (llamar a los dos duplicaba cada clic).
 *
 * CONFIGURACIÓN — atributos del <body>, rellenados desde _config.yml
 *   data-wa-phone, data-wa-message, data-wa-context, data-wa-event,
 *   data-wa-params, data-wa-track, data-wa-styles, data-wa-class   (igual que 2.2)
 *   data-booking-host  host de la agenda (calendar.app.google, calendly.com…)
 * Por enlace: data-location (o data-wa-location), data-wa-text, data-wa-extra,
 *   data-wa-phone, y data-track-ignore / data-wa-ignore para no medirlo
 *   (p. ej. "compartir este artículo por WhatsApp").
 *
 * COMPROBAR: en la consola, Canales.diagnostico()
 */
(function () {
  "use strict";

  var VERSION = "3.0";
  var body = document.body;
  if (!body) return;

  function json(valor) {
    if (!valor) return {};
    try {
      var o = JSON.parse(valor);
      return o && typeof o === "object" ? o : {};
    } catch (e) {
      return {};
    }
  }

  // sessionStorage lanza en modo privado o con el almacenamiento bloqueado.
  function leer(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function escribir(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function borrar(k) { try { sessionStorage.removeItem(k); } catch (e) {} }

  var CONFIG = {
    phone: (body.dataset.waPhone || "").replace(/[^0-9]/g, ""),
    message: body.dataset.waMessage || "",
    context: body.dataset.waContext || "",
    evento: body.dataset.waEvent || "whatsapp_click",
    params: json(body.dataset.waParams),
    medir: body.dataset.waTrack !== "off",
    estilos: body.dataset.waStyles !== "off",
    claseBoton: body.dataset.waClass || "",
    agenda: body.dataset.bookingHost || "",
    lang: (document.documentElement.lang || "es").slice(0, 2).toLowerCase()
  };

  if (!CONFIG.phone) {
    var muestra = document.querySelector('a[href*="wa.me/"]');
    var m = muestra && (muestra.getAttribute("href") || "").match(/wa\.me\/(\d{6,15})/);
    if (m) CONFIG.phone = m[1];
  }

  var SELECTOR_WA = [
    'a[href*="wa.me/"]',
    'a[href*="api.whatsapp.com"]',
    'a[href*="web.whatsapp.com"]',
    'a[href^="whatsapp:"]',
    ".lead-whatsapp",
    ".lead_whatsapp",
    "[data-whatsapp-link]",
    "[data-whatsapp-action]",
    "[data-wa-trigger]",
    ".whatsapp-float"
  ].join(", ");

  var esMovil = /iPhone|Android|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile|Mobile/i.test(
    navigator.userAgent
  );

  // ==========================================================================
  // ATRIBUCIÓN (primer toque de la sesión)
  // ==========================================================================

  var K_ATRIB = "lead_atrib";
  (function guardarAtribucion() {
    if (leer(K_ATRIB)) return;
    var q = new URLSearchParams(window.location.search);
    var datos = {
      landing: window.location.pathname,
      referrer: document.referrer && document.referrer.indexOf(window.location.host) === -1 ? document.referrer : ""
    };
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"]
      .forEach(function (k) { if (q.get(k)) datos[k] = q.get(k).slice(0, 200); });
    escribir(K_ATRIB, JSON.stringify(datos));
  })();

  function atribucion() { return json(leer(K_ATRIB)); }

  // ==========================================================================
  // ANALÍTICA
  // ==========================================================================

  var Analytics = {
    push: function (datos) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(datos);
      if (!window.google_tag_manager && typeof window.gtag === "function") {
        window.gtag("event", datos.event, datos);
      }
    },
    base: function () {
      return {
        device_type: esMovil ? "mobile" : "desktop",
        page_path: window.location.pathname,
        page_context: CONFIG.context || "(ninguno)",
        language: CONFIG.lang
      };
    },
    whatsapp: function (ubicacion, enlace) {
      if (!CONFIG.medir) return;
      var datos = this.base();
      datos.button_location = ubicacion;
      datos.contact_method = "whatsapp";
      var conTratamiento = enlace && enlace.closest("[data-treatment]");
      datos.treatment_source = (conTratamiento && conTratamiento.dataset.treatment) || CONFIG.context || null;
      for (var k in CONFIG.params) {
        if (Object.prototype.hasOwnProperty.call(CONFIG.params, k)) datos[k] = CONFIG.params[k];
      }
      datos.event = CONFIG.evento;
      this.push(datos);
    },
    canal: function (metodo, ubicacion) {
      if (!CONFIG.medir) return;
      var datos = this.base();
      datos.event = "contact_click";
      datos.contact_method = metodo;
      datos.button_location = ubicacion;
      this.push(datos);
    },
    simple: function (evento) {
      var datos = this.base();
      datos.event = evento;
      this.push(datos);
    }
  };

  // ==========================================================================
  // RECUPERACIÓN DE LEAD DE WHATSAPP (sin cambios de comportamiento desde 2.2)
  // Hace falta una salida real (la página se oculta tras el clic) y un regreso
  // rápido. Una sola aparición por sesión.
  // ==========================================================================

  var Recuperacion = {
    MIN_FUERA: 1500,
    MAX_FUERA: 12000,
    MAX_TRAS_CLIC: 10000,
    K_PENDIENTE: "wa_pendiente",
    K_CLIC: "wa_clic",
    K_SALIDA: "wa_salida",
    K_MOSTRADO: "wa_recuperacion_mostrada",
    K_MENSAJE: "wa_mensaje_pendiente",
    K_NUMERO: "wa_numero_pendiente",

    armar: function (numero, mensaje) {
      if (leer(this.K_MOSTRADO)) return;
      escribir(this.K_PENDIENTE, "1");
      escribir(this.K_CLIC, String(Date.now()));
      borrar(this.K_SALIDA);
      if (numero) escribir(this.K_NUMERO, numero);
      if (mensaje) escribir(this.K_MENSAJE, mensaje);
    },
    marcarSalida: function () {
      if (!leer(this.K_PENDIENTE) || leer(this.K_SALIDA)) return;
      var clic = Number(leer(this.K_CLIC));
      if (!clic || Date.now() - clic > this.MAX_TRAS_CLIC) {
        borrar(this.K_PENDIENTE);
        borrar(this.K_CLIC);
        return;
      }
      escribir(this.K_SALIDA, String(Date.now()));
    },
    procede: function () {
      if (leer(this.K_MOSTRADO) || !leer(this.K_PENDIENTE)) return false;
      var salida = Number(leer(this.K_SALIDA));
      if (!salida) return false;
      var fuera = Date.now() - salida;
      borrar(this.K_PENDIENTE);
      borrar(this.K_CLIC);
      borrar(this.K_SALIDA);
      return fuera >= this.MIN_FUERA && fuera <= this.MAX_FUERA;
    },
    marcarMostrado: function () {
      escribir(this.K_MOSTRADO, "1");
      borrar(this.K_PENDIENTE);
      borrar(this.K_CLIC);
      borrar(this.K_SALIDA);
    },
    vigilar: function (alVolver) {
      var self = this;
      var comprobar = function () {
        if (document.visibilityState !== "visible" || !self.procede()) return;
        self.marcarMostrado();
        alVolver();
      };
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") self.marcarSalida();
        else comprobar();
      });
      window.addEventListener("pagehide", function () { self.marcarSalida(); });
      window.addEventListener("pageshow", comprobar);
      comprobar();
    }
  };

  var TEXTOS = {
    es: {
      titulo: "¿Seguimos por WhatsApp?",
      subtitulo: "Si no llegaste a enviar el mensaje, retómalo desde aquí.",
      principal: "Abrir WhatsApp",
      copiar: "Copiar número",
      copiado: "¡Número copiado!",
      cerrar: "Cerrar"
    },
    en: {
      titulo: "Continue on WhatsApp?",
      subtitulo: "If you didn’t get to send your message, pick it up here.",
      principal: "Open WhatsApp",
      copiar: "Copy number",
      copiado: "Number copied!",
      cerrar: "Close"
    }
  };

  // El cuadro se inyecta con su propio CSS para funcionar en cualquier sitio.
  // data-wa-styles="off" lo apaga cuando el sitio trae el suyo en @layer.
  function inyectarEstilos() {
    if (!CONFIG.estilos || document.getElementById("lead-wa-estilos")) return;
    var css =
      ".lead-wa-modal,.lead-wa-modal *{box-sizing:border-box}" +
      ".lead-wa-modal{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;" +
      "align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;" +
      "transition:opacity .2s ease-out,visibility 0s linear .2s}" +
      ".lead-wa-modal.is-open{opacity:1;visibility:visible;transition:opacity .2s ease-out,visibility 0s linear 0s}" +
      ".lead-wa-card{background:#fff;color:#1a1a1a;padding:2rem 1.75rem;max-width:400px;width:100%;" +
      "position:relative;text-align:center;font-family:inherit;transform:translateY(12px);transition:transform .2s ease-out}" +
      ".lead-wa-modal.is-open .lead-wa-card{transform:none}" +
      ".lead-wa-card h3{margin:0 0 .5rem;font-size:1.25rem;line-height:1.3}" +
      ".lead-wa-sub{margin:0;font-size:.9rem;line-height:1.45;color:#555}" +
      ".lead-wa-acciones{display:flex;flex-direction:column;gap:.75rem;margin:1.5rem 0 0}" +
      ".lead-wa-btn{display:block;width:100%;min-height:44px;padding:.875rem 1.25rem;border:none;font:inherit;" +
      "font-weight:600;text-decoration:none;text-align:center;cursor:pointer}" +
      ".lead-wa-btn--wa{background:#25d366;color:#fff}.lead-wa-btn--sec{background:#f1f1f1;color:#333}" +
      ".lead-wa-cerrar{position:absolute;top:4px;right:4px;min-width:44px;min-height:44px;background:none;" +
      "border:none;font-size:1.5rem;color:#666;cursor:pointer}" +
      "@media (prefers-reduced-motion:reduce){.lead-wa-modal,.lead-wa-card{transition:none;transform:none}}";
    var s = document.createElement("style");
    s.id = "lead-wa-estilos";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function mostrarCuadro() {
    if (document.querySelector(".lead-wa-modal")) return;
    inyectarEstilos();
    var t = TEXTOS[CONFIG.lang] || TEXTOS.es;
    var numero = leer(Recuperacion.K_NUMERO) || CONFIG.phone;
    var texto = leer(Recuperacion.K_MENSAJE) || construirMensaje(null);
    var href = destinoDe(numero, texto);

    Analytics.simple("lead_recovery_shown");

    var modal = document.createElement("div");
    modal.className = "lead-wa-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", t.titulo);
    modal.innerHTML =
      '<div class="lead-wa-card"><h3>' + t.titulo + '</h3><p class="lead-wa-sub">' + t.subtitulo + "</p>" +
      '<div class="lead-wa-acciones"><a class="lead-wa-btn lead-wa-btn--wa' +
      (CONFIG.claseBoton ? " " + CONFIG.claseBoton : "") + '" href="' + href +
      '" target="_blank" rel="nofollow noopener noreferrer">' + t.principal + "</a>" +
      '<button type="button" class="lead-wa-btn lead-wa-btn--sec">' + t.copiar + "</button></div>" +
      '<button type="button" class="lead-wa-cerrar" aria-label="' + t.cerrar + '">&times;</button></div>';
    document.body.appendChild(modal);
    // Reflow síncrono: rAF no corre en pestañas ocultas y el cuadro aparece justo al volver.
    void modal.offsetWidth;
    modal.classList.add("is-open");

    var alPulsarTecla = function (e) { if (e.key === "Escape") cerrar(); };
    function cerrar() {
      modal.classList.remove("is-open");
      document.removeEventListener("keydown", alPulsarTecla);
      setTimeout(function () { modal.remove(); }, 250);
    }
    modal.addEventListener("click", function (e) { if (e.target === modal) cerrar(); });
    modal.querySelector(".lead-wa-cerrar").addEventListener("click", cerrar);
    modal.querySelector(".lead-wa-btn--wa").addEventListener("click", function () {
      Analytics.simple("lead_recovery_click");
      cerrar();
    });
    modal.querySelector(".lead-wa-btn--sec").addEventListener("click", function (e) {
      var boton = e.currentTarget;
      var original = boton.textContent;
      var copia = navigator.clipboard ? navigator.clipboard.writeText(numero) : Promise.reject();
      copia
        .then(function () { boton.textContent = t.copiado; })
        .catch(function () { boton.textContent = numero; })
        .then(function () { setTimeout(function () { boton.textContent = original; }, 2000); });
    });
    document.addEventListener("keydown", alPulsarTecla);
    modal.querySelector(".lead-wa-btn--wa").focus();
  }

  // ==========================================================================
  // NÚMERO, MENSAJE, UBICACIÓN Y DESTINO
  // ==========================================================================

  function numeroDe(enlace) {
    if (enlace && enlace.dataset.waPhone) return enlace.dataset.waPhone.replace(/[^0-9]/g, "");
    if (enlace) {
      var href = enlace.getAttribute("href") || "";
      var m = href.match(/wa\.me\/(\d{6,15})/) || href.match(/[?&]phone=\+?(\d{6,15})/);
      if (m) return m[1];
    }
    return CONFIG.phone;
  }

  function construirMensaje(enlace) {
    if (enlace && enlace.dataset.waText) return encodeURIComponent(enlace.dataset.waText);
    if (enlace) {
      var m = (enlace.getAttribute("href") || "").match(/[?&]text=([^&]*)/);
      if (m && m[1]) return m[1];
    }
    if (!CONFIG.message) return "";
    var base = CONFIG.message;
    if (enlace) base += enlace.dataset.waExtra || enlace.dataset.extra || "";
    return encodeURIComponent(base);
  }

  function ubicacionDe(enlace) {
    var d = enlace.dataset;
    var propia = d.location || d.waLocation || d.wa || d.buttonType;
    if (propia) return propia;
    var zona = enlace.closest("header,nav,footer,aside,main,section,article");
    if (zona) {
      if (zona.tagName === "HEADER") return "cabecera";
      if (zona.tagName === "NAV") return "menu";
      if (zona.tagName === "FOOTER") return "pie";
      if (zona.id) return zona.id;
    }
    return "sin-ubicacion";
  }

  // Siempre wa.me, nunca whatsapp://: el protocolo no oculta la página (rompe la
  // recuperación) y el diálogo de Chrome dejaba el clic sin efecto visible.
  function destinoDe(numero, mensaje) {
    return "https://wa.me/" + numero + (mensaje ? "?text=" + mensaje : "");
  }

  function metodoDe(enlace) {
    var href = (enlace.getAttribute("href") || "").toLowerCase();
    if (href.indexOf("tel:") === 0) return "phone";
    if (href.indexOf("sms:") === 0) return "sms";
    if (href.indexOf("mailto:") === 0) return "email";
    if (CONFIG.agenda && href.indexOf(CONFIG.agenda) > -1) return "booking";
    return "";
  }

  // ==========================================================================
  // CLIC
  // ==========================================================================

  var ultimo = { el: null, t: 0 };
  function repetido(el) {
    var ahora = Date.now();
    var r = ultimo.el === el && ahora - ultimo.t < 400;
    ultimo = { el: el, t: ahora };
    return r;
  }

  function alHacerClic(e) {
    var enlace = e.target.closest("a[href], " + SELECTOR_WA);
    if (!enlace || enlace.closest("[data-track-ignore], [data-wa-ignore], .lead-wa-modal")) return;

    // Teléfono, SMS, correo y agenda: se mide y el navegador sigue su curso.
    var metodo = metodoDe(enlace);
    if (metodo) {
      if (!repetido(enlace)) Analytics.canal(metodo, ubicacionDe(enlace));
      return;
    }

    if (!enlace.matches(SELECTOR_WA)) return;
    if (repetido(enlace)) return;

    var numero = numeroDe(enlace);
    var mensaje = construirMensaje(enlace);
    var destino = destinoDe(numero, mensaje);
    var esA = enlace.tagName === "A" && enlace.hasAttribute("href");

    Analytics.whatsapp(ubicacionDe(enlace), enlace);
    Recuperacion.armar(numero, mensaje);

    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      if (esA) enlace.setAttribute("href", destino);
      return;
    }
    if (esMovil) {
      e.preventDefault();
      window.location.href = destino;
      return;
    }
    if (esA) {
      enlace.setAttribute("href", destino);
      enlace.setAttribute("target", "_blank");
      enlace.setAttribute("rel", "nofollow noopener noreferrer");
      return;
    }
    e.preventDefault();
    window.open(destino, "_blank", "noopener");
  }

  // Captura: se mide antes de que cualquier otro manejador cancele el clic.
  document.addEventListener("click", alHacerClic, true);
  Recuperacion.vigilar(mostrarCuadro);

  // ==========================================================================
  // FLOTANTE: oculto mientras se ve el hero
  // ==========================================================================

  (function () {
    var flotante = document.querySelector("[data-flotante]");
    var hero = document.querySelector("[data-hero]");
    if (!flotante || !hero || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entradas) {
      var visible = entradas[0].isIntersecting;
      flotante.toggleAttribute("data-oculto", visible);
      flotante.inert = visible;
      if (visible) {
        var menu = flotante.querySelector("[popover]");
        if (menu && menu.matches(":popover-open")) menu.hidePopover();
      }
    }, { threshold: 0.05 }).observe(hero);
  })();

  window.Canales = {
    version: VERSION,
    config: CONFIG,
    atribucion: atribucion,
    push: function (d) { Analytics.push(d); },
    probarCuadro: mostrarCuadro,
    diagnostico: function () {
      var wa = document.querySelectorAll(SELECTOR_WA);
      var otros = { phone: 0, sms: 0, email: 0, booking: 0 };
      Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (a) {
        var m = metodoDe(a);
        if (m) otros[m]++;
      });
      return {
        version: VERSION,
        numeroDelSitio: CONFIG.phone || "(FALTA data-wa-phone)",
        eventoWhatsApp: CONFIG.evento,
        mide: CONFIG.medir,
        enlacesWhatsApp: wa.length,
        otrosCanales: otros,
        hostAgenda: CONFIG.agenda || "(sin agenda)",
        idioma: CONFIG.lang,
        atribucion: atribucion(),
        flotante: !!document.querySelector("[data-flotante]"),
        hero: !!document.querySelector("[data-hero]")
      };
    }
  };
})();
