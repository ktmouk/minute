import "server-only";

import type { PrismaClient } from "../generated/prisma/client";

export { Prisma, PrismaClient } from "../generated/prisma/client";

export type TXPrismaClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;
