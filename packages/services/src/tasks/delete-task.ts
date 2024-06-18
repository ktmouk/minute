import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";

export const deleteTask = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const task = await db.task.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
      if (task === null) {
        throw Error("The task does not exist.");
      }
      await db.task.delete({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
    },
  );
