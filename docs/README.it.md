# Floor to Playlist

[English](../README.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md)

Tutti i palchi → circa 30 brani → playlist Spotify privata. L’interfaccia include un selettore per tutte e cinque le lingue.

## Installazione

Node.js **22.16+** (consigliato 24), nessuna dipendenza. Apri un terminale nella cartella del progetto:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
node server.mjs
```

Prima dell’avvio, inserisci i tuoi valori in [`.env`](../.env.example) e salva con **Ctrl+S**:

- Nella [dashboard Spotify](https://developer.spotify.com/dashboard) crea un’app Web API e copia il valore in `SPOTIFY_CLIENT_ID`. **Il Client Secret non serve.**
- URI di reindirizzamento identico nella dashboard e in `.env`: `http://127.0.0.1:8888/callback`. Autorizza il tuo account in modalità sviluppo e rispetta i requisiti di accesso Spotify attuali.
- Apri http://127.0.0.1:8888 e scegli « Collega Spotify ».

## Utilizzo

Inserisci evento/data/città → copia la richiesta → cerca con ChatGPT e la ricerca Web → controlla le fonti → incolla solo gli artisti nel passaggio 02 (uno per riga) → collega Spotify → verifica i brani → crea la playlist. Nessun invio automatico a ChatGPT.

**API facoltativa:** apri « Alternativa: ricerca diretta tramite API ». Inserisci una [chiave API OpenAI](https://platform.openai.com/api-keys) separata in `OPENAI_API_KEY`. L’API ha costi aggiuntivi; abbonamento ChatGPT e credenziali Spotify non sostituiscono questa chiave.

## Problemi riscontrati e soluzioni

- **Chiave rifiutata:** usa la chiave OpenAI completa, non i dati Spotify. Salva, arresta con **Ctrl+C**, riavvia `node server.mjs`. Ricaricare la pagina non basta.
- **Viene usata ancora la vecchia chiave:** `.env` ora prevale sulle variabili Windows. Evita voci duplicate.
- **Client ID apparentemente assente:** il marcatore invisibile UTF-8 BOM viene ora rimosso automaticamente. Il file deve chiamarsi `.env`, non `.env.txt`.
- **Dopo il riavvio:** ricollega Spotify. Evento e artisti restano come bozza nella stessa scheda.
- **Porta occupata:** chiudi la vecchia istanza con Ctrl+C. **`npm.ps1` bloccato:** usa direttamente `node server.mjs` o `node --test`.
- **Secret divulgato:** scegli « Rotate client secret » nella dashboard Spotify. Non pubblicare `.env`, chiavi o screenshot con segreti.

## Limiti e GitHub

Oltre 30 artisti, la playlist si allunga (massimo 200 artisti); cataloghi piccoli possono produrre meno brani. Separa gli artisti B2B. Nomi ambigui o mancanti vengono segnalati e saltati. Se Spotify blocca i brani più ascoltati, vengono usati risultati di ricerca segnalati senza classifica garantita. Mercato predefinito: Germania. Verifica fonti e artisti.

Server locale su `127.0.0.1`, nessun database. Token Spotify in memoria; bozza nella scheda; lingua salvata nel browser. La ricerca API invia l’evento a OpenAI; Spotify riceve artisti e playlist. Nessun accesso automatico alle chat ChatGPT.

Test: `node --test`. La verifica completa delle API reali richiede i tuoi account e non è stata completata. Per GitHub, estrai lo ZIP e includi **tutti i file, anche `.github`, `.gitignore` e `.env.example`**. Il vero `.env` è escluso. Serve un server Node locale; GitHub Pages non lo esegue. Licenza [MIT](../LICENSE).
