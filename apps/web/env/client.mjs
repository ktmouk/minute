import { createEnv } from "@t3-oss/env-nextjs";

export const clientEnv = createEnv({
  client: {},
  experimental__runtimeEnv: {},
  skipValidation: process.env["SKIP_ENV_VALIDATION"] === "true",
  emptyStringAsUndefined: true,
});
