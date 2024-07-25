import "server-only";

import type { PrismaClient, TXPrismaClient } from "@minute/prisma";
import { MAX_TASK_DESCRIPTION, MIN_TASK_DESCRIPTION } from "@minute/schemas";
import { contract, omitUndefined } from "@minute/utils";
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

export const updateTimeEntry = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        startedAt: z.date().optional(),
        stoppedAt: z.date().optional(),
        folderId: z.string().uuid().optional(),
        description: z
          .string()
          .min(MIN_TASK_DESCRIPTION)
          .max(MAX_TASK_DESCRIPTION)
          .optional(),
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
        include: {
          task: true,
        },
      });
      if (timeEntry === null) {
        throw Error("The timeEntry does not exist.");
      }

      const stoppedAt = input.stoppedAt ?? timeEntry.stoppedAt;
      const startedAt = input.startedAt ?? timeEntry.startedAt;

      if (isBefore(stoppedAt, startedAt)) {
        throw Error("The start time must be earlier than end time.");
      }

      await db.$transaction(async (tx) => {
        const folderId = input.folderId ?? timeEntry.task.folderId;
        const description = input.description ?? timeEntry.task.description;

        const task = await findOrCreateTask(tx, {
          userId: input.userId,
          folderId,
          description,
        });
        await tx.timeEntry.update({
          data: omitUndefined({
            startedAt,
            stoppedAt,
            taskId: task.id,
            duration: differenceInSeconds(stoppedAt, startedAt),
          }),
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
      });
    },
  );
