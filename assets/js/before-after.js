// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  console.log('Script before-after.js cargado correctamente');
  
  // Inicializar el slider para todas las imágenes
  initBeforeAfterSliders();
});

// También inicializar en caso de que el script se cargue después del evento DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBeforeAfterSliders);
} else {
  // Si DOMContentLoaded ya ha ocurrido
  initBeforeAfterSliders();
}

function initBeforeAfterSliders() {
  // Seleccionar todos los contenedores de before-after
  const containers = document.querySelectorAll('.before-after-wrapper');
  
  // Verificar si se encontraron contenedores
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
    
    // Verificar que los elementos necesarios estén presentes
    if (!beforeContainer || !sliderLine) {
      console.warn(`Slider #${index}: Faltan elementos necesarios`);
      return;
    }
    
    // Asegurarse de que la posición inicial es correcta
    beforeContainer.style.clipPath = 'inset(0 50% 0 0)';
    sliderLine.style.left = '50%';
    
    // Función para actualizar la posición del slider
    const updateSliderPosition = (clientX) => {
      if (!isMoving) return;
      
      const rect = container.getBoundingClientRect();
      const x = Math.max(rect.left, Math.min(clientX, rect.right));
      const percent = ((x - rect.left) / rect.width) * 100;
      
      // Usar requestAnimationFrame para optimizar el rendimiento
      requestAnimationFrame(() => {
        beforeContainer.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        sliderLine.style.left = `${percent}%`;
      });
    };
    
    // Manejadores de eventos para mouse
    const handleStart = (e) => {
      isMoving = true;
      container.classList.add('sliding');
      updateSliderPosition(e.type.includes('mouse') ? e.clientX : e.touches[0].clientX);
    };
    
    const handleMove = (e) => {
      if (!isMoving) return;
      e.preventDefault();
      updateSliderPosition(e.type.includes('mouse') ? e.clientX : e.touches[0].clientX);
    };
    
    const handleEnd = () => {
      isMoving = false;
      container.classList.remove('sliding');
    };
    
    // Añadir eventos para mouse
    container.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    
    // Añadir eventos para touch (móviles)
    container.addEventListener('touchstart', handleStart, {passive: false});
    container.addEventListener('touchmove', handleMove, {passive: false});
    container.addEventListener('touchend', handleEnd);
    
    // Accesibilidad con teclado
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        
        const currentLeft = parseFloat(sliderLine.style.left || '50');
        const step = e.key === 'ArrowLeft' ? -5 : 5;
        const newPercent = Math.max(0, Math.min(100, currentLeft + step));
        
        beforeContainer.style.clipPath = `inset(0 ${100 - newPercent}% 0 0)`;
        sliderLine.style.left = `${newPercent}%`;
      }
    });
    
    console.log(`Slider #${index}: Inicializado correctamente`);
  });
}