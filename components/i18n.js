/* ============================================================
   VANGUARD SOLUTIONS — I18N JS
   Selector de idioma ES / EN.
   - El HTML está escrito en español (mejor SEO y sin parpadeo).
   - Los textos traducibles llevan data-i18n / data-i18n-html /
     data-i18n-attr y sus claves viven en /lang/es.json y /lang/en.json.
   - Idioma inicial: el elegido antes (localStorage) o, si no hay,
     el del navegador (español → ES, cualquier otro → EN).
   ============================================================ */

(function () {
  'use strict';

  const SUPPORTED = ['es', 'en'];
  const STORAGE_KEY = 'vs_lang';
  const SCRIPT_URL = document.currentScript && document.currentScript.src;

  const dicts = {};
  let current = detect();
  let initialLoad = null;

  function detect() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (e) { /* localStorage bloqueado: seguimos sin persistencia */ }
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'es';
    return /^es/i.test(nav) ? 'es' : 'en';
  }

  function loadDict(lang) {
    if (dicts[lang]) return Promise.resolve(dicts[lang]);
    const url = new URL('../lang/' + lang + '.json', SCRIPT_URL || location.href).href;
    return fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((d) => (dicts[lang] = d))
      .catch((err) => {
        console.warn('i18n: no se pudo cargar ' + lang + '.json', err);
        return null;
      });
  }

  /** Traducción por clave; para textos con {n}, {total}… pasar params. */
  function t(key, params) {
    const d = dicts[current];
    let v = d && d[key];
    if (v == null) return null;
    if (params && typeof v === 'string') {
      v = v.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
    }
    return v;
  }

  function setText(el, value) {
    const old = el.textContent;
    const lead = old.match(/^\s*/)[0];
    const trail = old.match(/\s*$/)[0];
    el.textContent = lead + value + trail;
  }

  function apply(root) {
    const d = dicts[current];
    if (!d) return;
    root = root || document;

    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = d[el.getAttribute('data-i18n')];
      if (typeof v === 'string') setText(el, v);
    });

    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = d[el.getAttribute('data-i18n-html')];
      if (typeof v === 'string') el.innerHTML = v;
    });

    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.getAttribute('data-i18n-attr').split(';').forEach((pair) => {
        const i = pair.indexOf(':');
        const v = d[pair.slice(i + 1)];
        if (i > 0 && typeof v === 'string') el.setAttribute(pair.slice(0, i), v);
      });
    });

    document.documentElement.lang = current;

    // El efecto glitch duplica el texto en data-text: mantenerlo sincronizado
    document.querySelectorAll('[data-text]').forEach((el) => {
      el.setAttribute('data-text', el.textContent);
    });
  }

  /** Carga el diccionario del idioma activo y traduce la página. */
  function init() {
    if (!initialLoad) {
      initialLoad = loadDict(current).then((d) => {
        // El HTML ya viene en español: solo hay que reescribir si es otro idioma
        if (d && current !== 'es') apply(document);
        return d;
      });
    }
    return initialLoad;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang) || lang === current) return Promise.resolve();
    return loadDict(lang).then((d) => {
      if (!d) return;
      current = lang;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignorar */ }
      apply(document);
      document.dispatchEvent(new CustomEvent('vanguard:langchange', { detail: { lang } }));
    });
  }

  // Calentar la descarga del diccionario sin esperar a main.js
  initialLoad = null;
  loadDict(current);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('#lang-switch');
    if (btn) setLang(current === 'es' ? 'en' : 'es');
  });

  window.VanguardI18n = {
    init,
    t,
    apply,
    setLang,
    get lang() { return current; }
  };
})();
