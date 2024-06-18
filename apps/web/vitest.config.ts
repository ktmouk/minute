import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "e2e"],
    coverage: {
      include: ["config/next-auth.ts", "src/middleware.ts"],
    },
  },
});
