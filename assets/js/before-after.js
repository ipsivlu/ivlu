// Reemplazar tu script before-after.js actual con este:
document.addEventListener('DOMContentLoaded', function() {
  console.log('Script before-after.js cargado correctamente');
  
  // Inicializar el slider para todas las imágenes
  initBeforeAfterSliders();
});

// Inicializar si el DOM ya está cargado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initBeforeAfterSliders, 1);
}

function initBeforeAfterSliders() {
  // Seleccionar todos los contenedores de before-after
  const containers = document.querySelectorAll('.before-after-wrapper');
  
  if (containers.length === 0) {
    console.warn('No se encontraron contenedores .before-after-wrapper');
    return;
  }
  
  console.log(`Inicializando ${containers.length} sliders de before-after`);
  
  // Inicializar cada contenedor
  containers.forEach((container, index) => {
    let isMoving = false;
    const beforeContainer = container.querySelector('.before-image-container');
    const sliderLine = container.querySelector('.slider-line');
    
    if (!beforeContainer || !sliderLine) {
      console.warn(`Slider #${index}: Faltan elementos necesarios`);
      return;
    }
    
    // Establecer posición inicial manualmente para Safari
    setSliderPosition(beforeContainer, sliderLine, 50);
    
    // Función para actualizar la posición del slider
    function setSliderPosition(beforeElement, lineElement, percent) {
      // Fix para Safari: usar ambas versiones del clip-path
      beforeElement.style.webkitClipPath = `inset(0 ${100 - percent}% 0 0)`;
      beforeElement.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      
      // Usar left con % en lugar de transform para mejor compatibilidad
      lineElement.style.left = `${percent}%`;
    }
    
    const updateSliderPosition = function(clientX) {
      if (!isMoving) return;
      
      const rect = container.getBoundingClientRect();
      let x = clientX;
      
      // Asegurar que x está dentro de los límites del contenedor
      if (x < rect.left) x = rect.left;
      if (x > rect.right) x = rect.right;
      
      const percent = ((x - rect.left) / rect.width) * 100;
      
      // Aplicar cambios directamente sin requestAnimationFrame para Safari
      setSliderPosition(beforeContainer, sliderLine, percent);
    };
    
    // Funciones mejoradas para eventos
    function handleStart(e) {
      isMoving = true;
      container.classList.add('sliding');
      
      // Determinar tipo de evento (mouse o touch)
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      updateSliderPosition(clientX);
      
      // Prevenir comportamiento por defecto solo para eventos táctiles
      if (e.type.includes('touch')) {
        e.preventDefault();
      }
    }
    
    function handleMove(e) {
      if (!isMoving) return;
      
      // Determinar tipo de evento
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      updateSliderPosition(clientX);
      
      // Prevenir comportamiento por defecto
      e.preventDefault();
    }
    
    function handleEnd() {
      isMoving = false;
      container.classList.remove('sliding');
    }
    
    // Añadir eventos para mouse (capturar eventos en fase de captura)
    container.addEventListener('mousedown', handleStart, true);
    window.addEventListener('mousemove', handleMove, true);
    window.addEventListener('mouseup', handleEnd, true);
    
    // Añadir eventos para touch (móviles) con opciones específicas para Safari
    container.addEventListener('touchstart', handleStart, {passive: false, capture: true});
    window.addEventListener('touchmove', handleMove, {passive: false, capture: true});
    window.addEventListener('touchend', handleEnd, {capture: true});
    
    // Accesibilidad con teclado
    container.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        
        // Obtener el porcentaje actual
        const currentSliderStyle = window.getComputedStyle(sliderLine);
        let currentLeft = parseFloat(currentSliderStyle.left) || 50;
        
        // Convertir de px a porcentaje si es necesario
        if (currentSliderStyle.left.endsWith('px')) {
          const containerWidth = container.getBoundingClientRect().width;
          currentLeft = (currentLeft / containerWidth) * 100;
        }
        
        const step = e.key === 'ArrowLeft' ? -5 : 5;
        const newPercent = Math.max(0, Math.min(100, currentLeft + step));
        
        setSliderPosition(beforeContainer, sliderLine, newPercent);
      }
    });
    
    console.log(`Slider #${index}: Inicializado correctamente`);
  });
}