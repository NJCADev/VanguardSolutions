/* Recorta Font Awesome a los íconos que el sitio realmente usa.
 * Uso:  node scripts/subset-fontawesome.js
 *
 * Lee la hoja completa (scripts/vendor/fontawesome-all.min.css, FA 6.5.0, solo woff2),
 * busca las clases fa-* que aparecen en los HTML, JS, JSON de idiomas y CSS del sitio, y escribe
 * assets/vendor/fontawesome/css/all.min.css solo con esos íconos (las reglas base se conservan).
 *
 * Ejecútalo cada vez que agregues un ícono nuevo (por ejemplo <i class="fa-solid fa-xxx">).
 * Si una página muestra un cuadro vacío en vez de un ícono, falta correr este script.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', 'graphify-out', 'vendor', '.git', '.github', '.claude', '.agents', '.firebase']);
const OUT = path.join(root, 'assets', 'vendor', 'fontawesome', 'css', 'all.min.css');
const FULL = path.join(__dirname, 'vendor', 'fontawesome-all.min.css');

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (/\.(html|js|json|css)$/.test(e.name)) acc.push(full);
  }
  return acc;
}

const used = new Set();
for (const f of walk(root, [])) {
  if (path.resolve(f) === path.resolve(OUT)) continue;
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/fa-[a-z0-9-]+/g)) used.add(m[0]);
}

const css = fs.readFileSync(FULL, 'utf8');
const rule = /((?:\.fa-[a-z0-9-]+:before,?)+)\{content:"\\[0-9a-f]+"\}/g;
let total = 0, kept = 0;
const out = css.replace(rule, (all, sels) => {
  const list = sels.split(',').filter(Boolean);
  total += list.length;
  const keep = list.filter((s) => used.has(s.slice(1, -':before'.length)));
  kept += keep.length;
  return keep.length ? keep.join(',') + all.slice(sels.length) : '';
});

fs.writeFileSync(OUT, out);
console.log(`Font Awesome: ${(css.length / 1024).toFixed(0)} KB -> ${(out.length / 1024).toFixed(0)} KB (${kept} de ${total} íconos).`);
