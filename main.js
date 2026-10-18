/* ============================================================
   VANGUARD SOLUTIONS — MAIN.JS
   Orquestación: carga header/footer, funcionalidades globales
   ============================================================ */

(function () {
  'use strict';

  // ── DETECCIÓN DE PÁGINA ACTIVA ─────────────────────────────
  function detectActivePage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/home/') || path.endsWith('/') || path.endsWith('index.html')) return 'home';
    if (path.includes('/blogs/')) return 'blogs';
    if (path.includes('/services/')) return 'services';
    if (path.includes('/products/')) return 'products';
    if (path.includes('/proyects/')) return 'proyects';
    if (path.includes('/contact/')) return 'contact';
    return 'home';
  }

  // ── LOADER ────────────────────────────────────────────────
  function hideLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 300);
    }
  }

  // ── SCROLL REVEAL ─────────────────────────────────────────
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    // Fallback: si el Observer no dispara en 2s (Brave, Safari agresivo),
    // forzar todos los elementos visibles para que el contenido no quede oculto
    const fallbackTimer = setTimeout(() => {
      elements.forEach(el => el.classList.add('visible'));
    }, 2000);

    // Si IntersectionObserver no está disponible (muy raro), mostrar todo
    if (!('IntersectionObserver' in window)) {
      clearTimeout(fallbackTimer);
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    let revealedCount = 0;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement?.children || []);
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 300);
          setTimeout(() => {
            entry.target.classList.add('visible');
            revealedCount++;
            // Una vez revelados todos, cancelar el fallback
            if (revealedCount >= elements.length) {
              clearTimeout(fallbackTimer);
            }
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,           // umbral más bajo — dispara antes (mejor en Brave)
      rootMargin: '0px 0px 0px 0px'  // sin margen negativo que Brave puede ignorar
    });

    elements.forEach(el => observer.observe(el));
  }

  // ── PARTICLES BACKGROUND (opcional, ligero) ─────────────
  function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const colors = ['rgba(0,240,255,', 'rgba(191,0,255,', 'rgba(57,255,20,'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      });

      // Líneas de conexión
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,240,255,${0.05 * (1 - dist / 100)})`;
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

    // Cleanup en hidden/visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        draw();
      }
    });
  }

  // ── TYPING EFFECT ─────────────────────────────────────────
  function initTypingEffect(elementId, texts, speed = 80, pause = 2000) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const current = texts[textIndex];
      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === current.length) {
        setTimeout(() => { isDeleting = true; type(); }, pause);
        return;
      }
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
      }

      setTimeout(type, isDeleting ? speed / 2 : speed);
    }
    type();
  }

  // ── GLITCH EFFECT ─────────────────────────────────────────
  function initGlitch(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add('glitch-text');
    el.setAttribute('data-text', el.textContent);
  }

  // ── COUNTER ANIMATION ─────────────────────────────────────
  function animateCounter(el, target, duration = 1800) {
    const start    = performance.now();
    const easeOut  = t => 1 - Math.pow(1 - t, 3);
    const suffix   = el.dataset.suffix || '';

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(target * easeOut(progress));
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else {
        el.textContent = target + suffix; // ensure exact final value
        el.dataset.counterDone = '1';
      }
    }
    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.counter, 10);
          if (!isNaN(target)) animateCounter(entry.target, target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(el => obs.observe(el));
  }

  // ── SCROLL PROGRESS BAR ─────────────────────────────────────
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  // ── SMOOTH ANCHOR SCROLL ──────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // ── INIT PRINCIPAL ────────────────────────────────────────
  async function init() {
    const activePage = detectActivePage();

    // Cargar header y footer en paralelo
    const loadPromises = [];

    if (window.VanguardHeader) {
      loadPromises.push(window.VanguardHeader.loadHeader(activePage));
    }
    if (window.VanguardFooter) {
      loadPromises.push(window.VanguardFooter.loadFooter());
    }

    await Promise.allSettled(loadPromises);

    // Aplicar el idioma elegido (header y footer ya están en el DOM)
    if (window.VanguardI18n) await window.VanguardI18n.init();

    // Funcionalidades globales
    initScrollReveal();
    initCounters();
    initSmoothScroll();
    initScrollProgress();
    hideLoader();

    // Disparar evento para que páginas individuales sepan que header/footer ya están
    document.dispatchEvent(new CustomEvent('vanguard:ready'));
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exponer utilidades globales
  window.Vanguard = {
    initScrollReveal,
    initTypingEffect,
    initGlitch,
    initParticles,
    animateCounter
  };
})();