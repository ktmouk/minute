import type { PrismaClient } from "@minute/prisma";
import { folderSchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getAllFolders = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
      }),
      output: z.promise(z.array(folderSchema)),
    },
    async (input) => {
      const folderHierarchies = await db.folderHierarchy.findMany({
        where: {
          depth: 1,
          userId: input.userId,
          descendant: {
            userId: input.userId,
          },
        },
        include: {
          descendant: true,
        },
      });
      return folderHierarchies.map(({ descendant }) => descendant);
    },
  );
