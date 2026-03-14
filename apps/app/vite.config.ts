import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import terminal from "vite-plugin-terminal";
export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: "**/*.svg",
      svgrOptions: { plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"] },
    }),
    wasm(),
    topLevelAwait(),
    terminal(),
  ],
  server: { port: 3000 },
});
