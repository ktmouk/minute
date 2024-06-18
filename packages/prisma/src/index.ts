import type { PrismaClient } from "@prisma/client";
import type { ITXClientDenyList } from "@prisma/client/runtime/library";

export { Prisma } from "@prisma/client";
export { PrismaClient } from "@prisma/client";

export type TXPrismaClient = Omit<PrismaClient, ITXClientDenyList>;
