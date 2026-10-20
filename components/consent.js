/* ============================================================
   VANGUARD SOLUTIONS — CONSENT JS
   Aviso de cookies + Google Analytics 4 con consentimiento previo.

   - Sin decisión del visitante NO se carga nada de Google.
   - "Aceptar" carga gtag.js y activa la medición.
   - "Rechazar" (o retirar el consentimiento) desactiva la medición
     y borra las cookies _ga.
   - La decisión se guarda en localStorage (clave vs_consent) y se
     puede cambiar desde el enlace del pie de página.
   El ID de medición (G-…) sale de config.js, generado desde .env.
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'vs_consent';           // 'granted' | 'denied'
  const SCRIPT_URL = document.currentScript && document.currentScript.src;
  const cfg = window.VS_CONFIG && window.VS_CONFIG.firebase;
  const GA_ID = cfg && cfg.measurementId;

  const POLICY_URL = new URL('../privacy/privacy.html', SCRIPT_URL || location.href).href;

  let gaLoaded = false;
  let bannerShown = false;

  /* ── DECISIÓN GUARDADA ───────────────────────────────────── */
  function getChoice() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'granted' || v === 'denied' ? v : null;
    } catch (e) {
      return null;   // sin almacenamiento: se tratará como "sin decidir"
    }
  }

  function saveChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ignorar */ }
  }

  /* ── GOOGLE ANALYTICS ────────────────────────────────────── */
  function enableAnalytics() {
    if (!GA_ID) return;
    window['ga-disable-' + GA_ID] = false;
    if (gaLoaded) return;
    gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function disableAnalytics() {
    if (GA_ID) window['ga-disable-' + GA_ID] = true;
    clearAnalyticsCookies();
  }

  /** Borra las cookies _ga y _ga_* en el dominio actual y en sus dominios padre. */
  function clearAnalyticsCookies() {
    const parts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i++) {
      domains.push('; domain=.' + parts.slice(i).join('.'));
    }
    document.cookie
      .split(';')
      .map((c) => c.split('=')[0].trim())
      .filter((n) => n === '_ga' || n.indexOf('_ga_') === 0)
      .forEach((name) => {
        domains.forEach((d) => {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      });
  }

  /* ── APARIENCIA ──────────────────────────────────────────── */
  function loadStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('consent.css', SCRIPT_URL || location.href).href;
    document.head.appendChild(link);
  }

  function buildBanner() {
    let el = document.getElementById('vs-consent');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'vs-consent';
    el.className = 'vs-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'vs-consent-title');
    el.setAttribute('aria-describedby', 'vs-consent-text');
    el.hidden = true;
    el.innerHTML =
      '<div class="vs-consent-body">' +
        '<strong id="vs-consent-title" data-i18n="consent.title">Cookies y privacidad</strong>' +
        // El texto y el enlace van en elementos separados: la traducción reemplaza
        // el contenido de cada elemento marcado y borraría el enlace si fuera hijo.
        '<p id="vs-consent-text"><span data-i18n="consent.text">Usamos cookies de Google Analytics para entender cómo se usa el sitio y mejorarlo. ' +
        'Solo se activan si las aceptas; puedes cambiar tu decisión cuando quieras desde el pie de página.</span> ' +
        '<a class="vs-consent-link" href="' + POLICY_URL + '" data-i18n="consent.policy">Política de privacidad</a></p>' +
      '</div>' +
      '<div class="vs-consent-actions">' +
        '<button type="button" class="vs-consent-btn vs-consent-btn--reject" data-consent="denied" data-i18n="consent.reject">Rechazar</button>' +
        '<button type="button" class="vs-consent-btn vs-consent-btn--accept" data-consent="granted" data-i18n="consent.accept">Aceptar</button>' +
      '</div>';
    document.body.appendChild(el);
    if (window.VanguardI18n) window.VanguardI18n.apply(el);   // traducir según el idioma activo
    return el;
  }

  function showBanner() {
    const el = buildBanner();
    el.hidden = false;
    bannerShown = true;
    const first = el.querySelector('.vs-consent-btn--reject');
    if (first) first.focus({ preventScroll: true });
  }

  function hideBanner() {
    const el = document.getElementById('vs-consent');
    if (el) el.hidden = true;
  }

  /* ── ACCIONES ────────────────────────────────────────────── */
  function decide(value) {
    saveChoice(value);
    if (value === 'granted') enableAnalytics();
    else disableAnalytics();
    hideBanner();
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest && e.target.closest('[data-consent], #vs-consent-settings');
    if (!target) return;
    if (target.id === 'vs-consent-settings') {
      e.preventDefault();
      showBanner();
    } else {
      decide(target.getAttribute('data-consent'));
    }
  });

  /* ── EVENTOS PERSONALIZADOS ──────────────────────────────── */
  /** Envía un evento a GA4 solo si el visitante aceptó las cookies. Nunca incluir datos personales en params. */
  function track(name, params) {
    if (getChoice() !== 'granted' || typeof window.gtag !== 'function') return;
    if (GA_ID && window['ga-disable-' + GA_ID]) return;
    window.gtag('event', name, params || {});
  }
  window.VanguardAnalytics = { track };

  document.addEventListener('click', (e) => {
    if (!e.target.closest) return;
    const page = location.pathname;

    // Botón de WhatsApp de la página de Contacto (abre la ventana por JavaScript)
    if (e.target.closest('#wa-btn')) {
      track('click_whatsapp', { page_path: page, button_text: 'contact_page_button' });
      return;
    }

    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const label = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);

    if (/^https:\/\/wa\.me\//.test(href)) {
      track('click_whatsapp', { page_path: page, button_text: label });
    } else if (href.indexOf('mailto:') === 0) {
      track('click_email', { page_path: page });
    } else if (a.classList.contains('btn')) {
      track('cta_click', { page_path: page, button_text: label, link_url: href });
    }
  });

  document.addEventListener('vanguard:langchange', (e) => {
    track('language_change', { language: e.detail && e.detail.lang });
  });

  /* ── ARRANQUE ────────────────────────────────────────────── */
  loadStyles();

  const choice = getChoice();
  if (choice === 'granted') {
    enableAnalytics();
  } else if (choice === null) {
    // Mostrar el aviso cuando el idioma ya esté aplicado (evita parpadeo)
    document.addEventListener('vanguard:ready', () => { if (!bannerShown && getChoice() === null) showBanner(); });
    // Respaldo por si el evento ya pasó o la carga se retrasa
    window.addEventListener('load', () => {
      setTimeout(() => { if (!bannerShown && getChoice() === null) showBanner(); }, 3000);
    });
  } else {
    disableAnalytics();
  }
})();
