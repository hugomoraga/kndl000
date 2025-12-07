// Infinite scroll para el collage del home
(function() {
  'use strict';

  // Configuración
  const INITIAL_LOAD = 12; // Imágenes iniciales
  const LOAD_MORE = 12; // Imágenes a cargar cada vez
  const THRESHOLD = 200; // Píxeles antes del final para cargar más

  function initInfiniteScroll() {
    const collage = document.querySelector('.collage');
    if (!collage) return;

    // Contar todas las imágenes visibles inicialmente (las de assemblage manual)
    const allImages = collage.querySelectorAll('.image-effect');
    const visibleImages = Array.from(allImages).filter(img => 
      img.style.display !== 'none' && !img.classList.contains('lazy-image')
    );
    const lazyImages = collage.querySelectorAll('.lazy-image');
    
    // Si no hay imágenes lazy, no hacer nada
    if (lazyImages.length === 0) return;
    
    // Si hay menos imágenes lazy que el límite inicial, mostrarlas todas
    if (lazyImages.length <= INITIAL_LOAD) {
      lazyImages.forEach(img => {
        img.style.display = '';
      });
      return;
    }

    let currentIndex = INITIAL_LOAD;

    // Función para cargar más imágenes
    function loadMoreImages() {
      const imagesToShow = Array.from(lazyImages).slice(
        currentIndex,
        currentIndex + LOAD_MORE
      );

      if (imagesToShow.length === 0) {
        return false; // No hay más imágenes
      }

      // Mostrar imágenes con animación suave
      imagesToShow.forEach((img, i) => {
        setTimeout(() => {
          img.style.display = '';
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.5s ease-in';
          
          // Trigger reflow para que la transición funcione
          img.offsetHeight;
          
          img.style.opacity = '1';
        }, i * 50); // Stagger animation
      });

      currentIndex += imagesToShow.length;
      return imagesToShow.length === LOAD_MORE; // Hay más imágenes
    }

    // Intersection Observer para detectar cuando el usuario se acerca al final
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const hasMore = loadMoreImages();
            if (!hasMore) {
              observer.disconnect();
            }
          }
        });
      },
      {
        rootMargin: `${THRESHOLD}px`,
        threshold: 0.1
      }
    );

    // Crear un elemento sentinela al final del collage
    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    sentinel.style.height = '1px';
    sentinel.style.width = '100%';
    sentinel.style.visibility = 'hidden';
    collage.appendChild(sentinel);

    // Observar el sentinela
    observer.observe(sentinel);

    // También cargar más al hacer scroll manual (fallback)
    let isLoading = false;
    window.addEventListener('scroll', () => {
      if (isLoading) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Si estamos cerca del final (200px)
      if (scrollTop + windowHeight >= documentHeight - THRESHOLD) {
        isLoading = true;
        const hasMore = loadMoreImages();
        if (!hasMore) {
          window.removeEventListener('scroll', arguments.callee);
        }
        setTimeout(() => {
          isLoading = false;
        }, 500);
      }
    }, { passive: true });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInfiniteScroll);
  } else {
    initInfiniteScroll();
  }
})();

