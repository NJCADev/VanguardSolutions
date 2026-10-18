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

  /* ── FORMULARIO ─────────────────────────────────────────── */
  function initForm() {
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

    /* Validación en tiempo real */
    form.querySelectorAll('.form-input').forEach(input => {
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
        phone      : val('cf-phone')   || 'No indicado',
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

        // ✅ Éxito
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
      other   : 'Otro / Consulta General',
    })[v] || v || 'No especificado';
  }

  /* ── VALIDACIÓN ─────────────────────────────────────────── */
  function validateField(input) {
    const name  = input.name;
    const value = input.value.trim();
    const errEl = document.getElementById(`err-${name}`);
    let   error = '';

    if (input.hasAttribute('required') && !value) {
      error = tr('js.val.required', 'Este campo es obligatorio.');
    } else if (name === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
        error = tr('js.val.email', 'Ingresa un correo electrónico válido.');
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
    const fields = form.querySelectorAll('.form-input[required]');
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