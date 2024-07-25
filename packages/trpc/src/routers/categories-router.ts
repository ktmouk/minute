import "server-only";

import { categoryFolderSchema, categorySchema } from "@minute/schemas";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const categoriesRouter = router({
  getAllCategories: protectedProcedure
    .output(
      z.array(
        categorySchema.extend({
          categoryFolders: z.array(categoryFolderSchema),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      return await getAllCategories(ctx.db)({
        userId: ctx.currentUserId,
      });
    }),

  createCategory: protectedProcedure
    .input(
      z.strictObject({
        color: z.string(),
        name: z.string(),
        emoji: z.string().emoji(),
        folderIds: z.array(z.string().uuid()).min(1),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await createCategory(ctx.db)({
        userId: ctx.currentUserId,
        color: input.color,
        name: input.name,
        emoji: input.emoji,
        folderIds: input.folderIds,
      });
    }),

  updateCategory: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
        color: z.string().optional(),
        name: z.string().optional(),
        emoji: z.string().emoji().optional(),
        folderIds: z.array(z.string().uuid()).min(1).optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await updateCategory(ctx.db)({
        id: input.id,
        userId: ctx.currentUserId,
        name: input.name,
        color: input.color,
        emoji: input.emoji,
        folderIds: input.folderIds,
      });
    }),

  deleteCategory: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await deleteCategory(ctx.db)({
        id: input.id,
        userId: ctx.currentUserId,
      });
    }),
});
