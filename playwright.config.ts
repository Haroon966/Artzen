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
    // Dedicated port so `reuseExistingServer` does not attach to an unrelated app on :3000.
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    // Static `out/` avoids `.next/dev/lock` clashes when a local `next dev` is already running.
    command: "npm run build && npx --yes serve@14 out -l 4173",
    url: "http://127.0.0.1:4173/shop/",
    reuseExistingServer: process.env.GITHUB_ACTIONS !== "true",
    timeout: 180_000,
  },
});
