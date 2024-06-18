import type { PrismaClient } from "@minute/prisma";
import { categoryFolderSchema, categorySchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getAllCategories = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
      }),
      output: z.promise(
        z.array(
          categorySchema.extend({
            categoryFolders: z.array(categoryFolderSchema),
          }),
        ),
      ),
    },
    async (input) => {
      return await db.category.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          categoryFolders: {
            where: {
              folder: {
                userId: input.userId,
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    },
  );
