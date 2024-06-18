import type { PrismaClient } from "@minute/prisma";
import { contract, omitUndefined } from "@minute/utils";
import { z } from "zod";
import { getFolder } from "../folders/get-folder";
import { getRunningTimeEntry } from "./get-running-time-entry";

export const updateRunningTimeEntry = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        description: z.string().min(1).max(100).optional(),
        startedAt: z.date().optional(),
        folderId: z.string().uuid().optional(),
        userId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const runningTimeEntry = await getRunningTimeEntry(db)({
        userId: input.userId,
      });
      if (runningTimeEntry === null) {
        throw Error("The timer is not running.");
      }
      if (
        input.folderId !== undefined &&
        (await getFolder(db)({
          userId: input.userId,
          id: input.folderId,
        })) === null
      ) {
        throw Error("The folder does not exist.");
      }
      await db.runningTimeEntry.update({
        where: {
          userId: input.userId,
        },
        data: omitUndefined({
          folderId: input.folderId,
          description: input.description,
          startedAt: input.startedAt,
        }),
      });
    },
  );
