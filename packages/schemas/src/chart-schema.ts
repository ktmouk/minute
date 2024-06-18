import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const MIN_CHART_NAME = 1;
export const MAX_CHART_NAME = 50;

export const chartSchema = z.strictObject({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["LINE"]),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.ChartUncheckedCreateInput>;

export type Chart = z.infer<typeof chartSchema>;
