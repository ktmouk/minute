import type { Prisma, PrismaClient } from "@minute/prisma";
import { MIN_FOLDER_NAME, MAX_FOLDER_NAME } from "@minute/schemas";
import {
  FOLDER_COLOR_REGEXP,
  MAX_FOLDER_EMOJI,
  MIN_FOLDER_EMOJI,
  folderSchema,
} from "@minute/schemas/src/folder-schema";
import { contract } from "@minute/utils";
import { z } from "zod";

export const createFolder = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        color: z.string().regex(FOLDER_COLOR_REGEXP),
        ancestorId: z.string().uuid().optional(),
        name: z.string().min(MIN_FOLDER_NAME).max(MAX_FOLDER_NAME),
        emoji: z.string().emoji().min(MIN_FOLDER_EMOJI).max(MAX_FOLDER_EMOJI),
      }),
      output: z.promise(folderSchema),
    },
    async (input) => {
      if (input.ancestorId !== undefined) {
        const ancestor = await db.folder.findFirst({
          where: {
            userId: input.userId,
            id: input.ancestorId,
          },
        });
        if (ancestor === null || ancestor.userId !== input.userId) {
          throw Error("The ancestor folder does not exist.");
        }
      }
      return db.$transaction(async (tx) => {
        const lastOrder = (
          await tx.folder.findFirst({
            select: {
              order: true,
            },
            where: {
              userId: input.userId,
              parentId: input.ancestorId ?? null,
            },
            orderBy: {
              order: "desc",
            },
          })
        )?.order;
        const folder = await tx.folder.create({
          data: {
            name: input.name,
            color: input.color,
            emoji: input.emoji,
            userId: input.userId,
            parentId: input.ancestorId ?? null,
            order: lastOrder !== undefined ? lastOrder + 1 : 0,
          },
        });
        const data: Prisma.FolderHierarchyUncheckedCreateInput[] = [
          {
            userId: input.userId,
            ancestorId: folder.id,
            descendantId: folder.id,
            depth: 0,
          },
        ];
        if (input.ancestorId !== undefined) {
          const hierarchies = await tx.folderHierarchy.findMany({
            where: { userId: input.userId, descendantId: input.ancestorId },
          });
          hierarchies.forEach(({ ancestorId, depth }) => {
            data.push({
              userId: input.userId,
              ancestorId,
              descendantId: folder.id,
              depth: depth + 1,
            });
          });
        } else {
          data.push({
            userId: input.userId,
            ancestorId: null,
            descendantId: folder.id,
            depth: 1,
          });
        }
        await tx.folderHierarchy.createMany({ data });
        return folder;
      });
    },
  );
