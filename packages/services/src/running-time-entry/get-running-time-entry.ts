import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { runningTimeEntrySchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getRunningTimeEntry = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
      }),
      output: z.promise(runningTimeEntrySchema.nullable()),
    },
    async (input) => {
      return await db.runningTimeEntry.findFirst({
        where: {
          userId: input.userId,
          folder: {
            userId: input.userId,
          },
        },
      });
    },
  );
