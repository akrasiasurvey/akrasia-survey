# dialogic-self-explorer-2

This project is configured to publish a static build to GitHub Pages using the `docs/` folder.

Quick steps to publish:

1. Install dependencies:

```bash
npm install
```

2. Build the static site (outputs to `docs/`):

```bash
npm run build:gh
```

3. Commit and push the `docs/` folder to your `main` (or chosen) branch, then enable GitHub Pages in the repository Settings:
   - Source: `Branch: main`, `Folder: /docs`

Notes:
- Vite is configured with a relative `base` so the site should work as a project page.
- If you want automated deploys, you can add a GitHub Action or use the `gh-pages` package instead.
