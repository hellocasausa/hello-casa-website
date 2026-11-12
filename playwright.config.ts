import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:5173",
    headless: true,
    launchOptions: { args: ["--no-sandbox"] },
  },
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --host 127.0.0.1",
        url: "http://127.0.0.1:5173",
        reuseExistingServer: true,
        timeout: 15000,
      },
  workers: 1,
  reporter: "list",
});
