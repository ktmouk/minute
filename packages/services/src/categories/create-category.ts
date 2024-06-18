import type { PrismaClient } from "@minute/prisma";
import {
  MAX_CATEGORY_EMOJI,
  MAX_CATEGORY_NAME,
  MIN_CATEGORY_EMOJI,
  MIN_CATEGORY_NAME,
  CATEGORY_COLOR_REGEXP,
  categorySchema,
} from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const createCategory = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        color: z.string().regex(CATEGORY_COLOR_REGEXP),
        name: z.string().min(MIN_CATEGORY_NAME).max(MAX_CATEGORY_NAME),
        emoji: z
          .string()
          .emoji()
          .min(MIN_CATEGORY_EMOJI)
          .max(MAX_CATEGORY_EMOJI),
        folderIds: z.array(z.string().uuid()).min(1),
      }),
      output: z.promise(categorySchema),
    },
    async (input) => {
      const folders = await db.folder.findMany({
        select: {
          id: true,
          userId: true,
        },
        where: {
          id: { in: input.folderIds },
          userId: input.userId,
        },
      });
      if (
        folders.length !== input.folderIds.length ||
        folders.filter(
          ({ id, userId }) =>
            userId !== input.userId || !input.folderIds.includes(id),
        ).length > 0
      ) {
        throw Error("The folder does not exist.");
      }
      return db.$transaction(async (tx) => {
        const category = await tx.category.create({
          data: {
            userId: input.userId,
            name: input.name,
            emoji: input.emoji,
            color: input.color,
          },
        });
        await tx.categoryFolder.createMany({
          data: folders.map(({ id }) => ({
            folderId: id,
            categoryId: category.id,
          })),
        });
        return category;
      });
    },
  );
