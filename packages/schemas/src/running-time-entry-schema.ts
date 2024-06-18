import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const runningTimeEntrySchema = z.strictObject({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  description: z.string(),
  folderId: z.string().uuid(),
  startedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.RunningTimeEntryUncheckedCreateInput>;

export type RunningTimeEntry = z.infer<typeof runningTimeEntrySchema>;
