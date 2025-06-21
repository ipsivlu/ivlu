/**
 * Sistema de Componentes Web Optimizado
 * Enfoque modular para mejor mantenimiento y rendimiento
 */

// Configuración global y constantes
const CONFIG = {
  BREAKPOINTS: {
    mobile: 1120,
    tablet: 768
  },
  TIMINGS: {
    animation: 400,
    debounce: 150,
    autoplay: 3000,
    resize: 250
  },
  GAPS: {
    gallery: 10
  },
  MESSAGES: {
    es: "Hola. Me gustaría pedir más información de los tratamientos estéticos que vi en tu página web. Gracias",
    en: "Hello. I would like to request more information about the aesthetic treatments I saw on your website. Thank you"
  }
};

// Utilidades principales
const Utils = {
  // Debounce mejorado con cancelación
  debounce(func, wait, immediate = false) {
    let timeout;
    const debounced = function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
    
    debounced.cancel = () => {
      clearTimeout(timeout);
      timeout = null;
    };
    
    return debounced;
  },

  // Throttle para eventos de scroll
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Detección de dispositivo moderna
  getDeviceType() {
    return window.matchMedia(`(max-width: ${CONFIG.BREAKPOINTS.mobile}px)`).matches ? 'mobile' : 'desktop';
  },

  // Manejo seguro de elementos DOM
  safeQuerySelector(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.warn(`Selector inválido: ${selector}`, error);
      return null;
    }
  },

  // Animación suave usando requestAnimationFrame
  animateValue(start, end, duration, callback, easing = 'easeOutCubic') {
    const startTime = performance.now();
    const change = end - start;
    
    const easingFunctions = {
      easeOutCubic: t => 1 - Math.pow(1 - t, 3),
      easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    };
    
    const easingFunc = easingFunctions[easing] || easingFunctions.easeOutCubic;
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunc(progress);
      const currentValue = start + (change * easedProgress);
      
      callback(currentValue, progress === 1);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }
};

// Componente de Navegación
class NavigationComponent {
  constructor() {
    this.elements = this.initializeElements();
    this.state = {
      isMobileMenuOpen: false,
      activeDropdown: null,
      isMegaMenuOpen: false
    };
    
    if (this.elements.isValid) {
      this.bindEvents();
      this.initializeAccessibility();
    }
  }
  
  initializeElements() {
    const elements = {
      mobileToggle: Utils.safeQuerySelector('.mobile-nav-toggle'),
      navLinks: Utils.safeQuerySelector('.nav-links'),
      header: Utils.safeQuerySelector('#header'),
      servicesDropdown: Utils.safeQuerySelector('#services-dropdown'),
      megaMenu: Utils.safeQuerySelector('#services-megamenu'),
      dropdowns: document.querySelectorAll('.dropdown')
    };
    
    elements.isValid = elements.mobileToggle && elements.navLinks;
    return elements;
  }
  
  initializeAccessibility() {
    // Configurar ARIA attributes
    if (this.elements.mobileToggle) {
      this.elements.mobileToggle.setAttribute('aria-expanded', 'false');
      this.elements.mobileToggle.setAttribute('aria-controls', 'nav-links');
    }
    
    // Hacer dropdowns navegables por teclado
    this.elements.dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('span');
      if (trigger) {
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('role', 'button');
      }
    });
  }
  
  bindEvents() {
    // Toggle móvil
    this.elements.mobileToggle?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMobileMenu();
    });
    
    // Dropdowns con manejo de teclado
    this.elements.dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('span');
      if (trigger) {
        trigger.addEventListener('click', (e) => this.handleDropdownClick(e, dropdown));
        trigger.addEventListener('keydown', (e) => this.handleDropdownKeydown(e, dropdown));
      }
    });
    
    // Megamenú para escritorio
    if (this.elements.servicesDropdown && this.elements.megaMenu) {
      this.setupMegaMenu();
    }
    
    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    
    // Cerrar al hacer clic en enlaces
    const menuLinks = document.querySelectorAll('.nav-links a:not(.dropdown span), #services-megamenu a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => this.closeAllMenus());
    });
    
    // Manejo de resize
    window.addEventListener('resize', Utils.debounce(() => {
      this.handleResize();
    }, CONFIG.TIMINGS.resize));
    
    // Scroll header effect
    window.addEventListener('scroll', Utils.throttle(() => {
      this.handleScroll();
    }, 16)); // ~60fps
  }
  
  toggleMobileMenu() {
    this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
    
    this.elements.navLinks.classList.toggle('nav-links-mobile', this.state.isMobileMenuOpen);
    this.elements.mobileToggle.classList.toggle('active', this.state.isMobileMenuOpen);
    this.elements.mobileToggle.setAttribute('aria-expanded', this.state.isMobileMenuOpen);
    
    if (this.state.isMobileMenuOpen) {
      this.closeAllDropdowns();
    }
  }
  
  handleDropdownClick(e, dropdown) {
    if (Utils.getDeviceType() === 'mobile') {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown(dropdown);
    }
  }
  
  handleDropdownKeydown(e, dropdown) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggleDropdown(dropdown);
    } else if (e.key === 'Escape') {
      this.closeAllDropdowns();
      e.target.blur();
    }
  }
  
  toggleDropdown(dropdown) {
    const isActive = dropdown.classList.contains('active');
    
    // Cerrar otros dropdowns
    this.elements.dropdowns.forEach(otherDropdown => {
      if (otherDropdown !== dropdown) {
        otherDropdown.classList.remove('active');
      }
    });
    
    // Toggle actual dropdown
    dropdown.classList.toggle('active', !isActive);
    this.state.activeDropdown = !isActive ? dropdown : null;
    
    // Manejo especial del megamenú
    if (dropdown.id === 'services-dropdown') {
      this.toggleMegaMenu(!isActive);
    } else if (this.elements.megaMenu) {
      this.closeMegaMenu();
    }
  }
  
  setupMegaMenu() {
    if (Utils.getDeviceType() === 'desktop') {
      this.elements.servicesDropdown.addEventListener('mouseenter', () => {
        this.openMegaMenu();
      });
      
      this.elements.servicesDropdown.addEventListener('mouseleave', (e) => {
        this.handleMegaMenuMouseLeave(e);
      });
      
      this.elements.megaMenu.addEventListener('mouseenter', () => {
        this.openMegaMenu();
      });
      
      this.elements.megaMenu.addEventListener('mouseleave', () => {
        this.closeMegaMenu();
      });
    }
  }
  
  openMegaMenu() {
    if (Utils.getDeviceType() === 'desktop' && this.elements.megaMenu) {
      this.elements.megaMenu.style.display = 'block';
      requestAnimationFrame(() => {
        this.elements.megaMenu.style.opacity = '1';
        this.elements.megaMenu.style.transform = 'translateY(0)';
      });
      this.state.isMegaMenuOpen = true;
    }
  }
  
  closeMegaMenu() {
    if (this.elements.megaMenu && this.state.isMegaMenuOpen) {
      this.elements.megaMenu.style.opacity = '0';
      this.elements.megaMenu.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        if (this.elements.megaMenu) {
          this.elements.megaMenu.style.display = 'none';
        }
      }, CONFIG.TIMINGS.animation);
      
      this.state.isMegaMenuOpen = false;
    }
  }
  
  toggleMegaMenu(show) {
    if (Utils.getDeviceType() === 'mobile' && this.elements.megaMenu) {
      this.elements.megaMenu.style.display = show ? 'block' : 'none';
    }
  }
  
  handleMegaMenuMouseLeave(e) {
    if (Utils.getDeviceType() === 'desktop') {
      const megaRect = this.elements.megaMenu.getBoundingClientRect();
      if (!(e.clientY >= megaRect.top - 20)) {
        this.closeMegaMenu();
      }
    }
  }
  
  closeAllDropdowns() {
    this.elements.dropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
    });
    this.state.activeDropdown = null;
  }
  
  closeAllMenus() {
    if (this.state.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
    this.closeAllDropdowns();
    this.closeMegaMenu();
  }
  
  handleOutsideClick(e) {
    if (!e.target.closest('.nav-links') && 
        !e.target.closest('.mobile-nav-toggle') && 
        !e.target.closest('#services-megamenu')) {
      this.closeAllMenus();
    }
  }
  
  handleResize() {
    const deviceType = Utils.getDeviceType();
    
    if (deviceType === 'desktop') {
      // Reset mobile states
      if (this.state.isMobileMenuOpen) {
        this.elements.navLinks.classList.remove('nav-links-mobile');
        this.elements.mobileToggle.classList.remove('active');
        this.elements.mobileToggle.setAttribute('aria-expanded', 'false');
        this.state.isMobileMenuOpen = false;
      }
      
      this.closeAllDropdowns();
      this.closeMegaMenu();
    } else {
      // Mobile mode
      if (this.elements.megaMenu && this.state.activeDropdown?.id !== 'services-dropdown') {
        this.elements.megaMenu.style.display = 'none';
      }
    }
  }
  
  handleScroll() {
    if (this.elements.header) {
      const shouldAddScrolled = window.scrollY > 0;
      this.elements.header.classList.toggle('scrolled', shouldAddScrolled);
    }
  }
}

// Componente de Galería
class GalleryComponent {
  constructor(element) {
    this.gallery = element;
    this.elements = this.initializeElements();
    this.state = {
      currentIndex: 0,
      isAnimating: false,
      userScrolling: false,
      autoplayInterval: null
    };
    
    if (this.elements.isValid) {
      this.bindEvents();
      this.initialize();
    }
  }
  
  initializeElements() {
    const elements = {
      container: this.gallery.querySelector('.gallery-images'),
      indicators: this.gallery.querySelectorAll('.indicator'),
      prevBtn: this.gallery.querySelector('.gallery-prev'),
      nextBtn: this.gallery.querySelector('.gallery-next'),
      items: this.gallery.querySelectorAll('.gallery-item')
    };
    
    elements.isValid = elements.container && elements.items.length > 0;
    return elements;
  }
  
  initialize() {
    this.updateIndicators();
    this.setupAccessibility();
    
    // Configurar autoplay si se desea
    // this.startAutoplay();
  }
  
  setupAccessibility() {
    this.elements.container.setAttribute('tabindex', '0');
    this.elements.container.setAttribute('role', 'region');
    this.elements.container.setAttribute('aria-label', 'Galería de imágenes');
    
    // Agregar ARIA labels a los botones
    if (this.elements.prevBtn) {
      this.elements.prevBtn.setAttribute('aria-label', 'Imagen anterior');
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.setAttribute('aria-label', 'Siguiente imagen');
    }
  }
  
  bindEvents() {
    // Botones de navegación
    this.elements.prevBtn?.addEventListener('click', () => this.moveOne('prev'));
    this.elements.nextBtn?.addEventListener('click', () => this.moveOne('next'));
    
    // Indicadores
    this.elements.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.scrollToItem(index * this.getVisibleItems(), true));
    });
    
    // Scroll manual con debounce
    const debouncedScrollHandler = Utils.debounce(() => {
      if (this.state.userScrolling && !this.state.isAnimating) {
        this.syncCurrentIndex();
      }
      this.state.userScrolling = false;
    }, CONFIG.TIMINGS.debounce);
    
    this.elements.container.addEventListener('scroll', () => {
      if (!this.state.isAnimating) {
        this.state.userScrolling = true;
        debouncedScrollHandler();
      }
    });
    
    // Soporte táctil mejorado
    this.setupTouchSupport();
    
    // Navegación por teclado
    this.setupKeyboardNavigation();
    
    // Resize con debounce
    window.addEventListener('resize', Utils.debounce(() => {
      this.handleResize();
    }, CONFIG.TIMINGS.resize));
    
    // Pausar animaciones cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.state.isAnimating = false;
        this.stopAutoplay();
      } else {
        // this.startAutoplay();
      }
    });
  }
  
  setupTouchSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;
    
    this.elements.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartTime = Date.now();
      this.state.userScrolling = true;
      this.stopAutoplay();
    }, { passive: true });
    
    this.elements.container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const touchDuration = Date.now() - touchStartTime;
      
      if (touchDuration < 300) {
        this.handleSwipe(touchStartX, touchEndX);
      }
      
      this.state.userScrolling = false;
      // this.startAutoplay();
    }, { passive: true });
  }
  
  setupKeyboardNavigation() {
    this.elements.container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          this.moveOne('next');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.moveOne('prev');
          break;
        case 'Home':
          e.preventDefault();
          this.scrollToItem(0, true);
          break;
        case 'End':
          e.preventDefault();
          this.scrollToItem(this.getMaxIndex(), true);
          break;
      }
    });
  }
  
  handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const swipeDistance = endX - startX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance < 0) {
        this.moveOne('next');
      } else {
        this.moveOne('prev');
      }
    }
  }
  
  getVisibleItems() {
    const containerWidth = this.elements.container.offsetWidth;
    const itemWidth = this.elements.items[0]?.offsetWidth || 0;
    return Math.floor(containerWidth / itemWidth) || 1;
  }
  
  getMaxIndex() {
    const visibleItems = this.getVisibleItems();
    return Math.max(0, this.elements.items.length - visibleItems);
  }
  
  moveOne(direction) {
    if (this.state.isAnimating) return;
    
    const maxIndex = this.getMaxIndex();
    let newIndex;
    
    if (direction === 'next') {
      newIndex = Math.min(this.state.currentIndex + 1, maxIndex);
    } else {
      newIndex = Math.max(this.state.currentIndex - 1, 0);
    }
    
    this.scrollToItem(newIndex, true);
  }
  
  scrollToItem(index, smooth = true) {
    if (this.state.isAnimating || index === this.state.currentIndex) return;
    
    const maxIndex = this.getMaxIndex();
    index = Math.max(0, Math.min(index, maxIndex));
    
    this.state.currentIndex = index;
    
    const itemWidth = this.elements.items[0].offsetWidth;
    const scrollPosition = index * (itemWidth + CONFIG.GAPS.gallery);
    
    if (smooth) {
      this.state.isAnimating = true;
      
      Utils.animateValue(
        this.elements.container.scrollLeft,
        scrollPosition,
        CONFIG.TIMINGS.animation,
        (value, isComplete) => {
          this.elements.container.scrollLeft = value;
          if (isComplete) {
            this.state.isAnimating = false;
          }
        }
      );
    } else {
      this.elements.container.scrollLeft = scrollPosition;
    }
    
    this.updateIndicators();
  }
  
  syncCurrentIndex() {
    const itemWidth = this.elements.items[0].offsetWidth;
    const scrollLeft = this.elements.container.scrollLeft;
    const newIndex = Math.round(scrollLeft / (itemWidth + CONFIG.GAPS.gallery));
    const maxIndex = this.getMaxIndex();
    
    if (newIndex !== this.state.currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
      this.state.currentIndex = newIndex;
      this.updateIndicators();
    }
  }
  
  updateIndicators() {
    if (!this.elements.indicators.length) return;
    
    const visibleItems = this.getVisibleItems();
    const indicatorIndex = Math.floor(this.state.currentIndex / visibleItems);
    
    this.elements.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === indicatorIndex);
    });
  }
  
  handleResize() {
    const maxIndex = this.getMaxIndex();
    if (this.state.currentIndex > maxIndex) {
      this.scrollToItem(maxIndex, false);
    } else {
      this.updateIndicators();
    }
  }
  
  startAutoplay() {
    this.stopAutoplay();
    this.state.autoplayInterval = setInterval(() => {
      if (!this.state.isAnimating && !this.state.userScrolling) {
        const maxIndex = this.getMaxIndex();
        const nextIndex = this.state.currentIndex >= maxIndex ? 0 : this.state.currentIndex + 1;
        this.scrollToItem(nextIndex, true);
      }
    }, CONFIG.TIMINGS.autoplay);
  }
  
  stopAutoplay() {
    if (this.state.autoplayInterval) {
      clearInterval(this.state.autoplayInterval);
      this.state.autoplayInterval = null;
    }
  }
}

// Componente de WhatsApp
class WhatsAppComponent {
  constructor() {
    this.deviceType = this.detectDevice();
    this.pageLanguage = this.detectLanguage();
    this.setupWhatsAppLinks();
  }
  
  detectDevice() {
    return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
  }
  
  detectLanguage() {
    return document.documentElement.lang || 
           (window.location.pathname.includes('/en/') ? 'en' : 'es');
  }
  
  setupWhatsAppLinks() {
    const message = CONFIG.MESSAGES[this.pageLanguage] || CONFIG.MESSAGES.es;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '573228351465';
    
    const links = {
      mobile: `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      desktop: `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`
    };
    
    const whatsappLinks = document.querySelectorAll('a#lead_whatsapp');
    whatsappLinks.forEach(link => {
      link.setAttribute('href', links[this.deviceType]);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }
}

// Componente de Scroll to Top
class ScrollToTopComponent {
  constructor() {
    this.button = Utils.safeQuerySelector('#scrollTop');
    if (this.button) {
      this.bindEvents();
      this.checkInitialPosition();
    }
  }
  
  bindEvents() {
    const throttledScroll = Utils.throttle(() => {
      this.checkScrollPosition();
    }, 16);
    
    window.addEventListener('scroll', throttledScroll);
    
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollToTop();
    });
  }
  
  checkInitialPosition() {
    this.checkScrollPosition();
  }
  
  checkScrollPosition() {
    const shouldShow = window.scrollY > 300;
    this.button.classList.toggle('visible', shouldShow);
  }
  
  scrollToTop() {
    Utils.animateValue(
      window.scrollY,
      0,
      CONFIG.TIMINGS.animation * 2,
      (value) => {
        window.scrollTo(0, value);
      }
    );
  }
}

// Componente de Testimoniales
class TestimonialComponent {
  constructor() {
    this.elements = this.initializeElements();
    this.state = {
      currentSlide: 0,
      totalSlides: this.elements.slides.length
    };
    
    if (this.elements.isValid) {
      this.initializeReadMore();
      this.bindEvents();
      this.showSlide(0);
    }
  }
  
  initializeElements() {
    const elements = {
      slides: document.querySelectorAll('.testimonial-card'),
      dots: document.querySelectorAll('.dot'),
      prevBtn: Utils.safeQuerySelector('.prev-btn'),
      nextBtn: Utils.safeQuerySelector('.next-btn')
    };
    
    elements.isValid = elements.slides.length > 0;
    return elements;
  }
  
  initializeReadMore() {
    this.elements.slides.forEach((card) => {
      const textElement = card.querySelector('.testimonial-text');
      if (!textElement) return;
      
      textElement.classList.add('truncated');
      
      const readMoreBtn = document.createElement('button');
      readMoreBtn.className = 'read-more-btn';
      readMoreBtn.textContent = 'Ver más';
      readMoreBtn.setAttribute('aria-label', 'Expandir testimonio');
      
      textElement.parentNode.insertBefore(readMoreBtn, textElement.nextSibling);
      
      readMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleReadMore(textElement, readMoreBtn);
      });
    });
  }
  
  toggleReadMore(textElement, button) {
    const isExpanded = !textElement.classList.contains('truncated');
    
    textElement.classList.toggle('truncated', isExpanded);
    button.textContent = isExpanded ? 'Ver más' : 'Ver menos';
    button.setAttribute('aria-label', isExpanded ? 'Expandir testimonio' : 'Contraer testimonio');
  }
  
  bindEvents() {
    this.elements.prevBtn?.addEventListener('click', () => {
      this.showSlide(this.state.currentSlide - 1);
    });
    
    this.elements.nextBtn?.addEventListener('click', () => {
      this.showSlide(this.state.currentSlide + 1);
    });
    
    this.elements.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.showSlide(index);
      });
    });
  }
  
  showSlide(index) {
    // Normalizar índice
    if (index < 0) index = this.state.totalSlides - 1;
    if (index >= this.state.totalSlides) index = 0;
    
    this.state.currentSlide = index;
    
    // Actualizar visualización
    this.elements.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    
    this.elements.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Verificar botón "Ver más" para el slide actual
    this.checkReadMoreVisibility(this.elements.slides[index]);
  }
  
  checkReadMoreVisibility(slide) {
    const textElement = slide.querySelector('.testimonial-text');
    const readMoreBtn = slide.querySelector('.read-more-btn');
    
    if (textElement && readMoreBtn) {
      // Usar intersection observer o verificación de altura
      requestAnimationFrame(() => {
        const needsButton = textElement.scrollHeight > textElement.clientHeight;
        readMoreBtn.style.display = needsButton ? 'inline-block' : 'none';
      });
    }
  }
}

// Sistema de inicialización principal
class WebApp {
  constructor() {
    this.components = new Map();
    this.isInitialized = false;
  }
  
  init() {
    if (this.isInitialized) return;
    
    try {
      // Inicializar componentes en orden
      this.components.set('navigation', new NavigationComponent());
      this.components.set('whatsapp', new WhatsAppComponent());
      this.components.set('scrollTop', new ScrollToTopComponent());
      this.components.set('testimonials', new TestimonialComponent());
      
      // Inicializar galerías
      const galleries = document.querySelectorAll('.gallery');
      galleries.forEach((gallery, index) => {
        this.components.set(`gallery-${index}`, new GalleryComponent(gallery));
      });
      
      this.isInitialized = true;
      console.log('✅ WebApp inicializada correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando WebApp:', error);
    }
  }
  
  destroy() {
    // Limpiar event listeners y recursos
    this.components.forEach(component => {
      if (component.destroy && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components.clear();
    this.isInitialized = false;
  }
}

// Inicialización
const app = new WebApp();

// Usar DOMContentLoaded una sola vez
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Cleanup global
window.addEventListener('beforeunload', () => app.destroy());