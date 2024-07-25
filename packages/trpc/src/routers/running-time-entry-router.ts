import "server-only";

import { runningTimeEntrySchema } from "@minute/schemas";
import {
  createRunningTimeEntry,
  getRunningTimeEntry,
  stopRunningTimeEntry,
  updateRunningTimeEntry,
} from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const runningTimeEntryRouter = router({
  startRunningTimeEntry: protectedProcedure
    .input(
      z.strictObject({
        folderId: z.string().uuid(),
        description: z.string(),
        startedAt: z.date(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await createRunningTimeEntry(ctx.db)({
        userId: ctx.currentUserId,
        folderId: input.folderId,
        description: input.description,
        startedAt: input.startedAt,
      });
    }),

  stopRunningTimeEntry: protectedProcedure
    .input(
      z.strictObject({
        stoppedAt: z.date(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await stopRunningTimeEntry(ctx.db)({
        userId: ctx.currentUserId,
        stoppedAt: input.stoppedAt,
      });
    }),

  updateRunningTimeEntry: protectedProcedure
    .input(
      z.strictObject({
        folderId: z.string().uuid().optional(),
        description: z.string().optional(),
        startedAt: z.date().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await updateRunningTimeEntry(ctx.db)({
        userId: ctx.currentUserId,
        folderId: input.folderId,
        description: input.description,
        startedAt: input.startedAt,
      });
    }),

  getRunningTimeEntry: protectedProcedure
    .input(z.void())
    .output(runningTimeEntrySchema.nullable())
    .query(async ({ ctx }) => {
      const runningTimeEntry = await getRunningTimeEntry(ctx.db)({
        userId: ctx.currentUserId,
      });
      return runningTimeEntry ?? null;
    }),
});
