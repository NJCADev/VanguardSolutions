/* ============================================================
   VANGUARD SOLUTIONS — HEADER JS
   ============================================================ */

/**
 * Inyecta el header en el DOM y aplica lógica de navegación.
 * @param {string} activePage - Identificador de la página activa.
 */
async function loadHeader(activePage = '') {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;

  try {
    // Calcular ruta relativa al componente
    const depth = getPathDepth();
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    const response = await fetch(`${prefix}components/header.html`);
    if (!response.ok) throw new Error('No se pudo cargar header.html');
    const html = await response.text();

    // Ajustar rutas internas si es necesario
    const adjusted = adjustPaths(html, depth);
    placeholder.innerHTML = adjusted;

    initHeader(activePage);
  } catch (err) {
    console.warn('Header load error:', err);
    // Fallback: insertar header mínimo
    placeholder.innerHTML = `<header class="site-header" id="site-header" style="position:fixed;top:0;left:0;right:0;height:72px;background:rgba(5,5,8,.95);z-index:1000;display:flex;align-items:center;padding:0 2rem;"><span style="font-family:Orbitron,monospace;color:#00F0FF;font-size:1.1rem">Vanguard Solutions</span></header>`;
  }
}

/**
 * Determina cuántos niveles de profundidad tiene la página actual.
 */
function getPathDepth() {
  const knownFolders = ['home', 'services', 'products', 'proyects', 'contact', 'blog', 'blogs'];
  const path = window.location.pathname.toLowerCase();

  // Método 1: pathname con slashes (Firebase / servidor)
  const parts = path.split('/').filter(Boolean);
  const parentFolder = parts[parts.length - 2] || '';
  if (knownFolders.includes(parentFolder)) return 1;

  // Método 2: buscar el nombre de carpeta en el path completo
  for (const folder of knownFolders) {
    if (path.includes('/' + folder + '/')) return 1;
  }

  // Método 3: file:// local — buscar en href del script
  try {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      if (s.src && s.src.includes('/components/')) return 0;
      if (s.src && s.src.includes('../components/')) return 1;
    }
  } catch(e) {}

  return 0;
}

/**
 * Ajusta las rutas relativas dentro del HTML inyectado.
 */
function adjustPaths(html, depth) {
  if (depth === 0) {
    // Estamos en raíz, no ajustar
    return html;
  }
  // Ya las rutas en header.html usan ../xxx/xxx.html que es correcto para depth=1
  return html;
}

/**
 * Inicializa comportamiento interactivo del header.
 */
function initHeader(activePage) {
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!header) return;

  // ── SCROLL ──────────────────────────────────────────────────
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── HAMBURGER ───────────────────────────────────────────────
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // Cerrar al redimensionar
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 900) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── RESALTAR PÁGINA ACTIVA ───────────────────────────────────
  if (activePage) {
    const allLinks = header.querySelectorAll('[data-page]');
    allLinks.forEach(link => {
      if (link.dataset.page === activePage) {
        link.classList.add('active');
      }
    });
  }
}

// Exportar para uso en main.js
window.VanguardHeader = { loadHeader };