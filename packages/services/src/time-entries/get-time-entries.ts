import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { folderSchema, taskSchema, timeEntrySchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

const LIMIT = 25;

export const getTimeEntries = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        cursor: z
          .strictObject({
            startedAt: z.date(),
            id: z.string().uuid(),
          })
          .optional(),
      }),
      output: z.promise(
        z.strictObject({
          nextCursor: z
            .strictObject({
              startedAt: z.date(),
              id: z.string().uuid(),
            })
            .optional(),
          items: z.array(
            timeEntrySchema.extend({
              task: taskSchema.extend({
                folder: folderSchema,
              }),
            }),
          ),
        }),
      ),
    },
    async (input) => {
      const items = await db.timeEntry.findMany({
        where: {
          AND: [
            {
              task: {
                userId: input.userId,
                folder: {
                  userId: input.userId,
                },
              },
            },
            input.cursor === undefined
              ? {}
              : {
                  OR: [
                    {
                      id: { lte: input.cursor.id },
                      startedAt: input.cursor.startedAt,
                    },
                    { startedAt: { lt: input.cursor.startedAt } },
                  ],
                },
          ],
        },
        include: {
          task: {
            include: {
              folder: true,
            },
          },
        },
        orderBy: [{ startedAt: "desc" }, { id: "desc" }],
        take: LIMIT + 1,
      });

      if (items.length <= LIMIT) {
        return { nextCursor: undefined, items };
      }
      const lastItem = items.pop();
      return {
        items,
        nextCursor:
          lastItem !== undefined
            ? { id: lastItem.id, startedAt: lastItem.startedAt }
            : undefined,
      };
    },
  );
