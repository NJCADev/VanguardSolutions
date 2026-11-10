/* Genera contact/countries.json: países, códigos de marcación y largos válidos
 * del número nacional. Se ejecuta a mano cuando se quiera refrescar la lista;
 * el sitio solo lee el archivo generado (no llama a ninguna API al visitarlo).
 *
 * Fuentes de datos (sin llaves ni cuentas):
 *  - códigos y largos de número: metadatos de libphonenumber-js (de Google)
 *  - nombres de país en español e inglés: Intl.DisplayNames de Node (datos ICU/CLDR)
 *
 * Uso:
 *   npm install --no-save libphonenumber-js
 *   node scripts/update-countries.js
 */
const fs = require('fs');
const path = require('path');

let meta;
try {
  meta = require('libphonenumber-js/metadata.min.json');
} catch (e) {
  console.error('Falta libphonenumber-js. Ejecuta primero:  npm install --no-save libphonenumber-js');
  process.exit(1);
}

const OUT = path.join(__dirname, '..', 'contact', 'countries.json');
const es = new Intl.DisplayNames(['es'], { type: 'region' });
const en = new Intl.DisplayNames(['en'], { type: 'region' });

// Ajustes pedidos para el sitio (los metadatos de Google también cuentan números gratuitos
// de otros largos que aquí no se usan en un formulario de contacto).
const OVERRIDE = { CR: [8] };

/** Convierte [8, "6-9", 11] en una lista plana de largos válidos. */
function lengths(raw) {
  const out = new Set();
  (raw || []).forEach((v) => {
    if (typeof v === 'number') out.add(v);
    else if (/^\d+-\d+$/.test(v)) {
      const [a, b] = v.split('-').map(Number);
      for (let i = a; i <= b; i++) out.add(i);
    }
  });
  return [...out].sort((a, b) => a - b);
}

const list = Object.entries(meta.countries)
  .map(([iso, data]) => ({
    c: iso,
    es: es.of(iso),
    en: en.of(iso),
    d: '+' + data[0],
    l: OVERRIDE[iso] || lengths(data[3])
  }))
  .filter((c) => c.l.length && c.en && c.en !== c.c)
  .sort((a, b) => a.en.localeCompare(b.en));

fs.writeFileSync(OUT, JSON.stringify(list) + '\n');
console.log(`contact/countries.json: ${list.length} países.`);
