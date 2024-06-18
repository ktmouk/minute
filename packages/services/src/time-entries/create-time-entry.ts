import type { PrismaClient, TXPrismaClient } from "@minute/prisma";
import { MAX_TASK_DESCRIPTION, MIN_TASK_DESCRIPTION } from "@minute/schemas";
import { contract } from "@minute/utils";
import { differenceInSeconds, isBefore } from "date-fns";
import { z } from "zod";

const findOrCreateTask = async (
  db: TXPrismaClient,
  input: { userId: string; folderId: string; description: string },
) => {
  const folder = await db.folder.findFirst({
    where: {
      id: input.folderId,
      userId: input.userId,
    },
  });
  if (folder === null) {
    throw Error("The folder does not exist.");
  }
  const task = await db.task.findFirst({
    where: {
      description: input.description,
      userId: input.userId,
      folder: {
        id: input.folderId,
        userId: input.userId,
      },
    },
  });
  if (task !== null) {
    return task;
  }
  return db.task.create({
    data: {
      description: input.description,
      folderId: input.folderId,
      userId: input.userId,
    },
  });
};

export const createTimeEntry = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        startedAt: z.date(),
        stoppedAt: z.date(),
        folderId: z.string().uuid(),
        description: z
          .string()
          .min(MIN_TASK_DESCRIPTION)
          .max(MAX_TASK_DESCRIPTION),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      if (isBefore(input.stoppedAt, input.startedAt)) {
        throw Error("The start time must be earlier than end time.");
      }

      await db.$transaction(async (tx) => {
        const task = await findOrCreateTask(tx, {
          userId: input.userId,
          folderId: input.folderId,
          description: input.description,
        });
        await tx.timeEntry.create({
          data: {
            taskId: task.id,
            startedAt: input.startedAt,
            stoppedAt: input.stoppedAt,
            duration: differenceInSeconds(input.stoppedAt, input.startedAt),
          },
        });
      });
    },
  );
