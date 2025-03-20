document.addEventListener('DOMContentLoaded', function() {
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const dropdowns = document.querySelectorAll('.dropdown');
  const header = document.getElementById('header');
  const servicesDropdown = document.getElementById('services-dropdown');
  const megamenu = document.getElementById('services-megamenu');

  // Control del menú móvil
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', function() {
      navLinks.classList.toggle('nav-links-mobile');
      this.classList.toggle('active');
      
      // Actualiza el atributo aria-expanded para accesibilidad
      const expanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', !expanded);
      
      // Cerrar todos los dropdowns cuando abrimos/cerramos el menú
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
      
      // Asegurarse que el megamenú esté cerrado en móvil
      if (megamenu && window.innerWidth <= 1120) {
        megamenu.style.display = 'none';
      }
    });
  }

  // Control de dropdowns
  dropdowns.forEach(dropdown => {
    // Capturar el elemento span que actúa como trigger
    const dropdownTrigger = dropdown.querySelector('span');
    
    if (dropdownTrigger) {
      dropdownTrigger.addEventListener('click', function(e) {
        if (window.innerWidth <= 1120) {
          e.preventDefault();
          e.stopPropagation();
          
          // Si hacemos clic en Servicios, manejo especial para el megamenú
          if (dropdown.id === 'services-dropdown') {
            const isActive = dropdown.classList.contains('active');
            
            // Cerrar todos los otros dropdowns primero
            dropdowns.forEach(otherDropdown => {
              if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove('active');
              }
            });
            
            // Alternar el estado de este dropdown
            dropdown.classList.toggle('active');
            
            // Manejar el megamenú
            if (megamenu) {
              if (dropdown.classList.contains('active')) {
                megamenu.style.display = 'block';
              } else {
                megamenu.style.display = 'none';
              }
            }
          } else {
            // Para otros dropdowns, comportamiento normal
            // Cerrar el megamenú si está abierto
            if (megamenu) {
              megamenu.style.display = 'none';
            }
            
            // Cerrar servicios dropdown si está activo
            if (servicesDropdown) {
              servicesDropdown.classList.remove('active');
            }
            
            // Cerrar otros dropdowns
            dropdowns.forEach(otherDropdown => {
              if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove('active');
              }
            });
            
            // Alternar estado del actual
            dropdown.classList.toggle('active');
          }
        }
      });
    }
  });

  // Control del megamenú para escritorio
  if (servicesDropdown && megamenu) {
    // Para escritorio: mostrar megamenú al hacer hover
    servicesDropdown.addEventListener('mouseenter', function() {
      if (window.innerWidth > 1120) {
        megamenu.style.display = 'block';
        setTimeout(function() {
          megamenu.style.opacity = '1';
          megamenu.style.transform = 'translateY(0)';
        }, 10);
      }
    });
    
    // Mantener abierto cuando el mouse está sobre el megamenú
    megamenu.addEventListener('mouseenter', function() {
      if (window.innerWidth > 1120) {
        megamenu.style.display = 'block';
        megamenu.style.opacity = '1';
        megamenu.style.transform = 'translateY(0)';
      }
    });
    
    // Cerrar cuando el mouse sale del megamenú
    megamenu.addEventListener('mouseleave', function() {
      if (window.innerWidth > 1120) {
        closeMegamenu();
      }
    });
    
    // Cuando el mouse sale del dropdown, verificar si va hacia el megamenú
    servicesDropdown.addEventListener('mouseleave', function(e) {
      if (window.innerWidth > 1120) {
        const megaRect = megamenu.getBoundingClientRect();
        // Si el mouse se mueve hacia el megamenú (hacia abajo)
        if (!(e.clientY >= megaRect.top - 20)) {
          closeMegamenu();
        }
      }
    });
    
    // Función para cerrar el megamenú con transición
    function closeMegamenu() {
      megamenu.style.opacity = '0';
      megamenu.style.transform = 'translateY(-10px)';
      setTimeout(function() {
        megamenu.style.display = 'none';
      }, 300);
    }
  }

  // Cerrar menús al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-links') && 
        !e.target.closest('.mobile-nav-toggle') && 
        !e.target.closest('#services-megamenu')) {
      
      if (window.innerWidth <= 1120) {
        // Cerrar el menú móvil si está abierto
        if (mobileNavToggle && mobileNavToggle.classList.contains('active')) {
          mobileNavToggle.classList.remove('active');
          navLinks.classList.remove('nav-links-mobile');
          mobileNavToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Cerrar todos los dropdowns
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('active');
        });
        
        // Cerrar megamenú
        if (megamenu) {
          megamenu.style.display = 'none';
        }
      } else {
        // En escritorio, cerrar el megamenú
        if (megamenu) {
          closeMegamenu();
        }
      }
    }
  });

  // Cerrar menú al hacer clic en un enlace
  const menuLinks = document.querySelectorAll('.nav-links a:not(.dropdown span), #services-megamenu a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNavToggle && mobileNavToggle.classList.contains('active')) {
        mobileNavToggle.classList.remove('active');
        navLinks.classList.remove('nav-links-mobile');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
      }
      
      // Cerrar todos los dropdowns
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
      
      // Cerrar megamenú
      if (megamenu) {
        megamenu.style.display = 'none';
      }
    });
  });

  // Manejar cambios de tamaño de ventana
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1120) {
      // Restablecer todo cuando se cambia a desktop
      if (navLinks.classList.contains('nav-links-mobile')) {
        navLinks.classList.remove('nav-links-mobile');
      }
      
      if (mobileNavToggle && mobileNavToggle.classList.contains('active')) {
        mobileNavToggle.classList.remove('active');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
      }
      
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
      
      // En modo escritorio, resetear megamenú
      if (megamenu) {
        megamenu.style.display = 'none';
        megamenu.style.opacity = '0';
        megamenu.style.transform = 'translateY(-10px)';
      }
    } else {
      // En móvil, ocultar el megamenú si no está activo
      if (megamenu && servicesDropdown && !servicesDropdown.classList.contains('active')) {
        megamenu.style.display = 'none';
      }
    }
  });
  
  // Verificar el scroll inicial cuando carga la página
  if (window.scrollY > 0) {
    header.classList.add('scrolled');
  }
  
  // Añadir evento de scroll para cambiar apariencia del header
  window.addEventListener('scroll', function() {
    if (window.scrollY > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});

/* Sliders de galerías*/
document.addEventListener('DOMContentLoaded', function () {
  /* Seleccionar todas las galerías en la página*/
  const galleries = document.querySelectorAll('.gallery');

  /* Configurar cada galería independientemente*/
  galleries.forEach(function (gallery, galleryIndex) {
    initGallery(gallery, galleryIndex);
  });

  function initGallery(gallery, galleryIndex) {
    /* Seleccionar elementos dentro de esta galería específica*/
    const galleryImages = gallery.querySelector('.gallery-images');
    const indicators = gallery.querySelectorAll('.indicator');
    const items = gallery.querySelectorAll('.gallery-item');

    if (!galleryImages || !indicators.length || !items.length) return;

    // Dar a cada galería un ID único para evitar confusiones
    gallery.setAttribute('data-gallery-id', galleryIndex);

    let currentIndex = 0;

    // Agregar botones de navegación para escritorio
    const navButtons = document.createElement('div');
    navButtons.className = 'gallery-nav';
    navButtons.innerHTML = `
          <button class="gallery-prev" aria-label="Anterior">&lt;</button>
          <button class="gallery-next" aria-label="Siguiente">&gt;</button>
      `;
    gallery.appendChild(navButtons);

    // Botones de navegación para esta galería
    const prevButton = gallery.querySelector('.gallery-prev');
    const nextButton = gallery.querySelector('.gallery-next');

    // Establecer el primer indicador como activo
    indicators[0].classList.add('active');

    // Función para cambiar slide con control preciso
    function goToSlide(index) {
      // Asegurar que el índice esté dentro del rango
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;

      currentIndex = index;

      // Cálculo manual del desplazamiento para mejor precisión
      if (items[index]) {
        const scrollPosition = items[index].offsetLeft - galleryImages.offsetLeft;

        // Usar scrollTo en lugar de scrollIntoView para mayor control
        galleryImages.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });

        // Actualizar indicadores
        indicators.forEach((indicator, i) => {
          indicator.classList.toggle('active', i === index);
        });
      }
    }

    // Event listeners para los indicadores
    indicators.forEach((indicator) => {
      indicator.addEventListener('click', () => {
        // Obtener el índice del atributo data-index
        const index = parseInt(indicator.getAttribute('data-index'));
        if (!isNaN(index)) {
          goToSlide(index);

          // Detener autoplay al hacer clic manualmente
          stopAutoplay();
        }
      });
    });

    // Event listeners para los botones de navegación
    prevButton.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      stopAutoplay();
    });

    nextButton.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      stopAutoplay();
    });

    // Detectar cuando el scroll termina
    galleryImages.addEventListener('scroll', function () {
      clearTimeout(galleryImages.scrollTimer);
      galleryImages.scrollTimer = setTimeout(function () {
        // Solo actualizar si no está en transición automática
        if (!galleryImages.isScrolling) {
          updateActiveIndicator();
        }
      }, 150);
    });

    // Actualizar indicador activo basado en posición de scroll
    function updateActiveIndicator() {
      const centerPosition = galleryImages.scrollLeft + galleryImages.offsetWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
        const distance = Math.abs(itemCenter - centerPosition);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Solo actualizar si el índice ha cambiado
      if (closestIndex !== currentIndex) {
        currentIndex = closestIndex;

        // Actualizar indicadores de esta galería
        indicators.forEach((indicator, i) => {
          indicator.classList.toggle('active', i === closestIndex);
        });
      }
    }

    // Mejorar detección de swipes
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    galleryImages.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;

      // Detener autoplay al interactuar
      stopAutoplay();
    }, { passive: true });

    galleryImages.addEventListener('touchend', (e) => {
      if (isSwiping) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        isSwiping = false;
      }
    }, { passive: true });

    // Cancelar swipe si se sale del elemento
    galleryImages.addEventListener('touchcancel', () => {
      isSwiping = false;
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance < 0) {
          // Swipe hacia la izquierda - siguiente slide
          goToSlide(currentIndex + 1);
        } else {
          // Swipe hacia la derecha - slide anterior
          goToSlide(currentIndex - 1);
        }
      }
    }

    // Autoplay mejorado
    let autoplayInterval;
    let autoplayActive = true;

    function startAutoplay() {
      if (!autoplayActive) return;

      stopAutoplay(); // Limpiar cualquier intervalo existente

      autoplayInterval = setInterval(() => {
        // Marcar que estamos en transición automática
        galleryImages.isScrolling = true;

        // Ir al siguiente slide
        let nextIndex = currentIndex + 1;
        if (nextIndex >= items.length) nextIndex = 0;
        goToSlide(nextIndex);

        // Restablecer la bandera después de un tiempo
        setTimeout(() => {
          galleryImages.isScrolling = false;
        }, 500);
      }, 5000);
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    function disableAutoplay() {
      stopAutoplay();
      autoplayActive = false;
    }

    // Iniciar autoplay
    startAutoplay();

    // Control de autoplay con eventos
    gallery.addEventListener('mouseenter', stopAutoplay);
    gallery.addEventListener('mouseleave', startAutoplay);
    galleryImages.addEventListener('touchstart', stopAutoplay, { passive: true });
    galleryImages.addEventListener('mousedown', disableAutoplay);

    indicators.forEach(indicator => {
      indicator.addEventListener('click', disableAutoplay);
    });

    prevButton.addEventListener('click', disableAutoplay);
    nextButton.addEventListener('click', disableAutoplay);
  }
});

// Código para WhatsApp
document.addEventListener("DOMContentLoaded", function () {
  /* Detectar si el usuario está en móvil o escritorio*/
  var isMobile = /iPhone|Android|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile|Mobile/i.test(
    navigator.userAgent
  );

  /* Obtener el idioma de la página (mejorado)*/
  var pageLanguage = document.documentElement.lang ||
    (window.location.pathname.indexOf('/en/') > -1 ? 'en' : 'es');

  /*Definir los mensajes en español e inglés*/
  var messages = {
    es: "Hola. Me gustaría pedir más información de los tratamientos estéticos que vi en tu página web. Gracias",
    en: "Hello. I would like to request more information about the aesthetic treatments I saw on your website. Thank you"
  };

  /* Seleccionar el mensaje según el idioma de la página*/
  var message = messages[pageLanguage] || messages["es"]; // Default to Spanish if language not found

  /* Obtener todos los enlaces de WhatsApp en la página*/
  var whatsappLinks = document.querySelectorAll("a#lead_whatsapp");

  /*Recorrer los enlaces y cambiar el href según el dispositivo y el idioma*/
  whatsappLinks.forEach(function (link) {
    /* Codificar el mensaje para usarlo en la URL de WhatsApp*/
    var encodedMessage = encodeURIComponent(message);

    /* Enlaces de WhatsApp para móvil y escritorio con el mensaje dinámico*/
    var mobileLink = "https://wa.me/573228351465?text=" + encodedMessage;
    var desktopLink = "https://web.whatsapp.com/send?phone=573228351465&text=" + encodedMessage;

    /* Asignar el enlace adecuado según el dispositivo*/
    if (isMobile) {
      link.setAttribute("href", mobileLink);
    } else {
      link.setAttribute("href", desktopLink);
    }
  });
});

// Scroll to top
document.addEventListener('DOMContentLoaded', function () {
  const scrollBtn = document.getElementById('scrollTop');

  function checkScrollPosition() {
    if (window.scrollY > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }

  checkScrollPosition();

  window.addEventListener('scroll', checkScrollPosition);

  scrollBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Elementos del slider
  const slides = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentSlide = 0;
  const totalSlides = slides.length;

  // Inicializar la funcionalidad "Ver más" para todos los testimoniales
  slides.forEach((card) => {
      // Obtener el elemento de texto
      const textElement = card.querySelector('.testimonial-text');
      
      if (textElement) {
          // Añadir la clase para truncar inicialmente 
          textElement.classList.add('truncated');
          
          // Crear el botón "Ver más"
          const readMoreBtn = document.createElement('button');
          readMoreBtn.className = 'read-more-btn';
          readMoreBtn.textContent = 'Ver más';
          
          // Insertar el botón después del texto
          textElement.parentNode.insertBefore(readMoreBtn, textElement.nextSibling);
          
          // Añadir evento de clic al botón
          readMoreBtn.addEventListener('click', function(e) {
              // Evitar que el clic afecte al slider
              e.stopPropagation();
              
              if (textElement.classList.contains('truncated')) {
                  // Expandir el texto
                  textElement.classList.remove('truncated');
                  readMoreBtn.textContent = 'Ver menos';
              } else {
                  // Colapsar el texto
                  textElement.classList.add('truncated');
                  readMoreBtn.textContent = 'Ver más';
              }
          });
      }
  });

  // Función para mostrar un slide específico
  function showSlide(index) {
      // Validar el índice
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      
      // Actualizar el slide actual
      currentSlide = index;
      
      // Ocultar todos los slides y desactivar todos los dots
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      // Mostrar el slide actual y activar el dot correspondiente
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
      
      // Evaluar si el botón "Ver más" debe mostrarse para el slide actual
      const currentTextElement = slides[currentSlide].querySelector('.testimonial-text');
      const currentReadMoreBtn = slides[currentSlide].querySelector('.read-more-btn');
      
      if (currentTextElement && currentReadMoreBtn) {
          // Hacer visible temporalmente para calcular altura real
          const originalDisplay = slides[currentSlide].style.display;
          slides[currentSlide].style.display = 'block';
          
          // Comprobar si el texto necesita el botón "Ver más"
          if (currentTextElement.scrollHeight <= currentTextElement.clientHeight) {
              currentReadMoreBtn.style.display = 'none';
          } else {
              currentReadMoreBtn.style.display = 'inline-block';
          }
          
          // Restaurar display
          slides[currentSlide].style.display = originalDisplay;
      }
  }

  // IMPORTANTE: Inicializar el slider inmediatamente
  // Primero ocultar todos los slides
  slides.forEach(slide => slide.classList.remove('active'));
  
  // Luego activar solo el primero
  if (slides.length > 0) {
      slides[0].classList.add('active');
      if (dots.length > 0) {
          dots[0].classList.add('active');
      }
      
      // Verificar botón "Ver más" para el primer slide
      setTimeout(() => {
          const firstTextElement = slides[0].querySelector('.testimonial-text');
          const firstReadMoreBtn = slides[0].querySelector('.read-more-btn');
          
          if (firstTextElement && firstReadMoreBtn) {
              if (firstTextElement.scrollHeight <= firstTextElement.clientHeight) {
                  firstReadMoreBtn.style.display = 'none';
              } else {
                  firstReadMoreBtn.style.display = 'inline-block';
              }
          }
      }, 100);
  }

  // Event listeners para los botones
  if (prevBtn) {
      prevBtn.addEventListener('click', () => {
          showSlide(currentSlide - 1);
      });
  }
  
  if (nextBtn) {
      nextBtn.addEventListener('click', () => {
          showSlide(currentSlide + 1);
      });
  }

  // Event listeners para los dots
  dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
          showSlide(index);
      });
  });
});