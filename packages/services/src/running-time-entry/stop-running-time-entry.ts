import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { differenceInSeconds, isBefore } from "date-fns";
import { z } from "zod";
import { getRunningTimeEntry } from "./get-running-time-entry";

export const stopRunningTimeEntry = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        stoppedAt: z.date(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const runningTimeEntry = await getRunningTimeEntry(db)({
        userId: input.userId,
      });
      if (runningTimeEntry === null) {
        throw Error("The timer is not running.");
      }
      if (isBefore(input.stoppedAt, runningTimeEntry.startedAt)) {
        throw Error("The start time must be earlier than end time.");
      }
      const taskId = (
        await db.task.findFirst({
          select: {
            id: true,
          },
          where: {
            userId: input.userId,
            folderId: runningTimeEntry.folderId,
            description: runningTimeEntry.description,
          },
        })
      )?.id;
      await db.$transaction(async (tx) => {
        await tx.timeEntry.create({
          data: {
            startedAt: runningTimeEntry.startedAt,
            stoppedAt: input.stoppedAt,
            duration: differenceInSeconds(
              input.stoppedAt,
              runningTimeEntry.startedAt,
            ),
            task: {
              ...(typeof taskId === "string"
                ? { connect: { id: taskId } }
                : {
                    create: {
                      userId: runningTimeEntry.userId,
                      description: runningTimeEntry.description,
                      folderId: runningTimeEntry.folderId,
                    },
                  }),
            },
          },
        });
        await tx.runningTimeEntry.delete({
          where: {
            userId: input.userId,
          },
        });
        return;
      });
    },
  );
