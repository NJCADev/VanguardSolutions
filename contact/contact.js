/* ============================================================
   VANGUARD SOLUTIONS — CONTACT JS  (EmailJS v4)
   ============================================================ */

(function () {
  'use strict';

  /* ── CREDENCIALES EMAILJS ───────────────────────────────── */
  const CFG = (window.VS_CONFIG && window.VS_CONFIG.emailjs) || {};
  const EMAILJS_PUBLIC_KEY  = CFG.publicKey;
  const EMAILJS_SERVICE_ID  = CFG.serviceId;
  const EMAILJS_TEMPLATE_ID = CFG.templateId;

  /* ── NÚMERO DE WHATSAPP ─────────────────────────────────── */
  const WA_NUMBER = '50671358066';

  /* ── INIT EMAILJS (lazy, espera a que el SDK esté listo) ── */
  /** Texto del idioma activo; si no hay traducción, usa el español de respaldo. */
  function tr(key, fallback) {
    return (window.VanguardI18n && window.VanguardI18n.t(key)) || fallback;
  }

  function getEmailJS() {
    return new Promise((resolve, reject) => {
      if (typeof emailjs !== 'undefined') {
        try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch (e) {}
        return resolve(emailjs);
      }
      let attempts = 0;
      const interval = setInterval(() => {
        if (typeof emailjs !== 'undefined') {
          clearInterval(interval);
          try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch (e) {}
          resolve(emailjs);
        } else if (++attempts > 80) {
          clearInterval(interval);
          reject(new Error('EmailJS SDK no cargó. Verifica tu conexión a internet.'));
        }
      }, 100);
    });
  }

  /* ── ARRANQUE ───────────────────────────────────────────── */
  document.addEventListener('vanguard:ready', initContact);
  if (document.readyState !== 'loading') setTimeout(initContact, 100);

  function initContact() {
    if (window._contactInited) return;
    window._contactInited = true;
    initWhatsAppButton();
    initMap();
    initForm();
    initFaq();
    initFloatingLabels();
  }

    /* ======================================================
     BOTÓN DE WHATSAPP
     URL construida con percent-encoding literal en el código
     — sin emojis literales, sin encodeURIComponent, sin escapes
     — el navegador recibe la cadena ya lista para enviar
  ====================================================== */
  function initWhatsAppButton() {
    var waBtn = document.getElementById('wa-btn');
    if (!waBtn) return;

    waBtn.addEventListener('click', function () {
      var url =
        'https://wa.me/50671358066?text=' +
        '%E2%9A%A1%20' +
        '%C2%A1Hola%20equipo%20de%20Vanguard%20Solutions!%20' +
        '%F0%9F%91%8B%20' +
        'Encontr%C3%A9%20su%20sitio%20web%20y%20me%20interesa%20' +
        'saber%20m%C3%A1s%20sobre%20sus%20servicios.%20' +
        '%C2%BFPodr%C3%ADamos%20hablar%3F%20' +
        '%F0%9F%9A%80';

      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  /* ── MAPA (Google): solo se conecta a Google cuando el visitante pulsa el botón ── */
  function initMap() {
    const holder = document.getElementById('map-placeholder');
    const btn = document.getElementById('map-load');
    if (!holder || !btn) return;
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.className = 'map-iframe';
      f.src = holder.dataset.src;
      f.width = '100%';
      f.height = '420';
      f.title = tr('contact.048', 'Ubicación de Vanguard Solutions en Cartago, Costa Rica');
      f.setAttribute('aria-label', tr('contact.049', 'Google Maps mostrando Cartago, Costa Rica'));
      f.setAttribute('allowfullscreen', '');
      f.setAttribute('loading', 'lazy');
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
      holder.replaceWith(f);
    });
  }

  /* ── FORMULARIO ─────────────────────────────────────────── */
  /** Llegada desde la página de NovaTienda: ?servicio=ecommerce deja el servicio elegido y un mensaje de inicio. */
  function prefillFromUrl() {
    const wanted = new URLSearchParams(location.search).get('servicio');
    const select = document.getElementById('cf-service');
    if (!wanted || !select || !Array.from(select.options).some((o) => o.value === wanted)) return;
    select.value = wanted;
    const textarea = document.getElementById('cf-message');
    const text = wanted === 'ecommerce' ? tr('js.prefill.ecommerce', 'Hola, quiero una demo de NovaTienda para mi negocio. Tengo __ sucursales.') : '';
    if (textarea && text && !textarea.value) textarea.value = text;
  }

  const formOpenedAt = Date.now();
  function lastSentAt() {
    try { return Number(localStorage.getItem('vs_last_send')) || 0; } catch (e) { return 0; }
  }

  function initForm() {
    prefillFromUrl();
    const form      = document.getElementById('contact-form');
    const success   = document.getElementById('form-success');
    const resetBtn  = document.getElementById('form-reset-btn');
    const submitBtn = document.getElementById('form-submit');
    const textarea  = document.getElementById('cf-message');
    const charCount = document.getElementById('char-counter');
    const errorMsg  = document.getElementById('form-send-error');

    if (!form) return;

    /* Contador de caracteres */
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        const max = parseInt(textarea.getAttribute('maxlength')) || 1000;
        charCount.textContent = `${len} / ${max}`;
        charCount.classList.toggle('warning', len > max * 0.8);
        charCount.classList.toggle('danger',  len >= max);
      });
    }

    /* Nombre: solo letras y espacios. Teléfono: solo 8 números, con formato 8888-8888. */
    const nameInput  = document.getElementById('cf-name');
    const phoneInput = document.getElementById('cf-phone');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        const clean = nameInput.value.replace(/[^\p{L} ]/gu, '').replace(/ {2,}/g, ' ').replace(/^ /, '');
        if (clean !== nameInput.value) nameInput.value = clean;
      });
      nameInput.addEventListener('blur', () => { nameInput.value = nameInput.value.trim(); });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', () => { phoneInput.value = formatPhone(phoneInput.value); });
      initPhone();
    }

    /* Validación en tiempo real */
    form.querySelectorAll('.form-input:not(.phone-code)').forEach(input => {
      input.addEventListener('blur',  () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    /* ── SUBMIT ─────────────────────────────────────────── */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Anti-spam honeypot
      const trap = form.querySelector('[name="_trap"]');
      if (trap && trap.value) return;

      // Anti-spam: un formulario enviado en menos de 3 s desde que se abrió no lo llenó una persona,
      // y entre un envío y otro se pide esperar 60 s. (Frena formularios automáticos simples;
      // el control real contra abuso de la API está en el panel de EmailJS.)
      if (Date.now() - formOpenedAt < 3000) return;
      if (Date.now() - lastSentAt() < 60000) {
        showError(errorMsg, tr('js.err.wait', 'Espera un momento antes de enviar otro mensaje.'));
        return;
      }

      // Validar todos los campos
      if (!validateForm(form)) return;

      // Ocultar error previo
      showError(errorMsg, null);

      // Estado de carga
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      /* Datos para la plantilla EmailJS */
      const now = new Date();
      const params = {
        from_name  : val('cf-name'),
        from_email : val('cf-email'),
        reply_to   : val('cf-email'),
        company    : val('cf-company') || 'No indicada',
        phone      : val('cf-phone')   ? current.d + ' ' + val('cf-phone') : 'No indicado',
        service    : serviceLabel(val('cf-service')),
        message    : val('cf-message'),
        sent_at    : now.toLocaleString('es-CR', {
                       timeZone  : 'America/Costa_Rica',
                       dateStyle : 'full',
                       timeStyle : 'short',
                     }),
      };

      try {
        const ejs = await getEmailJS();
        const result = await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
        console.log('EmailJS OK:', result.status, result.text);

        try { localStorage.setItem('vs_last_send', String(Date.now())); } catch (e2) { /* ignorar */ }

        // ✅ Éxito: registrar el contacto en Analytics (solo la categoría de servicio, sin datos personales)
        if (window.VanguardAnalytics) {
          window.VanguardAnalytics.track('generate_lead', { form_name: 'contact', service: val('cf-service') });
        }

        form.setAttribute('aria-hidden', 'true');
        success.setAttribute('aria-hidden', 'false');
        success.style.display = 'flex';

      } catch (err) {
        console.error('EmailJS error completo:', err);

        let msg = tr('js.err.default', 'Ocurrió un error al enviar el mensaje.');
        if (err && err.text)    msg += ` ${tr('js.err.detail', 'Detalle:')} ${err.text}`;
        else if (err && err.message) msg += ` ${err.message}`;

        if      (err && err.status === 400) msg = tr('js.err.400', 'Credenciales incorrectas o plantilla inválida (error 400). Verifica el Service ID, Template ID y Public Key.');
        else if (err && err.status === 401) msg = tr('js.err.401', 'Public Key inválida (error 401). Revisa que copiaste correctamente tu Public Key de EmailJS.');
        else if (err && err.status === 404) msg = tr('js.err.404', 'Servicio o plantilla no encontrada (error 404). Verifica que el Service ID y Template ID existen en tu cuenta.');
        else if (err && err.status === 422) msg = tr('js.err.422', 'Variables de plantilla inválidas (error 422). Asegúrate que los nombres coincidan exactamente con los del código.');

        msg += tr('js.err.suffix', ' — Escríbenos directamente a vanguardsolutionscr@gmail.com o por WhatsApp.');
        showError(errorMsg, msg);

        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });

    /* ── RESET ──────────────────────────────────────────── */
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.querySelectorAll('.form-input').forEach(el => el.classList.remove('error', 'valid'));
        form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        if (charCount) charCount.textContent = '0 / 1000';
        showError(errorMsg, null);
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        success.setAttribute('aria-hidden', 'true');
        success.style.display = 'none';
        form.setAttribute('aria-hidden', 'false');
      });
    }
  }

  /* ── HELPERS ────────────────────────────────────────────── */
  function val(id) {
    return (document.getElementById(id)?.value || '').trim();
  }

  function showError(el, msg) {
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.hidden = false;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      el.textContent = '';
      el.hidden = true;
    }
  }

  function serviceLabel(v) {
    return ({
      apps    : 'Desarrollo de Apps Móviles',
      web     : 'Diseño y Desarrollo Web',
      hosting : 'Hosting de Alta Disponibilidad',
      domains : 'Gestión de Dominios',
      support : 'Soporte Técnico Especializado',
      ecommerce: 'Tienda en Línea (NovaTienda)',
      other   : 'Otro / Consulta General',
    })[v] || v || 'No especificado';
  }

  /* ── VALIDACIÓN ─────────────────────────────────────────── */
  /* ── TELÉFONO POR PAÍS ──────────────────────────────────── */
  const countries = [];           // { c, es, en, d, l } desde countries.json
  let current = { c: 'CR', d: '+506', l: [8] };

  /** Deja solo números (hasta el largo máximo del país) y los agrupa: 8888-8888, 888-888-8888… */
  function formatPhone(raw) {
    const max = Math.max.apply(null, current.l);
    const d = String(raw).replace(/\D/g, '').slice(0, max);
    const groups = { 7: [3, 4], 8: [4, 4], 9: [3, 3, 3], 10: [3, 3, 4] }[d.length];
    if (!groups) return d;
    const parts = []; let i = 0;
    groups.forEach(n => { parts.push(d.slice(i, i + n)); i += n; });
    return parts.join('-');
  }

  function langKey() { return document.documentElement.lang === 'en' ? 'en' : 'es'; }

  /** Rellena el selector (ordenado por nombre en el idioma activo) y mantiene el país elegido. */
  function renderCountries() {
    const select = document.getElementById('cf-phone-code');
    if (!select || !countries.length) return;
    const key = langKey();
    const keep = select.value || current.c;
    const sorted = countries.slice().sort((x, y) => x[key].localeCompare(y[key], key));
    select.textContent = '';
    sorted.forEach(c => {
      const o = document.createElement('option');
      o.value = c.c;
      o.dataset.dial = c.d;
      o.dataset.full = c[key] + ' (' + c.d + ')';
      o.dataset.short = c.c + ' ' + c.d;
      o.textContent = o.dataset.short;
      select.appendChild(o);
    });
    select.value = countries.some(c => c.c === keep) ? keep : 'CR';
    applyCountry();
  }

  /** En la lista abierta se ve el nombre completo; cerrada, solo "CR +506". */
  function showNames(select, full) {
    Array.from(select.options).forEach(o => { if (o.dataset.full) o.textContent = full ? o.dataset.full : o.dataset.short; });
  }

  function applyCountry() {
    const select = document.getElementById('cf-phone-code');
    const phone  = document.getElementById('cf-phone');
    const c = countries.find(x => x.c === select.value);
    if (c) current = c;
    if (phone) {
      phone.maxLength = Math.max.apply(null, current.l) + 3;
      phone.value = formatPhone(phone.value);
      if (phone.classList.contains('error')) validateField(phone);
    }
  }

  function initPhone() {
    const select = document.getElementById('cf-phone-code');
    if (!select) return;
    select.addEventListener('mousedown', () => showNames(select, true));
    select.addEventListener('focus',     () => showNames(select, true));
    select.addEventListener('blur',      () => showNames(select, false));
    select.addEventListener('change',    () => { applyCountry(); showNames(select, false); });
    document.addEventListener('vanguard:langchange', renderCountries);
    fetch('countries.json')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(list => { countries.push.apply(countries, list); renderCountries(); })
      .catch(() => { /* queda Costa Rica (+506) con 8 números */ });
  }

  function validateField(input) {
    const name  = input.name;
    const value = input.value.trim();
    const errEl = document.getElementById(`err-${name}`);
    let   error = '';

    if (input.hasAttribute('required') && !value) {
      error = tr('js.val.required', 'Este campo es obligatorio.');
    } else if (name === 'name' && value) {
      if (!/^\p{L}+(?: \p{L}+)*$/u.test(value))
        error = tr('js.val.name', 'Usa solo letras y espacios (sin números ni símbolos).');
    } else if (name === 'email' && value) {
      if (!/^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/.test(value))
        error = tr('js.val.email', 'Ingresa un correo electrónico válido.');
    } else if (name === 'phone' && value) {
      if (current.l.indexOf(value.replace(/\D/g, '').length) === -1) {
        const n = current.l.join(' / ');
        error = (window.VanguardI18n && window.VanguardI18n.t('js.val.phone', { n })) || ('Ingresa un número de ' + n + ' dígitos.');
      }
    } else if (name === 'service' && input.tagName === 'SELECT' && !value) {
      error = tr('js.val.service', 'Selecciona un servicio.');
    } else if (name === 'message' && value.length > 0 && value.length < 10) {
      error = tr('js.val.message', 'El mensaje debe tener al menos 10 caracteres.');
    }

    input.classList.toggle('error', !!error);
    input.classList.toggle('valid', !error && !!value);
    if (errEl) errEl.textContent = error;
    return !error;
  }

  function validateForm(form) {
    const fields = form.querySelectorAll('.form-input[required], #cf-phone');
    let ok = true;
    fields.forEach(f => { if (!validateField(f)) ok = false; });
    if (!ok) form.querySelector('.form-input.error')?.focus();
    return ok;
  }

  /* ── FAQ ────────────────────────────────────────────────── */
  function initFaq() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-question').forEach(q => {
          q.setAttribute('aria-expanded', 'false');
          const a = document.getElementById(q.getAttribute('aria-controls'));
          if (a) a.hidden = true;
        });
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          const ans = document.getElementById(btn.getAttribute('aria-controls'));
          if (ans) ans.hidden = false;
        }
      });
    });
  }

  /* ── FOCUS LABELS ───────────────────────────────────────── */
  function initFloatingLabels() {
    document.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('focus', () => input.closest('.form-group')?.classList.add('focused'));
      input.addEventListener('blur',  () => input.closest('.form-group')?.classList.remove('focused'));
    });
  }

})();