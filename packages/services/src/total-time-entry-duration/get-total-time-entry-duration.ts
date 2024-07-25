import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getTotalTimeEntryDuration = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
      }),
      output: z.promise(z.number()),
    },
    async (input) => {
      const result = await db.timeEntry.aggregate({
        _sum: {
          duration: true,
        },
        where: {
          task: {
            userId: input.userId,
            folder: {
              userId: input.userId,
            },
          },
        },
      });
      return result._sum.duration ?? 0;
    },
  );
