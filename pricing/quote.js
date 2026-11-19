/* ============================================================
   VANGUARD SOLUTIONS — COTIZADOR DE 1 MINUTO
   Recomienda un plan según las respuestas (tipo de negocio,
   forma del sitio, complementos, contenido y plazo), con los
   montos de prices.json (si showPrices es true): presupuesto
   estimado, comparación de planes, avisos a tener en cuenta y
   un resumen para WhatsApp. No guarda ni envía datos personales.
   ============================================================ */

(function () {
  'use strict';

  var PLANS = ['base', 'standard', 'pro'];
  // Tipo de negocio: «two» = tiene 2 planes propios en prices.json (industries);
  // «provider» = sistema de reservas que se instala para ese negocio.
  var BIZ = {
    clinic: { ind: 'clinicas', two: true, provider: 'SimplyBook.me' },
    optica: { ind: null, two: false, provider: 'SimplyBook.me' },
    vet: { ind: null, two: false, provider: 'SimplyBook.me' },
    rest: { ind: 'restaurantes', two: true, provider: 'MyRestoo' },
    office: { ind: null, two: false, provider: 'SimplyBook.me' },
    other: { ind: null, two: false, provider: 'SimplyBook.me / MyRestoo' }
  };
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

  /* Plan de sitio para un tipo de negocio: con 2 planes propios, el rango 1 o más es el Profesional */
  function webDesc(rank, biz) {
    var cfg = BIZ[biz] || BIZ.other;
    if (cfg.two && data && data.industries && data.industries[cfg.ind]) {
      var pro = rank >= 1;
      var key = pro ? 'pro' : 'standard';
      return {
        id: key, rank: pro ? 1 : 0, two: true, d: data.industries[cfg.ind][key],
        name: 'pricing.web.' + (pro ? 'pro' : 'standard') + '.name',
        forKey: pro ? 'ind.2p.pro.for' : 'pricing.web.base.for',
        term: pro ? 'pricing.web.standard.term' : 'pricing.web.base.term'
      };
    }
    var id = PLANS[rank];
    return {
      id: id, rank: rank, two: false, d: data && data.web && data.web[id],
      name: 'pricing.web.' + id + '.name', forKey: 'pricing.web.' + id + '.for', term: 'pricing.web.' + id + '.term'
    };
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
        else if (k === 'booking') text = t('pricing.q.ad.booking.price', { amount: usd(data.extras.booking) });
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

  function webBudget(d, booking) {
    var rows = [[t('pricing.q.bud.dev'), usd(d.dev)], [t('pricing.q.bud.domain'), '+ ' + usd(data.web.domain)]];
    var lo = d.dev + data.web.domain;
    if (booking) { lo += data.extras.booking; rows.push([t('pricing.q.bud.booking'), '+ ' + usd(data.extras.booking)]); }
    return { rows: rows, lo: lo, hi: null, monthly: d.monthly };
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

  /* ── COMPARACIÓN DE PLANES ───────────────────────────────── */
  // items: [{ name, lo, hi, monthly, covers, suggested }]
  function renderCompare(items) {
    var box = document.getElementById('pq-cmp');
    var table = document.getElementById('pq-cmp-table');
    table.textContent = '';
    if (!items || items.length < 2) { box.hidden = true; return; }
    var sug = items.filter(function (i) { return i.suggested; })[0];
    var sugYear = sug.lo + 12 * sug.monthly;

    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    ['pricing.q.cmp.plan', 'pricing.q.cmp.initial', 'pricing.q.cmp.monthly', 'pricing.q.cmp.year'].forEach(function (k) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = t(k);
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    items.forEach(function (i) {
      var tr = document.createElement('tr');
      if (i.suggested) tr.className = 'pq-cmp-sug';
      if (!i.covers) tr.className = 'pq-cmp-low';
      var year = i.lo + 12 * i.monthly;
      var th = document.createElement('th');
      th.scope = 'row';
      var name = document.createElement('span');
      name.textContent = i.name;
      th.appendChild(name);
      var sub = document.createElement('small');
      if (i.suggested) sub.textContent = t('pricing.q.cmp.suggested');
      else if (!i.covers) sub.textContent = t('pricing.q.cmp.low');
      else {
        var diff = year - sugYear;
        sub.textContent = t(diff >= 0 ? 'pricing.q.cmp.more' : 'pricing.q.cmp.less', { amount: usd(Math.abs(diff)) });
      }
      th.appendChild(sub);
      tr.appendChild(th);
      [range(i.lo, i.hi), usd(i.monthly), range(year, i.hi == null ? null : i.hi + 12 * i.monthly)].forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    box.hidden = false;
  }

  /* ── AVISOS Y AVANCE ─────────────────────────────────────── */
  function renderTips(tips) {
    var box = document.getElementById('pq-tips');
    var list = document.getElementById('pq-tips-list');
    list.textContent = '';
    tips.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });
    box.hidden = !tips.length;
  }

  function renderProgress(kind) {
    var names = kind === 'web' ? ['webBiz', 'webShape', 'ready', 'when'] : kind === 'store' ? ['storeStores', 'storeProducts', 'ready', 'when'] : [];
    var wrap = document.getElementById('pq-progress-wrap');
    var bar = document.getElementById('pq-progress');
    if (!names.length) { wrap.hidden = true; return; }
    var total = names.length + 1; // la primera pregunta: «¿Qué necesitas?»
    var done = 1;
    names.forEach(function (n) { if (checkedValue(n)) done++; });
    bar.max = total;
    bar.value = done;
    document.getElementById('pq-progress-text').textContent = t('pricing.q.progress', { done: done, total: total });
    wrap.hidden = false;
  }

  /* ── RESULTADO ───────────────────────────────────────────── */
  function render() {
    var kind = checkedValue('kind');
    var prompt = document.getElementById('pq-prompt');
    var body = document.getElementById('pq-result-body');
    document.querySelectorAll('#pq-form .pq-branch').forEach(function (b) { b.hidden = b.dataset.branch.split(' ').indexOf(kind) === -1; });
    if (!kind) { prompt.hidden = false; body.hidden = true; renderProgress(null); return; }
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
    renderCompare(null);
    renderTips([]);
    renderProgress(kind);
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
      var biz = 'other';
      var cfg = BIZ.other;
      var booking = false;
      var desc;
      if (kind === 'web') {
        biz = checkedValue('webBiz') || 'other';
        cfg = BIZ[biz] || BIZ.other;
        // Con 2 planes propios (clínicas y restaurantes) no se ofrece el sitio con tienda
        var shop = document.querySelector('#pq-form input[name="webShape"][value="2"]');
        shop.parentNode.hidden = cfg.two;
        if (cfg.two && shop.checked) document.querySelector('#pq-form input[name="webShape"][value="1"]').checked = true;
        booking = checkedValues('webAddon').indexOf('booking') !== -1;
        rank = webPlan();
        desc = webDesc(rank, biz);
        rank = desc.rank;
      } else {
        add = checkedValues('storeAddon');
        many = checkedValue('storeStores') === '2';
        rank = storeNeeds();
        // Varias tiendas: Base no las ofrece; Standard las suma como complemento y Profesional ya las incluye
        if (many && rank < 2) rank = Math.max(rank, 1);
        var sp = 'pricing.store.' + PLANS[rank];
        desc = { id: PLANS[rank], rank: rank, two: false, d: data && data.store && data.store[PLANS[rank]], name: sp + '.name', forKey: sp + '.for', term: sp + '.term' };
      }
      var id = desc.id;
      var multiAddon = kind === 'store' && many && id !== 'pro';
      var d = desc.d;

      planEl.textContent = t(desc.name);
      forEl.textContent = t(desc.forKey);

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
      addLine(dl, t('pricing.q.res.term'), t(desc.term));

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
        var cmp = [];
        if (kind === 'web') {
          bud = webBudget(d, booking);
          renderBudget('web', bud, 'web');
          if (booking) setText('pq-bnote', t('pricing.q.bnote.booking', { provider: cfg.provider }));
          var last = cfg.two ? 1 : 2;
          for (var r = 0; r <= last; r++) {
            var dd = webDesc(r, biz);
            var wb = webBudget(dd.d, booking);
            cmp.push({ name: t(dd.name), lo: wb.lo, hi: null, monthly: wb.monthly, covers: r >= rank, suggested: r === rank });
          }
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
          for (var s = 0; s < 3; s++) {
            var sb = storeBudget(PLANS[s], many, add);
            cmp.push({ name: t('pricing.store.' + PLANS[s] + '.name'), lo: sb.lo, hi: sb.hi, monthly: sb.monthly, covers: s >= rank, suggested: s === rank });
          }
        }
        budget.hidden = false;
        renderCompare(cmp);
        estimate = ' ' + t('pricing.q.wa.estimate', { initial: range(bud.lo, bud.hi), monthly: usd(bud.monthly) });
      } else if (multiAddon) {
        setText('pq-alt', t('pricing.q.alt.noprice'));
        budget.hidden = false;
        document.getElementById('pq-budget-lines').textContent = '';
        document.querySelector('#pq-budget .pq-h4').hidden = true;
      }
      if (show && d) document.querySelector('#pq-budget .pq-h4').hidden = false;

      // Avisos según el contenido, el plazo y el tipo de negocio
      var tips = [];
      var ready = checkedValue('ready');
      var when = checkedValue('when');
      if (ready === 'some') tips.push(t('pricing.q.tip.ready.some'));
      if (ready === 'none') tips.push(t('pricing.q.tip.ready.none'));
      if (when === 'asap') {
        if (kind === 'web' && !desc.two && id === 'pro') tips.push(t('pricing.q.tip.asap.pro', { term: t(desc.term) }));
        else tips.push(t('pricing.q.tip.asap', { term: t(desc.term) }));
      }
      if (kind === 'web' && cfg.two) tips.push(t('pricing.q.tip.twoplan'));
      if (kind === 'web' && biz !== 'other' && !booking) tips.push(t('pricing.q.tip.booking', { provider: cfg.provider }));
      renderTips(tips);

      var names = kind === 'web'
        ? ['webBiz', 'webShape', 'webExtra', 'webAddon', 'ready', 'when']
        : ['storeStores', 'storeProducts', 'storeExtra', 'storeAddon', 'ready', 'when'];
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
