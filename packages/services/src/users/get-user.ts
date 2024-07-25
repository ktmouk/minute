import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { userSchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getUser = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
      }),
      output: z.promise(userSchema),
    },
    async (input) => {
      const user = await db.user.findFirst({
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          id: input.userId,
        },
      });
      if (user === null) {
        throw Error("The user does not exist.");
      }
      return user;
    },
  );
