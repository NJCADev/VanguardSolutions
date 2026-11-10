# Vanguard Solutions

Sitio web corporativo de Vanguard Solutions, una empresa de servicios
tecnológicos de Cartago, Costa Rica. Es un sitio estático bilingüe
(español e inglés), instalable como PWA y publicado en Firebase Hosting
en <https://vanguardsolutionscr.com>.

## Tecnologías

- HTML, CSS y JavaScript sin frameworks ni dependencias de npm.
- Firebase Hosting (cabeceras de seguridad y redirecciones en `firebase.json`).
- Google Analytics 4, solo después de que el visitante acepte las cookies.
- EmailJS para el formulario de contacto.
- Tipografías (Orbitron, Montserrat, Rajdhani) y Font Awesome alojados en el propio sitio.
- GitHub Actions para revisar, previsualizar y desplegar.

## Estructura

| Carpeta o archivo | Contenido |
|---|---|
| `home/` | Página de inicio |
| `services/` | Servicios |
| `products/` | Licencias y antivirus |
| `proyects/` | Portafolio: NovaTienda como proyecto destacado y botón para cotizar |
| `novatienda/` | Página propia de NovaTienda (recorrido por la plataforma) |
| `blogs/` | Blog y artículos |
| `contact/` | Formulario de contacto, preguntas frecuentes y `countries.json` (códigos de país) |
| `privacy/` | Política de privacidad |
| `components/` | Header, footer, estilos globales, motor de idiomas y aviso de cookies |
| `lang/` | Traducciones: `es.json` y `en.json` |
| `assets/` | Imágenes (`icons/`, `novatienda/`, `home/`) y recursos de terceros alojados aquí (`vendor/`) |
| `scripts/` | Utilidades de desarrollo (ver más abajo) |
| `.github/workflows/` | CI, vista previa, despliegue y monitoreo |
| `main.js` | Lógica común: botón flotante de WhatsApp, contadores, registro del service worker |
| `index.html`, `404.html` | Redirección de la raíz y página de error |
| `robots.txt`, `sitemap.xml` | Para buscadores |
| `manifest.webmanifest`, `sw.js` | PWA: manifiesto y service worker |
| `firebase.json` | Hosting: CSP, cabeceras, caché y redirecciones |

## Puesta en marcha

1. Clona el repositorio.
2. Copia `.env.example` a `.env` y rellena los valores.
3. Genera la configuración del sitio:

   ```bash
   node scripts/build-config.js
   ```

4. Sirve el sitio en local (no funciona abriendo los archivos con doble clic):

   ```bash
   python -m http.server 5173
   ```

5. Abre `http://localhost:5173/home/home.html`.

> Ese servidor no aplica las cabeceras de `firebase.json` (CSP, caché).
> Para probarlas, usa un servidor que las lea o la vista previa que
> crea cada PR.

## Variables de entorno

Se definen en `.env` (no se sube a git). El script
`scripts/build-config.js` las convierte en `config.js`, que tampoco se sube.

| Variable | Para qué sirve |
|---|---|
| `FIREBASE_MEASUREMENT_ID` | ID de medición de Google Analytics 4 (empieza con `G-`) |
| `EMAILJS_PUBLIC_KEY` | Clave pública de EmailJS |
| `EMAILJS_SERVICE_ID` | Servicio de correo de EmailJS |
| `EMAILJS_TEMPLATE_ID` | Plantilla del mensaje |

> `config.js` se descarga en el navegador, así que estos valores son
> visibles para los visitantes. Por eso solo se publica lo que el sitio usa
> (no la configuración web de Firebase) y en EmailJS hay que **limitar el
> dominio permitido** (Account → Security → Domains) y dejar desactivado el
> uso desde aplicaciones que no sean un navegador.

En GitHub Actions los mismos valores salen de los **secretos del repositorio**:
`EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`,
`FIREBASE_MEASUREMENT_ID`, `FIREBASE_PROJECT_ID` y
`FIREBASE_SERVICE_ACCOUNT_VANGUARD_SOLUTIONS_B9509` (la cuenta de despliegue).

## Idiomas

El HTML está escrito en español. Cada texto traducible lleva un
atributo y su clave se define en ambos archivos de `lang/`:

- `data-i18n="clave"` para texto simple.
- `data-i18n-html="clave"` para texto con etiquetas (`<br>`, `<span>`).
- `data-i18n-attr="alt:clave"` para atributos como `alt` o `aria-label`.

Para añadir un texto nuevo: ponle el atributo en el HTML (con el texto en
español dentro, porque el español no se aplica por JavaScript) y agrega la
misma clave en `es.json` y en `en.json`.

El idioma inicial es el que el visitante eligió antes o, si no hay
elección, el de su navegador. Se guarda en `localStorage` (`vs_lang`).

Comprobación de traducciones (también corre en el CI):

```bash
node scripts/check-i18n.js
```

## Scripts

| Script | Para qué sirve |
|---|---|
| `scripts/build-config.js` | Genera `config.js` desde `.env` o desde las variables de entorno |
| `scripts/check-i18n.js` | Revisa que `es.json` y `en.json` coincidan y que todas las claves usadas existan |
| `scripts/update-countries.js` | Regenera `contact/countries.json` (países, códigos y largos de teléfono). Requiere `npm install --no-save libphonenumber-js` |
| `scripts/subset-fontawesome.js` | Recorta Font Awesome a los íconos usados. **Córrelo cada vez que agregues un ícono nuevo**; si no, saldrá vacío |

## Funciones del sitio

- **Formulario de contacto:** valida nombre (letras y espacios), correo y teléfono con
  selector de país (largo y formato según el país). Tiene anti-spam (campo trampa,
  3 s mínimos y 60 s entre envíos) y muestra un aviso de privacidad.
- **Botón flotante de WhatsApp:** se crea desde `main.js` (número en la constante `WA_NUMBER`).
- **Mapa de Contacto:** se carga solo cuando el visitante pulsa «Mostrar mapa».
- **Cookies y analítica:** `components/consent.js` muestra el aviso, carga Google Analytics
  solo si se acepta y guarda la decisión con una versión (`vs_consent_v`); si cambia la
  versión, se vuelve a preguntar. Eventos personalizados: `generate_lead`, `click_whatsapp`,
  `click_email`, `cta_click` y `language_change`.
- **PWA:** `sw.js` usa «red primero» y guarda copia de las páginas visitadas para usarlas
  sin conexión; el manifiesto y los íconos están en la raíz y en `assets/icons/`.
- **SEO:** cada página tiene título, descripción, URL canónica y Open Graph; el inicio
  incluye datos estructurados (JSON-LD). `sitemap.xml` y `robots.txt` están en la raíz.

## Seguridad

- **CSP estricta** en `firebase.json`: sin scripts ni estilos en línea, sin `eval`. No
  agregues `style="..."` ni manejadores `onclick=`: usa clases CSS y `addEventListener`
  (el CI rechaza los manejadores en línea).
- Casi no hay terceros: Google Analytics (con consentimiento), la API de EmailJS al enviar el
  formulario, el mapa de Google (con un clic) y los enlaces a `wa.me`. Fuentes, íconos,
  el SDK de EmailJS y las fotos se sirven desde el propio sitio.
- Otras cabeceras: HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
- Sin secretos en git: `.env` y `config.js` están en `.gitignore` y el CI revisa el historial con gitleaks.

## Rendimiento

- Imágenes en WebP; las capturas de NovaTienda tienen variantes pequeñas
  (`assets/novatienda/desktop-md/` y `mobile-sm/`) que se eligen con `srcset`.
- Las fuentes (`.woff2`) se cachean un año; las hojas de estilo y scripts, una hora.
- Font Awesome recortado a los íconos usados (ver `scripts/subset-fontawesome.js`).
- Si cambias un archivo de fuente, cámbiale el nombre para que no quede la copia antigua en caché.

## Flujo de trabajo y CI/CD

La rama `main` está protegida: **todo cambio entra por Pull Request** y debe pasar el check `checks`.

| Workflow | Cuándo corre | Qué hace |
|---|---|---|
| `ci.yml` | En cada PR y push a `main` | Traducciones, manejadores en línea y búsqueda de secretos (gitleaks) |
| `preview.yml` | En cada PR (no en forks ni Dependabot) | Publica una vista previa en un canal de Firebase y comenta la URL |
| `deploy.yml` | Al fusionar en `main` | Despliega a producción |
| `uptime.yml` | Cada 30 minutos | Comprueba que las páginas respondan |

- Las acciones de GitHub están **fijadas por hash**; Dependabot propone las actualizaciones cada semana.
- Al fusionar un PR en `main` el sitio se publica solo.

## Despliegue manual

Normalmente no hace falta (el despliegue es automático). Si lo necesitas:

```bash
firebase deploy --only hosting
```

Antes de publicar, Firebase ejecuta `scripts/build-config.js` para generar
`config.js`. Las carpetas `.claude/`, `.agents/`, `scripts/` y `graphify-out/` no se publican.

## Dominio y DNS

El dominio se gestiona en Cloudflare (registros en «DNS only», no con proxy, para que
Firebase pueda emitir el certificado). `www.vanguardsolutionscr.com` redirige a
`vanguardsolutionscr.com`. Los subdominios `api`, `app` y `nova-tienda` apuntan a otros servicios.
