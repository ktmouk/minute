import "server-only";

import type { PrismaClient } from "@minute/prisma";
import {
  FOLDER_COLOR_REGEXP,
  MAX_FOLDER_EMOJI,
  MAX_FOLDER_NAME,
  MIN_FOLDER_EMOJI,
  MIN_FOLDER_NAME,
} from "@minute/schemas/src/folder-schema";
import { contract, omitUndefined } from "@minute/utils";
import { z } from "zod";
import { getFolder } from "./get-folder";

export const updateFolder = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        color: z.string().regex(FOLDER_COLOR_REGEXP).optional(),
        name: z.string().min(MIN_FOLDER_NAME).max(MAX_FOLDER_NAME).optional(),
        emoji: z
          .string()
          .min(MIN_FOLDER_EMOJI)
          .max(MAX_FOLDER_EMOJI)
          .optional(),
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
      await db.folder.update({
        data: omitUndefined({
          name: input.name,
          color: input.color,
          emoji: input.emoji,
        }),
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
    },
  );
