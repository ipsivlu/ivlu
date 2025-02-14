document.addEventListener("DOMContentLoaded", function () {
  /* Detectar si el usuario está en móvil o escritorio*/
  var isMobile = /iPhone|Android|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile|Mobile/i.test(
    navigator.userAgent
  );

  /* Obtener la URL actual de la página*/
  var currentURL = window.location.href;

  /* Obtener el idioma de la página (mejorado)*/
  var pageLanguage = document.documentElement.lang || 
                    (window.location.pathname.indexOf('/en/') > -1 ? 'en' : 'es');

  /*Definir los mensajes en español e inglés*/
  var messages = {
    es: "Hola! Me gustaría recibir más información de esta página: ",
    en: "Hello! I would like to receive more information about this page: "
  };

  /* Seleccionar el mensaje según el idioma de la página*/
  var messageStart = messages[pageLanguage] || messages["es"]; // Default to Spanish if language not found

  /* Obtener todos los enlaces de WhatsApp en la página*/
  var whatsappLinks = document.querySelectorAll("a#lead_whatsapp");

  /*Recorrer los enlaces y cambiar el href según el dispositivo y el idioma*/
  whatsappLinks.forEach(function (link) {
    /* Mensaje completo con la URL actual*/
    var message = messageStart + encodeURIComponent(currentURL);

    /* Enlaces de WhatsApp para móvil y escritorio con el mensaje dinámico*/
    var mobileLink = "https://wa.me/573222010384?text=" + message;
    var desktopLink = "https://web.whatsapp.com/send?phone=573222010384&text=" + message;

    /* Asignar el enlace adecuado según el dispositivo*/
    if (isMobile) {
      link.setAttribute("href", mobileLink);
    } else {
      link.setAttribute("href", desktopLink);
    }
  });
});

/* Agregar al archivo main.js*/
function handleYouTubeError() {
  const youtubeFrames = document.querySelectorAll('iframe[src*="youtube.com"]');
  youtubeFrames.forEach(frame => {
    frame.addEventListener('error', () => {
      frame.style.display = 'none';
      const errorMessage = document.createElement('div');
      errorMessage.className = 'youtube-error';
      errorMessage.innerHTML = 'Video no disponible. Por favor, verifique su conexión.';
      frame.parentNode.insertBefore(errorMessage, frame);
    });
  });
}

document.addEventListener('DOMContentLoaded', handleYouTubeError);

