/* ============================================================
   VANGUARD SOLUTIONS — COTIZADOR DE 1 MINUTO
   Recomienda un plan según las respuestas, con los montos de
   prices.json (si showPrices es true), un presupuesto estimado
   con complementos y un resumen para WhatsApp. No guarda ni
   envía datos personales.
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

  /* Plan mínimo que piden las respuestas, sin contar las varias tiendas */
  function storeNeeds() {
    var rank = Number(checkedValue('storeProducts') || 0);
    var extra = checkedValues('storeExtra');
    if (extra.indexOf('std') !== -1) rank = Math.max(rank, 1);
    if (extra.indexOf('pro') !== -1) rank = 2;
    var add = checkedValues('storeAddon');
    if (add.indexOf('integration') !== -1 || add.indexOf('pos') !== -1) rank = Math.max(rank, 1); // solo desde Standard
    return rank;
  }

  /* ── FORMATO ─────────────────────────────────────────────── */
  function usd(n) { return '$' + n.toLocaleString('en-US'); }
  function crc(n) { return '≈ ₡' + Math.round(n * data.colonRate).toLocaleString('en-US'); }
  function money(n) { return usd(n) + ' (' + crc(n) + ')'; }
  function range(lo, hi) { return hi == null || hi === lo ? usd(lo) : usd(lo) + ' – ' + usd(hi); }

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

  function setText(id, text) {
    var el = document.getElementById(id);
    el.textContent = text || '';
    el.hidden = !text;
  }

  /* Precios que se muestran junto a cada complemento */
  function renderAddonPrices(show) {
    document.querySelectorAll('[data-ad-price]').forEach(function (el) {
      var k = el.dataset.adPrice;
      var text = '';
      if (k === 'pos') text = t('pricing.q.ad.pos.price');
      else if (show && data.extras) {
        if (k === 'design') text = range(data.extras.designMin, data.extras.designMax);
        else if (k === 'einvoice') text = t('pricing.q.ad.from') + ' ' + usd(data.extras.einvoice);
        else if (k === 'integration') text = t('pricing.q.ad.from') + ' ' + usd(data.extras.integration);
      }
      el.textContent = text;
      el.hidden = !text;
    });
  }

  /* ── PRESUPUESTO ─────────────────────────────────────────── */
  // Devuelve filas, totales y notas. Con el diseño exclusivo el total es un rango.
  function storeBudget(id, many, add) {
    var d = data.store[id];
    var rows = [];
    var base = d.license + d.setup;
    rows.push([t('pricing.q.bud.base'), usd(base)]);
    var fixed = 0;
    if (id !== 'pro' && add.indexOf('einvoice') !== -1) { fixed += data.extras.einvoice; rows.push([t('pricing.q.bud.einvoice'), '+ ' + usd(data.extras.einvoice)]); }
    if (id !== 'pro' && many) { fixed += data.extras.multistore; rows.push([t('pricing.q.bud.multi'), '+ ' + usd(data.extras.multistore)]); }
    if (add.indexOf('integration') !== -1) { fixed += data.extras.integration; rows.push([t('pricing.q.bud.integration'), '+ ' + usd(data.extras.integration)]); }
    var lo = base + fixed;
    var hi = null;
    if (add.indexOf('design') !== -1) {
      hi = lo + data.extras.designMax;
      lo = lo + data.extras.designMin;
      rows.push([t('pricing.q.bud.design'), '+ ' + range(data.extras.designMin, data.extras.designMax)]);
    }
    return { rows: rows, lo: lo, hi: hi, monthly: d.monthly };
  }

  function renderBudget(kind, b, noteId) {
    var dl = document.getElementById('pq-budget-lines');
    dl.textContent = '';
    b.rows.forEach(function (r) { addLine(dl, r[0], r[1]); });
    addLine(dl, t('pricing.q.bud.initial'), range(b.lo, b.hi));
    addLine(dl, t('pricing.q.res.monthly'), usd(b.monthly) + ' ' + t('pricing.q.res.per.month'));
    addLine(dl, t('pricing.q.bud.year'), range(b.lo + 12 * b.monthly, b.hi == null ? null : b.hi + 12 * b.monthly));
    document.getElementById('pq-bud-note-store').hidden = noteId !== 'store';
    document.getElementById('pq-bud-note-web').hidden = noteId !== 'web';
  }

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
    renderAddonPrices(show);

    var planEl = document.getElementById('pq-plan');
    var forEl = document.getElementById('pq-for');
    var dl = document.getElementById('pq-lines');
    var addon = document.getElementById('pq-addon');
    var answersEl = document.getElementById('pq-answers');
    var budget = document.getElementById('pq-budget');
    var wa = document.getElementById('pq-wa');
    var waText = document.getElementById('pq-wa-text');
    dl.textContent = '';
    addon.hidden = true;
    budget.hidden = true;
    setText('pq-why', '');
    setText('pq-bnote', '');
    setText('pq-alt', '');
    var message;

    if (kind === 'custom') {
      planEl.textContent = t('pricing.q.res.custom.title', null, 'Software a medida');
      forEl.textContent = t('pricing.q.res.custom.text');
      answersEl.hidden = true;
      waText.textContent = t('pricing.q.res.btn.custom', null, 'Pedir una propuesta');
      message = t('pricing.q.wa.custom');
    } else {
      var group = kind === 'web' ? 'web' : 'store';
      var many = false;
      var add = [];
      var rank;
      if (kind === 'web') {
        rank = webPlan();
      } else {
        add = checkedValues('storeAddon');
        many = checkedValue('storeStores') === '2';
        rank = storeNeeds();
        // Varias tiendas: Base no las ofrece; Standard las suma como complemento y Profesional ya las incluye
        if (many && rank < 2) rank = Math.max(rank, 1);
      }
      var id = PLANS[rank];
      var multiAddon = kind === 'store' && many && id !== 'pro';
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

      // Avisos del plan
      var notes = [];
      if (kind === 'store' && id === 'pro') {
        if (add.indexOf('einvoice') !== -1) notes.push(t('pricing.q.res.einvoice.incl'));
        if (many) notes.push(t('pricing.q.res.multi.incl'));
      }
      if (notes.length) { addon.textContent = notes.join(' '); addon.hidden = false; }
      if (multiAddon) setText('pq-why', t('pricing.q.why.multi'));

      // Presupuesto estimado (solo con precios visibles)
      var estimate = '';
      if (show && d) {
        var bud;
        if (kind === 'web') {
          var lo = d.dev + data.web.domain;
          bud = { rows: [], lo: lo, hi: null, monthly: d.monthly };
          renderBudget('web', bud, 'web');
        } else {
          bud = storeBudget(id, many, add);
          renderBudget('store', bud, 'store');
          var notesB = [];
          if (add.indexOf('pos') !== -1) notesB.push(t('pricing.q.bud.pos'));
          if (add.indexOf('design') !== -1) notesB.push(t('pricing.q.bud.design.range', { min: usd(data.extras.designMin), max: usd(data.extras.designMax) }));
          setText('pq-bnote', notesB.join(' '));
          if (multiAddon) {
            var alt = storeBudget('pro', false, add.filter(function (x) { return x === 'design' || x === 'integration'; }));
            setText('pq-alt', t('pricing.q.alt', { initial: range(alt.lo, alt.hi), monthly: usd(alt.monthly) + ' ' + t('pricing.q.res.per.month') }));
          }
        }
        budget.hidden = false;
        estimate = ' ' + t('pricing.q.wa.estimate', { initial: range(bud.lo, bud.hi), monthly: usd(bud.monthly) });
      } else if (multiAddon) {
        setText('pq-alt', t('pricing.q.alt.noprice'));
        budget.hidden = false;
        document.getElementById('pq-budget-lines').textContent = '';
        document.querySelector('#pq-budget .pq-h4').hidden = true;
      }
      if (show && d) document.querySelector('#pq-budget .pq-h4').hidden = false;

      var names = kind === 'web' ? ['webShape', 'webExtra'] : ['storeStores', 'storeProducts', 'storeExtra', 'storeAddon'];
      var answers = answersOf(names).join(t('pricing.q.res.sep', null, ' · '));
      document.getElementById('pq-answers-text').textContent = answers;
      answersEl.hidden = false;
      waText.textContent = t('pricing.q.res.btn', null, 'Enviar este resumen por WhatsApp');
      message = t('pricing.q.wa', {
        kind: t('pricing.q.kind.' + group + '.phrase'),
        plan: t('pricing.waplan.' + group + '.' + id),
        answers: answers,
        estimate: estimate
      });
    }

    if (window.VanguardWA && window.VanguardWA.link && message) wa.href = window.VanguardWA.link(message);
  }
})();
