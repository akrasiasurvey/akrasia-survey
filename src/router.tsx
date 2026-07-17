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
    // With Vite `base: './'` the app uses relative asset URLs, so the router
    // basepath is a plain root — this keeps deep links working on GitHub
    // Pages regardless of the repository name.
    basepath: "/",
  });

  return router;
};
