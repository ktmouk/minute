import type { PrismaClient } from "@minute/prisma";
import { timeEntrySchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getTimeEntriesInTask = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        taskId: z.string().uuid(),
      }),
      output: z.promise(z.array(timeEntrySchema)),
    },
    async (input) => {
      const task = await db.task.findFirst({
        where: {
          id: input.taskId,
          userId: input.userId,
          folder: {
            userId: input.userId,
          },
        },
      });
      if (task === null) {
        throw Error("The task does not exist.");
      }
      return await db.timeEntry.findMany({
        where: {
          task: {
            id: input.taskId,
            userId: input.userId,
            folder: {
              userId: input.userId,
            },
          },
        },
        orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      });
    },
  );
