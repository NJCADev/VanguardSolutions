/* ============================================================
   VANGUARD SOLUTIONS — COTIZADOR DE 1 MINUTO
   Recomienda un plan según las respuestas, con los montos de
   prices.json (si showPrices es true) y abre WhatsApp con un
   resumen. No guarda ni envía datos personales.
   ============================================================ */

(function () {
  'use strict';

  var PLANS = ['base', 'standard', 'pro'];
  var data = null;

  document.addEventListener('vanguard:ready', init);
  if (document.readyState !== 'loading') setTimeout(init, 100);

  function t(key, params, fallback) {
    var v = window.VanguardI18n && window.VanguardI18n.t(key, params);
    return v == null ? (fallback || '') : v;
  }

  function init() {
    if (window._quoteInited) return;
    window._quoteInited = true;
    var form = document.getElementById('pq-form');
    if (!form) return;

    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('change', render);
    document.addEventListener('vanguard:langchange', render);

    fetch('prices.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('prices.json ' + r.status)); })
      .then(function (json) { data = json; })
      .catch(function () { data = { showPrices: false }; })
      .then(render);
  }

  /* ── ESTADO DEL FORMULARIO ───────────────────────────────── */
  function checkedValue(name) {
    var el = document.querySelector('#pq-form input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function checkedValues(name) {
    return Array.prototype.map.call(document.querySelectorAll('#pq-form input[name="' + name + '"]:checked'), function (el) { return el.value; });
  }

  function labelOf(input) {
    var span = input.parentNode.querySelector('span');
    return span ? span.textContent.trim() : '';
  }

  function answersOf(names) {
    var out = [];
    names.forEach(function (n) {
      document.querySelectorAll('#pq-form input[name="' + n + '"]:checked').forEach(function (el) { out.push(labelOf(el)); });
    });
    return out;
  }

  /* ── REGLAS (salen de las tablas de cada plan) ───────────── */
  function webPlan() {
    var rank = Number(checkedValue('webShape') || 0);
    if (checkedValues('webExtra').length) rank = Math.max(rank, 1); // idiomas, PWA y GA4 empiezan en Standard
    return rank;
  }

  function storePlan() {
    var rank = Math.max(Number(checkedValue('storeStores') || 0), Number(checkedValue('storeProducts') || 0));
    var extra = checkedValues('storeExtra');
    if (extra.indexOf('std') !== -1) rank = Math.max(rank, 1);
    if (extra.indexOf('pro') !== -1) rank = 2;
    return rank;
  }

  /* ── FORMATO ─────────────────────────────────────────────── */
  function usd(n) { return '$' + n.toLocaleString('en-US'); }
  function crc(n) { return '≈ ₡' + Math.round(n * data.colonRate).toLocaleString('en-US'); }

  function addLine(dl, label, value) {
    var dt = document.createElement('dt');
    dt.textContent = label;
    var dd = document.createElement('dd');
    dd.textContent = value;
    var row = document.createElement('div');
    row.appendChild(dt);
    row.appendChild(dd);
    dl.appendChild(row);
  }

  function money(n) { return usd(n) + ' (' + crc(n) + ')'; }

  /* ── RESULTADO ───────────────────────────────────────────── */
  function render() {
    var kind = checkedValue('kind');
    var prompt = document.getElementById('pq-prompt');
    var body = document.getElementById('pq-result-body');
    document.querySelectorAll('#pq-form .pq-branch').forEach(function (b) { b.hidden = b.dataset.branch !== kind; });
    if (!kind) { prompt.hidden = false; body.hidden = true; return; }
    prompt.hidden = true;
    body.hidden = false;

    var show = !!(data && data.showPrices === true);
    var planEl = document.getElementById('pq-plan');
    var forEl = document.getElementById('pq-for');
    var dl = document.getElementById('pq-lines');
    var addon = document.getElementById('pq-addon');
    var answersEl = document.getElementById('pq-answers');
    var wa = document.getElementById('pq-wa');
    var waText = document.getElementById('pq-wa-text');
    dl.textContent = '';
    addon.hidden = true;
    var message;

    if (kind === 'custom') {
      planEl.textContent = t('pricing.q.res.custom.title', null, 'Software a medida');
      forEl.textContent = t('pricing.q.res.custom.text');
      answersEl.hidden = true;
      waText.textContent = t('pricing.q.res.btn.custom', null, 'Pedir una propuesta');
      message = t('pricing.q.wa.custom');
    } else {
      var group = kind === 'web' ? 'web' : 'store';
      var rank = kind === 'web' ? webPlan() : storePlan();
      var id = PLANS[rank];
      var p = 'pricing.' + group + '.' + id;
      var d = data && data[group] && data[group][id];

      planEl.textContent = t(p + '.name');
      forEl.textContent = t(p + '.for');

      if (show && d) {
        if (kind === 'web') {
          addLine(dl, t('pricing.q.res.dev'), money(d.dev));
          addLine(dl, t('pricing.q.res.monthly'), money(d.monthly) + ' ' + t('pricing.q.res.per.month'));
          addLine(dl, t('pricing.q.res.domain'), usd(data.web.domain));
        } else {
          addLine(dl, t('pricing.q.res.license'), money(d.license));
          addLine(dl, t('pricing.q.res.setup'), usd(d.setup));
          addLine(dl, t('pricing.q.res.monthly'), money(d.monthly) + ' ' + t('pricing.q.res.per.month'));
        }
      }
      addLine(dl, t('pricing.q.res.term'), t(p + '.term'));

      if (kind === 'store' && checkedValues('storeExtra').indexOf('einvoice') !== -1) {
        if (id === 'pro') {
          addon.textContent = t('pricing.q.res.einvoice.incl');
          addon.hidden = false;
        } else if (show && data.extras) {
          addon.textContent = t('pricing.q.res.einvoice.add', { price: usd(data.extras.einvoice) });
          addon.hidden = false;
        }
      }

      var names = kind === 'web' ? ['webShape', 'webExtra'] : ['storeStores', 'storeProducts', 'storeExtra'];
      var answers = answersOf(names).join(t('pricing.q.res.sep', null, ' · '));
      document.getElementById('pq-answers-text').textContent = answers;
      answersEl.hidden = false;
      waText.textContent = t('pricing.q.res.btn', null, 'Enviar este resumen por WhatsApp');
      message = t('pricing.q.wa', {
        kind: t('pricing.q.kind.' + group + '.phrase'),
        plan: t('pricing.waplan.' + group + '.' + id),
        answers: answers
      });
    }

    if (window.VanguardWA && window.VanguardWA.link && message) wa.href = window.VanguardWA.link(message);
  }
})();
