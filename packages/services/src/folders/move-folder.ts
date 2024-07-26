import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";

export const moveFolder = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        folderId: z.string().uuid(),
        userId: z.string().uuid(),
        ancestorId: z.string().uuid().nullable(),
        afterFolderId: z.string().uuid().nullable(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      if (
        input.ancestorId !== null &&
        (await db.folder.findFirst({
          where: {
            userId: input.userId,
            id: input.ancestorId,
          },
        })) === null
      ) {
        throw Error("The ancestor folder does not exist.");
      }
      if (
        input.ancestorId !== null &&
        (await db.folderHierarchy.findFirst({
          where: {
            userId: input.userId,
            ancestorId: input.folderId,
            descendantId: input.ancestorId,
          },
        })) !== null
      ) {
        throw Error("The folder cannot move to the descendant folder.");
      }
      const folder = await db.folder.findFirst({
        where: {
          userId: input.userId,
          id: input.folderId,
        },
      });
      if (folder === null) {
        throw Error("The folder does not exist.");
      }
      await db.$transaction(async (tx) => {
        const movingHierarchies = await tx.folderHierarchy.findMany({
          where: {
            userId: input.userId,
            ancestorId: input.folderId,
          },
        });
        const movingFolderIds = movingHierarchies.map(
          ({ descendantId }) => descendantId,
        );
        const siblings = await tx.folder.findMany({
          select: {
            id: true,
          },
          where: {
            parentId: input.ancestorId,
            userId: input.userId,
            id: { not: input.folderId },
          },
          orderBy: {
            order: "asc",
          },
        });
        const afterFolderIndex =
          input.afterFolderId === null
            ? undefined
            : siblings.findIndex(({ id }) => input.afterFolderId === id);

        if (afterFolderIndex != undefined && afterFolderIndex < 0) {
          throw Error("The folder does not exist.");
        }
        const order = afterFolderIndex === undefined ? 0 : afterFolderIndex + 1;
        await tx.user.update({
          where: {
            id: input.userId,
          },
          data: {
            folders: {
              update: siblings
                .toSpliced(order, 0, {
                  id: input.folderId,
                })
                .map((sibling, index) => ({
                  where: {
                    id: sibling.id,
                    userId: input.userId,
                  },
                  data: {
                    order: index,
                    parentId: input.ancestorId,
                  },
                })),
            },
          },
        });
        await tx.folderHierarchy.deleteMany({
          where: {
            OR: [
              {
                userId: input.userId,
                descendantId: { in: movingFolderIds },
                ancestorId: null,
              },
              {
                userId: input.userId,
                descendantId: { in: movingFolderIds },
                ancestorId: { not: { in: movingFolderIds } },
              },
            ],
          },
        });
        if (input.ancestorId === null) {
          await tx.folderHierarchy.create({
            data: {
              userId: input.userId,
              ancestorId: null,
              descendantId: input.folderId,
              depth: 1,
            },
          });
          return;
        }
        const ancestorHierarchies = await tx.folderHierarchy.findMany({
          where: {
            userId: input.userId,
            descendantId: input.ancestorId,
          },
        });
        const data = ancestorHierarchies.flatMap((folderHierarchy) => {
          return movingHierarchies.map((target) => {
            return {
              userId: input.userId,
              ancestorId: folderHierarchy.ancestorId,
              descendantId: target.descendantId,
              depth: folderHierarchy.depth + target.depth + 1,
            };
          });
        });
        await tx.folderHierarchy.createMany({ data });
        return;
      });
    },
  );
