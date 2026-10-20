/* ============================================================
   VANGUARD SOLUTIONS — FOOTER JS
   ============================================================ */

/**
 * Inyecta el footer en el DOM.
 */
async function loadFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  try {
    const depth = getPathDepthFooter();
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    const response = await fetch(`${prefix}components/footer.html`);
    if (!response.ok) throw new Error('No se pudo cargar footer.html');
    const html = await response.text();
    placeholder.innerHTML = html;
    initFooter();
  } catch (err) {
    console.warn('Footer load error:', err);
    placeholder.innerHTML = `<footer style="text-align:center;padding:2rem;background:#020205;color:rgba(255,255,255,.3);font-size:.8rem;font-family:Montserrat,sans-serif">© ${new Date().getFullYear()} Vanguard Solutions</footer>`;
  }
}

function getPathDepthFooter() {
  const knownFolders = ['home', 'services', 'products', 'proyects', 'privacy', 'contact', 'blog', 'blogs'];
  const path = window.location.pathname.toLowerCase();
  const parts = path.split('/').filter(Boolean);
  const parentFolder = parts[parts.length - 2] || '';
  if (knownFolders.includes(parentFolder)) return 1;
  for (const folder of knownFolders) {
    if (path.includes('/' + folder + '/')) return 1;
  }
  try {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      if (s.src && s.src.includes('../components/')) return 1;
    }
  } catch(e) {}
  return 0;
}

function initFooter() {
  // Año dinámico
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Exportar
window.VanguardFooter = { loadFooter };