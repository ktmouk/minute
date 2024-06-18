import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";

export const deleteTimeEntry = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const timeEntry = await db.timeEntry.findFirst({
        where: {
          id: input.id,
          task: {
            userId: input.userId,
            folder: {
              userId: input.userId,
            },
          },
        },
      });
      if (timeEntry === null) {
        throw Error("The timeEntry does not exist.");
      }
      await db.timeEntry.delete({
        where: {
          id: input.id,
          task: {
            userId: input.userId,
            folder: {
              userId: input.userId,
            },
          },
        },
      });
    },
  );
