/* ============================================================
   VANGUARD SOLUTIONS — SERVICES JS
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('vanguard:ready', initServices);
  if (document.readyState !== 'loading') setTimeout(initServices, 100);

  function initServices() {
    if (window._servicesInited) return;
    window._servicesInited = true;
    addCardRevealDelays();
    addCardTiltEffect();
  }

  /* Stagger reveal delays */
  function addCardRevealDelays() {
    document.querySelectorAll('.service-card.reveal').forEach((card, i) => {
      card.style.transitionDelay = `${i * 90}ms`;
    });
    document.querySelectorAll('.process-step.reveal').forEach((step, i) => {
      step.style.transitionDelay = `${i * 100}ms`;
    });
    document.querySelectorAll('.intro-stat.reveal').forEach((stat, i) => {
      stat.style.transitionDelay = `${i * 80}ms`;
    });
  }

  /* Subtle 3D tilt on hover (desktop only) */
  function addCardTiltEffect() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease, border-color 0.4s ease, box-shadow 0.4s ease';
        setTimeout(() => card.style.transition = '', 500);
      });
    });
  }
})();