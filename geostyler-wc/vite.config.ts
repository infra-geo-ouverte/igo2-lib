import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// TODO: https://vite.dev/guide/build#library-mode
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    dts({ tsconfigPath: './tsconfig.lib.json' })
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'geostyler-web-component': 'src/geostyler-web-component.ts'
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`
    }
  }
});
