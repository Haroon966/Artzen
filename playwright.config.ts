import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.GITHUB_ACTIONS,
  retries: process.env.GITHUB_ACTIONS ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    // GitHub Actions sets GITHUB_ACTIONS=true; locally reuse avoids port clashes.
    reuseExistingServer: process.env.GITHUB_ACTIONS !== "true",
    timeout: 120_000,
  },
});
