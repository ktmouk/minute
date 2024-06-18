import type { PrismaClient } from "@minute/prisma";
import { MAX_TASK_DESCRIPTION, MIN_TASK_DESCRIPTION } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";
import { getFolder } from "../folders/get-folder";
import { getRunningTimeEntry } from "./get-running-time-entry";

export const createRunningTimeEntry = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        startedAt: z.date(),
        description: z
          .string()
          .min(MIN_TASK_DESCRIPTION)
          .max(MAX_TASK_DESCRIPTION),
        folderId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      if (
        (await getRunningTimeEntry(db)({
          userId: input.userId,
        })) !== null
      ) {
        throw Error("The timer is already started.");
      }
      if (
        (await getFolder(db)({
          userId: input.userId,
          id: input.folderId,
        })) === null
      ) {
        throw Error("The folder does not exist.");
      }
      await db.runningTimeEntry.create({
        data: {
          userId: input.userId,
          folderId: input.folderId,
          description: input.description,
          startedAt: input.startedAt,
        },
      });
    },
  );
