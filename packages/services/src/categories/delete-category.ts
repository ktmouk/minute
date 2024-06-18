import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";

export const deleteCategory = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const category = await db.category.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
      if (category === null) {
        throw Error("The category does not exist.");
      }
      await db.category.delete({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
    },
  );
