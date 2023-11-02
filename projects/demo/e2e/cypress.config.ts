import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'projects/demo/e2e/src/**/*.spec.ts',
    supportFile: 'projects/demo/e2e/support/e2e.ts',
    videosFolder: 'projects/demo/e2e/dist/videos',
    screenshotsFolder: 'projects/demo/e2e/dist/screenshots'
  }
});
