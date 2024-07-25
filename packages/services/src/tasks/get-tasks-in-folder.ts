import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { taskSchema } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";
import { getFolder } from "../folders/get-folder";

export const getTasksInFolder = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        folderId: z.string().uuid(),
      }),
      output: z.promise(z.array(taskSchema)),
    },
    async (input) => {
      if (
        (await getFolder(db)({
          userId: input.userId,
          id: input.folderId,
        })) === null
      ) {
        throw Error("The folder does not exist.");
      }
      return db.task.findMany({
        where: {
          userId: input.userId,
          folderId: input.folderId,
        },
      });
    },
  );
