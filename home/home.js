/* ============================================================
   VANGUARD SOLUTIONS — HOME JS
   ============================================================ */

(function () {
  'use strict';

  // Esperar que main.js inicialice header/footer
  document.addEventListener('vanguard:ready', initHome);

  // Fallback por si el evento ya disparó
  if (document.readyState !== 'loading') {
    setTimeout(initHome, 100);
  }

  function initHome() {
    // Evitar doble init
    if (window._homeInited) return;
    window._homeInited = true;

    initHeroCanvas();
    initTyping();
    initGlitch();
    initRevealDelay();
  }

  /* ── PARTICLES CANVAS ───────────────────────────────────── */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;
    let mouse = { x: -999, y: -999 };

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();

    const resizeObs = new ResizeObserver(resize);
    resizeObs.observe(canvas.parentElement);

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    const COLORS = [
      [0, 240, 255],
      [191, 0, 255],
      [57, 255, 20]
    ];

    for (let i = 0; i < 80; i++) {
      const [r, g, b] = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        r: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r_color: r,
        g_color: g,
        b_color: b,
        alpha: Math.random() * 0.6 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse repulsion (subtle)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (80 - dist) / 80 * 0.4;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          // Dampen
          p.vx *= 0.95;
          p.vy *= 0.95;
        }

        // Draw point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r_color},${p.g_color},${p.b_color},${p.alpha})`;
        ctx.fill();
      });

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else draw();
    });
  }

  /* ── TYPING EFFECT ──────────────────────────────────────── */
  function initTyping() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const PHRASES_ES = [
      'transformamos ideas en software.',
      'construimos el futuro digital.',
      'desarrollamos apps que destacan.',
      'optimizamos tu presencia online.',
      'somos tu socio tecnológico.'
    ];
    // Frases del idioma activo (si no hay traducción disponible, español)
    const getPhrases = () => (window.VanguardI18n && window.VanguardI18n.t('js.typing')) || PHRASES_ES;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
      if (isPaused) return;

      const phrases = getPhrases();
      const current = phrases[phraseIndex % phrases.length];

      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 40 : 75;

      if (!isDeleting && charIndex === current.length) {
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          isDeleting = true;
          type();
        }, 2200);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % getPhrases().length;
        delay = 300;
      }

      setTimeout(type, delay);
    }

    // Start after a brief delay
    setTimeout(type, 800);
  }

  /* ── GLITCH ON HERO TITLE ACCENT ────────────────────────── */
  function initGlitch() {
    // El elemento se vuelve a buscar en cada ciclo: al cambiar de idioma el
    // título se reescribe y el nodo anterior deja de estar en el DOM.
    const sync = () => {
      const node = document.querySelector('.hero-title-accent');
      if (node) node.setAttribute('data-text', node.textContent);
      return node;
    };
    if (!sync()) return;

    // Trigger glitch randomly
    setInterval(() => {
      const el = sync();
      if (el && Math.random() > 0.7) {
        el.classList.add('glitch-active');
        setTimeout(() => el.classList.remove('glitch-active'), 300);
      }
    }, 3000);
  }

  /* ── REVEAL WITH STAGGER BASED ON GRID POSITION ─────────── */
  function initRevealDelay() {
    // Services preview grid
    const cards = document.querySelectorAll('.service-preview-card.reveal');
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 80}ms`;
    });

    // Blog grid
    const blogCards = document.querySelectorAll('.blog-card.reveal');
    blogCards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 100}ms`;
    });
  }

})();