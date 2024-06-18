import type { PrismaClient } from "@minute/prisma";
import { folderHierarchySchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getFolderHierarchies = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
      }),
      output: z.promise(z.array(folderHierarchySchema)),
    },
    async (input) => {
      return db.folderHierarchy.findMany({
        where: {
          depth: 1,
          userId: input.userId,
        },
      });
    },
  );
