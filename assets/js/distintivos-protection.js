// Protección adicional para distintivos
// Solo afecta imágenes con clase .distintivo-img

(function() {
  'use strict';

  // Deshabilitar clic derecho solo en distintivos
  document.addEventListener('contextmenu', function(e) {
    if (e.target.classList.contains('distintivo-img')) {
      e.preventDefault();
      return false;
    }
  });

  // Deshabilitar arrastre de distintivos
  document.addEventListener('dragstart', function(e) {
    if (e.target.classList.contains('distintivo-img')) {
      e.preventDefault();
      return false;
    }
  });

  // Prevenir combinaciones de teclas comunes para copiar imágenes
  document.addEventListener('keydown', function(e) {
    // Solo si el target es una imagen de distintivo
    if (e.target.classList.contains('distintivo-img')) {
      // Ctrl+S, Ctrl+U, F12, etc.
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        return false;
      }
    }
  });

  console.log('Protección de distintivos activada');
})();
