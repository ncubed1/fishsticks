import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// BUG: Build output does not work as expected
export default defineConfig({
  build: {
    lib: {
      entry: 'index.js',
      name: 'api',
      formats: ['es'],
      fileName: (format) => `api.${format}.js`,
    }
  },
  plugins: [wasm(), topLevelAwait()],
});