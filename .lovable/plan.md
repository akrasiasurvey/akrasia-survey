## Problema

Hai due workflow di GitHub Actions attivi contemporaneamente:

1. `.github/workflows/deploy-pages.yml` — quello corretto, che builda il progetto React/TanStack Start come sito statico e lo pubblica su Pages.
2. `.github/workflows/jekyll-gh-pages.yml` — aggiunto da te, ma **sbagliato per questo progetto**: prova a compilare la repo come sito Jekyll (Markdown + Liquid). Questa app non è Jekyll — è React/Vite/TanStack Start — quindi quel workflow o fallisce, o pubblica una versione "vuota" della repo sovrascrivendo il deploy corretto.

Inoltre, quando in **Settings → Pages** cambi "Source" a "GitHub Actions", GitHub **non** crea automaticamente un commit/push su `main`: attiva solo il canale di deploy. Il workflow parte solo quando c'è un push su `main` o un `workflow_dispatch` manuale.

## Piano

### 1. Rimuovere il workflow Jekyll
Elimino `.github/workflows/jekyll-gh-pages.yml`. Non serve e va in conflitto con `deploy-pages.yml`.

### 2. Rendere `deploy-pages.yml` avviabile manualmente (già presente)
Il file ha già `workflow_dispatch`, quindi dopo la rimozione potrai:
- andare su **Actions → "Deploy to GitHub Pages" → Run workflow → Branch: main**
per lanciarlo senza dover fare un commit.

### 3. Istruzioni per te (dopo che applico il piano)
1. **Settings → Pages → Source: GitHub Actions** (già fatto).
2. Apri la tab **Actions** della repo.
3. Se non vedi ancora nessun run: seleziona a sinistra il workflow **"Deploy to GitHub Pages"** e clicca **Run workflow → main → Run**.  
   In alternativa qualsiasi nuovo commit su `main` lo triggererà automaticamente.
4. Al termine del job `deploy`, l'URL del sito compare nella pagina del run e in **Settings → Pages**.

Nota: siccome è una *project page*, l'URL sarà tipo `https://<utente>.github.io/<nome-repo>/`. Il workflow gestisce già il `base_path` corretto tramite `actions/configure-pages`, quindi il routing di TanStack funzionerà su quel sotto-percorso.

### 4. Cosa NON modifico
- `deploy-pages.yml` — già corretto.
- `vite.config.ts`, `src/router.tsx` — già configurati per il `BASE_PATH` dinamico.
- La cartella `docs/` presente in repo: non è usata dal deploy (che pubblica `.output/public`), quindi non la tocco. Se preferisci puliamola in un secondo giro.
