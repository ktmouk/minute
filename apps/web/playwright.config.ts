import path from "path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const isCI = process.env["CI"] !== undefined;

dotenv.config({
  path: path.resolve(__dirname, ".env.e2e"),
});

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : 3,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec next start -p 4001",
    url: "http://localhost:4001",
    reuseExistingServer: !isCI,
  },
});
