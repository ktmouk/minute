import "server-only";

import type { PrismaClient } from "@minute/prisma";
import {
  MIN_CATEGORY_NAME,
  CATEGORY_COLOR_REGEXP,
  MAX_CATEGORY_EMOJI,
  MIN_CATEGORY_EMOJI,
  MAX_CATEGORY_NAME,
} from "@minute/schemas";
import { contract, omitUndefined } from "@minute/utils";
import { z } from "zod";

export const updateCategory = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        name: z
          .string()
          .min(MIN_CATEGORY_NAME)
          .max(MAX_CATEGORY_NAME)
          .optional(),
        color: z.string().regex(CATEGORY_COLOR_REGEXP).optional(),
        emoji: z
          .string()
          .emoji()
          .min(MIN_CATEGORY_EMOJI)
          .max(MAX_CATEGORY_EMOJI)
          .optional(),
        folderIds: z.array(z.string().uuid()).min(1).optional(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const category = await db.category.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
        include: {
          categoryFolders: true,
        },
      });
      if (category === null) {
        throw Error("The category does not exist.");
      }
      const folderIds =
        input.folderIds ??
        category.categoryFolders.map(({ folderId }) => folderId);
      const folders = await db.folder.findMany({
        select: {
          id: true,
          userId: true,
        },
        where: {
          id: { in: folderIds },
          userId: input.userId,
        },
      });
      if (
        folders.length !== folderIds.length ||
        folders.filter(
          ({ id, userId }) =>
            userId !== input.userId || !folderIds.includes(id),
        ).length > 0
      ) {
        throw Error("The folder does not exist.");
      }
      await db.$transaction(async (tx) => {
        const category = await tx.category.update({
          data: omitUndefined({
            name: input.name,
            color: input.color,
            emoji: input.emoji,
          }),
          where: {
            id: input.id,
            userId: input.userId,
          },
        });
        await tx.categoryFolder.deleteMany({
          where: {
            categoryId: category.id,
          },
        });
        await tx.categoryFolder.createMany({
          data: folders.map(({ id }) => ({
            folderId: id,
            categoryId: category.id,
          })),
        });
      });
    },
  );
