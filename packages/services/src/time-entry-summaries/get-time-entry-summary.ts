import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { timeEntrySummarySchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

export const getTimeEntrySummary = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        date: z.date(),
      }),
      output: z.promise(z.array(timeEntrySummarySchema)),
    },
    async (input) => {
      return z
        .promise(
          z.array(
            z.strictObject({
              folderId: z.string().uuid(),
              duration: z.bigint(),
            }),
          ),
        )
        .parseAsync(
          db.$queryRaw`
            SELECT
              "Folder"."id" as "folderId",
              SUM("TimeEntry"."duration") as "duration"
            FROM "Folder"
              JOIN "Task" ON "Folder"."id" = "Task"."folderId" AND "Folder"."userId" = "Task"."userId"
              JOIN "TimeEntry" ON "Task"."id" = "TimeEntry"."taskId"
            WHERE
              "TimeEntry"."startedAt" >= ${startOfDay(input.date)}
              AND "TimeEntry"."stoppedAt" <= ${endOfDay(input.date)}
              AND "Task"."userId" = ${input.userId}::uuid
              AND "Folder"."userId" = ${input.userId}::uuid
            GROUP BY
              "Folder"."id";
          `,
        );
    },
  );
