import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const MIN_TASK_DESCRIPTION = 1;
export const MAX_TASK_DESCRIPTION = 100;

export const taskSchema = z.strictObject({
  id: z.string().uuid(),
  folderId: z.string().uuid(),
  userId: z.string().uuid(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.TaskUncheckedCreateInput>;

export type Task = z.infer<typeof taskSchema>;
