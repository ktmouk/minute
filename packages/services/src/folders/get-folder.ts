import type { PrismaClient } from "@minute/prisma";
import { folderSchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getFolder = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      }),
      output: z.promise(folderSchema.nullable()),
    },
    async (input) => {
      const folder = await db.folder.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
      if (folder === null) {
        return null;
      }
      if (folder.userId !== input.userId) {
        return null;
      }
      return folder;
    },
  );
