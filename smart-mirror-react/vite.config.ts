import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pre-bundle the single "with-locales" moment build so every locale lives on
  // one instance (separate moment/locale/* imports inline private copies under
  // esbuild and lose the locale data — weekday names then stay English).
  optimizeDeps: {
    include: ["moment/min/moment-with-locales"]
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Browsers block cross-origin RSS fetches; the newsfeed module hits this
      // path and Vite forwards it to the New York Times RSS host.
      "/feed-nyt": {
        target: "https://rss.nytimes.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/feed-nyt/, "")
      }
    }
  }
});
