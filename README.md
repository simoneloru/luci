# 🔆 Luce — movies we watched

Search movies by **title, director, actor or year** (e.g. `1980` → every movie from 1980),
mark them as **watched / watchlist**, with **poster**, **runtime** and your **thoughts** (1–5 ★ rating + notes).
Mobile-first, dark, installable as an app. Free hosting on GitHub Pages.

URL: `https://simoneloru.github.io/luci/`

## How it works
- Movie database: **TMDB** (free). You need a free v3 API key.
- No login: your list stays in the browser (`localStorage`) + **JSON export/import** to share it.
- The key **never goes into the repo**: paste it in the page (⚙) or set the `TMDB_API_KEY` repo secret for deploys.

## Run locally
Open `index.html` or serve the folder:
```powershell
npx serve .
```
Then: ⚙ → paste your TMDB v3 key → try `1980`, `Kubrick`, `Shining`…

## GitHub Pages deploy
1. Repo `simoneloru/luci`, branch `main`
2. (Optional) Settings → Secrets → `TMDB_API_KEY` = your v3 key
3. Settings → Pages → Source: **GitHub Actions**
4. Push to `main` → automatic deploy via `.github/workflows/pages.yml`

## Structure
`index.html` · `app.js` · `style.css` · `config.js` (placeholder) · `manifest.webmanifest` · `icon.svg`
