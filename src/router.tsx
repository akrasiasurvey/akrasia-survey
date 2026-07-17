import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Must match Vite `base` so client-side routes resolve correctly on
    // GitHub Pages (served under /akrasia-survey/).
    basepath: import.meta.env.BASE_URL,
  });

  return router;
};
