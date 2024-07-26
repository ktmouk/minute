import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { folderSchema, taskSchema, timeEntrySchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { isBefore } from "date-fns";
import { z } from "zod";

export const getCalendarTimeEntries = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        startDate: z.date(),
        endDate: z.date(),
      }),
      output: z.promise(
        z.array(
          timeEntrySchema.extend({
            task: taskSchema.extend({
              folder: folderSchema,
            }),
          }),
        ),
      ),
    },
    async (input) => {
      if (isBefore(input.endDate, input.startDate)) {
        throw Error("The startDate must be earlier than startDate.");
      }
      return await db.timeEntry.findMany({
        where: {
          task: {
            userId: input.userId,
            folder: {
              userId: input.userId,
            },
          },
          startedAt: {
            lte: input.endDate,
          },
          stoppedAt: {
            gte: input.startDate,
          },
        },
        include: {
          task: {
            include: {
              folder: true,
            },
          },
        },
      });
    },
  );
