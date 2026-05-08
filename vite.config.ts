import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  version: string;
};

export default defineConfig({
  base: "/vagus-reset-coach/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        globPatterns: ["**/*.{html,css,js,svg,webmanifest}"],
        globIgnores: ["**/assets/*duckdb*"],
        sourcemap: false,
      },
      manifest: {
        name: "Vagus Reset Coach",
        short_name: "Vagus Coach",
        description:
          "Private two-minute breath coach with webcam rPPG and local HRV logging.",
        theme_color: "#f7f3ea",
        background_color: "#f7f3ea",
        display: "standalone",
        scope: "/vagus-reset-coach/",
        start_url: "/vagus-reset-coach/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.VITE_APP_VERSION ?? pkg.version,
    ),
    __APP_COMMIT__: JSON.stringify(process.env.VITE_APP_COMMIT ?? "local"),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "docs",
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@duckdb/duckdb-wasm")) {
            return "duckdb";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
