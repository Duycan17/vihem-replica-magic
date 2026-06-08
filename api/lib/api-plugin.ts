import type { Plugin } from "vite";
import { handleApiRequest } from "./router";

export const apiPlugin = (): Plugin => ({
  name: "api-server",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/api/")) {
        next();
        return;
      }
      await handleApiRequest(req, res);
    });
  },
});
