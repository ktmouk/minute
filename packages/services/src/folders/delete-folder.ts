import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";
import { getFolder } from "./get-folder";

export const deleteFolder = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      if (
        (await getFolder(db)({
          userId: input.userId,
          id: input.id,
        })) === null
      ) {
        throw Error("The folder does not exist.");
      }
      await db.folder.delete({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
    },
  );
