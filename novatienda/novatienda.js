/* ============================================================
   VANGUARD SOLUTIONS — NOVATIENDA JS
   1. Recorrido por las pantallas (cliente / negocio, escritorio / móvil).
   Los textos vienen de /lang/*.json (claves novatienda.*).
   ============================================================ */

(function () {
  'use strict';

  const BASE = new URL('../assets/novatienda/', document.currentScript ? document.currentScript.src : location.href).href;

  // Orden de las pantallas del recorrido
  const SCREENS = [
    ['cliente', 'cliente-01-login'], ['cliente', 'cliente-02-registro'], ['cliente', 'cliente-03-recuperar-contrasena'],
    ['cliente', 'cliente-04-inicio'], ['cliente', 'cliente-05-tienda'], ['cliente', 'cliente-06-tienda-todos-los-productos'],
    ['cliente', 'cliente-07-contacto'], ['cliente', 'cliente-08-mi-cuenta'], ['cliente', 'cliente-09-favoritos'],
    ['cliente', 'cliente-10-carrito'], ['cliente', 'cliente-11-producto'], ['cliente', 'cliente-12-checkout'],
    ['negocio', 'negocio-01-dashboard'], ['negocio', 'negocio-02-pedidos'], ['negocio', 'negocio-03-productos'],
    ['negocio', 'negocio-04-inventario'], ['negocio', 'negocio-05-tiendas'], ['negocio', 'negocio-06-reportes'],
    ['negocio', 'negocio-07-facturacion'], ['negocio', 'negocio-08-configuracion'], ['negocio', 'negocio-09-clientes'],
    ['negocio', 'negocio-10-usuarios'], ['negocio', 'negocio-11-roles'], ['negocio', 'negocio-12-auditoria'],
    ['negocio', 'negocio-13-notificaciones']
  ].map(([group, id]) => ({ group, id }));

  const state = {
    group: 'cliente',
    device: 'both',
    id: 'cliente-01-login'
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const t = (key, params) => (window.VanguardI18n && window.VanguardI18n.t(key, params)) || '';
  const track = (name, params) => { if (window.VanguardAnalytics) window.VanguardAnalytics.track(name, params); };

  /* ── 1. RECORRIDO ─────────────────────────────────────── */
  const inGroup = () => SCREENS.filter((s) => s.group === state.group);

  function renderRail() {
    const rail = $('#nt-rail');
    if (!rail) return;
    rail.textContent = '';
    inGroup().forEach((s) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nt-rail-item';
      btn.dataset.id = s.id;
      btn.setAttribute('aria-current', s.id === state.id ? 'true' : 'false');
      const thumb = 'thumb-d';
      btn.innerHTML = '<span class="nt-rail-thumb"><img loading="lazy" alt="" width="64" height="38"></span><span class="nt-rail-title"></span>';
      $('img', btn).src = BASE + thumb + '/' + s.id + '.webp';
      $('.nt-rail-title', btn).textContent = t('novatienda.s.' + s.id + '.title');
      li.appendChild(btn);
      rail.appendChild(li);
    });
  }

  function renderScreen(opts) {
    const shot = $('#nt-shot');
    const shotM = $('#nt-shot-m');
    if (!shot || !shotM) return;

    const list = inGroup();
    const idx = Math.max(0, list.findIndex((s) => s.id === state.id));
    const src = BASE + 'desktop/' + state.id + '.webp';
    const srcM = BASE + 'mobile/' + state.id + '.webp';

    const apply = () => {
      shot.alt = t('novatienda.s.' + state.id + '.alt');
      shot.src = src;
      shotM.alt = t('novatienda.s.' + state.id + '.alt');
      shotM.src = srcM;
    };
    if (opts && opts.animate && shot.getAttribute('src') !== src) {
      const media = $('#nt-media');
      media.classList.add('is-swapping');
      const done = () => { media.classList.remove('is-swapping'); };
      shot.addEventListener('load', done, { once: true });
      setTimeout(() => { apply(); setTimeout(done, 1200); }, 140);
    } else {
      apply();
    }

    $('#nt-cap-title').textContent = t('novatienda.s.' + state.id + '.title');
    $('#nt-cap-desc').textContent = t('novatienda.s.' + state.id + '.desc');
    $('#nt-count').textContent = t('novatienda.count', { n: idx + 1, total: list.length });

    $$('.nt-rail-item').forEach((b) => b.setAttribute('aria-current', b.dataset.id === state.id ? 'true' : 'false'));
    const current = $('.nt-rail-item[aria-current="true"]');
    if (current && opts && opts.scrollRail) current.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    // Pantalla siguiente, lista de antemano
    const next = list[(idx + 1) % list.length];
    new Image().src = BASE + 'desktop/' + next.id + '.webp';
    new Image().src = BASE + 'mobile/' + next.id + '.webp';
  }

  function syncControls() {
    $$('button[data-group]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.group === state.group)));
  }

  function select(id, userAction) {
    const screen = SCREENS.find((s) => s.id === id);
    if (!screen) return;
    const groupChanged = screen.group !== state.group;
    state.id = id;
    state.group = screen.group;
    syncControls();
    if (groupChanged) renderRail();
    renderScreen({ animate: true, scrollRail: true });
    if (userAction) track('novatienda_view_screen', { screen_id: id, group: state.group, device: state.device });
  }

  function step(delta) {
    const list = inGroup();
    const idx = list.findIndex((s) => s.id === state.id);
    select(list[(idx + delta + list.length) % list.length].id, true);
  }

  function bindTour() {
    $$('button[data-group]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.group === state.group) return;
      state.group = b.dataset.group;
      state.id = inGroup()[0].id;
      syncControls();
      renderRail();
      renderScreen({ animate: true });
      track('novatienda_view_screen', { screen_id: state.id, group: state.group, device: state.device });
    }));

    const rail = $('#nt-rail');
    if (!rail) return;
    rail.textContent = '';
    inGroup().forEach((s) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nt-rail-item';
      btn.dataset.id = s.id;
      btn.setAttribute('aria-current', s.id === state.id ? 'true' : 'false');
      const thumb = 'thumb-d';
      btn.innerHTML = '<span class="nt-rail-thumb"><img loading="lazy" alt="" width="64" height="38"></span><span class="nt-rail-title"></span>';
      $('img', btn).src = BASE + thumb + '/' + s.id + '.webp';
      $('.nt-rail-title', btn).textContent = t('novatienda.s.' + s.id + '.title');
      li.appendChild(btn);
      rail.appendChild(li);
    });
  }

  function renderScreen(opts) {
    const shot = $('#nt-shot');
    const shotM = $('#nt-shot-m');
    if (!shot || !shotM) return;

    const list = inGroup();
    const idx = Math.max(0, list.findIndex((s) => s.id === state.id));
    const src = BASE + 'desktop/' + state.id + '.webp';
    const srcM = BASE + 'mobile/' + state.id + '.webp';

    const apply = () => {
      shot.alt = t('novatienda.s.' + state.id + '.alt');
      shot.src = src;
      shotM.alt = t('novatienda.s.' + state.id + '.alt');
      shotM.src = srcM;
    };
    if (opts && opts.animate && shot.getAttribute('src') !== src) {
      const media = $('#nt-media');
      media.classList.add('is-swapping');
      const done = () => { media.classList.remove('is-swapping'); };
      shot.addEventListener('load', done, { once: true });
      setTimeout(() => { apply(); setTimeout(done, 1200); }, 140);
    } else {
      apply();
    }

    $('#nt-cap-title').textContent = t('novatienda.s.' + state.id + '.title');
    $('#nt-cap-desc').textContent = t('novatienda.s.' + state.id + '.desc');
    $('#nt-count').textContent = t('novatienda.count', { n: idx + 1, total: list.length });

    $$('.nt-rail-item').forEach((b) => b.setAttribute('aria-current', b.dataset.id === state.id ? 'true' : 'false'));
    const current = $('.nt-rail-item[aria-current="true"]');
    if (current && opts && opts.scrollRail) current.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    // Pantalla siguiente, lista de antemano
    const next = list[(idx + 1) % list.length];
    new Image().src = BASE + 'desktop/' + next.id + '.webp';
    new Image().src = BASE + 'mobile/' + next.id + '.webp';
  }

  function syncControls() {
    $$('button[data-group]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.group === state.group)));
  }

  function select(id, userAction) {
    const screen = SCREENS.find((s) => s.id === id);
    if (!screen) return;
    const groupChanged = screen.group !== state.group;
    state.id = id;
    state.group = screen.group;
    syncControls();
    if (groupChanged) renderRail();
    renderScreen({ animate: true, scrollRail: true });
    if (userAction) track('novatienda_view_screen', { screen_id: id, group: state.group, device: state.device });
  }

  function step(delta) {
    const list = inGroup();
    const idx = list.findIndex((s) => s.id === state.id);
    select(list[(idx + delta + list.length) % list.length].id, true);
  }

  function bindTour() {
    $$('button[data-group]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.group === state.group) return;
      state.group = b.dataset.group;
      state.id = inGroup()[0].id;
      syncControls();
      renderRail();
      renderScreen({ animate: true });
      track('novatienda_view_screen', { screen_id: state.id, group: state.group, device: state.device });
    }));

    const rail = $('#nt-rail');
    rail.addEventListener('click', (e) => {
      const btn = e.target.closest('.nt-rail-item');
      if (btn) select(btn.dataset.id, true);
    });
    rail.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const items = $$('.nt-rail-item', rail);
      const i = items.indexOf(document.activeElement);
      const target = items[(i + keys[e.key] + items.length) % items.length];
      if (target) { target.focus(); select(target.dataset.id, true); }
    });

    $('#nt-prev').addEventListener('click', () => step(-1));
    $('#nt-next').addEventListener('click', () => step(1));

    // Los enlaces "Ver el pago", "Ver el inventario"… abren esa pantalla en el recorrido
    $$('[data-nt-show]').forEach((a) => a.addEventListener('click', () => select(a.dataset.ntShow, true)));
  }

  /* ── 2. MEDICIÓN DE LOS BOTONES (los enlaces de WhatsApp los gestiona main.js) ─ */
  function bindCtas() {
    $$('[data-cta]').forEach((a) => a.addEventListener('click', () => track('novatienda_cta', { cta: a.dataset.cta })));
  }

  /* ── ARRANQUE ─────────────────────────────────────────── */
  function renderAll() {
    renderRail();
    renderScreen();
    syncControls();
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    renderAll();
    bindTour();
    bindCtas();
    document.addEventListener('vanguard:langchange', renderAll);
  }

  document.addEventListener('vanguard:ready', start);
})();
