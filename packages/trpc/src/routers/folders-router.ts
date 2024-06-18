import { folderSchema } from "@minute/schemas";
import {
  createFolder,
  deleteFolder,
  getAllFolders,
  moveFolder,
  updateFolder,
} from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const foldersRouter = router({
  createFolder: protectedProcedure
    .input(
      z.strictObject({
        ancestorId: z.string().uuid().optional(),
        color: z.string(),
        name: z.string(),
        emoji: z.string().emoji(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await createFolder(ctx.db)({
        userId: ctx.currentUserId,
        color: input.color,
        ancestorId: input.ancestorId,
        name: input.name,
        emoji: input.emoji,
      });
    }),

  moveFolder: protectedProcedure
    .input(
      z.strictObject({
        folderId: z.string().uuid(),
        ancestorId: z.string().uuid().nullable(),
        afterFolderId: z.string().uuid().nullable(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await moveFolder(ctx.db)({
        userId: ctx.currentUserId,
        folderId: input.folderId,
        ancestorId: input.ancestorId,
        afterFolderId: input.afterFolderId,
      });
    }),

  updateFolder: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
        color: z.string().optional(),
        name: z.string().optional(),
        emoji: z.string().emoji().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await updateFolder(ctx.db)({
        userId: ctx.currentUserId,
        id: input.id,
        color: input.color,
        name: input.name,
        emoji: input.emoji,
      });
    }),

  deleteFolder: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await deleteFolder(ctx.db)({
        userId: ctx.currentUserId,
        id: input.id,
      });
    }),

  getAllFolders: protectedProcedure
    .output(z.array(folderSchema))
    .query(async ({ ctx }) => {
      return await getAllFolders(ctx.db)({
        userId: ctx.currentUserId,
      });
    }),
});
