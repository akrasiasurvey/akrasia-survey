// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages builds set `GITHUB_PAGES=1` and `BASE_PATH` (e.g. `/repo/`).
// In that mode we produce a pure client-side SPA (no server) into
// `dist/client/`, which the workflow uploads to Pages.
const isPagesBuild = process.env.GITHUB_PAGES === "1";
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts.
    server: { entry: "server" },
    // On Pages we want a fully static SPA — no SSR, no server functions.
    ...(isPagesBuild ? { spa: { enabled: true } } : {}),
  },
  // Nitro (Cloudflare Worker output) is the default. Disable it for Pages so
  // the build produces only the client bundle under `dist/client/`.
  nitro: isPagesBuild ? false : undefined,
  vite: {
    base: basePath,
  },
});
