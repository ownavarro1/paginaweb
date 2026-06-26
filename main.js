/* =============================================
   J&O Suministros — main.js
   Menú móvil, formulario, accesibilidad
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     BARRA DE ACCESIBILIDAD — WCAG 1.4.4 / 1.4.3
     ============================================= */

  const html = document.documentElement;

  // --- Tamaño de texto ---
  const fontBtns = {
    normal:  document.getElementById('font-normal'),
    mediano: document.getElementById('font-mediano'),
    grande:  document.getElementById('font-grande'),
  };

  function setFont(size) {
    html.dataset.font = size === 'normal' ? '' : size;
    if (size === 'normal') delete html.dataset.font;
    localStorage.setItem('jo-font', size);
    Object.keys(fontBtns).forEach(k => {
      if (fontBtns[k]) fontBtns[k].setAttribute('aria-pressed', k === size ? 'true' : 'false');
    });
  }

  if (fontBtns.normal)  fontBtns.normal.addEventListener('click',  () => setFont('normal'));
  if (fontBtns.mediano) fontBtns.mediano.addEventListener('click', () => setFont('mediano'));
  if (fontBtns.grande)  fontBtns.grande.addEventListener('click',  () => setFont('grande'));

  // --- Modo nocturno ---
  const btnTema   = document.getElementById('btn-tema');
  const iconLuna  = btnTema?.querySelector('.icon-luna');
  const iconSol   = btnTema?.querySelector('.icon-sol');

  function setTema(nocturno) {
    if (nocturno) {
      html.dataset.tema = 'nocturno';
      if (iconLuna) iconLuna.style.display = 'none';
      if (iconSol)  iconSol.style.display  = '';
      if (btnTema)  { btnTema.setAttribute('aria-pressed','true'); btnTema.setAttribute('aria-label','Desactivar modo nocturno'); }
    } else {
      delete html.dataset.tema;
      if (iconLuna) iconLuna.style.display = '';
      if (iconSol)  iconSol.style.display  = 'none';
      if (btnTema)  { btnTema.setAttribute('aria-pressed','false'); btnTema.setAttribute('aria-label','Activar modo nocturno'); }
    }
    localStorage.setItem('jo-tema', nocturno ? 'nocturno' : 'claro');
  }

  if (btnTema) btnTema.addEventListener('click', () => setTema(html.dataset.tema !== 'nocturno'));

  // --- Alto contraste ---
  const btnContraste = document.getElementById('btn-contraste');
  function setContraste(alto) {
    if (alto) { html.dataset.contraste = 'alto'; }
    else { delete html.dataset.contraste; }
    if (btnContraste) btnContraste.setAttribute('aria-pressed', alto ? 'true' : 'false');
    localStorage.setItem('jo-contraste', alto ? 'alto' : '');
  }
  if (btnContraste) btnContraste.addEventListener('click', () => setContraste(html.dataset.contraste !== 'alto'));

  // --- Subrayar enlaces ---
  const btnEnlaces = document.getElementById('btn-enlaces');
  function setEnlaces(sub) {
    if (sub) { html.dataset.enlaces = 'subrayados'; }
    else { delete html.dataset.enlaces; }
    if (btnEnlaces) btnEnlaces.setAttribute('aria-pressed', sub ? 'true' : 'false');
    localStorage.setItem('jo-enlaces', sub ? 'subrayados' : '');
  }
  if (btnEnlaces) btnEnlaces.addEventListener('click', () => setEnlaces(html.dataset.enlaces !== 'subrayados'));

  // --- Restablecer ---
  const btnReset = document.getElementById('btn-reset-acc');
  if (btnReset) btnReset.addEventListener('click', () => {
    setFont('normal');
    setTema(false);
    setContraste(false);
    setEnlaces(false);
    ['jo-font','jo-tema','jo-contraste','jo-enlaces'].forEach(k => localStorage.removeItem(k));
  });

  // --- Restaurar preferencias guardadas ---
  const savedFont      = localStorage.getItem('jo-font');
  const savedTema      = localStorage.getItem('jo-tema');
  const savedContraste = localStorage.getItem('jo-contraste');
  const savedEnlaces   = localStorage.getItem('jo-enlaces');
  if (savedFont)      setFont(savedFont);
  if (savedTema === 'nocturno') setTema(true);
  if (savedContraste === 'alto') setContraste(true);
  if (savedEnlaces === 'subrayados') setEnlaces(true);

  // Detectar preferencia del sistema operativo (modo oscuro)
  if (!savedTema && window.matchMedia('(prefers-color-scheme: dark)').matches) setTema(true);

  /* --- Menú hamburguesa --- */
  const toggle = document.getElementById('menu-toggle');
  const menuMovil = document.getElementById('menu-movil');

  if (toggle && menuMovil) {
    toggle.addEventListener('click', () => {
      const abierto = menuMovil.classList.toggle('abierto');
      toggle.setAttribute('aria-expanded', abierto);
      menuMovil.setAttribute('aria-hidden', !abierto);
    });

    // Cierra menú al hacer clic en un enlace
    menuMovil.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuMovil.classList.remove('abierto');
        toggle.setAttribute('aria-expanded', 'false');
        menuMovil.setAttribute('aria-hidden', 'true');
      });
    });

    // Cierra menú con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuMovil.classList.contains('abierto')) {
        menuMovil.classList.remove('abierto');
        toggle.setAttribute('aria-expanded', 'false');
        menuMovil.setAttribute('aria-hidden', 'true');
        toggle.focus();
      }
    });
  }

  /* --- Año dinámico en footer --- */
  const yearEl = document.getElementById('anio');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Navegación activa por sección (IntersectionObserver) --- */
  const secciones = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.navbar__nav a[href^="#"], .navbar__menu-movil a[href^="#"]');

  if (secciones.length && navLinks.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const activo = link.getAttribute('href') === '#' + entry.target.id;
            link.setAttribute('aria-current', activo ? 'page' : 'false');
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    secciones.forEach(s => observer.observe(s));
  }

  /* --- Validación del formulario de contacto --- */
  const form = document.getElementById('form-contacto');
  if (form) {
    const campos = {
      nombre:   { min: 2, msg: 'Por favor ingresa tu nombre (mínimo 2 caracteres).' },
      email:    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Ingresa un correo electrónico válido.' },
      asunto:   { min: 1, msg: 'Selecciona el asunto de tu consulta.' },
      mensaje:  { min: 10, msg: 'El mensaje debe tener al menos 10 caracteres.' },
      politica: { check: true, msg: 'Debes aceptar la política de privacidad para continuar.' },
    };

    function validarCampo(id) {
      const grupo = document.getElementById('grupo-' + id);
      const input = document.getElementById(id === 'politica' ? 'acepta-politica' : id);
      const regla = campos[id];
      if (!grupo || !input) return true;

      let valido = true;
      if (regla.check) {
        valido = input.checked;
      } else {
        const val = input.value.trim();
        if (regla.min !== undefined) valido = val.length >= regla.min;
        if (regla.pattern) valido = regla.pattern.test(val);
      }

      grupo.classList.toggle('error', !valido);
      input.setAttribute('aria-invalid', !valido);
      return valido;
    }

    // Validación en tiempo real al salir del campo
    Object.keys(campos).forEach(id => {
      const elId = id === 'politica' ? 'acepta-politica' : id;
      const input = document.getElementById(elId);
      if (input) {
        const evento = campos[id].check ? 'change' : 'blur';
        input.addEventListener(evento, () => validarCampo(id));
        if (!campos[id].check) {
          input.addEventListener('input', () => {
            if (document.getElementById('grupo-' + id)?.classList.contains('error')) validarCampo(id);
          });
        }
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const todosValidos = Object.keys(campos).map(validarCampo).every(Boolean);

      if (!todosValidos) {
        // Lleva el foco al primer campo con error
        const primerError = form.querySelector('.error input, .error textarea, .error select');
        if (primerError) primerError.focus();
        return;
      }

      // Construir mensaje de WhatsApp
      const nombre  = document.getElementById('nombre').value.trim();
      const email   = document.getElementById('email').value.trim();
      const asunto  = document.getElementById('asunto').value;
      const mensaje = document.getElementById('mensaje').value.trim();

      const texto = `Hola J&O Suministros, mi nombre es *${nombre}*.\n\n*Asunto:* ${asunto}\n*Correo:* ${email}\n\n${mensaje}`;
      const url = `https://wa.me/573106764906?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank', 'noopener,noreferrer');

      // Mensaje de éxito visible — WCAG 4.1.3
      const exito = document.getElementById('form-exito');
      if (exito) {
        exito.removeAttribute('hidden');
        exito.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        exito.focus();
      }

      form.reset();
      Object.keys(campos).forEach(id => {
        const g = document.getElementById('grupo-' + id);
        if (g) g.classList.remove('error');
      });

      // Ocultar mensaje de éxito tras 8 segundos
      setTimeout(() => { if (exito) exito.setAttribute('hidden', ''); }, 8000);
    });
  }

  /* --- Toast --- */
  function mostrarToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3500);
  }

  /* --- Carrusel hero --- */
  const track     = document.getElementById('carrusel-track');
  const dotsWrap  = document.getElementById('carrusel-dots');
  const progress  = document.getElementById('carrusel-progress');
  const btnPrev   = document.getElementById('carr-prev');
  const btnNext   = document.getElementById('carr-next');

  if (track && dotsWrap) {
    const slides = Array.from(track.querySelectorAll('.carrusel__slide'));
    const DURACION = 4500; // ms por slide
    let actual = 0;
    let timer = null;
    let progTimer = null;
    const prefMenos = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Crear dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carrusel__dot' + (i === 0 ? ' activo' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a línea de producto ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => irA(i));
      dotsWrap.appendChild(dot);
    });

    function activarSlide(idx, direccion = 'next') {
      const anterior = slides[actual];
      anterior.classList.remove('activo');
      anterior.classList.add('saliendo');
      setTimeout(() => anterior.classList.remove('saliendo'), 450);

      actual = (idx + slides.length) % slides.length;
      slides[actual].classList.add('activo');

      // Actualizar dots
      dotsWrap.querySelectorAll('.carrusel__dot').forEach((d, i) => {
        d.classList.toggle('activo', i === actual);
        d.setAttribute('aria-selected', i === actual ? 'true' : 'false');
      });

      // Anuncio para lectores de pantalla
      track.setAttribute('aria-label', slides[actual].getAttribute('aria-label'));
    }

    function irA(idx) {
      if (idx === actual) return;
      activarSlide(idx);
      reiniciarAutoplay();
    }

    function siguiente() { activarSlide(actual + 1); }
    function anterior()  { activarSlide(actual - 1); }

    function iniciarBarra() {
      if (prefMenos || !progress) return;
      progress.style.transition = 'none';
      progress.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progress.style.transition = `width ${DURACION}ms linear`;
          progress.style.width = '100%';
        });
      });
    }

    function reiniciarAutoplay() {
      clearInterval(timer);
      iniciarBarra();
      if (!prefMenos) {
        timer = setInterval(() => { siguiente(); iniciarBarra(); }, DURACION);
      }
    }

    // Inicializar primer slide
    slides[0].classList.add('activo');
    reiniciarAutoplay();

    // Controles
    btnPrev.addEventListener('click', () => { anterior(); reiniciarAutoplay(); });
    btnNext.addEventListener('click', () => { siguiente(); reiniciarAutoplay(); });

    // Teclado (accesibilidad)
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { anterior(); reiniciarAutoplay(); }
      if (e.key === 'ArrowRight') { siguiente(); reiniciarAutoplay(); }
    });

    // Pausar al hacer hover
    const carruselEl = track.closest('.carrusel');
    if (carruselEl) {
      carruselEl.addEventListener('mouseenter', () => {
        clearInterval(timer);
        if (progress) { progress.style.transition = 'none'; }
      });
      carruselEl.addEventListener('mouseleave', reiniciarAutoplay);
    }

    // Swipe en móvil
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? siguiente() : anterior();
        reiniciarAutoplay();
      }
    });
  }

  /* --- Carrusel PRODUCTOS (3 items por slide) --- */
  const prodTrack = document.getElementById('productos-track');
  const prodDotsWrap = document.getElementById('productos-dots');
  const prodBtnPrev = document.getElementById('prod-prev');
  const prodBtnNext = document.getElementById('prod-next');

  if (prodTrack && prodDotsWrap && prodBtnPrev && prodBtnNext) {
    const prodSlides = Array.from(prodTrack.querySelectorAll('.productos__slide'));
    let prodActual = 0;
    const PROD_DUR = 5000;
    let prodTimer = null;

    // Crear dots
    prodSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'productos__dot' + (i === 0 ? ' activo' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a grupo ${i + 1} de productos`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => irAProductos(i));
      prodDotsWrap.appendChild(dot);
    });

    function activarSlideProductos(idx) {
      const anterior = prodSlides[prodActual];
      anterior.classList.remove('activo');
      anterior.classList.add('saliendo');
      setTimeout(() => anterior.classList.remove('saliendo'), 500);

      prodActual = (idx + prodSlides.length) % prodSlides.length;
      prodSlides[prodActual].classList.add('activo');

      prodDotsWrap.querySelectorAll('.productos__dot').forEach((d, i) => {
        d.classList.toggle('activo', i === prodActual);
        d.setAttribute('aria-selected', i === prodActual ? 'true' : 'false');
      });
    }

    function iniciarAutoplayProductos() {
      clearInterval(prodTimer);
      if (!reduceMotion) {
        prodTimer = setInterval(() => activarSlideProductos(prodActual + 1), PROD_DUR);
      }
    }

    function irAProductos(idx) {
      if (idx !== prodActual) {
        activarSlideProductos(idx);
        iniciarAutoplayProductos();
      }
    }

    function siguienteProductos() { activarSlideProductos(prodActual + 1); iniciarAutoplayProductos(); }
    function anteriorProductos() { activarSlideProductos(prodActual - 1); iniciarAutoplayProductos(); }

    prodSlides[0].classList.add('activo');
    iniciarAutoplayProductos();

    prodBtnPrev.addEventListener('click', anteriorProductos);
    prodBtnNext.addEventListener('click', siguienteProductos);

    const prodCarrusel = prodTrack.closest('.productos');
    if (prodCarrusel) {
      prodCarrusel.addEventListener('mouseenter', () => clearInterval(prodTimer));
      prodCarrusel.addEventListener('mouseleave', iniciarAutoplayProductos);
    }
  }

  /* --- Carrusel SECTORES (4 items por slide) --- */
  const sectTrack = document.getElementById('sectores-track');
  const sectDotsWrap = document.getElementById('sectores-dots');
  const sectBtnPrev = document.getElementById('sect-prev');
  const sectBtnNext = document.getElementById('sect-next');

  if (sectTrack && sectDotsWrap && sectBtnPrev && sectBtnNext) {
    const sectSlides = Array.from(sectTrack.querySelectorAll('.sectores__slide'));
    let sectActual = 0;
    const SECT_DUR = 5000;
    let sectTimer = null;

    // Crear dots
    sectSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'sectores__dot' + (i === 0 ? ' activo' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a grupo ${i + 1} de sectores`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => irASectores(i));
      sectDotsWrap.appendChild(dot);
    });

    function activarSlideSectores(idx) {
      const anterior = sectSlides[sectActual];
      anterior.classList.remove('activo');
      anterior.classList.add('saliendo');
      setTimeout(() => anterior.classList.remove('saliendo'), 500);

      sectActual = (idx + sectSlides.length) % sectSlides.length;
      sectSlides[sectActual].classList.add('activo');

      sectDotsWrap.querySelectorAll('.sectores__dot').forEach((d, i) => {
        d.classList.toggle('activo', i === sectActual);
        d.setAttribute('aria-selected', i === sectActual ? 'true' : 'false');
      });
    }

    function irASectores(idx) {
      if (idx !== sectActual) {
        activarSlideSectores(idx);
        iniciarAutoplaySectores();
      }
    }

    function iniciarAutoplaySectores() {
      clearInterval(sectTimer);
      if (!reduceMotion) {
        sectTimer = setInterval(() => activarSlideSectores(sectActual + 1), SECT_DUR);
      }
    }

    function siguienteSectores() { activarSlideSectores(sectActual + 1); iniciarAutoplaySectores(); }
    function anteriorSectores() { activarSlideSectores(sectActual - 1); iniciarAutoplaySectores(); }

    sectSlides[0].classList.add('activo');
    iniciarAutoplaySectores();

    sectBtnPrev.addEventListener('click', anteriorSectores);
    sectBtnNext.addEventListener('click', siguienteSectores);

    const sectCarrusel = sectTrack.closest('.sectores');
    if (sectCarrusel) {
      sectCarrusel.addEventListener('mouseenter', () => clearInterval(sectTimer));
      sectCarrusel.addEventListener('mouseleave', iniciarAutoplaySectores);
    }
  }

  /* --- Animación de entrada suave (respeta prefers-reduced-motion) --- */
  if (!reduceMotion) {
    const animables = document.querySelectorAll(
      '.producto-card, .ventaja-card, .paso, .sector-tag, .stat-card'
    );
    const anim = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          anim.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animables.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .4s ease, transform .4s ease';
      anim.observe(el);
    });
  }

});
