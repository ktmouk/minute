import "server-only";

import { folderSchema, taskSchema, timeEntrySchema } from "@minute/schemas";
import {
  createTimeEntry,
  deleteTimeEntry,
  getCalendarTimeEntries,
  getTimeEntries,
  getTimeEntriesInTask,
  updateTimeEntry,
} from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const timeEntriesRouter = router({
  getTimeEntriesInTasks: protectedProcedure
    .input(
      z.strictObject({
        taskId: z.string().uuid(),
      }),
    )
    .output(z.array(timeEntrySchema))
    .query(async ({ input, ctx }) => {
      return await getTimeEntriesInTask(ctx.db)({
        taskId: input.taskId,
        userId: ctx.currentUserId,
      });
    }),

  getTimeEntries: protectedProcedure
    .input(
      z.strictObject({
        cursor: z
          .strictObject({
            startedAt: z.date(),
            id: z.string().uuid(),
          })
          .optional(),
      }),
    )
    .output(
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
    )
    .query(async ({ input, ctx }) => {
      return await getTimeEntries(ctx.db)({
        cursor: input.cursor,
        userId: ctx.currentUserId,
      });
    }),

  getCalendarTimeEntries: protectedProcedure
    .input(
      z.strictObject({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .output(
      z.array(
        timeEntrySchema.extend({
          task: taskSchema.extend({
            folder: folderSchema,
          }),
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      return await getCalendarTimeEntries(ctx.db)({
        userId: ctx.currentUserId,
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),

  createTimeEntry: protectedProcedure
    .input(
      z.strictObject({
        startedAt: z.date(),
        stoppedAt: z.date(),
        description: z.string(),
        folderId: z.string().uuid(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await createTimeEntry(ctx.db)({
        userId: ctx.currentUserId,
        startedAt: input.startedAt,
        stoppedAt: input.stoppedAt,
        description: input.description,
        folderId: input.folderId,
      });
    }),

  updateTimeEntry: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
        startedAt: z.date().optional(),
        stoppedAt: z.date().optional(),
        description: z.string().optional(),
        folderId: z.string().uuid().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await updateTimeEntry(ctx.db)({
        id: input.id,
        userId: ctx.currentUserId,
        startedAt: input.startedAt,
        stoppedAt: input.stoppedAt,
        description: input.description,
        folderId: input.folderId,
      });
    }),

  deleteTimeEntry: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await deleteTimeEntry(ctx.db)({
        id: input.id,
        userId: ctx.currentUserId,
      });
    }),
});
