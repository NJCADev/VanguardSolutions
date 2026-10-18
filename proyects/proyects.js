/* ============================================================
   VANGUARD SOLUTIONS — PROYECTS JS
   Single-item phone carousel with real screenshot images
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('vanguard:ready', initProyects);
  if (document.readyState !== 'loading') setTimeout(initProyects, 100);

  function initProyects() {
    if (window._proyectsInited) return;
    window._proyectsInited = true;
    initScreenCarousel('restaurante-track', 'restaurante-prev', 'restaurante-next', 'restaurante-dots');
  }

  function initScreenCarousel(trackId, prevId, nextId, dotsId) {
    const track    = document.getElementById(trackId);
    const prevBtn  = document.getElementById(prevId);
    const nextBtn  = document.getElementById(nextId);
    const dotsWrap = document.getElementById(dotsId);
    if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

    const container = track.parentElement;
    const items     = Array.from(track.children);
    const total     = items.length;
    if (!total) return;

    let current    = 0;
    let isDragging = false;
    let startX     = 0;
    let dragDelta  = 0;

    /* Build dots */
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'screens-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', (window.VanguardI18n && window.VanguardI18n.t('js.screen_of', { n: i + 1, total: total })) || `Pantalla ${i + 1} de ${total}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    /* Render */
    function render(animated = true) {
      const w = container.offsetWidth;
      items.forEach(item => { item.style.flex = `0 0 ${w}px`; });

      track.style.transition = animated
        ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'none';
      track.style.transform = `translateX(-${current * w}px)`;

      prevBtn.disabled = current <= 0;
      nextBtn.disabled = current >= total - 1;

      dotsWrap.querySelectorAll('.screens-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-selected', String(i === current));
      });

      items.forEach((item, i) => {
        item.setAttribute('aria-hidden', String(i !== current));
        item.style.pointerEvents = i === current ? '' : 'none';
      });
    }

    function goTo(i) {
      current = Math.max(0, Math.min(i, total - 1));
      render();
    }

    /* Resize */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => render(false), 80);
    }, { passive: true });

    /* Arrows */
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    /* Keyboard */
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); e.preventDefault(); }
    });

    /* Mouse drag */
    container.addEventListener('mousedown', (e) => {
      isDragging = true; startX = e.clientX; dragDelta = 0;
      track.style.transition = 'none';
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      dragDelta = e.clientX - startX;
      track.style.transform = `translateX(${-(current * container.offsetWidth) + dragDelta}px)`;
    });
    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      const thr = container.offsetWidth * 0.2;
      if (dragDelta < -thr) goTo(current + 1);
      else if (dragDelta > thr) goTo(current - 1);
      else render();
    });

    /* Touch */
    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX; dragDelta = 0;
      track.style.transition = 'none';
    }, { passive: true });
    container.addEventListener('touchmove', (e) => {
      dragDelta = e.touches[0].clientX - startX;
      track.style.transform = `translateX(${-(current * container.offsetWidth) + dragDelta}px)`;
    }, { passive: true });
    container.addEventListener('touchend', () => {
      const thr = container.offsetWidth * 0.18;
      if (dragDelta < -thr) goTo(current + 1);
      else if (dragDelta > thr) goTo(current - 1);
      else render();
    });

    /* Auto-play */
    let auto = setInterval(() => {
      if (!document.hidden && !isDragging) {
        goTo(current < total - 1 ? current + 1 : 0);
      }
    }, 5500);

    container.addEventListener('mouseenter', () => clearInterval(auto));
    container.addEventListener('mouseleave', () => {
      auto = setInterval(() => {
        if (!document.hidden && !isDragging) {
          goTo(current < total - 1 ? current + 1 : 0);
        }
      }, 5500);
    });

    /* Init */
    buildDots();
    requestAnimationFrame(() => requestAnimationFrame(() => render(false)));
  }

})();