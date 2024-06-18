import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    POSTGRES_PRISMA_URL: z.string().url().startsWith("postgres"),
    NEXTAUTH_URL: z.string().url().startsWith("http"),
    NEXTAUTH_SECRET: z.string(),
    ALLOWED_IPS: z.string().optional(),
    ALLOWED_GITHUB_IDS: z
      .string()
      .regex(/^[0-9,]+$/)
      .optional(),
    GITHUB_ID: z.string(),
    GITHUB_SECRET: z.string(),
    ORIGIN: z.string(),
  },
  experimental__runtimeEnv: {},
  skipValidation: process.env["SKIP_ENV_VALIDATION"] === "true",
  emptyStringAsUndefined: true,
});
