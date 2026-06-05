import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://localhost:8000",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 8000 --directory dist",
    port: 8000,
    timeout: 15000,
    reuseExistingServer: true,
  },
});
