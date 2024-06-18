import type { PrismaClient } from "@minute/prisma";
import { MAX_TASK_DESCRIPTION, MIN_TASK_DESCRIPTION } from "@minute/schemas";
import { contract, omitUndefined } from "@minute/utils";
import { z } from "zod";

export const updateTask = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        description: z
          .string()
          .min(MIN_TASK_DESCRIPTION)
          .max(MAX_TASK_DESCRIPTION)
          .optional(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      if (
        (await db.task.findFirst({
          where: {
            id: input.id,
            userId: input.userId,
          },
        })) === null
      ) {
        throw Error("The task does not exist.");
      }
      await db.task.update({
        data: omitUndefined({
          description: input.description,
        }),
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
    },
  );
