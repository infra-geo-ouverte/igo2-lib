import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'demo/e2e/src/**/*.spec.ts',
    supportFile: 'demo/e2e/support/e2e.ts',
    videosFolder: "demo/e2e/dist/videos",
    screenshotsFolder: "demo/e2e/dist/screenshots",
  }
});
