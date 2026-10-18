/* ============================================================
   VANGUARD SOLUTIONS — PRODUCTS JS
   Two independent carousels with touch/drag, dots, arrows
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('vanguard:ready', initProducts);
  if (document.readyState !== 'loading') setTimeout(initProducts, 100);

  function initProducts() {
    if (window._productsInited) return;
    window._productsInited = true;

    initCarousel('ms-track', 'ms-prev', 'ms-next', 'ms-dots');
    initCarousel('av-track', 'av-prev', 'av-next', 'av-dots');
  }

  /**
   * Creates a fully functional responsive carousel.
   * @param {string} trackId   - ID of the .carousel-track element
   * @param {string} prevId    - ID of the prev button
   * @param {string} nextId    - ID of the next button
   * @param {string} dotsId    - ID of the dots container
   */
  function initCarousel(trackId, prevId, nextId, dotsId) {
    const track    = document.getElementById(trackId);
    const prevBtn  = document.getElementById(prevId);
    const nextBtn  = document.getElementById(nextId);
    const dotsWrap = document.getElementById(dotsId);

    if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

    const container = track.parentElement;
    const items     = Array.from(track.children);
    if (!items.length) return;

    let currentIndex = 0;
    let visibleCount = getVisible();
    let totalPages   = Math.ceil(items.length / visibleCount);

    // ── DRAG / TOUCH STATE ─────────────────────────────────
    let isDragging   = false;
    let startX       = 0;
    let dragDelta    = 0;

    // ── HELPERS ───────────────────────────────────────────
    function getVisible() {
      const w = window.innerWidth;
      if (w < 640) return 1;
      if (w < 900) return 2;
      return 3;
    }

    function getCardWidth() {
      if (!items[0]) return 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      return items[0].getBoundingClientRect().width + gap;
    }

    function clampIndex(idx) {
      return Math.max(0, Math.min(idx, totalPages - 1));
    }

    // ── RENDER ────────────────────────────────────────────
    function render(animated = true) {
      const cardW  = getCardWidth();
      const offset = currentIndex * visibleCount * cardW;

      if (!animated) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }

      track.style.transform = `translateX(-${offset}px)`;

      // Buttons
      prevBtn.disabled = currentIndex <= 0;
      nextBtn.disabled = currentIndex >= totalPages - 1;

      // Dots
      dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        const isActive = i === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
        dot.setAttribute('aria-label', (window.VanguardI18n && window.VanguardI18n.t('js.page_of', { n: i + 1, total: totalPages })) || `Página ${i + 1} de ${totalPages}`);
      });

      // ARIA on items
      items.forEach((item, i) => {
        const inView = i >= currentIndex * visibleCount && i < (currentIndex + 1) * visibleCount;
        item.setAttribute('aria-hidden', String(!inView));
        item.style.pointerEvents = inView ? '' : 'none';
      });
    }

    function goTo(page) {
      currentIndex = clampIndex(page);
      render();
    }

    // ── BUILD DOTS ────────────────────────────────────────
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', (window.VanguardI18n && window.VanguardI18n.t('js.page_of', { n: i + 1, total: totalPages })) || `Página ${i + 1} de ${totalPages}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    // ── RESIZE ───────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newVisible = getVisible();
        if (newVisible !== visibleCount) {
          visibleCount = newVisible;
          totalPages   = Math.ceil(items.length / visibleCount);
          currentIndex = clampIndex(currentIndex);
          buildDots();
        }
        render(false);
      }, 100);
    }, { passive: true });

    // ── ARROW BUTTONS ─────────────────────────────────────
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // ── KEYBOARD (when container focused) ─────────────────
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goTo(currentIndex - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { goTo(currentIndex + 1); e.preventDefault(); }
    });

    // ── MOUSE DRAG ────────────────────────────────────────
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX     = e.clientX;
      dragDelta  = 0;
      track.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      dragDelta = e.clientX - startX;
      const base   = currentIndex * visibleCount * getCardWidth();
      track.style.transform = `translateX(${-base + dragDelta}px)`;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      const threshold = getCardWidth() * 0.25;
      if (dragDelta < -threshold)       goTo(currentIndex + 1);
      else if (dragDelta > threshold)   goTo(currentIndex - 1);
      else                              render();
    });

    // ── TOUCH DRAG ────────────────────────────────────────
    container.addEventListener('touchstart', (e) => {
      startX    = e.touches[0].clientX;
      dragDelta = 0;
      track.style.transition = 'none';
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      dragDelta = e.touches[0].clientX - startX;
      const base = currentIndex * visibleCount * getCardWidth();
      track.style.transform = `translateX(${-base + dragDelta}px)`;
    }, { passive: true });

    container.addEventListener('touchend', () => {
      const threshold = getCardWidth() * 0.2;
      if (dragDelta < -threshold)       goTo(currentIndex + 1);
      else if (dragDelta > threshold)   goTo(currentIndex - 1);
      else                              render();
    });

    // ── AUTO-PLAY (optional, pauses on hover/focus) ──────
    let autoPlay = setInterval(() => {
      if (!document.hidden && !isDragging) {
        const next = currentIndex < totalPages - 1 ? currentIndex + 1 : 0;
        goTo(next);
      }
    }, 5000);

    container.addEventListener('mouseenter', () => clearInterval(autoPlay));
    container.addEventListener('focusin',    () => clearInterval(autoPlay));
    container.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => {
        if (!document.hidden && !isDragging) {
          const next = currentIndex < totalPages - 1 ? currentIndex + 1 : 0;
          goTo(next);
        }
      }, 5000);
    });

    // ── INIT ──────────────────────────────────────────────
    buildDots();
    render(false);
  }

})();