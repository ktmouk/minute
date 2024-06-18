import "server-only";

import type { PrismaClient } from "@minute/prisma";

type Options = {
  db: PrismaClient;
  currentUserId: string | undefined;
};

export const createInnerContext = ({ db, currentUserId }: Options) => {
  return { db, currentUserId };
};
