import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const timeEntrySchema = z.strictObject({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  duration: z.number(),
  startedAt: z.date(),
  stoppedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.TimeEntryUncheckedCreateInput>;

export type TimeEntry = z.infer<typeof timeEntrySchema>;
