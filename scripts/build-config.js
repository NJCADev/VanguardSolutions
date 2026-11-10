/* Genera config.js a partir de .env.
 * Uso:  node scripts/build-config.js
 * (también se ejecuta solo antes de `firebase deploy`, ver firebase.json)
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

// Origen de los valores: el archivo .env (desarrollo local) y, si existen,
// las variables de entorno del sistema (CI: secretos de GitHub). Estas
// últimas tienen prioridad.
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

// Solo se publica lo que el sitio realmente usa: el ID de medición de GA4 y los datos
// públicos de EmailJS. La configuración web de Firebase (apiKey, appId…) no se expone
// porque el sitio no usa el SDK de Firebase.
const required = [
  'FIREBASE_MEASUREMENT_ID',
  'EMAILJS_PUBLIC_KEY', 'EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_ID'
];
for (const k of required) if (process.env[k]) env[k] = process.env[k];
const missing = required.filter((k) => !env[k]);
if (missing.length) {
  console.error('Faltan variables (.env o entorno): ' + missing.join(', ') + '. Copia .env.example a .env y rellénalo.');
  process.exit(1);
}

const config = {
  firebase: {
    measurementId: env.FIREBASE_MEASUREMENT_ID
  },
  emailjs: {
    publicKey: env.EMAILJS_PUBLIC_KEY,
    serviceId: env.EMAILJS_SERVICE_ID,
    templateId: env.EMAILJS_TEMPLATE_ID
  }
};

const out = '/* Generado por scripts/build-config.js desde .env — no editar ni subir a git. */\n' +
  'window.VS_CONFIG = Object.freeze(' + JSON.stringify(config, null, 2) + ');\n';
fs.writeFileSync(path.join(root, 'config.js'), out);
console.log('config.js generado (' + required.length + ' variables).');
