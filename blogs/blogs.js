/* ============================================================
   VANGUARD SOLUTIONS — BLOGS JS
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('vanguard:ready', initBlogs);
  if (document.readyState !== 'loading') setTimeout(initBlogs, 100);

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
