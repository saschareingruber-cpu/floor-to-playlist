# Floor to Playlist

**Every floor. One playlist.** Turn an event line-up into a private Spotify playlist of about 30 tracks.

**English** · [Deutsch](docs/README.de.md) · [Français](docs/README.fr.md) · [Italiano](docs/README.it.md) · [Español](docs/README.es.md)

The website, generated ChatGPT requests, status messages and errors support all five languages. Choose a language in the header; your browser remembers it.

## Quick start

Node.js **22.16+** (24 recommended). No dependencies or package installation. Open PowerShell inside this project:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
node server.mjs
```

Before starting, fill in your own values using [the example](.env.example) and **save with Ctrl+S**:

- Create a Web API app in the [Spotify dashboard](https://developer.spotify.com/dashboard). Set its Client ID as `SPOTIFY_CLIENT_ID`. **No Client Secret needed**: sign-in uses PKCE.
- Set the exact redirect URI `http://127.0.0.1:8888/callback` in both the dashboard and `.env`. In development mode, allow your account and follow Spotify's current account/access requirements.
- Open **http://127.0.0.1:8888** and connect Spotify. Use this address consistently, rather than `localhost`.

On macOS/Linux, copy the example using `cp .env.example .env` only if no configuration exists, edit it in your editor, then run `node server.mjs`.

## Recommended: ChatGPT text workflow

Enter event/date/city → copy the prepared request → paste into ChatGPT and research with web search → verify sources → paste **only artist names, one per line**, into step 02 → connect Spotify → preview tracks → create playlist. The app does not send the request to ChatGPT automatically. This workflow requires **no OpenAI API key in the app**.

**Optional API search:** expand “Alternative: research directly via API”. Set a separate [OpenAI API key](https://platform.openai.com/api-keys) as `OPENAI_API_KEY`. API charges are separate from a ChatGPT subscription. Spotify credentials cannot be used here. `OPENAI_MODEL` defaults to `gpt-4.1` and must support Responses API web search.

## Troubleshooting from setup

| Problem | Fix |
| --- | --- |
| OpenAI key rejected | Use a complete OpenAI API key, not Spotify credentials. Save, stop with **Ctrl+C**, restart `node server.mjs`. Reloading the browser alone is insufficient. |
| Old key still used | Project `.env` now overrides inherited Windows environment variables. Avoid duplicate entries; an empty value disables that setting. |
| Spotify Client ID appears missing | The loader now strips the invisible UTF-8 BOM that caused this. Check the file is named `.env`, not `.env.txt`. |
| Spotify disconnected after restart | Reconnect; tokens only live in server memory. Event and artist drafts survive reload/sign-in within the same tab. |
| Port 8888 occupied | Stop the previous instance in its terminal with Ctrl+C; run one instance only. |
| PowerShell blocks `npm.ps1` | Use `node server.mjs` and `node --test` directly. |
| Client Secret exposed in a screenshot | Use **Rotate client secret** in Spotify. Never upload real `.env`, keys or screenshots containing secrets. |
| API access/quota error | Check the provider's permissions, account eligibility and quota. The text workflow avoids the OpenAI API requirement. |

## Behaviour and privacy

- Round-robin track selection across every artist, with no floor priority. More than 30 artists means a longer playlist (up to 200 artists). Small catalogues may yield fewer tracks; shared tracks appear once.
- Split B2B sets into individual names; retain established bands/duos. Missing or ambiguous artists are reported and skipped. Check the preview for incorrect matches.
- Spotify may restrict top-track endpoints. Clearly labelled search results are used when unavailable; a true popularity ranking is then not guaranteed. Default market: Germany.
- Line-up completeness and correct artist matching are not guaranteed. Review sources and tracks before export. Retrying the same preview reuses its playlist.
- Local-only server on `127.0.0.1`, no database. Tokens stay in RAM, drafts in tab storage, language in browser storage. Optional API research sends event data to OpenAI; Spotify receives artist queries and playlist data. No automatic access to ChatGPT chats.

## Tests and GitHub

```sh
node --test
```

Tests cover selection, translations, configuration and mocked sign-in/export. Real Spotify/OpenAI account access is not fully verified. GitHub Actions runs tests on Windows/Linux with Node 22/24.

Extract the release ZIP and upload **all included files**, including hidden `.github`, `.gitignore` and `.env.example`. The real `.env` is excluded. Suggested repository name: `floor-to-playlist`; description: “Multilingual event line-up to Spotify playlist app, with ChatGPT text workflow and optional API research.”

This is a local Node app; GitHub Pages cannot run its server. [MIT license](LICENSE).
