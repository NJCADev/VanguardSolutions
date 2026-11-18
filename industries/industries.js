/* ============================================================
   VANGUARD SOLUTIONS — PÁGINAS POR INDUSTRIA
   Llena los montos desde pricing/prices.json (única fuente de
   verdad). Con showPrices=false no se escribe ningún monto.
   ============================================================ */

(function () {
  'use strict';

  var data = null;

  document.addEventListener('vanguard:ready', init);
  if (document.readyState !== 'loading') setTimeout(init, 100);

  function init() {
    if (window._industryInited) return;
    window._industryInited = true;
    document.addEventListener('vanguard:langchange', renderFooter);

    fetch('../pricing/prices.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('prices.json ' + r.status);
        return r.json();
      })
      .then(function (json) { data = json; })
      .catch(function () { data = { showPrices: false }; })
      .then(render);
  }

  function lookup(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, data);
  }

  function format(value, fmt) {
    if (typeof value !== 'number') return '';
    if (fmt === 'usd') return '$' + value.toLocaleString('en-US');
    if (fmt === 'crc') return '≈ ₡' + Math.round(value * data.colonRate).toLocaleString('en-US');
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
