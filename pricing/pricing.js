/* ============================================================
   VANGUARD SOLUTIONS — PRICING JS
   - Pestañas accesibles (←/→, Inicio/Fin) con #sitio, #tienda, #software
   - Montos desde prices.json (única fuente de verdad); con
     showPrices=false no se escribe ningún monto en el DOM
   ============================================================ */

(function () {
  'use strict';

  var TABS = ['web', 'store', 'custom'];
  var HASHES = { sitio: 'web', tienda: 'store', software: 'custom' };
  var data = null;

  document.addEventListener('vanguard:ready', init);
  if (document.readyState !== 'loading') setTimeout(init, 100);

  function init() {
    if (window._pricingInited) return;
    window._pricingInited = true;
    initTabs();
    loadPrices();
    document.addEventListener('vanguard:langchange', renderFooter);
  }

  /* ── PESTAÑAS ─────────────────────────────────────────────── */
  function initTabs() {
    var tabs = TABS.map(function (id) { return document.getElementById('tab-' + id); });
    if (tabs.some(function (t) { return !t; })) return;

    function select(id, focus) {
      TABS.forEach(function (name, i) {
        var on = name === id;
        tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
        tabs[i].tabIndex = on ? 0 : -1;
        document.getElementById('panel-' + name).hidden = !on;
        if (on && focus) tabs[i].focus();
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(TABS[i], false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
        else if (e.key === 'ArrowLeft') next = (i + TABS.length - 1) % TABS.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = TABS.length - 1;
        if (next === null) return;
        e.preventDefault();
        select(TABS[next], true);
      });
    });

    var fromHash = HASHES[location.hash.replace('#', '')];
    if (fromHash) select(fromHash, false);
  }

  /* ── MONTOS ───────────────────────────────────────────────── */
  function loadPrices() {
    fetch('prices.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('prices.json ' + r.status);
        return r.json();
      })
      .then(function (json) {
        data = json;
        render();
      })
      .catch(function () {
        // Sin datos: se muestra "Cotiza por WhatsApp" y ningún monto
        data = { showPrices: false };
        render();
      });
  }

  function lookup(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, data);
  }

  function format(value, fmt) {
    if (typeof value !== 'number') return '';
    if (fmt === 'usd') return '$' + value.toLocaleString('en-US');
    if (fmt === 'crc') return '≈ ₡' + Math.round(value * data.colonRate).toLocaleString('en-US');
    if (fmt === 'pct') return value + ' %';
    return String(value);
  }

  function render() {
    var show = data.showPrices === true;

    document.querySelectorAll('[data-amount]').forEach(function (el) { el.hidden = !show; });
    document.querySelectorAll('[data-quote]').forEach(function (el) { el.hidden = show; });

    document.querySelectorAll('[data-price]').forEach(function (el) {
      el.textContent = show ? format(lookup(el.dataset.price), el.dataset.fmt) : '';
    });

    renderFooter();
  }

  function renderFooter() {
    if (!data) return;
    var show = data.showPrices === true;
    var foot = document.querySelector('.pr-foot');
    if (foot) foot.hidden = !show;
    var rate = document.getElementById('pr-rate');
    var date = document.getElementById('pr-date');
    if (rate) rate.textContent = show && data.colonRate ? String(data.colonRate) : '';
    if (date && data.updated) {
      date.dateTime = data.updated;
      var lang = (window.VanguardI18n && window.VanguardI18n.lang) || document.documentElement.lang || 'es';
      var d = new Date(data.updated + 'T12:00:00');
      date.textContent = isNaN(d) ? data.updated : d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }
})();
