import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const MIN_FOLDER_NAME = 1;
export const MAX_FOLDER_NAME = 50;

export const MIN_FOLDER_EMOJI = 1;
export const MAX_FOLDER_EMOJI = 50;

export const FOLDER_COLOR_REGEXP = /^#[0-9a-f]{6}$/;

export const folderSchema = z.strictObject({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  color: z.string(),
  name: z.string(),
  emoji: z.string(),
  parentId: z.string().uuid().nullable(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.FolderUncheckedCreateInput>;

export type Folder = z.infer<typeof folderSchema>;
