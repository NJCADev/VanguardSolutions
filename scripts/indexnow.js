#!/usr/bin/env node
/* ============================================================
   VANGUARD SOLUTIONS — AVISO DE URL A BING (IndexNow)
   Envía las URL de sitemap.xml a IndexNow para que Bing y los
   demás buscadores que lo usan vuelvan a rastrearlas. Se corre
   DESPUÉS de desplegar, a mano:

     npm run indexnow                    envía todas las URL del sitemap
     npm run indexnow -- --dry           muestra qué enviaría, sin enviar
     npm run indexnow -- --only=blogs/   solo las URL que contengan «blogs/»

   La clave es el archivo de 32 caracteres hexadecimales que ya
   está en la raíz del sitio (<clave>.txt, con la clave adentro).
   No envía datos personales: solo direcciones públicas.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length) : '';

function fail(msg) {
  console.error('ERROR: ' + msg);
  process.exit(1);
}

// La clave: un archivo «<clave>.txt» en la raíz cuyo contenido es la propia clave
const keyFile = fs.readdirSync(ROOT).find((f) => {
  const m = /^([a-f0-9]{32})\.txt$/i.exec(f);
  return m && fs.readFileSync(path.join(ROOT, f), 'utf8').trim() === m[1];
});
if (!keyFile) fail('no encontré el archivo de la clave de IndexNow en la raíz del sitio.');
const key = keyFile.replace(/\.txt$/i, '');

// Las URL salen del sitemap, para no mantener otra lista
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
let urls = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
if (!urls.length) fail('sitemap.xml no tiene URL.');
if (only) urls = urls.filter((u) => u.includes(only));
if (!urls.length) fail('ninguna URL contiene «' + only + '».');

const host = new URL(urls[0]).host;
if (urls.some((u) => new URL(u).host !== host)) fail('el sitemap mezcla dominios distintos.');

const body = { host, key, keyLocation: 'https://' + host + '/' + keyFile, urlList: urls };

console.log('Sitio: ' + host + ' · URL: ' + urls.length + ' · clave: ' + keyFile);
urls.forEach((u) => console.log('  ' + u));

if (dry) {
  console.log('\n(--dry) No se envió nada.');
  process.exit(0);
}

fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body)
})
  .then((r) => {
    // 200 y 202 son éxito; 403 = clave no verificada (¿el archivo no está desplegado?); 422 = URL de otro sitio; 429 = demasiados envíos
    const meaning = { 200: 'enviado', 202: 'recibido (Bing validará la clave)', 400: 'solicitud mal formada', 403: 'clave no válida o archivo de la clave no desplegado', 422: 'URL que no pertenece al sitio', 429: 'demasiados envíos, espera un rato' };
    console.log('\nRespuesta: ' + r.status + ' — ' + (meaning[r.status] || r.statusText));
    process.exit(r.status === 200 || r.status === 202 ? 0 : 1);
  })
  .catch((e) => fail('no se pudo conectar con IndexNow: ' + e.message));
