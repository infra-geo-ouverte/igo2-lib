import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'geostyler-web-component': 'src/geostyler-web-component.ts'
      },
      formats: ['es'],
      fileName: (_format, entryName) => entryName
    }
  }
});
