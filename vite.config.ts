// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect GitHub Pages / static builds via env vars set by the CI workflow.
// `NITRO_PRESET=github-pages` (or `static`) switches nitro to a fully static
// output under `.output/public`; `BASE_PATH` is the sub-path the site is
// served from on GitHub Pages (e.g. `/repo-name/` for project sites, `/` for
// user/org sites or custom domains).
const nitroPreset = process.env.NITRO_PRESET;
const basePath = process.env.BASE_PATH ?? "/";
const isStaticBuild =
  nitroPreset === "github-pages" ||
  nitroPreset === "static" ||
  nitroPreset === "gitlab-pages";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // When building for GitHub Pages, hand off to nitro's `github-pages` preset
  // which prerenders every route, writes `.nojekyll` and outputs a pure static
  // site under `.output/public`. Otherwise leave nitro on its default preset.
  nitro: nitroPreset ? { preset: nitroPreset } : undefined,
  vite: {
    base: basePath,
  },
});
