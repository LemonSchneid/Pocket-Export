import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      manifest: {
        name: "Pocket Local",
        short_name: "Pocket Local",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#111827",
      },
      workbox: {
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@mozilla/readability": fileURLToPath(
        new URL("./node_modules/@mozilla/readability/index.js", import.meta.url)
      ),
    },
  },
});
