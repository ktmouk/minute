import "server-only";

import { taskSchema } from "@minute/schemas";
import {
  deleteTask,
  getSuggestionTasks,
  getTasksInFolder,
  moveTask,
  updateTask,
} from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const tasksRouter = router({
  getTasksInFolder: protectedProcedure
    .input(
      z.strictObject({
        folderId: z.string().uuid(),
      }),
    )
    .output(z.array(taskSchema))
    .query(async ({ input, ctx }) => {
      return getTasksInFolder(ctx.db)({
        userId: ctx.currentUserId,
        folderId: input.folderId,
      });
    }),

  getSuggestionTasks: protectedProcedure
    .input(
      z.strictObject({
        description: z.string(),
      }),
    )
    .output(z.array(taskSchema))
    .query(async ({ input, ctx }) => {
      return getSuggestionTasks(ctx.db)({
        userId: ctx.currentUserId,
        description: input.description,
      });
    }),

  moveTask: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
        folderId: z.string().uuid(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      return moveTask(ctx.db)({
        id: input.id,
        folderId: input.folderId,
        userId: ctx.currentUserId,
      });
    }),

  deleteTask: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      return deleteTask(ctx.db)({
        id: input.id,
        userId: ctx.currentUserId,
      });
    }),

  updateTask: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
        description: z.string().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await updateTask(ctx.db)({
        id: input.id,
        userId: ctx.currentUserId,
        description: input.description,
      });
    }),
});
