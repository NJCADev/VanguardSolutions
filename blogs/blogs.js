/* ============================================================
   VANGUARD SOLUTIONS — BLOGS JS
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('vanguard:ready', initBlogs);
  if (document.readyState !== 'loading') setTimeout(initBlogs, 100);

  // Los botones del HTML llevan data-open-article / data-close-article
  // (sin onclick en línea, para poder aplicar una Content-Security-Policy estricta).
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-article]');
    if (opener) { openArticle(opener.dataset.openArticle); return; }
    const closer = e.target.closest('[data-close-article]');
    if (closer) closeArticle(closer.dataset.closeArticle);
  });

  function initBlogs() {
    if (window._blogsInited) return;
    window._blogsInited = true;
    addRevealDelays();
  }

  function addRevealDelays() {
    document.querySelectorAll('.blog-card-full.reveal').forEach((card, i) => {
      card.style.transitionDelay = `${i * 100}ms`;
    });
  }

})();

/* ── MODAL FUNCTIONS ──────────────────────────────────────── */
function openArticle(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  // Focus trap — enfocar el botón de cierre
  requestAnimationFrame(() => {
    modal.querySelector('.modal-close')?.focus();
  });

  // Cerrar con Escape
  modal._escHandler = (e) => {
    if (e.key === 'Escape') closeArticle(id);
  };
  document.addEventListener('keydown', modal._escHandler);
}

function closeArticle(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.hidden = true;
  document.body.style.overflow = '';

  if (modal._escHandler) {
    document.removeEventListener('keydown', modal._escHandler);
    modal._escHandler = null;
  }
}