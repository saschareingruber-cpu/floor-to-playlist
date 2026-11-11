# Floor to Playlist

[English](../README.md) · **Deutsch** · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md)

Alle Floors → rund 30 Tracks → private Spotify-Playlist. Die Oberfläche bietet alle fünf Sprachen über die Sprachwahl oben.

## Einrichtung

Node.js **22.16+** (empfohlen 24), keine Pakete nötig. Terminal im Projektordner öffnen:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
node server.mjs
```

Vor dem Start in [`.env`](../.env.example) die eigenen Werte eintragen und **Strg+S** drücken:

- [Spotify-Dashboard](https://developer.spotify.com/dashboard): App mit Web API erstellen, `SPOTIFY_CLIENT_ID` übernehmen. **Kein Client Secret nötig.**
- Redirect URI exakt `http://127.0.0.1:8888/callback`, im Dashboard und in `.env`. Bei Development Mode den eigenen Account freigeben; aktuelle Spotify-Zugriffsvoraussetzungen beachten.
- http://127.0.0.1:8888 öffnen und „Spotify verbinden“ wählen.

## Benutzung

Event mit Datum/Ort eingeben → Anfrage kopieren → in ChatGPT mit Websuche recherchieren lassen → Quellen prüfen → nur Artist-Namen in Schritt 02 einfügen (einer pro Zeile) → Spotify verbinden → Tracks prüfen → Playlist erstellen. Die Anfrage wird nicht automatisch an ChatGPT gesendet.

**Optional:** Unter „Alternative: direkt per API recherchieren“ recherchiert die App selbst. Dafür einen separaten [OpenAI-API-Schlüssel](https://platform.openai.com/api-keys) als `OPENAI_API_KEY` eintragen. API-Nutzung kostet extra; ChatGPT-Abo und Spotify-Zugangsdaten ersetzen diesen Schlüssel nicht.

## Die bisherigen Stolpersteine

- **Schlüssel abgelehnt:** vollständigen OpenAI-Schlüssel statt Spotify-Daten eintragen. Speichern, Server mit **Strg+C** stoppen, `node server.mjs` neu starten. Browser-Neuladen allein genügt nicht.
- **Alter Schlüssel trotz Änderung:** `.env` hat jetzt Vorrang vor Windows-Umgebungsvariablen; doppelte Einträge vermeiden.
- **Client ID fehlt trotz Eintrag:** unsichtbare UTF-8-BOM wird jetzt automatisch entfernt. Datei muss `.env` heißen, nicht `.env.txt`.
- **Nach Neustart:** Spotify erneut verbinden. Event und Artists bleiben im selben Tab als Entwurf erhalten.
- **Port belegt:** das bisherige App-Terminal mit Strg+C beenden; nicht mehrere Instanzen starten. **`npm.ps1` blockiert:** direkt `node server.mjs` bzw. `node --test` verwenden.
- **Secret veröffentlicht:** im Spotify-Dashboard „Rotate client secret“ wählen. `.env`, Schlüssel und Screenshots mit Secrets niemals hochladen.

## Grenzen und GitHub

Mehr als 30 Artists ergeben eine längere Playlist (max. 200 Artists). Kleine Kataloge ergeben eventuell weniger Tracks. B2B-Artists einzeln eintragen; gleichnamige/fehlende Artists werden ausgelassen und angezeigt. Wenn Spotify Top-Tracks sperrt, nutzt die App gekennzeichnete Suchtreffer ohne garantierte Rangfolge. Standardmarkt: Deutschland. Recherche und Artist-Zuordnung prüfen.

Lokal auf `127.0.0.1`, keine Datenbank. Spotify-Tokens nur im RAM, Entwurf im Browser-Tab, Sprache im Browser gespeichert. API-Recherche sendet Eventdaten an OpenAI; Spotify erhält Artists und Playlist. Kein automatischer ChatGPT-Zugriff.

Tests: `node --test`. Live-API-Zugriff benötigt eigene Konten und wurde nicht vollständig verifiziert. Für GitHub ZIP entpacken und **alle enthaltenen Dateien einschließlich `.github`, `.gitignore` und `.env.example`** übernehmen. Die echte `.env` ist ausgeschlossen. Lokaler Node-Server erforderlich; GitHub Pages führt ihn nicht aus. Lizenz: [MIT](../LICENSE).
