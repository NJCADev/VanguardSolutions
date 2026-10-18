# Vanguard Solutions

Sitio web corporativo de Vanguard Solutions, una empresa de servicios
tecnológicos de Cartago, Costa Rica. Es un sitio estático bilingüe
(español e inglés) publicado en Firebase Hosting.

## Tecnologías

- HTML, CSS y JavaScript sin frameworks
- Firebase Hosting y Firebase Analytics
- EmailJS para el formulario de contacto
- Font Awesome para los iconos

## Estructura

| Carpeta | Contenido |
|---|---|
| `home/` | Página de inicio |
| `blogs/` | Blog y artículos |
| `services/` | Servicios |
| `products/` | Licencias y antivirus |
| `proyects/` | Casos de éxito |
| `contact/` | Formulario de contacto y preguntas frecuentes |
| `components/` | Header, footer, estilos globales y motor de idiomas |
| `lang/` | Traducciones: `es.json` y `en.json` |
| `assets/` | Imágenes |
| `scripts/` | Utilidades de desarrollo |

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

## Variables de entorno

Se definen en `.env` (no se sube a git). El script
`scripts/build-config.js` las convierte en `config.js`.

| Variable | Para qué sirve |
|---|---|
| `FIREBASE_API_KEY` | Clave de la API web de Firebase |
| `FIREBASE_AUTH_DOMAIN` | Dominio de autenticación |
| `FIREBASE_PROJECT_ID` | Identificador del proyecto |
| `FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento |
| `FIREBASE_MESSAGING_SENDER_ID` | Identificador de mensajería |
| `FIREBASE_APP_ID` | Identificador de la app web |
| `FIREBASE_MEASUREMENT_ID` | Identificador de Analytics |
| `EMAILJS_PUBLIC_KEY` | Clave pública de EmailJS |
| `EMAILJS_SERVICE_ID` | Servicio de correo de EmailJS |
| `EMAILJS_TEMPLATE_ID` | Plantilla del mensaje |

> Estos valores acaban en `config.js`, que el navegador descarga, por lo
> que son visibles para los visitantes. Protégelos restringiendo la
> clave de Firebase por dominio y limitando los dominios permitidos en
> EmailJS.

## Idiomas

El HTML está escrito en español. Cada texto traducible lleva un
atributo y su clave se define en ambos archivos de `lang/`:

- `data-i18n="clave"` para texto simple.
- `data-i18n-html="clave"` para texto con etiquetas (`<br>`, `<span>`).
- `data-i18n-attr="alt:clave"` para atributos como `alt` o `aria-label`.

Para añadir un texto nuevo: ponle el atributo en el HTML y agrega la
misma clave en `es.json` y en `en.json`. Si falta en el inglés, se
muestra en español.

El idioma inicial es el que el visitante eligió antes o, si no hay
elección, el de su navegador. Se guarda en `localStorage`.

## Despliegue

```bash
firebase deploy --only hosting
```

Antes de publicar, Firebase ejecuta `scripts/build-config.js` para
generar `config.js` a partir de `.env`.