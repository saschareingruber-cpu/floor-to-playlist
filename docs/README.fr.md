# Floor to Playlist

[English](../README.md) · [Deutsch](README.de.md) · **Français** · [Italiano](README.it.md) · [Español](README.es.md)

Toutes les scènes → environ 30 titres → playlist Spotify privée. Sélecteur de langue intégré pour les cinq langues.

## Installation

Node.js **22.16+** (24 recommandé), aucune dépendance. Ouvrez un terminal dans le dossier du projet :

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
node server.mjs
```

Avant de démarrer, renseignez vos valeurs dans [`.env`](../.env.example) et enregistrez avec **Ctrl+S** :

- [Tableau de bord Spotify](https://developer.spotify.com/dashboard) : créez une application Web API et copiez sa valeur dans `SPOTIFY_CLIENT_ID`. **Aucun Client Secret nécessaire.**
- URI de redirection identique dans le tableau de bord et `.env` : `http://127.0.0.1:8888/callback`. Autorisez votre compte en mode développement et respectez les conditions d’accès Spotify en vigueur.
- Ouvrez http://127.0.0.1:8888 et choisissez « Connecter Spotify ».

## Utilisation

Saisissez événement/date/ville → copiez la demande → recherchez avec ChatGPT et sa recherche Web → vérifiez les sources → collez uniquement les artistes à l’étape 02 (un par ligne) → connectez Spotify → vérifiez les titres → créez la playlist. Rien n’est envoyé automatiquement à ChatGPT.

**Option API :** ouvrez « Alternative : recherche directe par API ». Renseignez une [clé API OpenAI](https://platform.openai.com/api-keys) distincte dans `OPENAI_API_KEY`. Des frais API s’appliquent ; un abonnement ChatGPT et les identifiants Spotify ne remplacent pas cette clé.

## Problèmes rencontrés et solutions

- **Clé refusée :** utilisez la clé OpenAI complète, pas les identifiants Spotify. Enregistrez, arrêtez avec **Ctrl+C**, relancez `node server.mjs`. Actualiser le navigateur ne suffit pas.
- **Ancienne clé toujours utilisée :** `.env` est désormais prioritaire sur les variables Windows. Évitez les entrées en double.
- **Client ID prétendument absent :** la marque UTF-8 BOM invisible est maintenant supprimée automatiquement. Le fichier doit s’appeler `.env`, pas `.env.txt`.
- **Après redémarrage :** reconnectez Spotify. Événement et artistes restent en brouillon dans le même onglet.
- **Port occupé :** fermez l’ancienne instance avec Ctrl+C. **`npm.ps1` bloqué :** utilisez directement `node server.mjs` ou `node --test`.
- **Secret divulgué :** choisissez « Rotate client secret » dans Spotify. Ne publiez jamais `.env`, les clés ou des captures contenant des secrets.

## Limites et GitHub

Plus de 30 artistes allongent la playlist (maximum 200 artistes) ; les petits catalogues peuvent produire moins de titres. Séparez les artistes B2B. Les noms ambigus ou absents sont signalés et ignorés. Si Spotify bloque les meilleurs titres, des résultats de recherche signalés sont utilisés sans classement garanti. Marché par défaut : Allemagne. Vérifiez les sources et les artistes.

Serveur local sur `127.0.0.1`, sans base de données. Jetons Spotify en mémoire ; brouillon dans l’onglet ; langue conservée dans le navigateur. La recherche API transmet l’événement à OpenAI ; Spotify reçoit artistes et playlist. Aucun accès automatique aux chats ChatGPT.

Tests : `node --test`. Le fonctionnement complet avec les API réelles nécessite vos comptes et n’a pas été entièrement vérifié. Pour GitHub, décompressez le ZIP et incluez **tous les fichiers, y compris `.github`, `.gitignore` et `.env.example`**. Le vrai `.env` est exclu. Serveur Node local requis ; GitHub Pages ne l’exécute pas. Licence [MIT](../LICENSE).
