/* Comprueba que las traducciones estén completas y coherentes.
 * Uso:  node scripts/check-i18n.js
 * Sale con código 1 si hay errores (así falla el pipeline de CI).
 *
 * Revisa:
 *  1. es.json y en.json son JSON válido.
 *  2. Ambos tienen exactamente las mismas claves.
 *  3. Cada clave usada en el HTML (data-i18n, data-i18n-html, data-i18n-attr)
 *     existe en los dos archivos.
 *  4. Las traducciones con HTML conservan las mismas etiquetas en ambos idiomas.
 *  5. Las listas (como las frases animadas) tienen la misma longitud.
 * Además avisa (sin fallar) de claves que ningún HTML usa.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const IGNORED_DIRS = new Set(['node_modules', 'graphify-out', '.git', '.agents', '.claude', '.firebase', '.github', 'lang']);

const errors = [];
const warnings = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  } catch (e) {
    errors.push(`${file}: JSON no válido (${e.message})`);
    return null;
  }
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (IGNORED_DIRS.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

const es = readJson('lang/es.json');
const en = readJson('lang/en.json');
if (!es || !en) {
  errors.forEach((e) => console.error('ERROR  ' + e));
  process.exit(1);
}

// 2. Mismas claves en ambos idiomas
const esKeys = new Set(Object.keys(es));
const enKeys = new Set(Object.keys(en));
for (const k of esKeys) if (!enKeys.has(k)) errors.push(`Falta en en.json: ${k}`);
for (const k of enKeys) if (!esKeys.has(k)) errors.push(`Falta en es.json: ${k}`);

// 4 y 5. Etiquetas HTML y listas coherentes
const tags = (s) => (String(s).match(/<[^>]+>/g) || []).join('');
for (const k of esKeys) {
  if (!enKeys.has(k)) continue;
  if (Array.isArray(es[k]) !== Array.isArray(en[k])) {
    errors.push(`${k}: es y en no son del mismo tipo (lista / texto)`);
  } else if (Array.isArray(es[k])) {
    if (es[k].length !== en[k].length) errors.push(`${k}: la lista tiene ${es[k].length} elementos en es y ${en[k].length} en en`);
  } else if (tags(es[k]) !== tags(en[k])) {
    errors.push(`${k}: las etiquetas HTML no coinciden entre es y en`);
  }
}

// 3. Claves usadas en el HTML
const used = new Set();
for (const file of htmlFiles(root)) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  const add = (key) => {
    used.add(key);
    if (!esKeys.has(key)) errors.push(`${rel}: la clave "${key}" no existe en es.json`);
    if (!enKeys.has(key)) errors.push(`${rel}: la clave "${key}" no existe en en.json`);
  };
  for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const pair of m[1].split(';')) {
      const i = pair.indexOf(':');
      if (i > 0) add(pair.slice(i + 1));
    }
  }
}

// Claves que nadie usa (las js.* y similares se usan desde JavaScript)
for (const k of esKeys) {
  if (!used.has(k) && !k.startsWith('js.') && !k.startsWith('counter.') && !k.startsWith('consent.')) warnings.push(`Clave sin usar: ${k}`);
}

finish();

function finish() {
  for (const w of warnings) console.warn('AVISO  ' + w);
  for (const e of errors) console.error('ERROR  ' + e);
  if (errors.length) {
    console.error(`\n${errors.length} error(es).`);
    process.exit(1);
  }
  console.log(`Traducciones OK: ${esKeys.size} claves, ${used.size} usadas en el HTML.`);
}
