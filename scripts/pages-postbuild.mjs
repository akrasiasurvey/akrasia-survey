// Post-build step for GitHub Pages: turn the TanStack Start SPA shell into
// index.html + 404.html and add .nojekyll so GitHub serves assets under
// underscore-prefixed paths (e.g. /_assets/) as-is.
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = "dist/client";
const shell = join(outDir, "_shell.html");

if (!existsSync(shell)) {
  console.error(
    `[pages-postbuild] Missing ${shell}. Did the SPA build run? ` +
      `Make sure GITHUB_PAGES=1 is set before \`vite build\`.`,
  );
  process.exit(1);
}

// index.html — served at the site root.
copyFileSync(shell, join(outDir, "index.html"));
// 404.html — GitHub Pages serves this for any unknown path; because it's the
// same SPA shell, the TanStack Router picks up the URL on the client and
// renders the correct route. Deep links and refreshes just work.
copyFileSync(shell, join(outDir, "404.html"));
// Tell GitHub Pages not to run Jekyll (which would strip files/folders
// starting with `_`, like `_shell.html` or Vite's future underscore chunks).
writeFileSync(join(outDir, ".nojekyll"), "");

console.log(
  "[pages-postbuild] Wrote index.html, 404.html and .nojekyll in dist/client/",
);