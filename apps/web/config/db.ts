import "server-only";

import { PrismaClient } from "@minute/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { serverEnv } from "../env/server.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: serverEnv.POSTGRES_PRISMA_URL,
});

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
