# Floor to Playlist

[English](../README.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · **Español**

Todos los escenarios → unos 30 temas → playlist privada de Spotify. La interfaz permite elegir entre los cinco idiomas.

## Instalación

Node.js **22.16+** (24 recomendado), sin dependencias. Abre un terminal en la carpeta del proyecto:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
node server.mjs
```

Antes de iniciar, introduce tus valores en [`.env`](../.env.example) y guarda con **Ctrl+S**:

- En el [panel de Spotify](https://developer.spotify.com/dashboard), crea una app Web API y copia su valor en `SPOTIFY_CLIENT_ID`. **No se necesita Client Secret.**
- URI de redirección idéntica en el panel y `.env`: `http://127.0.0.1:8888/callback`. Autoriza tu cuenta en modo desarrollo y respeta los requisitos de acceso actuales de Spotify.
- Abre http://127.0.0.1:8888 y elige « Conectar Spotify ».

## Uso

Introduce evento/fecha/ciudad → copia la solicitud → investiga con ChatGPT y búsqueda web → comprueba las fuentes → pega solo los artistas en el paso 02 (uno por línea) → conecta Spotify → revisa los temas → crea la playlist. No se envía nada automáticamente a ChatGPT.

**API opcional:** abre « Alternativa: investigar directamente por API ». Introduce una [clave API de OpenAI](https://platform.openai.com/api-keys) independiente en `OPENAI_API_KEY`. La API genera costes adicionales; una suscripción ChatGPT y las credenciales Spotify no sustituyen esta clave.

## Problemas encontrados y soluciones

- **Clave rechazada:** usa la clave completa de OpenAI, no los datos Spotify. Guarda, detén con **Ctrl+C** y reinicia `node server.mjs`. Recargar el navegador no basta.
- **Se sigue usando la clave antigua:** `.env` ahora tiene prioridad sobre las variables Windows. Evita entradas duplicadas.
- **Client ID supuestamente ausente:** la marca invisible UTF-8 BOM se elimina automáticamente. El archivo debe llamarse `.env`, no `.env.txt`.
- **Después de reiniciar:** vuelve a conectar Spotify. Evento y artistas se conservan como borrador en la misma pestaña.
- **Puerto ocupado:** cierra la instancia anterior con Ctrl+C. **`npm.ps1` bloqueado:** usa directamente `node server.mjs` o `node --test`.
- **Secret expuesto:** elige « Rotate client secret » en Spotify. Nunca publiques `.env`, claves ni capturas con secretos.

## Límites y GitHub

Más de 30 artistas alargan la playlist (máximo 200 artistas); los catálogos pequeños pueden generar menos temas. Separa los artistas B2B. Los nombres ambiguos o ausentes se muestran y se omiten. Si Spotify bloquea los temas populares, se usan resultados de búsqueda señalados sin clasificación garantizada. Mercado predeterminado: Alemania. Comprueba fuentes y artistas.

Servidor local en `127.0.0.1`, sin base de datos. Tokens Spotify en memoria; borrador en la pestaña; idioma guardado en el navegador. La búsqueda API envía el evento a OpenAI; Spotify recibe artistas y playlist. Sin acceso automático a los chats ChatGPT.

Pruebas: `node --test`. La verificación completa de las API reales requiere tus cuentas y no se ha completado. Para GitHub, extrae el ZIP e incluye **todos los archivos, incluidos `.github`, `.gitignore` y `.env.example`**. El verdadero `.env` está excluido. Requiere servidor Node local; GitHub Pages no lo ejecuta. Licencia [MIT](../LICENSE).
