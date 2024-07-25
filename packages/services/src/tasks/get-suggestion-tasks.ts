import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { taskSchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

const escapeLike = (value: string) => {
  return value.replace(/[_%\\]/g, (match) => "\\" + match);
};

export const getSuggestionTasks = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        description: z.string(),
      }),
      output: z.promise(z.array(taskSchema)),
    },
    async (input) => {
      return db.task.findMany({
        where: {
          userId: input.userId,
          folder: {
            userId: input.userId,
          },
          description: {
            contains: escapeLike(input.description),
          },
        },
        take: 20,
      });
    },
  );
