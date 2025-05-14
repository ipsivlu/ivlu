/**
 * Comparador de imágenes Antes/Después
 * Versión: 2.0
 * Compatible con: Chrome, Firefox, Safari, Edge
 */
(function() {
  'use strict';
  
  // Función principal para inicializar cuando el DOM esté listo
  function initBeforeAfterSliders() {
    // Seleccionar todos los comparadores en la página
    const sliders = document.querySelectorAll('.before-after-wrapper');
    
    if (!sliders.length) {
      console.log('No se encontraron comparadores de antes/después en esta página');
      return;
    }
    
    console.log(`Inicializando ${sliders.length} comparadores de antes/después`);
    
    // Procesar cada comparador
    sliders.forEach(function(slider, index) {
      setupSlider(slider, index);
    });
  }
  
  // Configurar un comparador individual
  function setupSlider(slider, index) {
    const beforeContainer = slider.querySelector('.before-image-container');
    const sliderControl = slider.querySelector('.slider-control');
    
    if (!beforeContainer || !sliderControl) {
      console.warn(`Comparador #${index}: Faltan elementos necesarios`);
      return;
    }
    
    // Variables para el seguimiento del estado
    let isDragging = false;
    
    // Establecer la posición inicial (50%)
    updateSliderPosition(50);
    
    // Función para actualizar la posición del slider
    function updateSliderPosition(percent) {
      const limitedPercent = Math.max(0, Math.min(100, percent));
      
      // Actualizar el clip-path de la imagen antes
      beforeContainer.style.clipPath = `polygon(0% 0%, ${limitedPercent}% 0%, ${limitedPercent}% 100%, 0% 100%)`;
      beforeContainer.style.webkitClipPath = `polygon(0% 0%, ${limitedPercent}% 0%, ${limitedPercent}% 100%, 0% 100%)`;
      
      // Actualizar la posición del control deslizante
      sliderControl.style.left = `${limitedPercent}%`;
      
      // Actualizar el atributo ARIA para accesibilidad
      slider.setAttribute('aria-valuenow', limitedPercent);
    }
    
    // Función para manejar eventos de movimiento (mouse/touch)
    function handleMove(clientX) {
      if (!isDragging) return;
      
      const rect = slider.getBoundingClientRect();
      const position = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (position / rect.width) * 100;
      
      updateSliderPosition(percentage);
    }
    
    // --- Manejadores de eventos para ratón ---
    function handleMouseDown(e) {
      e.preventDefault();
      isDragging = true;
      slider.classList.add('sliding');
      handleMove(e.clientX);
    }
    
    function handleMouseMove(e) {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.clientX);
      }
    }
    
    function handleMouseUp() {
      isDragging = false;
      slider.classList.remove('sliding');
    }
    
    // --- Manejadores de eventos para touch ---
    function handleTouchStart(e) {
      isDragging = true;
      slider.classList.add('sliding');
      handleMove(e.touches[0].clientX);
    }
    
    function handleTouchMove(e) {
      if (isDragging) {
        e.preventDefault(); // Prevenir el scroll
        handleMove(e.touches[0].clientX);
      }
    }
    
    function handleTouchEnd() {
      isDragging = false;
      slider.classList.remove('sliding');
    }
    
    // --- Navegación con teclado (accesibilidad) ---
    function handleKeyDown(e) {
      const step = 5; // Porcentaje de movimiento
      let currentValue = parseInt(slider.getAttribute('aria-valuenow'), 10) || 50;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateSliderPosition(currentValue - step);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateSliderPosition(currentValue + step);
      } else if (e.key === 'Home') {
        e.preventDefault();
        updateSliderPosition(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        updateSliderPosition(100);
      }
    }
    
    // Registrar eventos para ratón
    slider.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Registrar eventos para touch
    slider.addEventListener('touchstart', handleTouchStart, {passive: false});
    slider.addEventListener('touchmove', handleTouchMove, {passive: false});
    slider.addEventListener('touchend', handleTouchEnd);
    
    // Accesibilidad con teclado
    slider.addEventListener('keydown', handleKeyDown);
    
    console.log(`Comparador #${index}: Inicializado correctamente`);
  }
  
  // --- Inicialización ---
  
  // Detectar cuándo el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBeforeAfterSliders);
  } else {
    // Si el DOM ya está cargado
    initBeforeAfterSliders();
  }
  
  // También inicializar en caso de carga tardía
  window.addEventListener('load', function() {
    setTimeout(initBeforeAfterSliders, 100);
  });
  
  // Exponer función para inicialización manual
  window.initBeforeAfterComparisons = initBeforeAfterSliders;
})();