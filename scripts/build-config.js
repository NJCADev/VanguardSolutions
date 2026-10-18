/* Genera config.js a partir de .env.
 * Uso:  node scripts/build-config.js
 * (también se ejecuta solo antes de `firebase deploy`, ver firebase.json)
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

if (!fs.existsSync(envPath)) {
  console.error('Falta el archivo .env. Copia .env.example a .env y rellénalo.');
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
}

const required = [
  'FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID', 'FIREBASE_MEASUREMENT_ID',
  'EMAILJS_PUBLIC_KEY', 'EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_ID'
];
const missing = required.filter((k) => !env[k]);
if (missing.length) {
  console.error('Faltan variables en .env: ' + missing.join(', '));
  process.exit(1);
}

const config = {
  firebase: {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
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
