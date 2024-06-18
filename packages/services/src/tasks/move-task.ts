import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";

export const moveTask = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        folderId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const task = await db.task.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
      if (task === null) {
        throw Error("The task does not exist.");
      }
      const folder = await db.folder.findFirst({
        where: {
          id: input.folderId,
          userId: input.userId,
        },
      });
      if (folder === null) {
        throw Error("The folder does not exist.");
      }
      await db.task.update({
        data: {
          folderId: folder.id,
        },
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
    },
  );
